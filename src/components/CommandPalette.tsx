import { useState, useEffect, useMemo, type ReactNode, type FC } from 'react'
import { Search, X, Zap, User, Briefcase, FileText, CornerDownLeft, Shield } from 'lucide-react'
import { mockJobs, mockMarketData, mockTalentVaultCandidates } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

interface PaletteItem {
  id: string
  title: string
  subtitle: string
  category: 'NAVIGATION' | 'JOBS' | 'CANDIDATES' | 'SKILLS'
  pageTarget: string
  icon: ReactNode
}

export const CommandPalette: FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { setMode, isHeist } = useTheme()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Global key listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const allItems: PaletteItem[] = useMemo(() => {
    const themeCommands: PaletteItem[] = [
      {
        id: 'cmd-theme-toggle',
        title: isHeist ? 'Switch to Professional Mode' : 'Switch to Heist Mode',
        subtitle: isHeist
          ? 'Transform interface into clean enterprise talent intelligence workspace'
          : 'Arm classified Money Heist tactical intelligence command center',
        category: 'NAVIGATION',
        pageTarget: isHeist ? '__theme:professional' : '__theme:heist',
        icon: isHeist ? <Briefcase size={14} className="text-blue-400" /> : <Shield size={14} className="text-crimson" />,
      },
    ]

    const pages: PaletteItem[] = [
      { id: 'p-0', title: isHeist ? 'Identity & Access // Operative Clearance' : 'Authentication & Login Gateway', subtitle: 'Sign in, request clearance, or switch operative personas', category: 'NAVIGATION', pageTarget: 'login', icon: <Shield size={14} className="text-crimson" /> },
      { id: 'p-1', title: isHeist ? 'War Room Command' : 'Executive Overview', subtitle: 'Macro Overview & Intelligence Pulse', category: 'NAVIGATION', pageTarget: 'war-room', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-2', title: isHeist ? 'Market Intelligence Radar' : 'Market Demand Dynamics', subtitle: 'Hiring Volume, Velocity & Geo Analysis', category: 'NAVIGATION', pageTarget: 'market-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-3', title: isHeist ? 'Skill Intelligence Radar' : 'Skill Analytics & Adoption', subtitle: 'Tech Adoption Curves & Pairings', category: 'NAVIGATION', pageTarget: 'skill-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-4', title: isHeist ? 'Role Intelligence Dossiers' : 'Role Competencies', subtitle: 'Competency Blueprints & Pathways', category: 'NAVIGATION', pageTarget: 'role-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-5', title: 'Compensation Intelligence', subtitle: 'Salary Percentiles & City Multipliers', category: 'NAVIGATION', pageTarget: 'compensation', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-6', title: 'Future Workforce Forecast', subtitle: '3-Year Horizon & Obsolescence Risk', category: 'NAVIGATION', pageTarget: 'forecast', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-7', title: isHeist ? 'Candidate Dossier Profile' : 'Candidate Competency Dossier', subtitle: 'Alex Rivera Capability Benchmark', category: 'NAVIGATION', pageTarget: 'candidate-dossier', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-8', title: 'Secure Skill Assessment', subtitle: 'Timed Proctored Examination', category: 'NAVIGATION', pageTarget: 'assessment', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-9', title: isHeist ? 'Skill Heist Roadmap' : 'Targeted Upskilling Plan', subtitle: 'Gap Elimination & Sprint Planning', category: 'NAVIGATION', pageTarget: 'skill-heist', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-10', title: 'AI Job Finder', subtitle: 'Explainable Fit & Opportunities', category: 'NAVIGATION', pageTarget: 'job-finder', icon: <Briefcase size={14} className="text-blue-400" /> },
      { id: 'p-11', title: 'Career Intelligence', subtitle: 'Promotional Vectors & Milestones', category: 'NAVIGATION', pageTarget: 'career-intelligence', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-12', title: 'Simulation Vault', subtitle: 'Interactive What-If Skill Sandbox', category: 'NAVIGATION', pageTarget: 'simulation', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-13', title: isHeist ? 'Employer Mastermind HQ' : 'Employer Workforce HQ', subtitle: 'Workforce Planning & Capability', category: 'NAVIGATION', pageTarget: 'employer-dashboard', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-14', title: 'Talent Vault Discovery', subtitle: 'Recruiter Candidate Search', category: 'NAVIGATION', pageTarget: 'talent-vault', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-15', title: 'Workforce Gap Matrix', subtitle: 'Current vs Strategic Demand', category: 'NAVIGATION', pageTarget: 'workforce-gaps', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-16', title: isHeist ? 'Resistance Learning Sprints' : 'Structured Learning Curriculum', subtitle: 'Gap-Driven Curriculum', category: 'NAVIGATION', pageTarget: 'roadmap', icon: <FileText size={14} className="text-amber-400" /> },
      { id: 'p-17', title: 'Interview Intelligence', subtitle: 'Reported Technical Questions', category: 'NAVIGATION', pageTarget: 'interviews', icon: <FileText size={14} className="text-amber-400" /> },
      { id: 'p-18', title: 'Research Intelligence', subtitle: 'Foundational AI Papers', category: 'NAVIGATION', pageTarget: 'research', icon: <FileText size={14} className="text-amber-400" /> },
      { id: 'p-19', title: 'Intelligence Feed Wire', subtitle: 'Live Briefings & Alerts', category: 'NAVIGATION', pageTarget: 'feed', icon: <Zap size={14} className="text-crimson" /> },
    ]

    const jobs: PaletteItem[] = mockJobs.map((j) => ({
      id: j.id,
      title: j.title,
      subtitle: `${j.company} • ${j.salary} • Match: ${j.matchScore}%`,
      category: 'JOBS',
      pageTarget: 'job-finder',
      icon: <Briefcase size={14} className="text-blue-400" />,
    }))

    const candidates: PaletteItem[] = mockTalentVaultCandidates.map((c) => ({
      id: c.id,
      title: `${c.name} (${c.codeName})`,
      subtitle: `${c.targetRole} • Readiness: ${c.readinessScore}%`,
      category: 'CANDIDATES',
      pageTarget: 'talent-vault',
      icon: <User size={14} className="text-emerald-400" />,
    }))

    const skills: PaletteItem[] = mockMarketData.topSkills.map((s) => ({
      id: `skill-${s.name}`,
      title: `Skill: ${s.name}`,
      subtitle: `${s.demand}% Market Share • Momentum: ${s.trend}`,
      category: 'SKILLS',
      pageTarget: 'skill-intelligence',
      icon: <Zap size={14} className="text-crimson" />,
    }))

    return [...themeCommands, ...pages, ...jobs, ...candidates, ...skills]
  }, [isHeist])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8)
    const q = query.toLowerCase()
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [allItems, query])

  const handleSelect = (target: string) => {
    if (target === '__theme:professional') {
      setMode('professional')
      onClose()
      return
    }
    if (target === '__theme:heist') {
      setMode('heist')
      onClose()
      return
    }
    onNavigate(target)
    onClose()
  }

  // Keyboard navigation up / down / enter
  useEffect(() => {
    if (!isOpen) return
    const handleNavKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex].pageTarget)
        }
      }
    }
    window.addEventListener('keydown', handleNavKeys)
    return () => window.removeEventListener('keydown', handleNavKeys)
  }, [isOpen, filtered, selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
      <div
        className={cn(
          'card max-w-2xl w-full p-0 overflow-hidden flex flex-col max-h-[80vh] transition-colors',
          isHeist
            ? 'bg-charcoal border-crimson/50 shadow-glow-crimson'
            : 'bg-white border-slate-200 shadow-2xl rounded-xl'
        )}
      >
        {/* Search Input Bar */}
        <div
          className={cn(
            'p-4 border-b flex items-center gap-3',
            isHeist ? 'border-burgundy/30 bg-obsidian/70' : 'border-slate-200 bg-slate-50'
          )}
        >
          <Search size={18} className={isHeist ? 'text-crimson' : 'text-slate-600'} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={
              isHeist
                ? 'Type an operation, dossier, job, or skill code...'
                : 'Search analytics, modules, candidates, jobs, or skills...'
            }
            className={cn(
              'flex-1 bg-transparent text-sm outline-none',
              isHeist
                ? 'font-mono text-warm-ivory placeholder-warm-ivory/40'
                : 'font-sans text-slate-900 placeholder-slate-400 font-medium'
            )}
          />
          <kbd
            className={cn(
              'px-2 py-0.5 text-[10px] font-mono rounded border',
              isHeist
                ? 'bg-burgundy/20 border-burgundy/30 text-warm-ivory/60'
                : 'bg-white border-slate-200 text-slate-500'
            )}
          >
            ESC
          </kbd>
          <button
            onClick={onClose}
            className={isHeist ? 'text-warm-ivory/40 hover:text-crimson' : 'text-slate-400 hover:text-slate-700'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.pageTarget)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg flex items-center justify-between text-xs transition-colors border',
                    isHeist
                      ? isSelected
                        ? 'bg-burgundy/30 border-crimson/60 text-warm-ivory font-bold shadow-glow-crimson font-mono'
                        : 'border-transparent text-warm-ivory/80 hover:bg-burgundy/15 font-mono'
                      : isSelected
                      ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold font-sans shadow-sm'
                      : 'border-transparent text-slate-700 hover:bg-slate-50 font-sans'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'p-1.5 rounded',
                        isHeist ? 'bg-burgundy/20' : 'bg-slate-100 border border-slate-200'
                      )}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p
                        className={cn(
                          'text-sm leading-tight',
                          isHeist ? 'text-warm-ivory font-semibold' : 'text-slate-900 font-semibold'
                        )}
                      >
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          'text-[11px] mt-0.5',
                          isHeist ? 'text-warm-ivory/50 font-mono' : 'text-slate-500 font-sans'
                        )}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold font-mono',
                        isHeist
                          ? 'bg-burgundy/20 text-crimson'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      )}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={14} className={isHeist ? 'text-crimson' : 'text-slate-600'} />
                    )}
                  </div>
                </button>
              )
            })
          ) : (
            <div
              className={cn(
                'p-8 text-center text-xs',
                isHeist ? 'font-mono text-warm-ivory/40' : 'font-sans text-slate-400'
              )}
            >
              {isHeist ? `No tactical records match "${query}".` : `No matching results found for "${query}".`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'p-2.5 border-t flex items-center justify-between text-[11px]',
            isHeist
              ? 'bg-obsidian/80 border-burgundy/30 font-mono text-warm-ivory/40'
              : 'bg-slate-50 border-slate-200 font-sans text-slate-500'
          )}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ARROWS
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ENTER
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ESC
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className={isHeist ? 'text-crimson font-bold font-mono' : 'text-slate-700 font-semibold font-sans'}>
            {isHeist ? 'COMMAND PALETTE // ACTIVE' : 'COMMAND SEARCH'}
          </span>
        </div>
      </div>
    </div>
  )
}
