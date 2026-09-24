import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, TrendingUp, ArrowRight, Zap, Target } from 'lucide-react'
import { mockMarketData } from '../data/mockData'
import { getTrendColor, getTrendIcon } from '../lib/utils'
import { cn } from '../lib/utils'

export const SkillIntelligence: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<any>(mockMarketData.topSkills[0])

  const filteredSkills = mockMarketData.topSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const skillDetail = {
    name: selectedSkill.name,
    demand: selectedSkill.demand,
    trend: selectedSkill.trend,
    roles: ['Full Stack Developer', 'Frontend Engineer', 'Cloud Engineer'],
    pairedSkills: ['TypeScript', 'Docker', 'PostgreSQL', 'GraphQL'],
    marketShare: selectedSkill.demand,
    yoyGrowth: '+28.4%',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-lg text-warm-ivory mb-1">SKILL INTELLIGENCE & VELOCITY</h1>
            <p className="text-warm-ivory/60 font-mono text-xs">
              OPERATION // TECH STACK ADOPTION CURVES, MOMENTUM & ECOSYSTEM PAIRINGS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="btn-primary flex items-center gap-2 text-xs font-mono py-2 px-3.5"
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
            placeholder="Search tracked skills, frameworks, cloud technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-burgundy/10 border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>
      </section>

      {/* Main Grid: Skills Selector & Live Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills List */}
        <div className="lg:col-span-1 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          <p className="text-xs font-mono text-warm-ivory/60 mb-2">TRACKED TECHNOLOGIES ({filteredSkills.length})</p>
          {filteredSkills.map((skill, idx) => {
            const isSelected = selectedSkill.name === skill.name

            return (
              <div
                key={skill.name}
                onClick={() => setSelectedSkill(skill)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer border flex items-center justify-between',
                  isSelected
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson'
                    : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:border-crimson/50 hover:bg-burgundy/15'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono opacity-60">#{idx + 1}</span>
                    <p className="text-sm font-semibold">{skill.name}</p>
                  </div>
                  <p className="text-[11px] font-mono opacity-70 mt-0.5">{skill.demand}% Adoption Index</p>
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

        {/* Selected Skill In-Depth Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-crimson uppercase tracking-widest">SKILL DOSSIER</span>
                <h2 className="heading-md text-warm-ivory mt-0.5 mb-2">{skillDetail.name}</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">MARKET DEMAND</p>
                    <p className="text-2xl font-bold text-crimson font-mono">{skillDetail.marketShare}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">YOY GROWTH</p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">{skillDetail.yoyGrowth}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-ivory/60 font-mono">HIRING URGENCY</p>
                    <p className="text-sm font-bold text-amber-400 font-mono mt-1">HIGH PRIORITY</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={cn('text-sm font-mono font-bold px-2.5 py-1 rounded bg-burgundy/20 border border-burgundy/30', getTrendColor(skillDetail.trend))}>
                  {getTrendIcon(skillDetail.trend)} {skillDetail.trend}
                </span>
              </div>
            </div>

            <div className="divider-h my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                <p className="text-xs text-warm-ivory/60 font-mono mb-2 uppercase">PRIMARY ROLES DEMANDING THIS</p>
                <div className="space-y-1.5">
                  {skillDetail.roles.map((role) => (
                    <div key={role} className="text-xs text-warm-ivory/90 font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-crimson rounded-full" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                <p className="text-xs text-warm-ivory/60 font-mono mb-2 uppercase">FREQUENTLY PAIRED TECH</p>
                <div className="flex flex-wrap gap-1.5">
                  {skillDetail.pairedSkills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-burgundy/20 text-xs font-mono text-warm-ivory/80 rounded border border-burgundy/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Demand Trend Chart */}
          <div className="card">
            <h3 className="heading-sm text-warm-ivory mb-2 font-mono text-sm">6-MONTH VELOCITY CURVE</h3>
            <div className="w-full h-48">
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
                  <Line type="monotone" dataKey="value" stroke="#B3132B" strokeWidth={2.5} dot={{ fill: '#B3132B', r: 3 }} />
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
          <h3 className="heading-sm text-emerald-400 font-mono text-sm">EMERGING BREAKTHROUGH SKILLS // 6-MONTH HORIZON</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockMarketData.emergingSkills.map((skill) => (
            <div
              key={skill.name}
              onClick={() => onNavigate?.('simulation')}
              className="p-4 bg-burgundy/10 border border-emerald-400/20 rounded-lg hover:border-emerald-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-warm-ivory text-sm group-hover:text-emerald-400 transition-colors">{skill.name}</p>
                <span className="text-emerald-400 font-mono text-xs font-bold">{skill.trend}</span>
              </div>
              <p className="text-[11px] text-warm-ivory/50 font-mono">{skill.category}</p>
              <p className="text-[10px] text-crimson font-mono mt-2 group-hover:underline">Simulate Impact →</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
