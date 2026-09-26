import React, { useEffect, useRef } from 'react'

// Distinct official offer letter dossier templates
interface OfferLetterData {
  title: string
  role: string
  department: string
  salary: string
  refCode: string
  sealText: string
  sealType: 'circle' | 'boxed'
  accentTone: string
}

const DOSSIER_TEMPLATES: OfferLetterData[] = [
  {
    title: 'OFFER OF APPOINTMENT',
    role: 'CYBERSECURITY OPERATIVE',
    department: 'DEFENSE ARCHITECTURE',
    salary: '₹38,50,000 / YR',
    refCode: 'LCDR-SEC-8821',
    sealText: 'APPROVED // HQ',
    sealType: 'circle',
    accentTone: '#8b1525',
  },
  {
    title: 'OPERATIVE CLEARANCE',
    role: 'NEURAL AI ARCHITECT',
    department: 'TACTICAL COGNITION',
    salary: '₹45,00,000 / YR',
    refCode: 'LCDR-AI-4092',
    sealText: 'CLASSIFIED // VIP',
    sealType: 'boxed',
    accentTone: '#7c1220',
  },
  {
    title: 'EMPLOYMENT DOSSIER',
    role: 'QUANTUM SYSTEMS ENGINEER',
    department: 'INFRASTRUCTURE ROOT',
    salary: '₹42,00,000 / YR',
    refCode: 'LCDR-SYS-3301',
    sealText: 'VERIFIED // EXEC',
    sealType: 'circle',
    accentTone: '#941b2c',
  },
  {
    title: 'OFFER OF APPOINTMENT',
    role: 'STRATEGIC TALENT ANALYST',
    department: 'HUMAN RECONNAISSANCE',
    salary: '₹28,50,000 / YR',
    refCode: 'LCDR-HR-1904',
    sealText: 'CONFIRMED // PROF',
    sealType: 'circle',
    accentTone: '#801323',
  },
  {
    title: 'TACTICAL RECRUITMENT',
    role: 'DEFENSE PLATFORM ENGINEER',
    department: 'CORE CRYPTOGRAPHY',
    salary: '₹34,00,000 / YR',
    refCode: 'LCDR-DEV-7712',
    sealText: 'AUTHORIZED // LCDR',
    sealType: 'boxed',
    accentTone: '#8b1525',
  },
  {
    title: 'EXECUTIVE APPOINTMENT',
    role: 'CHIEF DEFENSE STRATEGIST',
    department: 'WAR ROOM COMMAND',
    salary: '₹62,00,000 / YR',
    refCode: 'LCDR-EXEC-001',
    sealText: 'TOP SECRET // LVL 5',
    sealType: 'circle',
    accentTone: '#6d101d',
  },
]

type PaperState = 'FALLING' | 'HOVERING' | 'GRABBED' | 'RELEASING'

// Centralized physics tuning parameters
const PHYSICS_CONFIG = {
  // Gravity & terminal drift
  BASE_SPEED_MIN: 42,
  BASE_SPEED_MAX: 78,
  AIR_DRAG: 0.965,
  ROTATION_DRAG: 0.93,

  // Environmental wind
  WIND_FREQUENCY: 0.12,
  WIND_STRENGTH: 16,

  // Physical hover impulse & spring tuning
  AIR_DISTURB_RADIUS: 135, // px influence zone
  MAX_AIR_DISP_X: 14.5, // 8-14px max displacement (+45% increase)
  MAX_AIR_DISP_Y: 10.5, // 6-10px max displacement (+40% increase)
  MAX_AIR_ROT: 8.5, // 3-8 deg max rotation (+42% increase)
  HOVER_COOLDOWN_MS: 260, // min ms between strong impulses

  // Grab & dragging
  GRAB_SPRING: 0.28, // smooth physical lag factor per frame
  DRAG_TILT_FACTOR: 0.12, // degrees per px/s
  MAX_DRAG_TILT: 24, // maximum degrees of tilt
  MAX_THROW_VELOCITY: 460, // clamped release velocity px/s

  // Smooth zoom limits
  MIN_SCALE: 0.70,
  MAX_SCALE: 2.00,
  ZOOM_LERP: 0.18,
}

// Internal physics model for each active document in the reusable pool
interface PaperPhysicsItem {
  id: number
  template: OfferLetterData
  zone: 'left' | 'right'

