import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { chatAssistantResponses } from '../../data/mockData';
import { Send, User, Headphones, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const ChatAssistant: React.FC = () => {
  const { markCompleted, completedSections } = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: "Hi there! I'm your friendly civic guide. What's on your mind regarding the election process today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markCompleted('chat');
  }, [markCompleted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    
    const query = inputValue.toLowerCase().trim();
    setInputValue('');

    setTimeout(() => {
      let responseText = chatAssistantResponses['default'];
      for (const [key, val] of Object.entries(chatAssistantResponses)) {
        if (query.includes(key)) {
          responseText = val;
          break;
        }
      }
      
      const assistantMsg: ChatMessage = { id: Date.now().toString(), sender: 'assistant', text: responseText };
      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  const suggestedPrompts = [
    "Explain the election process simply",
    "What happens before election day?",
    "How does voter registration work?",
    "What should I carry to vote?"
  ];

  return (
    <div className="page-section" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Support Desk</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>Ask your questions and get simple answers.</p>
        </div>
        {completedSections['chat'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: '#FFF' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-primary)' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '1.25rem', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
              <div className="flex-center" style={{ 
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-secondary)', 
                color: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.sender === 'user' ? <User size={20} /> : <Headphones size={20} />}
              </div>
              <div style={{ 
                background: msg.sender === 'user' ? 'var(--accent-primary)' : '#FFF',
                color: msg.sender === 'user' ? '#FFF' : 'var(--text-primary)',
                padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', 
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-light)',
                maxWidth: '80%',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ margin: 0, lineHeight: '1.6' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: '#FFF' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {suggestedPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              style={{ 
                flex: 1, borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)'
              }}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!inputValue.trim()} style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%' }}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
