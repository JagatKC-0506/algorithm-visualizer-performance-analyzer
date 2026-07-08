import PanelWrapper from './PanelWrapper';

interface Props {
  traversalOrder: number[];
  currentNode: number;
}

export default function TraversalPanel({ traversalOrder, currentNode }: Props) {
  return (
    <PanelWrapper title="Traversal Order" accent="#3b82f6">
      {traversalOrder.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {traversalOrder.map((n, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: n === currentNode
                    ? 'rgba(239,68,68,0.25)'
                    : 'rgba(59,130,246,0.12)',
                  color: n === currentNode ? '#ef4444' : '#3b82f6',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  transition: 'all 0.3s ease',
                }}
              >
                {n}
              </span>
              {i < traversalOrder.length - 1 && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>→</span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          not started
        </span>
      )}
    </PanelWrapper>
  );
}