  // Position in px
  x: number
  y: number
  vx: number
  vy: number

  // Natural aerodynamic parameters
  baseSpeed: number
  driftAmp: number
  driftFreq: number
  driftPhase: number
  flutterFreq: number
  flutterPhase: number

  // 3D Rotations
  rotZ: number
  rotZBase: number
  rotZAmp: number
  rotX: number
  rotY: number
  rotXAmp: number
  rotYAmp: number
  vRotZ: number

  // Scale
  scale: number
  naturalScale: number
  targetScale: number

  // Visual appearance
  opacity: number
  baseOpacity: number
  shadowBlur: number
  liftZ: number

  // State & interaction
  state: PaperState
  isHovered: boolean

  // Physical air disturbance (damped spring-mass state)
  airDispX: number
  airDispY: number
  airDispVx: number
  airDispVy: number
  airRotZ: number
  airRotVz: number

  // Individuality & cooldown tracking
  lastImpulseTime: number
  wasDirectHover: boolean
  wasInProximity: boolean
  impulseMult: number
  rotMult: number
  springK: number
  dampingC: number

  // Grab offset relative to center of paper
  grabOffsetX: number
  grabOffsetY: number

  width: number
  height: number
}

// Generate pool item with randomized independent phase and aerodynamic properties
function createPaperItem(
  id: number,
  initialY: number,
  forceZone?: 'left' | 'right',
  vw: number = typeof window !== 'undefined' ? window.innerWidth : 1200
): PaperPhysicsItem {
  const zone = forceZone || (id % 2 === 0 ? 'left' : 'right')

  // Left zone spans 2% to 20% of viewport width
  // Right zone spans 80% to 98% of viewport width
  // Center is strictly protected so login form remains clean
  const xNorm = zone === 'left'
    ? 0.02 + Math.random() * 0.18
    : 0.80 + Math.random() * 0.18

  const template = DOSSIER_TEMPLATES[id % DOSSIER_TEMPLATES.length]
  const naturalScale = 0.68 + Math.random() * 0.20
  const baseOpacity = 0.16 + Math.random() * 0.16
  const baseSpeed = PHYSICS_CONFIG.BASE_SPEED_MIN + Math.random() * (PHYSICS_CONFIG.BASE_SPEED_MAX - PHYSICS_CONFIG.BASE_SPEED_MIN)

  return {
    id,
    template,
    zone,
    x: xNorm * vw,
    y: initialY,
    vx: 0,
    vy: baseSpeed,
    baseSpeed,
    driftAmp: 16 + Math.random() * 24,
    driftFreq: 0.20 + Math.random() * 0.22,
    driftPhase: Math.random() * Math.PI * 2,
    flutterFreq: 0.60 + Math.random() * 0.50,
    flutterPhase: Math.random() * Math.PI * 2,
    rotZ: (Math.random() - 0.5) * 22,
    rotZBase: (Math.random() - 0.5) * 22,
    rotZAmp: 8 + Math.random() * 10,
    rotX: 0,
    rotY: 0,
    rotXAmp: 16 + Math.random() * 14,
    rotYAmp: 12 + Math.random() * 12,
    vRotZ: 0,
    scale: naturalScale,
    naturalScale,
    targetScale: naturalScale,
    opacity: baseOpacity,
    baseOpacity,
    shadowBlur: 14,
    liftZ: 0,
    state: 'FALLING',
    isHovered: false,
    airDispX: 0,
    airDispY: 0,
    airDispVx: 0,
    airDispVy: 0,
    airRotZ: 0,
    airRotVz: 0,
    lastImpulseTime: 0,
    wasDirectHover: false,
    wasInProximity: false,
    impulseMult: 0.90 + Math.random() * 0.30, // 0.90x to 1.20x individual variation
    rotMult: 0.90 + Math.random() * 0.30,
    springK: 360 + (Math.random() - 0.5) * 50, // 335 to 385 (allows crisp 8-14px peak deflection)
    dampingC: 11.8 + (Math.random() - 0.5) * 1.8, // 10.9 to 12.7 (under-damped ζ ≈ 0.31, 2-4 visible oscillations, settles in 400-650ms)
    grabOffsetX: 0,
    grabOffsetY: 0,
    width: 148,
    height: 198,
  }
}

