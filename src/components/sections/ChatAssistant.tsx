import React, { useEffect, useState } from 'react';
import { CheckCircle2, Headphones, LoaderCircle, Send, ShieldAlert, Sparkles, User, AlertTriangle } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { askElectionAssistant, type AssistantApiSuccessResponse, type AssistantHistoryMessage } from '../../services/assistant';
import { getFallbackAssistantReply } from '../../services/assistantFallback';
import './ChatAssistant.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

type AssistantService = (message: string, history?: AssistantHistoryMessage[]) => Promise<AssistantApiSuccessResponse | string>;

export interface ChatAssistantProps {
  assistantService?: AssistantService;
}

const disclaimerText = 'Election rules, deadlines, and required documents vary by country and region. Verify official information with your local election authority.';

const suggestedPrompts = [
  'Explain voter registration simply',
  'What happens on election day?',
  'What documents do I need?',
  'Explain the election process step by step',
];

function normalizeAssistantReply(reply: AssistantApiSuccessResponse | string): string {
  if (typeof reply === 'string') {
    return reply.trim();
  }

  return reply.text.trim();
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ assistantService = askElectionAssistant }) => {
  const { markCompleted, completedSections } = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: "Hi there! I'm your friendly civic guide. What's on your mind regarding the election process today?" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    markCompleted('chat');
  }, [markCompleted]);

  const toHistory = (items: ChatMessage[]): AssistantHistoryMessage[] => (
    items.map((item) => ({
      role: item.sender,
      content: item.text,
    }))
  );

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending) return;

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, sender: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);
    setErrorMessage(null);

    try {
      const assistantReply = await assistantService(trimmedInput, toHistory(messages));
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-assistant`,
        sender: 'assistant',
        text: normalizeAssistantReply(assistantReply),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const fallbackReply = getFallbackAssistantReply(trimmedInput);
      setMessages((prev) => [...prev, {
        id: `${Date.now()}-assistant-fallback`,
        sender: 'assistant',
        text: fallbackReply,
      }]);
      setErrorMessage('The assistant is temporarily unavailable, so a local educational fallback was used.');
      console.error('Failed to fetch Vertex AI assistant response', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="page-section chat-page">
      <div className="flex-between chat-header">
        <div>
          <div className="chat-header__eyebrow">
            <Sparkles size={18} />
            <span className="chat-header__eyebrow-text">Gemini-powered assistant</span>
          </div>
          <h2 className="chat-header__title">Ask the Assistant</h2>
          <p className="text-secondary chat-header__subtitle">Ask your questions and get simple, neutral answers about the election process.</p>
        </div>
        {completedSections['chat'] && (
          <div className="chat-completed text-success">
            <CheckCircle2 size={24} /> <span className="chat-completed__text">Completed</span>
          </div>
        )}
      </div>

      <div className="notice-block notice-info chat-disclaimer" role="note">
        <ShieldAlert size={20} aria-hidden="true" />
        <p className="chat-disclaimer__text">{disclaimerText}</p>
      </div>

      {errorMessage && (
        <div className="notice-block notice-warning chat-error" role="status" aria-live="polite">
          <AlertTriangle size={20} aria-hidden="true" />
          <p className="chat-error__text">{errorMessage}</p>
        </div>
      )}

      <div className="panel chat-shell">
        <div aria-live="polite" aria-relevant="additions text" className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'chat-message--user' : ''}`}>
              <div className={`chat-avatar ${msg.sender === 'user' ? 'chat-avatar--user' : 'chat-avatar--assistant'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Headphones size={20} />}
              </div>
              <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}>
                <p className="chat-message__text">{msg.text}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="chat-message chat-sending" aria-hidden="true">
              <div className="chat-avatar chat-avatar--thinking">
                <LoaderCircle size={20} className="spin" />
              </div>
              <div className="chat-bubble chat-bubble--thinking">
                <p className="chat-thinking__text">Thinking about your question...</p>
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <div className="chat-prompts">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="btn btn-secondary chat-prompt"
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
          >
            <label htmlFor="assistant-question" className="chat-label">
              Ask the assistant a civic education question
            </label>
            <input
              id="assistant-question"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about voting, timelines, or documents..."
              className="chat-input"
              aria-describedby="assistant-help"
              disabled={isSending}
            />
            <button className="btn btn-primary chat-submit" type="submit" disabled={isSending || !inputValue.trim()}>
              {isSending ? <LoaderCircle size={18} className="spin" /> : <Send size={18} />}
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
          <p id="assistant-help" className="text-muted chat-help">
            Ask about registration, election timelines, required documents, or what happens on voting day.
          </p>
        </div>
      </div>
    </div>
  );
};
