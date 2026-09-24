import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Filter, Download, ArrowRight, TrendingUp, DollarSign, Globe } from 'lucide-react'
import { mockMarketData } from '../data/mockData'
import { formatNumber, getTrendColor } from '../lib/utils'
import { cn } from '../lib/utils'

export const MarketIntelligence: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')

  const roleStats: Record<string, { postings: number; growth: string; exp: string }> = {
    'Full Stack Developer': { postings: 9240, growth: '+18.4%', exp: '2-5 years' },
    'Frontend Engineer': { postings: 7120, growth: '+12.1%', exp: '2-4 years' },
    'Backend Engineer': { postings: 8450, growth: '+15.8%', exp: '3-6 years' },
    'DevOps Specialist': { postings: 5310, growth: '+24.6%', exp: '3-7 years' },
    'Data Engineer': { postings: 6890, growth: '+28.2%', exp: '2-5 years' },
    'Cloud Architect': { postings: 3420, growth: '+31.5%', exp: '5-8+ years' },
  }

  const currentStats = roleStats[selectedRole] || roleStats['Full Stack Developer']

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-lg text-warm-ivory mb-1">MARKET INTELLIGENCE RADAR</h1>
            <p className="text-warm-ivory/60 font-mono text-xs">
              OPERATION // MACRO INDUSTRY DEMAND, HIRING PULSE & COMPENSATION BENCHMARKS
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate?.('job-finder')}
              className="btn-primary flex items-center gap-2 text-xs font-mono py-2 px-3.5"
            >
              FIND MATCHED JOBS <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Role Selector Tabs */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-3 font-mono text-xs">TARGET ROLE BENCHMARK</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {mockMarketData.topRoles.map((role) => (
            <button
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 text-center truncate',
                selectedRole === role.name
                  ? 'bg-gradient-crimson text-warm-ivory font-bold shadow-glow-crimson border border-crimson/60'
                  : 'bg-burgundy/10 text-warm-ivory/70 border border-burgundy/20 hover:border-crimson/40 hover:text-warm-ivory'
              )}
            >
              {role.name}
            </button>
          ))}
        </div>
      </section>

      {/* Key Metrics Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ACTIVE VACANCIES</p>
          <p className="heading-sm text-crimson font-mono">{formatNumber(currentStats.postings)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">↑ Strong Hiring Pressure</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">YOY DEMAND GROWTH</p>
          <p className="heading-sm text-warm-ivory font-mono">{currentStats.growth}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Accelerating trajectory</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">MEDIAN EXPERIENCE</p>
          <p className="heading-sm text-warm-ivory font-mono">{currentStats.exp}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Core market expectation</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">MEDIAN SALARY BAND</p>
          <p className="heading-sm text-emerald-400 font-mono">$135k - $185k</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Tier 1 market rate</p>
        </div>
      </section>

      {/* Trajectory & Skills Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Demand Trend Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="heading-sm text-warm-ivory mb-2 font-mono text-sm">6-MONTH HIRING TRAJECTORY</h3>
          <p className="text-xs text-warm-ivory/50 font-mono mb-6">MACRO RECRUITMENT VOLUME OVER TIME</p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMarketData.skillTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.1)" />
                <XAxis dataKey="month" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#B3132B"
                  strokeWidth={3}
                  dot={{ fill: '#B3132B', r: 4 }}
                  activeDot={{ r: 7, fill: '#E63946' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills for Selected Role */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="heading-sm text-warm-ivory mb-2 font-mono text-sm">HIGH-DEMAND STACKS</h3>
            <p className="text-xs text-warm-ivory/50 font-mono mb-4">CRITICAL REQUIREMENTS</p>
            <div className="space-y-3">
              {mockMarketData.topSkills.map((skill, idx) => (
                <div key={skill.name} className="p-2.5 bg-burgundy/10 rounded border border-burgundy/20">
                  <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                    <span className="font-semibold text-warm-ivory">{skill.name}</span>
                    <span className="text-emerald-400 font-bold">{skill.trend}</span>
                  </div>
                  <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${skill.demand}%` }}
                      className="h-full bg-gradient-crimson rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="w-full btn-secondary text-xs font-mono py-2.5 mt-4 flex items-center justify-center gap-2"
          >
            UPSKILL IN DEMAND STACKS <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Location Analysis */}
      <section className="card">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={18} className="text-crimson" />
          <h3 className="heading-sm text-warm-ivory font-mono text-sm">GEOGRAPHIC HUBS & HIRING DENSITY</h3>
        </div>
        <p className="text-xs text-warm-ivory/50 font-mono mb-6">OPEN POSITIONS BY REGIONAL TECH HUBS</p>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockMarketData.locationDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.1)" />
              <XAxis dataKey="location" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
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
              <Bar dataKey="jobs" fill="#B3132B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Compensation Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(mockMarketData.compensationRanges.softwareEngineer).map(([level, range]) => (
          <div key={level} className="card bg-burgundy/15 border-burgundy/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-emerald-400" />
              <p className="text-xs text-warm-ivory/70 font-mono uppercase">{level} LEVEL</p>
            </div>
            <p className="heading-md text-crimson mb-1 font-mono">{range}</p>
            <p className="text-[11px] text-warm-ivory/50 font-mono">Total cash compensation + equity</p>
          </div>
        ))}
      </section>
    </div>
  )
}
