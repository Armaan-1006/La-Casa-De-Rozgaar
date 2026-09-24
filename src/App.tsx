import React, { useState } from 'react'
import { Sidebar, Header } from './components/Layout'
import { WarRoom } from './pages/WarRoom'
import { MarketIntelligence } from './pages/MarketIntelligence'
import { SkillIntelligence } from './pages/SkillIntelligence'
import { CandidateDossier } from './pages/CandidateDossier'
import { SkillHeist } from './pages/SkillHeist'
import { JobFinder } from './pages/JobFinder'
import { SimulationVault } from './pages/SimulationVault'
import { EmployerDashboard } from './pages/EmployerDashboard'

export type PageType =
  | 'war-room'
  | 'market-intelligence'
  | 'skill-intelligence'
  | 'candidate-dossier'
  | 'skill-heist'
  | 'job-finder'
  | 'simulation'
  | 'employer-dashboard'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>('war-room')

  const handleNavigation = (page: string) => {
    setCurrentPage(page as PageType)
    setSidebarOpen(false)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'market-intelligence':
        return <MarketIntelligence onNavigate={handleNavigation} />
      case 'skill-intelligence':
        return <SkillIntelligence onNavigate={handleNavigation} />
      case 'candidate-dossier':
        return <CandidateDossier onNavigate={handleNavigation} />
      case 'skill-heist':
        return <SkillHeist onNavigate={handleNavigation} />
      case 'job-finder':
        return <JobFinder onNavigate={handleNavigation} />
      case 'simulation':
        return <SimulationVault />
      case 'employer-dashboard':
        return <EmployerDashboard onNavigate={handleNavigation} />
      case 'war-room':
      default:
        return <WarRoom onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="flex h-screen bg-obsidian text-warm-ivory overflow-hidden">
      {/* Sidebar with navigation handler and active page tracking */}
      <SidebarWrapper
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with search & navigation */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onNavigate={handleNavigation}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div key={currentPage} className="page-enter">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Wrapper to inject navigation handler and active page
const SidebarWrapper: React.FC<{
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  currentPage: PageType
}> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      onNavigate={onNavigate}
      currentPage={currentPage}
    />
  )
}

export default App
