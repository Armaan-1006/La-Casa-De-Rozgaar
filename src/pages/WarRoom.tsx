import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap, Target, ArrowRight, Eye, User, Brain } from 'lucide-react'
import { mockMarketData } from '../data/mockData'
import { formatNumber, getTrendColor } from '../lib/utils'
import { cn } from '../lib/utils'

interface WarRoomProps {
  onNavigate?: (page: string) => void
}

export const WarRoom: React.FC<WarRoomProps> = ({ onNavigate }) => {
  const [perspective, setPerspective] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE')
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0)

  const activeRole = mockMarketData.topRoles[selectedRoleIdx] || mockMarketData.topRoles[0]

  return (
    <div className="space-y-8">
      {/* Perspective Toggle & Demo Data Notice */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-burgundy/15 rounded-lg border border-burgundy/30">
        <div className="flex items-center gap-2">
          <span className="stamp-classified">SIMULATED INTELLIGENCE</span>
          <span className="text-[11px] font-mono text-warm-ivory/60">
            DEMO STREAM // CONTINUOUS INGESTION FROM GLOBAL PORTALS
          </span>
        </div>

        {/* Perspective Switch */}
        <div className="flex items-center gap-2 bg-charcoal p-1 rounded-lg border border-burgundy/25 self-start sm:self-auto">
          <button
            onClick={() => setPerspective('CANDIDATE')}
            className={cn(
              'px-3 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all',
              perspective === 'CANDIDATE'
                ? 'bg-gradient-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'text-warm-ivory/60 hover:text-warm-ivory'
            )}
          >
            <User size={12} />
            <span>CANDIDATE VIEW</span>
          </button>
          <button
            onClick={() => setPerspective('EMPLOYER')}
            className={cn(
              'px-3 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all',
              perspective === 'EMPLOYER'
                ? 'bg-gradient-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'text-warm-ivory/60 hover:text-warm-ivory'
            )}
          >
            <Brain size={12} />
            <span>EMPLOYER VIEW</span>
          </button>
        </div>
      </section>

      {/* Hero Command Section */}
      <section className="relative overflow-hidden rounded-xl border border-crimson/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="stamp-live">COMMAND HQ ONLINE</span>
            <span className="text-xs font-mono text-warm-ivory/60">OPERATION // STRATEGIC-OVERVIEW</span>
          </div>

          <div>
            <h1 className="heading-xl text-warm-ivory">LA CASA DE ROZGAAR</h1>
            <h2 className="heading-sm text-crimson mt-0.5">
              {perspective === 'CANDIDATE'
                ? 'INTELLIGENT TALENT COMMAND // CANDIDATE RADAR'
                : 'ENTERPRISE WORKFORCE INTELLIGENCE // MASTERMIND'}
            </h2>
          </div>

          <p className="text-warm-ivory/80 text-xs md:text-sm font-mono leading-relaxed">
            {perspective === 'CANDIDATE'
              ? 'Understand real market demand. Benchmark personal skill scores against verified baselines. Eliminate competency deficits through targeted resistance sprints.'
              : 'Analyze organizational workforce capability, forecast macro talent shortages, detect capability deficits, and orchestrate precision talent acquisition.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {perspective === 'CANDIDATE' ? (
              <>
                <button
                  onClick={() => onNavigate?.('assessment')}
                  className="btn-primary flex items-center gap-2 text-xs font-mono py-2.5 px-4"
                >
                  START SECURE ASSESSMENT <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => onNavigate?.('skill-heist')}
                  className="btn-secondary text-xs font-mono py-2.5 px-4"
                >
                  VIEW SKILL HEIST GAPS
                </button>
                <button
                  onClick={() => onNavigate?.('simulation')}
                  className="btn-secondary text-xs font-mono py-2.5 px-4"
                >
                  CAREER SIMULATION
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate?.('talent-vault')}
                  className="btn-primary flex items-center gap-2 text-xs font-mono py-2.5 px-4"
                >
                  DISCOVER VERIFIED TALENT <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => onNavigate?.('workforce-gaps')}
                  className="btn-secondary text-xs font-mono py-2.5 px-4"
                >
                  DIAGNOSE WORKFORCE GAPS
                </button>
                <button
                  onClick={() => onNavigate?.('forecast')}
                  className="btn-secondary text-xs font-mono py-2.5 px-4"
                >
                  VIEW 3-YR FORECAST
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Key Market Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">JOBS INGESTED & ANALYZED</span>
            <Zap size={16} className="text-crimson" />
          </div>
          <p className="heading-md text-warm-ivory font-mono">{formatNumber(mockMarketData.totalJobsAnalyzed)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+24.3% YoY Ingestion Volume</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">COMPETENCY STACKS TRACKED</span>
            <Target size={16} className="text-crimson" />
          </div>
          <p className="heading-md text-warm-ivory font-mono">{formatNumber(mockMarketData.totalSkillsTracked)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+12.1% Active Tech Vectors</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">STANDARDIZED ROLES</span>
            <Eye size={16} className="text-crimson" />
          </div>
          <p className="heading-md text-warm-ivory font-mono">{formatNumber(mockMarketData.totalRolesTracked)}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+8.7% Taxonomy Coverage</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-warm-ivory/60 font-mono">INTELLIGENCE ACCURACY</span>
            <span className="stamp-verified">VERIFIED</span>
          </div>
          <p className="heading-md text-emerald-400 font-mono">99.4%</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Cross-Referenced Ground Truth</p>
        </div>
      </section>

      {/* Main Grid: Interactive Role Selector & Hiring Velocity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Roles Ranking */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
              HIGH-DEMAND ROLES PULSE
            </h3>
            <span className="text-[10px] font-mono text-warm-ivory/50">CLICK TO INSPECT</span>
          </div>

          <div className="space-y-2">
            {mockMarketData.topRoles.map((role, idx) => {
              const isSelected = selectedRoleIdx === idx
              return (
                <div
                  key={role.name}
                  onClick={() => setSelectedRoleIdx(idx)}
                  className={cn(
                    'p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between',
                    isSelected
                      ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                      : 'card-hover border-burgundy/25 text-warm-ivory/80'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono opacity-70">#{idx + 1}</span>
                      <h4 className="text-sm font-semibold">{role.name}</h4>
                    </div>
                    <p className="text-[11px] font-mono opacity-70 mt-0.5">
                      {formatNumber(role.demand)} active vacancies • {role.salary}
                    </p>
                  </div>
                  <span className={cn('text-xs font-mono font-bold', getTrendColor(role.trend))}>
                    {role.trend}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Role Chart & High-Velocity Stacks */}
        <div className="lg:col-span-7 card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-burgundy/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-crimson uppercase tracking-wider font-bold">
                TRAJECTORY ANALYSIS // {activeRole.name}
              </span>
              <h3 className="heading-sm text-warm-ivory font-mono text-sm mt-0.5">
                6-MONTH RECRUITMENT VOLUME INDEX
              </h3>
            </div>
            <button
              onClick={() => onNavigate?.('role-intelligence')}
              className="text-xs font-mono text-crimson hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Open Role Dossier <ArrowRight size={12} />
            </button>
          </div>

          {/* Chart */}
          <div className="w-full h-56">
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
                  strokeWidth={2.5}
                  dot={{ fill: '#B3132B', r: 4 }}
                  activeDot={{ r: 6, fill: '#E63946' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Tech Stacks for this role */}
          <div className="pt-2 border-t border-burgundy/20">
            <span className="text-[10px] font-mono text-warm-ivory/60 uppercase block mb-2 font-bold">
              CRITICAL DEMAND STACKS FOR {activeRole.name.toUpperCase()}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeRole.keySkills.map((s) => (
                <div key={s.name} className="p-2 bg-burgundy/10 rounded border border-burgundy/20 text-xs font-mono">
                  <div className="flex justify-between items-center text-warm-ivory">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-emerald-400 font-bold">{s.trend}</span>
                  </div>
                  <div className="w-full bg-burgundy/30 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div style={{ width: `${s.demand}%` }} className="h-full bg-crimson rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* High-Velocity Tech Stacks Grid */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase tracking-wider">
            HIGH-MOMENTUM TECH STACKS // MARKET SHARE
          </h3>
          <button
            onClick={() => onNavigate?.('skill-intelligence')}
            className="text-xs font-mono text-crimson hover:underline flex items-center gap-1"
          >
            Explore All Tracked Tech <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {mockMarketData.topSkills.map((skill, idx) => (
            <div
              key={skill.name}
              onClick={() => onNavigate?.('skill-intelligence')}
              className="p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg hover:border-crimson/50 hover:bg-burgundy/15 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-crimson font-bold">#{idx + 1}</span>
                <span className={cn('text-xs font-mono font-bold', getTrendColor(skill.trend))}>
                  {skill.trend}
                </span>
              </div>
              <h4 className="font-semibold text-warm-ivory text-sm mb-1.5">{skill.name}</h4>
              <div className="w-full bg-burgundy/30 rounded-full h-1.5 overflow-hidden">
                <div style={{ width: `${skill.demand}%` }} className="h-full bg-gradient-crimson rounded-full" />
              </div>
              <p className="text-[10px] text-warm-ivory/50 font-mono mt-1.5">{skill.demand}% Adoption Index</p>
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
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">CANDIDATE DOSSIER →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Review personal benchmark scores, skill radar comparisons, and verified certifications.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('employer-dashboard')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">EMPLOYER MASTERMIND →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Plan workforce capacity, detect organizational capability gaps, and execute talent pipelines.
            </p>
          </div>
          <div
            onClick={() => onNavigate?.('simulation')}
            className="p-4 border border-burgundy/30 rounded-lg card-hover cursor-pointer group"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">SIMULATION VAULT →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">
              Interactive career scenario planning: drag mastery sliders and observe readiness gains.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
