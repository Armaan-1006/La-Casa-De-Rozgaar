import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, TrendingUp, Target } from 'lucide-react'
import { mockEmployer, mockMarketData } from '../data/mockData'
import { cn } from '../lib/utils'

export const EmployerDashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="heading-lg text-warm-ivory mb-2">EMPLOYER MASTERMIND</h1>
        <p className="text-warm-ivory/60 font-mono text-sm">
          OPERATION // WORKFORCE INTELLIGENCE & TALENT PLANNING
        </p>
      </section>

      {/* Organization Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">ORGANIZATION</p>
          <p className="heading-sm text-warm-ivory">{mockEmployer.name}</p>
          <p className="text-xs text-warm-ivory/50 mt-2 font-mono">{mockEmployer.size} organization</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">TOTAL EMPLOYEES</p>
          <p className="heading-sm text-crimson font-mono">{mockEmployer.totalEmployees}</p>
          <p className="text-xs text-emerald-400 mt-2 font-mono">98% Verified</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">HIRING TARGETS</p>
          <p className="heading-sm text-warm-ivory font-mono">{mockEmployer.hiringPlans}</p>
          <p className="text-xs text-warm-ivory/50 mt-2 font-mono">Q3 Pipeline Active</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">MARKET STATUS</p>
          <div className="status-online text-xs font-mono">ENGAGED & ACTIVE</div>
          <p className="text-xs text-warm-ivory/50 mt-2 font-mono">Live Ingestion</p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current vs Future Capability */}
        <div className="card">
          <h3 className="heading-sm text-warm-ivory mb-6 font-mono text-sm">INTERNAL CAPABILITY BENCHMARK</h3>
          <div className="space-y-4">
            {mockEmployer.currentWorkforce.map((skill) => {
              const future = mockEmployer.futureRequirement.find((f) => f.skill === skill.skill)!
              const gap = future ? future.requirement - skill.availability : 0

              return (
                <div key={skill.skill} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-warm-ivory text-sm">{skill.skill}</p>
                    <span className={cn(
                      'text-xs font-mono font-bold',
                      gap > 10 ? 'text-crimson' : gap > 0 ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {gap > 0 ? `Gap: -${gap}%` : 'Sufficient'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {/* Current */}
                    <div className="flex-1">
                      <div className="text-[11px] text-warm-ivory/60 font-mono mb-1">Current Availability ({skill.availability}%)</div>
                      <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${skill.availability}%` }}
                          className="h-full bg-gradient-crimson rounded-full"
                        />
                      </div>
                    </div>

                    {/* Future */}
                    <div className="flex-1">
                      <div className="text-[11px] text-warm-ivory/60 font-mono mb-1">Target Requirement ({future ? future.requirement : 0}%)</div>
                      <div className="w-full bg-burgundy/30 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${future ? future.requirement : 0}%` }}
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

        {/* Market Trends */}
        <div className="card">
          <h3 className="heading-sm text-warm-ivory mb-6 font-mono text-sm">MARKET DEMAND PULSE</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMarketData.topSkills.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.1)" />
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

      {/* Skills Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-burgundy/20 border-crimson/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-crimson" />
            <span className="font-semibold text-crimson font-mono text-sm">CRITICAL DEFICITS</span>
          </div>
          <p className="text-3xl font-bold text-warm-ivory font-mono mb-2">2</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono">
            <p className="text-red-400">• Kubernetes (-18% capability gap)</p>
            <p className="text-red-400">• AI/ML Engineering (-32% capability gap)</p>
          </div>
        </div>

        <div className="card bg-amber-400/10 border-amber-400/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-amber-400" />
            <span className="font-semibold text-amber-400 font-mono text-sm">EXPANDING DEMAND</span>
          </div>
          <p className="text-3xl font-bold text-warm-ivory font-mono mb-2">5</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono">
            <p>• Fast-growing skills in peer ecosystems</p>
            <p>• Recommend workforce upskilling tracks</p>
          </div>
        </div>

        <div className="card bg-emerald-400/10 border-emerald-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-emerald-400" />
            <span className="font-semibold text-emerald-400 font-mono text-sm">STRATEGIC ADVANTAGE</span>
          </div>
          <p className="text-3xl font-bold text-warm-ivory font-mono mb-2">3</p>
          <div className="text-xs text-warm-ivory/70 space-y-1 font-mono">
            <p>• Internal full-stack mastery at 90%+</p>
            <p>• Ready for enterprise scale delivery</p>
          </div>
        </div>
      </section>

      {/* Strategic Recommendations */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <h3 className="heading-sm text-crimson mb-4 font-mono text-sm">STRATEGIC DIRECTIVES</h3>
        <div className="space-y-3">
          <div className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg">
            <p className="text-sm font-semibold text-warm-ivory mb-1">Acquisition Priority: Cloud Native & Kubernetes</p>
            <p className="text-xs text-warm-ivory/60 font-mono">Market demand spiked +42% YoY. Target talent vault candidates with AWS/Docker specialization.</p>
          </div>

          <div className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg">
            <p className="text-sm font-semibold text-warm-ivory mb-1">Upskill Sprint: LLM & Generative AI</p>
            <p className="text-xs text-warm-ivory/60 font-mono">Launch a 4-week internal heist cohort to elevate core engineering team readiness.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate?.('candidate-dossier')}
          className="card-hover p-4 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">TALENT VAULT →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono mb-2">Review recruit dossiers and verified benchmarks.</p>
        </button>

        <button
          onClick={() => onNavigate?.('skill-intelligence')}
          className="card-hover p-4 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">SKILL INTELLIGENCE →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono mb-2">Explore macro skills and compensation bands.</p>
        </button>

        <button
          onClick={() => onNavigate?.('market-intelligence')}
          className="card-hover p-4 text-left border border-burgundy/30 rounded-lg group"
        >
          <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">MARKET RADAR →</h4>
          <p className="text-warm-ivory/70 text-xs font-mono mb-2">Track real-time market shifts and hiring spikes.</p>
        </button>
      </section>
    </div>
  )
}
