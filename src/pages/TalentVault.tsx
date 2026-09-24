import React, { useState, useMemo } from 'react'
import { Search, Users, CheckCircle2, BookmarkPlus, BookmarkCheck, ArrowRight, X } from 'lucide-react'
import { mockTalentVaultCandidates, TalentCandidate } from '../data/mockData'
import { cn } from '../lib/utils'

interface TalentVaultProps {
  onNavigate?: (page: string) => void
}

export const TalentVault: React.FC<TalentVaultProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [minScore, setMinScore] = useState<number>(0)
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null)
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({ 'TAL-001': true })
  const [contacted, setContacted] = useState<Record<string, boolean>>({})

  const roles = ['ALL', 'Full Stack Developer', 'Cloud Solutions Architect', 'AI & Data Systems Engineer', 'Senior Frontend Engineer']

  const filteredCandidates = useMemo(() => {
    return mockTalentVaultCandidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topSkills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false
      if (selectedRoleFilter !== 'ALL' && c.targetRole !== selectedRoleFilter) return false
      if (c.readinessScore < minScore) return false
      return true
    })
  }, [searchQuery, selectedRoleFilter, minScore])

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShortlisted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleContact = (id: string) => {
    setContacted((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">RECRUITER INTELLIGENCE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // TALENT-RECRUIT-DISCOVERY</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">TALENT VAULT // RECRUIT DISCOVERY</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              VERIFIED CANDIDATE DOSSIERS, BENCHMARKED SKILL CAPABILITIES & IMMEDIATE PIPELINE MATCHING
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('employer')}
              className="btn-secondary text-xs font-mono py-2.5 px-3.5 flex items-center gap-2"
            >
              EMPLOYER DASHBOARD <ArrowRight size={13} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 p-2.5 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
              <Users size={16} />
              <span>{mockTalentVaultCandidates.length} OPERATIVES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search by operative name, role, code name, or verified tech skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Role Filters */}
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all border',
                  selectedRoleFilter === r
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                    : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
                )}
              >
                {r === 'ALL' ? 'ALL SPECIALTIES' : r}
              </button>
            ))}
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center gap-2 text-xs font-mono text-warm-ivory/70 bg-burgundy/10 px-3 py-1.5 rounded-lg border border-burgundy/20">
            <span>Min Readiness:</span>
            <button
              onClick={() => setMinScore(minScore === 85 ? 0 : 85)}
              className={cn(
                'px-2 py-0.5 rounded font-bold transition-all',
                minScore === 85 ? 'bg-crimson text-warm-ivory' : 'bg-charcoal text-warm-ivory/60'
              )}
            >
              85%+ ONLY
            </button>
          </div>
        </div>
      </section>

      {/* Talent Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => {
          const isShortlisted = !!shortlisted[candidate.id]
          const isContacted = !!contacted[candidate.id]

          return (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className="card border-burgundy/25 hover:border-crimson/50 cursor-pointer space-y-4 group transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="stamp-classified text-[9px]">{candidate.codeName}</span>
                    <span className="text-[10px] font-mono text-emerald-400">● {candidate.availability}</span>
                    {isContacted && (
                      <span className="text-[9px] font-mono text-crimson font-bold bg-crimson/15 px-1.5 py-0.5 rounded border border-crimson/30">
                        CONTACTED
                      </span>
                    )}
                  </div>
                  <h3 className="heading-xs text-warm-ivory mt-1 group-hover:text-crimson-light transition-colors">
                    {candidate.name}
                  </h3>
                  <p className="text-xs font-mono text-warm-ivory/70">{candidate.targetRole} • {candidate.experience}</p>
                </div>
                <button
                  onClick={(e) => toggleShortlist(candidate.id, e)}
                  className="text-warm-ivory/50 hover:text-crimson p-1 transition-colors"
                >
                  {isShortlisted ? <BookmarkCheck size={18} className="text-crimson" /> : <BookmarkPlus size={18} />}
                </button>
              </div>

              {/* Readiness Score Bar */}
              <div className="space-y-1.5 p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-warm-ivory/60">VERIFIED READINESS</span>
                  <span className="text-emerald-400 font-bold">{candidate.readinessScore}%</span>
                </div>
                <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${candidate.readinessScore}%` }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>

              {/* Top Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-warm-ivory/50 uppercase">AUDITED COMPETENCIES</span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.topSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-2 py-0.5 bg-burgundy/20 rounded border border-burgundy/30 text-[11px] font-mono text-warm-ivory/80 flex items-center gap-1"
                    >
                      <span>{skill.name}</span>
                      <span className="text-crimson font-bold">{skill.score}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <p className="text-[11px] font-mono text-warm-ivory/70 leading-relaxed border-t border-burgundy/20 pt-3">
                {candidate.highlights}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono font-bold text-warm-ivory">{candidate.expectedSalary}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCandidate(candidate)
                  }}
                  className="btn-secondary text-xs font-mono py-1.5 px-3 flex items-center gap-1"
                >
                  INSPECT DOSSIER →
                </button>
              </div>
            </div>
          )
        })}
      </section>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full p-6 space-y-6 bg-charcoal border-crimson/50 shadow-glow-crimson max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-burgundy/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-classified">OFFICIAL DOSSIER RECORD</span>
                  <span className="text-xs font-mono text-crimson font-bold">{selectedCandidate.codeName}</span>
                </div>
                <h2 className="heading-md text-warm-ivory mt-1">{selectedCandidate.name}</h2>
                <p className="text-xs font-mono text-warm-ivory/60">
                  {selectedCandidate.targetRole} • {selectedCandidate.experience} Experience • {selectedCandidate.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-warm-ivory/50 hover:text-crimson p-1 rounded-lg hover:bg-burgundy/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/20">
                <span className="text-[10px] font-mono text-warm-ivory/60">READINESS</span>
                <p className="text-xl font-bold font-mono text-emerald-400">{selectedCandidate.readinessScore}%</p>
              </div>
              <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/20">
                <span className="text-[10px] font-mono text-warm-ivory/60">AVAILABILITY</span>
                <p className="text-xs font-bold font-mono text-warm-ivory mt-1">{selectedCandidate.availability}</p>
              </div>
              <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/20">
                <span className="text-[10px] font-mono text-warm-ivory/60">SALARY BAND</span>
                <p className="text-xs font-bold font-mono text-emerald-400 mt-1">{selectedCandidate.expectedSalary}</p>
              </div>
              <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/20">
                <span className="text-[10px] font-mono text-warm-ivory/60">CLEARANCE</span>
                <p className="text-xs font-bold font-mono text-warm-ivory mt-1">VERIFIED</p>
              </div>
            </div>

            {/* Skills Radar Breakdown */}
            <div className="space-y-3">
              <h4 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
                CERTIFIED SKILL BREAKDOWN
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCandidate.topSkills.map((s) => (
                  <div key={s.name} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-warm-ivory">{s.name}</span>
                    <span className="text-crimson font-bold">{s.score} / 10.0</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-burgundy/10 rounded-lg border border-burgundy/20 text-xs font-mono space-y-1">
              <span className="text-emerald-400 font-bold uppercase">OPERATIVE HIGHLIGHTS:</span>
              <p className="text-warm-ivory/80 leading-relaxed">{selectedCandidate.highlights}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => handleContact(selectedCandidate.id)}
                className={cn(
                  'flex-1 py-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2',
                  contacted[selectedCandidate.id]
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'btn-primary'
                )}
              >
                {contacted[selectedCandidate.id] ? (
                  <>
                    <CheckCircle2 size={16} /> TRANSMISSION SENT // OPERATIVE NOTIFIED
                  </>
                ) : (
                  <>INITIATE SECURE OUTREACH TRANSMISSION <ArrowRight size={14} /></>
                )}
              </button>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="btn-secondary text-xs font-mono py-3 px-5"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
