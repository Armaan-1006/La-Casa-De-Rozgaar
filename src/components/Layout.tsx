import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Search, ExternalLink } from 'lucide-react'
import { useTheme, useWindowSize } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (page: string) => void
  currentPage?: string
}

const navigationItems = [
  {
    label: 'WAR ROOM',
    href: 'war-room',
    icon: '⚡',
    description: 'Command Center',
  },
  {
    label: 'INTELLIGENCE',
    submenu: [
      { label: 'Market Demand', href: 'market-intelligence', icon: '📊' },
      { label: 'Skill Intelligence', href: 'skill-intelligence', icon: '🎯' },
      { label: 'Role Forecasts', href: 'market-intelligence', icon: '💼' },
      { label: 'Compensation Intel', href: 'market-intelligence', icon: '💰' },
    ],
  },
  {
    label: 'CANDIDATE',
    submenu: [
      { label: 'Dossier Profile', href: 'candidate-dossier', icon: '👤' },
      { label: 'Skill Heist', href: 'skill-heist', icon: '🎲' },
      { label: 'Job Finder', href: 'job-finder', icon: '🔍' },
      { label: 'Career Simulator', href: 'simulation', icon: '🚀' },
    ],
  },
  {
    label: 'SIMULATION',
    href: 'simulation',
    icon: '🎬',
    description: 'Simulation Vault',
  },
  {
    label: 'EMPLOYER',
    submenu: [
      { label: 'Mastermind HQ', href: 'employer-dashboard', icon: '🧠' },
      { label: 'Talent Vault', href: 'candidate-dossier', icon: '👥' },
      { label: 'Workforce Capability', href: 'skill-intelligence', icon: '📈' },
      { label: 'Capability Gaps', href: 'employer-dashboard', icon: '⚠️' },
    ],
  },
  {
    label: 'LEARNING',
    submenu: [
      { label: 'Resistance Roadmap', href: 'skill-heist', icon: '📚' },
      { label: 'Simulation Drills', href: 'simulation', icon: '💬' },
      { label: 'Market Feed', href: 'market-intelligence', icon: '📡' },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage = 'war-room' }) => {
  const { isDark, toggleTheme } = useTheme()
  const { width } = useWindowSize()
  const isDesktop = width >= 768
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleNavClick = (href: string) => {
    if (href && href !== '#' && onNavigate) {
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isDesktop ? 0 : -300 }}
        animate={{ x: isDesktop ? 0 : (isOpen ? 0 : -300) }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed md:static top-0 left-0 h-screen w-64 bg-gradient-obsidian border-r border-burgundy/20 overflow-y-auto z-50 md:z-auto shrink-0',
          'flex flex-col select-none'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-burgundy/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('war-room')}
              className="text-left group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🎭</span>
                <div>
                  <h1 className="heading-sm text-crimson leading-tight group-hover:text-crimson-light">LA CASA</h1>
                  <h2 className="heading-xs text-warm-ivory leading-tight">DE ROZGAAR</h2>
                </div>
              </div>
              <p className="text-[10px] text-steel mt-1.5 font-mono tracking-widest uppercase">THE HOUSE OF EMPLOYMENT</p>
            </button>
            <button
              onClick={onClose}
              className="md:hidden text-warm-ivory/60 hover:text-crimson p-1 rounded-lg hover:bg-burgundy/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isDirectActive = item.href === currentPage
            const isSubActive = item.submenu?.some((s) => s.href === currentPage)
            const isExpanded = expandedMenu === item.label || isSubActive

            return (
              <div key={item.label} className="space-y-1">
                {item.submenu ? (
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={cn(
                      'w-full text-left px-3.5 py-2.5 text-xs font-mono rounded-lg transition-all duration-200 flex items-center justify-between',
                      isSubActive
                        ? 'text-crimson bg-burgundy/20 border border-crimson/30 font-bold'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{item.label === 'INTELLIGENCE' ? '📊' : item.label === 'CANDIDATE' ? '👤' : item.label === 'EMPLOYER' ? '🧠' : '📚'}</span>
                      <span className="tracking-wider">{item.label}</span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] transform transition-transform duration-200 text-warm-ivory/40',
                        isExpanded ? 'rotate-180 text-crimson' : ''
                      )}
                    >
                      ▼
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.href!)}
                    className={cn(
                      'w-full text-left px-3.5 py-2.5 text-xs font-mono rounded-lg transition-all duration-200 flex items-center justify-between',
                      isDirectActive
                        ? 'text-warm-ivory bg-gradient-crimson shadow-glow-crimson font-bold border border-crimson/50'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{item.icon}</span>
                      <div>
                        <span className="tracking-wider">{item.label}</span>
                        {item.description && (
                          <p className={cn(
                            'text-[10px] tracking-normal font-sans',
                            isDirectActive ? 'text-warm-ivory/80' : 'text-warm-ivory/40'
                          )}>{item.description}</p>
                        )}
                      </div>
                    </div>
                    {isDirectActive && <span className="w-1.5 h-1.5 rounded-full bg-warm-ivory animate-pulse" />}
                  </button>
                )}

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 pl-3 border-l border-burgundy/30 space-y-1 py-1"
                  >
                    {item.submenu.map((subitem) => {
                      const isChildActive = subitem.href === currentPage
                      return (
                        <button
                          key={subitem.label}
                          onClick={() => handleNavClick(subitem.href)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 flex items-center justify-between font-mono',
                            isChildActive
                              ? 'text-crimson font-bold bg-burgundy/30 border-l-2 border-crimson'
                              : 'text-warm-ivory/60 hover:text-warm-ivory hover:bg-burgundy/10'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xs">{subitem.icon}</span>
                            <span>{subitem.label}</span>
                          </span>
                          {isChildActive && <span className="text-[10px] text-crimson">●</span>}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-burgundy/20 space-y-3 bg-charcoal/30">
          <div className="flex items-center justify-between px-3 py-2 bg-burgundy/10 rounded-lg border border-burgundy/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider">NETWORK // SECURE</span>
            </div>
            <span className="text-[10px] font-mono text-warm-ivory/40">v2.4.0</span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 rounded-lg transition-all duration-200 border border-burgundy/20 font-mono"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Moon size={14} className="text-crimson" /> : <Sun size={14} className="text-amber-400" />}
              <span>THEME PROTOCOL</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-burgundy/20 font-bold">{isDark ? 'OBSIDIAN' : 'IVORY'}</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
  onNavigate?: (page: string) => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen, onNavigate }) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const searchablePages = [
    { name: 'War Room Command', page: 'war-room', category: 'HQ', icon: '⚡' },
    { name: 'Market Demand & Skills', page: 'market-intelligence', category: 'Intelligence', icon: '📊' },
    { name: 'Skill Intelligence Radar', page: 'skill-intelligence', category: 'Intelligence', icon: '🎯' },
    { name: 'Candidate Dossier', page: 'candidate-dossier', category: 'Talent', icon: '👤' },
    { name: 'Skill Heist Roadmap', page: 'skill-heist', category: 'Assessment', icon: '🎲' },
    { name: 'Job Matching Intelligence', page: 'job-finder', category: 'Jobs', icon: '🔍' },
    { name: 'Career Simulation Vault', page: 'simulation', category: 'Simulation', icon: '🎬' },
    { name: 'Employer Mastermind', page: 'employer-dashboard', category: 'Employer', icon: '🧠' },
  ]

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchablePages.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSelectPage = (page: string) => {
    if (onNavigate) {
      onNavigate(page)
    }
    setSearchQuery('')
    setSearchFocused(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b transition-all duration-300',
        scrollPosition > 10
          ? 'bg-charcoal/90 border-burgundy/30 backdrop-blur-md shadow-lg'
          : 'bg-charcoal/50 border-burgundy/10 backdrop-blur-sm'
      )}
    >
      <div className="flex items-center justify-between px-6 py-3.5">
        <button
          onClick={onMenuClick}
          className="md:hidden text-warm-ivory/80 hover:text-crimson transition-colors p-2 -ml-2 rounded-lg hover:bg-burgundy/20"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="relative hidden md:block flex-1 max-w-md">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-burgundy/10 rounded-lg border border-burgundy/30 focus-within:border-crimson focus-within:ring-1 focus-within:ring-crimson/50 transition-all">
            <Search size={16} className="text-warm-ivory/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredPages.length > 0) {
                  handleSelectPage(filteredPages[0].page)
                }
              }}
              placeholder="Search intelligence, candidates, jobs..."
              className="flex-1 bg-transparent text-xs outline-none text-warm-ivory placeholder-warm-ivory/40 font-mono"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-charcoal text-warm-ivory/50 rounded border border-burgundy/30">
              /
            </kbd>
          </div>

          {/* Quick search dropdown */}
          <AnimatePresence>
            {searchFocused && filteredPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-charcoal border border-crimson/40 rounded-lg shadow-glow-crimson p-2 z-50 space-y-1"
              >
                {filteredPages.map((item) => (
                  <button
                    key={item.page}
                    onMouseDown={() => handleSelectPage(item.page)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-burgundy/30 flex items-center justify-between text-xs font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 text-warm-ivory">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[10px] text-crimson uppercase tracking-wider">{item.category}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs font-mono">
            <p className="text-crimson font-bold flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-ping" />
              OPERATION // ACTIVE
            </p>
            <p className="text-warm-ivory/50 text-[10px]">INTELLIGENCE NETWORK // LIVE</p>
          </div>
        </div>
      </div>
    </header>
  )
}

