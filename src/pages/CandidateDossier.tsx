import { useState, useEffect, type FC } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Edit,
  Download,
  Share2,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  Briefcase,
  GraduationCap,
  Check,
  Globe,
  Github,
  Linkedin,
  DollarSign,
  Code2,
  ExternalLink,
} from 'lucide-react'
import { type CandidateProfile } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { api, getStoredCandidate } from '../services/api'
import { DossierShareModal } from '../components/dossier/DossierShareModal'
import { CandidateProfileEditModal } from '../components/dossier/CandidateProfileEditModal'

interface CandidateDossierProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE CANDIDATE PROFILE COMPONENT
// ============================================================================
const EnterpriseCandidateProfile: FC<CandidateDossierProps> = ({ onNavigate }) => {
  const [candidate, setCandidate] = useState<CandidateProfile>(getStoredCandidate)
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'assessment' | 'experience' | 'compensation'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [exportNotice, setExportNotice] = useState(false)

  // Fetch live candidate profile
  useEffect(() => {
    let mounted = true
    const loadProfile = () => {
      api.candidate.getProfile().then((data) => {
        if (mounted && data) {
          setCandidate(data as CandidateProfile)
        }
      })
    }
    loadProfile()
    window.addEventListener('candidate-profile-updated', loadProfile)
    return () => {
      mounted = false
      window.removeEventListener('candidate-profile-updated', loadProfile)
    }
  }, [])

  const handleSaveProfile = async (updated: CandidateProfile) => {
    setCandidate(updated)
    try {
      await api.candidate.updateProfile(updated)
    } catch {
      // Offline fallback: state preserved in local state
    }
  }

  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname
    const shareUrl = `${baseUrl}#/shared-dossier?id=${candidate.id || 'CAND-7842'}`
    try {
      navigator.clipboard?.writeText?.(shareUrl).catch(() => {})
    } catch {
      // Ignore focus errors
    }
    setShareCopied(true)
    setIsShareModalOpen(true)
    setTimeout(() => setShareCopied(false), 2500)
  }

  const handleExport = () => {
    setExportNotice(true)
    setTimeout(() => setExportNotice(false), 3000)
  }

  const radarData = candidate.skills?.map((skill: any) => ({
    skill: skill.name,
    current: skill.score,
    market: skill.market,
  })) || []

  const initials = (candidate.name || 'Candidate')
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      {/* 1. Enterprise Profile Header */}
      <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm overflow-hidden">
              {candidate.avatarUrl ? (
                <img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{candidate.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {candidate.targetRole} • {candidate.location} • {candidate.experience} experience
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono mt-1">
                <span>ID: {candidate.id}</span>
                {candidate.secondaryRole && <span>• Secondary: {candidate.secondaryRole}</span>}
                {candidate.compensation?.noticePeriod && (
                  <span className="text-blue-700 font-sans font-medium">
                    • Notice: {candidate.compensation.noticePeriod}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit size={13} /> Edit Profile
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} /> {exportNotice ? 'PDF Exported' : 'Export Profile'}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {shareCopied ? (
                <>
                  <Check size={13} className="text-emerald-600" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 size={13} /> Share Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-3 text-xs font-medium text-slate-500 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Bio' },
            { id: 'skills', label: 'Skills & Competency Matrix' },
            { id: 'assessment', label: 'Standardized Assessment' },
            { id: 'experience', label: 'Projects & Credentials' },
            { id: 'compensation', label: 'Compensation & Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Target Role Readiness</span>
              <div className="text-2xl font-bold text-slate-900">{candidate.roleReadiness}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div style={{ width: `${candidate.roleReadiness}%` }} className="bg-[#1E3A8A] h-full rounded-full" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Assessment Score</span>
              <div className="text-2xl font-bold text-slate-900">{candidate.assessment.score}%</div>
              <p className="text-[11px] text-emerald-700 font-semibold">{candidate.assessment.percentile}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Experience Baseline</span>
              <div className="text-2xl font-bold text-slate-900">{candidate.experience}</div>
              <p className="text-[11px] text-slate-500">Full-stack & distributed systems</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Workforce Status</span>
              <div className="text-2xl font-bold text-emerald-700">Immediate</div>
              <p className="text-[11px] text-slate-500">Available for deployment</p>
            </div>
          </div>

          {/* Candidate Bio Narrative & Quick Info */}
          {candidate.bio && (
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Professional Narrative & Executive Summary
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{candidate.bio}</p>
            </div>
          )}

          {/* Quick Skill Matrix Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Core Competencies vs Market Baseline
              </h3>
              <button
                onClick={() => setActiveTab('skills')}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                Inspect All Skills →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.skills?.slice(0, 4).map((skill: any) => (
                <div key={skill.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{skill.name}</span>
                    <span className="text-slate-500 font-mono">
                      {skill.score} / 10 <span className="text-slate-400">(Market: {skill.market})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${(skill.score / 10) * 100}%` }} className="bg-[#1E3A8A] h-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill List */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Validated Technical Skills ({candidate.skills?.length || 0})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Edit size={12} /> Adjust Skills
              </button>
            </div>
            <div className="space-y-3">
              {candidate.skills?.map((skill: any) => {
                const gap = skill.gap
                const isReady = gap >= 0
                return (
                  <div key={skill.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700 font-semibold">{skill.score} / 10</span>
                        <span className="text-slate-400 text-[11px] font-mono">Market: {skill.market}</span>
                        {isReady ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Requirement Met
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Gap: {Math.abs(gap).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div style={{ width: `${(skill.score / 10) * 100}%` }} className="bg-[#1E3A8A] h-full rounded-full" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Capability Radar
            </h3>
            <p className="text-[11px] text-slate-500">
              Candidate profile score mapped against standard role benchmark.
            </p>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="skill" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#CBD5E1" domain={[0, 10]} />
                  <Radar name="Candidate Score" dataKey="current" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.25} />
                  <Radar name="Market Benchmark" dataKey="market" stroke="#94A3B8" fill="none" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: '#0F172A',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Standardized Skill Assessment</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proctored technical evaluation testing programming, systems design, and algorithmic problem solving.
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('assessment')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors self-start sm:self-auto cursor-pointer"
            >
              Take Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Benchmark Score</span>
              <div className="text-2xl font-bold text-slate-900">{candidate.assessment.score}%</div>
              <p className="text-[11px] text-emerald-700 font-semibold">{candidate.assessment.percentile}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Completed Date</span>
              <div className="text-base font-semibold text-slate-800">{candidate.assessment.completedAt}</div>
              <p className="text-[11px] text-slate-500">Category: {candidate.assessment.category}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1">
              <span className="text-[11px] font-medium text-slate-500">Integrity Protocol</span>
              <div className="text-base font-semibold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck size={16} /> Verified Protocol
              </div>
              <p className="text-[11px] text-slate-500">Focus Rate: {candidate.assessment.proctorSignals.focusRate}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Verified Technical Projects</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                + Add Project
              </button>
            </div>
            <div className="space-y-3">
              {candidate.projects?.map((proj: any) => (
                <div key={proj.title} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{proj.title}</h4>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                      >
                        <Globe size={11} /> Link <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.tech?.map((t: any) => (
                      <span key={t} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-emerald-700 font-semibold text-[11px] pt-1">{proj.metric}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials & Education */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Certifications & Education</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                + Add Record
              </button>
            </div>
            <div className="space-y-3">
              {candidate.certifications?.map((cert: any) => (
                <div key={cert.name} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                    <p className="text-slate-500 text-[11px]">{cert.issuer} • {cert.date}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {cert.status}
                  </span>
                </div>
              ))}

              {candidate.education && candidate.education.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  {candidate.education.map((edu: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <GraduationCap size={15} />
                        <span className="font-semibold text-slate-900">{edu.degree}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-5">
                        {edu.school} {edu.year ? `• Class of ${edu.year}` : ''} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compensation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compensation & Offer Calibration */}
          <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-blue-700" /> Compensation & Deployment Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Current CTC</span>
                <div className="text-base font-bold text-slate-900">
                  {candidate.compensation?.currentCtc || '₹22 LPA'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Expected Target CTC</span>
                <div className="text-base font-bold text-emerald-700">
                  {candidate.compensation?.expectedCtc || '₹34 - 40 LPA'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Notice Period</span>
                <div className="text-sm font-semibold text-slate-800">
                  {candidate.compensation?.noticePeriod || '30 Days'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Preferred Work Policy</span>
                <div className="text-sm font-semibold text-slate-800">
                  {candidate.compensation?.workPolicy || 'Remote / Hybrid'}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Verified Repos */}
          <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-blue-700" /> Public Code & Professional Links
            </h3>
            <div className="space-y-2.5 text-xs">
              {candidate.socialLinks?.github && (
                <a
                  href={candidate.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Github size={14} /> GitHub Profile
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              )}
              {candidate.socialLinks?.linkedin && (
                <a
                  href={candidate.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Linkedin size={14} className="text-[#0A66C2]" /> LinkedIn Network
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              )}
              {candidate.socialLinks?.website && (
                <a
                  href={candidate.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Globe size={14} /> Personal Portfolio / Tech Blog
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              )}
              {candidate.socialLinks?.leetcode && (
                <a
                  href={candidate.socialLinks.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Code2 size={14} className="text-amber-600" /> Coding Platform (LeetCode)
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Candidate Profile Edit Modal */}
      <CandidateProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        candidate={candidate}
        onSave={handleSaveProfile}
      />

      {/* Share Modal */}
      <DossierShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        candidate={candidate}
        onNavigate={onNavigate}
      />
    </div>
  )
}

// ============================================================================
// MAIN CANDIDATE DOSSIER EXPORT
// ============================================================================
export const CandidateDossier: FC<CandidateDossierProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const [candidate, setCandidate] = useState<CandidateProfile>(getStoredCandidate)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [exportNotice, setExportNotice] = useState(false)

  // Fetch live candidate profile
  useEffect(() => {
    let mounted = true
    const loadProfile = () => {
      api.candidate.getProfile().then((data) => {
        if (mounted && data) {
          setCandidate(data as CandidateProfile)
        }
      })
    }
    loadProfile()
    window.addEventListener('candidate-profile-updated', loadProfile)
    return () => {
      mounted = false
      window.removeEventListener('candidate-profile-updated', loadProfile)
    }
  }, [])

  // In Enterprise Mode: render the enterprise candidate profile
  if (!isHeist) {
    return <EnterpriseCandidateProfile onNavigate={onNavigate} />
  }

  const handleSaveProfile = async (updated: CandidateProfile) => {
    setCandidate(updated)
    try {
      await api.candidate.updateProfile(updated)
    } catch {
      // Offline fallback
    }
  }

  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname
    const shareUrl = `${baseUrl}#/shared-dossier?id=${candidate.id || 'CAND-7842'}`
    try {
      navigator.clipboard?.writeText?.(shareUrl).catch(() => {})
    } catch {
      // Ignore focus errors
    }
    setShareCopied(true)
    setIsShareModalOpen(true)
    setTimeout(() => setShareCopied(false), 2500)
  }

  const handleExport = () => {
    setExportNotice(true)
    setTimeout(() => setExportNotice(false), 3000)
  }

  const radarData = candidate.skills.map((skill: any) => ({
    skill: skill.name,
    current: skill.score,
    market: skill.market,
  }))

  const initials = (candidate.name || 'Candidate')
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {candidate.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                  className="w-14 h-14 rounded-lg object-cover border-2 border-crimson shadow-glow-crimson shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory font-bold shadow-glow-crimson font-mono text-lg shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-classified">CASE FILE // {candidate.codeName}</span>
                  <span className="stamp-verified">VERIFIED OPERATIVE</span>
                </div>
                <h1 className="heading-lg text-warm-ivory mt-1">{candidate.name}</h1>
                <p className="text-xs text-warm-ivory/60 font-mono">
                  CLEARANCE // {candidate.clearanceLevel} • ID: {candidate.id}
                  {candidate.email && ` • ${candidate.email}`}
                  {candidate.phone && ` • ${candidate.phone}`}
                </p>
              </div>
            </div>
            {candidate.bio && (
              <p className="text-xs text-warm-ivory/70 font-mono mt-3 max-w-3xl leading-relaxed border-l-2 border-crimson pl-3">
                {candidate.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3 cursor-pointer"
            >
              <Edit size={14} /> EDIT PROFILE
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3 cursor-pointer"
            >
              <Download size={14} /> {exportNotice ? 'EXPORT COMPLETED' : 'EXPORT DOSSIER'}
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3 cursor-pointer"
            >
              {shareCopied ? (
                <>
                  <Check size={14} className="text-emerald-400" /> COPIED LINK
                </>
              ) : (
                <>
                  <Share2 size={14} /> SHARE INTEL
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Profile Summary KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">TARGET ROLE</p>
          <p className="heading-sm text-warm-ivory">{candidate.targetRole}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Secondary: {candidate.secondaryRole}</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">EXPERIENCE BENCHMARK</p>
          <p className="heading-sm text-warm-ivory">{candidate.experience}</p>
          <p className="text-[11px] text-warm-ivory/40 font-mono mt-1">Full-stack production systems</p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">STATION & MOBILITY</p>
          <p className="heading-sm text-warm-ivory truncate">{candidate.location}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            {candidate.compensation?.workPolicy || 'Open to Remote / Hybrid'}
          </p>
        </div>

        <div className="card">
          <p className="text-xs text-warm-ivory/60 font-mono mb-1">OVERALL ROLE READINESS</p>
          <p className="heading-sm text-crimson font-mono">{candidate.roleReadiness}%</p>
          <div className="w-full bg-burgundy/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              style={{ width: `${candidate.roleReadiness}%` }}
              className="h-full bg-gradient-crimson rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Compensation & Social Links (if present) */}
      {(candidate.compensation || candidate.socialLinks) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidate.compensation && (
            <div className="card space-y-3 font-mono text-xs">
              <h3 className="heading-xs text-warm-ivory flex items-center gap-2">
                <DollarSign size={14} className="text-crimson" /> COMPENSATION PARAMETERS
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-burgundy/10 rounded border border-burgundy/20">
                  <span className="text-warm-ivory/50 text-[10px] block">CURRENT CTC</span>
                  <span className="text-warm-ivory font-bold">{candidate.compensation.currentCtc || '₹22 LPA'}</span>
                </div>
                <div className="p-2.5 bg-burgundy/10 rounded border border-burgundy/20">
                  <span className="text-warm-ivory/50 text-[10px] block">EXPECTED TARGET</span>
                  <span className="text-emerald-400 font-bold">{candidate.compensation.expectedCtc || '₹34 - 40 LPA'}</span>
                </div>
                <div className="p-2.5 bg-burgundy/10 rounded border border-burgundy/20">
                  <span className="text-warm-ivory/50 text-[10px] block">NOTICE PERIOD</span>
                  <span className="text-warm-ivory">{candidate.compensation.noticePeriod || '30 Days'}</span>
                </div>
                <div className="p-2.5 bg-burgundy/10 rounded border border-burgundy/20">
                  <span className="text-warm-ivory/50 text-[10px] block">WORK POLICY</span>
                  <span className="text-warm-ivory">{candidate.compensation.workPolicy || 'Remote'}</span>
                </div>
              </div>
            </div>
          )}

          {candidate.socialLinks && (
            <div className="card space-y-3 font-mono text-xs">
              <h3 className="heading-xs text-warm-ivory flex items-center gap-2">
                <Globe size={14} className="text-muted-gold" /> NETWORK INTEL & REPOSITORIES
              </h3>
              <div className="space-y-2 pt-1">
                {candidate.socialLinks.github && (
                  <a
                    href={candidate.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-burgundy/10 hover:bg-burgundy/20 rounded border border-burgundy/20 flex items-center justify-between text-warm-ivory transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Github size={13} className="text-crimson" /> GitHub Repository
                    </span>
                    <ExternalLink size={12} className="text-warm-ivory/40" />
                  </a>
                )}
                {candidate.socialLinks.linkedin && (
                  <a
                    href={candidate.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-burgundy/10 hover:bg-burgundy/20 rounded border border-burgundy/20 flex items-center justify-between text-warm-ivory transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Linkedin size={13} className="text-blue-400" /> LinkedIn Operative
                    </span>
                    <ExternalLink size={12} className="text-warm-ivory/40" />
                  </a>
                )}
                {candidate.socialLinks.website && (
                  <a
                    href={candidate.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-burgundy/10 hover:bg-burgundy/20 rounded border border-burgundy/20 flex items-center justify-between text-warm-ivory transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={13} className="text-muted-gold" /> Portfolio Blueprint
                    </span>
                    <ExternalLink size={12} className="text-warm-ivory/40" />
                  </a>
                )}
                {candidate.socialLinks.leetcode && (
                  <a
                    href={candidate.socialLinks.leetcode}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-burgundy/10 hover:bg-burgundy/20 rounded border border-burgundy/20 flex items-center justify-between text-warm-ivory transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 size={13} className="text-amber-400" /> LeetCode Platform
                    </span>
                    <ExternalLink size={12} className="text-warm-ivory/40" />
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Grid: Skills Matrix & Verified Assessment */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Profile Breakdown */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase tracking-wider">
              CERTIFIED SKILL PROFILE & MARKET EXPECTATIONS ({candidate.skills?.length || 0})
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-mono text-crimson hover:text-crimson/80 flex items-center gap-1 cursor-pointer"
            >
              <Edit size={12} /> RECALIBRATE
            </button>
          </div>
          <div className="space-y-3.5">
            {candidate.skills?.map((skill: any) => {
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
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono shrink-0 font-bold">
                        <CheckCircle size={14} /> Ready
                      </span>
                    ) : (
                      <span className="text-xs text-crimson font-mono shrink-0 font-bold">
                        Deficit: {Math.abs(gap).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assessment Verified Info */}
        <div className="card flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">VERIFIED BENCHMARK</h3>
            <div className="p-4 bg-burgundy/15 rounded-lg border border-burgundy/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-gradient-crimson flex items-center justify-center shadow-glow-crimson shrink-0">
                  <span className="text-2xl font-bold text-warm-ivory font-mono">{candidate.assessment.score}</span>
                </div>
                <div>
                  <p className="text-[10px] text-warm-ivory/60 font-mono">BENCHMARK EVALUATION</p>
                  <p className="heading-sm text-warm-ivory">{candidate.assessment.category}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">{candidate.assessment.percentile}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono border-t border-burgundy/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-warm-ivory/60">Verified Date</span>
                  <span className="text-warm-ivory">{candidate.assessment.completedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-ivory/60">Integrity Protocol</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> {candidate.assessment.integrity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-ivory/60">Focus Telemetry</span>
                  <span className="text-emerald-400 font-bold">{candidate.assessment.proctorSignals.focusRate}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.('assessment')}
            className="w-full btn-primary text-xs font-mono py-3 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            TAKE NEW SKILL ASSESSMENT <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Radar Chart */}
      <section className="card">
        <h3 className="heading-sm text-warm-ivory mb-2 font-mono text-sm uppercase">CAPABILITY PROFILE RADAR</h3>
        <p className="text-xs text-warm-ivory/50 font-mono mb-6">COMPARING OPERATIVE BENCHMARK VS MARKET MANDATE</p>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(179,19,43,0.18)" />
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

      {/* Projects & Certifications Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audited Projects */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-burgundy/20">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-crimson" />
              <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">VERIFIED FIELD PROJECTS</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-mono text-crimson hover:text-crimson/80 cursor-pointer"
            >
              + ADD BLUEPRINT
            </button>
          </div>
          <div className="space-y-3">
            {candidate.projects?.map((proj: any) => (
              <div key={proj.title} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-warm-ivory">{proj.title}</h4>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-warm-ivory/50 hover:text-crimson flex items-center gap-1 text-[11px]"
                    >
                      <Globe size={11} /> Link <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 my-1">
                  {proj.tech?.map((t: any) => (
                    <span key={t} className="px-1.5 py-0.5 bg-burgundy/20 rounded text-[10px] text-warm-ivory/80">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-emerald-400 font-bold text-[11px]">{proj.metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications & Education */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-burgundy/20">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-muted-gold" />
              <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">AUTHENTICATED CREDENTIALS</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-mono text-crimson hover:text-crimson/80 cursor-pointer"
            >
              + ADD RECORD
            </button>
          </div>
          <div className="space-y-3">
            {candidate.certifications?.map((cert: any) => (
              <div key={cert.name} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 flex items-center justify-between text-xs font-mono">
                <div>
                  <h4 className="font-bold text-warm-ivory">{cert.name}</h4>
                  <p className="text-warm-ivory/50 text-[11px]">{cert.issuer} • {cert.date}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                  {cert.status}
                </span>
              </div>
            ))}

            {candidate.education && candidate.education.length > 0 && (
              <div className="pt-2 border-t border-burgundy/20 space-y-2 text-xs font-mono">
                {candidate.education.map((edu: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center gap-2 text-warm-ivory/60">
                      <GraduationCap size={16} className="text-crimson" />
                      <span className="font-bold text-warm-ivory">{edu.degree}</span>
                    </div>
                    <p className="text-[11px] text-warm-ivory/50 pl-6">
                      {edu.school} {edu.year ? `• Class of ${edu.year}` : ''} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comprehensive Candidate Profile Edit Modal */}
      <CandidateProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        candidate={candidate}
        onSave={handleSaveProfile}
      />

      {/* Share Intel Modal */}
      <DossierShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        candidate={candidate}
        onNavigate={onNavigate}
      />
    </div>
  )
}
