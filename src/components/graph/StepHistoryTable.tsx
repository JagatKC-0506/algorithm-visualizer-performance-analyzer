import { useEffect, useRef } from 'react';
import type { GraphStep, GraphAlgorithmType } from '../../types';

interface Props {
  steps: GraphStep[];
  currentStep: number;
  algorithm: GraphAlgorithmType;
  onJumpToStep: (step: number) => void;
  hasStarted: boolean;
  playing: boolean;
}

export default function StepHistoryTable({ steps, currentStep, algorithm, onJumpToStep, hasStarted }: Props) {
  const activeRef = useRef<HTMLTableRowElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const row = activeRef.current;
      const container = scrollRef.current;
      const rowTop = row.offsetTop;
      const rowBottom = rowTop + row.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;
      if (rowTop < viewTop || rowBottom > viewBottom) {
        container.scrollTop = rowTop - container.clientHeight / 3;
      }
    }
  }, [currentStep]);

  if (!hasStarted || steps.length === 0) return null;

  const formatDistances = (distances: Map<number, number>): string => {
    return Array.from(distances.entries())
      .filter(([, d]) => d < Infinity)
      .map(([n, d]) => `${n}:${d}`)
      .join(', ');
  };

  const formatDataStructure = (step: GraphStep): string => {
    if (algorithm === 'bfs') return `[${step.queue.join(', ')}]`;
    if (algorithm === 'dfs') return `[${step.stack.join(', ')}]`;
    return `[${step.priorityQueue.map(e => `${e.node}(${e.dist})`).join(', ')}]`;
  };

  const dataStructureLabel = algorithm === 'bfs' ? 'Queue' : algorithm === 'dfs' ? 'Stack' : 'PQ';

  return (
    <div
      style={{
        marginTop: '1.25rem',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.6rem 1rem',
          background: 'var(--accent-alpha)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        Step History
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
          ({steps.length} steps)
        </span>
      </div>
      <div ref={scrollRef} style={{ maxHeight: '320px', overflowY: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>#</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>Node</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>{dataStructureLabel}</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>Visited</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>Distances</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, idx) => (
              <tr
                key={idx}
                ref={idx === currentStep ? activeRef : null}
                className={`step-table-row${idx === currentStep ? ' active' : ''}`}
                onClick={() => onJumpToStep(idx)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: idx === currentStep ? 'var(--accent-alpha)' : undefined,
                  transition: 'background 0.2s',
                }}
              >
                <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {idx}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {step.description}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', fontVariantNumeric: 'tabular-nums' }}>
                  {step.currentNode >= 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: step.phase === 'backtracking' ? 'rgba(168,130,255,0.3)' : step.currentNode === step.currentNode ? 'var(--accent-alpha)' : undefined,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: step.phase === 'backtracking' ? '#a882ff' : 'var(--accent)',
                      }}
                    >
                      {step.currentNode}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDataStructure(step)}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  [{step.visitedNodes.slice(-5).join(', ')}{step.visitedNodes.length > 5 ? '...' : ''}]
                </td>
                <td style={{ padding: '0.4rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDistances(step.distances) || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
