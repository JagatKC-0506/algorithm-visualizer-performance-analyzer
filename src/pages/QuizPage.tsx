import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { AlgorithmType, GraphAlgorithmType, QuizQuestion } from '../types';
import { SORTING_ALGORITHMS, GRAPH_ALGORITHMS, SORTING_QUIZZES, GRAPH_QUIZZES } from '../types/algorithms';
import BreadcrumbNav from '../components/common/BreadcrumbNav';
import ThemeToggle from '../components/common/ThemeToggle';
import Button from '../components/common/Button';

type Category = 'sorting' | 'graph';

const SORTING_KEYS: AlgorithmType[] = ['bubble', 'selection', 'insertion', 'quick', 'heap'];
const GRAPH_KEYS: GraphAlgorithmType[] = ['bfs', 'dfs', 'dijkstra'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestions(category: Category, algo: string): QuizQuestion[] {
  if (category === 'sorting') return SORTING_QUIZZES[algo] || [];
  return GRAPH_QUIZZES[algo] || [];
}

export default function QuizPage() {
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const selectCategory = (cat: Category) => {
    setCategory(cat);
    setSelectedAlgo(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setSubmitted(false);
  };

  const selectAlgorithm = (algo: string) => {
    const raw = getQuestions(category!, algo);
    const shuffled = shuffleArray(raw).slice(0, 10);
    setSelectedAlgo(algo);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setAnswers(Array(shuffled.length).fill(-1));
    setSubmitted(false);
  };

  const restart = () => {
    setCategory(null);
    setSelectedAlgo(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setSubmitted(false);
  };

  const handleAnswer = (qi: number, oi: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qi] = oi;
    setAnswers(newAnswers);
  };

  const submitQuiz = () => {
    setSubmitted(true);
  };

  const score = submitted
    ? answers.filter((a, i) => a === questions[i].correctIndex).length
    : 0;

  const algoName = useMemo(() => {
    if (!category || !selectedAlgo) return '';
    if (category === 'sorting') return SORTING_ALGORITHMS[selectedAlgo]?.name || selectedAlgo;
    return GRAPH_ALGORITHMS[selectedAlgo]?.name || selectedAlgo;
  }, [category, selectedAlgo]);

  if (restarting) {
    return null;
  }

  if (submitted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <BreadcrumbNav crumbs={[
              { label: 'Home', path: '/' },
              { label: 'Quiz', path: '/quiz' },
              { label: algoName, path: '/quiz' },
            ]} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Quiz Results</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>Back to Home</Link>
            <ThemeToggle />
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{algoName}</h2>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>{score}/{questions.length}</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{percentage}%</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={restart}>Choose Another Topic</Button>
            <Button variant="ghost" onClick={() => { setSubmitted(false); setAnswers(Array(questions.length).fill(-1)); setCurrentIdx(0); }}>Restart Quiz</Button>
            <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none', alignSelf: 'center' }}>Back to Home</Link>
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Detailed Review</h3>
          {questions.map((q, qi) => {
            const userAns = answers[qi];
            const isCorrect = userAns === q.correctIndex;
            return (
              <div key={qi} style={{
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
                background: 'var(--bg)',
              }}>
                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Q{qi + 1}. {q.question}</p>
                {q.options.map((opt, oi) => {
                  let bg = 'transparent';
                  let fw = 400;
                  if (oi === q.correctIndex) { bg = 'rgba(34,197,94,0.1)'; fw = 600; }
                  else if (oi === userAns && oi !== q.correctIndex) bg = 'rgba(239,68,68,0.1)';
                  return (
                    <div key={oi} style={{
                      padding: '0.375rem 0.75rem',
                      marginBottom: '0.25rem',
                      borderRadius: '0.25rem',
                      background: bg,
                      fontSize: '0.9rem',
                      fontWeight: fw,
                    }}>
                      {oi === q.correctIndex ? '\u2713 ' : oi === userAns && oi !== q.correctIndex ? '\u2717 ' : ''}
                      {opt}
                      {oi === q.correctIndex ? ' (Correct answer)' : ''}
                      {oi === userAns && oi !== q.correctIndex ? ' (Your answer)' : ''}
                    </div>
                  );
                })}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{q.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <BreadcrumbNav crumbs={[
            { label: 'Home', path: '/' },
            { label: 'Algorithm Quiz', path: '/quiz' },
            ...(selectedAlgo ? [{ label: algoName, path: '/quiz' }] : []),
          ]} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Algorithm Quiz</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>Back to Home</Link>
          <ThemeToggle />
        </div>
      </div>

      {!category && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => selectCategory('sorting')}
            onKeyDown={e => { if (e.key === 'Enter') selectCategory('sorting'); }}
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '1rem',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{'\uD83D\uDCCA'}</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Sorting Algorithms</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Bubble Sort, Insertion Sort, Quick Sort and more</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => selectCategory('graph')}
            onKeyDown={e => { if (e.key === 'Enter') selectCategory('graph'); }}
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '1rem',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{'\uD83D\uDD0D'}</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Graph Algorithms</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>BFS, DFS, Dijkstra's Algorithm</p>
          </div>
        </div>
      )}

      {category && !selectedAlgo && (
        <div>
          <Button variant="ghost" onClick={() => setCategory(null)} style={{ marginBottom: '1rem' }}>{'\u2190'} Back to categories</Button>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Choose a {category === 'sorting' ? 'sorting' : 'graph'} algorithm:
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(category === 'sorting' ? SORTING_KEYS : GRAPH_KEYS).map(key => {
              const name = category === 'sorting'
                ? (SORTING_ALGORITHMS[key as AlgorithmType]?.name || key)
                : (GRAPH_ALGORITHMS[key as GraphAlgorithmType]?.name || key);
              return (
                <button
                  key={key}
                  onClick={() => selectAlgorithm(key)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {category && selectedAlgo && questions.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Button variant="ghost" onClick={() => selectAlgorithm(selectedAlgo)}>{'\u2190'} Choose Different Topic</Button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Question {currentIdx + 1} of {questions.length}</span>
          </div>
          <div style={{
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            marginBottom: '1.5rem',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentIdx + 1) / questions.length) * 100}%`,
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {currentIdx + 1}. {questions[currentIdx].question}
            </p>
            {questions[currentIdx].options.map((opt, oi) => {
              let bg = 'var(--bg)';
              let borderColor = 'var(--border)';
              if (answers[currentIdx] === oi) {
                bg = 'rgba(59,130,246,0.1)';
                borderColor = 'var(--accent)';
              }
              return (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.5rem',
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${currentIdx}`}
                    checked={answers[currentIdx] === oi}
                    onChange={() => handleAnswer(currentIdx, oi)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
              disabled={currentIdx <= 0}
            >
              Previous
            </Button>
            {currentIdx < questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={submitQuiz} disabled={answers.some(a => a === -1)}>
                Submit Quiz
              </Button>
            )}
          </div>
          {currentIdx === questions.length - 1 && answers.some(a => a === -1) && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Answer all questions before submitting.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
