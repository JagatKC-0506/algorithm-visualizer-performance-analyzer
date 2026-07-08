import PanelWrapper from './PanelWrapper';

interface Props {
  parent: Map<number, number | null>;
  visitedNodes: number[];
}

export default function ParentTable({ parent, visitedNodes }: Props) {
  const entries = Array.from(parent.entries()).sort(([a], [b]) => a - b);

  return (
    <PanelWrapper title="Parent Table" accent="#f59e0b">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Vertex</th>
            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Parent</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([node, p]) => {
            const isVisited = visitedNodes.includes(node);
            const isNil = p === null;
            return (
              <tr
                key={node}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isVisited ? 'rgba(245,158,11,0.08)' : undefined,
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
                  color: isNil ? 'var(--text-secondary)' : '#f59e0b',
                  fontWeight: isNil ? 400 : 700,
                }}>
                  {isNil ? 'NIL' : p}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PanelWrapper>
  );
}
