import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Zap,
  TrendingUp,
  Target,
  Briefcase,
  DollarSign,
  Activity,
  User,
  ShieldCheck,
  Compass,
  Sparkles,
  Brain,
  Users,
  Layers,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  FileText,
  Bell,
  Sliders,
  ChevronDown,
} from 'lucide-react'
import { useTheme, useWindowSize } from '../hooks/useTheme'
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
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  href?: string
  icon: React.ReactNode
  description?: string
  submenu?: NavSubItem[]
}

const navigationItems: NavGroup[] = [
  {
    label: 'WAR ROOM',
    href: 'war-room',
    icon: <Zap size={16} className="text-crimson" />,
    description: 'Command Center',
  },
  {
    label: 'INTELLIGENCE',
    icon: <TrendingUp size={16} className="text-crimson" />,
    submenu: [
      { label: 'Market Demand', href: 'market-intelligence', icon: <TrendingUp size={14} /> },
      { label: 'Skill Intelligence', href: 'skill-intelligence', icon: <Target size={14} /> },
      { label: 'Role Intelligence', href: 'role-intelligence', icon: <Briefcase size={14} /> },
      { label: 'Compensation Intel', href: 'compensation', icon: <DollarSign size={14} /> },
      { label: 'Future Forecast', href: 'forecast', icon: <Activity size={14} /> },
    ],
  },
  {
    label: 'CANDIDATE',
    icon: <User size={16} className="text-emerald-400" />,
    submenu: [
      { label: 'Candidate Dossier', href: 'candidate-dossier', icon: <User size={14} /> },
      { label: 'Secure Assessment', href: 'assessment', icon: <ShieldCheck size={14} /> },
      { label: 'Skill Heist Roadmap', href: 'skill-heist', icon: <Sliders size={14} /> },
      { label: 'AI Job Finder', href: 'job-finder', icon: <Search size={14} /> },
      { label: 'Career Pathways', href: 'career-intelligence', icon: <Compass size={14} /> },
      { label: 'Simulation Vault', href: 'simulation', icon: <Sparkles size={14} /> },
    ],
  },
  {
    label: 'EMPLOYER',
    icon: <Brain size={16} className="text-muted-gold" />,
    submenu: [
      { label: 'Mastermind HQ', href: 'employer-dashboard', icon: <Brain size={14} /> },
      { label: 'Talent Vault', href: 'talent-vault', icon: <Users size={14} /> },
      { label: 'Workforce Capability', href: 'employer-dashboard', icon: <Layers size={14} /> },
      { label: 'Capability Gaps', href: 'workforce-gaps', icon: <AlertTriangle size={14} /> },
    ],
  },
  {
    label: 'LEARNING & INTEL',
    icon: <BookOpen size={16} className="text-amber-400" />,
    submenu: [
      { label: 'Resistance Learning', href: 'roadmap', icon: <BookOpen size={14} /> },
      { label: 'Interview Intelligence', href: 'interviews', icon: <MessageSquare size={14} /> },
      { label: 'Research Papers', href: 'research', icon: <FileText size={14} /> },
      { label: 'Intelligence Feed', href: 'feed', icon: <Bell size={14} /> },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const { isDark, toggleTheme } = useTheme()
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
          {navigationItems.map((item) => {
            const isDirectActive = item.href === currentPage
            const isSubActive = item.submenu?.some((s) => s.href === currentPage)
            const isExpanded = expandedMenu === item.label || isSubActive

            return (
              <div key={item.label} className="space-y-0.5">
                {item.submenu ? (
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isSubActive
                        ? 'text-crimson bg-burgundy/20 border border-crimson/30 font-bold'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="tracking-wider">{item.label}</span>
                    </div>
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
                      'w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isDirectActive
                        ? 'text-warm-ivory bg-gradient-crimson shadow-glow-crimson font-bold border border-crimson/50'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0">{item.icon}</span>
                      <div>
                        <span className="tracking-wider">{item.label}</span>
                        {item.description && (
                          <p
                            className={cn(
                              'text-[9px] tracking-normal font-sans',
                              isDirectActive ? 'text-warm-ivory/80' : 'text-warm-ivory/40'
                            )}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isDirectActive && <span className="w-1.5 h-1.5 rounded-full bg-warm-ivory animate-pulse" />}
                  </button>
                )}

                {/* Submenu Children */}
                {item.submenu && isExpanded && (
                  <div className="ml-3 pl-2.5 border-l border-burgundy/30 space-y-0.5 py-1">
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
                          <span className="flex items-center gap-2 truncate">
                            <span className="shrink-0 opacity-70">{subitem.icon}</span>
                            <span className="truncate">{subitem.label}</span>
                          </span>
                          {isChildActive && <span className="text-[10px] text-crimson">●</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3.5 border-t border-burgundy/20 space-y-2.5 bg-charcoal/30">
          <div className="flex items-center justify-between px-3 py-1.5 bg-burgundy/10 rounded border border-burgundy/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider">
                NETWORK // LIVE
              </span>
            </div>
            <span className="text-[9px] font-mono text-warm-ivory/40">LC-2026.4</span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 rounded-lg transition-all border border-burgundy/20 font-mono"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Moon size={14} className="text-crimson" /> : <Sun size={14} className="text-amber-400" />}
              <span>THEME PROTOCOL</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-burgundy/20 font-bold">
              {isDark ? 'OBSIDIAN' : 'IVORY'}
            </span>
          </button>
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
  const pageTitles: Record<string, string> = {
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

  const currentTitle = pageTitles[currentPage] || 'INTELLIGENCE TALENT COMMAND'

  return (
    <header className="sticky top-0 z-30 border-b border-burgundy/20 bg-charcoal/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
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
            <span className="text-[10px] font-mono text-crimson font-bold uppercase tracking-wider block group-hover:underline">
              OPERATION // ACTIVE
            </span>
            <h2 className="text-xs md:text-sm font-heading font-bold text-warm-ivory tracking-wide">
              {currentTitle}
            </h2>
          </button>
        </div>

        {/* Global Search Button / Trigger */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-burgundy/10 rounded-lg border border-burgundy/25 hover:border-crimson/50 text-warm-ivory/60 hover:text-warm-ivory text-xs font-mono transition-all"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-crimson" />
              <span>Search intelligence, candidates, jobs...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-charcoal text-warm-ivory/50 rounded border border-burgundy/30">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Mobile search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 text-warm-ivory/70 hover:text-crimson rounded-lg hover:bg-burgundy/20"
          >
            <Search size={18} />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-warm-ivory/70 hover:text-crimson rounded-lg hover:bg-burgundy/20 transition-colors"
            title="Intelligence Alerts"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson animate-pulse" />
          </button>

          {/* Status Indicator */}
          <div className="hidden lg:block text-right text-xs font-mono pl-2 border-l border-burgundy/20">
            <p className="text-crimson font-bold flex items-center justify-end gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-ping" />
              SECURE SESSION
            </p>
            <p className="text-warm-ivory/40 text-[9px]">ENCRYPTED TELEMETRY</p>
          </div>
        </div>
      </div>
    </header>
  )
}
