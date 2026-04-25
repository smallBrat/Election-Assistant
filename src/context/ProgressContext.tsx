/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { trackSectionCompleted } from '../services/analytics';
import { calculateProgressPercentage } from '../utils/helpers';

export type SectionKey = 'timeline' | 'guide' | 'registration' | 'documents' | 'checklist' | 'faq' | 'glossary' | 'chat' | 'quiz' | 'guided';

interface ProgressContextType {
  completedSections: Record<SectionKey, boolean>;
  markCompleted: (section: SectionKey) => void;
  hydrateProgress: (sections: Partial<Record<SectionKey, boolean>>) => void;
  progressPercentage: number;
}

// Context default value
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
  hydrateProgress: () => {},
  progressPercentage: 0,
};

const ProgressContext = createContext<ProgressContextType>(defaultContext);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedSections, setCompletedSections] = useState<Record<SectionKey, boolean>>(() => {
    const saved = localStorage.getItem('electionEduProgress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.error("Failed to parse saved progress");
      }
    }
    return defaultContext.completedSections;
  });

  useEffect(() => {
    localStorage.setItem('electionEduProgress', JSON.stringify(completedSections));
  }, [completedSections]);

  const markCompleted = useCallback((section: SectionKey) => {
    setCompletedSections(prev => {
      if (prev[section]) {
        return prev;
      }

      const next = {
        ...prev,
        [section]: true,
      };

      const totalSections = Object.keys(next).length;
      const completedCount = Object.values(next).filter(Boolean).length;
      const progressPercent = calculateProgressPercentage(completedCount, totalSections);
      void trackSectionCompleted(section, progressPercent);

      return next;
    });
  }, []);

  const hydrateProgress = useCallback((sections: Partial<Record<SectionKey, boolean>>) => {
    setCompletedSections((prev) => ({
      ...prev,
      ...sections,
    }));
  }, []);

  const totalSections = Object.keys(completedSections).length;
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalSections) * 100);
  const contextValue = useMemo(() => ({
    completedSections,
    markCompleted,
    hydrateProgress,
    progressPercentage,
  }), [completedSections, markCompleted, hydrateProgress, progressPercentage]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
