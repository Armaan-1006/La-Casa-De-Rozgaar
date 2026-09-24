import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Building2,
  Check,
  User,
  LogOut,
  Shield,
  KeyRound,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useWindowSize } from '../hooks/useWindowSize'
import { ThemeModeSwitch } from './ThemeModeSwitch'
import { cn } from '../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  currentPage: string
}

interface NavSubItem {
  label: string
  href: string
}

interface NavGroup {
  label: string
  href?: string
  description?: string
  submenu?: NavSubItem[]
}

// ============================================================================
// HEIST MODE NAVIGATION TAXONOMY (Consumer / Candidate Experience)
// ============================================================================
const heistNavigationItems: NavGroup[] = [
  {
    label: 'WAR ROOM',
    href: 'war-room',
    description: 'Command Center',
  },
  {
    label: 'INTELLIGENCE',
    submenu: [
      { label: 'Market Demand', href: 'market-intelligence' },
      { label: 'Skill Intelligence', href: 'skill-intelligence' },
      { label: 'Role Intelligence', href: 'role-intelligence' },
      { label: 'Compensation Intel', href: 'compensation' },
      { label: 'Future Forecast', href: 'forecast' },
    ],
  },
  {
    label: 'CANDIDATE',
    submenu: [
      { label: 'Candidate Dossier', href: 'candidate-dossier' },
      { label: 'Secure Assessment', href: 'assessment' },
      { label: 'Skill Heist Roadmap', href: 'skill-heist' },
      { label: 'AI Job Finder', href: 'job-finder' },
      { label: 'Career Pathways', href: 'career-intelligence' },
      { label: 'Simulation Vault', href: 'simulation' },
    ],
  },
  {
    label: 'EMPLOYER',
    submenu: [
      { label: 'Mastermind HQ', href: 'employer-dashboard' },
      { label: 'Talent Vault', href: 'talent-vault' },
      { label: 'Workforce Capability', href: 'employer-dashboard' },
      { label: 'Capability Gaps', href: 'workforce-gaps' },
    ],
  },
  {
    label: 'LEARNING & INTEL',
    submenu: [
      { label: 'Resistance Learning', href: 'roadmap' },
      { label: 'Interview Intelligence', href: 'interviews' },
      { label: 'Research Papers', href: 'research' },
      { label: 'Intelligence Feed', href: 'feed' },
    ],
  },
]

// ============================================================================
// ENTERPRISE MODE NAVIGATION TAXONOMY (Strict Anti-Vibecode Enterprise SaaS)
// ============================================================================
interface EnterpriseNavSection {
  title: string
  items: {
    label: string
    href: string
  }[]
}

