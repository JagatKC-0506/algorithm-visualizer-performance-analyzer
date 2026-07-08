import { useMemo } from 'react';
import PanelWrapper from './PanelWrapper';

interface Props {
  queue: number[];
  currentNode: number;
}

export default function QueuePanel({ queue, currentNode }: Props) {
  const front = queue.length > 0 ? queue[0] : null;

  const items = useMemo(() => {
    return queue.map((n, i) => ({
      value: n,
      isFront: i === 0,
      isCurrent: n === currentNode && queue.length > 0,
    }));
  }, [queue, currentNode]);

  return (
    <PanelWrapper title="Queue Visualization" accent="#f59e0b">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '28px',
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  background: item.isFront
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(245,158,11,0.15)',
                  color: item.isFront ? '#ef4444' : '#f59e0b',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  border: item.isFront ? '2px solid #ef4444' : '2px solid transparent',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  animation: item.isFront ? 'pulse-node 1s ease-in-out infinite' : undefined,
                }}
              >
                {item.value}
                {item.isFront && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      fontSize: '0.6rem',
                      color: '#ef4444',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    FRONT
                  </span>
                )}
              </div>
            ))}
            {items.length > 1 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', marginLeft: '0.2rem' }}>
                ← front
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            empty
          </span>
        )}
        {currentNode >= 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Processing: <strong style={{ color: '#ef4444' }}>{currentNode}</strong>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
