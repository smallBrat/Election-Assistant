import React, { createContext, useContext, useState, useEffect } from 'react';

type SectionKey = 'timeline' | 'guide' | 'registration' | 'documents' | 'checklist' | 'faq' | 'glossary' | 'chat' | 'quiz' | 'guided';

interface ProgressContextType {
  completedSections: Record<SectionKey, boolean>;
  markCompleted: (section: SectionKey) => void;
  progressPercentage: number;
}

const defaultContext: ProgressContextType = {
  completedSections: {
    timeline: false,
    guide: false,
    registration: false,
    documents: false,
    checklist: false,
    faq: false,
    glossary: false,
    chat: false,
    quiz: false,
    guided: false
  },
  markCompleted: () => {},
  progressPercentage: 0,
};

const ProgressContext = createContext<ProgressContextType>(defaultContext);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedSections, setCompletedSections] = useState<Record<SectionKey, boolean>>(() => {
    const saved = localStorage.getItem('electionEduProgress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved progress");
      }
    }
    return defaultContext.completedSections;
  });

  useEffect(() => {
    localStorage.setItem('electionEduProgress', JSON.stringify(completedSections));
  }, [completedSections]);

  const markCompleted = (section: SectionKey) => {
    setCompletedSections(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const totalSections = Object.keys(completedSections).length;
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalSections) * 100);

  return (
    <ProgressContext.Provider value={{ completedSections, markCompleted, progressPercentage }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
