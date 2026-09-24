import React, { useState, useEffect, useMemo } from 'react'
import { Search, Users, CheckCircle2, BookmarkPlus, BookmarkCheck, ArrowRight, X, Mail, Check } from 'lucide-react'
import { mockTalentVaultCandidates, TalentCandidate } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface TalentVaultProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE TALENT DIRECTORY COMPONENT
// ============================================================================
const EnterpriseTalentDirectory: React.FC<TalentVaultProps> = ({ onNavigate }) => {
  const [candidatesList, setCandidatesList] = useState<TalentCandidate[]>(mockTalentVaultCandidates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [minScore, setMinScore] = useState<number>(0)
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null)
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({ 'TAL-001': true })
  const [contacted, setContacted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    api.talent.search({}).then((candidates) => {
      if (mounted && candidates && candidates.length > 0) {
        setCandidatesList(candidates)
      }
    })
    return () => { mounted = false }
  }, [])

  const roles = ['ALL', 'Full Stack Developer', 'Cloud Solutions Architect', 'AI & Data Systems Engineer', 'Senior Frontend Engineer']

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topSkills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false
      if (selectedRoleFilter !== 'ALL' && c.targetRole !== selectedRoleFilter) return false
      if (c.readinessScore < minScore) return false
      return true
    })
  }, [candidatesList, searchQuery, selectedRoleFilter, minScore])

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShortlisted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleContact = (id: string) => {
    setContacted((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Talent Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Discover, evaluate, and benchmark pre-assessed candidates across engineering and data disciplines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded font-medium">
            {filteredCandidates.length} Candidates Available
          </span>
          <button
            onClick={() => onNavigate?.('employer-dashboard')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors"
          >
            Workforce Planning
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name, target role, or technical skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Role pills */}
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded transition-colors font-medium',
                  selectedRoleFilter === r
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                )}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          {/* Min Score filter */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Minimum Readiness:</span>
            <button
              onClick={() => setMinScore(minScore === 85 ? 0 : 85)}
              className={cn(
                'px-2.5 py-1 rounded transition-colors font-medium text-xs border',
                minScore === 85
                  ? 'bg-blue-700 text-white border-blue-700 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              )}
            >
              85%+ Score
            </button>
          </div>
        </div>
      </div>

      {/* 3. Candidate Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4 font-semibold">Candidate</th>
                <th className="py-3 px-4 font-semibold">Experience & Location</th>
                <th className="py-3 px-4 font-semibold">Core Technical Skills</th>
                <th className="py-3 px-4 font-semibold">Role Readiness</th>
                <th className="py-3 px-4 font-semibold">Assessment</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCandidates.map((c) => {
                const isShort = shortlisted[c.id]
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center shrink-0">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.targetRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.experience}</div>
                      <div className="text-[11px] text-slate-400">{c.location}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.topSkills.map((s) => (
                          <span
                            key={s.name}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {s.name} <span className="font-semibold text-blue-700 font-mono">{s.score}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 font-mono">
                          <span>{c.readinessScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${c.readinessScore}%` }}
                            className="bg-[#1E3A8A] h-full rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 size={12} /> {c.readinessScore >= 90 ? '95th Percentile' : '88th Percentile'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => toggleShortlist(c.id, e)}
                          className={cn(
                            'p-1.5 rounded transition-colors text-xs',
                            isShort
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          )}
                          title={isShort ? 'Shortlisted' : 'Shortlist'}
                        >
                          {isShort ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                        </button>
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Candidate Detail Slide-Over Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Candidate Profile
              </span>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  {selectedCandidate.readinessScore}% Role Match
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {selectedCandidate.targetRole} • {selectedCandidate.location} • {selectedCandidate.experience} experience
              </p>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {selectedCandidate.highlights}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span>Availability: <strong className="text-slate-700">{selectedCandidate.availability}</strong></span>
                <span>• Expected: <strong className="text-slate-700">{selectedCandidate.expectedSalary}</strong></span>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Standardized Evaluation
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Percentile Rank</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedCandidate.readinessScore >= 90 ? 'Top 5% (95th Percentile)' : 'Top 12% (88th Percentile)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Verification Status</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified Competency
                </span>
              </div>
            </div>

            {/* Verified Technical Skills */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Verified Skill Scores
              </h3>
              <div className="space-y-2">
                {selectedCandidate.topSkills.map((s) => (
                  <div key={s.name} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="font-mono font-bold text-blue-700">{s.score} / 10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${(s.score / 10) * 100}%` }}
                        className="bg-[#1E3A8A] h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Roles & Highlights */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Career Highlights & Credentials
              </h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  {selectedCandidate.highlights}
                </p>
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Target Role</span>
                    <span className="font-semibold text-slate-800">{selectedCandidate.targetRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-800">{selectedCandidate.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => handleContact(selectedCandidate.id)}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors',
                  contacted[selectedCandidate.id]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white'
                )}
              >
                {contacted[selectedCandidate.id] ? (
                  <>
                    <Check size={14} /> Message Sent
                  </>
                ) : (
                  <>
                    <Mail size={14} /> Contact Candidate
                  </>
                )}
              </button>
              <button
                onClick={() => onNavigate?.('candidate-dossier')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN TALENT VAULT EXPORT
// ============================================================================
export const TalentVault: React.FC<TalentVaultProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [minScore, setMinScore] = useState<number>(0)
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null)
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({ 'TAL-001': true })
  const [contacted, setContacted] = useState<Record<string, boolean>>({})

  // In Enterprise Mode: render the enterprise talent directory
  if (!isHeist) {
    return <EnterpriseTalentDirectory onNavigate={onNavigate} />
  }

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