const enterpriseNavSections: EnterpriseNavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Executive Overview', href: 'war-room' },
    ],
  },
  {
    title: 'MARKET INTELLIGENCE',
    items: [
      { label: 'Market Overview', href: 'market-intelligence' },
      { label: 'Skill Intelligence', href: 'skill-intelligence' },
      { label: 'Role Intelligence', href: 'role-intelligence' },
      { label: 'Compensation Benchmarks', href: 'compensation' },
      { label: 'Workforce Forecasts', href: 'forecast' },
    ],
  },
  {
    title: 'TALENT',
    items: [
      { label: 'Talent Directory', href: 'talent-vault' },
      { label: 'Candidate Profiles', href: 'candidate-dossier' },
      { label: 'Skill Assessments', href: 'assessment' },
      { label: 'Candidate Matching', href: 'job-finder' },
      { label: 'Career Pathways', href: 'career-intelligence' },
    ],
  },
  {
    title: 'WORKFORCE',
    items: [
      { label: 'Workforce Overview', href: 'employer-dashboard' },
      { label: 'Capability Gaps', href: 'workforce-gaps' },
      { label: 'Scenario Planning', href: 'simulation' },
      { label: 'Skill Development', href: 'skill-heist' },
    ],
  },
  {
    title: 'LEARNING & INSIGHTS',
    items: [
      { label: 'Learning Paths', href: 'roadmap' },
      { label: 'Technical Interviews', href: 'interviews' },
      { label: 'Empirical Research', href: 'research' },
      { label: 'Intelligence Wire', href: 'feed' },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const { isHeist } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { width } = useWindowSize()
  const isDesktop = width >= 768
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleNavClick = (href: string) => {
    if (href && onNavigate) {
      onNavigate(href)
    }
    if (!isDesktop) {
      onClose()
    }
  }

  // ==========================================================================
  // ENTERPRISE SIDEBAR
  // ==========================================================================
  if (!isHeist) {
    return (
      <>
        {/* Mobile overlay */}
        {!isDesktop && isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm md:hidden z-40"
          />
        )}

        <aside
          className={cn(
            'fixed md:static top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 md:z-auto shrink-0 flex flex-col select-none transition-transform duration-200 ease-out',
            isDesktop ? 'translate-x-0' : isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Enterprise Brand Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleNavClick('war-room')}
                className="text-left group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded bg-[#1E3A8A] flex items-center justify-center text-white font-semibold text-xs tracking-wider shrink-0 shadow-sm">
                  LR
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">
                    La Casa De Rozgaar
                  </h1>
                  <p className="text-[10px] font-medium text-slate-500 tracking-normal">
                    Enterprise Talent Intelligence
                  </p>
                </div>
              </button>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Enterprise Navigation List (Text + Hierarchy, No Icon Spam) */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
            {enterpriseNavSections.map((section) => (
              <div key={section.title} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.href === currentPage
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors block',
                          isActive
                            ? 'bg-blue-50 text-blue-800 font-semibold border-l-2 border-blue-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Enterprise Status & Switcher Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2.5">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {user.avatarInitials || 'OP'}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 text-xs truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <User size={13} />
                <span>Sign In / Register</span>
              </button>
            )}
            <ThemeModeSwitch variant="sidebar" />
          </div>
        </aside>
      </>
    )
  }

  // ==========================================================================
  // HEIST MODE SIDEBAR
  // ==========================================================================
  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm md:hidden z-40"
        />
      )}

      {/* Sidebar Panel */}
      <motion.aside
        initial={{ x: isDesktop ? 0 : -300 }}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -300 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'fixed md:static top-0 left-0 h-screen w-64 bg-gradient-obsidian border-r border-burgundy/25 overflow-y-auto z-50 md:z-auto shrink-0',
          'flex flex-col select-none'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-burgundy/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('war-room')}
              className="text-left group transition-transform duration-200 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory font-bold shadow-glow-crimson font-mono text-sm shrink-0">
                  LC
                </div>
                <div>
                  <h1 className="heading-sm text-crimson leading-tight group-hover:text-crimson-light">LA CASA</h1>
                  <h2 className="heading-xs text-warm-ivory leading-tight">DE ROZGAAR</h2>
                </div>
              </div>
              <p className="text-[9px] text-warm-ivory/50 mt-1 font-mono tracking-widest uppercase">
                THE HOUSE OF EMPLOYMENT
              </p>
            </button>
            <button
              onClick={onClose}
              className="md:hidden text-warm-ivory/60 hover:text-crimson p-1 rounded-lg hover:bg-burgundy/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {heistNavigationItems.map((item) => {
            const isDirectActive = item.href === currentPage
            const isSubActive = item.submenu?.some((s) => s.href === currentPage)
            const isExpanded = expandedMenu === item.label || isSubActive

            return (
              <div key={item.label} className="space-y-0.5">
                {item.submenu ? (
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isSubActive
                        ? 'text-crimson bg-burgundy/20 border border-crimson/30 font-bold'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 font-semibold'
                    )}
                  >
                    <span className="tracking-wider uppercase">{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200 text-warm-ivory/40',
                        isExpanded ? 'rotate-180 text-crimson' : ''
                      )}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.href!)}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isDirectActive
                        ? 'text-warm-ivory bg-gradient-crimson shadow-glow-crimson font-bold border border-crimson/50'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 font-semibold'
                    )}
                  >
                    <div>
                      <span className="tracking-wider uppercase">{item.label}</span>
                      {item.description && (
                        <p
                          className={cn(
                            'text-[9px] tracking-normal font-sans',
                            isDirectActive ? 'text-warm-ivory/80' : 'text-warm-ivory/50'
                          )}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isDirectActive && <span className="w-1.5 h-1.5 rounded-full bg-warm-ivory animate-pulse" />}
                  </button>
                )}

                {/* Submenu Children */}
                {item.submenu && isExpanded && (
                  <div className="ml-2 pl-3 border-l border-burgundy/30 space-y-0.5 py-1">
                    {item.submenu.map((subitem) => {
                      const isChildActive = subitem.href === currentPage
                      return (
                        <button
                          key={subitem.label}
                          onClick={() => handleNavClick(subitem.href)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all flex items-center justify-between font-mono',
                            isChildActive
                              ? 'text-crimson font-bold bg-burgundy/30 border-l-2 border-crimson'
                              : 'text-warm-ivory/70 hover:text-warm-ivory hover:bg-burgundy/10'
                          )}
                        >
                          <span className="truncate">{subitem.label}</span>
                          {isChildActive && <span className="text-[10px] text-crimson font-bold">●</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Status Console Panel */}
        <div className="p-3 border-t border-burgundy/25 space-y-2.5 bg-charcoal/40 sidebar-status-console">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-obsidian/80 border border-burgundy/40 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-full bg-crimson text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-glow-crimson">
                  {user.avatarInitials || 'OP'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-warm-ivory text-xs truncate flex items-center gap-1">
                    <span>{user.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] text-crimson truncate tracking-wider font-bold">[{user.role}]</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Terminate clearance session"
                className="p-1 text-warm-ivory/40 hover:text-crimson rounded hover:bg-burgundy/20 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-crimson to-blood-red hover:brightness-110 text-white text-xs font-mono font-bold shadow-glow-crimson transition-all cursor-pointer"
            >
              <Shield size={13} />
              <span>AUTHORIZE CLEARANCE</span>
            </button>
          )}

          {/* Dual Visual Mode Switcher */}
          <ThemeModeSwitch variant="sidebar" />
        </div>
      </motion.aside>
    </>
  )
}

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
  onNavigate: (page: string) => void
  onOpenCommandPalette: () => void
  onOpenNotifications: () => void
  currentPage: string
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen,
  onNavigate,
  onOpenCommandPalette,
  onOpenNotifications,
  currentPage,
}) => {
  const { isHeist } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState('Global Operations')

  const heistPageTitles: Record<string, string> = {
    'war-room': 'WAR ROOM COMMAND CENTER',
    'market-intelligence': 'MARKET INTELLIGENCE RADAR',
    'skill-intelligence': 'SKILL VELOCITY & DEMAND',
    'role-intelligence': 'ROLE COMPETENCY DOSSIERS',
    'compensation': 'COMPENSATION INTELLIGENCE',
    'forecast': 'FUTURE WORKFORCE FORECAST',
    'candidate-dossier': 'CANDIDATE CAPABILITY DOSSIER',
    'assessment': 'SECURE PROCTORED ASSESSMENT',
    'skill-heist': 'SKILL HEIST ROADMAP',
    'job-finder': 'AI JOB MATCHING ENGINE',
    'career-intelligence': 'CAREER INTELLIGENCE PATHWAYS',
    'simulation': 'SIMULATION VAULT SCENARIO ENGINE',
    'employer-dashboard': 'EMPLOYER MASTERMIND HQ',
    'talent-vault': 'TALENT VAULT RECRUIT DISCOVERY',
    'workforce-gaps': 'WORKFORCE GAP ANALYSIS',
    'roadmap': 'RESISTANCE LEARNING SPRINT',
    'interviews': 'INTERVIEW INTELLIGENCE SYSTEM',
    'research': 'RESEARCH INTELLIGENCE REPOSITORY',
    'feed': 'INTELLIGENCE WIRE & WHAT\'S NEW',
  }

  const enterprisePageTitles: Record<string, string> = {
    'war-room': 'Executive Overview',
    'market-intelligence': 'Market Demand & Labor Dynamics',
    'skill-intelligence': 'Skill Intelligence & Analytics',
    'role-intelligence': 'Role Architecture & Competency',
    'compensation': 'Compensation & Market Benchmarks',
    'forecast': 'Workforce Demand Forecasts',
    'candidate-dossier': 'Candidate Profile & Competency Matrix',
    'assessment': 'Standardized Skills Assessment',
    'skill-heist': 'Skill Development & Upskilling Roadmap',
    'job-finder': 'Candidate Matching Engine',
    'career-intelligence': 'Career Pathways & Mobility',
    'simulation': 'Workforce Scenario Simulator',
    'employer-dashboard': 'Workforce Overview & Capability',
    'talent-vault': 'Talent Directory',
    'workforce-gaps': 'Workforce Gap Analysis',
    'roadmap': 'Learning Paths & Curriculum',
    'interviews': 'Technical Interview Intelligence',
    'research': 'Empirical Labor & AI Research',
    'feed': 'Market Intelligence Wire',
  }

  // ==========================================================================
  // ENTERPRISE HEADER
  // ==========================================================================
  if (!isHeist) {
    const title = enterprisePageTitles[currentPage] || 'Workforce Intelligence'

    return (
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5 gap-4">
          {/* Left: Mobile trigger & Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 -ml-1 rounded hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                Acme Technologies <span className="text-slate-300 mx-1">/</span> Workforce Analytics
              </div>
              <h1 className="text-sm md:text-base font-semibold text-slate-900 leading-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 hover:border-slate-300 text-slate-500 text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">Search candidates, skills, roles, reports...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white text-slate-600 rounded border border-slate-200 font-mono shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right: Workspace Switcher, Notifications, Mode Switch, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Workspace Switcher */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              >
                <Building2 size={13} className="text-slate-500" />
                <span>{selectedWorkspace}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspaces
                  </div>
                  {['Global Operations', 'Engineering & Tech', 'Product Operations'].map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setSelectedWorkspace(ws)
                        setWorkspaceMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>{ws}</span>
                      {selectedWorkspace === ws && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Mode Switcher */}
            <ThemeModeSwitch variant="compact" />

            {/* Notifications Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {/* User Profile / Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 text-left hover:opacity-85 transition-opacity cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
                    {user.avatarInitials || 'OP'}
                  </div>
                  <div className="text-left text-xs leading-none hidden xl:block">
                    <div className="font-semibold text-slate-800">{user.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{user.role}</div>
                  </div>
                  <ChevronDown size={13} className="text-slate-400 hidden xl:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="text-[10px] mt-1 inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold font-mono">
                        {user.role}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onNavigate(user.role === 'CANDIDATE' ? 'candidate-dossier' : 'employer-dashboard')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <User size={13} />
                      <span>{user.role === 'CANDIDATE' ? 'My Candidate Dossier' : 'My Workspace'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onNavigate('login')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound size={13} />
                      <span>Switch Operative Clearance</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
              >
                <User size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    )
  }

  // ==========================================================================
  // HEIST HEADER
  // ==========================================================================
  const currentTitle = heistPageTitles[currentPage] || 'INTELLIGENCE TALENT COMMAND'

  return (
    <header className="sticky top-0 z-30 border-b border-burgundy/20 bg-charcoal/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
        {/* Mobile menu & current operation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-warm-ivory/80 hover:text-crimson p-1.5 -ml-1 rounded-lg hover:bg-burgundy/20"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button onClick={() => onNavigate('war-room')} className="hidden sm:block text-left group">
            <span className="text-[10px] font-mono text-crimson font-bold uppercase tracking-wider block group-hover:underline header-op-tag">
              OPERATION // ACTIVE
            </span>
            <h2 className="text-xs md:text-sm font-heading font-bold text-warm-ivory tracking-wide header-title-text">
              {currentTitle}
            </h2>
          </button>
        </div>

        {/* Global Search Button / Trigger */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#17171B] rounded-lg border border-[#2C2C34] hover:border-crimson/70 text-white text-xs font-mono transition-all shadow-sm group header-search-box"
          >
            <div className="flex items-center gap-2.5">
              <Search size={14} className="text-crimson shrink-0 header-search-icon" />
              <span className="text-[#E0E0EA] group-hover:text-white transition-colors truncate header-search-text">
                Search intelligence, candidates, jobs...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#25252D] text-[#D0D0DC] rounded border border-[#3C3C48] font-bold shrink-0 header-search-kbd">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Visual Mode Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dual Visual Mode Switcher */}
          <ThemeModeSwitch variant="compact" />

          {/* Mobile search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-[#17171B] border border-[#2C2C34] rounded-lg text-white hover:text-crimson transition-colors header-search-box"
            aria-label="Open search palette"
          >
            <Search size={15} className="text-crimson header-search-icon" />
            <span className="text-[10px] font-mono text-[#D0D0DC] font-semibold header-search-text">SEARCH</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-warm-ivory/70 hover:text-crimson rounded-lg hover:bg-burgundy/20 transition-colors header-bell-btn cursor-pointer"
            title="Intelligence Alerts"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson animate-pulse" />
          </button>

          {/* User Profile / Login Button in Heist Mode */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-burgundy/30 text-left hover:opacity-90 transition-opacity cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-crimson to-blood-red text-white flex items-center justify-center font-bold text-xs shadow-glow-crimson border border-crimson/60">
                  {user.avatarInitials || 'OP'}
                </div>
                <div className="text-left text-xs leading-none hidden xl:block font-mono">
                  <div className="font-bold text-warm-ivory flex items-center gap-1">
                    <span>{user.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] text-crimson font-bold mt-0.5">[{user.role}]</div>
                </div>
                <ChevronDown size={13} className="text-warm-ivory/40 hidden xl:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-charcoal/95 border border-burgundy/60 rounded-xl shadow-glow-crimson py-2 z-50 text-xs font-mono backdrop-blur-md">
                  <div className="px-3.5 py-2 border-b border-burgundy/30">
                    <div className="font-bold text-warm-ivory">{user.name}</div>
                    <div className="text-[10px] text-warm-ivory/50 truncate">{user.email}</div>
                    <div className="text-[9px] mt-1 inline-block px-1.5 py-0.5 bg-crimson/20 text-crimson border border-crimson/40 rounded font-bold">
                      CLEARANCE: {user.role}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onNavigate(user.role === 'CANDIDATE' ? 'candidate-dossier' : 'employer-dashboard')
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-burgundy/20 text-warm-ivory flex items-center gap-2 cursor-pointer"
                  >
                    <User size={13} className="text-crimson" />
                    <span>{user.role === 'CANDIDATE' ? 'Candidate Dossier' : 'Mastermind Console'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onNavigate('login')
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-burgundy/20 text-warm-ivory flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound size={13} className="text-crimson" />
                    <span>Switch Operative Clearance</span>
                  </button>
                  <div className="border-t border-burgundy/30 my-1" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-crimson/20 text-crimson font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>TERMINATE SESSION</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-crimson to-blood-red text-white text-xs font-mono font-bold shadow-glow-crimson hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Shield size={13} />
              <span>AUTHORIZE // LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

