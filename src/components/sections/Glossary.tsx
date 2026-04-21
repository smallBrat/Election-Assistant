import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { glossaryData } from '../../data/mockData';
import { Search, CheckCircle2, BookOpen } from 'lucide-react';

export const Glossary: React.FC = () => {
  const [search, setSearch] = useState('');
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    markCompleted('glossary');
  }, [markCompleted]);

  const filteredTerms = glossaryData.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Glossary of Terms</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>Simple definitions for common election words.</p>
        </div>
        {completedSections['glossary'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '3rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search for a term..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', padding: '1rem 1rem 1rem 3.5rem', 
            borderRadius: 'var(--radius-full)', border: '1px solid var(--border-medium)',
            background: '#FFF', color: 'var(--text-primary)'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredTerms.length > 0 ? filteredTerms.map((item, idx) => (
          <div key={idx} className="panel panel-hoverable" style={{ 
            display: 'flex', flexDirection: 'column',
            background: '#FFF'
          }}>
            <h3 style={{ color: 'var(--heading-slate)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="var(--accent-primary)" /> {item.term}
            </h3>
            <p className="text-primary" style={{ margin: 0, lineHeight: '1.6', flex: 1 }}>
              {item.definition}
            </p>
          </div>
        )) : (
          <div className="text-center text-muted" style={{ padding: '3rem', gridColumn: '1 / -1', background: '#FFF', borderRadius: 'var(--radius-md)' }}>
            <p>No definitions found. Try a different search term!</p>
          </div>
        )}
      </div>
    </div>
  );
};
