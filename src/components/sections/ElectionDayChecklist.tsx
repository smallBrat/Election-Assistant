import React, { useEffect, useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { CheckCircle2, Square, PenTool } from 'lucide-react';

const checklistItems = [
  "Look up where my polling station is.",
  "Check what time the polls open and close.",
  "Put my Photo ID in my wallet/bag.",
  "Grab any extra documents if I need them (like a utility bill).",
  "Figure out how I'll get to the polling station (drive, bus, walk).",
  "Review what's actually on the ballot so I'm prepared.",
  "Remind a friend to vote too!"
];

export const ElectionDayChecklist: React.FC = () => {
  const { markCompleted, completedSections } = useProgress();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    markCompleted('checklist');
  }, [markCompleted]);

  const toggleCheck = (idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const progress = Math.round((Object.values(checked).filter(Boolean).length / checklistItems.length) * 100) || 0;

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>My Election Day Checklist</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>Your personal readiness plan for the big day.</p>
        </div>
        {completedSections['checklist'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div className="panel" style={{ padding: '3rem', background: '#FFF' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="flex-center" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-full)' }}>
            <PenTool size={32} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Preparation Status</span>
              <span style={{ fontWeight: 700, color: progress === 100 ? 'var(--accent-success)' : 'var(--accent-secondary)' }}>{progress}% Ready</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--accent-success)' : 'var(--accent-secondary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease, background 0.4s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {checklistItems.map((item, idx) => {
            const isChecked = checked[idx];
            return (
              <div 
                key={idx} 
                onClick={() => toggleCheck(idx)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.25rem', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isChecked ? 'var(--accent-success-bg)' : 'var(--bg-secondary)',
                  border: isChecked ? '1px solid transparent' : '1px solid var(--border-light)'
                }}
              >
                {isChecked ? (
                  <CheckCircle2 size={28} style={{ color: 'var(--accent-success)', flexShrink: 0 }} strokeWidth={2} />
                ) : (
                  <Square size={28} style={{ color: 'var(--border-medium)', flexShrink: 0 }} strokeWidth={2} />
                )}
                <span style={{ 
                  fontSize: '1.1rem', 
                  color: isChecked ? 'var(--accent-success)' : 'var(--text-primary)',
                  fontWeight: isChecked ? 500 : 400,
                  transition: 'color 0.2s ease'
                }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
