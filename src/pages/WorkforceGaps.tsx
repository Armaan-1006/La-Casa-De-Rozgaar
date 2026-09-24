import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, UserPlus, BookOpen } from 'lucide-react'
import { mockEmployer } from '../data/mockData'
import { cn } from '../lib/utils'

interface WorkforceGapsProps {
  onNavigate?: (page: string) => void
}

export const WorkforceGaps: React.FC<WorkforceGapsProps> = ({ onNavigate }) => {
  const [allocatedCohorts, setAllocatedCohorts] = useState<Record<string, boolean>>({})

  const handleAllocate = (area: string) => {
    setAllocatedCohorts((prev) => ({ ...prev, [area]: true }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">ORGANIZATIONAL DEFICIT RADAR</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // WORKFORCE-GAP-DIAGNOSTIC</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">WORKFORCE GAP ANALYSIS & ACTION MATRIX</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              CURRENT CAPABILITY VS STRATEGIC FUTURE DEMAND // RECRUITMENT & UPSKILLING DECISION SUPPORT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('talent-vault')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              HIRE TALENT IN VAULT <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <span className="text-xs font-mono text-warm-ivory/60">TARGET HEADCOUNT</span>
          <p className="heading-sm text-warm-ivory font-mono mt-1">{mockEmployer.totalEmployees}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">45 Open Requisitions</p>
        </div>

        <div className="card border-crimson/30">
          <span className="text-xs font-mono text-crimson">CRITICAL TECH GAPS</span>
          <p className="heading-sm text-crimson font-mono mt-1">3 SECTORS</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Kubernetes, AI/ML, Cloud</p>
        </div>

        <div className="card border-amber-400/30">
          <span className="text-xs font-mono text-amber-400">ORGANIZATION READINESS</span>
          <p className="heading-sm text-amber-400 font-mono mt-1">58.4%</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">-24% Below Strategic Target</p>
        </div>

        <div className="card border-emerald-400/30">
          <span className="text-xs font-mono text-emerald-400">DECISION POSTURE</span>
          <p className="heading-sm text-emerald-400 font-mono mt-1">HYBRID</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">60% Upskill / 40% Lateral Hire</p>
        </div>
      </section>

      {/* The 4-Pillar Gap Matrix */}
      <section className="card space-y-6">
        <div className="border-b border-burgundy/20 pb-4">
          <span className="stamp-classified">STRATEGIC GAP AUDIT</span>
          <h2 className="heading-md text-warm-ivory mt-2">CURRENT VS REQUIRED CAPABILITY MATRIX</h2>
          <p className="text-xs font-mono text-warm-ivory/60">
            COMPARING AS-IS TALENT BENCHMARKS AGAINST STRATEGIC 12-MONTH ENTERPRISE OBJECTIVES
          </p>
        </div>

        <div className="space-y-4">
          {mockEmployer.workforceGaps.map((item) => {
            const isAllocated = !!allocatedCohorts[item.area]
            return (
              <div key={item.area} className="p-4 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase',
                      item.severity === 'CRITICAL' ? 'bg-crimson/20 text-crimson border border-crimson/40' : 'bg-amber-400/20 text-amber-400'
                    )}>
                      {item.severity} GAP
                    </span>
                    <h4 className="text-sm font-bold text-warm-ivory font-mono">{item.area}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-crimson">
                    Deficit: {item.deficit}%
                  </span>
                </div>

                {/* Dual Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-warm-ivory/60 mb-1">
                      <span>CURRENT CAPABILITY</span>
                      <span className="text-warm-ivory font-bold">{item.currentScore}%</span>
                    </div>
                    <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${item.currentScore}%` }}
                        className="h-full bg-gradient-crimson rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-warm-ivory/60 mb-1">
                      <span>STRATEGIC MANDATE</span>
                      <span className="text-emerald-400 font-bold">{item.requiredScore}%</span>
                    </div>
                    <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${item.requiredScore}%` }}
                        className="h-full bg-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Recommended Strategic Action */}
                <div className="p-3 bg-obsidian/60 rounded border border-burgundy/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-warm-ivory/80">
                    <span className="text-amber-400 font-bold">DIRECTIVE:</span>
                    <span>{item.action}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAllocate(item.area)}
                      className={cn(
                        'px-3 py-1.5 rounded text-[11px] font-mono transition-all flex items-center gap-1.5',
                        isAllocated
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'btn-secondary'
                      )}
                    >
                      {isAllocated ? (
                        <>
                          <CheckCircle2 size={12} /> COHORT SANCTIONED
                        </>
                      ) : (
                        <>
                          <BookOpen size={12} /> ALLOCATE COHORT
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onNavigate?.('talent-vault')}
                      className="btn-primary text-[11px] font-mono py-1.5 px-3 flex items-center gap-1"
                    >
                      <UserPlus size={12} /> SOURCING PIPELINE
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Internal Skill Breakdown */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm uppercase">
          ORGANIZATIONAL BENCHMARK BREAKDOWN ({mockEmployer.currentWorkforce.length} CAPABILITIES)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockEmployer.currentWorkforce.map((w) => (
            <div key={w.skill} className="p-3.5 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-warm-ivory">{w.skill}</span>
                <span className={cn('font-bold', w.gap < -20 ? 'text-crimson' : w.gap < 0 ? 'text-amber-400' : 'text-emerald-400')}>
                  Gap: {w.gap}%
                </span>
              </div>
              <div className="flex gap-4 text-[11px] font-mono text-warm-ivory/60">
                <span>Availability: {w.availability}%</span>
                <span>Mandate: {w.target}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
