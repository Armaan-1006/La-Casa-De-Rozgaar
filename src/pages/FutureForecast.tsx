import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockForecastData } from '../data/mockData'
import { cn } from '../lib/utils'

interface FutureForecastProps {
  onNavigate?: (page: string) => void
}

export const FutureForecast: React.FC<FutureForecastProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPLOSIVE' | 'STEADY_CLIMB' | 'DECLINING'>('ALL')

  const filtered = activeFilter === 'ALL'
    ? mockForecastData
    : mockForecastData.filter((item) => item.status === activeFilter)

  const projectionData = [
    { year: '2025', cloudAI: 24, k8s: 44, typeScript: 52, rust: 16, legacyCMS: 68 },
    { year: '2026 (Live)', cloudAI: 42, k8s: 58, typeScript: 65, rust: 28, legacyCMS: 52 },
    { year: '2027 (Proj)', cloudAI: 78, k8s: 82, typeScript: 86, rust: 52, legacyCMS: 36 },
    { year: '2028 (Proj)', cloudAI: 94, k8s: 91, typeScript: 92, rust: 74, legacyCMS: 24 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">PREDICTIVE RADAR</span>
              <span className="text-xs font-mono text-warm-ivory/60">HORIZON // 2026 - 2029</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">FUTURE WORKFORCE FORECAST</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              PREDICTIVE AI DEMAND MODELING, TECH OBSOLESCENCE CURVES & 3-YEAR TALENT SHIFTS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('simulation')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            SIMULATE SCENARIO IN VAULT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Projection Trend Chart */}
      <section className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="heading-sm text-warm-ivory font-mono text-sm">3-YEAR TECHNOLOGY ADOPTION TRAJECTORY</h3>
            <p className="text-xs text-warm-ivory/50 font-mono">PROJECTED RELATIVE RECRUITMENT SHARE (INDEX 0 - 100)</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Cloud AI
            </span>
            <span className="flex items-center gap-1.5 text-crimson">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson" /> Kubernetes
            </span>
            <span className="flex items-center gap-1.5 text-muted-gold">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-gold" /> TypeScript
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Legacy CMS
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.12)" />
              <XAxis dataKey="year" stroke="rgba(242,233,220,0.5)" tick={{ fill: 'rgba(242,233,220,0.7)', fontSize: 12 }} />
              <YAxis stroke="rgba(242,233,220,0.5)" tick={{ fill: 'rgba(242,233,220,0.7)', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(21,21,24,0.95)',
                  border: '1px solid rgba(179,19,43,0.4)',
                  borderRadius: '8px',
                  color: '#F2E9DC',
                  fontFamily: 'monospace',
                }}
              />
              <Line type="monotone" dataKey="cloudAI" stroke="#34D399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="k8s" stroke="#B3132B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="typeScript" stroke="#B89B5E" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="legacyCMS" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap gap-2">
        {(['ALL', 'EXPLOSIVE', 'STEADY_CLIMB', 'DECLINING'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all border',
              activeFilter === filter
                ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
            )}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </section>

      {/* Forecast Technology Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isExplosive = item.status === 'EXPLOSIVE'
          const isDeclining = item.status === 'DECLINING'

          return (
            <div
              key={item.technology}
              className={cn(
                'card space-y-3 transition-all',
                isExplosive ? 'border-emerald-400/40 bg-emerald-400/5' : isDeclining ? 'border-red-500/30 bg-red-500/5' : 'border-burgundy/25'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={cn(
                    'text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider',
                    isExplosive ? 'bg-emerald-400/20 text-emerald-400' : isDeclining ? 'bg-red-400/20 text-red-400' : 'bg-muted-gold/20 text-muted-gold'
                  )}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <h4 className="heading-xs text-warm-ivory mt-2">{item.technology}</h4>
                </div>
                <span className={cn('text-sm font-mono font-bold', isDeclining ? 'text-red-400' : 'text-emerald-400')}>
                  {item.growthFactor}
                </span>
              </div>

              {/* Demand Projection Comparison */}
              <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/20 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-warm-ivory/60">
                  <span>Current Live Demand</span>
                  <span className="font-bold text-warm-ivory">{item.currentDemand}%</span>
                </div>
                <div className="flex justify-between text-warm-ivory/60">
                  <span>2027 Projected</span>
                  <span className="font-bold text-emerald-400">{item.projectedDemand2027}%</span>
                </div>
                <div className="flex justify-between text-warm-ivory/60">
                  <span>2028 Projected</span>
                  <span className="font-bold text-emerald-400">{item.projectedDemand2028}%</span>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <p className="text-warm-ivory/60">Obsolescence Risk: <span className="text-warm-ivory">{item.riskFactor}</span></p>
                <p className="text-warm-ivory/80 leading-relaxed text-[11px] mt-1 pt-1 border-t border-burgundy/20">
                  💡 {item.recommendation}
                </p>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
