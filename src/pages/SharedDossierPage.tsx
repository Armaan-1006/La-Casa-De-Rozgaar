import React, { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  Globe,
  Share2,
  CheckCircle,
  Briefcase,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { ThemeModeSwitch } from '../components/ThemeModeSwitch'
import { DossierShareModal } from '../components/dossier/DossierShareModal'
import { getStoredCandidate, api } from '../services/api'
import { type CandidateProfile } from '../data/mockData'
import { cn } from '../lib/utils'

interface SharedDossierPageProps {
  onNavigate?: (page: string) => void
}

export const SharedDossierPage: React.FC<SharedDossierPageProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const { isAuthenticated, user, logout, quickLogin } = useAuth()
  const [candidate, setCandidate] = useState<CandidateProfile>(getStoredCandidate)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'compensation' | 'assessment'>('overview')
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false)

  // Load candidate profile from API/localStorage
  useEffect(() => {
    let mounted = true
    api.candidate.getProfile().then((data) => {
      if (mounted && data) {
        setCandidate(data as CandidateProfile)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleQuickRecruiterLogin = async () => {
    setIsQuickLoggingIn(true)
    try {
      await quickLogin('recruiter')
    } finally {
      setIsQuickLoggingIn(false)
    }
  }

  const radarData = candidate.skills.map((skill) => ({
    skill: skill.name,
    current: skill.score,
    market: skill.market,
  }))

  return (
    <div
      className={cn(
        'min-h-screen pb-24 transition-colors duration-300 font-sans',
        isHeist
          ? 'bg-obsidian text-warm-ivory classified-grid'
          : 'bg-[#F8FAFC] text-slate-900'
      )}
    >
      {/* 1. PUBLIC TOP NAVIGATION BAR */}
      <header
        className={cn(
          'sticky top-0 z-40 border-b backdrop-blur-md transition-colors px-4 sm:px-8 py-3.5',
          isHeist
            ? 'bg-obsidian/90 border-burgundy/30 shadow-glow-crimson/20'
            : 'bg-white/90 border-slate-200 shadow-2xs'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('war-room')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm shadow-md transition-transform group-hover:scale-105',
                  isHeist
                    ? 'bg-gradient-crimson text-warm-ivory shadow-glow-crimson'
                    : 'bg-[#1E3A8A] text-white'
                )}
              >
                LR
              </div>
              <div>
                <h1
                  className={cn(
                    'font-mono font-bold text-sm tracking-wider uppercase',
                    isHeist ? 'text-warm-ivory' : 'text-slate-900'
                  )}
                >
                  LA CASA DE ROZGAAR
                </h1>
                <p
                  className={cn(
                    'text-[10px] font-mono tracking-widest',
                    isHeist ? 'text-warm-ivory/50' : 'text-slate-500'
                  )}
                >
                  {isHeist ? 'CLASSIFIED TALENT INTEL' : 'ENTERPRISE TALENT INTELLIGENCE'}
                </p>
              </div>
            </button>

            {/* Access Badge */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-current/15">
              {isAuthenticated ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Unlock size={12} /> FULL RECRUITER ACCESS
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <Globe size={12} /> PUBLIC PREVIEW (LIMITED ACCESS)
                </span>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <ThemeModeSwitch variant="compact" />

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                isHeist
                  ? 'bg-burgundy/20 hover:bg-burgundy/30 text-warm-ivory border border-burgundy/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              )}
            >
              <Share2 size={13} /> SHARE
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'hidden lg:inline text-xs font-mono px-2.5 py-1 rounded border',
                    isHeist
                      ? 'bg-charcoal border-burgundy/30 text-warm-ivory/80'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  )}
                >
                  👤 {user?.name} ({user?.role})
                </span>
                <button
                  onClick={() => onNavigate?.('war-room')}
                  className={cn(
                    'hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer',
                    isHeist
                      ? 'bg-gradient-crimson text-warm-ivory shadow-glow-crimson'
                      : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                  )}
                >
                  ENTER APP <ArrowRight size={13} />
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-xs text-rose-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickRecruiterLogin}
                  disabled={isQuickLoggingIn}
                  className={cn(
                    'hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer',
                    isHeist
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                  )}
                >
                  <Sparkles size={13} /> {isQuickLoggingIn ? 'UNLOCKING...' : 'QUICK RECRUITER UNLOCK'}
                </button>
                <button
                  onClick={() => onNavigate?.('login')}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                    isHeist
                      ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                      : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                  )}
                >
                  <LogIn size={13} /> SIGN IN
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN DOSSIER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Security / Clearance Notification Banner */}
        {!isAuthenticated && (
          <div
            className={cn(
              'p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs animate-in slide-in-from-top-2 duration-300',
              isHeist
                ? 'bg-gradient-to-r from-burgundy/30 via-charcoal to-burgundy/20 border-crimson/40 text-warm-ivory shadow-glow-crimson/20'
                : 'bg-blue-50/80 border-blue-200 text-slate-800 shadow-2xs'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0',
                  isHeist ? 'bg-crimson/20 text-crimson' : 'bg-blue-600 text-white'
                )}
              >
                <Lock size={16} />
              </div>
              <div>
                <p className="font-bold">
                  {isHeist
                    ? 'SECURITY CLEARANCE LEVEL: PUBLIC SANITIZED PREVIEW'
                    : 'Viewing Public Verified Candidate Profile'}
                </p>
                <p className={isHeist ? 'text-warm-ivory/70 text-[11px]' : 'text-slate-600 text-[11px]'}>
                  Target compensation telemetry, proctoring violation logs, and verified contact vectors are locked behind recruiter credentials.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleQuickRecruiterLogin}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer',
                  isHeist
                    ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                    : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                )}
              >
                Unlock Full Dossier
              </button>
            </div>
          </div>
        )}

        {/* Candidate Profile Hero Card */}
        <div
          className={cn(
            'p-6 sm:p-8 rounded-xl border relative overflow-hidden transition-all',
            isHeist
              ? 'bg-gradient-obsidian border-burgundy/30 shadow-glow-crimson'
              : 'bg-white border-slate-200 shadow-2xs'
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-bold text-2xl font-mono shrink-0 shadow-md',
                  isHeist
                    ? 'bg-gradient-crimson text-warm-ivory shadow-glow-crimson'
                    : 'bg-[#1E3A8A] text-white'
                )}
              >
                {candidate.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded',
                      isHeist
                        ? 'bg-crimson/20 text-crimson border border-crimson/40'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    )}
                  >
                    ✓ VERIFIED CANDIDATE
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded',
                      isHeist
                        ? 'bg-burgundy/20 text-warm-ivory/70 border border-burgundy/30'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    )}
                  >
                    ID: {candidate.id}
                  </span>
                </div>
                <h1
                  className={cn(
                    'text-2xl sm:text-3xl font-bold tracking-tight',
                    isHeist ? 'text-warm-ivory' : 'text-slate-900'
                  )}
                >
                  {candidate.name}
                </h1>
                <p
                  className={cn(
                    'text-xs sm:text-sm font-medium',
                    isHeist ? 'text-warm-ivory/80 font-mono' : 'text-slate-600'
                  )}
                >
                  {candidate.targetRole} • {candidate.location} • {candidate.experience} experience
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-current/10 pt-4 lg:pt-0 lg:pl-6">
              <div
                className={cn(
                  'p-3 rounded-lg border text-center space-y-0.5',
                  isHeist
                    ? 'bg-burgundy/10 border-burgundy/25'
                    : 'bg-slate-50 border-slate-200'
                )}
              >
                <span className="text-[10px] font-mono opacity-60">ROLE READINESS</span>
                <p className="text-xl font-bold font-mono text-crimson dark:text-emerald-400">
                  {candidate.roleReadiness}%
                </p>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">✓ Benchmark Met</span>
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg border text-center space-y-0.5',
                  isHeist
                    ? 'bg-burgundy/10 border-burgundy/25'
                    : 'bg-slate-50 border-slate-200'
                )}
              >
                <span className="text-[10px] font-mono opacity-60">ASSESSMENT</span>
                <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {candidate.assessment.score}%
                </p>
                <span className="text-[9px] font-mono opacity-75">{candidate.assessment.percentile}</span>
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg border text-center space-y-0.5 col-span-2 sm:col-span-1',
                  isHeist
                    ? 'bg-burgundy/10 border-burgundy/25'
                    : 'bg-slate-50 border-slate-200'
                )}
              >
                <span className="text-[10px] font-mono opacity-60">INTEGRITY CHECK</span>
                <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={16} /> PASSED
                </p>
                <span className="text-[9px] font-mono opacity-75">Neural Proctor</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-current/10 mt-6 pt-3 text-xs font-mono font-bold overflow-x-auto">
            {[
              { id: 'overview', label: 'OVERVIEW & SUMMARY' },
              { id: 'skills', label: 'SKILLS & CAPABILITY RADAR' },
              { id: 'compensation', label: 'COMPENSATION & CTC (GATED)', locked: !isAuthenticated },
              { id: 'assessment', label: 'PROCTORED TELEMETRY (GATED)', locked: !isAuthenticated },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
                  activeTab === tab.id
                    ? isHeist
                      ? 'bg-gradient-crimson text-white shadow-glow-crimson'
                      : 'bg-[#1E3A8A] text-white shadow-xs'
                    : isHeist
                    ? 'text-warm-ivory/60 hover:text-warm-ivory hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {tab.locked && <Lock size={12} className={activeTab === tab.id ? 'text-white' : 'text-amber-500'} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. TAB VIEWS */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Skills & Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Core Competencies Matrix */}
              <div
                className={cn(
                  'lg:col-span-7 p-6 rounded-xl border space-y-4',
                  isHeist
                    ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20'
                    : 'bg-white border-slate-200 shadow-2xs'
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-current/10">
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                      VALIDATED CORE COMPETENCIES
                    </h3>
                    <p className="text-xs opacity-60 font-mono">SCORES AUDITED VIA REPEATABLE PROCTORED ASSESSMENTS</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="text-xs font-mono font-bold text-blue-600 dark:text-crimson hover:underline"
                  >
                    View Radar →
                  </button>
                </div>

                <div className="space-y-3">
                  {candidate.skills.map((skill) => {
                    const isReady = skill.gap >= 0
                    return (
                      <div
                        key={skill.name}
                        className={cn(
                          'p-3 rounded-lg border space-y-1.5',
                          isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                        )}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold">{skill.name}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-blue-600 dark:text-crimson">
                              {skill.score} / 10
                            </span>
                            <span className="text-[11px] opacity-60">Market: {skill.market}</span>
                            {isReady ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                Ready
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                Gap: {Math.abs(skill.gap).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${(skill.score / 10) * 100}%` }}
                            className={cn(
                              'h-full rounded-full',
                              isHeist ? 'bg-gradient-crimson' : 'bg-[#1E3A8A]'
                            )}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Authenticated Field Projects */}
              <div
                className={cn(
                  'lg:col-span-5 p-6 rounded-xl border space-y-4',
                  isHeist
                    ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20'
                    : 'bg-white border-slate-200 shadow-2xs'
                )}
              >
                <div className="flex items-center gap-2 pb-3 border-b border-current/10">
                  <Briefcase size={16} className={isHeist ? 'text-crimson' : 'text-blue-700'} />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                    VERIFIED FIELD PROJECTS
                  </h3>
                </div>

                <div className="space-y-3">
                  {candidate.projects.map((proj) => (
                    <div
                      key={proj.title}
                      className={cn(
                        'p-3 rounded-lg border space-y-1.5',
                        isHeist ? 'bg-burgundy/10 border-burgundy/25 font-mono' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <h4 className="text-xs font-bold">{proj.title}</h4>
                      <div className="flex flex-wrap gap-1">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-mono',
                              isHeist
                                ? 'bg-burgundy/30 text-warm-ivory/80'
                                : 'bg-slate-200 text-slate-700'
                            )}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {proj.metric}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Contact & Outreach Section (Conditional / Progressive) */}
            <div
              className={cn(
                'p-6 rounded-xl border relative overflow-hidden transition-all',
                isHeist
                  ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20'
                  : 'bg-white border-slate-200 shadow-2xs'
              )}
            >
              <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className={isHeist ? 'text-crimson' : 'text-blue-700'} />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                    RECRUITER OUTREACH & INTERVIEW CHANNELS
                  </h3>
                </div>
                {isAuthenticated ? (
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Unlock size={13} /> ACTIVE RECRUITER CLEARANCE
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Lock size={13} /> RESTRICTED CONTACT VECTORS
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-1',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25 font-mono' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      <Mail size={12} /> DIRECT EMAIL VECTOR
                    </span>
                    <p className="text-sm font-bold">{candidate.name.toLowerCase().replace(' ', '.')}@operative.net</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Verified GPG Key Attached</p>
                  </div>

                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-1',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25 font-mono' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      <Phone size={12} /> SECURE SIGNAL LINE
                    </span>
                    <p className="text-sm font-bold">+91 98201 48290</p>
                    <p className="text-[10px] opacity-60">Available 09:00 - 18:00 IST</p>
                  </div>

                  <div
                    className={cn(
                      'p-4 rounded-lg border flex flex-col justify-between',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25 font-mono' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      <Calendar size={12} /> SCHEDULE TECHNICAL ROUND
                    </span>
                    <button
                      onClick={() => onNavigate?.('interviews')}
                      className={cn(
                        'mt-2 px-3 py-1.5 rounded text-xs font-bold transition-all text-center cursor-pointer',
                        isHeist
                          ? 'bg-gradient-crimson text-white shadow-glow-crimson'
                          : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                      )}
                    >
                      Schedule Interview →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative p-6 rounded-lg border border-dashed border-current/20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Lock size={24} />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h4 className="font-bold text-sm font-mono">CANDIDATE CONTACT VECTORS ARE MASKED</h4>
                    <p className="text-xs opacity-70">
                      Sign in with your recruiter account or use Quick Unlock to message this candidate, request references, or schedule interviews.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleQuickRecruiterLogin}
                      className={cn(
                        'px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer',
                        isHeist
                          ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                          : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                      )}
                    >
                      <Sparkles size={13} className="inline mr-1" /> Quick Recruiter Unlock
                    </button>
                    <button
                      onClick={() => onNavigate?.('login')}
                      className={cn(
                        'px-4 py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer',
                        isHeist
                          ? 'border-burgundy/40 text-warm-ivory hover:bg-burgundy/20'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      Sign In to Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS & CAPABILITY RADAR */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Skill Matrix List */}
            <div
              className={cn(
                'lg:col-span-6 p-6 rounded-xl border space-y-4',
                isHeist
                  ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20'
                  : 'bg-white border-slate-200 shadow-2xs'
              )}
            >
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider pb-3 border-b border-current/10">
                TECHNICAL CAPABILITY DEPLOYMENT MATRIX
              </h3>
              <div className="space-y-3">
                {candidate.skills.map((skill) => {
                  const isStrength = skill.gap >= 0
                  return (
                    <div
                      key={skill.name}
                      className={cn(
                        'p-3.5 rounded-lg border space-y-2',
                        isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">{skill.name}</span>
                        <span className="font-mono text-xs">
                          Score: <strong className="text-blue-600 dark:text-crimson">{skill.score}</strong> / 10{' '}
                          <span className="opacity-50">(Market: {skill.market})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 dark:bg-burgundy/30 rounded-full h-2 overflow-hidden">
                          <div
                            style={{ width: `${(skill.score / 10) * 100}%` }}
                            className={cn(
                              'h-full rounded-full',
                              isHeist ? 'bg-gradient-crimson' : 'bg-[#1E3A8A]'
                            )}
                          />
                        </div>
                        {isStrength ? (
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle size={13} /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                            Deficit: {Math.abs(skill.gap).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Radar Chart */}
            <div
              className={cn(
                'lg:col-span-6 p-6 rounded-xl border space-y-3 flex flex-col justify-between',
                isHeist
                  ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20'
                  : 'bg-white border-slate-200 shadow-2xs'
              )}
            >
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                  CAPABILITY PROFILE RADAR
                </h3>
                <p className="text-xs opacity-60 font-mono mt-0.5">
                  CANDIDATE SKILLS MAPPED AGAINST INDUSTRY RECRUITMENT BENCHMARK
                </p>
              </div>

              <div className="w-full h-80 my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={isHeist ? 'rgba(179,19,43,0.2)' : '#E2E8F0'} />
                    <PolarAngleAxis
                      dataKey="skill"
                      stroke={isHeist ? 'rgba(242,233,220,0.6)' : '#64748B'}
                      tick={{ fill: isHeist ? '#F2E9DC' : '#475569', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      stroke={isHeist ? 'rgba(179,19,43,0.3)' : '#CBD5E1'}
                      domain={[0, 10]}
                    />
                    <Radar
                      name="Candidate Score"
                      dataKey="current"
                      stroke={isHeist ? '#DC2626' : '#1E3A8A'}
                      fill={isHeist ? '#DC2626' : '#1E3A8A'}
                      fillOpacity={isHeist ? 0.5 : 0.25}
                    />
                    <Radar
                      name="Market Baseline"
                      dataKey="market"
                      stroke={isHeist ? '#F2E9DC' : '#94A3B8'}
                      fill="none"
                      strokeDasharray="3 3"
                    />
                    <Tooltip
                      contentStyle={{
                        background: isHeist ? 'rgba(21,21,24,0.95)' : '#FFFFFF',
                        border: isHeist ? '1px solid rgba(179,19,43,0.4)' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        color: isHeist ? '#F2E9DC' : '#0F172A',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-mono pt-3 border-t border-current/10">
                <div className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-3 rounded', isHeist ? 'bg-crimson' : 'bg-[#1E3A8A]')} />
                  <span>Candidate Score</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-70">
                  <span className="w-3 h-0.5 bg-slate-400 border border-dashed" />
                  <span>Market Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPENSATION & SALARY BANDS (GATED / PROGRESSIVE) */}
        {activeTab === 'compensation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isAuthenticated ? (
              /* UNLOCKED FULL COMPENSATION */
              <div className="space-y-6">
                <div
                  className={cn(
                    'p-6 rounded-xl border space-y-4',
                    isHeist
                      ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20 font-mono'
                      : 'bg-white border-slate-200 shadow-2xs'
                  )}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-current/10">
                    <div className="flex items-center gap-2">
                      <Unlock size={18} className="text-emerald-500" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        VERIFIED COMPENSATION INTELLIGENCE & CTC BENCHMARKS
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      CLEARANCE LEVEL 4 VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      className={cn(
                        'p-4 rounded-lg border space-y-1',
                        isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <span className="text-xs opacity-60">TARGET CTC BAND</span>
                      <p className="text-2xl font-bold text-crimson dark:text-emerald-400">₹2.4M - ₹3.2M</p>
                      <p className="text-[11px] opacity-70">Tier-1 Indian Metro Hubs</p>
                    </div>

                    <div
                      className={cn(
                        'p-4 rounded-lg border space-y-1',
                        isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <span className="text-xs opacity-60">BASE / VARIABLE SPLIT</span>
                      <p className="text-2xl font-bold">85% / 15%</p>
                      <p className="text-[11px] opacity-70">₹2.04M Fixed + Performance</p>
                    </div>

                    <div
                      className={cn(
                        'p-4 rounded-lg border space-y-1',
                        isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <span className="text-xs opacity-60">EQUITY EXPECTATION</span>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0.05% - 0.15%</p>
                      <p className="text-[11px] opacity-70">4-Year Standard Vesting</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'p-4 rounded-lg border text-xs space-y-2',
                      isHeist ? 'bg-burgundy/5 border-burgundy/20' : 'bg-blue-50/50 border-blue-200'
                    )}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-500" />
                      COMPENSATION VERIFICATION AUDIT TRAIL
                    </p>
                    <p className="opacity-80">
                      Based on recent verified salary slips, current employer telemetry, and macroeconomic regional salary distributions across Bangalore, Hyderabad, and Pune corridors.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* GATED / REDACTED COMPENSATION PREVIEW (INSTAGRAM STYLE) */
              <div
                className={cn(
                  'p-8 rounded-xl border text-center space-y-6 relative overflow-hidden',
                  isHeist
                    ? 'bg-charcoal/90 border-crimson/40 shadow-glow-crimson/30'
                    : 'bg-white border-slate-200 shadow-sm'
                )}
              >
                {/* Blurred backdrop cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 filter blur-sm select-none opacity-40 pointer-events-none">
                  <div className="p-4 rounded-lg border bg-current/5 space-y-1">
                    <span className="text-xs">TARGET CTC BAND</span>
                    <p className="text-2xl font-bold">₹X.XM - ₹X.XM</p>
                    <p className="text-[11px]">Classified Corridor</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-current/5 space-y-1">
                    <span className="text-xs">BASE / VARIABLE SPLIT</span>
                    <p className="text-2xl font-bold">XX% / XX%</p>
                    <p className="text-[11px]">Classified Split</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-current/5 space-y-1">
                    <span className="text-xs">EQUITY EXPECTATION</span>
                    <p className="text-2xl font-bold">0.XX%</p>
                    <p className="text-[11px]">Classified Vesting</p>
                  </div>
                </div>

                {/* Lock Overlay Modal */}
                <div className="max-w-md mx-auto space-y-3 pt-2">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg',
                      isHeist
                        ? 'bg-gradient-crimson text-white shadow-glow-crimson'
                        : 'bg-[#1E3A8A] text-white shadow-sm'
                    )}
                  >
                    <Lock size={26} />
                  </div>
                  <h3 className="text-lg font-bold font-mono">
                    {isHeist ? 'CLASSIFIED COMPENSATION DOSSIER' : 'Sign in to View Target Compensation'}
                  </h3>
                  <p className="text-xs opacity-75 leading-relaxed font-mono">
                    {isHeist
                      ? 'Detailed salary benchmark splits, current vs target CTC bands, and equity telemetry are classified under Level-4 Protocol. Log in to authenticate.'
                      : 'Salary expectations and compensation benchmarking are restricted to verified employer and recruiter accounts.'}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <button
                      onClick={handleQuickRecruiterLogin}
                      disabled={isQuickLoggingIn}
                      className={cn(
                        'w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer',
                        isHeist
                          ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                          : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                      )}
                    >
                      <Sparkles size={14} className="inline mr-1.5" />
                      {isQuickLoggingIn ? 'AUTHENTICATING...' : 'Quick Recruiter Unlock'}
                    </button>
                    <button
                      onClick={() => onNavigate?.('login')}
                      className={cn(
                        'w-full sm:w-auto px-5 py-2.5 text-xs font-mono rounded-lg border transition-all cursor-pointer',
                        isHeist
                          ? 'border-burgundy/40 text-warm-ivory hover:bg-burgundy/20'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      Sign In with Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STANDARDIZED ASSESSMENT & PROCTOR TELEMETRY (GATED / PROGRESSIVE) */}
        {activeTab === 'assessment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Always visible baseline summary */}
            <div
              className={cn(
                'p-6 rounded-xl border space-y-4',
                isHeist
                  ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20 font-mono'
                  : 'bg-white border-slate-200 shadow-2xs'
              )}
            >
              <div className="flex items-center justify-between pb-3 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    STANDARDIZED ASSESSMENT SUMMARY
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  STATUS: VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-lg border space-y-1',
                    isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <span className="text-xs opacity-60">OVERALL SCORE</span>
                  <p className="text-2xl font-bold text-blue-600 dark:text-crimson">
                    {candidate.assessment.score}%
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {candidate.assessment.percentile}
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg border space-y-1',
                    isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <span className="text-xs opacity-60">TEST CATEGORY</span>
                  <p className="text-base font-bold">{candidate.assessment.category}</p>
                  <p className="text-[11px] opacity-70">Completed: {candidate.assessment.completedAt}</p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg border space-y-1',
                    isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <span className="text-xs opacity-60">INTEGRITY PROTOCOL</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={16} /> Verified Protocol
                  </p>
                  <p className="text-[11px] opacity-70">Neural Proctor Active</p>
                </div>
              </div>
            </div>

            {/* GATED DETAILED PROCTOR TELEMETRY */}
            {isAuthenticated ? (
              <div
                className={cn(
                  'p-6 rounded-xl border space-y-4',
                  isHeist
                    ? 'bg-charcoal border-burgundy/30 shadow-glow-crimson/20 font-mono'
                    : 'bg-white border-slate-200 shadow-2xs'
                )}
              >
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider pb-2 border-b border-current/10">
                  🔐 DECRYPTED NEURAL BIOMETRIC AUDIT TRAIL
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div
                    className={cn(
                      'p-3 rounded-lg border',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="opacity-60 block">FOCUS DURATION</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                      {candidate.assessment.proctorSignals.focusRate}
                    </strong>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg border',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="opacity-60 block">FACE DISPLACEMENT</span>
                    <strong className="text-sm">0 Flags</strong>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg border',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="opacity-60 block">TAB SWITCHES</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400">0 Violations</strong>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg border',
                      isHeist ? 'bg-burgundy/10 border-burgundy/25' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className="opacity-60 block">BLAZEFACE AI CONFIDENCE</span>
                    <strong className="text-sm text-blue-600 dark:text-blue-400">99.2% Nominal</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'p-6 rounded-xl border border-dashed text-center space-y-3',
                  isHeist
                    ? 'bg-burgundy/5 border-crimson/30 text-warm-ivory'
                    : 'bg-slate-50 border-slate-300 text-slate-700'
                )}
              >
                <div className="p-2.5 rounded-full w-10 h-10 mx-auto bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs font-mono uppercase">
                    DETAILED NEURAL PROCTOR TELEMETRY IS RESTRICTED
                  </h4>
                  <p className="text-[11px] opacity-70 max-w-md mx-auto mt-0.5">
                    Sign in with recruiter credentials to inspect frame-by-frame gaze tracking, tab switch audit logs, and webcam integrity verification.
                  </p>
                </div>
                <button
                  onClick={handleQuickRecruiterLogin}
                  className={cn(
                    'px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1',
                    isHeist
                      ? 'bg-gradient-crimson text-white shadow-glow-crimson'
                      : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
                  )}
                >
                  <Sparkles size={12} /> Quick Recruiter Unlock
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. INSTAGRAM-STYLE FLOATING BOTTOM UNLOCK BAR (GUEST ONLY) */}
      {!isAuthenticated && (
        <div
          className={cn(
            'fixed bottom-0 inset-x-0 z-50 p-4 border-t backdrop-blur-md transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-bottom-2',
            isHeist
              ? 'bg-charcoal/95 border-crimson/40 text-warm-ivory'
              : 'bg-white/95 border-slate-200 text-slate-900'
          )}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 hidden sm:flex',
                isHeist ? 'bg-gradient-crimson text-white' : 'bg-[#1E3A8A] text-white'
              )}
            >
              LR
            </div>
            <div>
              <p className="text-xs font-bold font-mono">
                {isHeist ? 'RESTRICTED PUBLIC INTEL PREVIEW' : 'Viewing Public Candidate Profile'}
              </p>
              <p className="text-[11px] opacity-70">
                Log in to unlock target CTC bands, proctoring telemetry, and verified contact channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
            <button
              onClick={handleQuickRecruiterLogin}
              disabled={isQuickLoggingIn}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm',
                isHeist
                  ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:brightness-110'
                  : 'bg-[#1E3A8A] text-white hover:bg-blue-700'
              )}
            >
              <Sparkles size={13} /> {isQuickLoggingIn ? 'AUTHENTICATING...' : 'Quick Recruiter Unlock'}
            </button>
            <button
              onClick={() => onNavigate?.('login')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-mono transition-all border cursor-pointer',
                isHeist
                  ? 'border-burgundy/40 text-warm-ivory hover:bg-burgundy/20'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              )}
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <DossierShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        candidate={candidate}
        onNavigate={onNavigate}
      />
    </div>
  )
}
