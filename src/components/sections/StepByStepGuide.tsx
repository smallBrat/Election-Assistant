import React, { useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  { title: "Check eligibility", desc: "Ensure you meet age and citizenship requirements in your region so you know you're clear to participate." },
  { title: "Register to vote", desc: "Submit your details to the electoral authority before the deadline. It's usually a quick online or paper form." },
  { title: "Verify voter details", desc: "Double-check your name on the electoral roll to avoid any surprises on election day." },
  { title: "Find polling location", desc: "Look up your assigned polling station ahead of time so you know exactly where to go." },
  { title: "Carry required documents", desc: "Bring a valid ID or specific voter card as required by your local election rules." },
  { title: "Vote at polling booth", desc: "Go to your station, verify your identity, and mark your ballot in private." },
  { title: "Confirm submission", desc: "Drop your ballot in the box or ensure the digital machine records it with a beep or light." },
  { title: "Wait for results", desc: "Follow the news or official channels as votes are legally and fairly counted." }
];

export const StepByStepGuide: React.FC = () => {
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    markCompleted('guide');
  }, [markCompleted]);

  return (
    <div className="page-section">
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Step-by-Step Guide</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>A simple, friendly breakdown of the entire voting process.</p>
        </div>
        {completedSections['guide'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {steps.map((step, idx) => (
          <div key={idx} className="panel panel-hoverable" style={{ display: 'flex', flexDirection: 'column', background: '#FFF' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'var(--bg-secondary)',
              color: 'var(--accent-secondary)', 
              fontWeight: 700,
              fontSize: '1rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--radius-full)'
            }}>
              {idx + 1}
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', color: 'var(--heading-slate)' }}>{step.title}</h3>
            <p className="text-muted" style={{ fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
