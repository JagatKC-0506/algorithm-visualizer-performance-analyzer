import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Algorithm Visualizer
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
          Understand algorithms through interactive visualization, performance analysis, and detailed explanations.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/sorting')}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/sorting'); }}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\uD83D\uDCCA'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Sorting Algorithm Visualizer
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Visualize Bubble, Selection, Insertion, Merge, Quick, and Heap Sort with real-time animation, performance metrics, and complexity analysis.
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/graph')}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/graph'); }}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\uD83D\uDD0D'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Graph Algorithm Visualizer
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Explore BFS, DFS, and Dijkstra's algorithm on interactive graphs with step-by-step animation, queue/stack visualization, and performance analysis.
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/quiz')}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/quiz'); }}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\uD83E\uDDE9'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Algorithm Quiz
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Test your knowledge with interactive quizzes covering sorting and graph algorithms. 10 MCQs per topic with detailed explanations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
