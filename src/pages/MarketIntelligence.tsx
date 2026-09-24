import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Globe, DollarSign } from 'lucide-react'
import { mockMarketData } from '../data/mockData'
import { formatNumber } from '../lib/utils'
import { cn } from '../lib/utils'

interface MarketIntelligenceProps {
  onNavigate?: (page: string) => void
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ onNavigate }) => {
  const [selectedRoleName, setSelectedRoleName] = useState('Full Stack Developer')

  const activeRole =
    mockMarketData.topRoles.find((r) => r.name === selectedRoleName) || mockMarketData.topRoles[3]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">LIVE RADAR</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // MACRO-MARKET-SIGNALS</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">MARKET INTELLIGENCE RADAR</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              MACRO INDUSTRY DEMAND, HIRING PRESSURE CURVES & REGIONAL TALENT DENSITY
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate?.('job-finder')}
              className="btn-primary flex items-center gap-2 text-xs font-mono py-2.5 px-4"
            >
              FIND MATCHED JOBS <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Role Selector Tabs */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
            BENCHMARK ROLE REGISTER
          </h3>
          <span className="text-[10px] font-mono text-warm-ivory/50">SELECT TO UPDATE INTELLIGENCE VECTORS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {mockMarketData.topRoles.map((role) => (
            <button
              key={role.name}
              onClick={() => setSelectedRoleName(role.name)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 text-center truncate border',
                selectedRoleName === role.name
                  ? 'bg-gradient-crimson text-warm-ivory font-bold shadow-glow-crimson border-crimson/60'
                  : 'bg-burgundy/10 text-warm-ivory/70 border-burgundy/20 hover:border-crimson/40 hover:text-warm-ivory'
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
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ACTIVE OPENINGS</p>
          <p className="heading-sm text-crimson font-mono">{formatNumber(activeRole.demand)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">↑ High Hiring Pressure</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">YOY DEMAND VELOCITY</p>
          <p className="heading-sm text-warm-ivory font-mono">{activeRole.trend}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Accelerating Ingestion</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">CATEGORY</p>
          <p className="heading-sm text-warm-ivory font-mono">{activeRole.category}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Standardized Domain</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">MEDIAN SALARY BAND</p>
          <p className="heading-sm text-emerald-400 font-mono">{activeRole.salary}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Tier-1 Indian Corridors</p>
        </div>
      </section>

      {/* Dynamic Trajectory & Skills Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Role Trajectory Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 border-b border-burgundy/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-crimson font-bold uppercase tracking-wider">
                TRAJECTORY ANALYSIS // {activeRole.name}
              </span>
              <h3 className="heading-sm text-warm-ivory font-mono text-sm mt-0.5">
                6-MONTH RECRUITMENT PRESSURE INDEX
              </h3>
            </div>
            <span className="stamp-verified">VERIFIED CURVE</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRole.trajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.12)" />
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

        {/* Dynamic Skills for Selected Role */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="heading-sm text-warm-ivory mb-1 font-mono text-sm uppercase">HIGH-DEMAND STACKS</h3>
            <p className="text-xs text-warm-ivory/50 font-mono mb-4">CRITICAL MANDATES FOR {activeRole.name.toUpperCase()}</p>
            <div className="space-y-3">
              {activeRole.keySkills.map((skill) => (
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
            AUDIT GAPS IN SKILL HEIST <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Geographic Hubs & Hiring Density */}
      <section className="card">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={18} className="text-crimson" />
          <h3 className="heading-sm text-warm-ivory font-mono text-sm">REGIONAL HUBS & RECRUITMENT DENSITY</h3>
        </div>
        <p className="text-xs text-warm-ivory/50 font-mono mb-6">OPEN LISTINGS BY REGIONAL TECH HUBS</p>
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

      {/* Compensation Breakdown Cards */}
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
