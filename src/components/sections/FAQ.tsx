import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { faqData } from '../../data/mockData';
import { ChevronDown, ChevronUp, Search, CheckCircle2 } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { markCompleted, completedSections } = useProgress();

  useEffect(() => {
    markCompleted('faq');
  }, [markCompleted]);

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(search.toLowerCase()) || 
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Frequently Asked Questions</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>Clear answers to common questions about voting.</p>
        </div>
        {completedSections['faq'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search for a question..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', padding: '1rem 1rem 1rem 3.5rem', 
            borderRadius: 'var(--radius-full)', border: '1px solid var(--border-medium)',
            background: '#FFF', color: 'var(--text-primary)'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => {
          const isExpanded = expandedId === idx;
          return (
            <div 
              key={idx} 
              className="panel" 
              style={{ 
                cursor: 'pointer', 
                padding: '1.5rem', 
                background: isExpanded ? '#FFF' : 'var(--bg-secondary)',
                border: isExpanded ? '1px solid var(--border-medium)' : '1px solid var(--border-light)',
                boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setExpandedId(isExpanded ? null : idx)}
            >
              <div className="flex-between">
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: isExpanded ? 'var(--accent-secondary)' : 'var(--heading-slate)',     transition: 'color 0.2s ease' }}>
                  {faq.question}
                </h3>
                {isExpanded ? <ChevronUp size={20} color="var(--accent-secondary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>
              {isExpanded && (
                <div style={{ margin: '1.25rem 0 0 0', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', animation: 'fadeIn 0.3s ease' }}>
                  <p className="text-primary" style={{ margin: 0, lineHeight: '1.7' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          )
        }) : (
          <div className="text-center text-muted mt-8" style={{ padding: '3rem', background: '#FFF', borderRadius: 'var(--radius-md)' }}>
            <p>We couldn't find any questions matching your search. Try different keywords!</p>
          </div>
        )}
      </div>
    </div>
  );
};
