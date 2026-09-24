import React, { useState } from 'react'
import { ArrowRight, Zap, TrendingUp, DollarSign, Building2, Bell } from 'lucide-react'
import { mockIntelligenceFeed } from '../data/mockData'
import { cn } from '../lib/utils'

interface IntelligenceFeedProps {
  onNavigate?: (page: string) => void
}

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = ['ALL', 'EMERGING SKILL', 'MARKET SURGE', 'COMPENSATION SHIFT', 'HIRING ALERT']

  const filtered = selectedCategory === 'ALL'
    ? mockIntelligenceFeed
    : mockIntelligenceFeed.filter((b) => b.category === selectedCategory)

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'EMERGING SKILL':
        return <Zap size={14} className="text-emerald-400" />
      case 'MARKET SURGE':
        return <TrendingUp size={14} className="text-crimson" />
      case 'COMPENSATION SHIFT':
        return <DollarSign size={14} className="text-muted-gold" />
      case 'HIRING ALERT':
        return <Building2 size={14} className="text-blue-400" />
      default:
        return <Bell size={14} />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="stamp-live">TRANSMISSION WIRE ACTIVE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // LIVE-WIRE-BRIEFINGS</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">INTELLIGENCE FEED // WHAT'S NEW</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              CONTINUOUS MACRO BRIEFINGS ON EMERGING TALENT SHIFTS, ROLES & COMPENSATION SPIKES
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('market-intelligence')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            VIEW MARKET RADAR <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Category Pills */}
      <section className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all border flex items-center gap-1.5',
              selectedCategory === cat
                ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
            )}
          >
            {cat !== 'ALL' && getCategoryIcon(cat)}
            <span>{cat === 'ALL' ? 'ALL WIRE SIGNALS' : cat}</span>
          </button>
        ))}
      </section>

      {/* Briefs Timeline */}
      <section className="space-y-4">
        {filtered.map((brief) => (
          <div
            key={brief.id}
            className="card border-burgundy/25 hover:border-crimson/40 transition-all p-5 md:p-6 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-burgundy/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="stamp-classified">{brief.briefNumber}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-burgundy/20 text-warm-ivory/80 flex items-center gap-1">
                  {getCategoryIcon(brief.category)}
                  {brief.category}
                </span>
              </div>
              <span className="text-[11px] font-mono text-warm-ivory/50">{brief.timestamp}</span>
            </div>

            <div className="space-y-2">
              <h3 className="heading-xs text-warm-ivory leading-snug">{brief.title}</h3>
              <p className="text-xs md:text-sm font-mono text-warm-ivory/80 leading-relaxed">
                {brief.content}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-burgundy/20 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-warm-ivory/50">MOMENTUM SIGNAL:</span>
                <span className="font-bold text-emerald-400">{brief.momentum}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-warm-ivory/50 mr-1">IMPACTED ROLES:</span>
                {brief.impactedRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => onNavigate?.('market-intelligence')}
                    className="px-2 py-0.5 bg-burgundy/20 hover:bg-burgundy/40 rounded border border-burgundy/30 text-[10px] text-warm-ivory/80 transition-colors"
                  >
                    {role} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
