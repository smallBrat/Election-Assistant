import { useState, useEffect } from 'react'
import { Navigation, type SectionKey } from './components/Navigation'
import { Menu } from 'lucide-react'

// Import all sections
import { Home } from './components/sections/Home'
import { GuidedLearning } from './components/sections/GuidedLearning'
import { ElectionTimeline } from './components/sections/ElectionTimeline'
import { StepByStepGuide } from './components/sections/StepByStepGuide'
import { VoterRegistration } from './components/sections/VoterRegistration'
import { RequiredDocuments } from './components/sections/RequiredDocuments'
import { ElectionDayChecklist } from './components/sections/ElectionDayChecklist'
import { FAQ } from './components/sections/FAQ'
import { Glossary } from './components/sections/Glossary'
import { ChatAssistant } from './components/sections/ChatAssistant'
import { Quiz } from './components/sections/Quiz'

function App() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('home');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'home': return <Home onNavigate={setCurrentSection} />;
      case 'guided': return <GuidedLearning />;
      case 'timeline': return <ElectionTimeline />;
      case 'guide': return <StepByStepGuide />;
      case 'registration': return <VoterRegistration />;
      case 'documents': return <RequiredDocuments />;
      case 'checklist': return <ElectionDayChecklist />;
      case 'faq': return <FAQ />;
      case 'glossary': return <Glossary />;
      case 'chat': return <ChatAssistant />;
      case 'quiz': return <Quiz />;
      default: return <div className="page-section"><h1>Not Found</h1></div>;
    }
  };

  return (
    <div className="app-container">
      <Navigation 
        currentSection={currentSection} 
        onNavigate={setCurrentSection} 
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="main-content" style={{ marginLeft: !isMobile ? '280px' : '0' }}>
        {isMobile && (
          <header className="flex-between mb-8" id="mobile-header">
            <button className="btn btn-secondary btn-icon" onClick={() => setMobileOpen(true)} aria-label="Open Menu">
              <Menu size={24} />
            </button>
            <h2 style={{ marginBottom: 0, fontSize: '1.25rem', color: 'var(--heading-slate)' }}>Election Assistant</h2>
          </header>
        )}
        {renderSection()}
      </main>
    </div>
  )
}

export default App
