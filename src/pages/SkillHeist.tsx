import React, { useState } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight, BookOpen, Clock, CheckCircle2, XCircle, Check } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface SkillHeistProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE SKILL DEVELOPMENT & UPSKILLING ROADMAP
// ============================================================================
const EnterpriseSkillDevelopment: React.FC<SkillHeistProps> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [closedSkills, setClosedSkills] = useState<Record<string, boolean>>({})

  const roles = ['Full Stack Developer', 'Cloud Solutions Architect', 'Data Scientist', 'DevOps Specialist']

  const roleAdjustments: Record<string, Record<string, number>> = {
    'Full Stack Developer': { TypeScript: 8.2, Docker: 7.0, AWS: 7.5, React: 8.5 },
    'Cloud Solutions Architect': { TypeScript: 7.5, Docker: 8.8, AWS: 9.5, React: 7.0 },
    'Data Scientist': { TypeScript: 6.5, Docker: 7.5, AWS: 8.0, SQL: 8.8 },
    'DevOps Specialist': { TypeScript: 7.0, Docker: 9.2, AWS: 9.0, Git: 9.0 },
  }

  const currentBench = roleAdjustments[selectedRole] || roleAdjustments['Full Stack Developer']

  const evaluatedSkills = mockCandidate.skills.map((s) => {
    const marketTarget = currentBench[s.name] || s.market
    const effectiveScore = closedSkills[s.name] ? marketTarget : s.score
    const gap = effectiveScore - marketTarget
    return {
      ...s,
      market: marketTarget,
      score: effectiveScore,
      gap,
    }
  })

  const critical = evaluatedSkills.filter((s) => s.gap < -1.5)
  const high = evaluatedSkills.filter((s) => s.gap >= -1.5 && s.gap < -0.2)
  const strengths = evaluatedSkills.filter((s) => s.gap >= -0.2)

  const readinessScore = Math.round(
    (evaluatedSkills.reduce((acc, s) => acc + (s.score / s.market), 0) / evaluatedSkills.length) * 100
  )

  const toggleCloseSkill = (skillName: string) => {
    setClosedSkills((prev) => ({ ...prev, [skillName]: !prev[skillName] }))
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Skill Development & Upskilling Roadmap
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Identify technical competency deficits and simulate readiness progression through targeted curriculum modules.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('roadmap')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1.5"
          >
            Learning Curriculum <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Target Role Selector & Readiness Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Benchmark Target Role
            </span>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded transition-colors font-medium border',
                    selectedRole === r
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[200px] space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Simulated Readiness</span>
            <div className="text-3xl font-bold text-[#1E3A8A]">{readinessScore}%</div>
            <p className="text-[11px] text-slate-500">
              {Object.keys(closedSkills).length > 0 ? (
                <span className="text-emerald-700 font-semibold">+{Object.keys(closedSkills).length * 8}% Simulated Gain</span>
              ) : (
                'Select skills to simulate gain'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Skill Categorization & Remediation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Critical Deficits */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Critical Deficits
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
              {critical.length} Areas
            </span>
          </div>
          <div className="space-y-2.5">
            {critical.map((s) => {
              const isClosed = !!closedSkills[s.name]
              return (
                <div key={s.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    <span className="font-mono text-amber-700 font-semibold">
                      Gap: {s.gap.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Current: <strong>{s.score}</strong> / Target: <strong>{s.market}</strong>
                  </div>
                  <button
                    onClick={() => toggleCloseSkill(s.name)}
                    className={cn(
                      'w-full py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1',
                      isClosed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                    )}
                  >
                    {isClosed ? <Check size={12} /> : null}
                    {isClosed ? 'Remediated (Simulated)' : 'Simulate Upskilling'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              High Priority Gaps
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {high.length} Areas
            </span>
          </div>
          <div className="space-y-2.5">
            {high.map((s) => {
              const isClosed = !!closedSkills[s.name]
              return (
                <div key={s.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      Gap: {s.gap.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Current: <strong>{s.score}</strong> / Target: <strong>{s.market}</strong>
                  </div>
                  <button
                    onClick={() => toggleCloseSkill(s.name)}
                    className={cn(
                      'w-full py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1',
                      isClosed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                    )}
                  >
                    {isClosed ? <Check size={12} /> : null}
                    {isClosed ? 'Remediated (Simulated)' : 'Simulate Upskilling'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validated Strengths */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Validated Competencies
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {strengths.length} Areas
            </span>
          </div>
          <div className="space-y-2.5">
            {strengths.map((s) => (
              <div key={s.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{s.name}</span>
                  <span className="text-emerald-700 font-semibold font-mono text-[11px]">
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Current: <strong>{s.score}</strong> / Target: <strong>{s.market}</strong>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    style={{ width: `${Math.min((s.score / s.market) * 100, 100)}%` }}
                    className="bg-emerald-600 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SKILL HEIST EXPORT (Dual Mode)
// ============================================================================
export const SkillHeist: React.FC<SkillHeistProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [closedSkills, setClosedSkills] = useState<Record<string, boolean>>({})

  // In Enterprise Mode: render the enterprise skill development & roadmap
  if (!isHeist) {
    return <EnterpriseSkillDevelopment onNavigate={onNavigate} />
  }

  const roles = ['Full Stack Developer', 'Cloud Solutions Architect', 'Data Scientist', 'DevOps Specialist']

  // Multiplier adjustments based on role
  const roleAdjustments: Record<string, Record<string, number>> = {
    'Full Stack Developer': { TypeScript: 8.2, Docker: 7.0, AWS: 7.5, React: 8.5 },
    'Cloud Solutions Architect': { TypeScript: 7.5, Docker: 8.8, AWS: 9.5, React: 7.0 },
    'Data Scientist': { TypeScript: 6.5, Docker: 7.5, AWS: 8.0, SQL: 8.8 },
    'DevOps Specialist': { TypeScript: 7.0, Docker: 9.2, AWS: 9.0, Git: 9.0 },
  }

  const currentBench = roleAdjustments[selectedRole] || roleAdjustments['Full Stack Developer']

  const evaluatedSkills = mockCandidate.skills.map((s) => {
    const marketTarget = currentBench[s.name] || s.market
    const effectiveScore = closedSkills[s.name] ? marketTarget : s.score
    const gap = effectiveScore - marketTarget
    return {
      ...s,
      market: marketTarget,
      score: effectiveScore,
      gap,
    }
  })

  const critical = evaluatedSkills.filter((s) => s.gap < -1.5)
  const high = evaluatedSkills.filter((s) => s.gap >= -1.5 && s.gap < -0.2)
  const strengths = evaluatedSkills.filter((s) => s.gap >= -0.2)

  const readinessScore = Math.round(
    (evaluatedSkills.reduce((acc, s) => acc + (s.score / s.market), 0) / evaluatedSkills.length) * 100
  )

  const toggleCloseSkill = (skillName: string) => {
    setClosedSkills((prev) => ({ ...prev, [skillName]: !prev[skillName] }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">SIGNATURE OPERATION</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // SKILL-HEIST-ROADMAP</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">SKILL HEIST // GAP ELIMINATION</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              DYNAMIC GAP AUDIT, SPRINT-BASED REMEDIATION & CAPABILITY GAIN SIMULATION
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('roadmap')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            START LEARNING SPRINT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Target Role Selector */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-warm-ivory/60 uppercase">TARGET HEIST OBJECTIVE (ROLE AUDIT)</span>
          <span className="text-[10px] font-mono text-warm-ivory/50">SWITCH ROLES TO AUDIT DYNAMIC GAPS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={cn(
                'px-3 py-2 text-xs font-mono rounded-lg transition-all border text-center truncate',
                selectedRole === r
                  ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                  : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/20'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Overview Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">TARGET HEIST ROLE</p>
          <p className="heading-sm text-warm-ivory truncate">{selectedRole}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Tier 1 Production Benchmark</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">COMPUTED READINESS</p>
          <p className="heading-sm text-crimson font-mono">{readinessScore}%</p>
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, readinessScore)}%` }}
              className="h-full bg-gradient-crimson rounded-full transition-all duration-300"
            />
          </div>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">IDENTIFIED DEFICITS</p>
          <p className="heading-sm text-amber-400 font-mono">{critical.length + high.length}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">{critical.length} Critical / {high.length} High</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ESTIMATED SPRINT TIME</p>
          <p className="heading-sm text-emerald-400 font-mono">4-6 WEEKS</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">~35 Hours Structured Execution</p>
        </div>
      </section>

      {/* Main Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Categorized Deficits Summary */}
        <div className="space-y-4">
          <div className="card bg-emerald-400/10 border-emerald-400/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-emerald-400" />
              <span className="font-semibold text-emerald-400 font-mono text-sm">STRENGTHS ({strengths.length})</span>
            </div>
            <div className="space-y-1.5">
              {strengths.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between text-xs font-mono text-warm-ivory/90">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    {skill.name}
                  </span>
                  <span className="text-emerald-400 font-bold">{skill.score.toFixed(1)} / 10</span>
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
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    {skill.name}
                  </span>
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
                  <span className="flex items-center gap-1.5">
                    <XCircle size={12} className="text-crimson shrink-0" />
                    {skill.name}
                  </span>
                  <span className="text-crimson font-bold">Gap: {Math.abs(skill.gap).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Gap Matrix */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
            <div>
              <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">
                COMPREHENSIVE GAP MATRIX // INTERACTIVE SPRINT PREVIEW
              </h3>
              <p className="text-xs font-mono text-warm-ivory/50">CLICK "SIMULATE SPRINT" TO PREVIEW GAP CLOSURE</p>
            </div>
            <span className="stamp-classified">TARGET: {selectedRole.toUpperCase()}</span>
          </div>

          <div className="space-y-3.5">
            {evaluatedSkills.map((skill) => {
              const gap = skill.gap
              const isStrength = gap >= -0.2
              const isCritical = gap < -1.5
              const isClosed = !!closedSkills[skill.name]

              return (
                <div key={skill.name} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-warm-ivory text-sm">{skill.name}</p>
                      <p className="text-xs text-warm-ivory/50 font-mono">
                        Current: {skill.score.toFixed(1)} / Mandate: {skill.market.toFixed(1)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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

                      {!isStrength && (
                        <button
                          onClick={() => toggleCloseSkill(skill.name)}
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded transition-all',
                            isClosed
                              ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                              : 'bg-burgundy/20 text-warm-ivory/70 hover:text-warm-ivory border border-burgundy/30'
                          )}
                        >
                          {isClosed ? 'SPRINT VERIFIED' : 'TEST SPRINT'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    {/* Current Score Bar */}
                    <div className="flex-1">
                      <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${(skill.score / 10) * 100}%` }}
                          className="h-full bg-gradient-crimson rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Market Benchmark Bar */}
                    <div className="flex-1">
                      <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${(skill.market / 10) * 100}%` }}
                          className="h-full bg-muted-gold rounded-full"
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

      {/* Recommended Resistance Sprints */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={18} className="text-crimson" />
          <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">
            RECOMMENDED HEIST SPRINT ROADMAP
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { phase: 'Sprint 01 (Weeks 1-2)', skill: 'TypeScript Advanced Generics & ASTs', priority: 'Critical', hours: '12 hrs', deliverable: 'Author type-safe microservices communication SDK' },
            { phase: 'Sprint 02 (Weeks 2-3)', skill: 'Docker Container Hardening & Multi-Stage', priority: 'Critical', hours: '10 hrs', deliverable: 'Deploy hardened Alpine containers under 45MB' },
            { phase: 'Sprint 03 (Weeks 3-4)', skill: 'AWS Cloud Architecture & SQS/Lambda', priority: 'Critical', hours: '16 hrs', deliverable: 'Configure serverless event fan-out pipeline' },
            { phase: 'Sprint 04 (Weeks 5-6)', skill: 'PostgreSQL Index Tuning & EXPLAIN', priority: 'Medium', hours: '8 hrs', deliverable: 'Query optimization & read-replica architecture' },
          ].map((item) => (
            <div key={item.phase} className="p-4 bg-burgundy/10 border border-burgundy/20 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-warm-ivory/60 flex items-center gap-1.5">
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
              <p className="text-warm-ivory/60">Deliverable: {item.deliverable}</p>
              <div className="flex items-center justify-between pt-2 border-t border-burgundy/20 text-warm-ivory/50">
                <span>Time Budget: {item.hours}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Syllabus
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="heading-sm text-crimson mb-1">EXECUTE THE PLAN // CLOSE DEFICITS</h3>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Take the interactive curriculum in Resistance Learning or test custom slider gains in Simulation Vault.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate?.('roadmap')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              ENROLL IN RESISTANCE SPRINT <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate?.('simulation')}
              className="btn-secondary text-xs font-mono py-2.5 px-4"
            >
              SIMULATION VAULT
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
