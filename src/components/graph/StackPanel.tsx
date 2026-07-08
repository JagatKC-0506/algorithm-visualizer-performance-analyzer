import PanelWrapper from './PanelWrapper';

interface Props {
  stack: number[];
  currentNode: number;
}

export default function StackPanel({ stack, currentNode }: Props) {
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  return (
    <PanelWrapper title="Stack Visualization" accent="#a882ff">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {stack.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.25rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
              ← TOP
            </div>
            {stack.map((n, i) => {
              const isTop = i === stack.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '28px',
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    background: isTop
                      ? 'rgba(239,68,68,0.2)'
                      : 'rgba(168,130,255,0.15)',
                    color: isTop ? '#ef4444' : '#a882ff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    border: isTop ? '2px solid #ef4444' : '2px solid transparent',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    animation: isTop ? 'pulse-node 1s ease-in-out infinite' : undefined,
                  }}
                >
                  {n}
                  {isTop && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '-36px',
                        fontSize: '0.6rem',
                        color: '#ef4444',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      TOP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            empty
          </span>
        )}
        {currentNode >= 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Popped: <strong style={{ color: '#ef4444' }}>{currentNode}</strong>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
