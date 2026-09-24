import React, { useState, useEffect } from 'react'
import { ShieldCheck, Clock, ArrowRight, ArrowLeft, RefreshCw, Eye, Lock } from 'lucide-react'
import { mockAssessmentQuestions, AssessmentQuestion } from '../data/mockData'
import { cn } from '../lib/utils'

interface SecureAssessmentProps {
  onNavigate?: (page: string) => void
}

export const SecureAssessment: React.FC<SecureAssessmentProps> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<'BRIEFING' | 'IN_PROGRESS' | 'SUBMITTED'>('BRIEFING')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [integritySignals, setIntegritySignals] = useState({
    tabSwitches: 0,
    focusLossCount: 0,
    cameraConsented: true,
  })

  // Timer countdown
  useEffect(() => {
    if (phase !== 'IN_PROGRESS') return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setPhase('SUBMITTED')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  // Tab focus listener for demo proctor telemetry
  useEffect(() => {
    if (phase !== 'IN_PROGRESS') return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIntegritySignals((prev) => ({
          ...prev,
          tabSwitches: prev.tabSwitches + 1,
          focusLossCount: prev.focusLossCount + 1,
        }))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [phase])

  const questions = mockAssessmentQuestions
  const currentQ: AssessmentQuestion = questions[currentIndex]

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }))
  }

  const calculateScore = () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++
      }
    })
    return {
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      scaledScore: (correctCount / questions.length) * 10,
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* -------------------- PHASE 1: BRIEFING -------------------- */}
      {phase === 'BRIEFING' && (
        <div className="card space-y-6 p-6 md:p-8 border-burgundy/40 bg-gradient-obsidian">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory shadow-glow-crimson shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="stamp-classified">SECURE PROTOCOL</span>
                <span className="text-xs font-mono text-warm-ivory/60">EXAM // LC-SEC-2026</span>
              </div>
              <h1 className="heading-lg text-warm-ivory mt-1">STANDALONE SKILL ASSESSMENT</h1>
            </div>
          </div>

          <p className="text-sm text-warm-ivory/80 font-mono leading-relaxed">
            This timed diagnostic measures your algorithmic rigor, system design capability, and code execution comprehension against top-tier market standards.
          </p>

          {/* Protocols List */}
          <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/25 space-y-3 text-xs font-mono">
            <h3 className="text-warm-ivory font-bold uppercase tracking-wider text-crimson">
              EXAMINATION PROTOCOLS & INTEGRITY POLICY
            </h3>
            <div className="space-y-2 text-warm-ivory/70">
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 5 Technical Questions covering JavaScript/Node.js, TypeScript ASTs, System Design, React 18, and Docker.
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 5:00 minutes total time limit. Unanswered questions count as zero.
              </p>
              <p className="flex items-center gap-2">
                <span className="text-amber-400">⚠</span> Tab switching and window blurring events are logged as integrity telemetry.
              </p>
            </div>
          </div>

          {/* Responsible AI & Privacy Disclaimer */}
          <div className="p-4 bg-emerald-400/5 rounded-lg border border-emerald-400/20 text-xs font-mono space-y-1.5 text-warm-ivory/70">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck size={16} /> RESPONSIBLE AI & PRIVACY NOTICE
            </div>
            <p className="text-[11px] leading-relaxed">
              Assessment telemetry is strictly used to verify benchmark scores. No facial recognition or biometric profiles are permanently retained. Integrity signals provide probabilistic context and do not definitively declare cheating without human review.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => onNavigate?.('candidate-dossier')}
              className="btn-ghost text-xs font-mono flex items-center gap-2"
            >
              <ArrowLeft size={14} /> RETURN TO DOSSIER
            </button>
            <button
              onClick={() => setPhase('IN_PROGRESS')}
              className="btn-primary text-xs font-mono py-3 px-6 flex items-center gap-2 shadow-glow-crimson"
            >
              INITIATE SECURE ASSESSMENT <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- PHASE 2: IN PROGRESS -------------------- */}
      {phase === 'IN_PROGRESS' && (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-4 bg-charcoal border-burgundy/30">
            <div className="flex items-center gap-3">
              <span className="stamp-live">TEST IN PROGRESS</span>
              <span className="text-xs font-mono text-warm-ivory/70">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-warm-ivory">
                <Clock size={16} className={cn(timeLeft < 60 ? 'text-red-400 animate-ping' : 'text-crimson')} />
                <span className={cn('font-bold font-mono text-sm', timeLeft < 60 ? 'text-red-400' : 'text-warm-ivory')}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
                <Eye size={14} />
                <span className="text-[11px]">TELEMETRY SECURE</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 overflow-hidden">
            <div
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              className="h-full bg-gradient-crimson transition-all duration-300"
            />
          </div>

          {/* Question Card */}
          <div className="card space-y-6">
            <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
              <span className="text-xs font-mono text-crimson font-bold">
                TOPIC // {currentQ.skill}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-burgundy/20 text-warm-ivory/70 uppercase">
                DIFFICULTY: {currentQ.difficulty}
              </span>
            </div>

            <h2 className="text-sm md:text-base font-semibold text-warm-ivory font-mono leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 bg-obsidian border border-burgundy/30 rounded-lg text-warm-ivory/90 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 text-xs font-mono',
                      isSelected
                        ? 'bg-gradient-crimson border-crimson text-warm-ivory font-bold shadow-glow-crimson'
                        : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/80 hover:bg-burgundy/20 hover:border-crimson/40'
                    )}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px]">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Bottom Navigator */}
            <div className="flex items-center justify-between pt-4 border-t border-burgundy/20">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary text-xs font-mono py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← PREVIOUS
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn-primary text-xs font-mono py-2 px-5"
                >
                  NEXT QUESTION →
                </button>
              ) : (
                <button
                  onClick={() => setPhase('SUBMITTED')}
                  className="btn-primary text-xs font-mono py-2 px-6 bg-emerald-600 hover:bg-emerald-500"
                >
                  FINALIZE & SUBMIT EXAM ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PHASE 3: SUBMITTED RESULTS -------------------- */}
      {phase === 'SUBMITTED' && (() => {
        const result = calculateScore()
        return (
          <div className="card space-y-6 p-6 md:p-8 bg-charcoal border-crimson/30">
            <div className="text-center space-y-2">
              <span className="stamp-verified">VERIFIED ASSESSMENT COMPLETE</span>
              <h2 className="heading-lg text-warm-ivory mt-2">TECHNICAL DIAGNOSTIC REPORT</h2>
              <p className="text-xs font-mono text-warm-ivory/60">
                BENCHMARK EVALUATED & SEALED // ID: SEC-{Date.now().toString().slice(-6)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center my-6">
              <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30">
                <span className="text-[10px] font-mono text-warm-ivory/60">CALCULATED SCORE</span>
                <p className="heading-lg text-crimson font-mono">{result.scaledScore.toFixed(1)} / 10</p>
                <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">{result.correct} of {result.total} Correct</p>
              </div>

              <div className="p-4 bg-emerald-400/10 rounded-lg border border-emerald-400/30">
                <span className="text-[10px] font-mono text-emerald-400">READINESS TIER</span>
                <p className="heading-lg text-emerald-400 font-mono">
                  {result.percentage >= 80 ? 'TIER 1 (LEAD)' : result.percentage >= 60 ? 'TIER 2 (CORE)' : 'TIER 3 (DEVELOPING)'}
                </p>
                <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">Percentile: Top 15%</p>
              </div>

              <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30">
                <span className="text-[10px] font-mono text-warm-ivory/60">INTEGRITY INTEGRITY</span>
                <p className="heading-lg text-warm-ivory font-mono">
                  {integritySignals.tabSwitches === 0 ? '100% CLEAR' : 'FLAGGED'}
                </p>
                <p className="text-[11px] text-warm-ivory/50 font-mono mt-1">{integritySignals.tabSwitches} window events</p>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <h3 className="heading-sm text-warm-ivory font-mono text-xs uppercase tracking-wider">
                DEBRIEFING & QUESTION RATIONALE
              </h3>
              {questions.map((q, qIdx) => {
                const isCorrect = selectedAnswers[qIdx] === q.correct
                return (
                  <div key={q.id} className="p-4 bg-burgundy/10 rounded-lg border border-burgundy/20 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-warm-ivory">Question {qIdx + 1}: {q.skill}</span>
                      <span className={cn('font-bold', isCorrect ? 'text-emerald-400' : 'text-crimson')}>
                        {isCorrect ? '✓ CORRECT' : '✕ INCORRECT'}
                      </span>
                    </div>
                    <p className="text-warm-ivory/80">{q.question}</p>
                    <div className="p-2.5 bg-obsidian/70 rounded border border-burgundy/30 text-[11px] text-warm-ivory/70">
                      <span className="text-emerald-400 font-bold">RATIONALE: </span>
                      {q.explanation}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-burgundy/20">
              <button
                onClick={() => {
                  setPhase('BRIEFING')
                  setSelectedAnswers({})
                  setTimeLeft(300)
                }}
                className="btn-secondary text-xs font-mono py-2.5 px-4 flex items-center gap-2"
              >
                <RefreshCw size={14} /> RETAKE WITH NEW SEED
              </button>
              <button
                onClick={() => onNavigate?.('candidate-dossier')}
                className="btn-primary text-xs font-mono py-2.5 px-5 flex items-center gap-2"
              >
                APPLY SCORE TO DOSSIER <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
