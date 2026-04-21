import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  { title: 'What is an election?', content: 'An election is how citizens choose their leaders or decide on important issues. It is the foundation of a democratic society, giving you a voice in how your community is run.' },
  { title: 'Who can vote?', content: 'Generally, citizens of a certain age (often 18) can vote. Some regions have additional residency or registration requirements. The goal is to ensure community members have a say.' },
  { title: 'How registration works', content: 'Before you can vote, you must register. This means adding your name to the official voter list (electoral roll) so authorities can verify your eligibility smoothly on voting day.' },
  { title: 'The election timeline', content: 'Elections follow a steady timeline: Announcement, Registration Deadline, Campaigning, Voting Day, and finally Counting and Results. You have plenty of time to prepare!' },
  { title: 'Voting day', content: 'On voting day, you visit a designated polling station, verify your identity, and cast your ballot in secret in a private voting booth.' },
  { title: 'After voting', content: 'Once polls close, votes are securely transported and counted by officials. Results are then announced to the public, deciding the outcome of the election.' },
  { title: 'Final Review', content: 'You are now familiar with the basics! Review the timeline, checklists, and FAQs to feel fully prepared for the next election.' },
];

export const GuidedLearning: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      markCompleted('guided');
    }
  }, [currentStep, markCompleted]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <h2 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>The Easy Guide</h2>
        {completedSections['guided'] && (
          <div className="flex-center gap-2 text-success">
            <CheckCircle2 size={24} />
          </div>
        )}
      </div>

      <div className="mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Lesson {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)' }}>
          <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div className="panel" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', padding: '3.5rem 3rem', background: '#FFF' }}>
        <h3 style={{ marginBottom: '2rem', fontSize: '2rem', color: 'var(--heading-slate)' }}>
          {steps[currentStep].title}
        </h3>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', flex: 1, lineHeight: '1.9' }}>
          {steps[currentStep].content}
        </p>
        
        <div className="flex-between mt-8" style={{ paddingTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
              <CheckCircle2 size={20} /> <span style={{ fontWeight: 600, fontSize: '1rem' }}>Guide Completed!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
