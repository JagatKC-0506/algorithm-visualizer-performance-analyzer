import { useState } from 'react';
import type { QuizQuestion } from '../../types';
import Button from './Button';

interface Props {
  questions: QuizQuestion[];
}

export default function Quiz({ questions }: Props) {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? answers.filter((a, i) => a === questions[i].correctIndex).length
    : 0;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Interactive Quiz</h3>
      {questions.map((q, qi) => (
        <div
          key={qi}
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--bg)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontWeight: 500, marginBottom: '0.75rem' }}>
            {qi + 1}. {q.question}
          </p>
          {q.options.map((opt, oi) => {
            let bg = 'var(--surface)';
            let borderColor = 'var(--border)';
            if (submitted) {
              if (oi === q.correctIndex) {
                bg = 'rgba(34, 197, 94, 0.1)';
                borderColor = '#22c55e';
              } else if (oi === answers[qi] && oi !== q.correctIndex) {
                bg = 'rgba(239, 68, 68, 0.1)';
                borderColor = '#ef4444';
              }
            } else if (oi === answers[qi]) {
              bg = 'rgba(59, 130, 246, 0.1)';
              borderColor = 'var(--accent)';
            }
            return (
              <label
                key={oi}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '0.375rem',
                  borderRadius: '0.375rem',
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  cursor: submitted ? 'default' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => {
                    if (!submitted) {
                      const newAnswers = [...answers];
                      newAnswers[qi] = oi;
                      setAnswers(newAnswers);
                    }
                  }}
                  disabled={submitted}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {opt}
              </label>
            );
          })}
          {submitted && answers[qi] !== -1 && answers[qi] !== q.correctIndex && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button onClick={() => setSubmitted(true)} disabled={submitted}>
          Submit Answers
        </Button>
        <Button
          variant="ghost"
          onClick={() => { setAnswers(Array(questions.length).fill(-1)); setSubmitted(false); }}
        >
          Reset
        </Button>
        {submitted && (
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            Score: {score}/{questions.length}
          </span>
        )}
      </div>
    </div>
  );
}
