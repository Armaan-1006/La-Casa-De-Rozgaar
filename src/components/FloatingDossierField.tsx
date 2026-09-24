import React, { useEffect, useRef, useState } from 'react'
import { offerLetterTemplate, currencyNoteAssets } from '../data/floatingAssets'
import { generateFloatingItems, FloatingItemDef } from '../data/floatingItems'
import { useTheme } from '../hooks/useTheme'

// Depth layer configuration
const depthConfig = {
  background: { scale: 0.6, opacity: 0.08, blur: '4px', parallax: 0.15 },
  mid: { scale: 0.8, opacity: 0.14, blur: '2px', parallax: 0.4 },
  foreground: { scale: 1.0, opacity: 0.20, blur: '0px', parallax: 0.7 }
}

// Motion configuration
const motionConfig = {
  duration: 12, // seconds for a full cycle
  // Different frequencies per axis to avoid synchronization
  freqX: 0.3,
  freqY: 0.2,
  freqZ: 0.15,
  freqRot: 0.25
}

// Amplitudes for floating motion
const floatAmplitude = {
  x: 12,   // pixels (reduced for subtlety)
  y: 10,   // pixels (reduced for subtlety)
  z: 0.03, // 3% scale change (reduced for subtlety)
  rot: 3   // degrees (reduced for subtlety)
}

// Amplitudes for mouse parallax
const parallaxAmplitude = {
  x: 25, // Adjusted for professional subtlety
  y: 18  // Adjusted for professional subtlety
}

