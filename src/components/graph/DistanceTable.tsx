import PanelWrapper from './PanelWrapper';

interface Props {
  distances: Map<number, number>;
  visitedNodes: number[];
}

export default function DistanceTable({ distances, visitedNodes }: Props) {
  const entries = Array.from(distances.entries()).sort(([a], [b]) => a - b);

  return (
    <PanelWrapper title="Distance Table" accent="#10b981">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Vertex</th>
            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Distance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([node, dist]) => {
            const isVisited = visitedNodes.includes(node);
            const isInfinity = dist === Infinity;
            return (
              <tr
                key={node}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isVisited ? 'rgba(16,185,129,0.08)' : undefined,
                  transition: 'background 0.3s ease',
                }}
              >
                <td style={{ padding: '0.25rem 0.5rem', fontWeight: 600, fontFamily: 'monospace' }}>
                  {node}
                </td>
                <td style={{
                  padding: '0.25rem 0.5rem',
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  color: isInfinity ? 'var(--text-secondary)' : isVisited ? '#10b981' : 'var(--text)',
                  fontWeight: isVisited ? 700 : 400,
                }}>
                  {isInfinity ? '\u221E' : dist}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PanelWrapper>
  );
}
