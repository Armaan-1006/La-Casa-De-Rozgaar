import React, { useState } from 'react'
import { ArrowRight, Check, CheckCircle2, BookOpen, UserPlus } from 'lucide-react'
import { mockEmployer } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface WorkforceGapsProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE WORKFORCE GAP ANALYSIS COMPONENT
// ============================================================================
const EnterpriseWorkforceGaps: React.FC<WorkforceGapsProps> = ({ onNavigate }) => {
  const [allocatedCohorts, setAllocatedCohorts] = useState<Record<string, boolean>>({})

  const handleAllocate = (area: string) => {
    setAllocatedCohorts((prev) => ({ ...prev, [area]: true }))
  }

  const gapAreas = [
    {
      domain: 'Cloud Architecture & Infrastructure',
      dept: 'Platform Engineering',
      current: 5.8,
      required: 8.0,
      gap: -2.2,
      priority: 'High',
      internalCapacity: 18,
      targetRequirement: 31,
      deficit: 13,
      hireTime: '45 Days',
      upskillTime: '90 Days',
      externalTalent: 42,
    },
    {
      domain: 'Data Engineering & ETL Pipelines',
      dept: 'Data & Analytics',
      current: 6.1,
      required: 7.5,
      gap: -1.4,
      priority: 'Medium',
      internalCapacity: 24,
      targetRequirement: 35,
      deficit: 11,
      hireTime: '40 Days',
      upskillTime: '75 Days',
      externalTalent: 36,
    },
    {
      domain: 'Kubernetes & Container Orchestration',
      dept: 'DevOps & Reliability',
      current: 5.2,
      required: 7.0,
      gap: -1.8,
      priority: 'High',
      internalCapacity: 14,
      targetRequirement: 28,
      deficit: 14,
      hireTime: '50 Days',
      upskillTime: '60 Days',
      externalTalent: 28,
    },
    {
      domain: 'Machine Learning Operations (MLOps)',
      dept: 'AI Research & Engineering',
      current: 6.8,
      required: 7.8,
      gap: -1.0,
      priority: 'Medium',
      internalCapacity: 16,
      targetRequirement: 22,
      deficit: 6,
      hireTime: '60 Days',
      upskillTime: '80 Days',
      externalTalent: 19,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Workforce Gap Analysis & Decision Support
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Compare current internal capability benchmarks against target operational requirements and model hiring vs upskilling strategies.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('talent-vault')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1.5"
          >
            Source in Talent Directory <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. KPI Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Target Headcount</span>
          <div className="text-2xl font-bold text-slate-900">{mockEmployer.totalEmployees}</div>
          <p className="text-[11px] text-slate-500">45 approved open requisitions</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Critical Capability Gaps</span>
          <div className="text-2xl font-bold text-amber-700">3 Sectors</div>
          <p className="text-[11px] text-slate-500">Cloud Architecture, Data, Kubernetes</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Aggregate Readiness</span>
          <div className="text-2xl font-bold text-slate-900">58.4%</div>
          <p className="text-[11px] text-amber-700 font-semibold">-21.6% Below Strategic Goal</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Recommended Strategy</span>
          <div className="text-2xl font-bold text-blue-700">Hybrid Model</div>
          <p className="text-[11px] text-slate-500">60% Upskilling / 40% Lateral Hiring</p>
        </div>
      </section>

      {/* 3. Decision Support: Hiring vs Upskilling */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Decision Support: Hire vs Upskill Modeling
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate talent trade-offs between recruiting external hires vs developing internal cohorts.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            Decision Framework Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gapAreas.slice(0, 2).map((item) => {
            const isAllocated = !!allocatedCohorts[item.domain]
            return (
              <div key={item.domain} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-xs">{item.domain}</h3>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Net Deficit: {item.deficit} Roles
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Internal Capacity</span>
                    <span className="font-bold text-slate-900">{item.internalCapacity}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Target Need</span>
                    <span className="font-bold text-slate-900">{item.targetRequirement}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">External Pipeline</span>
                    <span className="font-bold text-blue-700">{item.externalTalent}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Lateral Hiring Timeframe:</span>
                    <span className="font-semibold text-slate-800">{item.hireTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Internal Upskilling Horizon:</span>
                    <span className="font-semibold text-slate-800">{item.upskillTime}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => handleAllocate(item.domain)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors',
                      isAllocated
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white'
                    )}
                  >
                    {isAllocated ? (
                      <>
                        <Check size={13} /> Cohort Assigned
                      </>
                    ) : (
                      'Upskill Cohort'
                    )}
                  </button>
                  <button
                    onClick={() => onNavigate?.('talent-vault')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                  >
                    Source Candidates
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Full Analytical Gap Matrix Table */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Organizational Capability Gap Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of current skill scores against strategic 12-month requirements.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Capability Area</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">Current Index</th>
                <th className="py-2.5 px-4 font-semibold">Target Requirement</th>
                <th className="py-2.5 px-4 font-semibold">Net Deficit</th>
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 text-right font-semibold">Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {gapAreas.map((item) => (
                <tr key={item.domain} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.domain}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {item.dept}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.current.toFixed(1)} / 10
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.required.toFixed(1)} / 10
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-amber-700">
                    {item.gap.toFixed(1)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold',
                        item.priority === 'High'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigate?.('roadmap')}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        Plan Learning
                      </button>
                      <button
                        onClick={() => onNavigate?.('talent-vault')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Hire
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ============================================================================
// MAIN WORKFORCE GAPS EXPORT (Dual Mode)
// ============================================================================
export const WorkforceGaps: React.FC<WorkforceGapsProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const [allocatedCohorts, setAllocatedCohorts] = useState<Record<string, boolean>>({})

  // In Enterprise Mode: render the enterprise gap analysis & decision support
  if (!isHeist) {
    return <EnterpriseWorkforceGaps onNavigate={onNavigate} />
  }

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
