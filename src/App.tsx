import { useState, useEffect } from 'react'
import { Sidebar, Header } from './components/Layout'
import { CommandPalette } from './components/CommandPalette'
import { NotificationCenter } from './components/NotificationCenter'
import { ThemeProvider, useTheme } from './hooks/useTheme'
import { ThemeTransitionOverlay } from './components/ThemeTransitionOverlay'
import { cn } from './lib/utils'

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
import { LoginPage } from './pages/LoginPage'
import { SharedDossierPage } from './pages/SharedDossierPage'
import { AuthProvider } from './hooks/useAuth'

export type PageType =
  | 'login'
  | 'war-room'
  | 'market-intelligence'
  | 'skill-intelligence'
  | 'role-intelligence'
  | 'compensation'
  | 'forecast'
  | 'candidate-dossier'
  | 'shared-dossier'
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

function AppContent() {
  const { isHeist } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Initialize from hash if present, e.g. #/job-finder or #/shared-dossier?id=123
  const getInitialPage = (): PageType => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '')
    const pageKey = rawHash.split('?')[0].replace('shared/dossier', 'shared-dossier')
    if (pageKey && isValidPage(pageKey)) {
      return pageKey as PageType
    }
    return 'war-room'
  }

  const isValidPage = (page: string): boolean => {
    const validPages: PageType[] = [
      'login',
      'war-room',
      'market-intelligence',
      'skill-intelligence',
      'role-intelligence',
      'compensation',
      'forecast',
      'candidate-dossier',
      'shared-dossier',
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
      const rawHash = window.location.hash.replace('#/', '').replace('#', '')
      const pageKey = rawHash.split('?')[0].replace('shared/dossier', 'shared-dossier')
      if (pageKey && isValidPage(pageKey)) {
        setCurrentPage(pageKey as PageType)
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
      case 'shared-dossier':
        return <SharedDossierPage onNavigate={handleNavigation} />
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
      case 'login':
        return <LoginPage onNavigate={handleNavigation} />
      case 'war-room':
      default:
        return <WarRoom onNavigate={handleNavigation} />
    }
  }

  // Full-screen presentation for Authentication Gateway — always dedicated Heist presentation
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen overflow-y-auto relative transition-colors duration-300 bg-obsidian text-warm-ivory classified-grid">
        <ThemeTransitionOverlay />
        <LoginPage onNavigate={handleNavigation} />
      </div>
    )
  }

  // Public / Shared Candidate Dossier presentation (Standalone with progressive access)
  if (currentPage === 'shared-dossier') {
    return (
      <div
        className={cn(
          'min-h-screen overflow-y-auto relative transition-colors duration-300',
          isHeist
            ? 'bg-obsidian text-warm-ivory classified-grid'
            : 'bg-[#F8FAFC] text-[#0F172A]'
        )}
      >
        <ThemeTransitionOverlay />
        <SharedDossierPage onNavigate={handleNavigation} />
      </div>
    )
  }

  // Full-screen presentation for Secure Assessment — proctored lockdown environment with all navigation removed
  if (currentPage === 'assessment') {
    return (
      <div
        className={cn(
          'min-h-screen overflow-y-auto relative transition-colors duration-300',
          isHeist
            ? 'bg-obsidian text-warm-ivory classified-grid'
            : 'bg-[#F8F9FA] text-[#0F172A]'
        )}
      >
        <ThemeTransitionOverlay />
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <SecureAssessment onNavigate={handleNavigation} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden relative transition-colors duration-300',
        isHeist
          ? 'bg-obsidian text-warm-ivory classified-grid'
          : 'bg-[#F8F9FA] text-[#0F172A]'
      )}
    >
      {/* Global Cinematic Theme Transition Overlay */}
      <ThemeTransitionOverlay />

      {/* Global Floating Dossier Field (Heist Mode signature) */}
      {isHeist && <FloatingDossierField />}

      {/* Sidebar with navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search, Mode Switcher & Notifications */}
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
            <div
              key={`${currentPage}-${isHeist ? 'heist' : 'pro'}`}
              className={isHeist ? 'page-enter-heist' : 'page-enter-professional'}
            >
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

