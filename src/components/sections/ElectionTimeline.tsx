import React, { useState } from 'react';
import { timelineData } from '../../data/mockData';
import { useProgress } from '../../context/ProgressContext';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import './Timeline.css';

export const ElectionTimeline: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const { markCompleted, completedSections } = useProgress();

  React.useEffect(() => {
    markCompleted('timeline');
  }, [markCompleted]);

  return (
    <div className="page-section">
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>How It Unfolds</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>An easy-to-follow sequence of standard election events.</p>
        </div>
        {completedSections['timeline'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div className="timeline-container">
        {timelineData.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className="timeline-item">
              <div className="timeline-marker">
                <div className={`timeline-dot ${index < 2 ? 'completed' : ''}`}>
                  {index < 2 && <CheckCircle2 size={16} color="var(--accent-success)" />}
                </div>
              </div>
              <div className="timeline-content">
                <div 
                  className={`panel timeline-panel ${isExpanded ? 'active' : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ margin: 0, padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)' }}
                >
                  <div className="flex-between" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                        PHASE {index + 1}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: isExpanded ? 'var(--heading-slate)' : 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="var(--accent-secondary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', animation: 'fadeIn 0.3s ease' }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0 }}>{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