export const FloatingDossierField: React.FC = () => {
  const { isDark } = useTheme()
  const [items] = useState<FloatingItemDef[]>(() => generateFloatingItems()) // stabilize items
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [lerpMousePos, setLerpMousePos] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  // Mouse tracking with LERP smoothing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      // Normalize to -1 to 1 within the viewport
      const x = ((e.clientX) / window.innerWidth) * 2 - 1
      const y = ((e.clientY) / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smooth LERP animation loop
  useEffect(() => {
    const start = performance.now()

    const animate = () => {
      // Smooth LERP towards target mouse position
      const lerpFactor = 0.12 // Reduced for smoother, more professional feel
      const lerpedX = lerpMousePos.x + (mousePos.x - lerpMousePos.x) * lerpFactor
      const lerpedY = lerpMousePos.y + (mousePos.y - lerpMousePos.y) * lerpFactor
      setLerpMousePos({ x: lerpedX, y: lerpedY })

      const elapsed = (performance.now() - start) / 1000 // in seconds
      const t = (elapsed % motionConfig.duration) / motionConfig.duration // 0-1

      // Update each item's transform
      itemRefs.current.forEach((itemEl, index) => {
        if (!itemEl) return
        const item = items[index]
        if (!item) return

        // Phase offset per item to avoid synchronization
        const phaseOffset = index * 0.5

        // Time-based floats
        const floatX = floatAmplitude.x * Math.sin(2 * Math.PI * motionConfig.freqX * t + phaseOffset)
        const floatY = floatAmplitude.y * Math.sin(2 * Math.PI * motionConfig.freqY * t + phaseOffset)
        const floatZ = floatAmplitude.z * Math.sin(2 * Math.PI * motionConfig.freqZ * t + phaseOffset)
        const floatRot = floatAmplitude.rot * Math.sin(2 * Math.PI * motionConfig.freqRot * t + phaseOffset)

        // Mouse parallax with 3D tilt effect
        const parallaxX = lerpedX * depthConfig[item.depth].parallax * parallaxAmplitude.x * 2.5
        const parallaxY = lerpedY * depthConfig[item.depth].parallax * parallaxAmplitude.y * 2.5
        // 3D tilt based on mouse position
        const tiltX = lerpedY * 12 // rotateX based on vertical mouse position (subtler)
        const tiltY = lerpedX * 12 // rotateY based on horizontal mouse position (subtler)

        // Base transform (centers the item)
        const baseTransform = `translate(-50%, -50%) scale(${depthConfig[item.depth].scale})`

        // Combined transform with 3D perspective
        const transform = `${baseTransform} 
          translate(${floatX + parallaxX}px, ${floatY + parallaxY}px) 
          scale(${1 + floatZ}) 
          rotateX(${tiltX}deg) 
          rotateY(${tiltY}deg) 
          rotate(${item.baseRot + floatRot}deg)`

        // Base style (opacity, filter)
        const baseStyle = {
          opacity: depthConfig[item.depth].opacity,
          filter: depthConfig[item.depth].blur !== '0px' ? `blur(${depthConfig[item.depth].blur})` : 'none',
          transform
        }

        // Apply style
        Object.assign(itemEl.style, baseStyle)
      })

      rafRef.current = window.requestAnimationFrame(animate)
    }
    rafRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 ${isDark ? 'dark' : 'light'}`}
      style={{
        left: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        perspective: '1200px',
        transform: `translate(${lerpMousePos.x * 30}px, ${lerpMousePos.y * 30}px)`
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el; }}
          className="absolute"
          style={{
            left: item.anchorX,
            top: item.anchorY,
          }}
        >
          <div className="floating-item">
            {item.type === 'offerLetter' ? (
              <OfferLetter
                data={item.data}
                isDark={isDark}
                mousePos={lerpMousePos}
              />
            ) : (
              <CurrencyNote
                data={item.data}
                isDark={isDark}
                mousePos={lerpMousePos}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Offer Letter Component
const OfferLetter = ({ data, isDark, mousePos }: { data: { skill: string; salary: string; ref: string }; isDark: boolean; mousePos: { x: number; y: number }; }) => {
  const theme = isDark ? offerLetterTemplate.themeColors.dark : offerLetterTemplate.themeColors.light
  const { layout, fonts, textures } = offerLetterTemplate

  // Calculate holographic sheen based on mouse position
  // Creates a moving gradient that simulates light reflection
  const sheenAngle = Math.atan2(mousePos.y, mousePos.x) * (180 / Math.PI); // Convert to degrees
  const sheenOffset = `${(sheenAngle + 90) % 360}deg`; // Offset for dynamic movement

  return (
    <div className="offer-letter" style={{
      width: `${offerLetterTemplate.baseWidth}px`,
      height: `${offerLetterTemplate.baseHeight}px`,
      position: 'relative',
      backgroundColor: theme.paper,
      color: theme.ink,
      fontFamily: fonts.body,
      padding: `${layout.margin}px`,
      boxSizing: 'border-box',
      borderRadius: '4px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
      backgroundImage: `
        url(${textures.paperGrain}),
        url(${textures.fiber}),
        linear-gradient(
          ${sheenOffset},
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 30%,
          rgba(255, 255, 255, 0.5) 50%,
          rgba(255, 255, 255, 0.3) 70%,
          rgba(255, 255, 255, 0) 100%
        )
      `,
      backgroundBlendMode: 'overlay, overlay, overlay',
      backgroundSize: 'auto, cover, 200% 200%'
    }}>
      {/* Seal / Watermark */}
      <div style={{
        position: 'absolute',
        top: `${layout.margin}px`,
        left: `${layout.margin}px`,
        width: `${layout.sealSize}px`,
        height: `${layout.sealSize}px`,
        backgroundColor: theme.accent,
        borderRadius: '50%',
        opacity: 0.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60%',
          height: '60%',
          backgroundColor: theme.ink,
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: `${layout.margin + layout.sealSize + 8}px`,
        left: `${layout.margin}px`,
        right: `${layout.margin}px`,
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: `${layout.titleText}px`,
          fontFamily: fonts.header,
          color: theme.accent,
          letterSpacing: '0.5px'
        }}>LA CASA DE ROZGAAR</h1>
        <p style={{
          margin: '4px 0 0',
          fontSize: `${layout.normalText}px`,
          fontFamily: fonts.mono,
          color: theme.accent,
          opacity: 0.8
        }}>OFFER OF APPOINTMENT</p>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute',
        top: `${layout.margin + layout.sealSize + 48}px`,
        left: `${layout.margin}px`,
        right: `${layout.margin}px`,
        height: '1px',
        backgroundColor: theme.accent,
        opacity: 0.2
      }}></div>

      {/* Body */}
      <div style={{
        position: 'absolute',
        top: `${layout.margin + layout.sealSize + 60}px`,
        left: `${layout.margin}px`,
        right: `${layout.margin}px`,
        fontSize: `${layout.normalText}px`,
        lineHeight: `${layout.lineHeight}px`
      }}>
        <p style={{ margin: 0 }}><strong>Skill:</strong> {data.skill}</p>
        <p style={{ margin: '4px 0 0' }}><strong>Projected CTC:</strong> {data.salary}</p>
        <p style={{ margin: '4px 0 0' }}><strong>Reference:</strong> {data.ref}</p>
        <p style={{ margin: '4px 0 0', fontSize: `${layout.smallText}px`, opacity: 0.7 }}><strong>Valid:</strong> 2026-09-24 to 2027-03-24</p>
      </div>

      {/* Footer Seal */}
      <div style={{
        position: 'absolute',
        bottom: `${layout.margin}px`,
        right: `${layout.margin}px`,
        width: `${layout.sealSize}px`,
        height: `${layout.sealSize}px`,
        backgroundColor: theme.accent,
        opacity: 0.1,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50%',
          height: '50%',
          backgroundColor: theme.ink,
          borderRadius: '50%'
        }}></div>
      </div>
    </div>
  )
}

// Currency Note Component
const CurrencyNote = ({ data, isDark, mousePos }: { data: { value: number; denom: string; color: string }; isDark: boolean; mousePos: { x: number; y: number }; }) => {
  const theme = isDark ? offerLetterTemplate.themeColors.dark : offerLetterTemplate.themeColors.light
  const { baseWidth, baseHeight, fonts } = currencyNoteAssets

  // Use the note's color as accent, but ensure it's visible on background
  const accentColor = data.color

  // Calculate holographic sheen based on mouse position
  // Creates a moving gradient that simulates light reflection on security features
  const sheenAngle = Math.atan2(mousePos.y, mousePos.x) * (180 / Math.PI); // Convert to degrees
  const sheenOffset = `${(sheenAngle + 90) % 360}deg`; // Offset for dynamic movement

  return (
    <div className="currency-note" style={{
      width: `${baseWidth}px`,
      height: `${baseHeight}px`,
      position: 'relative',
      backgroundColor: theme.paper,
      color: theme.ink,
      borderRadius: '4px',
      boxShadow: `0 4px 16px rgba(0,0,0,0.25)`,
      overflow: 'hidden',
      backgroundImage: `
        url("${currencyNoteAssets.textures?.paperGrain || ''}"),
        repeating-linear-gradient(
          45deg,
          ${theme.accent}0,
          ${theme.accent}1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(
          ${sheenOffset},
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 30%,
          rgba(255, 255, 255, 0.5) 50%,
          rgba(255, 255, 255, 0.3) 70%,
          rgba(255, 255, 255, 0) 100%
        )
      `,
      backgroundBlendMode: 'overlay, overlay, overlay',
      backgroundSize: 'auto, 10px 10px, 200% 200%'
    }}>
      {/* Security Strip */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20px',
        width: '8px',
        height: '100%',
        backgroundColor: accentColor,
        opacity: 0.15,
        borderRadius: '2px'
      }}></div>

      {/* Watermark (center) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100px',
        height: '60px',
        opacity: 0.05
      }}>
        {/* Simple zigzag to represent guilloche */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              ${accentColor}0,
              ${accentColor}1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              90deg,
              ${accentColor}0,
              ${accentColor}1px,
              transparent 1px,
              transparent 3px
            )
          `,
          backgroundSize: '4px 4px',
          opacity: 0.3
        }}></div>
      </div>

      {/* Denomination */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: accentColor,
        fontSize: '36px',
        fontWeight: 'bold',
        fontFamily: fonts.title,
        letterSpacing: '-2px'
      }}>
        {data.denom}
      </div>

      {/* Value in words (small) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        fontSize: '10px',
        fontFamily: fonts.mono,
        color: theme.ink,
        opacity: 0.6
      }}>
        Indian Rupees
      </div>
      <div style={{
        position: 'absolute',
        bottom: '4px',
        left: '12px',
        fontSize: '8px',
        fontFamily: fonts.mono,
        color: theme.ink,
        opacity: 0.5
      }}>
        {data.value === 2000 ? 'Two Thousand' : data.value === 500 ? 'Five Hundred' : data.value === 200 ? 'Two Hundred' : 'One Hundred'}
      </div>

      {/* RBI Seal (bottom right) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        width: '30px',
        height: '30px',
        backgroundColor: theme.accent,
        opacity: 0.2,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60%',
          height: '60%',
          backgroundColor: theme.ink,
          borderRadius: '50%'
        }}></div>
      </div>
    </div>
  )
}