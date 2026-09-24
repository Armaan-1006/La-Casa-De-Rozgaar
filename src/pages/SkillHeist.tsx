import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight, BookOpen, Clock, Target } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { cn } from '../lib/utils'

export const SkillHeist: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const critical = mockCandidate.skills.filter((s) => s.gap < -1.5)
  const high = mockCandidate.skills.filter((s) => s.gap >= -1.5 && s.gap < -0.5)
  const strengths = mockCandidate.skills.filter((s) => s.gap >= 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="heading-lg text-warm-ivory mb-2">SKILL HEIST ROADMAP</h1>
        <p className="text-warm-ivory/60 font-mono text-sm">
          OPERATION // HIGH-IMPACT SKILL GAP CLOSURE & RESISTANCE SPRINT
        </p>
      </section>

      {/* Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">TARGET ROLE</p>
          <p className="heading-sm text-warm-ivory">{mockCandidate.targetRole}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Tier 1 Target</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">CURRENT READINESS</p>
          <p className="heading-sm text-crimson font-mono">{mockCandidate.roleReadiness}%</p>
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              style={{ width: `${mockCandidate.roleReadiness}%` }}
              className="h-full bg-gradient-crimson rounded-full"
            />
          </div>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">PRIORITY SKILLS</p>
          <p className="heading-sm text-amber-400 font-mono">{critical.length + high.length}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">{critical.length} Critical / {high.length} High</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ESTIMATED SPRINT</p>
          <p className="heading-sm text-warm-ivory font-mono">4-6 WEEKS</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">~35 Hours Structured</p>
        </div>
      </section>

      {/* Main Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills Summary Breakdown */}
        <div className="space-y-4">
          <div className="card bg-emerald-400/10 border-emerald-400/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-emerald-400" />
              <span className="font-semibold text-emerald-400 font-mono text-sm">STRENGTHS ({strengths.length})</span>
            </div>
            <div className="space-y-1.5">
              {strengths.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between text-xs font-mono text-warm-ivory/90">
                  <span>✓ {skill.name}</span>
                  <span className="text-emerald-400 font-bold">{skill.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-amber-400/10 border-amber-400/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-400" />
              <span className="font-semibold text-amber-400 font-mono text-sm">HIGH PRIORITY ({high.length})</span>
            </div>
            <div className="space-y-1.5">
              {high.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between text-xs font-mono text-warm-ivory/90">
                  <span>⚠ {skill.name}</span>
                  <span className="text-amber-400 font-bold">Gap: {Math.abs(skill.gap).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-burgundy/20 border-crimson/40">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-crimson" />
              <span className="font-semibold text-crimson font-mono text-sm">CRITICAL DEFICITS ({critical.length})</span>
            </div>
            <div className="space-y-1.5">
              {critical.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between text-xs font-mono text-warm-ivory/90">
                  <span>✕ {skill.name}</span>
                  <span className="text-crimson font-bold">Gap: {Math.abs(skill.gap).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Gap Analysis */}
        <div className="lg:col-span-2 card">
          <h3 className="heading-sm text-warm-ivory mb-6 font-mono text-sm">COMPREHENSIVE GAP MATRIX</h3>
          <div className="space-y-5">
            {mockCandidate.skills.map((skill) => {
              const gap = skill.gap
              const isStrength = gap >= 0
              const isCritical = gap < -1.5

              return (
                <div key={skill.name} className="p-3.5 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-warm-ivory text-sm">{skill.name}</p>
                      <p className="text-xs text-warm-ivory/50 font-mono">
                        Score: {skill.score} / Benchmark: {skill.market}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs font-mono font-bold px-2 py-0.5 rounded',
                      isStrength
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : isCritical
                        ? 'text-crimson bg-crimson/10 border border-crimson/30'
                        : 'text-amber-400 bg-amber-400/10'
                    )}>
                      {isStrength ? 'BENCHMARK MET' : `DEFICIT -${Math.abs(gap).toFixed(1)}`}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    {/* Current */}
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-warm-ivory/50 font-mono mb-1">
                        <span>Current</span>
                        <span>{skill.score}/10</span>
                      </div>
                      <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${(skill.score / 10) * 100}%` }}
                          className="h-full bg-gradient-crimson rounded-full"
                        />
                      </div>
                    </div>

                    {/* Market */}
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-warm-ivory/50 font-mono mb-1">
                        <span>Market Requirement</span>
                        <span>{skill.market}/10</span>
                      </div>
                      <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${(skill.market / 10) * 100}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Learning Recommendations */}
      <section className="card">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={18} className="text-crimson" />
          <h3 className="heading-sm text-warm-ivory font-mono text-sm">RECOMMENDED RESISTANCE SPRINT ROADMAP</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              phase: 'Sprint 1 (Weeks 1-2)',
              skill: 'TypeScript Advanced Patterns & Generics',
              priority: 'Critical',
              hours: '10 hrs',
              deliverable: 'Build type-safe microservices SDK',
            },
            {
              phase: 'Sprint 2 (Weeks 2-3)',
              skill: 'Docker Containerization & Orchestration',
              priority: 'Critical',
              hours: '12 hrs',
              deliverable: 'Deploy multi-stage container cluster',
            },
            {
              phase: 'Sprint 3 (Weeks 3-4)',
              skill: 'AWS Cloud Architecture & Serverless',
              priority: 'High',
              hours: '14 hrs',
              deliverable: 'Configure serverless event pipeline',
            },
            {
              phase: 'Sprint 4 (Weeks 5-6)',
              skill: 'SQL Performance & Indexing Strategies',
              priority: 'Medium',
              hours: '8 hrs',
              deliverable: 'Query optimization & read-replica architecture',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-burgundy/10 border border-burgundy/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-warm-ivory/60 flex items-center gap-1.5">
                  <Clock size={12} className="text-crimson" />
                  {item.phase}
                </span>
                <span className={cn(
                  'text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase',
                  item.priority === 'Critical' ? 'bg-crimson/20 text-crimson border border-crimson/40' : 'bg-amber-400/20 text-amber-400'
                )}>
                  {item.priority}
                </span>
              </div>
              <h4 className="font-semibold text-warm-ivory text-sm">{item.skill}</h4>
              <p className="text-xs text-warm-ivory/60 font-mono">Deliverable: {item.deliverable}</p>
              <div className="flex items-center justify-between pt-2 border-t border-burgundy/20 text-xs font-mono text-warm-ivory/50">
                <span>Time Budget: {item.hours}</span>
                <span className="text-emerald-400">Verified Module</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="heading-sm text-crimson mb-1">EXECUTE THE PLAN // CLOSE GAPS</h3>
            <p className="text-warm-ivory/70 text-xs font-mono">Test what-if improvements in the Simulation Vault or apply for matched opportunities.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate?.('simulation')}
              className="btn-secondary text-xs font-mono py-2.5 px-4"
            >
              SIMULATION VAULT
            </button>
            <button
              onClick={() => onNavigate?.('job-finder')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              FIND MATCHED JOBS <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
