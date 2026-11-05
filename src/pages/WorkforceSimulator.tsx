import React, { useState } from 'react'
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Trash2,
  Sliders,
  ChevronRight,
  Briefcase,
  BookOpen,
  UserPlus,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface WorkforceSimulatorProps {
  onNavigate?: (page: string) => void
}

interface ScenarioConfig {
  id: string
  name: string
  department: string
  targetCompetency: string
  cohortSize: number
  strategy: 'upskill' | 'hire' | 'hybrid'
  budgetCapLakhs: number
  targetQuarter: string
}

interface SimulationResult {
  totalCostLakhs: number
  hireCostLakhs: number
  upskillCostLakhs: number
  timeToCapabilityWeeks: number
  readinessGainPct: number
  retentionRiskPct: number
  roiMultiple: number
  timelineData: { month: string; capability: number; target: number }[]
  costComparison: { category: string; internalUpskill: number; lateralHire: number; hybrid: number }[]
}

const DEFAULT_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'sc-1',
    name: 'Q3 GenAI & LLM Platform Migration',
    department: 'Core Engineering',
    targetCompetency: 'Generative AI & MLOps Infrastructure',
    cohortSize: 20,
    strategy: 'hybrid',
    budgetCapLakhs: 45,
    targetQuarter: 'Q3 2026',
  },
  {
    id: 'sc-2',
    name: 'Cloud Native & Kubernetes Reliability Pod',
    department: 'Platform & Infrastructure',
    targetCompetency: 'Kubernetes Orchestration & Distributed SRE',
    cohortSize: 15,
    strategy: 'upskill',
    budgetCapLakhs: 25,
    targetQuarter: 'Q4 2026',
  },
]

