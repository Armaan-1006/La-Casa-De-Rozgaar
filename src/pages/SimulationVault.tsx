import React, { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Play, RefreshCw } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface Scenario {
  id: string
  name: string
  skills: Record<string, number>
}

export const SimulationVault: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Scenario A: Cloud & DevOps Specialist',
      skills: {
        ...mockCandidate.skills.reduce((acc, s) => ({ ...acc, [s.name]: s.score }), {}),
        TypeScript: 9.0,
        Docker: 8.5,
        AWS: 8.5,
      },
    },
    {
      id: '2',
      name: 'Scenario B: Full-Stack Architect',
      skills: {
        ...mockCandidate.skills.reduce((acc, s) => ({ ...acc, [s.name]: s.score }), {}),
        TypeScript: 9.2,
        React: 9.0,
        SQL: 8.8,
        Docker: 7.5,
      },
    },
  ])

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0])
  const [isComparing, setIsComparing] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStage, setSimulationStage] = useState(0)

  const stages = [
    'INITIALIZING SCENARIO...',
    'READING CURRENT SKILL PROFILE...',
    'ANALYSING MARKET REQUIREMENTS...',
    'PROJECTING ROLE COMPATIBILITY...',
    'IDENTIFYING REMAINING GAPS...',
    'SCENARIO CALCULATION COMPLETE',
  ]

  const runSimulationSequence = () => {
    setIsSimulating(true)
    setSimulationStage(0)

    if (selectedScenario) {
      const skillChanges = Object.entries(selectedScenario.skills).map(([name, score]) => ({
        skillId: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        targetScore: score,
      }))
      api.simulation.run('role_fullstack', skillChanges).catch(() => {
        // Fallback: local simulation operates without backend
      })
    }

    const interval = setInterval(() => {
      setSimulationStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval)
          setTimeout(() => setIsSimulating(false), 500)
          return prev
        }
        return prev + 1
      })
    }, 400)
  }

  const calculateReadiness = (skills: Record<string, number>) => {
    const values = Object.values(skills)
    if (values.length === 0) return 0
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return Math.round((avg / 10) * 100)
  }

  const addScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}: Custom Path`,
      skills: { ...mockCandidate.skills.reduce((acc, s) => ({ ...acc, [s.name]: s.score }), {}) },
    }
    setScenarios([...scenarios, newScenario])
    setSelectedScenario(newScenario)
  }

  const deleteScenario = (id: string) => {
    const newScenarios = scenarios.filter((s) => s.id !== id)
    setScenarios(newScenarios)
    if (selectedScenario?.id === id) {
      setSelectedScenario(newScenarios[0] || null)
    }
  }

  const updateSkillScore = (scenario: Scenario, skill: string, newScore: number) => {
    const updated = {
      ...scenario,
      skills: { ...scenario.skills, [skill]: Math.min(10, Math.max(0, newScore)) },
    }
    setScenarios(scenarios.map((s) => (s.id === scenario.id ? updated : s)))
    setSelectedScenario(updated)
  }

  const baselineReadiness = mockCandidate.roleReadiness

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">SIMULATION ENGINE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // SCENARIO-PLANNING-VAULT</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">SIMULATION VAULT // WHAT-IF SANDBOX</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              HYPOTHETICAL SKILL GAIN PROJECTIONS, SCENARIO COMPARISON & PROJECTED READINESS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparing(!isComparing)}
              className="btn-secondary text-xs font-mono py-2.5 px-4"
            >
              {isComparing ? 'EXIT COMPARISON' : 'COMPARE SCENARIO A vs B'}
            </button>
            <button
              onClick={runSimulationSequence}
              disabled={isSimulating}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              <Play size={14} /> RUN SIMULATION
            </button>
          </div>
        </div>
      </section>

      {/* Simulated Multi-Stage Animation Overlay */}
      {isSimulating && (
        <div className="p-4 bg-burgundy/20 border border-crimson rounded-lg text-center font-mono space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-crimson font-bold text-sm">
            <RefreshCw size={16} className="animate-spin" />
            <span>{stages[simulationStage]}</span>
          </div>
          <div className="w-full bg-burgundy/40 rounded-full h-1 max-w-md mx-auto overflow-hidden">
            <div
              style={{ width: `${((simulationStage + 1) / stages.length) * 100}%` }}
              className="h-full bg-crimson transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison View */}
      {isComparing && scenarios.length >= 2 ? (
        <section className="space-y-4">
          <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
            SIDE-BY-SIDE SCENARIO COMPARISON MATRIX
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.slice(0, 2).map((sc, scIdx) => {
              const r = calculateReadiness(sc.skills)
              return (
                <div key={sc.id} className="card space-y-4 border-burgundy/40 bg-charcoal">
                  <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
                    <span className="stamp-classified">SCENARIO {String.fromCharCode(65 + scIdx)}</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{r}% Ready</span>
                  </div>
                  <h4 className="heading-xs text-warm-ivory">{sc.name}</h4>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(sc.skills).slice(0, 5).map(([sName, sScore]) => (
                      <div key={sName} className="flex justify-between items-center p-2 bg-burgundy/10 rounded">
                        <span className="text-warm-ivory/80">{sName}</span>
                        <span className="font-bold text-crimson">{sScore.toFixed(1)} / 10</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-warm-ivory/60 font-mono">
                    Projected Gain: <strong className="text-emerald-400">+{Math.max(0, r - baselineReadiness)}%</strong> over current baseline.
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Standard Scenario Editor */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Scenarios Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">SCENARIOS</h3>
            <button
              onClick={addScenario}
              className="p-1.5 text-crimson hover:bg-burgundy/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono border border-crimson/30"
            >
              <Plus size={14} /> NEW
            </button>
          </div>

          <div className="space-y-2.5">
            {scenarios.map((scenario) => {
              const readiness = calculateReadiness(scenario.skills)
              const isSelected = selectedScenario?.id === scenario.id

              return (
                <div
                  key={scenario.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer group space-y-2',
                    isSelected
                      ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                      : 'card-hover border-burgundy/25 text-warm-ivory/80'
                  )}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <p className="text-sm font-semibold">{scenario.name}</p>
                  <div className="flex items-center justify-between text-xs font-mono opacity-80 pt-1 border-t border-current/20">
                    <span>Readiness: {readiness}%</span>
                    {isSelected && scenarios.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(scenario.id)
                        }}
                        className="text-xs hover:text-white transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Scenario Sliders */}
        {selectedScenario && (
          <div className="lg:col-span-3 space-y-6">
            {/* Header Metrics */}
            <div className="card">
              <h2 className="heading-md text-warm-ivory mb-4">{selectedScenario.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <p className="text-xs text-warm-ivory/60 font-mono mb-1">SIMULATED READINESS</p>
                  <p className="text-3xl font-bold text-crimson font-mono">
                    {calculateReadiness(selectedScenario.skills)}%
                  </p>
                </div>
                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <p className="text-xs text-warm-ivory/60 font-mono mb-1">BASELINE READINESS</p>
                  <p className="text-3xl font-bold text-warm-ivory font-mono">
                    {baselineReadiness}%
                  </p>
                </div>
                <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <p className="text-xs text-warm-ivory/60 font-mono mb-1">PROJECTED GAIN</p>
                  <p className="text-3xl font-bold text-emerald-400 font-mono">
                    +{Math.max(0, calculateReadiness(selectedScenario.skills) - baselineReadiness)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">INTERACTIVE SKILL CONTROLS</h3>
                  <p className="text-xs text-warm-ivory/50 font-mono">DRAG SLIDERS TO MODEL MASTERY IMPACT IN REAL TIME</p>
                </div>
                <span className="stamp-classified">LIVE TELEMETRY</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedScenario.skills).map(([skill, score]) => {
                  const currentScore = mockCandidate.skills.find((s) => s.name === skill)?.score || 0
                  const delta = score - currentScore

                  return (
                    <div key={skill} className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-warm-ivory text-sm">{skill}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-warm-ivory">
                            <span className="text-warm-ivory/50">{currentScore}</span>
                            <span className="text-crimson mx-1">→</span>
                            <span className="text-crimson font-bold">{score.toFixed(1)}</span>
                          </span>
                          {delta > 0 && <span className="text-xs text-emerald-400 font-mono">+{delta.toFixed(1)}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={score}
                          onChange={(e) => updateSkillScore(selectedScenario, skill, parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-burgundy/30 rounded-full appearance-none cursor-pointer accent-crimson"
                        />
                        <span className="w-8 text-right font-mono text-xs text-warm-ivory/80 font-bold">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Qualified Roles */}
            <div className="card bg-emerald-400/5 border-emerald-400/30">
              <h3 className="heading-sm text-emerald-400 mb-4 font-mono text-sm uppercase">
                SIMULATION OUTPUTS // QUALIFIED TARGETS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">QUALIFIED TARGET ROLES</p>
                  <div className="space-y-1.5">
                    {['Cloud Solutions Architect', 'Senior Full Stack Lead', 'Platform DevOps Specialist'].map((role) => (
                      <div key={role} className="flex items-center gap-2 text-xs text-warm-ivory/90 font-mono">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">ESTIMATED TIME TO UPSKILL</p>
                  <p className="text-xl font-bold text-warm-ivory font-mono">4 - 6 Weeks</p>
                  <p className="text-xs text-warm-ivory/50 font-mono mt-1">~35-40 hours structured study</p>
                </div>

                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">STRATEGIC DIRECTIVE</p>
                  <p className="text-xs text-warm-ivory/80 leading-relaxed font-mono">
                    Prioritize AWS Cloud architecture and Docker hardening sprints to achieve targeted 85%+ readiness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
