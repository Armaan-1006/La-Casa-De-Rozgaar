import React from 'react'
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit, Download, Share2, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { cn } from '../lib/utils'

export const CandidateDossier: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const radarData = mockCandidate.skills.map((skill) => ({
    skill: skill.name,
    current: skill.score,
    market: skill.market,
  }))

  const gapData = mockCandidate.skills.map((skill) => ({
    skill: skill.name.substring(0, 10),
    gap: Math.max(0, skill.market - skill.score),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory font-bold shadow-glow-crimson font-mono text-lg">
                AR
              </div>
              <div>
                <h1 className="heading-lg text-warm-ivory">{mockCandidate.name}</h1>
                <p className="text-xs text-warm-ivory/60 font-mono">CASE ID // {mockCandidate.id} • STATUS // RECRUIT READY</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="status-online text-xs font-mono">PROFILE VERIFIED & CERTIFIED</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary flex items-center gap-2 text-xs font-mono py-2 px-3">
              <Edit size={14} /> EDIT
            </button>
            <button className="btn-secondary flex items-center gap-2 text-xs font-mono py-2 px-3">
              <Download size={14} /> EXPORT
            </button>
            <button className="btn-secondary flex items-center gap-2 text-xs font-mono py-2 px-3">
              <Share2 size={14} /> SHARE
            </button>
          </div>
        </div>
      </section>

      {/* Profile Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">TARGET ROLE</p>
          <p className="heading-sm text-warm-ivory">{mockCandidate.targetRole}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Tier 1 Target</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">EXPERIENCE</p>
          <p className="heading-sm text-warm-ivory">{mockCandidate.experience}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Full-stack production</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">LOCATION</p>
          <p className="heading-sm text-warm-ivory">{mockCandidate.location}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Open to Remote / Hybrid</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">ROLE READINESS</p>
          <p className="heading-sm text-crimson font-mono">{mockCandidate.roleReadiness}%</p>
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              style={{ width: `${mockCandidate.roleReadiness}%` }}
              className="h-full bg-gradient-crimson rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Profile */}
        <div className="lg:col-span-2 card">
          <h3 className="heading-sm text-warm-ivory mb-6 font-mono text-sm">SKILL PROFILE & BENCHMARK</h3>
          <div className="space-y-4">
            {mockCandidate.skills.map((skill) => {
              const gap = skill.gap
              const isStrength = gap >= 0
              return (
                <div key={skill.name} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-warm-ivory text-sm">{skill.name}</p>
                    <div className="text-right">
                      <p className="text-xs font-mono text-warm-ivory">
                        <span className="text-crimson font-bold">{skill.score}</span>
                        <span className="text-warm-ivory/40"> / 10</span>
                        <span className="text-warm-ivory/40 ml-2">Market: {skill.market}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-burgundy/20 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${(skill.score / 10) * 100}%` }}
                        className="h-full bg-gradient-crimson rounded-full"
                      />
                    </div>
                    {isStrength ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono shrink-0">
                        <CheckCircle size={14} /> Ready
                      </span>
                    ) : (
                      <span className="text-xs text-orange-400 font-mono shrink-0">
                        Gap: {Math.abs(gap).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assessment Info */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">BENCHMARK ASSESSMENT</h3>
            <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-crimson flex items-center justify-center shadow-glow-crimson shrink-0">
                  <span className="text-2xl font-bold text-warm-ivory font-mono">{mockCandidate.assessment.score}</span>
                </div>
                <div>
                  <p className="text-[11px] text-warm-ivory/60 font-mono">ASSESSMENT TIER</p>
                  <p className="heading-sm text-warm-ivory">{mockCandidate.assessment.category}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono border-t border-burgundy/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-warm-ivory/60">Verified Date</span>
                  <span className="text-warm-ivory">{mockCandidate.assessment.completedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-ivory/60">Integrity Check</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    {mockCandidate.assessment.integrity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="w-full btn-primary text-xs font-mono py-3 flex items-center justify-center gap-2"
          >
            START HEIST REASSESSMENT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Radar Chart */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">CAPABILITY PROFILE RADAR</h3>
        <p className="text-xs text-warm-ivory/50 font-mono mb-6">COMPARE CURRENT SKILLS VS TOP-TIER MARKET BENCHMARK</p>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(179,19,43,0.15)" />
              <PolarAngleAxis dataKey="skill" stroke="rgba(242,233,220,0.6)" tick={{ fill: 'rgba(242,233,220,0.7)', fontSize: 11 }} />
              <PolarRadiusAxis stroke="rgba(179,19,43,0.3)" domain={[0, 10]} />
              <Radar name="Your Score" dataKey="current" stroke="#B3132B" fill="#B3132B" fillOpacity={0.6} />
              <Radar name="Market Requirement" dataKey="market" stroke="#F2E9DC" fill="none" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(21,21,24,0.95)',
                  border: '1px solid rgba(179,19,43,0.4)',
                  borderRadius: '8px',
                  color: '#F2E9DC',
                  fontFamily: 'monospace',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Skill Gaps */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-4 font-mono text-sm">SKILL GAPS (POINTS BELOW MARKET)</h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,19,43,0.1)" />
              <XAxis dataKey="skill" stroke="rgba(242,233,220,0.4)" tick={{ fill: 'rgba(242,233,220,0.6)', fontSize: 11 }} />
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
              <Bar dataKey="gap" fill="#B3132B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* CTA Navigation */}
      <section className="card bg-gradient-obsidian border-crimson/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate?.('skill-heist')}
            className="text-left group card-hover p-4 border border-burgundy/30 rounded-lg hover:border-crimson/60"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">SKILL HEIST ROADMAP →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">Target your highest-priority skill gaps and start targeted learning.</p>
          </button>
          <button
            onClick={() => onNavigate?.('job-finder')}
            className="text-left group card-hover p-4 border border-burgundy/30 rounded-lg hover:border-crimson/60"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">AI JOB MATCHING →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">Find active job postings matched directly against your capability profile.</p>
          </button>
          <button
            onClick={() => onNavigate?.('simulation')}
            className="text-left group card-hover p-4 border border-burgundy/30 rounded-lg hover:border-crimson/60"
          >
            <h4 className="heading-xs text-crimson mb-1 group-hover:text-crimson-light">SIMULATION VAULT →</h4>
            <p className="text-warm-ivory/70 text-xs font-mono">Model skill gains and forecast your new career readiness scores.</p>
          </button>
        </div>
      </section>
    </div>
  )
}
