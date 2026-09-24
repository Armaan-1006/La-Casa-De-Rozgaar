import React, { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, DollarSign, BookmarkPlus, BookmarkCheck, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { mockJobs, JobListing } from '../data/mockData'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface JobFinderProps {
  onNavigate?: (page: string) => void
}

export const JobFinder: React.FC<JobFinderProps> = ({ onNavigate }) => {
  const [jobsList, setJobsList] = useState<JobListing[]>(mockJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryTab, setCategoryTab] = useState<'ALL' | 'Immediate-Fit' | 'Growth-Fit'>('ALL')
  const [filterRemote, setFilterRemote] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobListing>(mockJobs[0])
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({ 'JOB-LC-001': true })
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({})

  // Fetch recommended jobs from backend
  useEffect(() => {
    let mounted = true
    api.matching.getRecommendedJobs().then((jobs) => {
      if (mounted && jobs && jobs.length > 0) {
        setJobsList(jobs)
        setSelectedJob(jobs[0])
      }
    })
    return () => { mounted = false }
  }, [])

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setBookmarkedJobs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApply = (id: string) => {
    setAppliedJobs((prev) => ({ ...prev, [id]: true }))
  }

  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false
      if (categoryTab !== 'ALL' && job.category !== categoryTab) return false
      if (filterRemote && !job.remote.toLowerCase().includes('remote')) return false
      return true
    })
  }, [jobsList, searchQuery, categoryTab, filterRemote])

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">AI MATCHING ENGINE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // JOB-RADAR-ALIGNMENT</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">AI JOB FINDER & RECRUIT MATCHING</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              EXPLAINABLE ATTRIBUTE MATCHING, IMMEDIATE-FIT VS GROWTH-FIT ROLE VECTORS & ENCRYPTED TRANSMISSIONS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('assessment')}
            className="btn-secondary text-xs font-mono py-2.5 px-4"
          >
            UPDATE CAPABILITY SCORE
          </button>
        </div>
      </section>

      {/* Search & Category Pills */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search active target roles, hiring companies, tech stacks, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryTab('ALL')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border',
                categoryTab === 'ALL'
                  ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                  : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
              )}
            >
              ALL TARGETS ({jobsList.length})
            </button>
            <button
              onClick={() => setCategoryTab('Immediate-Fit')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5',
                categoryTab === 'Immediate-Fit'
                  ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                  : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
              )}
            >
              <CheckCircle size={12} className="text-emerald-400" />
              <span>IMMEDIATE-FIT (85%+)</span>
            </button>
            <button
              onClick={() => setCategoryTab('Growth-Fit')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5',
                categoryTab === 'Growth-Fit'
                  ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                  : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
              )}
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>GROWTH-FIT (UPSKILLING)</span>
            </button>
          </div>

          <button
            onClick={() => setFilterRemote(!filterRemote)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all border',
              filterRemote
                ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40 font-bold'
                : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
            )}
          >
            {filterRemote ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-400" /> REMOTE ONLY
              </span>
            ) : (
              'REMOTE / HYBRID'
            )}
          </button>
        </div>
      </section>

      {/* Main Grid: Job Cards List & Selected Target Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-warm-ivory/60">
            <span>ACTIVE OPPORTUNITIES // {filteredJobs.length} LISTINGS</span>
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
                      'p-4 rounded-lg border transition-all cursor-pointer text-left space-y-2.5',
                      isSelected
                        ? 'bg-charcoal border-crimson shadow-glow-crimson ring-1 ring-crimson/50'
                        : 'card-hover border-burgundy/25'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="stamp-classified text-[8px]">{job.category}</span>
                          <span className="text-[10px] font-mono text-warm-ivory/40">{job.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-warm-ivory leading-tight">{job.title}</h3>
                        <p className="text-xs text-warm-ivory/70 font-mono mt-0.5">{job.company}</p>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(e, job.id)}
                        className="text-warm-ivory/60 hover:text-crimson p-1 transition-colors"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck size={18} className="text-crimson" />
                        ) : (
                          <BookmarkPlus size={18} />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-warm-ivory/70">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-crimson" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <DollarSign size={12} /> {job.salary}
                      </span>
                    </div>

                    {/* Match Score Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-warm-ivory/50">COMPUTED FIT</span>
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
                    <div className="flex flex-wrap gap-1.5 pt-1">
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
                No active targets match your filtered parameters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Target In-Depth Dossier */}
        {selectedJob && (
          <div className="lg:col-span-7 space-y-6">
            <div className="card bg-charcoal border-crimson/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-burgundy/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="stamp-classified">TARGET DOSSIER</span>
                    <span className="text-xs font-mono text-crimson font-bold">{selectedJob.id}</span>
                  </div>
                  <h2 className="heading-md text-warm-ivory mt-1">{selectedJob.title}</h2>
                  <p className="text-xs text-warm-ivory/70 font-mono mt-0.5">
                    {selectedJob.company} • {selectedJob.companyTier} • {selectedJob.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-warm-ivory/50">ALIGNED FIT SCORE</p>
                  <p className={cn('text-3xl font-bold font-mono', getMatchColor(selectedJob.matchScore))}>
                    {selectedJob.matchScore}%
                  </p>
                </div>
              </div>

              {/* Explainable Match Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-2.5">
                  <p className="text-xs font-mono text-warm-ivory/70 font-bold uppercase">
                    EXPLAINABLE MATCH WEIGHTS
                  </p>
                  {Object.entries(selectedJob.matchBreakdown).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-warm-ivory/80 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-crimson font-bold">{value}%</span>
                      </div>
                      <div className="w-full bg-burgundy/30 rounded-full h-1 overflow-hidden">
                        <div style={{ width: `${value}%` }} className="h-full bg-gradient-crimson rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-burgundy/15 rounded-lg border border-burgundy/25 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono text-warm-ivory/70 font-bold uppercase">COMPENSATION & TERMS</p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono my-1">{selectedJob.salary}</p>
                    <p className="text-xs text-warm-ivory/80 font-mono">Policy: {selectedJob.remote}</p>
                    <p className="text-xs text-warm-ivory/60 font-mono mt-2">Posted Date: {selectedJob.postedDate}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-burgundy/20 flex items-center gap-2 text-xs font-mono text-warm-ivory/70">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Verified Authenticated Enterprise</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs font-mono">
                <span className="text-warm-ivory/60 font-bold uppercase">MISSION BRIEF:</span>
                <p className="text-warm-ivory/80 leading-relaxed p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  {selectedJob.description}
                </p>
              </div>

              {/* Matched Skills vs Preferred Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Zap size={13} className="text-amber-400 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Responsibilities & Benefits */}
              <div className="space-y-2 text-xs font-mono pt-2 border-t border-burgundy/20">
                <span className="text-warm-ivory/60 font-bold uppercase">CORE RESPONSIBILITIES:</span>
                <div className="space-y-1">
                  {selectedJob.responsibilities.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-warm-ivory/80">
                      <span className="text-crimson font-bold">›</span>
                      <span>{r}</span>
                    </div>
                  ))}
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
                      <CheckCircle size={14} /> TRANSMISSION SENT // APPLICATION FILED
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
    </div>
  )
}
