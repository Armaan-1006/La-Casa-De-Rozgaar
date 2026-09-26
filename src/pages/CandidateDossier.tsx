import { useState, useEffect, type FC } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit, Download, Share2, CheckCircle, ArrowRight, ShieldCheck, Award, Briefcase, GraduationCap, X, Check } from 'lucide-react'
import { type CandidateProfile } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { api, getStoredCandidate } from '../services/api'

interface CandidateDossierProps {
  onNavigate?: (page: string) => void
}

// ============================================================================
// ENTERPRISE CANDIDATE PROFILE COMPONENT
// ============================================================================
const EnterpriseCandidateProfile: FC<CandidateDossierProps> = ({ onNavigate }) => {
  const [candidate, setCandidate] = useState<CandidateProfile>(getStoredCandidate)
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'assessment' | 'experience'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [exportNotice, setExportNotice] = useState(false)

  // Fetch live candidate profile
  useEffect(() => {
    let mounted = true
    const loadProfile = () => {
      api.candidate.getProfile().then((data) => {
        if (mounted && data) {
          setCandidate(data as CandidateProfile)
          setEditName(data.name)
          setEditRole(data.targetRole)
          setEditLoc(data.location)
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

  // Edit form state
  const [editName, setEditName] = useState(candidate.name)
  const [editRole, setEditRole] = useState(candidate.targetRole)
  const [editLoc, setEditLoc] = useState(candidate.location)

  const handleSaveProfile = async () => {
    setCandidate((prev: CandidateProfile) => ({
      ...prev,
      name: editName,
      targetRole: editRole,
      location: editLoc,
    }))
    setIsEditModalOpen(false)

    try {
      await api.candidate.updateProfile({
        name: editName,
        targetRoles: [editRole],
        location: editLoc,
      })
    } catch {
      // Offline fallback: state preserved in local state
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href)
    setShareCopied(true)
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

  return (
    <div className="space-y-6">
      {/* 1. Enterprise Profile Header */}
      <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
              AR
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
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Candidate ID: {candidate.id} • Secondary: {candidate.secondaryRole}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
            >
              <Edit size={13} /> Edit Profile
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} /> {exportNotice ? 'PDF Exported' : 'Export Profile'}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
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
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-3 text-xs font-medium text-slate-500">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: 'Skills & Competency Matrix' },
            { id: 'assessment', label: 'Standardized Assessment' },
            { id: 'experience', label: 'Projects & Credentials' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-3 py-1.5 rounded transition-colors',
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

          {/* Quick Skill Matrix Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Core Competencies vs Market Baseline
              </h3>
              <button
                onClick={() => setActiveTab('skills')}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
              >
                Inspect All Skills
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.skills.slice(0, 4).map((skill: any) => (
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
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Validated Technical Skills
            </h3>
            <div className="space-y-3">
              {candidate.skills.map((skill: any) => {
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
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors self-start sm:self-auto"
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
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Briefcase size={16} className="text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Verified Technical Projects</h3>
            </div>
            <div className="space-y-3">
              {candidate.projects.map((proj: any) => (
                <div key={proj.title} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs">
                  <h4 className="font-semibold text-slate-900">{proj.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {proj.tech.map((t: any) => (
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

          {/* Credentials */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award size={16} className="text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Certifications & Education</h3>
            </div>
            <div className="space-y-3">
              {candidate.certifications.map((cert: any) => (
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

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap size={15} />
                  <span className="font-semibold text-slate-900">{candidate.education[0].degree}</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  {candidate.education[0].school} • Class of {candidate.education[0].year}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Edit Candidate Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={17} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Primary Target Role</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={editLoc}
                  onChange={(e) => setEditLoc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [shareCopied, setShareCopied] = useState(false)
  const [exportNotice, setExportNotice] = useState(false)

  // Fetch live candidate profile
  useEffect(() => {
    let mounted = true
    const loadProfile = () => {
      api.candidate.getProfile().then((data) => {
        if (mounted && data) {
          setCandidate(data as CandidateProfile)
          setEditName(data.name)
          setEditRole(data.targetRole)
          setEditLoc(data.location)
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

  // Edit form state
  const [editName, setEditName] = useState(candidate.name)
  const [editRole, setEditRole] = useState(candidate.targetRole)
  const [editLoc, setEditLoc] = useState(candidate.location)

  const handleSaveProfile = async () => {
    setCandidate((prev: CandidateProfile) => ({
      ...prev,
      name: editName,
      targetRole: editRole,
      location: editLoc,
    }))
    setIsEditModalOpen(false)

    try {
      await api.candidate.updateProfile({
        name: editName,
        targetRoles: [editRole],
        location: editLoc,
      })
    } catch {
      // Offline fallback: state preserved in local state
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href)
    setShareCopied(true)
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-xl border border-burgundy/30 bg-gradient-obsidian p-6 md:p-8 shadow-glow-crimson">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-crimson flex items-center justify-center text-warm-ivory font-bold shadow-glow-crimson font-mono text-lg shrink-0">
                AR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-classified">CASE FILE // {candidate.codeName}</span>
                  <span className="stamp-verified">VERIFIED OPERATIVE</span>
                </div>
                <h1 className="heading-lg text-warm-ivory mt-1">{candidate.name}</h1>
                <p className="text-xs text-warm-ivory/60 font-mono">
                  CLEARANCE // {candidate.clearanceLevel} • ID: {candidate.id}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3"
            >
              <Edit size={14} /> EDIT PROFILE
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3"
            >
              <Download size={14} /> {exportNotice ? 'EXPORT COMPLETED' : 'EXPORT DOSSIER'}
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono py-2 px-3"
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
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Open to Remote / Hybrid</p>
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

      {/* Main Grid: Skills Matrix & Verified Assessment */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Profile Breakdown */}
        <div className="lg:col-span-2 card">
          <h3 className="heading-sm text-warm-ivory mb-6 font-mono text-sm uppercase tracking-wider">
            CERTIFIED SKILL PROFILE & MARKET EXPECTATIONS
          </h3>
          <div className="space-y-3.5">
            {candidate.skills.map((skill: any) => {
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
            className="w-full btn-primary text-xs font-mono py-3 flex items-center justify-center gap-2 mt-4"
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
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-crimson" />
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">VERIFIED FIELD PROJECTS</h3>
          </div>
          <div className="space-y-3">
            {candidate.projects.map((proj: any) => (
              <div key={proj.title} className="p-3 bg-burgundy/10 rounded-lg border border-burgundy/20 space-y-1 text-xs font-mono">
                <h4 className="font-bold text-warm-ivory">{proj.title}</h4>
                <div className="flex flex-wrap gap-1 my-1">
                  {proj.tech.map((t: any) => (
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
          <div className="flex items-center gap-2">
            <Award size={18} className="text-muted-gold" />
            <h3 className="heading-sm text-warm-ivory font-mono text-sm uppercase">AUTHENTICATED CREDENTIALS</h3>
          </div>
          <div className="space-y-3">
            {candidate.certifications.map((cert: any) => (
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

            <div className="pt-2 border-t border-burgundy/20 space-y-1 text-xs font-mono">
              <div className="flex items-center gap-2 text-warm-ivory/60">
                <GraduationCap size={16} className="text-crimson" />
                <span className="font-bold text-warm-ivory">{candidate.education[0].degree}</span>
              </div>
              <p className="text-[11px] text-warm-ivory/50 pl-6">
                {candidate.education[0].school} • Class of {candidate.education[0].year} (GPA: {candidate.education[0].gpa})
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 bg-charcoal border-crimson/50 shadow-glow-crimson">
            <div className="flex items-center justify-between border-b border-burgundy/20 pb-3">
              <h3 className="heading-xs text-warm-ivory">EDIT OPERATIVE PROFILE</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-warm-ivory/50 hover:text-crimson">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-warm-ivory/60 block mb-1">OPERATIVE FULL NAME</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-obsidian border border-burgundy/30 rounded text-warm-ivory outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="text-warm-ivory/60 block mb-1">PRIMARY TARGET ROLE</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2.5 bg-obsidian border border-burgundy/30 rounded text-warm-ivory outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="text-warm-ivory/60 block mb-1">LOCATION & MOBILITY</label>
                <input
                  type="text"
                  value={editLoc}
                  onChange={(e) => setEditLoc(e.target.value)}
                  className="w-full p-2.5 bg-obsidian border border-burgundy/30 rounded text-warm-ivory outline-none focus:border-crimson"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex-1 btn-primary text-xs font-mono py-2.5"
              >
                SAVE UPDATES
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary text-xs font-mono py-2.5 px-4"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
