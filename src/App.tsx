import { useState, useEffect, useRef } from 'react'
import { Navigation, type SectionKey } from './components/Navigation'
import { Menu } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useProgress } from './context/ProgressContext'
import { loadUserProgress, saveUserProgress } from './services/firebaseUserData'

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

const disclaimerText = 'Election rules, deadlines, and required documents vary by country and region. Verify official information with your local election authority.';

function App() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('home');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [progressSyncMessage, setProgressSyncMessage] = useState<string | null>(null);
  const hasHydratedRemoteProgress = useRef(false);
  const { user, loading: authLoading, isFirebaseEnabled, authError, signInWithGoogle, signOutUser } = useAuth();
  const { completedSections, progressPercentage, hydrateProgress } = useProgress();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    hasHydratedRemoteProgress.current = false;

    if (!user) {
      setProgressSyncMessage(null);
      return;
    }

    let active = true;

    const hydrateFromFirestore = async () => {
      try {
        const storedProgress = await loadUserProgress(user.uid);
        if (!active) {
          return;
        }

        if (storedProgress) {
          hydrateProgress(storedProgress);
          setProgressSyncMessage('Loaded your saved progress.');
        } else {
          setProgressSyncMessage('Signed in. New progress will be saved automatically.');
        }
      } catch (error) {
        console.error('Failed to load saved progress from Firestore', error);
        if (active) {
          setProgressSyncMessage('Unable to load saved progress right now.');
        }
      } finally {
        hasHydratedRemoteProgress.current = true;
      }
    };

    void hydrateFromFirestore();

    return () => {
      active = false;
    };
  }, [user, hydrateProgress]);

  useEffect(() => {
    if (!user || !hasHydratedRemoteProgress.current) {
      return;
    }

    const syncProgress = async () => {
      try {
        await saveUserProgress(user.uid, completedSections);
      } catch (error) {
        console.error('Failed to save progress to Firestore', error);
      }
    };

    void syncProgress();
  }, [user, completedSections]);

  const userLabel = user?.displayName || user?.email || 'Signed in user';

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
      <main className={`main-content ${!isMobile ? 'main-content--with-sidebar' : ''} ${currentSection === 'chat' ? 'main-content--chat-wide' : ''}`}>
        <div className="app-utility-bar">
          <div className="app-utility-meta">
            {user ? (
              <p className="app-utility-text">Signed in as <strong>{userLabel}</strong>{` • Progress ${progressPercentage}%`}</p>
            ) : (
              <p className="app-utility-text">Continue as guest, or sign in to save progress and quiz history.</p>
            )}

            {progressSyncMessage && <p className="app-utility-subtext">{progressSyncMessage}</p>}
            {authError && <p className="app-utility-subtext app-utility-subtext--error">{authError}</p>}
            {!isFirebaseEnabled && <p className="app-utility-subtext">Firebase is not configured yet. Add VITE_FIREBASE_* variables to enable sign-in and cloud sync.</p>}
          </div>

          {user ? (
            <button className="btn btn-secondary app-auth-button" type="button" onClick={() => void signOutUser()}>
              Sign out
            </button>
          ) : (
            <button className="btn btn-accent app-auth-button" type="button" onClick={() => void signInWithGoogle()} disabled={authLoading}>
              {authLoading ? 'Loading...' : 'Sign in with Google'}
            </button>
          )}
        </div>

        {isMobile && (
          <header className="flex-between mb-8" id="mobile-header">
            <button className="btn btn-secondary btn-icon" onClick={() => setMobileOpen(true)} aria-label="Open Menu">
              <Menu size={24} />
            </button>
            <h2 className="app-title">Election Assistant</h2>
          </header>
        )}
        {currentSection !== 'chat' && (
          <div className="notice-block notice-info app-disclaimer" role="note">
            <p className="app-disclaimer__text">{disclaimerText}</p>
          </div>
        )}
        {renderSection()}
      </main>
    </div>
  )
}

export default App
