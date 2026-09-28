import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Shield,
  Save,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
  DollarSign,
  Mail,
  Phone,
  RefreshCw,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

interface CompanyProfileProps {
  onNavigate?: (page: string) => void
}

interface CompanyData {
  name: string
  tagline: string
  logoUrl?: string
  industry: string
  size: string
  location: string
  website: string
  foundedYear: string
  workPolicy: 'Remote' | 'Hybrid' | 'On-Site'
  description: string
  techStack: string[]
  hiringRoles: string[]
  perks: string[]
  recruiterName: string
  recruiterTitle: string
  recruiterEmail: string
  recruiterPhone: string
  compensationPhilosophy: string
}

const STORAGE_KEY = 'lcdr_company_profile_data'

const DEFAULT_COMPANY_DATA: CompanyData = {
  name: 'TechCorp India',
  tagline: 'Architecting Next-Generation Distributed Cloud & Intelligence Systems',
  logoUrl: '',
  industry: 'Enterprise Software & Artificial Intelligence',
  size: '500 - 1,000 Employees',
  location: 'Bangalore, India // Hyderabad // Remote',
  website: 'https://techcorp.in',
  foundedYear: '2019',
  workPolicy: 'Hybrid',
  description:
    'TechCorp India is an enterprise technology powerhouse pioneering real-time cloud analytics, high-throughput distributed architectures, and generative AI copilot solutions for Global 2000 enterprises.',
  techStack: [
    'TypeScript',
    'React',
    'Node.js',
    'Go',
    'Python',
    'PostgreSQL',
    'Redis',
    'Kubernetes',
    'AWS',
    'Kafka',
    'PyTorch',
  ],
  hiringRoles: [
    'Senior Distributed Systems Engineer',
    'Staff AI/ML Infrastructure Architect',
    'Principal Full Stack Engineer (React/Node)',
    'DevOps & Platform Reliability Lead',
    'Engineering Manager // Data Intelligence',
  ],
  perks: [
    'Competitive Base + Equity (ESOPs)',
    'Comprehensive Family Medical Insurance',
    '₹1,50,000 Annual Learning & Conference Budget',
    'Flexible Hybrid & Work-from-Anywhere Sabbaticals',
    'Ergonomic Home Office Setup Stipend',
  ],
  recruiterName: 'Vikram Malhotra',
  recruiterTitle: 'Head of Technical Talent Acquisition',
  recruiterEmail: 'recruiter@techcorp.in',
  recruiterPhone: '+91 (080) 4892-3001',
  compensationPhilosophy: 'Top 85th Percentile Market Benchmark with Transparent Bands & Meritocracy',
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ onNavigate }) => {
  const { isHeist } = useTheme()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CompanyData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...DEFAULT_COMPANY_DATA, ...JSON.parse(saved) }
    } catch {
      // ignore
    }
    return DEFAULT_COMPANY_DATA
  })

  const [newSkill, setNewSkill] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newPerk, setNewPerk] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'culture' | 'recruiter'>('overview')

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo image size exceeds 2MB limit. Please upload a smaller image.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleReset = () => {
    if (window.confirm('Reset company details to default demo settings?')) {
      setFormData(DEFAULT_COMPANY_DATA)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANY_DATA))
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    }
  }

  const addTech = () => {
    if (newSkill.trim() && !formData.techStack.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeTech = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((s) => s !== item),
    }))
  }

  const addRole = () => {
    if (newRole.trim() && !formData.hiringRoles.includes(newRole.trim())) {
      setFormData((prev) => ({ ...prev, hiringRoles: [...prev.hiringRoles, newRole.trim()] }))
      setNewRole('')
    }
  }

  const removeRole = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      hiringRoles: prev.hiringRoles.filter((r) => r !== item),
    }))
  }

  const addPerk = () => {
    if (newPerk.trim() && !formData.perks.includes(newPerk.trim())) {
      setFormData((prev) => ({ ...prev, perks: [...prev.perks, newPerk.trim()] }))
      setNewPerk('')
    }
  }

  const removePerk = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.filter((p) => p !== item),
    }))
  }

  // ==========================================================================
  // ENTERPRISE VIEW
  // ==========================================================================
  if (!isHeist) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Company Profile & Recruitment Settings
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                Verified Enterprise Employer
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Manage your organization identity, technology requirements, hiring standards, and talent point-of-contact.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Reset
            </button>
            <button
              onClick={() => handleSave()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Save size={14} />}
              {savedSuccess ? 'Changes Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              {formData.logoUrl ? (
                <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative group">
                  <img src={formData.logoUrl} alt={formData.name} className="w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-semibold transition-opacity cursor-pointer"
                  >
                    <Camera size={14} className="mb-0.5" /> Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center justify-center font-bold text-xl tracking-wider shadow-inner shrink-0 relative group transition-colors cursor-pointer"
                  title="Click to upload company logo"
                >
                  <span>{formData.name.substring(0, 2).toUpperCase()}</span>
                  <span className="absolute bottom-1 text-[8px] text-slate-300 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity font-normal">
                    <Camera size={9} /> Upload
                  </span>
                </button>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{formData.name}</h2>
                <span className="text-[10px] uppercase font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {formData.workPolicy} Policy
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-xl">{formData.tagline}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-slate-400" /> {formData.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> {formData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} className="text-slate-400" /> {formData.size}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
            <a
              href={formData.website}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
            >
              <Globe size={12} /> Visit Portal <ExternalLink size={11} />
            </a>
            <span className="text-[11px] text-slate-400">
              Lead Recruiter: <strong className="text-slate-700">{formData.recruiterName}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-medium">
          {[
            { id: 'overview', label: 'Company Overview & Identity' },
            { id: 'tech', label: 'Tech Stack & Core Blueprints' },
            { id: 'culture', label: 'Culture, Benefits & Bands' },
            { id: 'recruiter', label: 'Recruiter Contact & Pipeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'pb-2.5 transition-colors relative',
                activeTab === tab.id
                  ? 'text-[#1E3A8A] font-semibold border-b-2 border-[#1E3A8A]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Organizational Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Tagline / Mission</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Company Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Headquarters & Hubs</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Work Policy</label>
                    <select
                      value={formData.workPolicy}
                      onChange={(e) => setFormData({ ...formData, workPolicy: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-Site">On-Site</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Enterprise Mission & Visual Identity
              </h3>
              <div className="space-y-3">
                {/* Logo Uploader / Visual Asset */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <label className="text-xs font-medium text-slate-700 block">Company Logo / Emblem</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon size={22} className="text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={12} /> Upload Logo File
                        </button>
                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste direct image URL (https://...)"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="w-full px-2.5 py-1 text-[11px] border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">About the Company</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Official Website</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Founded Year</label>
                    <input
                      type="text"
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Core Technical Ecosystem
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Candidate skill matching and AI Job Finder use these tags to calculate match percentages.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Rust, Kafka, PyTorch)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  onClick={addTech}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {formData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-md"
                  >
                    {tech}
                    <button
                      onClick={() => removeTech(tech)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Active Priority Hiring Requisitions
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target job blueprints published across La Casa De Rozgaar platform.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add role title (e.g. Senior Backend Architect)..."
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  onClick={addRole}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {formData.hiringRoles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  >
                    <span className="font-medium text-slate-800">{role}</span>
                    <button
                      onClick={() => removeRole(role)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'culture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Perks, Benefits & Engineering Culture
                </h3>
                <p className="text-[11px] text-slate-500">
                  Highlights displayed to high-caliber candidates during talent discovery.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add perk (e.g. ₹1.5L Learning Grant)..."
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  onClick={addPerk}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {formData.perks.map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  >
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Award size={13} className="text-blue-600 shrink-0" /> {perk}
                    </span>
                    <button
                      onClick={() => removePerk(perk)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Compensation Philosophy & Standards
                </h3>
                <p className="text-[11px] text-slate-500">
                  Salary benchmark parameters for algorithmic candidate offer calibration.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Philosophy Statement</label>
                  <textarea
                    rows={4}
                    value={formData.compensationPhilosophy}
                    onChange={(e) => setFormData({ ...formData, compensationPhilosophy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded text-xs text-blue-900 space-y-1">
                  <span className="font-semibold flex items-center gap-1">
                    <DollarSign size={13} /> Compensation Intelligence Benchmark
                  </span>
                  <p className="text-[11px] text-blue-800">
                    Your current postings are configured to align with 75th-90th percentile Bangalore/Hyderabad tech hubs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recruiter' && (
          <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4 max-w-2xl">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Talent Acquisition Lead Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Lead Recruiter Name</label>
                <input
                  type="text"
                  value={formData.recruiterName}
                  onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Official Designation</label>
                <input
                  type="text"
                  value={formData.recruiterTitle}
                  onChange={(e) => setFormData({ ...formData, recruiterTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.recruiterEmail}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={formData.recruiterPhone}
                  onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================================================================
  // HEIST / CLASSIFIED MODE VIEW
  // ==========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-warm-ivory uppercase tracking-wider font-mono">
              MASTERMIND SYNDICATE // ENTITY DOSSIER
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded">
              CLEARANCE LEVEL: TIER-1
            </span>
          </div>
          <p className="text-xs md:text-sm text-warm-ivory/60 mt-0.5 font-mono">
            Classified syndicate footprint, tech architecture blueprint, recruitment directives & operative leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-mono text-warm-ivory/70 hover:text-white bg-charcoal border border-white/10 hover:border-crimson/50 rounded transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> RESET
          </button>
          <button
            onClick={() => handleSave()}
            className="px-4 py-1.5 text-xs font-mono font-bold text-white bg-crimson hover:bg-crimson/80 border border-crimson/50 rounded shadow-lg shadow-crimson/20 transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Save size={14} />}
            {savedSuccess ? 'DOSSIER SYNCHRONIZED' : 'TRANSMIT DOSSIER'}
          </button>
        </div>
      </div>

      {/* Hero Syndicate Card */}
      <div className="p-6 bg-charcoal/80 backdrop-blur-md rounded-lg border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-crimson/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="relative group shrink-0">
            {formData.logoUrl ? (
              <div className="w-16 h-16 rounded bg-black/60 border border-crimson/40 overflow-hidden shadow-inner flex items-center justify-center relative group">
                <img src={formData.logoUrl} alt={formData.name} className="w-full h-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-mono font-bold text-crimson transition-opacity cursor-pointer"
                >
                  <Camera size={14} className="mb-0.5 text-crimson" /> CHANGE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded bg-black/60 border border-crimson/40 text-crimson hover:border-crimson hover:bg-black/80 flex flex-col items-center justify-center font-mono font-bold text-xl tracking-wider shadow-inner shrink-0 relative group transition-all cursor-pointer"
                title="Upload syndicate insignia/logo"
              >
                <span>{formData.name.substring(0, 2).toUpperCase()}</span>
                <span className="absolute bottom-1 text-[8px] text-warm-ivory/60 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity font-mono font-normal">
                  <Camera size={8} /> UPLOAD
                </span>
              </button>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-warm-ivory font-mono">{formData.name}</h2>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                POLICY: {formData.workPolicy.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-warm-ivory/70 max-w-xl font-mono">{formData.tagline}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-ivory/50 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Briefcase size={12} className="text-crimson" /> {formData.industry}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-crimson" /> {formData.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} className="text-crimson" /> {formData.size}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 font-mono">
          <a
            href={formData.website}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs text-warm-ivory bg-black/40 hover:bg-black/70 border border-white/10 rounded flex items-center gap-1 transition-colors"
          >
            <Globe size={12} className="text-crimson" /> SECURE LINK <ExternalLink size={11} />
          </a>
          <span className="text-[11px] text-warm-ivory/50">
            OPERATIVE LEAD: <strong className="text-emerald-400">{formData.recruiterName}</strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6 text-xs font-mono">
        {[
          { id: 'overview', label: '// 01. ENTITY OVERVIEW' },
          { id: 'tech', label: '// 02. TECH STACK BLUEPRINTS' },
          { id: 'culture', label: '// 03. PERKS & COMPENSATION' },
          { id: 'recruiter', label: '// 04. RECRUITMENT LEAD' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'pb-2.5 transition-colors relative',
              activeTab === tab.id
                ? 'text-crimson font-bold border-b-2 border-crimson'
                : 'text-warm-ivory/50 hover:text-warm-ivory'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-warm-ivory uppercase tracking-wider text-crimson">
              // Core Organization Blueprint
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Entity Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Tactical Mission</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Sector / Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Syndicate Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Headquarters Base</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Deployment Policy</label>
                  <select
                    value={formData.workPolicy}
                    onChange={(e) => setFormData({ ...formData, workPolicy: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-warm-ivory uppercase tracking-wider text-crimson">
              // Dossier Intel & Visual Insignia
            </h3>
            <div className="space-y-3">
              {/* Heist Logo Uploader */}
              <div className="p-3 bg-black/40 border border-white/10 rounded-lg space-y-2">
                <label className="text-[11px] text-warm-ivory/60 block font-mono">Syndicate Insignia / Brand Crest</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded bg-black/80 border border-crimson/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Insignia preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon size={22} className="text-warm-ivory/30" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-xs font-mono font-bold text-white bg-crimson hover:bg-crimson/80 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={12} /> UPLOAD LOGO
                      </button>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="px-2.5 py-1 text-xs font-mono text-warm-ivory/60 hover:text-crimson border border-white/10 hover:border-crimson/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> PURGE
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter direct image URL..."
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full px-2.5 py-1 text-[11px] font-mono bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Syndicate Dossier Summary</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Public Domain URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-warm-ivory/60 block mb-1">Founding Epoch</label>
                  <input
                    type="text"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tech' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
                // Classified Tech Arsenal
              </h3>
              <p className="text-[11px] text-warm-ivory/50">
                Operative competencies required for syndicate infiltration and matchmaking.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Arm capability (e.g. Go, Rust, PyTorch)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                className="flex-1 px-3 py-1.5 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
              <button
                onClick={addTech}
                className="px-3 py-1.5 text-xs font-bold text-white bg-crimson hover:bg-crimson/80 rounded transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> ARM
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-warm-ivory bg-black/40 border border-white/15 rounded"
                >
                  {tech}
                  <button
                    onClick={() => removeTech(tech)}
                    className="text-warm-ivory/40 hover:text-crimson transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
                // Active Operative Requisitions
              </h3>
              <p className="text-[11px] text-warm-ivory/50">
                Target high-value seats currently broadcasted to intelligence channels.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Arm target role (e.g. Lead Security Architect)..."
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                className="flex-1 px-3 py-1.5 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
              <button
                onClick={addRole}
                className="px-3 py-1.5 text-xs font-bold text-white bg-crimson hover:bg-crimson/80 rounded transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> BROADCAST
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {formData.hiringRoles.map((role) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded text-xs"
                >
                  <span className="font-mono text-warm-ivory">{role}</span>
                  <button
                    onClick={() => removeRole(role)}
                    className="text-warm-ivory/40 hover:text-crimson transition-colors p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'culture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
                // Bounty Perks & War Chest
              </h3>
              <p className="text-[11px] text-warm-ivory/50">
                Incentives and operational allowances allocated to top operatives.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add incentive (e.g. ₹1.5L Arsenal Grant)..."
                value={newPerk}
                onChange={(e) => setNewPerk(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                className="flex-1 px-3 py-1.5 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
              <button
                onClick={addPerk}
                className="px-3 py-1.5 text-xs font-bold text-white bg-crimson hover:bg-crimson/80 rounded transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> ALLOCATE
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {formData.perks.map((perk) => (
                <div
                  key={perk}
                  className="flex items-center justify-between p-2 bg-black/40 border border-white/10 rounded text-xs"
                >
                  <span className="text-warm-ivory/90 flex items-center gap-1.5">
                    <Award size={13} className="text-crimson shrink-0" /> {perk}
                  </span>
                  <button
                    onClick={() => removePerk(perk)}
                    className="text-warm-ivory/40 hover:text-crimson transition-colors p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
                // Compensation Vault Philosophy
              </h3>
              <p className="text-[11px] text-warm-ivory/50">
                Bounty bands and salary multipliers calibrated for Tier-1 recruits.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-warm-ivory/60 block mb-1">Vault Policy Memo</label>
                <textarea
                  rows={4}
                  value={formData.compensationPhilosophy}
                  onChange={(e) => setFormData({ ...formData, compensationPhilosophy: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="p-3 bg-crimson/10 border border-crimson/30 rounded text-xs text-warm-ivory space-y-1">
                <span className="font-bold text-crimson flex items-center gap-1">
                  <DollarSign size={13} /> LIVE BOUNTY MULTIPLIER ACTIVE
                </span>
                <p className="text-[11px] text-warm-ivory/70">
                  Calibrated to 85th-95th percentile against Bangalore & Hyderabad technical talent corridors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recruiter' && (
        <div className="p-5 bg-charcoal/70 rounded-lg border border-white/10 space-y-4 max-w-2xl font-mono">
          <h3 className="text-xs font-bold text-crimson uppercase tracking-wider">
            // Operative Dispatch & Contact Lead
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-warm-ivory/60 block mb-1">Recruiter Call Sign / Name</label>
              <input
                type="text"
                value={formData.recruiterName}
                onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-warm-ivory/60 block mb-1">Operational Rank / Title</label>
              <input
                type="text"
                value={formData.recruiterTitle}
                onChange={(e) => setFormData({ ...formData, recruiterTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-warm-ivory/60 block mb-1">Encrypted Dispatch Email</label>
              <input
                type="email"
                value={formData.recruiterEmail}
                onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-warm-ivory/60 block mb-1">Comms Frequency / Phone</label>
              <input
                type="text"
                value={formData.recruiterPhone}
                onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded text-warm-ivory focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
