import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Check, Share2, Globe, Shield, Lock, ExternalLink, Mail } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/utils'
import { type CandidateProfile } from '../../data/mockData'

interface DossierShareModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidateProfile
  onNavigate?: (page: string) => void
}

export const DossierShareModal: React.FC<DossierShareModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onNavigate,
}) => {
  const { isHeist } = useTheme()
  const [copied, setCopied] = useState(false)

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Generate share URL based on current host & hash
  const baseUrl = window.location.origin + window.location.pathname
  const shareUrl = `${baseUrl}#/shared-dossier?id=${candidate.id || 'CAND-7842'}`

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText?.(shareUrl).catch(() => {})
    } catch {
      // Fallback
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpenPublicPreview = () => {
    onClose()
    if (onNavigate) {
      onNavigate('shared-dossier')
    } else {
      window.location.hash = `#/shared-dossier?id=${candidate.id || 'CAND-7842'}`
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const shareText = encodeURIComponent(
    `Check out ${candidate.name}'s verified talent intelligence dossier on La Casa De Rozgaar: ${candidate.targetRole} (${candidate.roleReadiness}% Readiness)`
  )

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2] hover:bg-[#004182] text-white',
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`,
      color: 'bg-black hover:bg-neutral-800 text-white border border-neutral-700',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(`Verified Dossier: ${candidate.name} — ${candidate.targetRole}`)}&body=${shareText}%0A%0A${encodedUrl}`,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
    },
  ]

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0 }}
    >
      <div
        className={cn(
          'relative w-full max-w-lg my-auto rounded-xl border p-6 shadow-2xl transition-all scale-100 animate-in zoom-in-95 duration-200',
          isHeist
            ? 'bg-charcoal border-crimson/50 text-warm-ivory shadow-glow-crimson'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-current/10">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'p-2 rounded-lg',
                isHeist ? 'bg-crimson/20 text-crimson' : 'bg-blue-50 text-blue-700'
              )}
            >
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                {isHeist ? 'TRANSMIT CLASSIFIED INTEL' : 'Share Candidate Dossier'}
              </h3>
              <p
                className={cn(
                  'text-xs font-mono',
                  isHeist ? 'text-warm-ivory/60' : 'text-slate-500'
                )}
              >
                PUBLIC & RECRUITER PROGRESSIVE ACCESS LINK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              isHeist ? 'hover:bg-burgundy/30 text-warm-ivory/70' : 'hover:bg-slate-100 text-slate-400'
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* URL Box */}
        <div className="mt-5 space-y-4">
          <div>
            <label
              className={cn(
                'block text-xs font-mono mb-1.5 font-semibold',
                isHeist ? 'text-warm-ivory/80' : 'text-slate-700'
              )}
            >
              SHAREABLE DOSSIER URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={cn(
                  'w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none select-all',
                  isHeist
                    ? 'bg-obsidian border-burgundy/40 text-warm-ivory focus:border-crimson'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-600'
                )}
              />
              <button
                onClick={handleCopy}
                className={cn(
                  'px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isHeist
                    ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                    : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} /> COPIED!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> COPY LINK
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Access Policy Info Box */}
          <div
            className={cn(
              'p-3.5 rounded-lg border text-xs space-y-2 font-mono',
              isHeist
                ? 'bg-burgundy/10 border-burgundy/30 text-warm-ivory/80'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            )}
          >
            <div className="flex items-center gap-2 font-bold">
              <Shield size={14} className={isHeist ? 'text-crimson' : 'text-blue-700'} />
              <span>PROGRESSIVE SECURITY CLEARANCE MATRIX:</span>
            </div>

            <div className="space-y-1.5 pl-5 border-l-2 border-current/20">
              <div className="flex items-start gap-1.5">
                <Globe size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <p>
                  <strong>Unauthenticated (Guests):</strong> Public overview, verified skills, capability radar, and verified readiness score.
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <Lock size={13} className={isHeist ? 'text-crimson mt-0.5 shrink-0' : 'text-blue-600 mt-0.5 shrink-0'} />
                <p>
                  <strong>Authenticated (Logged-in Recruiters):</strong> Unlocks compensation telemetry, biometric proctoring reports, and verified recruiter contact vectors.
                </p>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <span
              className={cn(
                'block text-xs font-mono mb-2 font-semibold',
                isHeist ? 'text-warm-ivory/70' : 'text-slate-600'
              )}
            >
              TRANSMIT VIA EXTERNAL CHANNELS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs',
                    link.color
                  )}
                >
                  {link.name === 'Email' ? <Mail size={13} /> : null}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Preview as Guest action */}
          <div className="pt-2 border-t border-current/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleOpenPublicPreview}
              className={cn(
                'text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer',
                isHeist
                  ? 'text-crimson hover:text-warm-ivory'
                  : 'text-blue-700 hover:text-blue-900'
              )}
            >
              <ExternalLink size={14} /> Open Public Preview Tab
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer',
                isHeist
                  ? 'bg-burgundy/20 hover:bg-burgundy/30 text-warm-ivory'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
