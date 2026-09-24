import React, { useState, useMemo } from 'react'
import { Search, MapPin, DollarSign, TrendingUp, BookmarkPlus, BookmarkCheck, CheckCircle, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react'
import { mockJobs } from '../data/mockData'
import { cn } from '../lib/utils'

export const JobFinder: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'remote' | 'high-match'>('all')
  const [selectedJob, setSelectedJob] = useState<any>(mockJobs[0])
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({ '1': true })
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({})

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setBookmarkedJobs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApply = (id: string) => {
    setAppliedJobs((prev) => ({ ...prev, [id]: true }))
  }

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (filterType === 'remote') {
        return job.remote.toLowerCase().includes('remote') || job.remote.toLowerCase().includes('hybrid')
      }
      if (filterType === 'high-match') {
        return job.matchScore >= 80
      }
      return true
    })
  }, [searchQuery, filterType])

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="heading-lg text-warm-ivory mb-1">AI JOB FINDER & RECRUIT MATCHING</h1>
        <p className="text-warm-ivory/60 font-mono text-xs">
          OPERATION // REAL-TIME OPPORTUNITY MATCHING AGAINST CANDIDATE CAPABILITY MATRIX
        </p>
      </section>

      {/* Search & Filters */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search active listings, target companies, required tech stacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all',
              filterType === 'all'
                ? 'bg-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'bg-charcoal border border-burgundy/30 text-warm-ivory/70 hover:text-warm-ivory'
            )}
          >
            ALL OPPORTUNITIES ({mockJobs.length})
          </button>
          <button
            onClick={() => setFilterType('remote')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all',
              filterType === 'remote'
                ? 'bg-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'bg-charcoal border border-burgundy/30 text-warm-ivory/70 hover:text-warm-ivory'
            )}
          >
            REMOTE / HYBRID
          </button>
          <button
            onClick={() => setFilterType('high-match')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all',
              filterType === 'high-match'
                ? 'bg-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'bg-charcoal border border-burgundy/30 text-warm-ivory/70 hover:text-warm-ivory'
            )}
          >
            HIGH MATCH ONLY (80%+)
          </button>
        </div>
      </section>

      {/* Main Grid: Job Cards & Selected Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-warm-ivory/70">
              AVAILABLE TARGETS // {filteredJobs.length} FOUND
            </span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id
                const isBookmarked = !!bookmarkedJobs[job.id]

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={cn(
                      'p-4 rounded-lg border transition-all cursor-pointer text-left',
                      isSelected
                        ? 'bg-charcoal border-crimson shadow-glow-crimson ring-1 ring-crimson/50'
                        : 'card hover:border-crimson/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-warm-ivory leading-tight">{job.title}</h3>
                        <p className="text-xs text-warm-ivory/70 font-mono mt-0.5">{job.company}</p>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(e, job.id)}
                        className="text-warm-ivory/60 hover:text-crimson transition-colors p-1"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck size={18} className="text-crimson" />
                        ) : (
                          <BookmarkPlus size={18} />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-warm-ivory/70 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-crimson" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} className="text-emerald-400" /> {job.salary}
                      </span>
                    </div>

                    {/* Match Score Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-warm-ivory/60">MATCH FIT</span>
                        <span className={cn('font-bold', getMatchColor(job.matchScore))}>
                          {job.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${job.matchScore}%` }}
                          className={cn(
                            'h-full rounded-full',
                            job.matchScore >= 85 ? 'bg-emerald-400' : job.matchScore >= 70 ? 'bg-amber-400' : 'bg-orange-400'
                          )}
                        />
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-burgundy/20 text-[10px] font-mono text-warm-ivory/80 rounded border border-burgundy/30"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-warm-ivory/50">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="card p-8 text-center font-mono text-xs text-warm-ivory/50">
                No active targets match the filtered criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Target In-Depth Intel */}
        {selectedJob && (
          <div className="lg:col-span-7 space-y-6">
            <div className="card bg-charcoal border-crimson/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-crimson uppercase tracking-widest font-bold">
                    TARGET DOSSIER // {selectedJob.id}
                  </span>
                  <h2 className="heading-md text-warm-ivory mt-1">{selectedJob.title}</h2>
                  <p className="text-xs text-warm-ivory/70 font-mono mt-0.5">
                    {selectedJob.company} • {selectedJob.location} • {selectedJob.type}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-warm-ivory/50">COMPUTED FIT</p>
                    <p className={cn('text-2xl font-bold font-mono', getMatchColor(selectedJob.matchScore))}>
                      {selectedJob.matchScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="divider-h my-4" />

              {/* Match Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-3.5 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-2.5">
                  <p className="text-xs font-mono text-warm-ivory/70 mb-2 font-semibold">ATTRIBUTE FIT BREAKDOWN</p>
                  {Object.entries(selectedJob.matchBreakdown).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-warm-ivory/80 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-crimson font-bold">{value as number}%</span>
                      </div>
                      <div className="w-full bg-burgundy/30 rounded-full h-1 overflow-hidden">
                        <div
                          style={{ width: `${value}%` }}
                          className="h-full bg-gradient-crimson rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-burgundy/15 rounded-lg border border-burgundy/25 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono text-warm-ivory/70 mb-2 font-semibold">TARGET COMPENSATION & TERMS</p>
                    <p className="text-2xl font-bold text-warm-ivory font-mono mb-1">{selectedJob.salary}</p>
                    <p className="text-xs text-emerald-400 font-mono">Remote Policy: {selectedJob.remote}</p>
                    <p className="text-xs text-warm-ivory/60 font-mono mt-2">Posted: {selectedJob.postedDate}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-burgundy/20 flex items-center gap-2 text-xs font-mono text-warm-ivory/70">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Verified Employer Target</span>
                  </div>
                </div>
              </div>

              {/* Required Skills vs Candidate Strengths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-mono text-emerald-400 mb-2 font-bold">MATCHED SKILLS</p>
                  <div className="space-y-1.5">
                    {selectedJob.requiredSkills.map((skill: string) => (
                      <div key={skill} className="flex items-center gap-2 text-xs font-mono text-warm-ivory bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono text-amber-400 mb-2 font-bold">PREFERRED / GROWTH SKILLS</p>
                  <div className="space-y-1.5">
                    {selectedJob.preferredSkills.map((skill: string) => (
                      <div key={skill} className="flex items-center gap-2 text-xs font-mono text-warm-ivory bg-amber-400/10 p-2 rounded border border-amber-400/20">
                        <span className="text-amber-400 font-bold shrink-0">⚡</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={appliedJobs[selectedJob.id]}
                  className={cn(
                    'flex-1 py-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2',
                    appliedJobs[selectedJob.id]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'btn-primary'
                  )}
                >
                  {appliedJobs[selectedJob.id] ? (
                    <>
                      <CheckCircle size={14} /> TRANSMISSION SENT // APPLIED
                    </>
                  ) : (
                    <>TRANSMIT APPLICATION DOSSIER <ArrowRight size={14} /></>
                  )}
                </button>

                <button
                  onClick={() => onNavigate?.('simulation')}
                  className="btn-secondary text-xs font-mono py-3 px-4"
                >
                  SIMULATE GAP CLOSURE
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Recommended Sprints for Higher Job Yield */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-crimson" />
          <h3 className="heading-sm text-warm-ivory font-mono text-sm">STRATEGIC UNLOCKS // SKILL LEVERAGE</h3>
        </div>
        <p className="text-xs text-warm-ivory/60 font-mono mb-4">
          Mastering any of these high-yield capabilities will significantly increase candidate match scores across open positions:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { skill: 'TypeScript Generics & AST', impact: '+240 Openings', lift: '+14% Match Score', action: 'skill-heist' },
            { skill: 'AWS Architecture & Lambda', impact: '+180 Openings', lift: '+18% Match Score', action: 'skill-heist' },
            { skill: 'Docker Container Pipelines', impact: '+120 Openings', lift: '+11% Match Score', action: 'skill-heist' },
          ].map((rec) => (
            <div
              key={rec.skill}
              onClick={() => onNavigate?.(rec.action)}
              className="card-hover p-4 border border-burgundy/30 rounded-lg cursor-pointer group"
            >
              <p className="font-semibold text-warm-ivory text-sm group-hover:text-crimson transition-colors">{rec.skill}</p>
              <div className="flex items-center justify-between mt-3 text-xs font-mono">
                <span className="text-emerald-400 font-bold">{rec.impact}</span>
                <span className="text-crimson font-bold">{rec.lift}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
