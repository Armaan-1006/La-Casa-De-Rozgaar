import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, TrendingUp, Target, ArrowRight } from 'lucide-react'
import { mockEmployer, mockMarketData } from '../data/mockData'
import { cn } from '../lib/utils'

interface EmployerDashboardProps {
  onNavigate?: (page: string) => void
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
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
