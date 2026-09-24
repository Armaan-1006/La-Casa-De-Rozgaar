import React, { useState } from 'react'
import { Target, ArrowRight, CheckCircle2, Calendar } from 'lucide-react'
import { mockCandidate } from '../data/mockData'
import { cn } from '../lib/utils'

interface CareerIntelligenceProps {
  onNavigate?: (page: string) => void
}

interface CareerPath {
  targetRole: string
  codeName: string
  currentFit: number
  timeline: string
  medianComp: string
  difficulty: 'MODERATE' | 'STEEP' | 'STRATEGIC'
  requiredUnlocks: string[]
  milestones: { step: string; title: string; duration: string; deliverable: string }[]
  strategicAdvantage: string
}

export const CareerIntelligence: React.FC<CareerIntelligenceProps> = ({ onNavigate }) => {
  const pathways: CareerPath[] = [
    {
      targetRole: 'Cloud Solutions Architect',
      codeName: 'VECTOR-ALPHA // CLOUD MESH',
      currentFit: 82,
      timeline: '6 - 9 Months',
      medianComp: '₹2.4M - ₹3.4M',
      difficulty: 'MODERATE',
      requiredUnlocks: ['AWS Advanced Networking & IAM', 'Terraform State Architecture', 'Kubernetes Helm'],
      milestones: [
        { step: '01', title: 'Complete AWS Solutions Architect Associate Sprints', duration: '6 Weeks', deliverable: 'Deploy multi-region failover network' },
        { step: '02', title: 'Kubernetes Container Orchestration Mastery', duration: '8 Weeks', deliverable: 'Migrate microservice mesh to EKS' },
        { step: '03', title: 'Enterprise Cost & Governance Modeling', duration: '4 Weeks', deliverable: 'Deliver FinOps budget allocation dashboard' },
      ],
      strategicAdvantage: 'High hiring premium; 31.2% year-on-year demand surge across all tech corridors.',
    },
    {
      targetRole: 'Staff Platform Engineer',
      codeName: 'VECTOR-BETA // DISTRIBUTED RIGOR',
      currentFit: 74,
      timeline: '9 - 12 Months',
      medianComp: '₹2.8M - ₹3.8M',
      difficulty: 'STRATEGIC',
      requiredUnlocks: ['Go / Systems Programming', 'Zero-Downtime Database Migrations', 'eBPF Observability'],
      milestones: [
        { step: '01', title: 'Production Go Microservices Pipeline', duration: '8 Weeks', deliverable: 'Build high-throughput gRPC routing layer' },
        { step: '02', title: 'Distributed Observability Infrastructure', duration: '6 Weeks', deliverable: 'Implement OpenTelemetry trace collector' },
        { step: '03', title: 'Developer Experience Platform Orchestration', duration: '10 Weeks', deliverable: 'Author internal developer portal CLI' },
      ],
      strategicAdvantage: 'Critical leverage inside enterprise scaling organizations.',
    },
    {
      targetRole: 'AI Application Systems Specialist',
      codeName: 'VECTOR-GAMMA // AGENTIC MATRIX',
      currentFit: 71,
      timeline: '9 - 12 Months',
      medianComp: '₹2.6M - ₹3.6M',
      difficulty: 'STEEP',
      requiredUnlocks: ['Vector Database Architectures', 'RAG Evaluation Frameworks', 'LangChain / Multi-Agent UX'],
      milestones: [
        { step: '01', title: 'Semantic Retrieval & Vector Embeddings', duration: '6 Weeks', deliverable: 'Deploy hybrid BM25 + Pinecone index' },
        { step: '02', title: 'Agent Tool Calling & Guardrail Systems', duration: '8 Weeks', deliverable: 'Construct autonomous customer workflow agent' },
        { step: '03', title: 'LLM Latency & Token Streaming Optimization', duration: '6 Weeks', deliverable: 'Optimize model response time by 40%' },
      ],
      strategicAdvantage: 'Highest expansion rate in early-stage frontier technology startups.',
    },
  ]

  const [selectedPath, setSelectedPath] = useState<CareerPath>(pathways[0])

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-live">STRATEGIC TRAJECTORY</span>
              <span className="text-xs font-mono text-warm-ivory/60">OPERATION // CAREER-VECTOR-PATHWAYS</span>
            </div>
            <h1 className="heading-lg text-warm-ivory mb-1">CAREER INTELLIGENCE & PATHWAYS</h1>
            <p className="text-xs md:text-sm text-warm-ivory/70 font-mono">
              DATA-DRIVEN PROMOTIONAL TRAJECTORIES, PREDICTIVE TIME-TO-READINESS & SCENARIO BLUEPRINTS
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

      {/* Current Position Baseline */}
      <section className="card bg-charcoal border-burgundy/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-crimson flex items-center justify-center font-mono font-bold text-warm-ivory text-sm">
              AR
            </div>
            <div>
              <span className="text-[10px] font-mono text-crimson uppercase font-bold">CURRENT BASELINE POSITION</span>
              <h3 className="heading-xs text-warm-ivory mt-0.5">{mockCandidate.targetRole}</h3>
              <p className="text-xs font-mono text-warm-ivory/60">Readiness Benchmark: {mockCandidate.roleReadiness}% • Level 4 Operative</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-2.5 bg-burgundy/15 rounded-lg border border-burgundy/25 text-center">
              <span className="text-warm-ivory/50 text-[10px] block">VERIFIED SKILLS</span>
              <span className="text-warm-ivory font-bold">{mockCandidate.skills.length} Tracked</span>
            </div>
            <div className="p-2.5 bg-burgundy/15 rounded-lg border border-burgundy/25 text-center">
              <span className="text-warm-ivory/50 text-[10px] block">CRITICAL GAPS</span>
              <span className="text-crimson font-bold">3 Deficits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vector Selector Tabs */}
      <section className="space-y-4">
        <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
          PROJECTED CAREER SCENARIOS // SELECT TARGET VECTOR
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pathways.map((path) => {
            const isSelected = selectedPath.targetRole === path.targetRole
            return (
              <div
                key={path.targetRole}
                onClick={() => setSelectedPath(path)}
                className={cn(
                  'p-4 rounded-lg border cursor-pointer transition-all space-y-3',
                  isSelected
                    ? 'bg-gradient-crimson border-crimson text-warm-ivory shadow-glow-crimson font-bold'
                    : 'card-hover border-burgundy/25 text-warm-ivory/80'
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                  <span>{path.codeName}</span>
                  <span className="text-emerald-400 font-bold">{path.currentFit}% Fit</span>
                </div>
                <h4 className="text-sm font-bold">{path.targetRole}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-current/20 text-xs font-mono opacity-80">
                  <span>Window: {path.timeline}</span>
                  <span>{path.medianComp}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Selected Pathway In-Depth Dossier */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Milestones Roadmap */}
        <div className="lg:col-span-8 card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-burgundy/20 pb-4">
            <div>
              <span className="stamp-classified">TARGET SCENARIO BLUEPRINT</span>
              <h2 className="heading-md text-warm-ivory mt-2">{selectedPath.targetRole}</h2>
              <p className="text-xs font-mono text-warm-ivory/60 mt-0.5">{selectedPath.strategicAdvantage}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-warm-ivory/50">TARGET COMPENSATION</span>
              <p className="text-xl font-bold font-mono text-emerald-400">{selectedPath.medianComp}</p>
            </div>
          </div>

          {/* Sequential Milestones */}
          <div className="space-y-4">
            <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
              SEQUENTIAL LEARNING & EXECUTION MILESTONES
            </h3>
            <div className="space-y-3">
              {selectedPath.milestones.map((m) => (
                <div key={m.step} className="p-4 bg-burgundy/10 border border-burgundy/20 rounded-lg flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-crimson flex items-center justify-center font-mono font-bold text-warm-ivory text-xs shrink-0 shadow-glow-crimson">
                    {m.step}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-mono">
                      <span className="font-bold text-warm-ivory">{m.title}</span>
                      <span className="text-warm-ivory/60 flex items-center gap-1">
                        <Calendar size={12} className="text-crimson" /> {m.duration}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-warm-ivory/70">Deliverable: {m.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Requirements & Vault Action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Required Unlocks */}
          <div className="card bg-charcoal/80 border-burgundy/30">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-crimson" />
              <h3 className="heading-sm text-warm-ivory font-mono text-sm">CRITICAL UNLOCKS</h3>
            </div>
            <div className="space-y-2">
              {selectedPath.requiredUnlocks.map((u) => (
                <div key={u} className="p-2.5 bg-burgundy/15 rounded border border-burgundy/25 text-xs font-mono text-warm-ivory/90 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{u}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Action Box */}
          <div className="card bg-gradient-obsidian border-crimson/30 space-y-3">
            <h4 className="heading-xs text-crimson font-mono uppercase tracking-wider">EXECUTE SCENARIO</h4>
            <p className="text-xs font-mono text-warm-ivory/70 leading-relaxed">
              Launch this configuration directly in the Simulation Vault to evaluate readiness improvements and forecast open job yields.
            </p>
            <button
              onClick={() => onNavigate?.('simulation')}
              className="w-full btn-primary text-xs font-mono py-2.5 flex items-center justify-center gap-2"
            >
              LAUNCH SIMULATION <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate?.('skill-heist')}
              className="w-full btn-secondary text-xs font-mono py-2.5 flex items-center justify-center gap-2"
            >
              VIEW GAP ROADMAP
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
