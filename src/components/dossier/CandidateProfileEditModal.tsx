import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Camera,
  Upload,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  RefreshCw,
  Award,
  Briefcase,
  GraduationCap,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  Code2,
  User,
  Sliders,
  FileCode,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/utils'
import { type CandidateProfile } from '../../data/mockData'

interface CandidateProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidateProfile
  onSave: (updatedCandidate: CandidateProfile) => Promise<void> | void
}

type TabType = 'identity' | 'skills' | 'projects' | 'education' | 'compensation'

export const CandidateProfileEditModal: React.FC<CandidateProfileEditModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSave,
}) => {
  const { isHeist } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('identity')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local form state cloned from candidate
  const [formData, setFormData] = useState<CandidateProfile>(() => JSON.parse(JSON.stringify(candidate)))

  // Quick inputs for new items
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillScore, setNewSkillScore] = useState(8.0)
  const [newSkillMarket, setNewSkillMarket] = useState(8.5)

  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectTech, setNewProjectTech] = useState('')
  const [newProjectMetric, setNewProjectMetric] = useState('')
  const [newProjectLink, setNewProjectLink] = useState('')

  const [newCertName, setNewCertName] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [newCertDate, setNewCertDate] = useState('')

  const [newEduDegree, setNewEduDegree] = useState('')
  const [newEduSchool, setNewEduSchool] = useState('')
  const [newEduYear, setNewEduYear] = useState('')
  const [newEduGpa, setNewEduGpa] = useState('')

  // Sync formData whenever candidate or modal open state changes
  useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(candidate)))
      setSaveSuccess(false)
    }
  }, [isOpen, candidate])

  // Close on Escape & prevent scroll
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Skills Management
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return
    const score = Number(newSkillScore) || 7.0
    const market = Number(newSkillMarket) || 8.0
    const gap = Number((score - market).toFixed(1))
    const tier = gap >= 0 ? 'strength' : gap > -1.5 ? 'high' : 'critical'

    const newSkill = {
      name: newSkillName.trim(),
      score,
      market,
      gap,
      tier,
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }))
    setNewSkillName('')
  }

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const handleSkillScoreChange = (index: number, newScore: number) => {
    setFormData((prev) => {
      const updated = [...prev.skills]
      const current = updated[index]
      const gap = Number((newScore - current.market).toFixed(1))
      const tier = gap >= 0 ? 'strength' : gap > -1.5 ? 'high' : 'critical'
      updated[index] = { ...current, score: newScore, gap, tier }
      return { ...prev, skills: updated }
    })
  }

  // Project Management
  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return
    const techArray = newProjectTech
      ? newProjectTech.split(',').map((t) => t.trim()).filter(Boolean)
      : ['TypeScript', 'React']
    const newProj = {
      title: newProjectTitle.trim(),
      tech: techArray,
      metric: newProjectMetric.trim() || 'Verified performance optimization',
      link: newProjectLink.trim() || 'github.com/project',
    }
    setFormData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
    }))
    setNewProjectTitle('')
    setNewProjectTech('')
    setNewProjectMetric('')
    setNewProjectLink('')
  }

  const handleRemoveProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }))
  }

  // Certifications Management
  const handleAddCert = () => {
    if (!newCertName.trim()) return
    const newCert = {
      name: newCertName.trim(),
      issuer: newCertIssuer.trim() || 'Verified Authority',
      date: newCertDate.trim() || new Date().toISOString().slice(0, 7),
      status: 'VERIFIED',
    }
    setFormData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert],
    }))
    setNewCertName('')
    setNewCertIssuer('')
    setNewCertDate('')
  }

  const handleRemoveCert = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  // Education Management
  const handleAddEdu = () => {
    if (!newEduDegree.trim()) return
    const newEdu = {
      degree: newEduDegree.trim(),
      school: newEduSchool.trim() || 'Engineering Institute',
      year: newEduYear.trim() || '2024',
      gpa: newEduGpa.trim() || '8.5 / 10',
    }
    setFormData((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }))
    setNewEduDegree('')
    setNewEduSchool('')
    setNewEduYear('')
    setNewEduGpa('')
  }

  const handleRemoveEdu = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  // Save Handler
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch {
      setIsSaving(false)
    }
  }

  const initials = (formData.name || 'Candidate')
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Render modal in Portal
  return typeof document !== 'undefined'
    ? createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          className={cn(
            'fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200',
            isHeist ? 'bg-black/85 backdrop-blur-md' : 'bg-slate-900/60 backdrop-blur-md'
          )}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0 }}
        >
          <div
            className={cn(
              'relative rounded-xl border shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in zoom-in-95 duration-200',
              isHeist
                ? 'bg-[#151518] border-burgundy/40 text-warm-ivory shadow-glow-crimson font-mono'
                : 'bg-white border-slate-200 text-slate-900'
            )}
          >
            {/* Modal Header */}
            <div
              className={cn(
                'px-6 py-4 flex items-center justify-between border-b shrink-0',
                isHeist ? 'border-burgundy/30 bg-black/40' : 'border-slate-200 bg-slate-50/80'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden',
                    isHeist
                      ? 'bg-crimson text-warm-ivory shadow-glow-crimson'
                      : 'bg-[#1E3A8A] text-white shadow-2xs'
                  )}
                >
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div>
                  <h2
                    className={cn(
                      'text-base font-bold flex items-center gap-2',
                      isHeist ? 'text-warm-ivory' : 'text-slate-900'
                    )}
                  >
                    {isHeist ? 'OPERATIVE DOSSIER CONFIGURATION' : 'Comprehensive Candidate Profile Editor'}
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded font-normal uppercase',
                        isHeist
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                      )}
                    >
                      Live Sync
                    </span>
                  </h2>
                  <p className={cn('text-xs mt-0.5', isHeist ? 'text-warm-ivory/60' : 'text-slate-500')}>
                    {isHeist
                      ? 'Fine-tune telemetry benchmarks, operative arsenal, blueprints & comp expectations.'
                      : 'Manage personal identity, verified competencies, portfolio projects, certifications, and compensation preferences.'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  isHeist
                    ? 'text-warm-ivory/60 hover:text-crimson hover:bg-black/50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div
              className={cn(
                'flex items-center gap-1 sm:gap-2 px-6 border-b text-xs overflow-x-auto shrink-0 scrollbar-none',
                isHeist ? 'border-burgundy/20 bg-obsidian/60' : 'border-slate-200 bg-slate-100/50'
              )}
            >
              {[
                { id: 'identity', label: isHeist ? '// 01. IDENTITY' : 'Identity & Avatar', icon: User },
                { id: 'skills', label: isHeist ? '// 02. ARSENAL' : 'Skills & Scores', icon: Sliders },
                { id: 'projects', label: isHeist ? '// 03. PROJECTS' : 'Projects & Portfolio', icon: FileCode },
                { id: 'education', label: isHeist ? '// 04. CREDENTIALS' : 'Education & Certs', icon: GraduationCap },
                { id: 'compensation', label: isHeist ? '// 05. PREFERENCES' : 'Comp & Social Links', icon: DollarSign },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      'py-3 px-3 font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer',
                      isActive
                        ? isHeist
                          ? 'text-crimson border-crimson bg-crimson/10'
                          : 'text-[#1E3A8A] border-[#1E3A8A] bg-blue-50/60'
                        : isHeist
                        ? 'text-warm-ivory/50 border-transparent hover:text-warm-ivory'
                        : 'text-slate-500 border-transparent hover:text-slate-900'
                    )}
                  >
                    <Icon size={14} className={isActive ? (isHeist ? 'text-crimson' : 'text-blue-700') : 'opacity-60'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* TAB 1: IDENTITY & AVATAR */}
              {activeTab === 'identity' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Avatar Upload Section */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-4',
                      isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="relative group shrink-0">
                      <div
                        className={cn(
                          'w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center font-bold text-2xl border shadow-inner',
                          isHeist
                            ? 'bg-obsidian border-crimson/40 text-warm-ivory'
                            : 'bg-white border-slate-300 text-slate-700'
                        )}
                      >
                        {formData.avatarUrl ? (
                          <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-semibold transition-opacity rounded-xl cursor-pointer"
                      >
                        <Camera size={16} className="mb-0.5" /> Change
                      </button>
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer',
                            isHeist
                              ? 'bg-crimson text-white hover:bg-crimson/80'
                              : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                          )}
                        >
                          <Upload size={13} /> Upload Avatar Photo
                        </button>
                        {formData.avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className={cn(
                              'px-2.5 py-1.5 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer',
                              isHeist
                                ? 'text-warm-ivory/60 hover:text-crimson border border-white/10 hover:border-crimson/40'
                                : 'text-red-600 hover:bg-red-50 border border-red-200'
                            )}
                          >
                            <Trash2 size={13} /> Remove Photo
                          </button>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Or paste direct image URL (https://...)"
                          value={formData.avatarUrl || ''}
                          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                          className={cn(
                            'w-full px-3 py-1.5 text-xs rounded border outline-none transition-colors',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identity Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        {isHeist ? 'Operative Code Name' : 'Profile Tag / Display Handle'}
                      </label>
                      <input
                        type="text"
                        value={formData.codeName || ''}
                        onChange={(e) => setFormData({ ...formData, codeName: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Primary Target Role
                      </label>
                      <input
                        type="text"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Secondary Role
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryRole || ''}
                        onChange={(e) => setFormData({ ...formData, secondaryRole: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Experience Benchmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4.0 years"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Location & Mobility
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, India (Open to Remote)"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded border outline-none transition-colors',
                          isHeist
                            ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                      Professional Summary / Bio
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Summary of domain expertise, technical leadership, and engineering achievements..."
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 rounded border outline-none transition-colors',
                        isHeist
                          ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                      )}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS & ARSENAL */}
              {activeTab === 'skills' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Add New Skill Card */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-3',
                      isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <h4 className={cn('font-semibold uppercase tracking-wider text-[11px]', isHeist ? 'text-crimson' : 'text-slate-900')}>
                      Add Verified Technical Competency
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] block mb-1 opacity-75">Skill / Technology Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rust, GraphQL, Kubernetes..."
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1 opacity-75">Candidate Score ({newSkillScore})</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.1"
                          value={newSkillScore}
                          onChange={(e) => setNewSkillScore(parseFloat(e.target.value))}
                          className="w-full accent-crimson cursor-pointer"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className={cn(
                            'w-full py-1.5 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                            isHeist
                              ? 'bg-crimson text-white hover:bg-crimson/80'
                              : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                          )}
                        >
                          <Plus size={14} /> Add Skill
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Skills List */}
                  <div className="space-y-3">
                    <h4 className={cn('font-semibold text-xs', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                      Active Verified Skills ({formData.skills?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {formData.skills?.map((skill: any, idx: number) => {
                        const isStrength = skill.gap >= 0
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
                              isHeist ? 'bg-obsidian/80 border-burgundy/20' : 'bg-white border-slate-200'
                            )}
                          >
                            <div className="flex-1 space-y-1 w-full sm:w-auto">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{skill.name}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'text-[10px] px-2 py-0.5 rounded font-semibold',
                                      isStrength
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-crimson/10 text-crimson border border-crimson/20'
                                    )}
                                  >
                                    {isStrength ? 'Strength (+Gap)' : `Deficit (${skill.gap})`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(idx)}
                                    className="text-slate-400 hover:text-crimson p-1 transition-colors cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-[11px] opacity-70 w-24">Score: <strong>{skill.score}</strong> / 10</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  step="0.1"
                                  value={skill.score}
                                  onChange={(e) => handleSkillScoreChange(idx, parseFloat(e.target.value))}
                                  className="flex-1 accent-crimson cursor-pointer"
                                />
                                <span className="text-[11px] opacity-50">Market: {skill.market}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS & BLUEPRINTS */}
              {activeTab === 'projects' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Add Project Card */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-3',
                      isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <h4 className={cn('font-semibold uppercase tracking-wider text-[11px]', isHeist ? 'text-crimson' : 'text-slate-900')}>
                      Add Verified Technical Project / Mission
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] block mb-1 opacity-75">Project Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Distributed Consensus Engine"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1 opacity-75">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Rust, Tokio, Raft, Docker"
                          value={newProjectTech}
                          onChange={(e) => setNewProjectTech(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1 opacity-75">Impact / Verification Metric</label>
                        <input
                          type="text"
                          placeholder="e.g. Handled 50K concurrent reqs with <10ms latency"
                          value={newProjectMetric}
                          onChange={(e) => setNewProjectMetric(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1 opacity-75">Repository / Live Link</label>
                        <input
                          type="text"
                          placeholder="github.com/rahul/project-repo"
                          value={newProjectLink}
                          onChange={(e) => setNewProjectLink(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className={cn(
                        'px-4 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer',
                        isHeist
                          ? 'bg-crimson text-white hover:bg-crimson/80'
                          : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                      )}
                    >
                      <Plus size={14} /> Add Project Entry
                    </button>
                  </div>

                  {/* Existing Projects List */}
                  <div className="space-y-3">
                    <h4 className={cn('font-semibold text-xs', isHeist ? 'text-warm-ivory' : 'text-slate-900')}>
                      Configured Projects ({formData.projects?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {formData.projects?.map((proj: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-3.5 rounded-lg border space-y-2',
                            isHeist ? 'bg-obsidian/80 border-burgundy/20' : 'bg-white border-slate-200'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs">{proj.title}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(idx)}
                              className="text-slate-400 hover:text-crimson p-1 transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {proj.tech?.map((t: string) => (
                              <span
                                key={t}
                                className={cn(
                                  'px-2 py-0.5 rounded text-[10px]',
                                  isHeist ? 'bg-burgundy/20 text-warm-ivory/80' : 'bg-slate-100 text-slate-700'
                                )}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-emerald-500 font-semibold text-[11px]">{proj.metric}</p>
                          {proj.link && (
                            <p className="text-[10px] opacity-60 flex items-center gap-1 font-mono">
                              <Globe size={11} /> {proj.link}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EDUCATION & CERTIFICATIONS */}
              {activeTab === 'education' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                  {/* Certifications Box */}
                  <div className="space-y-4">
                    <div
                      className={cn(
                        'p-4 rounded-lg border space-y-3',
                        isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <h4 className={cn('font-semibold uppercase tracking-wider text-[11px]', isHeist ? 'text-crimson' : 'text-slate-900')}>
                        Add Certification
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Certification Name (e.g. AWS Solutions Architect)"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Issuer (e.g. Amazon)"
                            value={newCertIssuer}
                            onChange={(e) => setNewCertIssuer(e.target.value)}
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          />
                          <input
                            type="text"
                            placeholder="Date (e.g. 2025-11)"
                            value={newCertDate}
                            onChange={(e) => setNewCertDate(e.target.value)}
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCert}
                        className={cn(
                          'w-full py-1.5 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                          isHeist
                            ? 'bg-crimson text-white hover:bg-crimson/80'
                            : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                        )}
                      >
                        <Plus size={13} /> Add Certification
                      </button>
                    </div>

                    {/* Cert List */}
                    <div className="space-y-2">
                      {formData.certifications?.map((cert: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-2.5 rounded border flex items-center justify-between',
                            isHeist ? 'bg-obsidian/80 border-burgundy/20' : 'bg-white border-slate-200'
                          )}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <Award size={13} className="text-muted-gold" /> {cert.name}
                            </div>
                            <p className="text-[10px] opacity-60 pl-5">
                              {cert.issuer} • {cert.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                              {cert.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(idx)}
                              className="text-slate-400 hover:text-crimson p-0.5 cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education Box */}
                  <div className="space-y-4">
                    <div
                      className={cn(
                        'p-4 rounded-lg border space-y-3',
                        isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <h4 className={cn('font-semibold uppercase tracking-wider text-[11px]', isHeist ? 'text-crimson' : 'text-slate-900')}>
                        Add Education Degree
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Degree (e.g. B.Tech Computer Science)"
                          value={newEduDegree}
                          onChange={(e) => setNewEduDegree(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                        <input
                          type="text"
                          placeholder="University / Institute"
                          value={newEduSchool}
                          onChange={(e) => setNewEduSchool(e.target.value)}
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Year (e.g. 2021)"
                            value={newEduYear}
                            onChange={(e) => setNewEduYear(e.target.value)}
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          />
                          <input
                            type="text"
                            placeholder="GPA (e.g. 8.5 / 10)"
                            value={newEduGpa}
                            onChange={(e) => setNewEduGpa(e.target.value)}
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddEdu}
                        className={cn(
                          'w-full py-1.5 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                          isHeist
                            ? 'bg-crimson text-white hover:bg-crimson/80'
                            : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                        )}
                      >
                        <Plus size={13} /> Add Education Record
                      </button>
                    </div>

                    {/* Education List */}
                    <div className="space-y-2">
                      {formData.education?.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-2.5 rounded border flex items-center justify-between',
                            isHeist ? 'bg-obsidian/80 border-burgundy/20' : 'bg-white border-slate-200'
                          )}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <GraduationCap size={14} className="text-crimson" /> {edu.degree}
                            </div>
                            <p className="text-[10px] opacity-60 pl-5">
                              {edu.school} {edu.year ? `• Class of ${edu.year}` : ''} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEdu(idx)}
                            className="text-slate-400 hover:text-crimson p-0.5 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: COMPENSATION & SOCIAL LINKS */}
              {activeTab === 'compensation' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                  {/* Compensation & Work Expectations */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-3.5',
                      isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <h4 className={cn('font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5', isHeist ? 'text-crimson' : 'text-slate-900')}>
                      <DollarSign size={13} /> Compensation & Offer Calibration
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          Current CTC / Base Compensation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹22 LPA or $95,000"
                          value={formData.compensation?.currentCtc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              compensation: {
                                ...(formData.compensation || { expectedCtc: '', noticePeriod: '', workPolicy: '' }),
                                currentCtc: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>

                      <div>
                        <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          Expected Target Compensation (CTC)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹34 - 40 LPA or $140,000"
                          value={formData.compensation?.expectedCtc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              compensation: {
                                ...(formData.compensation || { currentCtc: '', noticePeriod: '', workPolicy: '' }),
                                expectedCtc: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                            Notice Period
                          </label>
                          <select
                            value={formData.compensation?.noticePeriod || '30 Days'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                compensation: {
                                  ...(formData.compensation || { currentCtc: '', expectedCtc: '', workPolicy: '' }),
                                  noticePeriod: e.target.value,
                                },
                              })
                            }
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          >
                            <option value="Immediate">Immediate</option>
                            <option value="15 Days">15 Days</option>
                            <option value="30 Days">30 Days</option>
                            <option value="60 Days">60 Days</option>
                            <option value="90 Days">90 Days</option>
                          </select>
                        </div>

                        <div>
                          <label className={cn('block mb-1 font-semibold', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                            Work Modality
                          </label>
                          <select
                            value={formData.compensation?.workPolicy || 'Remote / Hybrid'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                compensation: {
                                  ...(formData.compensation || { currentCtc: '', expectedCtc: '', noticePeriod: '' }),
                                  workPolicy: e.target.value,
                                },
                              })
                            }
                            className={cn(
                              'w-full px-3 py-1.5 rounded border outline-none',
                              isHeist
                                ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                            )}
                          >
                            <option value="Remote / Hybrid">Remote / Hybrid</option>
                            <option value="Remote Only">Remote Only</option>
                            <option value="Hybrid Only">Hybrid Only</option>
                            <option value="On-Site">On-Site</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Social Presence */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border space-y-3.5',
                      isHeist ? 'bg-black/40 border-burgundy/30' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <h4 className={cn('font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5', isHeist ? 'text-crimson' : 'text-slate-900')}>
                      <Globe size={13} /> Verified Links & Code Profiles
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className={cn('block mb-1 font-semibold flex items-center gap-1', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          <Github size={12} /> GitHub Profile
                        </label>
                        <input
                          type="text"
                          placeholder="https://github.com/username"
                          value={formData.socialLinks?.github || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...(formData.socialLinks || { linkedin: '', website: '', leetcode: '' }),
                                github: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>

                      <div>
                        <label className={cn('block mb-1 font-semibold flex items-center gap-1', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          <Linkedin size={12} /> LinkedIn Profile
                        </label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/username"
                          value={formData.socialLinks?.linkedin || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...(formData.socialLinks || { github: '', website: '', leetcode: '' }),
                                linkedin: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>

                      <div>
                        <label className={cn('block mb-1 font-semibold flex items-center gap-1', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          <Globe size={12} /> Personal Portfolio / Tech Blog
                        </label>
                        <input
                          type="text"
                          placeholder="https://myportfolio.dev"
                          value={formData.socialLinks?.website || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...(formData.socialLinks || { github: '', linkedin: '', leetcode: '' }),
                                website: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>

                      <div>
                        <label className={cn('block mb-1 font-semibold flex items-center gap-1', isHeist ? 'text-warm-ivory/70' : 'text-slate-700')}>
                          <Code2 size={12} /> LeetCode / Coding Platform
                        </label>
                        <input
                          type="text"
                          placeholder="https://leetcode.com/username"
                          value={formData.socialLinks?.leetcode || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...(formData.socialLinks || { github: '', linkedin: '', website: '' }),
                                leetcode: e.target.value,
                              },
                            })
                          }
                          className={cn(
                            'w-full px-3 py-1.5 rounded border outline-none',
                            isHeist
                              ? 'bg-obsidian border-burgundy/30 text-warm-ivory focus:border-crimson'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={cn(
                'px-6 py-3.5 border-t flex items-center justify-between shrink-0',
                isHeist ? 'border-burgundy/30 bg-black/40' : 'border-slate-200 bg-slate-50'
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(JSON.parse(JSON.stringify(candidate)))}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer',
                    isHeist
                      ? 'text-warm-ivory/60 hover:text-warm-ivory bg-obsidian border border-burgundy/20'
                      : 'text-slate-600 hover:bg-slate-200 bg-slate-100 border border-slate-200'
                  )}
                >
                  <RefreshCw size={12} /> Reset to Defaults
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer',
                    isHeist
                      ? 'text-warm-ivory/70 hover:text-warm-ivory hover:bg-obsidian'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    'px-5 py-1.5 text-xs font-bold rounded shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50',
                    isHeist
                      ? 'bg-crimson hover:bg-crimson/80 text-white shadow-crimson/20 border border-crimson/50'
                      : 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-sm'
                  )}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-300" /> Saved & Synchronized
                    </>
                  ) : isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Synchronizing...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null
}
