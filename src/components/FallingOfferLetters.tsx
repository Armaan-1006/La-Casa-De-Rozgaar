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

// Internal physics model for each active document in the reusable pool
interface PaperPhysicsItem {
  id: number
  template: OfferLetterData
  zone: 'left' | 'right'
  xNorm: number // 0 to 1 normalized horizontal center anchor
  y: number // absolute px position
  baseSpeed: number // px per second
  driftAmp: number // px amplitude
  driftFreq: number // Hz
  driftPhase: number // radians
  flutterFreq: number // Hz
  flutterPhase: number // radians
  rotZBase: number // base angle in deg
  rotZAmp: number // oscillation deg
  rotXAmp: number // pitch oscillation deg
  rotYAmp: number // roll oscillation deg
  scale: number
  opacity: number
}

// Generate pool item with randomized independent phase and aerodynamic properties
function createPaperItem(id: number, initialY: number, forceZone?: 'left' | 'right'): PaperPhysicsItem {
  const zone = forceZone || (id % 2 === 0 ? 'left' : 'right')
  
  // Left zone spans 1.5% to 21% of viewport width
  // Right zone spans 79% to 98% of viewport width
  // Center (22% to 78%) is strictly protected so login form remains clean
  const xNorm = zone === 'left'
    ? 0.02 + Math.random() * 0.18
    : 0.80 + Math.random() * 0.18

  const template = DOSSIER_TEMPLATES[id % DOSSIER_TEMPLATES.length]

  return {
    id,
    template,
    zone,
    xNorm,
    y: initialY,
    baseSpeed: 42 + Math.random() * 38, // 42 to 80 px/sec (gentle terminal velocity)
    driftAmp: 16 + Math.random() * 24, // 16 to 40 px horizontal drift
    driftFreq: 0.22 + Math.random() * 0.25, // slow fluid wave
    driftPhase: Math.random() * Math.PI * 2,
    flutterFreq: 0.65 + Math.random() * 0.55, // flutter oscillation
    flutterPhase: Math.random() * Math.PI * 2,
    rotZBase: (Math.random() - 0.5) * 24, // -12 to +12 deg base tilt
    rotZAmp: 8 + Math.random() * 10, // ±8 to ±18 deg Z flutter
    rotXAmp: 18 + Math.random() * 16, // ±18 to ±34 deg pitch
    rotYAmp: 12 + Math.random() * 14, // ±12 to ±26 deg roll
    scale: 0.68 + Math.random() * 0.22, // 0.68 to 0.90 scale for depth layering
    opacity: 0.14 + Math.random() * 0.18, // 0.14 to 0.32 subtle atmospheric presence
  }
}

export const FallingOfferLetters: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const physicsItemsRef = useRef<PaperPhysicsItem[]>([])
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Initialize pool of documents with pre-spawned staggered vertical distribution
  useEffect(() => {
    // Detect mobile viewport to adjust pool density for 60 FPS performance
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth < 1024
    const poolSize = isMobile ? 4 : isTablet ? 8 : 12

    const vh = window.innerHeight || 800

    // Pre-populate items at staggered heights so screen is active immediately
    const items: PaperPhysicsItem[] = []
    for (let i = 0; i < poolSize; i++) {
      // Stagger vertical positions from -120px to vh * 0.95
      const staggeredY = (i / poolSize) * (vh + 150) - 150 + (Math.random() - 0.5) * 80
      const zone = i % 2 === 0 ? 'left' : 'right'
      items.push(createPaperItem(i, staggeredY, zone))
    }
    physicsItemsRef.current = items

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // If reduced motion is preferred, render statically and don't run RAF
    if (prefersReducedMotion) {
      items.forEach((item, index) => {
        const el = itemElementsRef.current[index]
        if (!el) return
        const xPx = item.xNorm * window.innerWidth
        el.style.transform = `translate3d(${xPx}px, ${item.y}px, 0) rotate(${item.rotZBase}deg) scale(${item.scale})`
        el.style.opacity = `${item.opacity * 0.8}`
      })
      return
    }

    lastTimeRef.current = performance.now()

    // Smooth aerodynamic RAF loop with delta time & ZERO React state updates
    const animate = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.06) // cap at 60ms to prevent jumping
      lastTimeRef.current = now

      const vw = window.innerWidth
      const currentVh = window.innerHeight

      const currentItems = physicsItemsRef.current

      for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i]
        const el = itemElementsRef.current[i]
        if (!el) continue

        // 1. Advance falling position
        item.y += item.baseSpeed * dt

        // 2. Continuous Loop Recycle Condition
        // When document exits completely past the bottom of the viewport
        if (item.y > currentVh + 180) {
          // Respawn safely above the screen
          item.y = -200 - Math.random() * 120
          // Alternate or randomize zone, keeping center strictly clear
          item.zone = Math.random() < 0.5 ? 'left' : 'right'
          item.xNorm = item.zone === 'left'
            ? 0.02 + Math.random() * 0.18
            : 0.80 + Math.random() * 0.18
          item.baseSpeed = 42 + Math.random() * 38
          item.driftPhase = Math.random() * Math.PI * 2
          item.flutterPhase = Math.random() * Math.PI * 2
        }

        // 3. Smooth Aerodynamic Flutter & Horizontal Drift Physics
        const timeSec = now / 1000
        const drift = Math.sin(timeSec * item.driftFreq * Math.PI * 2 + item.driftPhase) * item.driftAmp
        const flutterZ = Math.sin(timeSec * item.flutterFreq * Math.PI * 2 + item.flutterPhase) * item.rotZAmp
        const pitchX = Math.cos(timeSec * item.flutterFreq * Math.PI * 2 + item.flutterPhase) * item.rotXAmp
        const rollY = Math.sin(timeSec * (item.flutterFreq * 0.75) * Math.PI * 2 + item.flutterPhase) * item.rotYAmp

        const currentX = item.xNorm * vw + drift
        const currentRotZ = item.rotZBase + flutterZ

        // 4. Apply high-performance hardware-accelerated 3D transform directly
        el.style.transform = `translate3d(${currentX.toFixed(1)}px, ${item.y.toFixed(1)}px, 0) perspective(650px) rotateX(${pitchX.toFixed(1)}deg) rotateY(${rollY.toFixed(1)}deg) rotateZ(${currentRotZ.toFixed(1)}deg) scale(${item.scale})`
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

  // Static pool generation for initial DOM elements
  // Uses 12 reusable nodes for desktop (auto-managed in RAF)
  const pool = physicsItemsRef.current.length > 0
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
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: '148px',
            height: '198px',
            transform: `translate3d(-999px, -999px, 0) scale(${item.scale})`,
            opacity: item.opacity,
          }}
        >
          {/* Authentic Heist Employment Offer Letter Document */}
          <div
            className="w-full h-full rounded-[3px] p-2.5 box-border flex flex-col justify-between relative shadow-lg"
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
