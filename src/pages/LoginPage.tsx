import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Layers,
  Fingerprint
} from 'lucide-react'
import { useAuth, DEMO_PRESETS, type UserRole } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { FallingOfferLetters } from '../components/FallingOfferLetters'
import { cn } from '../lib/utils'

interface LoginPageProps {
  onNavigate: (page: string) => void
  onSuccess?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  // Login page always operates in dedicated cinematic Heist presentation; main app retains user theme
  const isHeist = true
  const { login, register, quickLogin, isLoading, user, isAuthenticated, logout } = useAuth()

  // Form tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Register Form State
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('CANDIDATE')

  // UI state
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [authStage, setAuthStage] = useState<'idle' | 'authenticating' | 'authorizing' | 'success'>('idle')
  const [activePresetLoading, setActivePresetLoading] = useState<string | null>(null)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)

    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both identity email and cipher passcode.')
      return
    }

    setAuthStage('authenticating')

    setTimeout(async () => {
      setAuthStage('authorizing')
      const result = await login({ email: loginEmail, password: loginPassword })

      if (result.success) {
        setAuthStage('success')
        setAuthSuccess(`Access Granted. Welcome, Operative ${result.user?.name || loginEmail}.`)
        setTimeout(() => {
          if (onSuccess) onSuccess()
          redirectByRole(result.user?.role)
        }, 1000)
      } else {
        setAuthStage('idle')
        setAuthError(result.error || 'Access Denied: Invalid credentials.')
      }
    }, 600)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)

    if (!regName || !regEmail || !regPassword) {
      setAuthError('All clearance fields are mandatory.')
      return
    }

    if (regPassword.length < 6) {
      setAuthError('Passcode must be at least 6 characters in length.')
      return
    }

    setAuthStage('authorizing')
    const result = await register({
      email: regEmail,
      password: regPassword,
      name: regName,
      role: regRole,
    })

    if (result.success) {
      setAuthStage('success')
      setAuthSuccess(`Clearance Generated. Operative profile created for ${regName}.`)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        redirectByRole(regRole)
      }, 1100)
    } else {
      setAuthStage('idle')
      setAuthError(result.error || 'Registration failed.')
    }
  }

  const handleQuickLogin = async (presetKey: 'candidate' | 'candidate_data' | 'recruiter' | 'planner' | 'admin') => {
    setAuthError(null)
    setActivePresetLoading(presetKey)
    setAuthStage('authenticating')

    const preset = DEMO_PRESETS[presetKey]
    setLoginEmail(preset.email)
    setLoginPassword(preset.password)

    const result = await quickLogin(presetKey)
    setActivePresetLoading(null)

    if (result.success) {
      setAuthStage('success')
      setAuthSuccess(`Clearance Bypassed: Authorized as ${preset.name} (${preset.role}).`)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        redirectByRole(result.user?.role)
      }, 900)
    } else {
      setAuthStage('idle')
      setAuthError(result.error || 'Failed to authenticate preset persona.')
    }
  }

  const redirectByRole = (role?: UserRole) => {
    switch (role) {
      case 'CANDIDATE':
        onNavigate('candidate-dossier')
        break
      case 'RECRUITER':
      case 'EMPLOYER_ADMIN':
        onNavigate('talent-vault')
        break
      case 'WORKFORCE_PLANNER':
        onNavigate('workforce-gaps')
        break
      case 'ADMIN':
      default:
        onNavigate('war-room')
        break
    }
  }

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300',
        isHeist
          ? 'bg-obsidian text-warm-ivory'
          : 'bg-[#F8FAFC] text-slate-900'
      )}
    >
      {/* Background Graphic Treatment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Cinematic Backdrop Image */}
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-700',
            isHeist ? 'opacity-25 filter contrast-125' : 'opacity-5 filter blur-xs'
          )}
          style={{ backgroundImage: `url('/images/lcdr_login_banner.jpg')` }}
        />

        {/* Ambient Gradient Overlays */}
        {isHeist ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/75 to-obsidian" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-crimson/15 rounded-full blur-[140px]" />
            <div className="absolute inset-0 classified-grid opacity-40" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white/90 to-slate-100" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-100/60 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
          </>
        )}

        {/* Silhouette: Subtle Left Shadow — Rio presenting candidate file */}
        <motion.div
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            'absolute left-0 sm:left-2 lg:left-4 xl:left-8 bottom-0 pointer-events-none select-none transition-opacity duration-700',
            'h-[60vh] sm:h-[68vh] lg:h-[76vh] max-h-[760px]',
            'flex items-end justify-start',
            isHeist ? 'opacity-[0.08] sm:opacity-[0.09] lg:opacity-[0.11]' : 'opacity-0'
          )}
          style={{ zIndex: 1 }}
        >
          <img
            src="/images/rio_shadow_final.png"
            alt=""
            aria-hidden="true"
            className="h-full w-auto object-contain object-bottom filter blur-[0.7px]"
            style={{
              maskImage: 'radial-gradient(ellipse 80% 85% at 50% 55%, black 10%, rgba(0,0,0,0.4) 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 85% at 50% 55%, black 10%, rgba(0,0,0,0.4) 40%, transparent 70%)'
            }}
          />
        </motion.div>

        {/* Silhouette: Subtle Right Shadow — Professor presenting offer letter */}
        <motion.div
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 10.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className={cn(
            'absolute right-0 sm:right-2 lg:right-4 xl:right-8 bottom-0 pointer-events-none select-none transition-opacity duration-700',
            'h-[60vh] sm:h-[68vh] lg:h-[76vh] max-h-[760px]',
            'flex items-end justify-end',
            isHeist ? 'opacity-[0.08] sm:opacity-[0.09] lg:opacity-[0.11]' : 'opacity-0'
          )}
          style={{ zIndex: 1 }}
        >
          <img
            src="/images/professor_shadow_final.png"
            alt=""
            aria-hidden="true"
            className="h-full w-auto object-contain object-bottom filter blur-[0.7px]"
            style={{
              maskImage: 'radial-gradient(ellipse 80% 85% at 50% 55%, black 10%, rgba(0,0,0,0.4) 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 85% at 50% 55%, black 10%, rgba(0,0,0,0.4) 40%, transparent 70%)'
            }}
          />
        </motion.div>

        {/* Continuous Falling Offer Letters Animation — Atmospheric Heist Document Stream */}
        <FallingOfferLetters />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between pb-4 border-b border-inherit/20">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-lg shadow-md transition-colors',
              isHeist
                ? 'bg-gradient-to-br from-crimson to-blood-red text-white border border-crimson/60 shadow-glow-crimson'
                : 'bg-blue-600 text-white shadow-blue-500/20'
            )}
          >
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold tracking-wider text-sm sm:text-base">
                LA CASA DE ROZGAAR
              </span>
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-widest uppercase',
                  isHeist
                    ? 'bg-crimson/20 text-crimson border border-crimson/40'
                    : 'bg-slate-200 text-slate-700'
                )}
              >
                {isHeist ? 'HQ GATEWAY' : 'ENTERPRISE SSO'}
              </span>
            </div>
            <p className={cn('text-xs', isHeist ? 'text-warm-ivory/60 font-mono' : 'text-slate-500')}>
              The House of Employment • Intelligent Workforce Ecosystem
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('war-room')}
            className={cn(
              'text-xs font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer',
              isHeist
                ? 'border-burgundy/40 bg-charcoal/80 text-warm-ivory/80 hover:text-white hover:border-crimson/60'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
            )}
          >
            <span>Skip to War Room</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Hero & Quick Demo Crew Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            <div>
              {/* Tactical Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-4 border">
                <span className={cn('w-2 h-2 rounded-full animate-ping', isHeist ? 'bg-crimson' : 'bg-blue-600')} />
                <span className={isHeist ? 'text-crimson' : 'text-blue-700'}>
                  {isHeist ? 'PROTOCOL: BELLACIAO_V2 // ZERO-TRUST' : 'Identity Verification Gateway'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight leading-tight">
                {isHeist ? (
                  <>
                    AUTHORIZE YOUR <br />
                    <span className="text-crimson text-glow-crimson">OPERATIVE CLEARANCE</span>
                  </>
                ) : (
                  <>
                    Intelligent Talent & <br />
                    <span className="text-blue-600">Workforce Intelligence</span>
                  </>
                )}
              </h1>

              <p
                className={cn(
                  'mt-3 text-sm leading-relaxed',
                  isHeist ? 'text-warm-ivory/70' : 'text-slate-600'
                )}
              >
                Access real-time talent velocity, verified skills gap simulations, explainable AI job matching, and labor economics intelligence.
              </p>
            </div>

            {/* Quick Demo Operatives Panel */}
            <div
              className={cn(
                'p-4 rounded-xl border transition-all',
                isHeist
                  ? 'bg-charcoal/80 border-burgundy/40 shadow-xl'
                  : 'bg-white border-slate-200 shadow-sm'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint size={16} className={isHeist ? 'text-crimson' : 'text-blue-600'} />
                  <span className={cn('text-xs font-bold tracking-wider uppercase', isHeist ? 'font-mono text-warm-ivory' : 'text-slate-800')}>
                    1-Click Crew Clearance
                  </span>
                </div>
                <span className="text-[10px] text-muted-gold font-mono px-1.5 py-0.5 rounded bg-muted-gold/10">
                  DEMO PASSES
                </span>
              </div>

              <p className={cn('text-xs mb-3', isHeist ? 'text-warm-ivory/50 font-mono' : 'text-slate-500')}>
                Select any operative profile below for instant authentication without typing credentials:
              </p>

              <div className="space-y-2">
                {/* 1. Rahul (Candidate Full Stack) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('candidate')}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group cursor-pointer',
                    isHeist
                      ? 'bg-obsidian/70 border-burgundy/30 hover:border-crimson hover:bg-burgundy/20'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-crimson/20 text-crimson border border-crimson/40 flex items-center justify-center font-bold text-xs">
                      RS
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>Rahul Sharma</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                          CANDIDATE
                        </span>
                      </div>
                      <div className={cn('text-[11px] truncate', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                        Full Stack Engineer • 4 yrs exp
                      </div>
                    </div>
                  </div>
                  {activePresetLoading === 'candidate' ? (
                    <span className="w-3.5 h-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* 2. Priya (Candidate ML) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('candidate_data')}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group cursor-pointer',
                    isHeist
                      ? 'bg-obsidian/70 border-burgundy/30 hover:border-crimson hover:bg-burgundy/20'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-crimson/20 text-crimson border border-crimson/40 flex items-center justify-center font-bold text-xs">
                      PP
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>Priya Patel</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-500 font-mono">
                          CANDIDATE
                        </span>
                      </div>
                      <div className={cn('text-[11px] truncate', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                        AI/ML Specialist & Data Scientist
                      </div>
                    </div>
                  </div>
                  {activePresetLoading === 'candidate_data' ? (
                    <span className="w-3.5 h-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* 3. Marcus (Recruiter) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('recruiter')}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group cursor-pointer',
                    isHeist
                      ? 'bg-obsidian/70 border-burgundy/30 hover:border-crimson hover:bg-burgundy/20'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-crimson/20 text-crimson border border-crimson/40 flex items-center justify-center font-bold text-xs">
                      MV
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>Marcus Vance</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-mono">
                          RECRUITER
                        </span>
                      </div>
                      <div className={cn('text-[11px] truncate', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                        TechCorp Talent Lead
                      </div>
                    </div>
                  </div>
                  {activePresetLoading === 'recruiter' ? (
                    <span className="w-3.5 h-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* 4. Elena (Workforce Planner) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('planner')}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group cursor-pointer',
                    isHeist
                      ? 'bg-obsidian/70 border-burgundy/30 hover:border-crimson hover:bg-burgundy/20'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-crimson/20 text-crimson border border-crimson/40 flex items-center justify-center font-bold text-xs">
                      ER
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>Elena Rostova</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-mono">
                          PLANNER
                        </span>
                      </div>
                      <div className={cn('text-[11px] truncate', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                        Workforce Gap Strategist
                      </div>
                    </div>
                  </div>
                  {activePresetLoading === 'planner' ? (
                    <span className="w-3.5 h-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>

                {/* 5. The Professor (Admin) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group cursor-pointer',
                    isHeist
                      ? 'bg-crimson/15 border-crimson/40 hover:border-crimson hover:bg-crimson/25 shadow-glow-crimson'
                      : 'bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center font-bold text-xs">
                      PR
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="font-bold text-crimson">The Professor</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-crimson/20 text-crimson font-mono font-bold">
                          ADMIN ROOT
                        </span>
                      </div>
                      <div className={cn('text-[11px]', isHeist ? 'text-warm-ivory/60' : 'text-slate-600')}>
                        Full Command Center Clearance
                      </div>
                    </div>
                  </div>
                  {activePresetLoading === 'admin' ? (
                    <span className="w-3.5 h-3.5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={15} className="text-crimson group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Currently Authenticated Notification if already signed in */}
            {isAuthenticated && user && (
              <div
                className={cn(
                  'p-3.5 rounded-xl border flex items-center justify-between',
                  isHeist ? 'bg-[#151518] border-crimson/40' : 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-crimson text-white flex items-center justify-center text-xs font-bold">
                    {user.avatarInitials || 'OP'}
                  </div>
                  <div>
                    <div className="text-xs font-bold">Session Active: {user.name}</div>
                    <div className="text-[10px] opacity-70">Signed in as {user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => redirectByRole(user.role)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-crimson text-white hover:bg-crimson/90 cursor-pointer"
                  >
                    Enter HQ
                  </button>
                  <button
                    onClick={logout}
                    className="text-xs px-2 py-1 rounded border border-inherit/30 hover:bg-white/10 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* RIGHT COLUMN: Interactive Card (Sign In / Register) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div
              className={cn(
                'rounded-2xl border p-6 sm:p-8 backdrop-blur-xl transition-all shadow-2xl relative',
                isHeist
                  ? 'bg-charcoal/90 border-burgundy/60 shadow-[0_0_50px_rgba(179,19,43,0.15)]'
                  : 'bg-white/95 border-slate-200 shadow-xl'
              )}
            >
              {/* Header Tab Bar */}
              <div className="flex items-center justify-between border-b pb-4 mb-6 border-inherit/20">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-inherit/20 border border-inherit/20">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setAuthError(null)
                    }}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                      activeTab === 'login'
                        ? isHeist
                          ? 'bg-crimson text-white shadow-glow-crimson'
                          : 'bg-slate-900 text-white'
                        : isHeist
                        ? 'text-warm-ivory/60 hover:text-warm-ivory'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    AUTHENTICATE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register')
                      setAuthError(null)
                    }}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                      activeTab === 'register'
                        ? isHeist
                          ? 'bg-crimson text-white shadow-glow-crimson'
                          : 'bg-slate-900 text-white'
                        : isHeist
                        ? 'text-warm-ivory/60 hover:text-warm-ivory'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    REQUEST CLEARANCE
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 font-mono"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <div className="font-bold">AUTHENTICATION ERROR</div>
                      <div>{authError}</div>
                    </div>
                  </motion.div>
                )}

                {authSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 font-mono"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <div className="font-bold">CLEARANCE APPROVED</div>
                      <div>{authSuccess}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOGIN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className={cn('block text-xs font-mono font-medium mb-1.5', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                      OPERATIVE IDENTITY // EMAIL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} className={isHeist ? 'text-crimson/80' : 'text-slate-400'} />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com or admin@rozgaar.in"
                        required
                        className={cn(
                          'w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2',
                          isHeist
                            ? 'bg-obsidian/90 border-[#32323A] text-warm-ivory placeholder-warm-ivory/30 focus:ring-crimson focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500'
                        )}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={cn('block text-xs font-mono font-medium', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                        CIPHER PASSCODE
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginPassword('password123')
                          setLoginEmail('rahul@example.com')
                        }}
                        className={cn('text-[11px] underline hover:no-underline font-mono', isHeist ? 'text-crimson' : 'text-blue-600')}
                      >
                        Auto-fill Demo Password
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} className={isHeist ? 'text-crimson/80' : 'text-slate-400'} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className={cn(
                          'w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2',
                          isHeist
                            ? 'bg-obsidian/90 border-[#32323A] text-warm-ivory placeholder-warm-ivory/30 focus:ring-crimson focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Hide passcode' : 'Show passcode'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Terminal State */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={cn(
                          'rounded transition-colors',
                          isHeist ? 'accent-crimson' : 'accent-blue-600'
                        )}
                      />
                      <span className={cn(isHeist ? 'text-warm-ivory/70 font-mono text-[11px]' : 'text-slate-600 text-xs')}>
                        Persist session telemetry
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('For this intelligence simulation, use passcode "password123" with any seeded account.')}
                      className={cn('text-[11px] font-mono hover:underline', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}
                    >
                      Forgot cipher?
                    </button>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading || authStage !== 'idle'}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl font-heading tracking-wider font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden',
                      isHeist
                        ? 'bg-gradient-to-r from-crimson to-blood-red text-white shadow-glow-crimson hover:brightness-110 active:scale-[0.99]'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99]'
                    )}
                  >
                    {authStage === 'authenticating' ? (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>VERIFYING CREDENTIALS...</span>
                      </div>
                    ) : authStage === 'authorizing' ? (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>INITIALIZING CLEARANCE...</span>
                      </div>
                    ) : authStage === 'success' ? (
                      <div className="flex items-center gap-2 font-mono text-xs text-white">
                        <CheckCircle2 size={16} />
                        <span>ACCESS GRANTED // REDIRECTING</span>
                      </div>
                    ) : (
                      <>
                        <span>AUTHORIZE ACCESS // SIGN IN</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  {/* Guest Access Alternative */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => onNavigate('war-room')}
                      className={cn(
                        'text-xs font-mono transition-colors hover:underline inline-flex items-center gap-1.5 cursor-pointer',
                        isHeist ? 'text-warm-ivory/60 hover:text-crimson' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <span>Explore as Guest Spectator (No Login Required)</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className={cn('block text-xs font-mono font-medium mb-1', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                      OPERATIVE CODENAME / FULL NAME
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} className={isHeist ? 'text-crimson/80' : 'text-slate-400'} />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Johnathan Cross"
                        required
                        className={cn(
                          'w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2',
                          isHeist
                            ? 'bg-obsidian/90 border-[#32323A] text-warm-ivory placeholder-warm-ivory/30 focus:ring-crimson'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500'
                        )}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className={cn('block text-xs font-mono font-medium mb-1', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                      SECURE COMM EMAIL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} className={isHeist ? 'text-crimson/80' : 'text-slate-400'} />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. operative@rozgaar.in"
                        required
                        className={cn(
                          'w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2',
                          isHeist
                            ? 'bg-obsidian/90 border-[#32323A] text-warm-ivory placeholder-warm-ivory/30 focus:ring-crimson'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500'
                        )}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className={cn('block text-xs font-mono font-medium mb-1', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                      ESTABLISH CIPHER PASSCODE (MIN 6 CHARS)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} className={isHeist ? 'text-crimson/80' : 'text-slate-400'} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className={cn(
                          'w-full pl-9 pr-10 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2',
                          isHeist
                            ? 'bg-obsidian/90 border-[#32323A] text-warm-ivory placeholder-warm-ivory/30 focus:ring-crimson'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className={cn('block text-xs font-mono font-medium mb-1.5', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                      OPERATIONAL ROLE & CLEARANCE LEVEL
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Candidate */}
                      <button
                        type="button"
                        onClick={() => setRegRole('CANDIDATE')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col',
                          regRole === 'CANDIDATE'
                            ? isHeist
                              ? 'bg-crimson/20 border-crimson text-white shadow-glow-crimson'
                              : 'bg-blue-50 border-blue-500 text-blue-900'
                            : isHeist
                            ? 'bg-obsidian/70 border-burgundy/30 text-warm-ivory/60 hover:text-warm-ivory'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <User size={15} className={regRole === 'CANDIDATE' ? 'text-crimson' : 'text-slate-400'} />
                        <span className="text-xs font-bold font-mono mt-1">CANDIDATE</span>
                        <span className="text-[10px] opacity-70">Job & Skill Seekers</span>
                      </button>

                      {/* Recruiter / Employer */}
                      <button
                        type="button"
                        onClick={() => setRegRole('RECRUITER')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col',
                          regRole === 'RECRUITER'
                            ? isHeist
                              ? 'bg-crimson/20 border-crimson text-white shadow-glow-crimson'
                              : 'bg-blue-50 border-blue-500 text-blue-900'
                            : isHeist
                            ? 'bg-obsidian/70 border-burgundy/30 text-warm-ivory/60 hover:text-warm-ivory'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Briefcase size={15} className={regRole === 'RECRUITER' ? 'text-crimson' : 'text-slate-400'} />
                        <span className="text-xs font-bold font-mono mt-1">RECRUITER</span>
                        <span className="text-[10px] opacity-70">Talent Discovery</span>
                      </button>

                      {/* Workforce Planner */}
                      <button
                        type="button"
                        onClick={() => setRegRole('WORKFORCE_PLANNER')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col',
                          regRole === 'WORKFORCE_PLANNER'
                            ? isHeist
                              ? 'bg-crimson/20 border-crimson text-white shadow-glow-crimson'
                              : 'bg-blue-50 border-blue-500 text-blue-900'
                            : isHeist
                            ? 'bg-obsidian/70 border-burgundy/30 text-warm-ivory/60 hover:text-warm-ivory'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Layers size={15} className={regRole === 'WORKFORCE_PLANNER' ? 'text-crimson' : 'text-slate-400'} />
                        <span className="text-xs font-bold font-mono mt-1">PLANNER</span>
                        <span className="text-[10px] opacity-70">Capability Gaps</span>
                      </button>
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || authStage !== 'idle'}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl font-heading tracking-wider font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer',
                      isHeist
                        ? 'bg-gradient-to-r from-crimson to-blood-red text-white shadow-glow-crimson hover:brightness-110 active:scale-[0.99]'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99]'
                    )}
                  >
                    {authStage === 'authorizing' ? (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>MINTING IDENTITY TOKEN...</span>
                      </div>
                    ) : authStage === 'success' ? (
                      <div className="flex items-center gap-2 font-mono text-xs text-white">
                        <CheckCircle2 size={16} />
                        <span>PROFILE MINTED // COMMENCING SESSION</span>
                      </div>
                    ) : (
                      <>
                        <span>REQUEST CLEARANCE // REGISTER</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Security Telemetry Footer */}
              <div
                className={cn(
                  'mt-6 pt-4 border-t border-inherit/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono',
                  isHeist ? 'text-warm-ivory/50' : 'text-slate-400'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>MODULE 2 BACKEND: PORT 3001 OK</span>
                </div>
                <div>SQLITE DB ENCRYPTED // JWT BEARER RBAC</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 max-w-6xl w-full mx-auto pt-4 border-t border-inherit/20 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
        <p className={isHeist ? 'text-warm-ivory/50 font-mono' : 'text-slate-500'}>
          © 2026 La Casa De Rozgaar • Built for Intelligent Workforce Strategy and Human Capability.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-muted-gold font-mono font-semibold">TOKEN-VERIFIED ECOSYSTEM</span>
          <button
            onClick={() => onNavigate('war-room')}
            className={cn('hover:underline', isHeist ? 'text-warm-ivory/70' : 'text-slate-600')}
          >
            War Room Dashboard
          </button>
          <button
            onClick={() => onNavigate('feed')}
            className={cn('hover:underline', isHeist ? 'text-warm-ivory/70' : 'text-slate-600')}
          >
            Intelligence Feed
          </button>
        </div>
      </div>
    </div>
  )
}
