import React, { useState } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../lib/utils'

interface CompensationProps {
  onNavigate?: (page: string) => void
}

export const CompensationIntelligence: React.FC<CompensationProps> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [selectedCity, setSelectedCity] = useState('Bangalore')

  const roles = ['Software Engineer', 'Full Stack Developer', 'Cloud Engineer', 'Data Scientist']
  const cities = [
    { name: 'Bangalore', mult: 1.0, costIndex: 'High' },
    { name: 'Hyderabad', mult: 0.94, costIndex: 'Moderate' },
    { name: 'Mumbai', mult: 1.08, costIndex: 'Very High' },
    { name: 'Pune', mult: 0.90, costIndex: 'Moderate' },
    { name: 'Delhi NCR', mult: 0.96, costIndex: 'High' },
    { name: 'Remote (US/Global)', mult: 2.2, costIndex: 'Variable' },
  ]

  const currentCityObj = cities.find((c) => c.name === selectedCity) || cities[0]

  const baseBands: Record<string, { p25: number; p50: number; p75: number; p90: number }> = {
    'Software Engineer': { p25: 750, p50: 1400, p75: 2200, p90: 3100 },
    'Full Stack Developer': { p25: 850, p50: 1550, p75: 2400, p90: 3300 },
    'Cloud Engineer': { p25: 950, p50: 1750, p75: 2600, p90: 3600 },
    'Data Scientist': { p25: 900, p50: 1650, p75: 2550, p90: 3800 },
  }

  const rawBand = baseBands[selectedRole] || baseBands['Software Engineer']
  const adjusted = {
    p25: Math.round(rawBand.p25 * currentCityObj.mult),
    p50: Math.round(rawBand.p50 * currentCityObj.mult),
    p75: Math.round(rawBand.p75 * currentCityObj.mult),
    p90: Math.round(rawBand.p90 * currentCityObj.mult),
  }

  const chartData = [
    { percentile: '25th (Entry)', salary: adjusted.p25, label: `₹${(adjusted.p25 / 100).toFixed(1)}L` },
    { percentile: '50th (Median)', salary: adjusted.p50, label: `₹${(adjusted.p50 / 100).toFixed(1)}L` },
    { percentile: '75th (Top-Tier)', salary: adjusted.p75, label: `₹${(adjusted.p75 / 100).toFixed(1)}L` },
    { percentile: '90th (Frontier)', salary: adjusted.p90, label: `₹${(adjusted.p90 / 100).toFixed(1)}L` },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">COMPENSATION RADAR</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // COMP-BENCHMARK-44</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">COMPENSATION INTELLIGENCE ENGINE</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              REAL-TIME BASE SALARY PERCENTILES, REGIONAL MULTIPLIERS & TOTAL REWARD ANATOMY
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('job-finder')}
              className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
            >
              BROWSE MATCHED SALARIES <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Filters: Role & Region */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Picker */}
        <div className="card">
          <label className="text-xs font-mono text-warm-ivory/60 mb-2 block uppercase">Select Target Role</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={cn(
                  'px-3 py-2 text-xs font-mono rounded-lg transition-all border text-left truncate',
                  selectedRole === r
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                    : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:bg-burgundy/20'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* City Picker */}
        <div className="card">
          <label className="text-xs font-mono text-warm-ivory/60 mb-2 block uppercase">Select Regional Hub</label>
          <div className="grid grid-cols-3 gap-2">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                className={cn(
                  'px-2.5 py-2 text-xs font-mono rounded-lg transition-all border text-center truncate',
                  selectedCity === city.name
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                    : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:bg-burgundy/20'
                )}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Percentiles 4-Card Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-warm-ivory/60 uppercase">25th Percentile</span>
            <span className="text-xs text-warm-ivory/50 font-mono">Entry / Standard</span>
          </div>
          <p className="heading-md text-warm-ivory font-mono">₹{(adjusted.p25 / 100).toFixed(1)}L</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Starting anchor for early career</p>
        </div>

        <div className="card border-emerald-400/30 bg-emerald-400/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">50th Percentile (Median)</span>
            <span className="text-xs text-emerald-400 font-mono">● Core Rate</span>
          </div>
          <p className="heading-md text-emerald-400 font-mono">₹{(adjusted.p50 / 100).toFixed(1)}L</p>
          <p className="text-[11px] text-warm-ivory/60 font-mono mt-1">Market equilibrium benchmark</p>
        </div>

        <div className="card border-crimson/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-crimson uppercase font-bold">75th Percentile</span>
            <span className="text-xs text-crimson font-mono">Senior Tier</span>
          </div>
          <p className="heading-md text-crimson font-mono">₹{(adjusted.p75 / 100).toFixed(1)}L</p>
          <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Demanded for verified stack depth</p>
        </div>

        <div className="card border-muted-gold/40 bg-muted-gold/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-gold uppercase font-bold">90th Percentile</span>
            <span className="text-xs text-muted-gold font-mono">Frontier Lead</span>
          </div>
          <p className="heading-md text-muted-gold font-mono">₹{(adjusted.p90 / 100).toFixed(1)}L</p>
          <p className="text-[11px] text-warm-ivory/60 font-mono mt-1">Exceptional performers & staff leads</p>
        </div>
      </section>

      {/* Main Grid: Distribution Chart & Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="heading-sm text-warm-ivory font-mono text-sm">TOTAL CASH BRACKET DISTRIBUTION</h3>
              <p className="text-xs text-warm-ivory/50 font-mono">{selectedRole} • {selectedCity} Market</p>
            </div>
            <span className="stamp-verified">VERIFIED DATA</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.1)" />
                <XAxis dataKey="percentile" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <YAxis stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(21,21,24,0.95)',
                    border: '1px solid rgba(179,19,43,0.4)',
                    borderRadius: '8px',
                    color: '#F2E9DC',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: number) => [`₹${(val / 100).toFixed(2)} Lakhs / yr`, 'Total Base']}
                />
                <Bar dataKey="salary" fill="#B3132B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Multipliers Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card bg-charcoal/70">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-crimson" />
              <h3 className="heading-sm text-warm-ivory font-mono text-sm">REGIONAL INDEX BENCHMARKS</h3>
            </div>
            <div className="space-y-2.5">
              {cities.map((c) => (
                <div
                  key={c.name}
                  onClick={() => setSelectedCity(c.name)}
                  className={cn(
                    'p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono cursor-pointer transition-all',
                    selectedCity === c.name
                      ? 'bg-burgundy/30 border-crimson text-warm-ivory font-bold'
                      : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/20'
                  )}
                >
                  <span>{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-warm-ivory/50">{c.mult}x</span>
                    {c.mult >= 1.0 ? (
                      <span className="text-emerald-400">+{Math.round((c.mult - 1) * 100)}%</span>
                    ) : (
                      <span className="text-amber-400">{Math.round((c.mult - 1) * 100)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Rewards Composition */}
          <div className="card bg-gradient-obsidian border-burgundy/30">
            <h4 className="heading-sm text-warm-ivory font-mono text-xs mb-3 uppercase">TOTAL REWARDS ANATOMY</h4>
            <div className="space-y-2 text-xs font-mono text-warm-ivory/80">
              <div className="flex justify-between p-2 bg-burgundy/10 rounded">
                <span>Base Fixed Salary</span>
                <span className="font-bold text-warm-ivory">70 - 75%</span>
              </div>
              <div className="flex justify-between p-2 bg-burgundy/10 rounded">
                <span>Performance Variable</span>
                <span className="font-bold text-emerald-400">10 - 15%</span>
              </div>
              <div className="flex justify-between p-2 bg-burgundy/10 rounded">
                <span>Equity / ESOP Vesting</span>
                <span className="font-bold text-muted-gold">10 - 20%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
