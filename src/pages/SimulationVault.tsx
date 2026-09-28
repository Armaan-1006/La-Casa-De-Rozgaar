import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle2, Play, RefreshCw, Save, Check, Database, Sparkles, TrendingUp, Clock, Target } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface Scenario {
  id: string
  name: string
  targetRoleName?: string
  skills: Record<string, number>
  timelineMonths?: number
  hoursPerWeek?: number
  difficulty?: string
  feasibility?: string
  isDbBacked?: boolean
}

export const SimulationVault: React.FC = () => {
  const { isHeist } = useTheme()
  const { user } = useAuth()
  const [candidateProfile, setCandidateProfile] = useState<any>(mockCandidate)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStage, setSimulationStage] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [showAddSkill, setShowAddSkill] = useState(false)

  const stages = [
    'INITIALIZING NEON DB SCENARIO...',
    'READING CURRENT CANDIDATE PROFILE...',
    'ANALYSING LIVE MARKET REQUIREMENTS...',
    'PROJECTING ROLE COMPATIBILITY & DELTAS...',
    'IDENTIFYING REMAINING CAPABILITY GAPS...',
    'SCENARIO CALCULATION COMPLETE',
  ]

  // 1. Load candidate profile and live DB scenarios on mount
  const loadData = useCallback(async () => {
    try {
      const profile = await api.candidate.getProfile()
      if (profile && profile.skills && profile.skills.length > 0) {
        setCandidateProfile(profile)
      }

      // Base candidate skill record
      const baseCandidateSkills: Record<string, number> = {}
      const skillList = (profile && profile.skills) || mockCandidate.skills
      skillList.forEach((s: any) => {
        baseCandidateSkills[s.name] = s.score
      })

      // Fetch saved scenarios from Neon PostgreSQL
      const dbScenarios = await api.simulation.listScenarios()

      let parsedScenarios: Scenario[] = []

      if (dbScenarios && dbScenarios.length > 0) {
        parsedScenarios = dbScenarios.map((dbS: any, idx: number) => {
          const scenarioSkills = { ...baseCandidateSkills }

          // If bridge_skills exist in DB, boost them for this scenario
          if (Array.isArray(dbS.bridge_skills)) {
            dbS.bridge_skills.forEach((bSkill: string) => {
              scenarioSkills[bSkill] = 8.5
            })
          }

          // If skill_changes JSON exists, merge them
          if (Array.isArray(dbS.skill_changes)) {
            dbS.skill_changes.forEach((sc: any) => {
              if (sc.skillName && sc.targetScore) {
                scenarioSkills[sc.skillName] = sc.targetScore
              }
            })
          }

          return {
            id: dbS.id || `db-${idx}`,
            name: dbS.name || `Scenario ${String.fromCharCode(65 + idx)}`,
            targetRoleName: dbS.target_role_name || dbS.name,
            skills: scenarioSkills,
            timelineMonths: dbS.timeline_months || 6,
            hoursPerWeek: dbS.investment_hours_per_week || 10,
            difficulty: dbS.difficulty || 'MODERATE',
            feasibility: dbS.feasibility || 'HIGH',
            isDbBacked: true,
          }
        })
      }

      // Fallback defaults if no DB scenarios yet
      if (parsedScenarios.length === 0) {
        parsedScenarios = [
          {
            id: 'sc-1',
            name: 'Cloud & DevOps Specialist',
            targetRoleName: 'Cloud Solutions Architect',
            skills: {
              ...baseCandidateSkills,
              TypeScript: 9.0,
              Docker: 8.5,
              'AWS Cloud Architecture': 8.5,
              'Kubernetes Orchestration': 8.0,
            },
            timelineMonths: 6,
            hoursPerWeek: 12,
            difficulty: 'MODERATE',
            feasibility: 'HIGH',
            isDbBacked: false,
          },
          {
            id: 'sc-2',
            name: 'AI Systems & LLM Track',
            targetRoleName: 'AI/ML Systems Engineer',
            skills: {
              ...baseCandidateSkills,
              Python: 9.2,
              'PyTorch / TensorFlow': 8.5,
              'Vector Databases & RAG': 8.8,
              'Model Deployment & Triton': 7.8,
            },
            timelineMonths: 9,
            hoursPerWeek: 15,
            difficulty: 'ADVANCED',
            feasibility: 'HIGH',
            isDbBacked: false,
          },
        ]
      }

      setScenarios(parsedScenarios)
      setSelectedScenario(parsedScenarios[0])
    } catch (err) {
      console.warn('Could not load simulation scenarios from database, falling back to local state', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const runSimulationSequence = () => {
    setIsSimulating(true)
    setSimulationStage(0)

    if (selectedScenario) {
      const skillChanges = Object.entries(selectedScenario.skills).map(([name, score]) => ({
        skillId: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        targetScore: score,
      }))
      api.simulation.run('role_fullstack', skillChanges).catch(() => {})
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
    }, 350)
  }

  const calculateReadiness = (skills: Record<string, number>) => {
    const values = Object.values(skills)
    if (values.length === 0) return 0
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return Math.round((avg / 10) * 100)
  }

  const addScenario = () => {
    const baseCandidateSkills: Record<string, number> = {}
    const skillList = candidateProfile?.skills || mockCandidate.skills
    skillList.forEach((s: any) => {
      baseCandidateSkills[s.name] = s.score
    })

    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}: Custom Evolution`,
      targetRoleName: 'Senior Engineering Specialist',
      skills: { ...baseCandidateSkills },
      timelineMonths: 6,
      hoursPerWeek: 10,
      difficulty: 'MODERATE',
      feasibility: 'HIGH',
      isDbBacked: false,
    }
    setScenarios([...scenarios, newScenario])
    setSelectedScenario(newScenario)
  }

  const saveScenarioToDb = async () => {
    if (!selectedScenario) return
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const bridgeSkills = Object.entries(selectedScenario.skills)
        .filter(([_, score]) => score >= 8.0)
        .map(([name]) => name)

      const skillChanges = Object.entries(selectedScenario.skills).map(([name, score]) => ({
        skillName: name,
        skillId: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        targetScore: score,
      }))

      await api.simulation.saveScenario({
        name: selectedScenario.name,
        targetRoleId: 'role_custom',
        targetRoleName: selectedScenario.targetRoleName || selectedScenario.name,
        currentRoleTitle: candidateProfile?.targetRole || 'Software Engineer',
        timelineMonths: selectedScenario.timelineMonths || 6,
        investmentHoursPerWeek: selectedScenario.hoursPerWeek || 10,
        estimatedBudget: 0,
        projectedSalary: 165000,
        projectedGrowthPct: 22,
        roiMultiple: 3.2,
        bridgeSkills,
        difficulty: selectedScenario.difficulty || 'MODERATE',
        feasibility: selectedScenario.feasibility || 'HIGH',
        steps: [
          { phase: 'Phase 1', title: 'Foundation & Core Architecture Sprints' },
          { phase: 'Phase 2', title: 'Production Security Hardening & Lab Labs' },
        ],
        skillChanges,
        result: { simulatedReadiness: calculateReadiness(selectedScenario.skills) },
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      await loadData()
    } catch (err) {
      console.error('Failed to save scenario to Neon database', err)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteScenario = async (id: string) => {
    try {
      await api.simulation.deleteScenario(id)
    } catch {
      // Local removal fallback
    }
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

  const handleAddCustomSkill = () => {
    if (!newSkillName.trim() || !selectedScenario) return
    const trimmed = newSkillName.trim()
    const updated = {
      ...selectedScenario,
      skills: { ...selectedScenario.skills, [trimmed]: 7.0 },
    }
    setScenarios(scenarios.map((s) => (s.id === selectedScenario.id ? updated : s)))
    setSelectedScenario(updated)
    setNewSkillName('')
    setShowAddSkill(false)
  }

  const baselineReadiness = candidateProfile?.roleReadiness || mockCandidate.roleReadiness

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={cn(
          'relative overflow-hidden rounded-xl border p-6 md:p-8 transition-colors',
          isHeist
            ? 'border-burgundy/30 bg-gradient-obsidian shadow-glow-crimson'
            : 'border-slate-200 bg-white shadow-sm'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={isHeist ? 'stamp-live' : 'inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase'}>
                <Database size={11} /> NEON DB POWERED
              </span>
              <span className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                LIVE CAREER SIMULATION & WHAT-IF ENGINE
              </span>
            </div>
            <h1 className={cn('heading-lg mb-1', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
              SIMULATION VAULT // WHAT-IF SANDBOX
            </h1>
            <p className={cn('text-xs md:text-sm font-mono', isHeist ? 'text-warm-ivory/70' : 'text-slate-600')}>
              DYNAMIC SKILL ACQUISITION PROJECTIONS, ROLE DELTAS & DATABASE-PERSISTED SCENARIOS
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={cn(
                'text-xs font-mono py-2.5 px-4 rounded-lg transition-all',
                isHeist ? 'btn-secondary' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold'
              )}
            >
              {isComparing ? 'EXIT COMPARISON' : 'COMPARE SCENARIOS'}
            </button>
            <button
              onClick={saveScenarioToDb}
              disabled={isSaving}
              className={cn(
                'text-xs font-mono py-2.5 px-4 rounded-lg transition-all flex items-center gap-2 font-bold cursor-pointer',
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : isHeist
                  ? 'bg-burgundy/40 hover:bg-burgundy/60 text-warm-ivory border border-crimson/50 shadow-glow-crimson'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
              )}
            >
              {saveSuccess ? <Check size={14} /> : isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saveSuccess ? 'SAVED TO NEON DB' : isSaving ? 'SAVING...' : 'SAVE TO NEON DB'}
            </button>
            <button
              onClick={runSimulationSequence}
              disabled={isSimulating}
              className={cn(
                'text-xs font-mono py-2.5 px-4 flex items-center gap-2 cursor-pointer font-bold',
                isHeist ? 'btn-primary' : 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
              )}
            >
              <Play size={14} /> RUN SIMULATION
            </button>
          </div>
        </div>
      </section>

      {/* Simulated Multi-Stage Animation Overlay */}
      {isSimulating && (
        <div
          className={cn(
            'p-4 rounded-lg text-center font-mono space-y-2 animate-pulse border',
            isHeist ? 'bg-burgundy/20 border-crimson text-crimson' : 'bg-blue-50 border-blue-300 text-blue-700'
          )}
        >
          <div className="flex items-center justify-center gap-2 font-bold text-sm">
            <RefreshCw size={16} className="animate-spin" />
            <span>{stages[simulationStage]}</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-1.5 max-w-md mx-auto overflow-hidden">
            <div
              style={{ width: `${((simulationStage + 1) / stages.length) * 100}%` }}
              className={cn('h-full transition-all duration-300', isHeist ? 'bg-crimson' : 'bg-blue-600')}
            />
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison View */}
      {isComparing && scenarios.length >= 2 ? (
        <section className="space-y-4">
          <h3 className={cn('heading-sm font-mono text-xs uppercase tracking-wider', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
            SIDE-BY-SIDE SCENARIO COMPARISON MATRIX
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.slice(0, 2).map((sc, scIdx) => {
              const r = calculateReadiness(sc.skills)
              return (
                <div
                  key={sc.id}
                  className={cn(
                    'card space-y-4 border',
                    isHeist ? 'border-burgundy/40 bg-charcoal' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between border-b border-inherit/20 pb-3">
                    <span className={isHeist ? 'stamp-classified' : 'px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold'}>
                      SCENARIO {String.fromCharCode(65 + scIdx)}
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-500">{r}% Ready</span>
                  </div>
                  <h4 className={cn('heading-xs', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>{sc.name}</h4>
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(sc.skills).slice(0, 6).map(([sName, sScore]) => (
                      <div
                        key={sName}
                        className={cn(
                          'flex justify-between items-center p-2 rounded',
                          isHeist ? 'bg-burgundy/10' : 'bg-slate-50'
                        )}
                      >
                        <span className={isHeist ? 'text-warm-ivory/80' : 'text-slate-700'}>{sName}</span>
                        <span className={cn('font-bold', isHeist ? 'text-crimson' : 'text-blue-600')}>
                          {sScore.toFixed(1)} / 10
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className={cn('text-[11px] font-mono', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    Projected Gain:{' '}
                    <strong className="text-emerald-500">+{Math.max(0, r - baselineReadiness)}%</strong> over current baseline.
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
            <h3 className={cn('heading-sm font-mono text-sm uppercase', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
              SCENARIOS
            </h3>
            <button
              onClick={addScenario}
              className={cn(
                'p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono border cursor-pointer',
                isHeist
                  ? 'text-crimson hover:bg-burgundy/20 border-crimson/30'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-200'
              )}
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
                      ? isHeist
                        ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                        : 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm font-bold'
                      : isHeist
                      ? 'card-hover border-burgundy/25 text-warm-ivory/80 bg-charcoal/50'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  )}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{scenario.name}</p>
                    {scenario.isDbBacked && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        NEON DB
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono opacity-80 pt-1 border-t border-current/20">
                    <span>Readiness: {readiness}%</span>
                    {isSelected && scenarios.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(scenario.id)
                        }}
                        className="text-xs hover:text-red-500 transition-colors p-1"
                        title="Delete Scenario"
                      >
                        <Trash2 size={13} />
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
            <div className={cn('card border', isHeist ? 'border-burgundy/30 bg-charcoal' : 'border-slate-200 bg-white')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h2 className={cn('heading-md', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {selectedScenario.name}
                  </h2>
                  <p className={cn('text-xs font-mono mt-0.5', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    Target Goal: {selectedScenario.targetRoleName || 'Target Engineering Role'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono px-2 py-1 rounded border', isHeist ? 'bg-burgundy/20 border-burgundy/40 text-warm-ivory/80' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                    Timeline: {selectedScenario.timelineMonths || 6} Mo
                  </span>
                  <span className={cn('text-xs font-mono px-2 py-1 rounded border', isHeist ? 'bg-burgundy/20 border-burgundy/40 text-warm-ivory/80' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                    Commitment: {selectedScenario.hoursPerWeek || 10} hrs/wk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    SIMULATED READINESS
                  </p>
                  <p className={cn('text-3xl font-bold font-mono', isHeist ? 'text-crimson' : 'text-blue-600')}>
                    {calculateReadiness(selectedScenario.skills)}%
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    CURRENT BASELINE
                  </p>
                  <p className={cn('text-3xl font-bold font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {baselineReadiness}%
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg border', isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200')}>
                  <p className={cn('text-xs font-mono mb-1', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    PROJECTED GAIN
                  </p>
                  <p className="text-3xl font-bold text-emerald-500 font-mono">
                    +{Math.max(0, calculateReadiness(selectedScenario.skills) - baselineReadiness)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className={cn('card space-y-4 border', isHeist ? 'border-burgundy/30 bg-charcoal' : 'border-slate-200 bg-white')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className={cn('heading-sm font-mono text-sm uppercase', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    INTERACTIVE SKILL CONTROLS
                  </h3>
                  <p className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                    DRAG SLIDERS TO MODEL MASTERY IMPACT IN REAL TIME
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSkill(!showAddSkill)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-mono rounded border flex items-center gap-1 cursor-pointer transition-colors',
                      isHeist ? 'border-crimson/40 text-crimson hover:bg-crimson/10' : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    )}
                  >
                    <Plus size={12} /> ADD SKILL
                  </button>
                  <span className={isHeist ? 'stamp-classified' : 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700'}>
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Add Custom Skill Bar */}
              {showAddSkill && (
                <div className={cn('p-3 rounded-lg border flex items-center gap-2', isHeist ? 'bg-burgundy/20 border-crimson/40' : 'bg-slate-50 border-blue-200')}>
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. Terraform, GraphQL, Rust)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                    className={cn(
                      'flex-1 text-xs px-3 py-1.5 rounded border focus:outline-none',
                      isHeist ? 'bg-obsidian border-burgundy/40 text-warm-ivory' : 'bg-white border-slate-300 text-slate-900'
                    )}
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-crimson text-white hover:brightness-110 cursor-pointer"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => setShowAddSkill(false)}
                    className="px-2 py-1.5 text-xs rounded border border-inherit text-inherit hover:opacity-75 cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedScenario.skills).map(([skill, score]) => {
                  const currentCandidateSkill = (candidateProfile?.skills || mockCandidate.skills).find(
                    (s: any) => s.name.toLowerCase() === skill.toLowerCase()
                  )
                  const currentScore = currentCandidateSkill?.score || 5.0
                  const delta = Number((score - currentScore).toFixed(1))

                  return (
                    <div
                      key={skill}
                      className={cn(
                        'p-3 border rounded-lg space-y-2',
                        isHeist ? 'bg-burgundy/10 border-burgundy/20' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className={cn('font-semibold text-sm', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                          {skill}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-700')}>
                            <span className="opacity-50">{currentScore}</span>
                            <span className={cn('mx-1', isHeist ? 'text-crimson' : 'text-blue-600')}>→</span>
                            <span className={cn('font-bold', isHeist ? 'text-crimson' : 'text-blue-600')}>
                              {score.toFixed(1)}
                            </span>
                          </span>
                          {delta > 0 && (
                            <span className="text-xs text-emerald-500 font-mono font-bold">+{delta.toFixed(1)}</span>
                          )}
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
                          style={{
                            background: `linear-gradient(to right, ${isHeist ? '#DC2626' : '#2563EB'} 0%, ${isHeist ? '#DC2626' : '#2563EB'} ${(score / 10) * 100}%, #334155 ${(score / 10) * 100}%, #334155 100%)`,
                          }}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer scenario-slider"
                        />
                        <span className={cn('w-8 text-right font-mono text-xs font-bold', isHeist ? 'text-warm-ivory/90' : 'text-slate-800')}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Qualified Roles */}
            <div className={cn('card border', isHeist ? 'bg-emerald-400/5 border-emerald-400/30' : 'bg-emerald-50/50 border-emerald-200')}>
              <h3 className="heading-sm text-emerald-500 mb-4 font-mono text-sm uppercase flex items-center gap-2">
                <Sparkles size={16} /> SIMULATION OUTPUTS // QUALIFIED TARGETS & ROI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    QUALIFIED TARGET ROLES
                  </p>
                  <div className="space-y-1.5">
                    {['Cloud Solutions Architect', 'Senior Full Stack Lead', 'Platform DevOps Specialist'].map((role) => (
                      <div
                        key={role}
                        className={cn('flex items-center gap-2 text-xs font-mono', isHeist ? 'text-warm-ivory/90' : 'text-slate-800')}
                      >
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    ESTIMATED TIME TO UPSKILL
                  </p>
                  <p className={cn('text-xl font-bold font-mono', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                    {selectedScenario.timelineMonths || 6} Months
                  </p>
                  <p className={cn('text-xs font-mono mt-1', isHeist ? 'text-warm-ivory/50' : 'text-slate-500')}>
                    ~{selectedScenario.hoursPerWeek || 10} hours/week structured study
                  </p>
                </div>

                <div>
                  <p className={cn('text-xs font-mono mb-2', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    STRATEGIC DIRECTIVE
                  </p>
                  <p className={cn('text-xs leading-relaxed font-mono', isHeist ? 'text-warm-ivory/80' : 'text-slate-700')}>
                    Prioritize top capability gaps in Resistance Learning sprints to achieve targeted 85%+ readiness.
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
