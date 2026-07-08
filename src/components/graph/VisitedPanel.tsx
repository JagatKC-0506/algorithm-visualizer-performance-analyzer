import PanelWrapper from './PanelWrapper';

interface Props {
  visitedNodes: number[];
  currentNode: number;
}

export default function VisitedPanel({ visitedNodes, currentNode }: Props) {
  return (
    <PanelWrapper title="Visited Nodes" accent="#3b82f6">
      {visitedNodes.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {visitedNodes.map((n, i) => {
            const isCurrent = n === currentNode;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: isCurrent
                    ? 'rgba(239,68,68,0.25)'
                    : 'rgba(59,130,246,0.15)',
                  color: isCurrent ? '#ef4444' : '#3b82f6',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  transition: 'all 0.3s ease',
                  animation: isCurrent ? 'pulse-node 1s ease-in-out infinite' : undefined,
                }}
              >
                {n}
              </span>
            );
          })}
        </div>
      ) : (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          none
        </span>
      )}
    </PanelWrapper>
  );
}
