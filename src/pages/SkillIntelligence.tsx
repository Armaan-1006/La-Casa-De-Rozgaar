import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { mockMarketData, TrackedSkill } from '../data/mockData'
import { getTrendColor, getTrendIcon } from '../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface SkillIntelligenceProps {
  onNavigate?: (page: string) => void
}

export const SkillIntelligence: React.FC<SkillIntelligenceProps> = ({ onNavigate }) => {
  const { isProfessional } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillName, setSelectedSkillName] = useState(mockMarketData.topSkills[0].name)

  const filteredSkills = mockMarketData.topSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedSkill: TrackedSkill =
    mockMarketData.topSkills.find((s) => s.name === selectedSkillName) || mockMarketData.topSkills[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">SKILL RADAR</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // SKILL-VELOCITY-TELEMETRY</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">SKILL INTELLIGENCE & VELOCITY</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              TECH STACK ADOPTION CURVES, ECOSYSTEM PAIRINGS & EMERGING MOMENTUM SIGNALS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="btn-primary flex items-center gap-2 text-xs font-mono py-2.5 px-4"
          >
            START SKILL HEIST <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Search Filter */}
      <section>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search tracked skills, frameworks, cloud technologies, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>
      </section>

      {/* Main Grid: Skills Selector & Live Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skills List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          <p className="text-xs font-mono text-warm-ivory/60 mb-2">TRACKED TECHNOLOGIES ({filteredSkills.length})</p>
          {filteredSkills.map((skill, idx) => {
            const isSelected = selectedSkill.name === skill.name

            return (
              <div
                key={skill.name}
                onClick={() => setSelectedSkillName(skill.name)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer border flex items-center justify-between',
                  isSelected
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                    : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:border-crimson/50 hover:bg-burgundy/15'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono opacity-60">#{idx + 1}</span>
                    <p className="text-sm font-semibold">{skill.name}</p>
                  </div>
                  <p className="text-[11px] font-mono opacity-70 mt-0.5">{skill.category} • {skill.demand}% Index</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-xs font-mono font-bold', getTrendColor(skill.trend))}>
                    {getTrendIcon(skill.trend)} {skill.trend}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Selected Skill Dynamic Dossier */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detail Header */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <span className="stamp-classified">SKILL DOSSIER</span>
                <h2 className="heading-md text-warm-ivory mt-1 mb-1">{selectedSkill.name}</h2>
                <p className="text-xs font-mono text-warm-ivory/60">Category: {selectedSkill.category}</p>
                <div className="flex flex-wrap items-center gap-6 mt-4">
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">ADOPTION INDEX</p>
                    <p className="text-2xl font-bold text-crimson font-mono">{selectedSkill.demand}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">MOMENTUM RATE</p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">{selectedSkill.trend}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">URGENCY TIER</p>
                    <p className={cn(
                      'text-xs font-bold font-mono px-2 py-0.5 rounded mt-1.5 uppercase',
                      selectedSkill.urgency === 'CRITICAL' ? 'bg-crimson/20 text-crimson' : 'bg-amber-400/20 text-amber-400'
                    )}>
                      {selectedSkill.urgency}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={cn('text-sm font-mono font-bold px-2.5 py-1 rounded bg-burgundy/20 border border-burgundy/30', getTrendColor(selectedSkill.trend))}>
                  {getTrendIcon(selectedSkill.trend)} {selectedSkill.trend}
                </span>
              </div>
            </div>

            <div className="divider-h my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Roles */}
              <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                <p className="text-xs text-warm-ivory/60 font-mono uppercase">PRIMARY ROLES DEMANDING THIS</p>
                <div className="space-y-1.5">
                  {selectedSkill.roles.map((role) => (
                    <div key={role} className="text-xs text-warm-ivory/90 font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-crimson rounded-full" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequently Paired Tech */}
              <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-2">
                <p className="text-xs text-warm-ivory/60 font-mono uppercase">FREQUENTLY PAIRED TECH</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkill.pairedSkills.map((pair) => (
                    <span
                      key={pair}
                      className="px-2 py-1 bg-burgundy/20 text-xs font-mono text-warm-ivory/80 rounded border border-burgundy/30 flex items-center gap-1"
                    >
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Velocity Curve Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">
                6-MONTH ADOPTION VELOCITY // {selectedSkill.name.toUpperCase()}
              </h3>
              <span className="stamp-verified">VERIFIED DATA</span>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedSkill.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isProfessional ? '#E2E8F0' : 'rgba(179,19,43,0.12)'} />
                  <XAxis dataKey="month" stroke={isProfessional ? '#64748B' : 'rgba(242,233,220,0.4)'} tick={{ fill: isProfessional ? '#475569' : 'rgba(242,233,220,0.6)', fontSize: 11 }} />
                  <YAxis stroke={isProfessional ? '#64748B' : 'rgba(242,233,220,0.4)'} tick={{ fill: isProfessional ? '#475569' : 'rgba(242,233,220,0.6)', fontSize: 11 }} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{
                      background: isProfessional ? '#FFFFFF' : 'rgba(21,21,24,0.95)',
                      border: isProfessional ? '1px solid #E2E8F0' : '1px solid rgba(179,19,43,0.4)',
                      borderRadius: '8px',
                      color: isProfessional ? '#0F172A' : '#F2E9DC',
                      fontFamily: 'monospace',
                      boxShadow: isProfessional ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isProfessional ? '#2563EB' : '#B3132B'}
                    strokeWidth={2.5}
                    dot={{ fill: isProfessional ? '#2563EB' : '#B3132B', r: 3 }}
                    activeDot={{ r: 6, fill: isProfessional ? '#1D4ED8' : '#E63946' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Emerging Next-Gen Skills */}
      <section className="card bg-gradient-obsidian border-emerald-400/30">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-emerald-400" />
          <h3 className="heading-sm text-emerald-400 font-mono text-sm">
            EMERGING BREAKTHROUGH SKILLS // 6-MONTH HORIZON
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMarketData.emergingSkills.map((skill) => (
            <div
              key={skill.name}
              onClick={() => onNavigate?.('simulation')}
              className="p-4 bg-burgundy/10 border border-emerald-400/20 rounded-lg hover:border-emerald-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-warm-ivory text-sm group-hover:text-emerald-400 transition-colors">
                  {skill.name}
                </p>
                <span className="text-emerald-400 font-mono text-xs font-bold">{skill.trend}</span>
              </div>
              <p className="text-[11px] text-warm-ivory/50 font-mono">{skill.category} • Horizon: {skill.horizon}</p>
              <p className="text-[10px] text-warm-ivory/70 font-mono mt-1">{skill.impact}</p>
              <p className="text-[10px] text-crimson font-mono mt-2 group-hover:underline">Simulate Impact in Vault →</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