// Recycle paper cleanly once offscreen without accumulating DOM nodes or piles
function recyclePaper(item: PaperPhysicsItem, vw: number, _vh: number) {
  item.y = -220 - Math.random() * 140
  item.zone = Math.random() < 0.5 ? 'left' : 'right'
  const xNorm = item.zone === 'left'
    ? 0.02 + Math.random() * 0.18
    : 0.80 + Math.random() * 0.18
  item.x = xNorm * vw
  item.vx = 0
  item.vy = item.baseSpeed
  item.vRotZ = 0
  item.rotZ = item.rotZBase
  item.rotX = 0
  item.rotY = 0
  item.scale = item.naturalScale
  item.targetScale = item.naturalScale
  item.opacity = item.baseOpacity
  item.state = 'FALLING'
  item.driftPhase = Math.random() * Math.PI * 2
  item.flutterPhase = Math.random() * Math.PI * 2
  item.airDispX = 0
  item.airDispY = 0
  item.airDispVx = 0
  item.airDispVy = 0
  item.airRotZ = 0
  item.airRotVz = 0
  item.lastImpulseTime = 0
  item.wasDirectHover = false
  item.wasInProximity = false
}

export const FallingOfferLetters: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const physicsItemsRef = useRef<PaperPhysicsItem[]>([])
  const activeGrabbedIdRef = useRef<number | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Cursor tracking & recent velocity buffer
  const cursorPos = useRef({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    lastTime: 0,
  })
  const pointerHistory = useRef<{ x: number; y: number; time: number }[]>([])

  // Helper to release grabbed paper safely back to physics
  const releasePaper = (item: PaperPhysicsItem) => {
    if (item.state !== 'GRABBED') return

    const now = performance.now()
    const history = pointerHistory.current.filter((p) => now - p.time <= 140)
    let throwVx = 0
    let throwVy = 0

    if (history.length >= 2) {
      const first = history[0]
      const last = history[history.length - 1]
      const dt = Math.max((last.time - first.time) / 1000, 0.02)
      throwVx = ((last.x - first.x) / dt) * 0.55
      throwVy = ((last.y - first.y) / dt) * 0.55
    }

    item.vx = Math.max(
      -PHYSICS_CONFIG.MAX_THROW_VELOCITY,
      Math.min(PHYSICS_CONFIG.MAX_THROW_VELOCITY, throwVx)
    )
    item.vy = Math.max(
      -PHYSICS_CONFIG.MAX_THROW_VELOCITY * 0.6,
      Math.min(PHYSICS_CONFIG.MAX_THROW_VELOCITY, throwVy)
    )
    item.vRotZ = Math.max(-14, Math.min(14, item.vx * 0.04))

    item.state = 'RELEASING'
    item.airDispX = 0
    item.airDispY = 0
    item.airDispVx = 0
    item.airDispVy = 0
    item.airRotZ = 0
    item.airRotVz = 0
    item.lastImpulseTime = performance.now()
    activeGrabbedIdRef.current = null
    item.targetScale = item.naturalScale
  }

  // Pointer event handlers for each individual paper
  const handlePointerDown = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()

    // If another paper was grabbed, release it first
    if (activeGrabbedIdRef.current !== null && activeGrabbedIdRef.current !== id) {
      const prev = physicsItemsRef.current.find((it) => it.id === activeGrabbedIdRef.current)
      if (prev) releasePaper(prev)
    }

    const item = physicsItemsRef.current.find((it) => it.id === id)
    if (!item) return

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore if pointer capture is unavailable
    }

    activeGrabbedIdRef.current = id
    item.state = 'GRABBED'

    cursorPos.current.x = e.clientX
    cursorPos.current.y = e.clientY
    cursorPos.current.vx = 0
    cursorPos.current.vy = 0

    // Store grab offset relative to center of paper
    const centerX = item.x + item.width / 2
    const centerY = item.y + item.height / 2
    item.grabOffsetX = e.clientX - centerX
    item.grabOffsetY = e.clientY - centerY

    // Zero out velocity & air disturbance
    item.vx = 0
    item.vy = 0
    item.vRotZ = 0
    item.airDispX = 0
    item.airDispY = 0
    item.airDispVx = 0
    item.airDispVy = 0
    item.airRotZ = 0
    item.airRotVz = 0

    item.targetScale = Math.min(PHYSICS_CONFIG.MAX_SCALE, item.scale * 1.08)
  }

  const handlePointerUp = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }

    const item = physicsItemsRef.current.find((it) => it.id === id)
    if (item && item.state === 'GRABBED') {
      releasePaper(item)
    }
  }

  const handlePointerCancel = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }

    const item = physicsItemsRef.current.find((it) => it.id === id)
    if (item) {
      releasePaper(item)
    }
  }

  const handlePointerEnter = (id: number) => {
    const item = physicsItemsRef.current.find((it) => it.id === id)
    if (!item || item.state === 'GRABBED') return
    item.isHovered = true
  }

  const handlePointerLeave = (id: number) => {
    const item = physicsItemsRef.current.find((it) => it.id === id)
    if (!item) return
    item.isHovered = false
  }

  // Global window listeners for wheel zoom & cursor tracking
  useEffect(() => {
    // 1. Mouse wheel zoom — ONLY active while a paper is grabbed
    const handleWheel = (e: WheelEvent) => {
      const grabbedId = activeGrabbedIdRef.current
      if (grabbedId === null) {
        // No paper grabbed -> allow normal webpage scroll!
        return
      }

      // Grabbed paper active -> prevent webpage scroll and zoom paper
      e.preventDefault()

      const item = physicsItemsRef.current.find((it) => it.id === grabbedId)
      if (!item) return

      // Wheel UP (deltaY < 0) = Zoom IN; Wheel DOWN (deltaY > 0) = Zoom OUT
      const delta = -e.deltaY * 0.0016
      item.targetScale = Math.min(
        PHYSICS_CONFIG.MAX_SCALE,
        Math.max(PHYSICS_CONFIG.MIN_SCALE, item.targetScale + delta)
      )
    }

    // 2. Continuous pointer position & velocity tracking
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max((now - cursorPos.current.lastTime) / 1000, 0.008)
      cursorPos.current.lastTime = now

      if (cursorPos.current.x > -9000) {
        const rawVx = (e.clientX - cursorPos.current.x) / dt
        const rawVy = (e.clientY - cursorPos.current.y) / dt
        cursorPos.current.vx = cursorPos.current.vx * 0.6 + rawVx * 0.4
        cursorPos.current.vy = cursorPos.current.vy * 0.6 + rawVy * 0.4
      }
      cursorPos.current.x = e.clientX
      cursorPos.current.y = e.clientY

      pointerHistory.current.push({ x: e.clientX, y: e.clientY, time: now })
      const cutoff = now - 140
      pointerHistory.current = pointerHistory.current.filter((p) => p.time >= cutoff)
    }

    // Safety fallback on window blur / global pointer release
    const handleWindowPointerUp = () => {
      if (activeGrabbedIdRef.current !== null) {
        const item = physicsItemsRef.current.find((it) => it.id === activeGrabbedIdRef.current)
        if (item) releasePaper(item)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
    window.addEventListener('blur', handleWindowPointerUp)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
      window.removeEventListener('blur', handleWindowPointerUp)
    }
  }, [])

  // Physics simulation loop
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth < 1024
    const poolSize = isMobile ? 4 : isTablet ? 8 : 12

    const vw = window.innerWidth || 1200
    const vh = window.innerHeight || 800

    // Pre-populate pool staggered across vertical screen space
    const items: PaperPhysicsItem[] = []
    for (let i = 0; i < poolSize; i++) {
      const staggeredY = (i / poolSize) * (vh + 160) - 160 + (Math.random() - 0.5) * 80
      const zone = i % 2 === 0 ? 'left' : 'right'
      items.push(createPaperItem(i, staggeredY, zone, vw))
    }
    physicsItemsRef.current = items

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      items.forEach((item, index) => {
        const el = itemElementsRef.current[index]
        if (!el) return
        el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotZBase}deg) scale(${item.scale})`
        el.style.opacity = `${item.opacity * 0.8}`
      })
      return
    }

    lastTimeRef.current = performance.now()

    const animate = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05) // cap dt at 50ms
      lastTimeRef.current = now

      const currentVw = window.innerWidth
      const currentVh = window.innerHeight
      const nowSec = now / 1000

      // Slowly varying ambient wind force
      const ambientWind =
        Math.sin(nowSec * PHYSICS_CONFIG.WIND_FREQUENCY * Math.PI * 2) * PHYSICS_CONFIG.WIND_STRENGTH +
        Math.cos(nowSec * (PHYSICS_CONFIG.WIND_FREQUENCY * 1.8) * Math.PI * 2) *
          (PHYSICS_CONFIG.WIND_STRENGTH * 0.35)

      const curX = cursorPos.current.x
      const curY = cursorPos.current.y
      const currentItems = physicsItemsRef.current

      // Decay cursor velocity if mouse has stopped moving (ensures paper settles when cursor stops)
      const timeSinceCursorMove = (now - cursorPos.current.lastTime) / 1000
      if (timeSinceCursorMove > 0.04) {
        const decay = Math.pow(0.04, dt * 15)
        cursorPos.current.vx *= decay
        cursorPos.current.vy *= decay
        if (Math.abs(cursorPos.current.vx) < 0.5) cursorPos.current.vx = 0
        if (Math.abs(cursorPos.current.vy) < 0.5) cursorPos.current.vy = 0
      }

      // Responsive active count
      const activeCount = currentVw < 768 ? 4 : currentVw < 1024 ? 8 : 12

      for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i]
        const el = itemElementsRef.current[i]
        if (!el) continue

        if (i >= activeCount) {
          el.style.display = 'none'
          continue
        } else {
          el.style.display = 'block'
        }

        // ============================================
        // 1. GRABBED STATE — User holding paper
        // ============================================
        if (item.state === 'GRABBED') {
          // Desired center position following cursor
          const targetCenterX = curX - item.grabOffsetX
          const targetCenterY = curY - item.grabOffsetY
          const targetX = targetCenterX - item.width / 2
          const targetY = targetCenterY - item.height / 2

          // Smooth spring-like physical lag
          item.x += (targetX - item.x) * PHYSICS_CONFIG.GRAB_SPRING
          item.y += (targetY - item.y) * PHYSICS_CONFIG.GRAB_SPRING

          // Horizontal cursor speed tilts the paper realistically
          const dragTilt = Math.max(
            -PHYSICS_CONFIG.MAX_DRAG_TILT,
            Math.min(PHYSICS_CONFIG.MAX_DRAG_TILT, cursorPos.current.vx * PHYSICS_CONFIG.DRAG_TILT_FACTOR)
          )
          item.rotZ += (dragTilt - item.rotZ) * 0.16

          // Pitch and roll tilt based on cursor velocity
          const targetPitch = Math.max(-14, Math.min(14, cursorPos.current.vy * 0.035))
          const targetRoll = Math.max(-14, Math.min(14, -cursorPos.current.vx * 0.035))
          item.rotX += (targetPitch - item.rotX) * 0.14
          item.rotY += (targetRoll - item.rotY) * 0.14

          // Smooth scale zoom toward targetScale
          const prevScale = item.scale
          item.scale += (item.targetScale - item.scale) * PHYSICS_CONFIG.ZOOM_LERP

          // Preserve anchor under cursor while zooming
          if (prevScale > 0 && Math.abs(item.scale - prevScale) > 0.0001) {
            const ratio = item.scale / prevScale
            item.grabOffsetX *= ratio
            item.grabOffsetY *= ratio
          }

          // Increased prominence while held
          item.opacity += (0.92 - item.opacity) * 0.15
          item.shadowBlur = 32
          item.liftZ = 18

          // Elevate z-index while held so it can be inspected without being clipped
          el.style.zIndex = '35'
          el.style.cursor = 'grabbing'

          // Apply hardware-accelerated 3D transform
          el.style.transform = `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, 0) perspective(650px) rotateX(${item.rotX.toFixed(1)}deg) rotateY(${item.rotY.toFixed(1)}deg) rotateZ(${item.rotZ.toFixed(1)}deg) scale(${item.scale.toFixed(3)})`
          el.style.opacity = `${item.opacity.toFixed(2)}`
          el.style.filter = `drop-shadow(0 ${Math.round(16 + item.liftZ)}px ${Math.round(item.shadowBlur)}px rgba(0, 0, 0, 0.65))`

          continue
        }

        // ============================================
        // 2. NON-GRABBED STATES ('FALLING' | 'RELEASING' | 'HOVERING')
        // ============================================
        el.style.zIndex = '2'
        el.style.cursor = 'grab'

        // Scale smoothly relaxes back toward natural scale
        item.scale += (item.naturalScale - item.scale) * 0.03
        item.targetScale = item.scale

        // Opacity relaxes back to ambient atmospheric level
        item.opacity += (item.baseOpacity - item.opacity) * 0.05
        item.shadowBlur += (14 - item.shadowBlur) * 0.08
        item.liftZ += (0 - item.liftZ) * 0.08

        if (item.state === 'RELEASING') {
          // Air resistance damps throw velocities
          item.vx *= Math.pow(PHYSICS_CONFIG.AIR_DRAG, dt * 60)
          item.vy += (item.baseSpeed - item.vy) * 0.08
          item.vRotZ *= Math.pow(PHYSICS_CONFIG.ROTATION_DRAG, dt * 60)
          item.rotZ += item.vRotZ * dt * 60

          if (Math.abs(item.vy - item.baseSpeed) < 6 && Math.abs(item.vx) < 12) {
            item.state = 'FALLING'
          }
        } else {
          // Natural downward falling
          item.vy += (item.baseSpeed - item.vy) * 0.08
          item.vx *= Math.pow(PHYSICS_CONFIG.AIR_DRAG, dt * 60)
        }

        // Advance position with gravity, drift & ambient wind
        item.y += item.vy * dt
        item.x += (item.vx + ambientWind) * dt

        // Natural aerodynamic sway & flutter
        const flutterZ = Math.sin(nowSec * item.flutterFreq * Math.PI * 2 + item.flutterPhase) * item.rotZAmp
        const pitchX = Math.cos(nowSec * item.flutterFreq * Math.PI * 2 + item.flutterPhase) * item.rotXAmp
        const rollY = Math.sin(nowSec * (item.flutterFreq * 0.75) * Math.PI * 2 + item.flutterPhase) * item.rotYAmp

        const naturalRotZ = item.rotZBase + flutterZ
        item.rotZ += (naturalRotZ - item.rotZ) * 0.08
        item.rotX += (pitchX - item.rotX) * 0.1
        item.rotY += (rollY - item.rotY) * 0.1

        // ============================================
        // 3. CURSOR AIR DISTURBANCE & HOVER JIGGLE IMPULSE
        // ============================================
        const paperCenterX = item.x + item.width / 2
        const paperCenterY = item.y + item.height / 2
        const distX = paperCenterX - curX
        const distY = paperCenterY - curY
        const dist = Math.hypot(distX, distY)

        // Check interaction zones:
        // LEVEL 2 — DIRECT HOVER (cursor inside paper bounding box)
        // LEVEL 1 — PROXIMITY (cursor within disturbance radius)
        const isDirectHover =
          Math.abs(distX) < (item.width * item.scale * 0.55) &&
          Math.abs(distY) < (item.height * item.scale * 0.55)
        const inProximity = dist < PHYSICS_CONFIG.AIR_DISTURB_RADIUS && dist > 1

        const cVx = cursorPos.current.vx
        const cVy = cursorPos.current.vy
        const cSpeed = Math.hypot(cVx, cVy)
        const timeSinceLastImpulse = now - item.lastImpulseTime

        if (isDirectHover) {
          const justEnteredHover = !item.wasDirectHover
          const significantMotion = cSpeed > 130 && timeSinceLastImpulse > 320

          if ((justEnteredHover && timeSinceLastImpulse > PHYSICS_CONFIG.HOVER_COOLDOWN_MS) || significantMotion) {
            // Level 2: Direct Hover Impulse (produces 8–14px displacement, 3–8° tilt, 2–4 damped oscillations)
            const baseImpulse = justEnteredHover ? 260 : 170
            const speedComponent = Math.min(cSpeed, 550) * 0.42
            const impulseMag = (baseImpulse + speedComponent) * item.impulseMult

            // Direction from cursor movement or cursor-to-paper vector
            let impDirX = distX !== 0 ? distX / (Math.abs(distX) + 1) : 1
            let impDirY = distY !== 0 ? distY / (Math.abs(distY) + 1) : 0.4
            if (cSpeed > 35) {
              impDirX = cVx / cSpeed
              impDirY = cVy / cSpeed
            }

            // Apply velocity kick (impulse)
            item.airDispVx += impDirX * impulseMag
            item.airDispVy += impDirY * impulseMag * 0.65
            item.airRotVz += (impDirX * 36 + (Math.random() - 0.5) * 14) * item.rotMult

            item.lastImpulseTime = now
          }
        } else if (inProximity) {
          const justEnteredProximity = !item.wasInProximity
          if (justEnteredProximity && timeSinceLastImpulse > 350) {
            // Level 1: Proximity Disturbance (subtle 2–4px nudge)
            const proxMag = (95 + Math.min(cSpeed, 380) * 0.24) * item.impulseMult
            const dirX = distX / dist
            const dirY = distY / dist

            item.airDispVx += dirX * proxMag
            item.airDispVy += dirY * proxMag * 0.6
            item.airRotVz += dirX * 14.0 * item.rotMult

            item.lastImpulseTime = now
          }
        }

        item.wasDirectHover = isDirectHover
        item.wasInProximity = inProximity

        // Symplectic Euler integration of 2nd-order damped harmonic oscillator
        const dtSpring = Math.min(dt, 0.033)
        const springAccX = -item.springK * item.airDispX - item.dampingC * item.airDispVx
        const springAccY = -item.springK * item.airDispY - item.dampingC * item.airDispVy
        const springAccRot = -item.springK * item.airRotZ - item.dampingC * item.airRotVz

        item.airDispVx += springAccX * dtSpring
        item.airDispVy += springAccY * dtSpring
        item.airRotVz += springAccRot * dtSpring

        item.airDispX += item.airDispVx * dtSpring
        item.airDispY += item.airDispVy * dtSpring
        item.airRotZ += item.airRotVz * dtSpring

        // Strict physical clamping to preserve tasteful bounds (8–14px, 3–8 deg)
        item.airDispX = Math.max(-PHYSICS_CONFIG.MAX_AIR_DISP_X, Math.min(PHYSICS_CONFIG.MAX_AIR_DISP_X, item.airDispX))
        item.airDispY = Math.max(-PHYSICS_CONFIG.MAX_AIR_DISP_Y, Math.min(PHYSICS_CONFIG.MAX_AIR_DISP_Y, item.airDispY))
        item.airRotZ = Math.max(-PHYSICS_CONFIG.MAX_AIR_ROT, Math.min(PHYSICS_CONFIG.MAX_AIR_ROT, item.airRotZ))

        // Settling threshold: when oscillation reaches microscopic levels, snap cleanly to rest
        if (Math.abs(item.airDispX) < 0.05 && Math.abs(item.airDispVx) < 1.0) {
          item.airDispX = 0
          item.airDispVx = 0
        }
        if (Math.abs(item.airDispY) < 0.05 && Math.abs(item.airDispVy) < 1.0) {
          item.airDispY = 0
          item.airDispVy = 0
        }
        if (Math.abs(item.airRotZ) < 0.05 && Math.abs(item.airRotVz) < 1.0) {
          item.airRotZ = 0
          item.airRotVz = 0
        }

        // Render transforms with subtle air disturbance and optional micro-skew
        const renderX = item.x + item.airDispX
        const renderY = item.y + item.airDispY
        const renderRotZ = item.rotZ + item.airRotZ
        const skewX = Math.max(-1.8, Math.min(1.8, -item.airRotZ * 0.35))

        el.style.transform = `translate3d(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px, 0) perspective(650px) rotateX(${item.rotX.toFixed(1)}deg) rotateY(${item.rotY.toFixed(1)}deg) rotateZ(${renderRotZ.toFixed(1)}deg) skewX(${skewX.toFixed(2)}deg) scale(${item.scale.toFixed(3)})`
        el.style.opacity = `${item.opacity.toFixed(2)}`
        el.style.filter = `drop-shadow(0 ${Math.round(8 + item.liftZ)}px ${Math.round(item.shadowBlur)}px rgba(0, 0, 0, ${item.opacity > 0.4 ? 0.65 : 0.42}))`

        // Check for recycling offscreen
        if (item.y > currentVh + 220 || item.x < -240 || item.x > currentVw + 240) {
          recyclePaper(item, currentVw, currentVh)
        }
      }

      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // Static pool generation for DOM elements (desktop 12 items)
  const pool =
    physicsItemsRef.current.length > 0
      ? physicsItemsRef.current
      : Array.from({ length: 12 }, (_, i) => createPaperItem(i, -300))

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {pool.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => {
            itemElementsRef.current[index] = el
          }}
          onPointerDown={(e) => handlePointerDown(item.id, e)}
          onPointerUp={(e) => handlePointerUp(item.id, e)}
          onPointerCancel={(e) => handlePointerCancel(item.id, e)}
          onPointerEnter={() => handlePointerEnter(item.id)}
          onPointerLeave={() => handlePointerLeave(item.id)}
          className="absolute top-0 left-0 will-change-transform pointer-events-auto cursor-grab touch-none select-none"
          style={{
            width: '148px',
            height: '198px',
            transform: `translate3d(-999px, -999px, 0) scale(${item.scale})`,
            opacity: item.opacity,
            transformOrigin: 'center center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Authentic Heist Employment Offer Letter Document */}
          <div
            className="w-full h-full rounded-[3px] p-2.5 box-border flex flex-col justify-between relative shadow-lg pointer-events-none"
            style={{
              backgroundColor: '#f6f3eb',
              color: '#1a1c20',
              border: '1px solid rgba(139, 21, 37, 0.28)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 0 12px rgba(180, 160, 130, 0.15)',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {/* Top Security Header */}
            <div>
              <div className="flex items-center justify-between border-b border-black/15 pb-1 mb-1">
                <span className="text-[7.5px] font-bold tracking-wider text-crimson uppercase font-heading">
                  LA CASA DE ROZGAAR
                </span>
                <span className="text-[6px] tracking-widest text-black/60 font-mono">
                  {item.template.refCode}
                </span>
              </div>
              <div className="text-[6.5px] font-bold tracking-tight text-black/80 uppercase text-center mt-0.5">
                {item.template.title}
              </div>
            </div>

            {/* Document Details */}
            <div className="my-1 space-y-1">
              <div>
                <div className="text-[5.5px] uppercase tracking-wider text-black/50">POSITION:</div>
                <div className="text-[7px] font-bold leading-tight text-black/90 truncate">
                  {item.template.role}
                </div>
              </div>
              <div>
                <div className="text-[5.5px] uppercase tracking-wider text-black/50">CTC APPROVED:</div>
                <div className="text-[7.5px] font-bold font-mono text-crimson tracking-tight">
                  {item.template.salary}
                </div>
              </div>

              {/* Faint simulation lines representing legal clauses */}
              <div className="space-y-0.5 pt-0.5 opacity-40">
                <div className="h-[1.5px] bg-black/40 rounded-full w-full" />
                <div className="h-[1.5px] bg-black/40 rounded-full w-5/6" />
                <div className="h-[1.5px] bg-black/40 rounded-full w-4/6" />
              </div>
            </div>

            {/* Tactical Stamp / Seal */}
            <div
              className="absolute right-2 bottom-6 pointer-events-none transform -rotate-12"
              style={{ opacity: 0.85 }}
            >
              {item.template.sealType === 'circle' ? (
                <div
                  className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center text-center p-0.5"
                  style={{
                    borderColor: item.template.accentTone,
                    color: item.template.accentTone,
                  }}
                >
                  <span className="text-[5.5px] font-extrabold uppercase leading-none tracking-tight">
                    {item.template.sealText}
                  </span>
                </div>
              ) : (
                <div
                  className="px-1.5 py-0.5 border border-dashed text-center"
                  style={{
                    borderColor: item.template.accentTone,
                    color: item.template.accentTone,
                  }}
                >
                  <span className="text-[5.5px] font-extrabold uppercase leading-none tracking-wider">
                    {item.template.sealText}
                  </span>
                </div>
              )}
            </div>

            {/* Authorized Signature Bottom Bar */}
            <div className="border-t border-black/15 pt-1 flex items-end justify-between text-[5.5px] text-black/60">
              <div>
                <div className="font-serif italic text-[7px] text-black/75 -mb-0.5 tracking-wide">
                  The Professor
                </div>
                <div className="text-[5px] uppercase tracking-tighter opacity-70">
                  CHIEF ARCHITECT // LCDR
                </div>
              </div>
              <div className="text-[5px] font-mono tracking-tighter text-black/40">
                SEC-PASS: OK
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
