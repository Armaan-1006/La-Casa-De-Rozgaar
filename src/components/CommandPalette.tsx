import { useState, useEffect, useMemo, type ReactNode, type FC } from 'react'
import { Search, X, Zap, User, Briefcase, FileText, CornerDownLeft } from 'lucide-react'
import { mockJobs, mockMarketData, mockTalentVaultCandidates } from '../data/mockData'
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
    const pages: PaletteItem[] = [
      { id: 'p-1', title: 'War Room Command', subtitle: 'Macro Overview & Intelligence Pulse', category: 'NAVIGATION', pageTarget: 'war-room', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-2', title: 'Market Intelligence Radar', subtitle: 'Hiring Volume, Velocity & Geo Analysis', category: 'NAVIGATION', pageTarget: 'market-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-3', title: 'Skill Intelligence Radar', subtitle: 'Tech Adoption Curves & Pairings', category: 'NAVIGATION', pageTarget: 'skill-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-4', title: 'Role Intelligence Dossiers', subtitle: 'Competency Blueprints & Pathways', category: 'NAVIGATION', pageTarget: 'role-intelligence', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-5', title: 'Compensation Intelligence', subtitle: 'Salary Percentiles & City Multipliers', category: 'NAVIGATION', pageTarget: 'compensation', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-6', title: 'Future Workforce Forecast', subtitle: '3-Year Horizon & Obsolescence Risk', category: 'NAVIGATION', pageTarget: 'forecast', icon: <Zap size={14} className="text-crimson" /> },
      { id: 'p-7', title: 'Candidate Dossier Profile', subtitle: 'Operative Alex Rivera Benchmark', category: 'NAVIGATION', pageTarget: 'candidate-dossier', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-8', title: 'Secure Skill Assessment', subtitle: 'Timed Proctored Examination', category: 'NAVIGATION', pageTarget: 'assessment', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-9', title: 'Skill Heist Roadmap', subtitle: 'Gap Elimination & Sprint Planning', category: 'NAVIGATION', pageTarget: 'skill-heist', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-10', title: 'AI Job Finder', subtitle: 'Explainable Fit & Opportunities', category: 'NAVIGATION', pageTarget: 'job-finder', icon: <Briefcase size={14} className="text-blue-400" /> },
      { id: 'p-11', title: 'Career Intelligence', subtitle: 'Promotional Vectors & Milestones', category: 'NAVIGATION', pageTarget: 'career-intelligence', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-12', title: 'Simulation Vault', subtitle: 'Interactive What-If Skill Sandbox', category: 'NAVIGATION', pageTarget: 'simulation', icon: <User size={14} className="text-emerald-400" /> },
      { id: 'p-13', title: 'Employer Mastermind HQ', subtitle: 'Workforce Planning & Capability', category: 'NAVIGATION', pageTarget: 'employer-dashboard', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-14', title: 'Talent Vault Discovery', subtitle: 'Recruiter Candidate Search', category: 'NAVIGATION', pageTarget: 'talent-vault', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-15', title: 'Workforce Gap Matrix', subtitle: 'Current vs Strategic Demand', category: 'NAVIGATION', pageTarget: 'workforce-gaps', icon: <Briefcase size={14} className="text-muted-gold" /> },
      { id: 'p-16', title: 'Resistance Learning Sprints', subtitle: 'Gap-Driven Curriculum', category: 'NAVIGATION', pageTarget: 'roadmap', icon: <FileText size={14} className="text-amber-400" /> },
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

    return [...pages, ...jobs, ...candidates, ...skills]
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8)
    const q = query.toLowerCase()
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [allItems, query])

  const handleSelect = (target: string) => {
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
      <div className="card max-w-2xl w-full p-0 bg-charcoal border-crimson/50 shadow-glow-crimson overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-burgundy/30 flex items-center gap-3 bg-obsidian/70">
          <Search size={18} className="text-crimson" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, page, candidate, job, or tech stack..."
            className="flex-1 bg-transparent text-sm font-mono text-warm-ivory outline-none placeholder-warm-ivory/40"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-burgundy/20 border border-burgundy/30 rounded text-warm-ivory/60">
            ESC
          </kbd>
          <button onClick={onClose} className="text-warm-ivory/40 hover:text-crimson">
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
                    'w-full text-left p-3 rounded-lg flex items-center justify-between text-xs font-mono transition-colors border',
                    isSelected
                      ? 'bg-burgundy/30 border-crimson/60 text-warm-ivory font-bold shadow-glow-crimson'
                      : 'border-transparent text-warm-ivory/80 hover:bg-burgundy/15'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded bg-burgundy/20">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-sm leading-tight text-warm-ivory">{item.title}</p>
                      <p className="text-[11px] text-warm-ivory/50 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-burgundy/20 text-crimson font-bold">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft size={14} className="text-crimson" />}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-warm-ivory/40">
              No tactical records match "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-obsidian/80 border-t border-burgundy/30 flex items-center justify-between text-[11px] font-mono text-warm-ivory/40">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-burgundy/20 border border-burgundy/30 text-[9px]">ARROWS</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-burgundy/20 border border-burgundy/30 text-[9px]">ENTER</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-burgundy/20 border border-burgundy/30 text-[9px]">ESC</kbd> Close</span>
          </div>
          <span className="text-crimson font-bold">COMMAND PALETTE // ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