export const WorkforceSimulator: React.FC<WorkforceSimulatorProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()

  const [scenarios, setScenarios] = useState<ScenarioConfig[]>(() => {
    try {
      const saved = localStorage.getItem('lcdr_workforce_scenarios')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_SCENARIOS
  })

  const [activeScenario, setActiveScenario] = useState<ScenarioConfig>(scenarios[0] || DEFAULT_SCENARIOS[0])
  const [scenarioName, setScenarioName] = useState(activeScenario.name)
  const [department, setDepartment] = useState(activeScenario.department)
  const [targetCompetency, setTargetCompetency] = useState(activeScenario.targetCompetency)
  const [cohortSize, setCohortSize] = useState(activeScenario.cohortSize)
  const [strategy, setStrategy] = useState<'upskill' | 'hire' | 'hybrid'>(activeScenario.strategy)
  const [budgetCapLakhs, setBudgetCapLakhs] = useState(activeScenario.budgetCapLakhs)
  const [targetQuarter, setTargetQuarter] = useState(activeScenario.targetQuarter)

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Recalculate Simulation Metrics dynamically based on controls
  const calculateResults = (): SimulationResult => {
    const size = cohortSize

    let upskillRatio = 1
    let hireRatio = 0

    if (strategy === 'hire') {
      upskillRatio = 0
      hireRatio = 1
    } else if (strategy === 'hybrid') {
      upskillRatio = 0.6
      hireRatio = 0.4
    }

    const upskillCount = Math.round(size * upskillRatio)
    const hireCount = size - upskillCount

    // Cost calculations (in Lakhs INR)
    // Avg training course + sandbox costs: ₹1.2L per employee
    // Avg recruitment fee + ramp-up salary premium: ₹4.8L per lateral hire
    const upskillCost = Math.round(upskillCount * 1.2 * 10) / 10
    const hireCost = Math.round(hireCount * 4.8 * 10) / 10
    const totalCost = Math.round((upskillCost + hireCost) * 10) / 10

    // Time to capability (weeks)
    let weeks = 12
    if (strategy === 'hire') weeks = 8 // recruiting + 30 days onboarding
    if (strategy === 'upskill') weeks = 14 // learning path completion
    if (strategy === 'hybrid') weeks = 10

    // Capability score ramp-up
    const readinessGain = strategy === 'upskill' ? 38 : strategy === 'hire' ? 52 : 46
    const retentionRisk = strategy === 'hire' ? 24 : strategy === 'upskill' ? 6 : 12

    // Value delivered vs cost
    const benchmarkCost = size * 4.8
    const savings = Math.max(0, benchmarkCost - totalCost)
    const roiMultiple = Math.round(((savings + size * 3.5) / Math.max(1, totalCost)) * 10) / 10

    const timelineData = [
      { month: 'Month 0', capability: 48, target: 85 },
      { month: 'Month 1', capability: strategy === 'hire' ? 58 : 52, target: 85 },
      { month: 'Month 2', capability: strategy === 'hire' ? 72 : 62, target: 85 },
      { month: 'Month 3', capability: strategy === 'hire' ? 84 : 76, target: 85 },
      { month: 'Month 4', capability: strategy === 'hire' ? 88 : 84, target: 85 },
      { month: 'Month 6', capability: 92, target: 85 },
    ]

    const costComparison = [
      {
        category: 'Total Direct Cost (₹ Lakhs)',
        internalUpskill: Math.round(size * 1.2 * 10) / 10,
        lateralHire: Math.round(size * 4.8 * 10) / 10,
        hybrid: Math.round((size * 0.6 * 1.2 + size * 0.4 * 4.8) * 10) / 10,
      },
      {
        category: 'Ramp-up Drag Cost (₹ Lakhs)',
        internalUpskill: Math.round(size * 0.5 * 10) / 10,
        lateralHire: Math.round(size * 1.8 * 10) / 10,
        hybrid: Math.round(size * 0.9 * 10) / 10,
      },
    ]

    return {
      totalCostLakhs: totalCost,
      hireCostLakhs: hireCost,
      upskillCostLakhs: upskillCost,
      timeToCapabilityWeeks: weeks,
      readinessGainPct: readinessGain,
      retentionRiskPct: retentionRisk,
      roiMultiple: Math.max(1.8, roiMultiple),
      timelineData,
      costComparison,
    }
  }

  const result = calculateResults()

  const handleSaveScenario = () => {
    const updated: ScenarioConfig = {
      id: activeScenario.id.startsWith('sc-custom') ? activeScenario.id : `sc-custom-${Date.now()}`,
      name: scenarioName,
      department,
      targetCompetency,
      cohortSize,
      strategy,
      budgetCapLakhs,
      targetQuarter,
    }

    const nextList = scenarios.some((s) => s.id === updated.id)
      ? scenarios.map((s) => (s.id === updated.id ? updated : s))
      : [updated, ...scenarios]

    setScenarios(nextList)
    setActiveScenario(updated)
    localStorage.setItem('lcdr_workforce_scenarios', JSON.stringify(nextList))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleSelectScenario = (sc: ScenarioConfig) => {
    setActiveScenario(sc)
    setScenarioName(sc.name)
    setDepartment(sc.department)
    setTargetCompetency(sc.targetCompetency)
    setCohortSize(sc.cohortSize)
    setStrategy(sc.strategy)
    setBudgetCapLakhs(sc.budgetCapLakhs)
    setTargetQuarter(sc.targetQuarter)
  }

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextList = scenarios.filter((s) => s.id !== id)
    setScenarios(nextList)
    localStorage.setItem('lcdr_workforce_scenarios', JSON.stringify(nextList))
    if (activeScenario.id === id && nextList.length > 0) {
      handleSelectScenario(nextList[0])
    }
  }

  // ==========================================================================
  // ENTERPRISE WORKFORCE SIMULATOR
  // ==========================================================================
  if (!isHeist) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Workforce Scenario Simulator & ROI Modeling
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                Strategic Planning Lab
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Simulate talent acquisition vs internal upskilling trade-offs, budget allocations, and delivery lead times.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('talent-vault')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors flex items-center gap-1.5"
            >
              Talent Directory <ArrowRight size={13} />
            </button>
            <button
              onClick={handleSaveScenario}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Save size={14} />}
              {savedSuccess ? 'Scenario Saved' : 'Save Scenario'}
            </button>
          </div>
        </div>

        {/* Saved Scenarios Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-slate-500 shrink-0">Saved Models:</span>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md border flex items-center gap-2 shrink-0 transition-all',
                activeScenario.id === sc.id
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{sc.name}</span>
              <span className="text-[10px] text-slate-400">({sc.cohortSize} roles)</span>
              {scenarios.length > 1 && (
                <span
                  onClick={(e) => handleDeleteScenario(sc.id, e)}
                  className="text-slate-400 hover:text-red-600 ml-1 p-0.5"
                >
                  <Trash2 size={11} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Grid: Parameters & Live Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Controls (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-blue-700" /> Scenario Parameters
                </h3>
                <span className="text-[10px] text-slate-400">Real-Time Projections</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Scenario Name</label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Target Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="Core Engineering">Core Engineering</option>
                      <option value="Platform & Infrastructure">Platform & Infrastructure</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                      <option value="AI Research & Engineering">AI Research & Engineering</option>
                      <option value="Product & Systems">Product & Systems</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Horizon Target</label>
                    <select
                      value={targetQuarter}
                      onChange={(e) => setTargetQuarter(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="Q3 2026">Q3 2026</option>
                      <option value="Q4 2026">Q4 2026</option>
                      <option value="Q1 2027">Q1 2027</option>
                      <option value="Q2 2027">Q2 2027</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Target Competency Domain</label>
                  <input
                    type="text"
                    value={targetCompetency}
                    onChange={(e) => setTargetCompetency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700">Cohort Size / Requisitions</label>
                    <span className="text-xs font-bold text-blue-700">{cohortSize} Engineers</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={1}
                    value={cohortSize}
                    onChange={(e) => setCohortSize(Number(e.target.value))}
                    className="w-full accent-[#1E3A8A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 Pod</span>
                    <span>30 Mid-Cohort</span>
                    <span>60 Large Scale</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-2">Acquisition vs Upskilling Strategy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upskill', label: '100% Upskill', desc: 'Internal Cohort' },
                      { id: 'hybrid', label: 'Hybrid (60/40)', desc: 'Balanced ROI' },
                      { id: 'hire', label: '100% External', desc: 'Lateral Hiring' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setStrategy(opt.id as any)}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all',
                          strategy === opt.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700">Allocated Budget Cap</label>
                    <span className="text-xs font-bold text-slate-900">₹{budgetCapLakhs} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={150}
                    step={5}
                    value={budgetCapLakhs}
                    onChange={(e) => setBudgetCapLakhs(Number(e.target.value))}
                    className="w-full accent-[#1E3A8A] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Simulated Projections & ROI Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Total Projected Cost</span>
                <div className="text-xl font-bold text-slate-900">₹{result.totalCostLakhs}L</div>
                <p className="text-[10px] text-slate-500">
                  {result.totalCostLakhs <= budgetCapLakhs ? (
                    <span className="text-emerald-700 font-semibold">Within Budget Cap</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Exceeds Cap by ₹{(result.totalCostLakhs - budgetCapLakhs).toFixed(1)}L</span>
                  )}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Lead Time to Mastery</span>
                <div className="text-xl font-bold text-blue-700">{result.timeToCapabilityWeeks} Weeks</div>
                <p className="text-[10px] text-slate-500">~{(result.timeToCapabilityWeeks / 4).toFixed(1)} Months to full velocity</p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Capability Lift</span>
                <div className="text-xl font-bold text-emerald-700">+{result.readinessGainPct}%</div>
                <p className="text-[10px] text-slate-500">Team competency benchmark</p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Calculated ROI Multiple</span>
                <div className="text-xl font-bold text-purple-700">{result.roiMultiple}x</div>
                <p className="text-[10px] text-slate-500">Value delivered vs outlay</p>
              </div>
            </div>

            {/* Capability Ramp Chart */}
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Capability Ramp-up Trajectory
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Projected competency curve towards target operational threshold (85% mastery).
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  Simulation Model v2.4
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="capability"
                      name="Projected Capability Score"
                      stroke="#1E3A8A"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#1E3A8A' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target Benchmark (85)"
                      stroke="#10B981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Comparison Bar */}
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Financial Comparison by Execution Model
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cost breakdown across Full Upskilling, Lateral Hiring, and Hybrid strategy.
                  </p>
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.costComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="internalUpskill" name="100% Upskill (₹L)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hybrid" name="Hybrid (60/40) (₹L)" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lateralHire" name="100% Lateral Hire (₹L)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // HEIST / CLASSIFIED MASTERMIND WORKFORCE SANDBOX
  // ==========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-warm-ivory uppercase tracking-wider font-mono">
              MASTERMIND HQ // WORKFORCE SIMULATION SANDBOX
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono text-crimson bg-crimson/10 border border-crimson/30 rounded">
              TACTICAL ENGINE ACTIVE
            </span>
          </div>
          <p className="text-xs md:text-sm text-warm-ivory/60 mt-0.5 font-mono">
            Model syndicate operative deployment, lateral headhunting vs resistance upskilling, and war-chest ROI.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => onNavigate?.('talent-vault')}
            className="px-3.5 py-1.5 text-xs text-warm-ivory bg-charcoal border border-white/10 hover:border-crimson/50 rounded transition-colors flex items-center gap-1.5"
          >
            TALENT VAULT <ArrowRight size={13} />
          </button>
          <button
            onClick={handleSaveScenario}
            className="px-4 py-1.5 text-xs font-bold text-white bg-crimson hover:bg-crimson/80 border border-crimson/50 rounded shadow-lg shadow-crimson/20 transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Save size={14} />}
            {savedSuccess ? 'MODEL COMMITTED' : 'SAVE TACTICAL PLAN'}
          </button>
        </div>
      </div>

      {/* Saved Models Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 font-mono">
        <span className="text-xs text-warm-ivory/50 shrink-0">// SCENARIO SLOTS:</span>
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc)}
            className={cn(
              'px-3 py-1.5 text-xs rounded border flex items-center gap-2 shrink-0 transition-all',
              activeScenario.id === sc.id
                ? 'bg-crimson/20 border-crimson text-warm-ivory font-bold shadow-md shadow-crimson/10'
                : 'bg-charcoal/70 border-white/10 text-warm-ivory/60 hover:bg-charcoal'
            )}
          >
            <span>{sc.name}</span>
            <span className="text-[10px] text-warm-ivory/40">({sc.cohortSize} operatives)</span>
            {scenarios.length > 1 && (
              <span
                onClick={(e) => handleDeleteScenario(sc.id, e)}
                className="text-warm-ivory/40 hover:text-crimson ml-1 p-0.5"
              >
                <Trash2 size={11} />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-charcoal/80 backdrop-blur-md rounded-lg border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} /> // TACTICAL CONTROLS
              </h3>
              <span className="text-[10px] text-warm-ivory/40">REAL-TIME TELEMETRY</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Plan Identifier</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Target Syndicate Pod</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  >
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Platform & Infrastructure">Platform & Infrastructure</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="AI Research & Engineering">AI Research & Engineering</option>
                    <option value="Product & Systems">Product & Systems</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Epoch Deadline</label>
                  <select
                    value={targetQuarter}
                    onChange={(e) => setTargetQuarter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  >
                    <option value="Q3 2026">Q3 2026</option>
                    <option value="Q4 2026">Q4 2026</option>
                    <option value="Q1 2027">Q1 2027</option>
                    <option value="Q2 2027">Q2 2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Target Capability Vector</label>
                <input
                  type="text"
                  value={targetCompetency}
                  onChange={(e) => setTargetCompetency(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-warm-ivory/60">Cohort Scale</label>
                  <span className="text-xs font-bold text-crimson">{cohortSize} Operatives</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={cohortSize}
                  onChange={(e) => setCohortSize(Number(e.target.value))}
                  className="w-full accent-crimson cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-2">Tactical Deployment Vector</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upskill', label: 'UPSKILL ONLY', desc: '100% Internal' },
                    { id: 'hybrid', label: 'HYBRID', desc: '60/40 Split' },
                    { id: 'hire', label: 'INFILTRATE', desc: '100% External' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setStrategy(opt.id as any)}
                      className={cn(
                        'p-2.5 rounded border text-left transition-all',
                        strategy === opt.id
                          ? 'bg-crimson/20 border-crimson text-warm-ivory'
                          : 'bg-black/40 border-white/10 text-warm-ivory/60 hover:bg-black/60'
                      )}
                    >
                      <div className="text-[11px] font-bold">{opt.label}</div>
                      <div className="text-[9px] text-warm-ivory/40 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-warm-ivory/60">War Chest Allocation</label>
                  <span className="text-xs font-bold text-warm-ivory">₹{budgetCapLakhs} Lakhs</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={budgetCapLakhs}
                  onChange={(e) => setBudgetCapLakhs(Number(e.target.value))}
                  className="w-full accent-crimson cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projections Dashboard */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-charcoal/80 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] text-warm-ivory/50">TOTAL BOUNTY COST</span>
              <div className="text-xl font-bold text-warm-ivory">₹{result.totalCostLakhs}L</div>
              <p className="text-[10px]">
                {result.totalCostLakhs <= budgetCapLakhs ? (
                  <span className="text-emerald-400 font-bold">WAR CHEST SECURE</span>
                ) : (
                  <span className="text-crimson font-bold">EXCEEDS ALLOCATION</span>
                )}
              </p>
            </div>

            <div className="p-3.5 bg-charcoal/80 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] text-warm-ivory/50">MISSION HORIZON</span>
              <div className="text-xl font-bold text-crimson">{result.timeToCapabilityWeeks} WEEKS</div>
              <p className="text-[10px] text-warm-ivory/50">~{(result.timeToCapabilityWeeks / 4).toFixed(1)} Months to strike</p>
            </div>

            <div className="p-3.5 bg-charcoal/80 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] text-warm-ivory/50">CAPABILITY SURGE</span>
              <div className="text-xl font-bold text-emerald-400">+{result.readinessGainPct}%</div>
              <p className="text-[10px] text-warm-ivory/50">Arsenal benchmark</p>
            </div>

            <div className="p-3.5 bg-charcoal/80 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] text-warm-ivory/50">STRATEGIC MULTIPLIER</span>
              <div className="text-xl font-bold text-amber-400">{result.roiMultiple}x</div>
              <p className="text-[10px] text-warm-ivory/50">Efficiency gain</p>
            </div>
          </div>

          {/* Capability Chart */}
          <div className="p-5 bg-charcoal/80 rounded-lg border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
                // OPERATIVE CAPABILITY ACCELERATION
              </h3>
              <span className="text-[10px] text-emerald-400">TARGET: 85% CAPABILITY</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888888' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#888888' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderRadius: '4px', border: '1px solid #333333', fontSize: '11px', color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="capability"
                    name="Syndicate Capability Score"
                    stroke="#D62828"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#D62828' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Benchmark Threshold (85)"
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Comparison Bar */}
          <div className="p-5 bg-charcoal/80 rounded-lg border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
              // FINANCIAL ALLOCATION COMPARISON
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.costComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888888' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderRadius: '4px', border: '1px solid #333333', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                  <Bar dataKey="internalUpskill" name="Upskill Cohort (₹L)" fill="#10B981" />
                  <Bar dataKey="hybrid" name="Hybrid Model (₹L)" fill="#D62828" />
                  <Bar dataKey="lateralHire" name="Lateral Infiltration (₹L)" fill="#EAB308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
