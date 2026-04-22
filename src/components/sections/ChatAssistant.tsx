import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Send, User, Headphones, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { askElectionAssistant, type AssistantHistoryMessage } from '../../services/assistant';
import { getFallbackAssistantReply } from '../../services/assistantFallback';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export interface ChatAssistantProps {
  assistantService?: typeof askElectionAssistant;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ assistantService = askElectionAssistant }) => {
  const { markCompleted, completedSections } = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: "Hi there! I'm your friendly civic guide. What's on your mind regarding the election process today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    markCompleted('chat');
  }, [markCompleted]);

  const toHistory = (items: ChatMessage[]): AssistantHistoryMessage[] => (
    items.map((item) => ({
      role: item.sender === 'assistant' ? 'model' : 'user',
      text: item.text,
    }))
  );

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending) return;

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);
    setErrorMessage(null);

    try {
      const assistantReply = await assistantService(trimmedInput, toHistory([...messages, userMsg]));
      const assistantMsg: ChatMessage = { id: `${Date.now()}-assistant`, sender: 'assistant', text: assistantReply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const fallbackReply = getFallbackAssistantReply(trimmedInput);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-assistant-fallback`,
        sender: 'assistant',
        text: fallbackReply,
      }]);
      setErrorMessage('Gemini is temporarily unavailable, so a local educational fallback was used.');
      console.error('Failed to fetch Gemini assistant response', error);
    } finally {
      setIsSending(false);
    }
  };

  const suggestedPrompts = [
    'Explain the election process simply',
    'What happens before election day?',
    'How does voter registration work?',
    'What should I carry to vote?'
  ];

  return (
    <div className="page-section" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gemini-powered assistant</span>
          </div>
          <h2 style={{ margin: 0 }}>Ask the Assistant</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>Ask your questions and get simple, neutral answers about the election process.</p>
        </div>
        {completedSections['chat'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="notice-block notice-warning" role="status" aria-live="polite" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={20} aria-hidden="true" />
          <p style={{ margin: 0, lineHeight: '1.6' }}>{errorMessage}</p>
        </div>
      )}

      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: '#FFF' }}>
        <div aria-live="polite" aria-relevant="additions text" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-primary)' }}>
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
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: '#FFF' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
            style={{ display: 'flex', gap: '0.75rem' }}
          >
            <label htmlFor="assistant-question" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
              Ask the assistant a civic education question
            </label>
            <input
              id="assistant-question"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about voting, timelines, or documents..."
              style={{
                flex: 1, borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)'
              }}
              aria-describedby="assistant-help"
              disabled={isSending}
            />
            <button className="btn btn-primary" type="submit" disabled={isSending || !inputValue.trim()} style={{ width: '96px', height: '48px', padding: 0, borderRadius: 'var(--radius-full)' }}>
              <Send size={18} />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
          <p id="assistant-help" className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.95rem' }}>
            Ask about registration, election timelines, required documents, or what happens on voting day.
          </p>
        </div>
      </div>
    </div>
  );
};
