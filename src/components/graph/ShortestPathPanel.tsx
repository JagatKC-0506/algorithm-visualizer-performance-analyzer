import PanelWrapper from './PanelWrapper';

interface Props {
  pathEdges: { from: number; to: number }[];
  distances: Map<number, number>;
  destination: number;
}

export default function ShortestPathPanel({ pathEdges, distances, destination }: Props) {
  if (pathEdges.length === 0) {
    return (
      <PanelWrapper title="Shortest Path" accent="#22c55e">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          waiting for path...
        </span>
      </PanelWrapper>
    );
  }

  const totalCost = distances.get(destination);
  const pathStr = pathEdges.length > 0
    ? pathEdges[0].from + ' → ' + pathEdges.map(e => e.to).join(' → ')
    : '';

  return (
    <PanelWrapper title="Shortest Path Reconstruction" accent="#22c55e">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {pathEdges.length > 0 ? (
            <>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: 'rgba(34,197,94,0.2)',
                  color: '#22c55e',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                {pathEdges[0].from}
              </span>
              {pathEdges.map((e, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>→</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '24px',
                      height: '24px',
                      padding: '0 6px',
                      borderRadius: '4px',
                      background: 'rgba(34,197,94,0.2)',
                      color: '#22c55e',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {e.to}
                  </span>
                </span>
              ))}
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              No path found
            </span>
          )}
        </div>
        {totalCost !== undefined && totalCost < Infinity && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Cost = <strong style={{ color: '#22c55e', fontWeight: 700 }}>{totalCost}</strong>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
