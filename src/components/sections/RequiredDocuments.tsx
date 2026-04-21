import React, { useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { CreditCard, Home, MapPin, CheckCircle2 } from 'lucide-react';

export const RequiredDocuments: React.FC = () => {
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    markCompleted('documents');
  }, [markCompleted]);

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>What to Bring</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>The common documents you might need when heading to the polls.</p>
        </div>
        {completedSections['documents'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="panel panel-hoverable" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: '#FFF' }}>
          <div className="flex-center" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <CreditCard size={28} style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--heading-slate)' }}>Photo ID</h3>
            <p className="text-primary" style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>The most common requirement. This usually means a government-issued ID like a Driver's License, Passport, or specialized Voter ID Card.</p>
          </div>
        </div>

        <div className="panel panel-hoverable" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: '#FFF' }}>
          <div className="flex-center" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <MapPin size={28} style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--heading-slate)' }}>Proof of Address</h3>
            <p className="text-primary" style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>If your standard ID doesn't have your current address, or if you're registering on the same day, you might need a recent utility bill or bank statement showing exactly where you live.</p>
          </div>
        </div>

        <div className="panel panel-hoverable" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: '#FFF' }}>
          <div className="flex-center" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <Home size={28} style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--heading-slate)' }}>Voter Information Card</h3>
            <p className="text-primary" style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>A card sent to you in the mail confirming you are registered. While not always legally required to vote, bringing it often makes looking you up at the polling station much faster.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
