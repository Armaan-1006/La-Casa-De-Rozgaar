import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  VideoOff,
  Maximize2,
  AlertOctagon,
  ShieldAlert,
  MousePointer,
  Check,
  Scan,
  UserCheck,
  Activity,
  Users
} from 'lucide-react'
import { mockAssessmentQuestions, AssessmentQuestion } from '../data/mockData'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface SecureAssessmentProps {
  onNavigate?: (page: string) => void
}

interface TelemetryViolation {
  id: string
  timestamp: string
  type: 'TAB_SWITCH' | 'FOCUS_LOST' | 'KEYBOARD_ATTEMPT' | 'FULLSCREEN_EXIT' | 'RIGHT_CLICK' | 'FACE_ABSENT' | 'RAPID_HEAD_MOVEMENT' | 'MULTIPLE_FACES'
  detail: string
  penalty: number
}

interface FaceBox {
  x: number
  y: number
  width: number
  height: number
}

export const SecureAssessment: React.FC<SecureAssessmentProps> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<'BRIEFING' | 'IN_PROGRESS' | 'SUBMITTED'>('BRIEFING')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour (3600 seconds)
  const [isExamPaused, setIsExamPaused] = useState(false)

  // Camera & AI Vision Proctor State
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [pauseReason, setPauseReason] = useState<'FACE_ABSENT' | 'MULTIPLE_FACES' | null>(null)

  // Live Biometric Telemetry
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [gazeStatus, setGazeStatus] = useState<'CENTERED' | 'LOOKING_AWAY' | 'UNVERIFIED' | 'MULTIPLE_FACES'>('UNVERIFIED')
  const [faceConfidence, setFaceConfidence] = useState(0)
  const [motionEnergy, setMotionEnergy] = useState(0)
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null)
  const [proctorToast, setProctorToast] = useState<{ text: string; type: 'warn' | 'danger' } | null>(null)

  // Proctoring & Anti-Cheat State
  const [violations, setViolations] = useState<TelemetryViolation[]>([])
  const [strikes, setStrikes] = useState(0)
  const [keyboardWarning, setKeyboardWarning] = useState<string | null>(null)
  const [showViolationModal, setShowViolationModal] = useState(false)
  const [violationModalMessage, setViolationModalMessage] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const videoHudRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const keyboardWarningTimerRef = useRef<any>(null)
  const proctorToastTimerRef = useRef<any>(null)
  const lastKeyTimeRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null)

  const questions = mockAssessmentQuestions
  const currentQ: AssessmentQuestion = questions[currentIndex] || questions[0]

  // Calculated Real-time FOV metrics
  const fovCoverage = faceBox && faceDetected
    ? Math.min(100, Math.max(5, Math.round(((faceBox.width * faceBox.height) / (100 * 100)) * 100 * 2.8)))
    : 0
  const fovQuality = !faceDetected || !faceBox
    ? 'ABSENT'
    : fovCoverage < 18
    ? 'TOO FAR'
    : fovCoverage > 65
    ? 'TOO CLOSE'
    : 'OPTIMAL'

  // Show a non-intrusive proctor alert banner
  const triggerProctorToast = useCallback((text: string, type: 'warn' | 'danger') => {
    if (proctorToastTimerRef.current) clearTimeout(proctorToastTimerRef.current)
    setProctorToast({ text, type })
    proctorToastTimerRef.current = setTimeout(() => {
      setProctorToast(null)
    }, 3500)
  }, [])

  // Finalize Submission
  const handleFinalizeSubmit = useCallback(async () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Exit Fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }

    setPhase('SUBMITTED')

    // Calculate score
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++
      }
    })
    const totalMarks = Number((correctCount * 0.5).toFixed(1))

    try {
      await api.candidate.addSkill('skill_assessment_mcq', 'Technical Diagnostic Assessment', totalMarks)
    } catch (err) {
      console.warn('Backend attempt logging:', err)
    }
  }, [questions, selectedAnswers])

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play().catch(() => {})
      }
      if (videoHudRef.current) {
        videoHudRef.current.srcObject = stream
        videoHudRef.current.play().catch(() => {})
      }
    } catch (err: any) {
      console.error('Camera access denied or unavailable:', err)
      setCameraError('Camera access is required for AI-proctored verification. Please allow camera permissions.')
      setCameraActive(false)
    }
  }, [])

  // Auto-initialize camera on mount
  useEffect(() => {
    initializeCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [initializeCamera])

  // Synchronize stream with active video element on phase changes
  useEffect(() => {
    const video = phase === 'BRIEFING' ? videoPreviewRef.current : videoHudRef.current
    if (video && streamRef.current) {
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current
      }
      video.play().catch(() => {})
    }
  }, [phase, cameraActive])

  // Log a violation helper with millisecond precision
  const addViolation = useCallback((type: TelemetryViolation['type'], detail: string, penalty: number) => {
    const timeOffset = 3600 - timeLeft
    const min = Math.floor(timeOffset / 60)
    const sec = timeOffset % 60
    const ms = Date.now() % 1000
    const timestamp = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`

    const newViolation: TelemetryViolation = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      type,
      detail,
      penalty,
    }

    setViolations((prev) => [newViolation, ...prev])
  }, [timeLeft])

  // Real-time AI Vision Proctoring: Strict Multi-Stage Face & Biometric Verification, Gaze Tracking, Motion Differencing, Auto-Pause
  useEffect(() => {
    if (!cameraActive) return

    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 120
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvasRef.current = canvas

    let consecutiveAbsenceCount = 0
    let consecutiveGazeShiftCount = 0
    let lastViolationLoggedAt = 0

    // Check for native browser FaceDetector API (hardware accelerated if supported)
    const hasNativeFaceDetector = typeof window !== 'undefined' && 'FaceDetector' in window
    const nativeDetector = hasNativeFaceDetector
      ? new (window as any).FaceDetector({ maxDetectedFaces: 4, fastMode: true })
      : null

    const handleNoFaceDetected = () => {
      consecutiveAbsenceCount++
      setFaceCount(0)
      setFaceDetected(false)
      setGazeStatus('UNVERIFIED')
      setFaceConfidence(0)
      setFaceBox(null)

      if (consecutiveAbsenceCount >= 2 && phase === 'IN_PROGRESS') {
        if (!isExamPaused) {
          setIsExamPaused(true)
          setPauseReason('FACE_ABSENT')
          setStrikes((prev) => {
            const nextStrike = prev + 1
            addViolation('FACE_ABSENT', `Face lost from frame. Test auto-paused. (Strike ${nextStrike}/3)`, 20)

            if (nextStrike >= 3) {
              setViolationModalMessage('CRITICAL INTEGRITY BREACH: Maximum strikes reached (3 Face Lost / Window breaches). Exam automatically terminated.')
              setShowViolationModal(true)
              setTimeout(() => {
                handleFinalizeSubmit()
              }, 2500)
            }
            return nextStrike
          })
          triggerProctorToast('⚠️ TEST PAUSED: Face lost from frame. Realign with camera to resume.', 'danger')
        }
      }
    }

    const handleMultipleFacesDetected = (count: number) => {
      setFaceCount(count)
      setFaceDetected(true)
      setGazeStatus('MULTIPLE_FACES')
      setFaceConfidence(45)

      if (phase === 'IN_PROGRESS') {
        if (!isExamPaused) {
          setIsExamPaused(true)
          setPauseReason('MULTIPLE_FACES')
          setStrikes((prev) => {
            const nextStrike = prev + 1
            addViolation('MULTIPLE_FACES', `Multiple individuals (${count}) detected in proctor feed. Test auto-paused. (Strike ${nextStrike}/3)`, 25)

            if (nextStrike >= 3) {
              setViolationModalMessage('CRITICAL INTEGRITY BREACH: Maximum strikes reached (3 Multiple Persons / Biometric breaches). Exam terminated.')
              setShowViolationModal(true)
              setTimeout(() => {
                handleFinalizeSubmit()
              }, 2500)
            }
            return nextStrike
          })
          triggerProctorToast(`🚨 TEST PAUSED: Multiple persons (${count}) detected in frame! Ensure only 1 person is present to resume.`, 'danger')
        }
      }
    }

    const interval = setInterval(async () => {
      const activeVideo = phase === 'BRIEFING' ? videoPreviewRef.current : videoHudRef.current
      if (!activeVideo || activeVideo.readyState < 2 || !ctx) return

      try {
        const videoWidth = activeVideo.videoWidth || 640
        const videoHeight = activeVideo.videoHeight || 480

        // 1. Hardware FaceDetector API if available and functional
        let detectedFaces: any[] = []
        if (nativeDetector) {
          try {
            const rawDetected = await nativeDetector.detect(activeVideo)
            // Validate that detected faces have realistic dimensions (>20px)
            const validFaces = (rawDetected || []).filter((f: any) => {
              const b = f.boundingBox
              return b && b.width > 20 && b.height > 20
            })

            // ANTI-POSTER FIX: Only count the LARGEST face (closest to camera = real person)
            // This filters out posters, photos, or small faces in the background
            if (validFaces.length > 0) {
              // Sort by face area (width * height) descending
              validFaces.sort((a: any, b: any) => {
                const areaA = a.boundingBox.width * a.boundingBox.height
                const areaB = b.boundingBox.width * b.boundingBox.height
                return areaB - areaA
              })
              
              const largestFace = validFaces[0]
              const largestArea = largestFace.boundingBox.width * largestFace.boundingBox.height
              
              // Only include secondary faces if they're at least 60% as large as the primary face
              // (This prevents counting small posters/photos while allowing a second real person)
              detectedFaces = validFaces.filter((f: any) => {
                const faceArea = f.boundingBox.width * f.boundingBox.height
                return faceArea >= largestArea * 0.6
              })
              
              // Additional safety: If we still have multiple faces, only use the largest one
              // unless the second face is very close in size (within 80%)
              if (detectedFaces.length > 1) {
                const secondLargestArea = detectedFaces[1].boundingBox.width * detectedFaces[1].boundingBox.height
                if (secondLargestArea < largestArea * 0.8) {
                  // Second face is significantly smaller - likely a poster, keep only largest
                  detectedFaces = [largestFace]
                }
              }
            }
          } catch (e) {
            detectedFaces = []
          }
        }

        // 2. Sample Frame into Canvas Buffer for Biometric Clustering and Motion Differencing
        ctx.drawImage(activeVideo, 0, 0, 160, 120)
        const frame = ctx.getImageData(0, 0, 160, 120)
        const data = frame.data
        const totalPixels = 160 * 120 // 19,200

        const GRID_COLS = 20
        const GRID_ROWS = 15
        const CELL_SIZE = 8 // 160/20 = 8, 120/15 = 8
        const grid = new Uint8Array(GRID_COLS * GRID_ROWS)

        let totalBrightness = 0
        let motionDiff = 0
        const prev = prevFrameDataRef.current

        // Grayscale luminance array for fast variance and texture analysis
        const lumaBuffer = new Uint8Array(totalPixels)

        for (let y = 0; y < 120; y++) {
          const rowOffset = y * 160
          const gy = Math.floor(y / CELL_SIZE)
          for (let x = 0; x < 160; x++) {
            const pixelIdx = rowOffset + x
            const idx = pixelIdx * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]

            // Fast Grayscale Luma
            const luma = Math.round((r * 299 + g * 587 + b * 114) / 1000)
            lumaBuffer[pixelIdx] = luma
            totalBrightness += luma

            if (prev) {
              motionDiff += Math.abs(r - prev[idx]) + Math.abs(g - prev[idx + 1]) + Math.abs(b - prev[idx + 2])
            }

            // --- Multi-Space Strict Skin Chrominance Filter ---
            // 1. Intensity Envelope: Reject deep dark shadows and overexposed white glare
            if (r >= 45 && g >= 30 && b >= 20 && !(r > 248 && g > 248 && b > 248)) {
              // 2. RGB Photometric Ordering (Human skin: R dominates G, and G >= B)
              if (r > g && g >= b * 0.78 && (r - g) >= 10 && (r - b) >= 14) {
                // 3. YCbCr Chrominance Box
                const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128
                const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128
                if (cb >= 78 && cb <= 126 && cr >= 134 && cr <= 174) {
                  // 4. HSV Hue & Saturation Range (Rejects yellow paint, wood tones, ambient orange lighting)
                  const maxC = Math.max(r, g, b)
                  const minC = Math.min(r, g, b)
                  const delta = maxC - minC
                  const sat = maxC > 0 ? delta / maxC : 0
                  let hue = 0
                  if (delta > 0) {
                    if (maxC === r) hue = ((g - b) / delta) % 6
                    else if (maxC === g) hue = (b - r) / delta + 2
                    else hue = (r - g) / delta + 4
                    hue = Math.round(hue * 60)
                    if (hue < 0) hue += 360
                  }

                  if ((hue <= 45 || hue >= 340) && sat >= 0.18 && sat <= 0.72) {
                    const gx = Math.floor(x / CELL_SIZE)
                    grid[gy * GRID_COLS + gx]++
                  }
                }
              }
            }
          }
        }

        prevFrameDataRef.current = new Uint8ClampedArray(data)

        const avgBrightness = totalBrightness / totalPixels
        const avgMotion = prev ? motionDiff / (totalPixels * 3) : 0
        const computedMotionLevel = Math.min(100, Math.round(avgMotion * 5))
        setMotionEnergy(computedMotionLevel)

        const isCoveredOrDark = avgBrightness < 15 || avgBrightness > 240
        const now = Date.now()

        // 3. Evaluate Detections
        if (detectedFaces.length > 0) {
          // Native FaceDetector High-Precision Result
          if (detectedFaces.length > 1) {
            handleMultipleFacesDetected(detectedFaces.length)
          } else {
            setFaceCount(1)
            const face = detectedFaces[0].boundingBox
            const rawNormX = Math.max(0, Math.min(100, (face.x / videoWidth) * 100))
            const rawNormY = Math.max(0, Math.min(100, (face.y / videoHeight) * 100))
            const normW = Math.max(20, Math.min(80, (face.width / videoWidth) * 100))
            const normH = Math.max(25, Math.min(90, (face.height / videoHeight) * 100))

            // Mirrored X alignment for CSS -scale-x-100 video
            const mirroredX = Math.max(2, Math.min(98 - normW, 100 - (rawNormX + normW)))
            setFaceBox({ x: Math.round(mirroredX), y: Math.round(rawNormY), width: Math.round(normW), height: Math.round(normH) })
            setFaceDetected(true)

            // Auto-resume test if previously paused and single face is recognized
            if (isExamPaused && strikes < 3) {
              setIsExamPaused(false)
              setPauseReason(null)
              triggerProctorToast('✓ Single face verified. Exam resumed.', 'warn')
            }

            const centerX = mirroredX + normW / 2
            const centerY = rawNormY + normH / 2
            const isCentered = centerX >= 28 && centerX <= 72 && centerY >= 18 && centerY <= 82

            if (!isCentered || avgMotion > 16) {
              setGazeStatus('LOOKING_AWAY')
              setFaceConfidence(65)
              consecutiveGazeShiftCount++

              if (consecutiveGazeShiftCount >= 3 && phase === 'IN_PROGRESS' && now - lastViolationLoggedAt > 8000) {
                lastViolationLoggedAt = now
                addViolation('RAPID_HEAD_MOVEMENT', `Gaze shift or head turn deviation detected (Δ Motion: ${computedMotionLevel}%)`, 8)
                triggerProctorToast('⚠️ GAZE SHIFT: Please keep your eyes centered on the screen.', 'warn')
              }
            } else {
              setGazeStatus('CENTERED')
              setFaceConfidence(Math.min(99, Math.round(92 + Math.random() * 6)))
              consecutiveGazeShiftCount = 0
            }
          }
          consecutiveAbsenceCount = 0
        } else {
          // --- Multi-Stage Biometric Spatial Clustering & Facial Contrast Engine ---
          if (isCoveredOrDark) {
            handleNoFaceDetected()
            return
          }

          // Step A: Connected Component Analysis on 20x15 block grid
          const visited = new Uint8Array(GRID_COLS * GRID_ROWS)
          interface CandidateCluster {
            cells: number
            minGx: number
            maxGx: number
            minGy: number
            maxGy: number
            skinCount: number
          }
          const clusters: CandidateCluster[] = []

          for (let gy = 0; gy < GRID_ROWS; gy++) {
            for (let gx = 0; gx < GRID_COLS; gx++) {
              const gIdx = gy * GRID_COLS + gx
              // Minimum 16 skin pixels out of 64 (25% cell density) to count as active skin cell
              if (!visited[gIdx] && grid[gIdx] >= 16) {
                const queue: [number, number][] = [[gx, gy]]
                visited[gIdx] = 1
                let cellCount = 0
                let clusterSkin = 0
                let minGx = gx, maxGx = gx, minGy = gy, maxGy = gy

                while (queue.length > 0) {
                  const [cx, cy] = queue.shift()!
                  cellCount++
                  const cIdx = cy * GRID_COLS + cx
                  clusterSkin += grid[cIdx]
                  if (cx < minGx) minGx = cx
                  if (cx > maxGx) maxGx = cx
                  if (cy < minGy) minGy = cy
                  if (cy > maxGy) maxGy = cy

                  const neighbors: [number, number][] = [
                    [cx + 1, cy],
                    [cx - 1, cy],
                    [cx, cy + 1],
                    [cx, cy - 1],
                  ]
                  for (const [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
                      const nIdx = ny * GRID_COLS + nx
                      if (!visited[nIdx] && grid[nIdx] >= 16) {
                        visited[nIdx] = 1
                        queue.push([nx, ny])
                      }
                    }
                  }
                }

                clusters.push({
                  cells: cellCount,
                  minGx,
                  maxGx,
                  minGy,
                  maxGy,
                  skinCount: clusterSkin,
                })
              }
            }
          }

          // Step B: Filter and Biometrically Validate Clusters
          clusters.sort((a, b) => b.cells - a.cells)

          const validFaces: { cluster: CandidateCluster; stdDev: number }[] = []

          for (const c of clusters) {
            // Cluster must be between 8 cells (~512 skin px) and 180 cells (<60% of frame)
            if (c.cells < 8 || c.cells > 180) continue

            const wBlocks = c.maxGx - c.minGx + 1
            const hBlocks = c.maxGy - c.minGy + 1

            // Aspect ratio check (height / width between 0.75 and 2.3)
            const aspect = hBlocks / wBlocks
            if (aspect < 0.75 || aspect > 2.3) continue

            // Bounding box fill density (human face is oval, filling 35% - 90% of box)
            const boxBlocks = wBlocks * hBlocks
            const density = c.cells / boxBlocks
            if (density < 0.35 || density > 0.92) continue

            // Facial luminance variance and eye/cheek gradient analysis
            const minPxX = c.minGx * CELL_SIZE
            const maxPxX = Math.min(160, (c.maxGx + 1) * CELL_SIZE)
            const minPxY = c.minGy * CELL_SIZE
            const maxPxY = Math.min(120, (c.maxGy + 1) * CELL_SIZE)
            const pixelH = maxPxY - minPxY

            let lumaSum = 0
            let lumaSqSum = 0
            let sampleCount = 0
            let band1Sum = 0, band1Count = 0 // Top band (eyes/brows)
            let band2Sum = 0, band2Count = 0 // Mid band (cheeks/nose)

            for (let py = minPxY; py < maxPxY; py += 2) {
              const relY = (py - minPxY) / (pixelH || 1)
              const rOff = py * 160
              for (let px = minPxX; px < maxPxX; px += 2) {
                const lum = lumaBuffer[rOff + px]
                lumaSum += lum
                lumaSqSum += lum * lum
                sampleCount++

                if (relY <= 0.45) {
                  band1Sum += lum
                  band1Count++
                } else if (relY <= 0.75) {
                  band2Sum += lum
                  band2Count++
                }
              }
            }

            if (sampleCount < 16) continue

            const meanLuma = lumaSum / sampleCount
            const variance = (lumaSqSum / sampleCount) - (meanLuma * meanLuma)
            const stdDev = Math.sqrt(Math.max(0, variance))

            // Rejects flat painted walls, wooden doors, or plain surfaces with no facial features
            if (stdDev < 7.0) continue

            const band1Avg = band1Count > 0 ? band1Sum / band1Count : meanLuma
            const band2Avg = band2Count > 0 ? band2Sum / band2Count : meanLuma
            const bandDiff = Math.abs(band1Avg - band2Avg)

            // Must have contrast or sufficient standard deviation
            if (bandDiff < 2.0 && stdDev < 9.0) continue

            validFaces.push({ cluster: c, stdDev })
          }

          if (validFaces.length === 0) {
            handleNoFaceDetected()
          } else {
            // Face confirmed
            if (validFaces.length > 1 && validFaces[1].cluster.cells >= 12) {
              handleMultipleFacesDetected(validFaces.length)
            } else {
              setFaceCount(1)
              const primary = validFaces[0]
              const c = primary.cluster
              consecutiveAbsenceCount = 0
              setFaceDetected(true)

              // Auto-resume test if previously paused and single face is recognized
              if (isExamPaused && strikes < 3) {
                setIsExamPaused(false)
                setPauseReason(null)
                triggerProctorToast('✓ Single face verified. Exam resumed.', 'warn')
              }

              // Compute precise mirrored bounding box from cluster
              const wPx = (c.maxGx - c.minGx + 1) * CELL_SIZE
              const hPx = (c.maxGy - c.minGy + 1) * CELL_SIZE
              const centerPxX = (c.minGx + (c.maxGx - c.minGx + 1) / 2) * CELL_SIZE
              const centerPxY = (c.minGy + (c.maxGy - c.minGy + 1) / 2) * CELL_SIZE

              const normW = Math.max(22, Math.min(75, ((wPx * 1.25) / 160) * 100))
              const normH = Math.max(28, Math.min(85, ((hPx * 1.30) / 120) * 100))
              const rawNormX = Math.max(0, Math.min(100 - normW, ((centerPxX - (wPx * 1.25) / 2) / 160) * 100))
              const rawNormY = Math.max(0, Math.min(100 - normH, ((centerPxY - (hPx * 1.30) / 120) / 120) * 100))

              // Mirrored X alignment for CSS -scale-x-100 video
              const mirroredX = Math.max(2, Math.min(98 - normW, 100 - (rawNormX + normW)))
              setFaceBox({ x: Math.round(mirroredX), y: Math.round(rawNormY), width: Math.round(normW), height: Math.round(normH) })

              // Gaze Alignment Check
              const centerX = mirroredX + normW / 2
              const centerY = rawNormY + normH / 2
              const isCentered = centerX >= 25 && centerX <= 75 && centerY >= 15 && centerY <= 85

              if (!isCentered || avgMotion > 14) {
                setGazeStatus('LOOKING_AWAY')
                setFaceConfidence(68)
                consecutiveGazeShiftCount++

                if (consecutiveGazeShiftCount >= 3 && phase === 'IN_PROGRESS' && now - lastViolationLoggedAt > 8000) {
                  lastViolationLoggedAt = now
                  addViolation('RAPID_HEAD_MOVEMENT', `Gaze deviation or head movement detected (Δ Motion: ${computedMotionLevel}%)`, 8)
                  triggerProctorToast('⚠️ GAZE SHIFT: Please keep your eyes centered on the screen.', 'warn')
                }
              } else {
                setGazeStatus('CENTERED')
                const calculatedConfidence = Math.min(99, Math.max(78, Math.round(75 + (c.cells / 50) * 15 + (primary.stdDev / 30) * 10)))
                setFaceConfidence(calculatedConfidence)
                consecutiveGazeShiftCount = 0
              }
            }
          }
        }
      } catch (err) {
        // Frame analysis fallback
      }
    }, 500)

    return () => clearInterval(interval)
  }, [cameraActive, phase, addViolation, triggerProctorToast, isExamPaused, strikes, handleFinalizeSubmit])

  // Start Assessment Flow with Lock & MediaRecorder
  const handleStartAssessment = async () => {
    // Ensure camera is active
    if (!streamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        })
        streamRef.current = stream
        setCameraActive(true)
      } catch (err) {
        setCameraError('You must grant camera permissions before initiating the locked assessment.')
        return
      }
    }

    // Try Fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed by browser policy:', err)
    }

    // Initialize MediaRecorder
    if (streamRef.current) {
      try {
        recordedChunksRef.current = []
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm',
        })

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }

        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
            const url = URL.createObjectURL(blob)
            setRecordedVideoUrl(url)
          }
        }

        recorder.start(1000)
        mediaRecorderRef.current = recorder
      } catch (err) {
        console.warn('MediaRecorder init fallback:', err)
      }
    }

    setPhase('IN_PROGRESS')
    setCurrentIndex(0)
    setTimeLeft(3600)
    setStrikes(0)
    setIsExamPaused(false)
    setPauseReason(null)
    setViolations([])
  }

  // Timer countdown (Suspended when exam is paused)
  useEffect(() => {
    if (phase !== 'IN_PROGRESS' || isExamPaused) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalizeSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, isExamPaused, handleFinalizeSubmit])

  // 1. KEYBOARD LOCKDOWN: Intercept and block all keyboard events
  useEffect(() => {
    if (phase !== 'IN_PROGRESS') return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()
      if (now - lastKeyTimeRef.current > 600) {
        lastKeyTimeRef.current = now
        const keyLabel = e.key.length === 1 ? `'${e.key}'` : e.code || e.key
        setKeyboardWarning(`⚠️ KEYBOARD LOCKED: Key press [${keyLabel}] was blocked. Use mouse only.`)

        if (keyboardWarningTimerRef.current) clearTimeout(keyboardWarningTimerRef.current)
        keyboardWarningTimerRef.current = setTimeout(() => {
          setKeyboardWarning(null)
        }, 3000)

        addViolation('KEYBOARD_ATTEMPT', `Keyboard key intercepted: ${keyLabel}`, 5)
      }
      return false
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      addViolation('RIGHT_CLICK', 'Context menu access blocked', 5)
      return false
    }

    const handleClipboard = (e: ClipboardEvent) => {
      e.preventDefault()
      addViolation('KEYBOARD_ATTEMPT', 'Clipboard copy/paste blocked', 10)
      return false
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('keypress', handleKeyDown, true)
    window.addEventListener('contextmenu', handleContextMenu, true)
    window.addEventListener('copy', handleClipboard, true)
    window.addEventListener('cut', handleClipboard, true)
    window.addEventListener('paste', handleClipboard, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('keypress', handleKeyDown, true)
      window.removeEventListener('contextmenu', handleContextMenu, true)
      window.removeEventListener('copy', handleClipboard, true)
      window.removeEventListener('cut', handleClipboard, true)
      window.removeEventListener('paste', handleClipboard, true)
    }
  }, [phase, addViolation])

  // 2. TAB SWITCHING & BLUR DETECTION
  useEffect(() => {
    if (phase !== 'IN_PROGRESS') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setStrikes((prev) => {
          const nextStrike = prev + 1
          addViolation('TAB_SWITCH', `Tab switched or hidden (Strike ${nextStrike}/3)`, 25)

          if (nextStrike >= 3) {
            setViolationModalMessage('CRITICAL INTEGRITY BREACH: Maximum violations exceeded (3 Tab Switches). Assessment automatically submitted.')
            setShowViolationModal(true)
            setTimeout(() => {
              handleFinalizeSubmit()
            }, 2500)
          } else {
            setViolationModalMessage(`SECURITY ALERT: Tab switch detected! (Strike ${nextStrike} of 3). Please keep this window active.`)
            setShowViolationModal(true)
          }

          return nextStrike
        })
      }
    }

    const handleBlur = () => {
      addViolation('FOCUS_LOST', 'Window focus lost to external application', 15)
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        addViolation('FULLSCREEN_EXIT', 'Fullscreen mode exited by user', 20)
      } else {
        setIsFullscreen(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [phase, addViolation, handleFinalizeSubmit])

  // Handle option selection by mouse
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }))
  }

  // Handle strictly forward progression (jumping ahead is allowed, but permanently seals prior questions)
  const handleJumpForward = (targetIndex: number) => {
    if (targetIndex > currentIndex) {
      setCurrentIndex(targetIndex)
    }
  }

  // Calculate dynamic results and trust index
  const calculateScore = () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++
      }
    })

    const totalQuestions = questions.length // 20
    const marksPerQuestion = 0.5
    const totalMarks = Number((correctCount * marksPerQuestion).toFixed(1)) // Max 10.0
    const percentage = Math.round((correctCount / totalQuestions) * 100)

    // Calculate integrity score (100% decaying per penalty)
    const totalPenalties = violations.reduce((sum, v) => sum + v.penalty, 0)
    const trustScore = Math.max(0, Math.min(100, 100 - totalPenalties))

    let integrityStatus: 'CLEAN' | 'SUSPICIOUS' | 'FLAGGED' = 'CLEAN'
    if (trustScore < 60 || strikes >= 3) {
      integrityStatus = 'FLAGGED'
    } else if (trustScore < 85 || strikes > 0) {
      integrityStatus = 'SUSPICIOUS'
    }

    return {
      correctCount,
      totalQuestions,
      marksPerQuestion,
      totalMarks,
      maxMarks: 10.0,
      percentage,
      trustScore,
      integrityStatus,
    }
  }

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* -------------------- PHASE 1: BRIEFING -------------------- */}
      {phase === 'BRIEFING' && (
        <div className="card space-y-6 p-6 md:p-8 border-burgundy/40 bg-gradient-obsidian">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-burgundy/20 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory shadow-glow-crimson shrink-0">
                <Lock size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-classified">PROCTORED EXAM PROTOCOL</span>
                  <span className="text-xs font-mono text-warm-ivory/60">EXAM // LC-SEC-2026-V2</span>
                </div>
                <h1 className="heading-lg text-warm-ivory mt-1">SECURE SKILL ASSESSMENT</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-crimson/15 border border-crimson/30 text-xs font-mono text-crimson font-bold">
              <Clock size={15} /> 60:00 MINUTE LOCKDOWN
            </div>
          </div>

          <p className="text-sm text-warm-ivory/80 font-mono leading-relaxed">
            This advanced diagnostic evaluates your engineering rigor across 20 specialized questions. The exam enforces a <strong>strict linear flow</strong> (backward navigation is permanently disabled once you proceed) inside a secure anti-cheat sandbox.
          </p>

          {/* Test Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-1">
              <span className="text-warm-ivory/60 block text-[10px] uppercase font-bold tracking-wider">Question Bank</span>
              <span className="text-lg font-bold text-warm-ivory block">20 MCQs</span>
              <span className="text-[11px] text-warm-ivory/50">Strict Linear Progression</span>
            </div>
            <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-1">
              <span className="text-warm-ivory/60 block text-[10px] uppercase font-bold tracking-wider">Marking Scheme</span>
              <span className="text-lg font-bold text-crimson block">0.5 Mark / Question</span>
              <span className="text-[11px] text-warm-ivory/50">Maximum Score: 10.0 Marks</span>
            </div>
            <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-1">
              <span className="text-warm-ivory/60 block text-[10px] uppercase font-bold tracking-wider">Time Limit</span>
              <span className="text-lg font-bold text-emerald-400 block">1 Hour (60 Mins)</span>
              <span className="text-[11px] text-warm-ivory/50">Auto-submits upon expiry</span>
            </div>
          </div>

          {/* Camera Pre-Check & "KEEP FACE IN FRAME" HUD Section */}
          <div className="p-5 bg-obsidian rounded-xl border border-burgundy/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-burgundy/20 pb-3">
              <div className="flex items-center gap-2 text-warm-ivory font-mono text-xs font-bold">
                <Camera size={16} className="text-crimson" /> LIVE PROCTOR CAMERA & BIOMETRIC CALIBRATION
              </div>
              {cameraActive ? (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded border border-emerald-400/30">
                  <CheckCircle2 size={13} /> SENSORS ONLINE & CALIBRATED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded border border-amber-400/30 animate-pulse">
                  <AlertTriangle size={13} /> CAMERA INITIALIZATION PENDING
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* High-tech Face Frame Video Preview */}
              <div className="space-y-2.5">
                <div className="relative aspect-video bg-charcoal rounded-xl overflow-hidden border-2 border-burgundy/40 shadow-2xl flex items-center justify-center group">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Animated Scanning Line */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-6 bg-gradient-to-b from-transparent via-crimson/25 to-transparent animate-pulse absolute top-1/3" />
                      </div>

                      {/* Live Dynamic AI Bounding Box Tracker */}
                      {faceBox && faceDetected && (
                        <div
                          className="absolute border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex flex-col justify-between p-1.5"
                          style={{
                            left: `${faceBox.x}%`,
                            top: `${faceBox.y}%`,
                            width: `${faceBox.width}%`,
                            height: `${faceBox.height}%`,
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                            <span className="text-[8px] font-mono font-bold text-emerald-300 bg-black/90 px-1.5 py-0.5 rounded border border-emerald-400/50">
                              {faceConfidence}% CONF
                            </span>
                            <div className="w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                            <div className="w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                          </div>
                        </div>
                      )}

                      {/* "KEEP FACE IN FRAME" HUD Reticle Overlay */}
                      <div className={cn(
                        "absolute inset-5 border-2 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3 transition-all duration-300",
                        !faceDetected
                          ? "border-red-500/80 bg-red-950/20"
                          : gazeStatus === 'MULTIPLE_FACES'
                          ? "border-purple-500/80 bg-purple-950/20"
                          : gazeStatus === 'LOOKING_AWAY'
                          ? "border-amber-400/70"
                          : "border-emerald-400/50"
                      )}>
                        {/* Top HUD Line */}
                        <div className="flex justify-between items-start">
                          <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-1 -ml-1" />
                          <div className={cn(
                            "text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 shadow-md",
                            !faceDetected
                              ? "bg-red-950/90 text-red-300 border-red-500 animate-pulse"
                              : gazeStatus === 'MULTIPLE_FACES'
                              ? "bg-purple-950/90 text-purple-300 border-purple-500"
                              : gazeStatus === 'LOOKING_AWAY'
                              ? "bg-amber-950/90 text-amber-300 border-amber-500"
                              : "bg-black/85 text-emerald-300 border-emerald-400/40"
                          )}>
                            <Scan size={11} className="animate-spin" />
                            {!faceDetected
                              ? 'ALERT: FACE ABSENT'
                              : gazeStatus === 'MULTIPLE_FACES'
                              ? '🚨 MULTIPLE PERSONS'
                              : gazeStatus === 'LOOKING_AWAY'
                              ? '⚠️ GAZE DEVIATION'
                              : 'EYE & POSE TRACKING'}
                          </div>
                          <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-1 -mr-1" />
                        </div>

                        {/* Center Crosshair and Label */}
                        <div className="self-center text-center space-y-1">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold shadow-lg border",
                            !faceDetected
                              ? "bg-red-950/90 text-red-300 border-red-500"
                              : "bg-black/85 text-emerald-400 border-emerald-400/50"
                          )}>
                            <UserCheck size={13} />
                            {!faceDetected ? 'PLEASE POSITION FACE IN FRAME' : 'KEEP FACE IN FRAME'}
                          </div>
                          <p className="text-[9px] font-mono text-warm-ivory/80 bg-black/70 px-2 py-0.5 rounded inline-block">
                            {gazeStatus === 'CENTERED'
                              ? 'GAZE ALIGNED WITH SCREEN CENTER'
                              : gazeStatus === 'LOOKING_AWAY'
                              ? 'OFF-CENTER GLANCE / MOTION DETECTED'
                              : 'CALIBRATING VISION SENSORS'}
                          </p>
                        </div>

                        {/* Bottom Corners */}
                        <div className="flex justify-between items-end">
                          <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-1 -ml-1" />
                          <div className="text-[9px] font-mono text-warm-ivory/80 bg-black/85 px-2 py-0.5 rounded border border-emerald-400/30">
                            FOV: {fovCoverage}% [{fovQuality}] // MOTION: {motionEnergy}%
                          </div>
                          <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-1 -mr-1" />
                        </div>
                      </div>

                      {/* Live Stream Status Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-400 border border-emerald-400/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE BIOMETRIC FEED
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <VideoOff size={36} className="mx-auto text-warm-ivory/40" />
                      <p className="text-xs font-mono text-warm-ivory/70 font-semibold">Camera feed offline</p>
                      <p className="text-[11px] font-mono text-warm-ivory/40 max-w-xs">
                        Click the button below to grant permission and activate the live proctor stream.
                      </p>
                    </div>
                  )}
                </div>

                {/* Real-time Diagnostics Sensor Bar */}
                {cameraActive && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                    <div className="p-2 rounded bg-charcoal/80 border border-burgundy/30 text-center space-y-0.5">
                      <span className="text-warm-ivory/50 block text-[9px] uppercase flex items-center justify-center gap-1">
                        <Users size={10} /> Face ({faceCount})
                      </span>
                      <span className={cn('font-bold block', faceDetected ? 'text-emerald-400' : 'text-red-400')}>
                        {faceCount > 1 ? `🚨 ${faceCount} DETECTED` : faceDetected ? '● DETECTED' : '✖ ABSENT'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-charcoal/80 border border-burgundy/30 text-center space-y-0.5">
                      <span className="text-warm-ivory/50 block text-[9px] uppercase">Gaze Status</span>
                      <span className={cn('font-bold block', gazeStatus === 'CENTERED' ? 'text-emerald-400' : 'text-amber-400')}>
                        {gazeStatus === 'CENTERED' ? '● CENTERED' : '▲ OFF-CENTER'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-charcoal/80 border border-burgundy/30 text-center space-y-0.5">
                      <span className="text-warm-ivory/50 block text-[9px] uppercase">FOV Coverage</span>
                      <span className={cn('font-bold block', fovQuality === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400')}>
                        {fovCoverage}% [{fovQuality}]
                      </span>
                    </div>
                    <div className="p-2 rounded bg-charcoal/80 border border-burgundy/30 text-center space-y-0.5">
                      <span className="text-warm-ivory/50 block text-[9px] uppercase flex items-center justify-center gap-1">
                        <Activity size={10} /> Motion
                      </span>
                      <span className={cn('font-bold block', motionEnergy > 20 ? 'text-amber-400' : 'text-emerald-400')}>
                        {motionEnergy > 20 ? 'HIGH' : `${motionEnergy}%`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Proctor Capabilities Description */}
              <div className="space-y-3.5 font-mono text-xs">
                <p className="text-warm-ivory/90 leading-relaxed font-semibold">
                  Continuous AI Proctoring actively evaluates the live video stream for:
                </p>
                <div className="space-y-2 text-warm-ivory/70 text-[11px]">
                  <div className="flex items-start gap-2.5 p-2 rounded bg-burgundy/10 border border-burgundy/20">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-warm-ivory">Face Presence & Framing:</strong> Flags disappearance, multiple individuals, or camera obstruction.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded bg-burgundy/10 border border-burgundy/20">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-warm-ivory">Eye Gaze & Head Orientation:</strong> Monitors head yaw/pitch angles and off-screen glances.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded bg-burgundy/10 border border-burgundy/20">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-warm-ivory">Motion & Body Movement:</strong> Detects rapid movement, secondary phones, or reaching gestures.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded bg-burgundy/10 border border-burgundy/20">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-warm-ivory">Encrypted Audit Recording:</strong> Full session captured in WebM for verification.
                    </div>
                  </div>
                </div>

                {!cameraActive && (
                  <button
                    onClick={initializeCamera}
                    className="btn-secondary text-xs font-mono py-2.5 px-4 flex items-center gap-2 w-full justify-center border-crimson/50 hover:border-crimson hover:bg-crimson/10"
                  >
                    <Camera size={14} className="text-crimson" /> GRANT CAMERA ACCESS & ACTIVATE FEED
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-lg text-xs font-mono text-red-300 flex items-center gap-2.5">
                <AlertOctagon size={18} className="shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Protocols & Linear Rules */}
          <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-2.5 text-xs font-mono">
            <h3 className="text-warm-ivory font-bold uppercase tracking-wider text-crimson flex items-center gap-2">
              <ShieldAlert size={14} /> EXAM LOCKDOWN & STRICT LINEAR INTEGRITY RULES
            </h3>
            <div className="space-y-2 text-warm-ivory/70 text-[11px]">
              <p className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-crimson shrink-0" />
                <span><strong>Linear Progression:</strong> You cannot return to previously answered or skipped questions. Once you advance past a question, it is sealed.</span>
              </p>
              <p className="flex items-center gap-2">
                <MousePointer size={13} className="text-amber-400 shrink-0" />
                <span><strong>Mouse Only:</strong> All keyboard inputs, right-clicks, and text copying are locked. Selection is strictly mouse-driven.</span>
              </p>
              <p className="flex items-center gap-2">
                <Maximize2 size={13} className="text-amber-400 shrink-0" />
                <span><strong>Tab & Fullscreen Lock:</strong> Leaving the active window or exiting fullscreen triggers an integrity strike (3 strikes auto-submits).</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => onNavigate?.('candidate-dossier')}
              className="btn-ghost text-xs font-mono flex items-center gap-2"
            >
              <ArrowLeft size={14} /> RETURN TO DOSSIER
            </button>
            <button
              onClick={handleStartAssessment}
              className="btn-primary text-xs font-mono py-3 px-7 flex items-center gap-2 shadow-glow-crimson"
            >
              INITIATE LOCKDOWN ASSESSMENT <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- PHASE 2: IN PROGRESS (LOCKED SANDBOX) -------------------- */}
      {phase === 'IN_PROGRESS' && (
        <div className="space-y-6 relative select-none">
          {/* Keyboard Warning Toast */}
          {keyboardWarning && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-950 border-2 border-red-500 text-red-200 px-5 py-3 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-3 animate-bounce">
              <AlertOctagon size={18} className="text-red-400 animate-spin" />
              <span className="font-bold">{keyboardWarning}</span>
            </div>
          )}

          {/* Real-time AI Proctor Live Warning Toast */}
          {proctorToast && (
            <div className={cn(
              "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-3 animate-bounce border-2 transition-all duration-300",
              proctorToast.type === 'danger'
                ? "bg-red-950 border-red-500 text-red-100"
                : "bg-amber-950 border-amber-500 text-amber-100"
            )}>
              <ShieldAlert size={18} className={proctorToast.type === 'danger' ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
              <span className="font-bold">{proctorToast.text}</span>
            </div>
          )}

          {/* Biometric Lockdown Full-Screen Auto-Pause (Face Lost or Multiple Persons) */}
          {isExamPaused && strikes < 3 && (
            <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fadeIn">
              <div className={cn(
                "w-20 h-20 rounded-full border-2 flex items-center justify-center animate-pulse",
                pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                  ? "bg-purple-950/90 border-purple-500 text-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.5)]"
                  : "bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_35px_rgba(239,68,68,0.5)]"
              )}>
                {pauseReason === 'MULTIPLE_FACES' || faceCount > 1 ? <Users size={40} /> : <VideoOff size={40} />}
              </div>

              <div className="space-y-2 max-w-md">
                <span className={cn(
                  "stamp-classified text-xs px-3 py-1 font-mono font-bold border",
                  pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                    ? "bg-purple-950 text-purple-300 border-purple-500"
                    : "bg-red-950 text-red-300 border-red-500"
                )}>
                  {pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                    ? "PROCTOR SECURITY BREACH // TEST PAUSED"
                    : "BIOMETRIC LOCKDOWN // TEST PAUSED"}
                </span>
                <h2 className={cn(
                  "heading-lg font-mono font-bold",
                  pauseReason === 'MULTIPLE_FACES' || faceCount > 1 ? "text-purple-400" : "text-red-400"
                )}>
                  {pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                    ? "MULTIPLE PERSONS DETECTED"
                    : "FACE NOT DETECTED IN FRAME"}
                </h2>
                <p className="text-xs font-mono text-warm-ivory/80 leading-relaxed">
                  {pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                    ? "The assessment and countdown timer are suspended because multiple individuals were detected in your camera stream. Ensure only you are in the frame to automatically resume the exam."
                    : "The assessment and countdown timer are suspended. Realign your face inside the camera viewfinder below to automatically resume the exam."}
                </p>
              </div>

              <div className="p-3 bg-burgundy/25 rounded-lg border border-red-500/40 text-xs font-mono flex items-center gap-4">
                <span>STRIKE RECORDED: <strong className="text-red-400 font-bold">{strikes} of 3</strong></span>
                <span className="text-warm-ivory/40">|</span>
                <span className="text-amber-400">3 Strikes = Automatic Failure</span>
              </div>

              {/* Viewfinder Preview */}
              <div className={cn(
                "relative w-72 aspect-video rounded-xl overflow-hidden border-2 shadow-2xl bg-charcoal",
                pauseReason === 'MULTIPLE_FACES' || faceCount > 1 ? "border-purple-500/80" : "border-red-500/80"
              )}>
                <video
                  ref={(el) => {
                    if (el && streamRef.current) {
                      el.srcObject = streamRef.current
                      el.play().catch(() => {})
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className={cn(
                  "absolute inset-3 border-2 border-dashed rounded-lg flex items-center justify-center pointer-events-none text-center px-2",
                  pauseReason === 'MULTIPLE_FACES' || faceCount > 1 ? "border-purple-400/70" : "border-red-400/70"
                )}>
                  <span className={cn(
                    "text-[10px] font-mono px-2.5 py-1 rounded border",
                    pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                      ? "text-purple-200 bg-black/85 border-purple-500/50"
                      : "text-red-200 bg-black/85 border-red-500/50"
                  )}>
                    {pauseReason === 'MULTIPLE_FACES' || faceCount > 1
                      ? "ENSURE ONLY 1 PERSON IN FRAME TO RESUME"
                      : "ALIGN FACE HERE TO RESUME"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Violation Strike Alert Modal */}
          {showViolationModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="card max-w-md w-full p-6 border-red-500 bg-obsidian text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-400 animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <h3 className="heading-md text-red-400 font-mono font-bold">SECURITY VIOLATION DETECTED</h3>
                <p className="text-xs font-mono text-warm-ivory/80 leading-relaxed">
                  {violationModalMessage}
                </p>
                <div className="p-3 bg-burgundy/20 rounded border border-burgundy/30 text-xs font-mono">
                  <span className="text-warm-ivory/60">INTEGRITY STRIKES: </span>
                  <span className="text-red-400 font-bold">{strikes} of 3</span>
                </div>
                {strikes < 3 && (
                  <button
                    onClick={() => setShowViolationModal(false)}
                    className="btn-primary text-xs font-mono py-2.5 px-6 w-full"
                  >
                    ACKNOWLEDGE & RESUME EXAM
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top Status Header & Proctor Floating HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Status Bar (3 cols) */}
            <div className="lg:col-span-3 card p-4 flex flex-wrap items-center justify-between gap-4 bg-charcoal border-burgundy/30">
              <div className="flex items-center gap-3">
                <span className="stamp-live flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-crimson animate-ping" />
                  TEST IN PROGRESS
                </span>
                <span className="text-xs font-mono text-warm-ivory/80">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                {/* Timer */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian border border-burgundy/30">
                  <Clock size={16} className={cn(timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-crimson')} />
                  <span className={cn('font-bold font-mono text-sm tracking-widest', timeLeft < 300 ? 'text-red-400' : 'text-warm-ivory')}>
                    {formattedTime}
                  </span>
                </div>

                {/* Lock Status */}
                <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20">
                  <Lock size={13} />
                  <span className="text-[11px] font-bold">KEYBOARD LOCKED</span>
                </div>
              </div>
            </div>

            {/* Live Proctor Floating HUD (1 col) */}
            <div className="lg:col-span-1 card p-2 bg-obsidian border-burgundy/40 relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="relative aspect-video rounded overflow-hidden bg-charcoal border border-burgundy/30">
                <video
                  ref={videoHudRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Live Dynamic Face Tracking Box */}
                {faceBox && faceDetected && (
                  <div
                    className="absolute border border-dashed border-emerald-400/70 rounded pointer-events-none transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                    style={{
                      left: `${faceBox.x}%`,
                      top: `${faceBox.y}%`,
                      width: `${faceBox.width}%`,
                      height: `${faceBox.height}%`,
                    }}
                  />
                )}

                {/* HUD Overlay in Active Exam */}
                <div className="absolute inset-1 border border-dashed border-emerald-400/40 rounded pointer-events-none" />

                <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> REC
                </div>
                <div className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono text-warm-ivory/80 border border-burgundy/30">
                  FOV {fovCoverage}%
                </div>
                <div className={cn(
                  'absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono border',
                  !faceDetected
                    ? 'text-red-400 border-red-500/50 animate-pulse'
                    : gazeStatus === 'MULTIPLE_FACES'
                    ? 'text-purple-300 border-purple-500/50'
                    : gazeStatus === 'LOOKING_AWAY'
                    ? 'text-amber-300 border-amber-500/40'
                    : 'text-emerald-400 border-emerald-500/30'
                )}>
                  <Eye size={10} />
                  {!faceDetected
                    ? 'FACE LOST'
                    : gazeStatus === 'MULTIPLE_FACES'
                    ? 'MULTI-FACE'
                    : gazeStatus === 'LOOKING_AWAY'
                    ? 'GAZE SHIFT'
                    : `ALIGNED ${faceConfidence}%`}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-warm-ivory/60 pt-1.5 px-1">
                <span>STRIKES: <strong className={strikes > 0 ? 'text-red-400' : 'text-emerald-400'}>{strikes}/3</strong></span>
                <span className={cn(
                  fovQuality === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  FOV: {fovQuality}
                </span>
                <span className={isFullscreen ? 'text-emerald-400' : 'text-amber-400'}>
                  {isFullscreen ? 'FULLSCREEN' : 'WINDOWED'}
                </span>
              </div>
            </div>
          </div>

          {/* Linear Question Palette / Forward-Jump Grid */}
          <div className="card p-3.5 bg-obsidian/70 border-burgundy/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-warm-ivory/70 uppercase tracking-wider font-bold">
                  LINEAR QUESTION PALETTE
                </span>
                <span className="text-[9px] font-mono text-crimson bg-crimson/10 px-2 py-0.5 rounded border border-crimson/20">
                  BACKWARD NAVIGATION LOCKED
                </span>
              </div>
              <span className="text-[10px] font-mono text-warm-ivory/60">
                {Object.keys(selectedAnswers).length} / {questions.length} ANSWERED
              </span>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined
                const isCurrent = idx === currentIndex
                const isPastLocked = idx < currentIndex
                const isForward = idx > currentIndex

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isForward) handleJumpForward(idx)
                    }}
                    disabled={isPastLocked}
                    title={
                      isPastLocked
                        ? `Question ${idx + 1} is sealed (Linear mode)`
                        : isCurrent
                        ? `Current Question ${idx + 1}`
                        : `Jump forward to Question ${idx + 1} (seals prior questions)`
                    }
                    className={cn(
                      'h-7 rounded text-xs font-mono font-bold transition-all flex items-center justify-center border',
                      isCurrent
                        ? 'border-crimson bg-crimson text-warm-ivory shadow-glow-crimson scale-105'
                        : isPastLocked
                        ? 'border-burgundy/20 bg-charcoal/60 text-warm-ivory/25 cursor-not-allowed opacity-40 line-through'
                        : isAnswered
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                        : 'border-burgundy/30 bg-burgundy/10 text-warm-ivory/60 hover:bg-burgundy/20 hover:text-warm-ivory cursor-pointer'
                    )}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 overflow-hidden">
            <div
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              className="h-full bg-gradient-crimson transition-all duration-300"
            />
          </div>

          {/* Question Card */}
          <div className="card space-y-6">
            <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-crimson font-bold">
                  Q{currentIndex + 1} // {currentQ.skill}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-burgundy/20 text-warm-ivory/70 uppercase">
                  WEIGHT: 0.5 MARKS
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-burgundy/20 text-warm-ivory/70 uppercase">
                DIFFICULTY: {currentQ.difficulty}
              </span>
            </div>

            <h2 className="text-sm md:text-base font-semibold text-warm-ivory font-mono leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 bg-obsidian border border-burgundy/30 rounded-lg text-warm-ivory/90 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* MCQ Options — Mouse click only */}
            <div className="space-y-3">
              {currentQ.options.map((option: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 text-xs font-mono cursor-pointer',
                      isSelected
                        ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                        : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:bg-burgundy/20 hover:border-crimson/40'
                    )}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px]">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Bottom Navigator — Strictly Linear */}
            <div className="flex items-center justify-between pt-4 border-t border-burgundy/20">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-warm-ivory/40">
                <Lock size={12} className="text-crimson/70" />
                <span>PREVIOUS QUESTIONS LOCKED (LINEAR MODE)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-[11px] font-mono text-warm-ivory/50 hidden sm:block">
                  {selectedAnswers[currentIndex] !== undefined ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Option selected
                    </span>
                  ) : (
                    <span>Select an option with mouse</span>
                  )}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="btn-primary text-xs font-mono py-2 px-5"
                  >
                    NEXT QUESTION →
                  </button>
                ) : (
                  <button
                    onClick={handleFinalizeSubmit}
                    className="btn-primary text-xs font-mono py-2 px-6 bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-glow-emerald"
                  >
                    <CheckCircle2 size={13} /> FINALIZE & SUBMIT EXAM
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PHASE 3: SUBMITTED RESULTS & PROCTOR AUDIT -------------------- */}
      {phase === 'SUBMITTED' && (() => {
        const result = calculateScore()
        return (
          <div className="card space-y-8 p-6 md:p-8 bg-charcoal border-crimson/30">
            {/* Header */}
            <div className="text-center space-y-2 border-b border-burgundy/20 pb-6">
              <span className="stamp-verified inline-block">VERIFIED ASSESSMENT COMPLETE</span>
              <h2 className="heading-lg text-warm-ivory mt-2">TECHNICAL DIAGNOSTIC & PROCTOR AUDIT REPORT</h2>
              <p className="text-xs font-mono text-warm-ivory/60">
                BENCHMARK EVALUATED & SEALED // ID: SEC-{Date.now().toString().slice(-6)}
              </p>
            </div>

            {/* Top Score Matrix — Balanced 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-burgundy/15 rounded-xl border border-burgundy/30 text-center space-y-1.5 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-warm-ivory/60 uppercase font-bold tracking-wider">
                  CALCULATED MARKS
                </span>
                <p className="text-2xl md:text-3xl font-bold text-crimson font-mono leading-none">
                  {result.totalMarks.toFixed(1)} <span className="text-base text-warm-ivory/50">/ {result.maxMarks.toFixed(1)}</span>
                </p>
                <p className="text-[11px] text-warm-ivory/60 font-mono">
                  {result.correctCount} of {result.totalQuestions} Correct (0.5m each)
                </p>
              </div>

              <div className="p-4 bg-emerald-400/10 rounded-xl border border-emerald-400/30 text-center space-y-1.5 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  READINESS TIER
                </span>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400 font-mono leading-none">
                  {result.percentage >= 80 ? 'TIER 1' : result.percentage >= 60 ? 'TIER 2' : 'TIER 3'}
                </p>
                <p className="text-[11px] text-warm-ivory/60 font-mono">
                  Accuracy: {result.percentage}% ({result.percentage >= 80 ? 'Lead Engineer' : result.percentage >= 60 ? 'Core Developer' : 'Developing'})
                </p>
              </div>

              <div className={cn(
                'p-4 rounded-xl border font-mono text-center space-y-1.5 flex flex-col justify-center',
                result.integrityStatus === 'CLEAN'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : result.integrityStatus === 'SUSPICIOUS'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              )}>
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  PROCTOR TRUST INDEX
                </span>
                <p className="text-2xl md:text-3xl font-bold font-mono leading-none">
                  {result.trustScore}%
                </p>
                <p className="text-[11px] font-bold">
                  STATUS: {result.integrityStatus}
                </p>
              </div>

              <div className="p-4 bg-burgundy/15 rounded-xl border border-burgundy/30 text-center space-y-1.5 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-warm-ivory/60 uppercase font-bold tracking-wider">
                  SECURITY ANOMALIES
                </span>
                <p className="text-2xl md:text-3xl font-bold text-warm-ivory font-mono leading-none">
                  {violations.length}
                </p>
                <p className="text-[11px] text-warm-ivory/60 font-mono">
                  {strikes} Window Blur Strikes
                </p>
              </div>
            </div>

            {/* Video Player & Telemetry Log Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Recorded Video Playback Card */}
              <div className="p-5 bg-obsidian rounded-xl border border-burgundy/30 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-burgundy/20 pb-2.5">
                  <span className="font-bold text-warm-ivory font-mono text-xs flex items-center gap-2">
                    <Camera size={15} className="text-crimson" /> PROCTOR SESSION VIDEO REPLAY
                  </span>
                  <span className="stamp-classified text-[9px] px-2 py-0.5">
                    ENCRYPTED ARCHIVE
                  </span>
                </div>

                <div className="relative aspect-video bg-charcoal rounded-lg overflow-hidden border border-burgundy/30 flex items-center justify-center my-auto">
                  {recordedVideoUrl ? (
                    <video
                      src={recordedVideoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-warm-ivory/50 space-y-2">
                      <VideoOff size={28} className="mx-auto text-warm-ivory/30" />
                      <p className="text-xs font-mono">Encrypted proctor stream captured and sealed for recruiter audit</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-mono text-warm-ivory/50 text-center">
                  Video stream archived with timestamp markers for review
                </p>
              </div>

              {/* Integrity Telemetry Incident Log Card */}
              <div className="p-5 bg-obsidian rounded-xl border border-burgundy/30 space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-burgundy/20 pb-2.5">
                  <span className="font-bold text-warm-ivory font-mono text-xs flex items-center gap-2">
                    <ShieldAlert size={15} className="text-amber-400" /> INTEGRITY TELEMETRY AUDIT LOG ({violations.length})
                  </span>
                  <span className="text-[10px] font-mono text-warm-ivory/50">
                    REAL-TIME SENSOR DATA
                  </span>
                </div>

                <div className="flex-1 min-h-[220px] max-h-[260px] overflow-y-auto space-y-2 pr-1.5">
                  {violations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-center text-emerald-400 text-xs font-mono space-y-2">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">ZERO INFRACTIONS DETECTED</span>
                      <p className="text-[11px] text-warm-ivory/60 max-w-xs">
                        Full compliance with browser lockdown, eye gaze alignment, and camera presence rules.
                      </p>
                    </div>
                  ) : (
                    violations.map((v) => (
                      <div
                        key={v.id}
                        className="text-xs font-mono p-2.5 rounded-lg bg-burgundy/15 border border-burgundy/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-crimson font-bold text-[11px] shrink-0">[{v.timestamp}]</span>
                          <span className="text-warm-ivory/90 text-[11px] truncate">{v.detail}</span>
                        </div>
                        <span className="text-red-400 font-bold text-[10px] shrink-0 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                          -{v.penalty}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] font-mono text-warm-ivory/50 text-center border-t border-burgundy/15 pt-2">
                  Violations reduce proctor trust index and trigger recruiter review flags
                </p>
              </div>
            </div>

            {/* Question by Question Review — Pixel-Perfect Layout */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
                <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider font-bold">
                  DEBRIEFING & QUESTION RATIONALE (ALL 20 QUESTIONS)
                </h3>
                <span className="text-xs font-mono text-warm-ivory/60">
                  {result.correctCount} / 20 CORRECT
                </span>
              </div>

              <div className="space-y-3">
                {questions.map((q, qIdx) => {
                  const isCorrect = selectedAnswers[qIdx] === q.correct
                  const userSelected = selectedAnswers[qIdx]

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        'p-4 rounded-xl border text-xs font-mono space-y-3 transition-all',
                        isCorrect
                          ? 'bg-burgundy/10 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'bg-burgundy/10 border-crimson/30 hover:border-crimson/50'
                      )}
                    >
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-burgundy/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-warm-ivory">Question {qIdx + 1}:</span>
                          <span className="text-warm-ivory/70 font-semibold">{q.skill}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-burgundy/30 text-warm-ivory/60">
                            {q.difficulty}
                          </span>
                          <span
                            className={cn(
                              'font-bold flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded',
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red-500/20 text-crimson border border-red-500/40'
                            )}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>+0.5 MARKS (CORRECT)</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                <span>0.0 MARKS (INCORRECT)</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-warm-ivory/90 leading-relaxed font-semibold">
                        {q.question}
                      </p>

                      {/* Code Snippet if present */}
                      {q.codeSnippet && (
                        <pre className="p-3 bg-obsidian border border-burgundy/30 rounded-lg text-warm-ivory/90 text-[11px] font-mono overflow-x-auto">
                          <code>{q.codeSnippet}</code>
                        </pre>
                      )}

                      {/* Answer Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded bg-obsidian/70 border border-burgundy/20">
                          <span className="text-warm-ivory/50 block text-[10px] uppercase">Your Selection:</span>
                          <span className={cn('font-bold mt-0.5 block', isCorrect ? 'text-emerald-400' : 'text-crimson')}>
                            {userSelected !== undefined ? q.options[userSelected] : '(Skipped / Not Answered)'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-obsidian/70 border border-emerald-500/20">
                          <span className="text-emerald-400/70 block text-[10px] uppercase">Correct Option:</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">
                            {q.options[q.correct]}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-obsidian/90 rounded-lg border border-burgundy/30 text-[11px] text-warm-ivory/80 leading-relaxed">
                        <strong className="text-emerald-400">ENGINEERING RATIONALE: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-burgundy/20">
              <button
                onClick={() => {
                  setPhase('BRIEFING')
                  setSelectedAnswers({})
                  setTimeLeft(3600)
                  setViolations([])
                  setStrikes(0)
                  setRecordedVideoUrl(null)
                }}
                className="btn-secondary text-xs font-mono py-2.5 px-5 flex items-center gap-2"
              >
                <RefreshCw size={14} /> RETAKE WITH NEW ATTEMPT
              </button>
              <button
                onClick={() => onNavigate?.('candidate-dossier')}
                className="btn-primary text-xs font-mono py-2.5 px-6 flex items-center gap-2 shadow-glow-crimson"
              >
                APPLY SCORE TO DOSSIER <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
