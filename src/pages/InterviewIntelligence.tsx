import React, { useState } from 'react'
import { ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Search, Building2, Flame, ArrowRight } from 'lucide-react'
import { mockInterviewQuestions } from '../data/mockData'
import { cn } from '../lib/utils'

interface InterviewIntelligenceProps {
  onNavigate?: (page: string) => void
}

export const InterviewIntelligence: React.FC<InterviewIntelligenceProps> = ({ onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>('IQ-001')
  const [searchQuery, setSearchQuery] = useState('')

  const topics = ['ALL', 'System Design', 'Live Coding', 'Behavioral & Leadership', 'Architecture']

  const filtered = mockInterviewQuestions.filter((q) => {
    if (selectedTopic !== 'ALL' && q.topic !== selectedTopic) return false
    if (searchQuery.trim()) {
      const match =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.role.toLowerCase().includes(searchQuery.toLowerCase())
      if (!match) return false
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">TACTICAL INTELLIGENCE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // INTERVIEW-INTEL-ARCHIVE</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">INTERVIEW INTELLIGENCE SYSTEM</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              CURATED TECHNICAL INTERVIEW QUESTIONS, REPORTED TOPICS & SYSTEM DESIGN ARCHITECTURE BLUEPRINTS
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('assessment')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            TEST READINESS IN ASSESSMENT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Distinction Disclaimer Banner */}
      <section className="p-4 bg-charcoal border border-burgundy/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-warm-ivory/80">
          <ShieldAlert size={16} className="text-amber-400 shrink-0" />
          <span>
            DISCLOSURE: Questions are bifurcated between <strong className="text-emerald-400">OFFICIAL VERIFIED</strong> (recruiter & benchmark verified) and <strong className="text-muted-gold">COMMUNITY REPORTED</strong> (anonymized candidate debriefs).
          </span>
        </div>
        <span className="stamp-classified shrink-0">AUTHENTICATED SIGNALS</span>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search questions by company, topic, architectural keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border',
                selectedTopic === t
                  ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                  : 'bg-burgundy/10 border-burgundy/25 text-warm-ivory/70 hover:bg-burgundy/20'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Question Accordion Cards */}
      <section className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id
          const isOfficial = item.verifiedStatus === 'OFFICIAL VERIFIED'

          return (
            <div
              key={item.id}
              className="card border-burgundy/25 hover:border-crimson/40 transition-all space-y-4"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      'text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider',
                      isOfficial ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-muted-gold/20 text-muted-gold border border-muted-gold/30'
                    )}>
                      {item.verifiedStatus}
                    </span>
                    <span className="text-xs font-mono text-crimson font-bold flex items-center gap-1">
                      <Building2 size={12} /> {item.company}
                    </span>
                    <span className="text-xs font-mono text-warm-ivory/50">• {item.role}</span>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-warm-ivory font-mono mt-1">
                    {item.question}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded',
                      item.difficulty === 'HARD' ? 'bg-crimson/20 text-crimson' : 'bg-amber-400/20 text-amber-400'
                    )}>
                      {item.difficulty}
                    </span>
                    <p className="text-[10px] font-mono text-warm-ivory/40 mt-1 flex items-center gap-1 justify-end">
                      <Flame size={10} className="text-crimson" /> {item.frequency}
                    </p>
                  </div>
                  <button className="text-warm-ivory/50 p-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Briefing Drawer */}
              {isExpanded && (
                <div className="pt-4 border-t border-burgundy/20 space-y-4 text-xs font-mono">
                  {/* Tips */}
                  <div className="p-3 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-1">
                    <span className="text-amber-400 font-bold uppercase">STRATEGIC INTERVIEW TIP:</span>
                    <p className="text-warm-ivory/80 leading-relaxed">{item.tips}</p>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-2">
                    <span className="text-warm-ivory/60 uppercase font-bold text-[10px]">
                      CORE ARCHITECTURAL TOUCHPOINTS EVALUATED:
                    </span>
                    <div className="space-y-1.5">
                      {item.expectedKeyPoints.map((point) => (
                        <div key={point} className="flex items-start gap-2 text-warm-ivory/80">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-warm-ivory/50">
                    <span>Topic: {item.topic}</span>
                    <span>Reported Intake: {item.reportedDate}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
