import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Zap, Users, Target, ArrowRight, ShieldCheck } from 'lucide-react'
import { mockMarketData } from '../data/mockData'
import { formatNumber, getTrendColor, getTrendIcon } from '../lib/utils'
import { cn } from '../lib/utils'

export const WarRoom: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Command Section */}
      <section className="relative overflow-hidden rounded-xl border border-crimson/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">LIVE INTELLIGENCE // NETWORK ACTIVE</span>
          </div>

          <h1 className="heading-xl text-warm-ivory mb-1">
            LA CASA DE ROZGAAR
          </h1>
          <h2 className="heading-sm text-crimson mb-4">
            AI WORKFORCE INTELLIGENCE & TALENT COMMAND
          </h2>

          <p className="text-warm-ivory/80 text-sm md:text-base mb-6 leading-relaxed">
            Ingest live market signals, calculate candidate capability matrices, eliminate skill deficits, and simulate next-generation career trajectories.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate?.('market-intelligence')}
              className="btn-primary flex items-center gap-2 text-xs font-mono py-3 px-5"
            >
              EXPLORE INTELLIGENCE <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate?.('candidate-dossier')}
              className="btn-secondary text-xs font-mono py-3 px-5"
            >
              VIEW CANDIDATE DOSSIER
            </button>
            <button
              onClick={() => onNavigate?.('simulation')}
              className="btn-secondary text-xs font-mono py-3 px-5"
            >
              CAREER SIMULATION
            </button>
          </div>
        </div>
      </section>

      {/* Key Market Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-warm-ivory/60 font-mono">JOBS ANALYZED</p>
            <Zap size={16} className="text-crimson" />
          </div>
          <p className="heading-sm text-warm-ivory font-mono">{formatNumber(mockMarketData.totalJobsAnalyzed)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+24.3% YoY Ingestion</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-warm-ivory/60 font-mono">SKILLS TRACKED</p>
            <Target size={16} className="text-crimson" />
          </div>
          <p className="heading-sm text-warm-ivory font-mono">{formatNumber(mockMarketData.totalSkillsTracked)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+12.1% Active Stacks</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">ROLES COVERED</p>
          <p className="heading-sm text-warm-ivory font-mono">{formatNumber(mockMarketData.totalRolesTracked)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+8.7% Expansion</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-2">INTELLIGENCE INTEGRITY</p>
          <p className="heading-sm text-emerald-400 font-mono">{mockMarketData.dataQuality}</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Cross-Verified Data</p>
        </div>
      </section>

      {/* Main Grid: Top Roles & Velocity Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Roles */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="heading-sm text-warm-ivory font-mono text-sm">TOP TARGET ROLES</h3>
          <div className="space-y-2.5">
            {mockMarketData.topRoles.slice(0, 4).map((role, idx) => (
              <div
                key={role.name}
                onClick={() => onNavigate?.('market-intelligence')}
                className="p-3.5 card-hover border border-burgundy/20 rounded-lg cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-crimson font-bold">#{idx + 1}</span>
                    <h4 className="font-semibold text-warm-ivory text-sm">{role.name}</h4>
                  </div>
                  <p className="text-[11px] font-mono text-warm-ivory/50 mt-0.5">{formatNumber(role.demand)} active listings</p>
                </div>
                <span className={cn('text-xs font-mono font-bold', getTrendColor(role.trend))}>
                  {role.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Velocity Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="heading-sm text-warm-ivory mb-2 font-mono text-sm">HIRING VOLUME & VELOCITY</h3>
          <p className="text-xs text-warm-ivory/50 font-mono mb-6">CROSS-SECTOR TALENT RECRUITMENT PRESSURE OVER 6 MONTHS</p>
          <div className="w-full h-64">
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
                  strokeWidth={2.5}
                  dot={{ fill: '#B3132B', r: 4 }}
                  activeDot={{ r: 6, fill: '#E63946' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Top Skills Grid */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">HIGH-VELOCITY TECH STACKS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockMarketData.topSkills.map((skill, idx) => (
            <div
              key={skill.name}
              onClick={() => onNavigate?.('skill-intelligence')}
              className="p-3.5 bg-burgundy/10 border border-burgundy/20 rounded-lg hover:border-crimson/50 hover:bg-burgundy/15 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-crimson font-bold">#{idx + 1}</span>
                <span className={cn('text-xs font-mono font-bold', getTrendColor(skill.trend))}>
                  {skill.trend}
                </span>
              </div>
              <h4 className="font-semibold text-warm-ivory text-sm mb-2">{skill.name}</h4>
              <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                <div
                  style={{ width: `${skill.demand}%` }}
                  className="h-full bg-gradient-crimson rounded-full"
                />
              </div>
              <p className="text-[11px] text-warm-ivory/50 font-mono mt-2">{skill.demand}% market share</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Gateways */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate?.('candidate-dossier')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-2 group-hover:text-crimson-light">CANDIDATE DOSSIER →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Review personal benchmark scores, skill radar comparisons, and certification records.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('employer-dashboard')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-2 group-hover:text-crimson-light">EMPLOYER MASTERMIND →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Plan workforce capacity, detect organizational capability gaps, and execute talent pipelines.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('simulation')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-2 group-hover:text-crimson-light">SIMULATION VAULT →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Interactive career scenario planning: drag mastery sliders and observe readiness gains.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
