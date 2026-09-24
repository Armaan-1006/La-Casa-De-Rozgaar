import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, TrendingUp, Target, ArrowRight, ChevronRight } from 'lucide-react'
import { mockEmployer, mockMarketData } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface EmployerDashboardProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE WORKFORCE OVERVIEW COMPONENT
// ============================================================================
const EnterpriseWorkforceOverview: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const departments = [
    { name: 'Core Engineering', count: 480, score: 82, target: 88, requisitions: 18 },
    { name: 'Product Management', count: 120, score: 74, target: 78, requisitions: 6 },
    { name: 'Data & Analytics', count: 210, score: 68, target: 80, requisitions: 11 },
    { name: 'Cloud Infrastructure', count: 160, score: 61, target: 78, requisitions: 9 },
    { name: 'Information Security', count: 75, score: 54, target: 76, requisitions: 4 },
  ]

  const requisitions = [
    { title: 'Senior Cloud Architect', dept: 'Platform Infrastructure', openCount: 4, daysOpen: 28, applicants: 32, priority: 'High' },
    { title: 'Data Platform Engineer', dept: 'Data & Analytics', openCount: 5, daysOpen: 19, applicants: 48, priority: 'High' },
    { title: 'Principal Full Stack Engineer', dept: 'Core Engineering', openCount: 6, daysOpen: 14, applicants: 64, priority: 'Medium' },
    { title: 'Technical Product Manager', dept: 'Product Management', openCount: 3, daysOpen: 22, applicants: 26, priority: 'Medium' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Workforce Overview & Capability
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time analytics on organizational talent capacity, departmental skill coverage, and active hiring requisitions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('workforce-gaps')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1.5"
          >
            Diagnose Skill Gaps <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Organization</span>
          <div className="text-2xl font-bold text-slate-900">Acme Technologies</div>
          <p className="text-[11px] text-slate-500">Global Enterprise Division</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Active Workforce</span>
          <div className="text-2xl font-bold text-slate-900">12,482</div>
          <p className="text-[11px] text-emerald-700 font-semibold">98.2% Active Retention Rate</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Open Requisitions</span>
          <div className="text-2xl font-bold text-slate-900">{mockEmployer.hiringPlans}</div>
          <p className="text-[11px] text-slate-500">14 roles in late-stage interviews</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Avg Time to Hire</span>
          <div className="text-2xl font-bold text-slate-900">{mockEmployer.averageTimeToHire}</div>
          <p className="text-[11px] text-slate-500">Industry benchmark: 48 days</p>
        </div>
      </section>

      {/* 3. Departmental Coverage & Headcount */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Department List */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Departmental Capability Coverage
              </h3>
              <p className="text-[11px] text-slate-500">
                Current skill benchmark vs operational target by department.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('workforce-gaps')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Gap Analysis →
            </button>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{dept.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">{dept.count} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-600">{dept.score}% / {dept.target}%</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {dept.requisitions} Requisitions
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${dept.score}%` }}
                    className="bg-[#1E3A8A] h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobility & Internal Talent Bench */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Internal Mobility & Bench Strength
            </h3>
            <p className="text-[11px] text-slate-500">
              High-potential employees positioned for succession.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Pre-Qualified Successors</div>
                <div className="text-[11px] text-slate-500">Ready for role elevation within 90 days</div>
              </div>
              <span className="text-lg font-bold text-slate-900 font-mono">84</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Internal Role Transitions</div>
                <div className="text-[11px] text-slate-500">Completed lateral or vertical moves in Q3</div>
              </div>
              <span className="text-lg font-bold text-emerald-700 font-mono">28</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Active Upskilling Cohorts</div>
                <div className="text-[11px] text-slate-500">Currently enrolled in technical sprints</div>
              </div>
              <span className="text-lg font-bold text-blue-700 font-mono">142</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.('roadmap')}
            className="w-full py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-center"
          >
            Inspect Learning Curriculum
          </button>
        </div>
      </section>

      {/* 4. Active Requisitions Table */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              High-Priority Requisitions
            </h3>
            <p className="text-xs text-slate-500">
              Open hiring demands currently mapped to candidate discovery pipelines.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('talent-vault')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            Match in Talent Directory <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Role Title</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">Open Positions</th>
                <th className="py-2.5 px-4 font-semibold">Days Active</th>
                <th className="py-2.5 px-4 font-semibold">Qualified Applicants</th>
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requisitions.map((req) => (
                <tr key={req.title} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {req.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {req.dept}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {req.openCount}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {req.daysOpen} days
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-700 font-semibold">
                    {req.applicants}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold',
                        req.priority === 'High'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate?.('talent-vault')}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      Source <ChevronRight size={13} />
                    </button>
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
// MAIN EMPLOYER DASHBOARD EXPORT (Dual Mode)
// ============================================================================
export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()

  // In Enterprise Mode: render the enterprise workforce overview
  if (!isHeist) {
    return <EnterpriseWorkforceOverview onNavigate={onNavigate} />
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">ORGANIZATIONAL COMMAND</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // RECRUITER-MASTERMIND-HQ</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">EMPLOYER MASTERMIND // TALENT STRATEGY</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              WORKFORCE CAPABILITY BENCHMARKS, RECRUITMENT PRESSURE RADAR & TALENT SOURCING PIPELINES
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate?.('talent-vault')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              TALENT VAULT DISCOVERY <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Organization Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ORGANIZATION</p>
          <p className="heading-sm text-warm-ivory">{mockEmployer.name}</p>
          <p className="text-[11px] text-warm-ivory/50 mt-1 font-mono">{mockEmployer.size}</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ACTIVE WORKFORCE</p>
          <p className="heading-sm text-crimson font-mono">{mockEmployer.totalEmployees}</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">98% Verified Capability Index</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">Q4 HIRING REQUISITIONS</p>
          <p className="heading-sm text-warm-ivory font-mono">{mockEmployer.hiringPlans}</p>
          <p className="text-[11px] text-warm-ivory/50 mt-1 font-mono">Sourcing Pipeline Open</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">HIRING DIFFICULTY INDEX</p>
          <p className="heading-sm text-amber-400 font-mono">{mockEmployer.hiringDifficultyIndex}</p>
          <p className="text-[11px] text-warm-ivory/50 mt-1 font-mono">Avg Time to Hire: {mockEmployer.averageTimeToHire}</p>
        </div>
      </section>

      {/* Main Grid: Internal Benchmarks & Market Demand Pulse */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current vs Future Capability */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">INTERNAL CAPABILITY BENCHMARK</h3>
            <button
              onClick={() => onNavigate?.('workforce-gaps')}
              className="text-xs font-mono text-crimson hover:underline"
            >
              Full Gap Audit →
            </button>
          </div>

          <div className="space-y-3.5">
            {mockEmployer.currentWorkforce.map((skill) => {
              const future = mockEmployer.futureRequirement.find((f) => f.skill === skill.skill)
              const gap = future ? future.requirement - skill.availability : 0

              return (
                <div key={skill.skill} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-warm-ivory text-sm">{skill.skill}</p>
                    <span className={cn(
                      'text-xs font-mono font-bold',
                      gap > 20 ? 'text-crimson' : gap > 0 ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {gap > 0 ? `Deficit: -${gap}%` : 'Benchmark Met'}
                    </span>
                  </div>

                  <div className="flex gap-4 text-xs font-mono">
                    <div className="flex-1">
                      <div className="text-[10px] text-warm-ivory/60 mb-1">Current Availability ({skill.availability}%)</div>
                      <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                        <div style={{ width: `${skill.availability}%` }} className="h-full bg-gradient-crimson rounded-full" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-[10px] text-warm-ivory/60 mb-1">Target Mandate ({future ? future.requirement : 0}%)</div>
                      <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                        <div style={{ width: `${future ? future.requirement : 0}%` }} className="h-full bg-muted-gold rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Macro Tech Demand Pulse */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">EXTERNAL RECRUITMENT VOLUME</h3>
            <span className="stamp-verified">MARKET INTEL</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMarketData.topSkills.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.12)" />
                <XAxis dataKey="name" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <YAxis stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(21,21,24,0.95)',
                    border: '1px solid rgba(179,19,43,0.4)',
                    borderRadius: '8px',
                    color: '#F2E9DC',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="demand" fill="#B3132B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Strategic Summary Directives */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-burgundy/20 border-crimson/40 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-crimson" />
            <span className="font-semibold text-crimson font-mono text-xs uppercase">CRITICAL DEFICITS</span>
          </div>
          <p className="text-2xl font-bold text-warm-ivory font-mono">2 SECTORS</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono pt-1">
            <p className="text-red-400">• Kubernetes (-42% capability gap)</p>
            <p className="text-red-400">• AI/ML Systems (-40% capability gap)</p>
          </div>
        </div>

        <div className="card bg-amber-400/10 border-amber-400/30 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-400" />
            <span className="font-semibold text-amber-400 font-mono text-xs uppercase">ACCELERATING TALENT DEMAND</span>
          </div>
          <p className="text-2xl font-bold text-warm-ivory font-mono">5 DOMAINS</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono pt-1">
            <p>• Fast-growing skills in peer enterprise ecosystems</p>
            <p>• Recommend workforce upskilling tracks</p>
          </div>
        </div>

        <div className="card bg-emerald-400/10 border-emerald-400/30 space-y-2">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-emerald-400" />
            <span className="font-semibold text-emerald-400 font-mono text-xs uppercase">STRATEGIC ADVANTAGE</span>
          </div>
          <p className="text-2xl font-bold text-warm-ivory font-mono">3 STACKS</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono pt-1">
            <p>• Internal full-stack JavaScript & SQL at 82%+</p>
            <p>• Ready for enterprise scale delivery</p>
          </div>
        </div>
      </section>

      {/* Gateway Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate?.('talent-vault')}
          className="card-hover p-5 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">TALENT VAULT →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono">
            Access verified candidate dossiers, benchmark scores, and initiate direct transmissions.
          </p>
        </button>

        <button
          onClick={() => onNavigate?.('workforce-gaps')}
          className="card-hover p-5 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">WORKFORCE GAPS MATRIX →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono">
            Execute current vs strategic capability gap diagnostics and allocate training cohorts.
          </p>
        </button>

        <button
          onClick={() => onNavigate?.('compensation')}
          className="card-hover p-5 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">COMPENSATION ENGINE →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono">
            Benchmark total cash and equity packages against regional percentile curves.
          </p>
        </button>
      </section>
    </div>
  )
}
