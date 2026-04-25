import { useState, useEffect, useRef } from 'react'
import { Navigation, type SectionKey } from './components/Navigation'
import { Menu } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useProgress } from './context/ProgressContext'
import { trackGuestModeUsed } from './services/analytics'
import {
  ensureUserDocument,
  getUserPreferences,
  getUserProgress,
  saveUserPreferences,
  saveUserProgress,
} from './services/firebaseUserData'
import type { SectionKey as ProgressSectionKey } from './context/ProgressContext'
import { PROGRESS_SAVE_DEBOUNCE_MS, VALID_SECTION_KEYS } from './constants/app'

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
import { UserStoragePanel } from './components/UserStoragePanel'

const disclaimerText = 'Election rules, deadlines, and required documents vary by country and region. Verify official information with your local election authority.';

const progressSectionKeys: ProgressSectionKey[] = (VALID_SECTION_KEYS as readonly string[]).filter(
  (key): key is ProgressSectionKey => key !== 'home'
) as ProgressSectionKey[];

const navigationSections: SectionKey[] = [
  'home',
  'guided',
  'timeline',
  'guide',
  'registration',
  'documents',
  'checklist',
  'faq',
  'glossary',
  'chat',
  'quiz',
];

function isNavigationSection(value: string): value is SectionKey {
  return navigationSections.includes(value as SectionKey);
}

function App() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('home');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [progressSyncMessage, setProgressSyncMessage] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState('guided');
  const hasHydratedRemoteProgress = useRef(false);
  const hasTrackedGuestModeRef = useRef(false);
  const progressSaveTimerRef = useRef<number | null>(null);
  const { user, loading: authLoading, isFirebaseEnabled, authError, signInWithGoogle, signOutUser } = useAuth();
  const { completedSections, progressPercentage, hydrateProgress } = useProgress();
  const visibleProgressSyncMessage = user ? progressSyncMessage : null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      hasTrackedGuestModeRef.current = false;
      return;
    }

    if (!hasTrackedGuestModeRef.current) {
      hasTrackedGuestModeRef.current = true;
      void trackGuestModeUsed();
    }
  }, [authLoading, user]);

  useEffect(() => {
    hasHydratedRemoteProgress.current = false;

    if (!user) {
      return;
    }

    let active = true;

    const hydrateFromFirestore = async () => {
      try {
        await ensureUserDocument(user);

        const [storedProgress, preferences] = await Promise.all([
          getUserProgress(user.uid),
          getUserPreferences(user.uid),
        ]);

        if (!active) {
          return;
        }

        if (storedProgress) {
          const hydratedSections: Partial<Record<ProgressSectionKey, boolean>> = {};
          for (const section of storedProgress.completedSections) {
            hydratedSections[section] = true;
          }

          hydrateProgress(hydratedSections);

          if (storedProgress.lastVisitedScreen && isNavigationSection(storedProgress.lastVisitedScreen)) {
            setCurrentSection(storedProgress.lastVisitedScreen);
          } else if (storedProgress.currentSection && isNavigationSection(storedProgress.currentSection)) {
            setCurrentSection(storedProgress.currentSection);
          }

          setProgressSyncMessage('Loaded your saved progress and restored your session.');
        } else {
          setProgressSyncMessage('Signed in. New progress will be saved automatically.');
        }

        if (preferences?.learningMode) {
          setLearningMode(preferences.learningMode);
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

    if (progressSaveTimerRef.current !== null) {
      window.clearTimeout(progressSaveTimerRef.current);
    }

    progressSaveTimerRef.current = window.setTimeout(async () => {
      const completedSectionIds = progressSectionKeys.filter((section) => completedSections[section]);
      try {
        await saveUserProgress(user.uid, {
          completedSections: completedSectionIds,
          currentSection,
          lastVisitedScreen: currentSection,
          progressPercent: progressPercentage,
        });
      } catch (error) {
        console.error('Failed to save progress to Firestore', error);
        setProgressSyncMessage('Signed in, but progress sync is temporarily unavailable.');
      }
    }, PROGRESS_SAVE_DEBOUNCE_MS);

    return () => {
      if (progressSaveTimerRef.current !== null) {
        window.clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, [user, completedSections, currentSection, progressPercentage]);

  useEffect(() => {
    if (!user || !hasHydratedRemoteProgress.current) {
      return;
    }

    const syncPreferences = async () => {
      try {
        await saveUserPreferences(user.uid, { learningMode, theme: 'system' });
      } catch (error) {
        console.error('Failed to save user preferences', error);
      }
    };

    void syncPreferences();
  }, [user, learningMode]);

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

            {visibleProgressSyncMessage && <p className="app-utility-subtext">{visibleProgressSyncMessage}</p>}
            {authError && <p className="app-utility-subtext app-utility-subtext--error">{authError}</p>}
            {!isFirebaseEnabled && <p className="app-utility-subtext">Firebase is not configured yet. Add VITE_FIREBASE_* variables to enable sign-in and cloud sync.</p>}
          </div>

          {user ? (
            <button className="btn btn-secondary app-auth-button" type="button" onClick={() => void signOutUser()}>
              Sign out
            </button>
          ) : isFirebaseEnabled ? (
            <button className="btn btn-accent app-auth-button" type="button" onClick={() => void signInWithGoogle()} disabled={authLoading}>
              {authLoading ? 'Loading...' : 'Sign in with Google'}
            </button>
          ) : (
            <button className="btn btn-secondary app-auth-button" type="button" disabled>
              Sign in unavailable
            </button>
          )}
        </div>

        {user && <UserStoragePanel />}

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
