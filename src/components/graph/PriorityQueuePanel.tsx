import PanelWrapper from './PanelWrapper';

interface Props {
  priorityQueue: { node: number; dist: number }[];
  currentNode: number;
}

export default function PriorityQueuePanel({ priorityQueue, currentNode }: Props) {
  return (
    <PanelWrapper title="Priority Queue (Min-Heap)" accent="#10b981">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {priorityQueue.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {priorityQueue.map((entry, i) => {
                const isMin = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      minWidth: '32px',
                      height: '28px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      background: isMin
                        ? 'rgba(239,68,68,0.2)'
                        : 'rgba(16,185,129,0.15)',
                      color: isMin ? '#ef4444' : '#10b981',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      border: isMin ? '2px solid #ef4444' : '2px solid transparent',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span>{entry.node}</span>
                    <span style={{ color: isMin ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.5)', fontSize: '0.65rem' }}>
                      ({entry.dist})
                    </span>
                    {isMin && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-14px',
                          fontSize: '0.55rem',
                          color: '#ef4444',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        MIN
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {priorityQueue.length > 1 && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                Sorted by distance (ascending)
              </div>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            empty
          </span>
        )}
        {currentNode >= 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Extracted: <strong style={{ color: '#ef4444' }}>{currentNode}</strong>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
