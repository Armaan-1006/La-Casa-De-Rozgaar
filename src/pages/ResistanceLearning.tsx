import React, { useState } from 'react'
import { CheckCircle2, Clock, ArrowRight, ExternalLink, Check } from 'lucide-react'
import { mockLearningRoadmap, mockLearningResources, LearningModule } from '../data/mockData'
import { cn } from '../lib/utils'

interface ResistanceLearningProps {
  onNavigate?: (page: string) => void
}

export const ResistanceLearning: React.FC<ResistanceLearningProps> = ({ onNavigate }) => {
  const [modules, setModules] = useState<LearningModule[]>(mockLearningRoadmap)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'TypeScript Advanced Metaprogramming & ASTs-0': true,
  })

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const markModuleCompleted = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'COMPLETED' } : m))
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">GAP-DRIVEN CURRICULUM</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // RESISTANCE-LEARNING-SPRINTS</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">RESISTANCE LEARNING SYSTEM</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              PERSONALIZED UPSKILLING ROADMAP ENGINEERED TO ELIMINATE REVEALED MARKET DEFICITS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            RECHECK SKILL GAPS <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Progress Metric Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <span className="text-xs font-mono text-warm-ivory/60">ACTIVE SPRINTS</span>
          <p className="heading-sm text-crimson font-mono mt-1">2 IN PROGRESS</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">TypeScript & Docker Modules</p>
        </div>

        <div className="card">
          <span className="text-xs font-mono text-warm-ivory/60">TIME COMMITMENT</span>
          <p className="heading-sm text-warm-ivory font-mono mt-1">46 TOTAL HOURS</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">~6-8 Hours / Week Pace</p>
        </div>

        <div className="card">
          <span className="text-xs font-mono text-warm-ivory/60">PROJECTED READINESS LIFT</span>
          <p className="heading-sm text-emerald-400 font-mono mt-1">+18.5% SCORE</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Elevates to Tier 1 Candidate</p>
        </div>
      </section>

      {/* Sprints Detailed List */}
      <section className="space-y-6">
        <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
          CLASSIFIED CURRICULUM // SEQUENTIAL SPRINTS
        </h3>

        <div className="space-y-6">
          {modules.map((module) => {
            const isCompleted = module.status === 'COMPLETED'
            return (
              <div
                key={module.id}
                className={cn(
                  'card space-y-4 border transition-all',
                  isCompleted ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-burgundy/30 bg-charcoal'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-burgundy/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="stamp-classified">{module.phase}</span>
                    <h3 className="heading-xs text-warm-ivory">{module.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-warm-ivory/60">
                      <Clock size={12} className="text-crimson" /> {module.hours} Hours
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded font-bold uppercase text-[10px]',
                      isCompleted ? 'bg-emerald-400/20 text-emerald-400' : 'bg-crimson/20 text-crimson'
                    )}>
                      {module.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-1">
                    <span className="text-[10px] text-warm-ivory/50 uppercase font-bold">WHY THIS OBJECTIVE MATTERS:</span>
                    <p className="text-warm-ivory/80 leading-relaxed">{module.whyItMatters}</p>
                  </div>
                  <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">REQUIRED PRODUCTION DELIVERABLE:</span>
                    <p className="text-warm-ivory/80 leading-relaxed">{module.deliverable}</p>
                  </div>
                </div>

                {/* Syllabus Checklist */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-warm-ivory/60 uppercase font-bold">MODULE SYLLABUS:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {module.syllabus.map((item, idx) => {
                      const itemKey = `${module.title}-${idx}`
                      const isItemDone = !!completedItems[itemKey]
                      return (
                        <div
                          key={item}
                          onClick={() => toggleItem(itemKey)}
                          className={cn(
                            'p-2.5 rounded border text-xs font-mono flex items-center gap-2.5 cursor-pointer transition-all',
                            isItemDone
                              ? 'bg-emerald-400/10 border-emerald-400/30 text-warm-ivory font-semibold'
                              : 'bg-burgundy/15 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/25'
                          )}
                        >
                          <span className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center text-[10px]',
                            isItemDone ? 'border-emerald-400 text-emerald-400' : 'border-warm-ivory/40'
                          )}>
                            {isItemDone ? <Check size={11} className="text-emerald-400 stroke-[3]" /> : null}
                          </span>
                          <span className={cn(isItemDone && 'line-through text-warm-ivory/50')}>{item}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="flex items-center justify-between pt-3 border-t border-burgundy/20 text-xs font-mono">
                  <span className="text-warm-ivory/50">Provider: {module.provider}</span>
                  {!isCompleted ? (
                    <button
                      onClick={() => markModuleCompleted(module.id)}
                      className="btn-primary text-[11px] font-mono py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={12} /> MARK SPRINT VERIFIED
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> BENCHMARK MET
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recommended External Resources */}
      <section className="card space-y-4">
        <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">
          CURATED RESISTANCE LEARNING VAULT (EXTERNAL PARTNERS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockLearningResources.map((res) => (
            <div key={res.id} className="p-4 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-crimson font-bold uppercase tracking-wider">{res.type}</span>
              <h4 className="font-semibold text-warm-ivory text-sm">{res.title}</h4>
              <p className="text-warm-ivory/60">Provider: {res.provider} • {res.duration}</p>
              <div className="pt-2 flex items-center justify-between text-emerald-400">
                <span>Verified Curriculum</span>
                <ExternalLink size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
