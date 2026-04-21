import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { 
  Home, BookOpen, Clock, ListOrdered, UserPlus, 
  FileText, CheckSquare, HelpCircle, BookA, MessageSquare, Award
} from 'lucide-react';
import './Navigation.css';

export type SectionKey = 
  | 'home'
  | 'guided'
  | 'timeline'
  | 'guide'
  | 'registration'
  | 'documents'
  | 'checklist'
  | 'faq'
  | 'glossary'
  | 'chat'
  | 'quiz';

interface NavigationProps {
  currentSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'guided', icon: BookOpen, label: 'Guided Learning' },
  { id: 'timeline', icon: Clock, label: 'Election Timeline' },
  { id: 'guide', icon: ListOrdered, label: 'Step-by-Step Guide' },
  { id: 'registration', icon: UserPlus, label: 'Voter Registration' },
  { id: 'documents', icon: FileText, label: 'Required Documents' },
  { id: 'checklist', icon: CheckSquare, label: 'Election Day Checklist' },
  { id: 'faq', icon: HelpCircle, label: 'FAQ' },
  { id: 'glossary', icon: BookA, label: 'Glossary' },
  { id: 'chat', icon: MessageSquare, label: 'Information Counter' },
  { id: 'quiz', icon: Award, label: 'Self-Check Quiz' },
] as const;

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate, isMobileOpen, setMobileOpen }) => {
  const { progressPercentage, completedSections } = useProgress();

  return (
    <>
      {isMobileOpen && (
        <div className="nav-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <nav className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Election Assistant</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
            <span className="progress-text">{progressPercentage}% Completed</span>
          </div>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Hacky mapping to check if it's completed in context
            const isCompleted = item.id !== 'home' && item.id !== 'guided' && item.id !== 'chat' && item.id !== 'quiz' 
              ? completedSections[item.id as keyof typeof completedSections] 
              : false;

            return (
              <li key={item.id}>
                <button
                  className={`nav-button ${currentSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id as SectionKey);
                    setMobileOpen(false);
                  }}
                >
                  <Icon size={20} className="nav-icon" />
                  <span>{item.label}</span>
                  {isCompleted && <div className="completed-dot" title="Completed" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
