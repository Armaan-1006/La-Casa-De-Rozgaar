import React, { useState } from 'react'
import { Plus, Trash2, Play, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { cn } from '../lib/utils'

interface Scenario {
  id: string
  name: string
  skills: Record<string, number>
}

export const SimulationVault: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Scenario A: Full-Stack Lead',
      skills: {
        ...mockCandidate.skills.reduce((acc, s) => ({ ...acc, [s.name]: s.score }), {}),
        TypeScript: 9.0,
        Docker: 8.5,
        AWS: 8.0,
      },
    },
    {
      id: '2',
      name: 'Scenario B: Cloud & DevOps Specialist',
      skills: {
        ...mockCandidate.skills.reduce((acc, s) => ({ ...acc, [s.name]: s.score }), {}),
        Docker: 9.2,
        AWS: 9.5,
        SQL: 8.8,
      },
    },
  ])

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0])

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
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-crimson" />
          <h1 className="heading-lg text-warm-ivory">SIMULATION VAULT</h1>
        </div>
        <p className="text-warm-ivory/60 font-mono text-sm">
          OPERATION // CAREER SCENARIO PLANNING & WHAT-IF SKILL SIMULATION
        </p>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Scenarios List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm">SCENARIOS</h3>
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
                    'p-4 rounded-lg border transition-all cursor-pointer group',
                    isSelected
                      ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson'
                      : 'card-hover text-warm-ivory/80'
                  )}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <p className="text-sm font-semibold">{scenario.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-mono opacity-80">Readiness: {readiness}%</span>
                    {isSelected && scenarios.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(scenario.id)
                        }}
                        className="text-xs text-warm-ivory/70 hover:text-white transition-colors flex items-center gap-1"
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

        {/* Scenario Detail */}
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

            {/* Skills Editor */}
            <div className="card">
              <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">INTERACTIVE SKILL CONTROLS</h3>
              <p className="text-xs text-warm-ivory/50 font-mono mb-6">
                DRAG SLIDERS TO MODEL SKILL MASTERY IMPACT IN REAL-TIME
              </p>
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

            {/* Analysis */}
            <div className="card bg-emerald-400/10 border-emerald-400/30">
              <h3 className="heading-sm text-emerald-400 mb-4 font-mono text-sm">SIMULATION RESULTS & ROLES</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">QUALIFIED TARGET ROLES</p>
                  <div className="space-y-1.5">
                    {['Full Stack Lead', 'Senior Frontend Engineer', 'Solutions Architect'].map((role) => (
                      <div key={role} className="flex items-center gap-2 text-xs text-warm-ivory/90 font-mono">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">ESTIMATED TIME TO UPSKILL</p>
                  <p className="text-xl font-bold text-warm-ivory font-mono">4-6 weeks</p>
                  <p className="text-xs text-warm-ivory/50 font-mono mt-1">~35-40 hours structured study</p>
                </div>

                <div>
                  <p className="text-xs text-warm-ivory/60 font-mono mb-2">NEXT RECOMMENDED ACTIONS</p>
                  <p className="text-xs text-warm-ivory/80 leading-relaxed font-mono">
                    Complete Docker and AWS certification sprints to hit target readiness score.
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
