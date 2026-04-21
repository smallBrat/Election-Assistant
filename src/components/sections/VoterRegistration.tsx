import React, { useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';

export const VoterRegistration: React.FC = () => {
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    markCompleted('registration');
  }, [markCompleted]);

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Registering to Vote</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>How to officially join the voter roll so you can cast your ballot.</p>
        </div>
        {completedSections['registration'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div className="panel mb-6" style={{ background: '#FFF' }}>
        <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} /> Why Register?
        </h3>
        <p className="text-primary" style={{ marginBottom: '0', fontSize: '1.1rem' }}>
          Registration is how the government ensures you are eligible to vote. You usually cannot vote unless you have successfully registered beforehand. Once you register, your name goes on the "electoral roll" (the official list of voters).
        </p>
      </div>

      <div className="panel mb-6" style={{ background: 'var(--bg-secondary)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--heading-slate)' }}>The General Process</h3>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
          <li><strong>Check your local rules:</strong> Make sure you meet the age and citizen requirements for your state or country.</li>
          <li><strong>Gather documents:</strong> You will usually need a basic form of ID (like a license or passport) and proof of where you live.</li>
          <li><strong>Apply:</strong> Submit your details online through an official portal, or drop off a paper form at a local office.</li>
          <li><strong>Confirmation:</strong> Once approved, you might receive a voter card in the mail, or a simple online confirmation.</li>
        </ul>
      </div>

      <div className="notice-block notice-warning mt-4">
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-warning)', fontSize: '1.15rem' }}>Helpful Tip for Movers</h4>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            If you move to a new city or state, you almost always need to update your registration or re-register. Do not assume your registration follows you automatically!
          </p>
        </div>
      </div>

      <div className="notice-block" style={{ marginTop: '1.5rem', border: 'none', background: 'transparent', padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <Info size={24} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '1rem', margin: 0 }}>
              Friendly reminder: Every region is slightly different. The timeframe to register ranges from months in advance to even on election day in some places. Check your local official government website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
