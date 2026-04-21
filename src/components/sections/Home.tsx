import React from 'react';
import type { SectionKey } from '../Navigation';
import { BookOpen, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (section: SectionKey) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="page-section flex-col" style={{ maxWidth: '850px', margin: '0 auto', paddingTop: '3rem' }}>
      
      <div style={{ paddingBottom: '3rem', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFF', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Your Educational Civil Guide
          </span>
        </div>

        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: 'var(--heading-slate)' }}>
          Let’s understand the <span style={{ color: 'var(--accent-secondary)' }}>Election Process</span> together.
        </h1>

        <p className="text-secondary" style={{ fontSize: '1.25rem', lineHeight: '1.8', maxWidth: '700px', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Welcome to a friendly, accessible space to learn about your democratic rights. Whether you're a student or a first-time voter, we're here to help you feel confident about how elections work.
        </p>
        
        <div className="flex-center gap-4" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('guided')} style={{ padding: '0.85rem 2.25rem' }}>
            Start the Easy Guide
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('timeline')} style={{ padding: '0.85rem 2.25rem', background: '#FFF' }}>
            See How It Unfolds
          </button>
        </div>
      </div>

      <div className="notice-block panel-hoverable" style={{ background: '#FFF', alignItems: 'center', padding: '2rem' }}>
        <div style={{ background: 'var(--accent-success-bg)', padding: '1rem', borderRadius: 'var(--radius-full)', color: 'var(--accent-success)' }}>
          <BookOpen size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--heading-slate)' }}>A Safe Place to Learn</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
            This platform is entirely educational and non-partisan. We focus solely on helping you understand the steps to participate. Always check with your local electoral office for precise legal dates and rules in your region!
          </p>
        </div>
      </div>

    </div>
  );
};
