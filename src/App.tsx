import { useState, useEffect } from 'react'
import { Sidebar, Header } from './components/Layout'
import { CommandPalette } from './components/CommandPalette'
import { NotificationCenter } from './components/NotificationCenter'

import { WarRoom } from './pages/WarRoom'
import { MarketIntelligence } from './pages/MarketIntelligence'
import { SkillIntelligence } from './pages/SkillIntelligence'
import { RoleIntelligence } from './pages/RoleIntelligence'
import { CompensationIntelligence } from './pages/CompensationIntelligence'
import { FutureForecast } from './pages/FutureForecast'
import { CandidateDossier } from './pages/CandidateDossier'
import { SecureAssessment } from './pages/SecureAssessment'
import { SkillHeist } from './pages/SkillHeist'
import { JobFinder } from './pages/JobFinder'
import { CareerIntelligence } from './pages/CareerIntelligence'
import { SimulationVault } from './pages/SimulationVault'
import { EmployerDashboard } from './pages/EmployerDashboard'
import { TalentVault } from './pages/TalentVault'
import { WorkforceGaps } from './pages/WorkforceGaps'
import { ResistanceLearning } from './pages/ResistanceLearning'
import { InterviewIntelligence } from './pages/InterviewIntelligence'
import { ResearchIntelligence } from './pages/ResearchIntelligence'
import { IntelligenceFeed } from './pages/IntelligenceFeed'
import { FloatingDossierField } from './components/FloatingDossierField'

export type PageType =
  | 'war-room'
  | 'market-intelligence'
  | 'skill-intelligence'
  | 'role-intelligence'
  | 'compensation'
  | 'forecast'
  | 'candidate-dossier'
  | 'assessment'
  | 'skill-heist'
  | 'job-finder'
  | 'career-intelligence'
  | 'simulation'
  | 'employer-dashboard'
  | 'talent-vault'
  | 'workforce-gaps'
  | 'roadmap'
  | 'interviews'
  | 'research'
  | 'feed'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Initialize from hash if present, e.g. #/job-finder
  const getInitialPage = (): PageType => {
    const hash = window.location.hash.replace('#/', '')
    if (hash && isValidPage(hash)) {
      return hash as PageType
    }
    return 'war-room'
  }

  const isValidPage = (page: string): boolean => {
    const validPages: PageType[] = [
      'war-room',
      'market-intelligence',
      'skill-intelligence',
      'role-intelligence',
      'compensation',
      'forecast',
      'candidate-dossier',
      'assessment',
      'skill-heist',
      'job-finder',
      'career-intelligence',
      'simulation',
      'employer-dashboard',
      'talent-vault',
      'workforce-gaps',
      'roadmap',
      'interviews',
      'research',
      'feed',
    ]
    return validPages.includes(page as PageType)
  }

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage)

  const handleNavigation = (page: string) => {
    if (isValidPage(page)) {
      setCurrentPage(page as PageType)
      window.location.hash = `#/${page}`
    }
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Listen to hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '')
      if (hash && isValidPage(hash)) {
        setCurrentPage(hash as PageType)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Global keybinding for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'market-intelligence':
        return <MarketIntelligence onNavigate={handleNavigation} />
      case 'skill-intelligence':
        return <SkillIntelligence onNavigate={handleNavigation} />
      case 'role-intelligence':
        return <RoleIntelligence onNavigate={handleNavigation} />
      case 'compensation':
        return <CompensationIntelligence onNavigate={handleNavigation} />
      case 'forecast':
        return <FutureForecast onNavigate={handleNavigation} />
      case 'candidate-dossier':
        return <CandidateDossier onNavigate={handleNavigation} />
      case 'assessment':
        return <SecureAssessment onNavigate={handleNavigation} />
      case 'skill-heist':
        return <SkillHeist onNavigate={handleNavigation} />
      case 'job-finder':
        return <JobFinder onNavigate={handleNavigation} />
      case 'career-intelligence':
        return <CareerIntelligence onNavigate={handleNavigation} />
      case 'simulation':
        return <SimulationVault />
      case 'employer-dashboard':
        return <EmployerDashboard onNavigate={handleNavigation} />
      case 'talent-vault':
        return <TalentVault onNavigate={handleNavigation} />
      case 'workforce-gaps':
        return <WorkforceGaps onNavigate={handleNavigation} />
      case 'roadmap':
        return <ResistanceLearning onNavigate={handleNavigation} />
      case 'interviews':
        return <InterviewIntelligence onNavigate={handleNavigation} />
      case 'research':
        return <ResearchIntelligence onNavigate={handleNavigation} />
      case 'feed':
        return <IntelligenceFeed onNavigate={handleNavigation} />
      case 'war-room':
      default:
        return <WarRoom onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="flex h-screen bg-obsidian text-warm-ivory overflow-hidden relative classified-grid">
      {/* Global Floating Dossier Field */} 
      <FloatingDossierField />

      {/* Sidebar with navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search & Notifications */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onNavigate={handleNavigation}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          currentPage={currentPage}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div key={currentPage} className="page-enter">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigation}
      />

      {/* Global Intelligence Notifications Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={handleNavigation}
      />
    </div>
  )
}

export default App
