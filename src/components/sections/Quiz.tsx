import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { quizData } from '../../data/mockData';
import { CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadLatestQuizResult, saveQuizResult, type StoredQuizResult } from '../../services/firebaseUserData';

interface QuizProps {
  questions?: typeof quizData;
}

export const Quiz: React.FC<QuizProps> = ({ questions = quizData }) => {
  const { markCompleted, completedSections } = useProgress();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [latestSavedResult, setLatestSavedResult] = useState<StoredQuizResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isFinished) {
      markCompleted('quiz');
    }
  }, [isFinished, markCompleted]);

  useEffect(() => {
    if (!user) {
      setLatestSavedResult(null);
      setSaveStatus(null);
      return;
    }

    let active = true;

    const loadStoredQuizResult = async () => {
      try {
        const result = await loadLatestQuizResult(user.uid);
        if (active) {
          setLatestSavedResult(result);
        }
      } catch (error) {
        console.error('Failed to load saved quiz result', error);
        if (active) {
          setSaveStatus('Unable to load your saved quiz result right now.');
        }
      }
    };

    void loadStoredQuizResult();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!isFinished || !user) {
      return;
    }

    const saveCurrentQuizResult = async () => {
      try {
        await saveQuizResult(user.uid, score, questions.length);
        setSaveStatus('Quiz result saved to your account.');
        setLatestSavedResult({
          score,
          totalQuestions: questions.length,
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save quiz result', error);
        setSaveStatus('Signed in, but unable to save this quiz result right now.');
      }
    };

    void saveCurrentQuizResult();
  }, [isFinished, user, score, questions.length]);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === questions[currentQ].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="page-section flex-col flex-center" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div className="panel" style={{ padding: '4rem 3rem', maxWidth: '600px', width: '100%', background: '#FFF' }}>
          <div style={{ padding: '1rem', background: 'var(--accent-success-bg)', color: 'var(--accent-success)', display: 'inline-block', marginBottom: '1.5rem', borderRadius: '50%' }}>
            <CheckCircle2 size={48} strokeWidth={2} />
          </div>
          <h2 style={{ color: 'var(--heading-slate)', marginBottom: '1rem' }}>Great job finishing the quiz!</h2>
          <div style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', margin: '2rem 0' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>Your Final Score</p>
            <p style={{ fontSize: '4rem', margin: 0, fontWeight: 700, color: 'var(--accent-primary)' }}>
              {score} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {questions.length}</span>
            </p>
          </div>
          <div className="flex-center gap-4">
            <button className="btn btn-secondary" type="button" onClick={handleRetry} style={{ border: 'none', background: 'var(--bg-primary)' }}>
              <RotateCcw size={18} /> Try Again
            </button>
          </div>
          {saveStatus && <p className="text-muted mt-4">{saveStatus}</p>}
        </div>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="page-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="flex-between mb-8" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Self-Check Quiz</h2>
          <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1.15rem' }}>A quick, friendly way to test what you've learned.</p>
          {latestSavedResult && (
            <p className="text-muted">
              Last saved score: {latestSavedResult.score}/{latestSavedResult.totalQuestions}
            </p>
          )}
        </div>
        {completedSections['quiz'] && (
          <div className="flex-center gap-2 text-success" style={{ background: 'var(--accent-success-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>Completed</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
            Score: {score}
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)' }}>
          <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div className="panel" style={{ padding: '3rem', background: '#FFF' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', color: 'var(--heading-slate)', lineHeight: '1.4' }}>{question.question}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {question.options.map((opt, idx) => {
            let bg = 'var(--bg-primary)';
            let border = '1px solid var(--border-light)';
            let color = 'var(--text-primary)';

            if (isAnswered) {
              if (idx === question.correctAnswer) {
                bg = 'var(--accent-success-bg)';
                border = '1px solid rgba(122, 154, 112, 0.4)';
                color = 'var(--accent-success)';
              } else if (idx === selectedOption) {
                bg = 'var(--accent-warning-bg)';
                border = '1px solid rgba(222, 154, 75, 0.4)';
                color = 'var(--accent-primary)';
              } else {
                color = 'var(--text-muted)';
                bg = 'var(--bg-primary)';
              }
            } else if (idx === selectedOption) {
              bg = 'var(--bg-secondary)';
              border = '1px solid var(--accent-secondary)';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                style={{
                  padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)',
                  background: bg, border, color,
                  textAlign: 'left', fontSize: '1.1rem', cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                disabled={isAnswered}
                className={!isAnswered ? 'panel-hoverable' : ''}
              >
                <div className="flex-between">
                  <span>{opt}</span>
                  {isAnswered && idx === question.correctAnswer && <CheckCircle2 size={24} />}
                </div>
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', animation: 'fadeIn 0.3s ease' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={20} /> Explanation
            </h4>
            <p className="text-primary" style={{ margin: 0, lineHeight: '1.6' }}>{question.explanation}</p>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" type="button" onClick={handleNext}>
                {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
