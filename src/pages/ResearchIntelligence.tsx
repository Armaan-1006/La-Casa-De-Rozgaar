import React, { useState } from 'react'
import { ExternalLink, Search, ArrowRight } from 'lucide-react'
import { mockResearchPapers } from '../data/mockData'

interface ResearchIntelligenceProps {
  onNavigate?: (page: string) => void
}

export const ResearchIntelligence: React.FC<ResearchIntelligenceProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = mockResearchPapers.filter((p) => {
    if (!searchQuery.trim()) return true
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">FRONTIER INTELLIGENCE</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // RESEARCH-INTEL-FOUNDATIONS</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">RESEARCH INTELLIGENCE REPOSITORY</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              CURATED FOUNDATIONAL PAPERS, EMERGING AI ARCHITECTURES & DISTRIBUTED SYSTEMS COMPENDIUM
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('roadmap')}
            className="btn-primary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
          >
            VIEW LEARNING SPRINT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <section>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-ivory/40" size={18} />
          <input
            type="text"
            placeholder="Search research papers by title, author, architecture, or ArXiv ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-charcoal border border-burgundy/30 rounded-lg text-warm-ivory placeholder-warm-ivory/40 font-mono text-xs outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/50 transition-all"
          />
        </div>
      </section>

      {/* Papers Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((paper) => (
          <div
            key={paper.id}
            className="card border-burgundy/25 hover:border-crimson/40 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="stamp-classified text-[9px]">{paper.arxivId}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">
                  {paper.impactScore}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-crimson uppercase tracking-wider">{paper.topic}</span>
                <h3 className="heading-xs text-warm-ivory mt-0.5 leading-snug">{paper.title}</h3>
                <p className="text-xs font-mono text-warm-ivory/50 mt-1">{paper.authors} • {paper.date}</p>
              </div>

              <p className="text-xs font-mono text-warm-ivory/80 leading-relaxed p-3 bg-burgundy/10 rounded-lg border border-burgundy/20">
                {paper.summary}
              </p>

              {/* Key Takeaways */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-warm-ivory/60 uppercase font-bold">KEY ARCHITECTURAL TAKEAWAYS:</span>
                <div className="space-y-1">
                  {paper.takeaways.map((point) => (
                    <div key={point} className="flex items-start gap-2 text-xs font-mono text-warm-ivory/70">
                      <span className="text-crimson font-bold">›</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-burgundy/20 flex items-center justify-between">
              <span className="text-[11px] font-mono text-warm-ivory/50">Peer-Reviewed Benchmark</span>
              <a
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs font-mono py-1.5 px-3 flex items-center gap-1.5 hover:text-crimson transition-colors"
              >
                <span>OPEN PAPER</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
