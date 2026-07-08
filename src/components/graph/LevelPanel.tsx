import { useMemo } from 'react';
import PanelWrapper from './PanelWrapper';

interface Props {
  levels: Map<number, number>;
  visitedNodes: number[];
}

const LEVEL_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
];

export default function LevelPanel({ levels, visitedNodes }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const [node, level] of levels) {
      if (!map.has(level)) map.set(level, []);
      map.get(level)!.push(node);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [levels]);

  if (grouped.length === 0) {
    return (
      <PanelWrapper title="Level Visualization" accent="#14b8a6">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          not started
        </span>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper title="Level Visualization" accent="#14b8a6">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {grouped.map(([level, nodes]) => {
          const color = LEVEL_COLORS[level % LEVEL_COLORS.length];
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  minWidth: '50px',
                }}
              >
                Level {level} :
              </span>
              <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                {nodes.map(node => (
                  <span
                    key={node}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '24px',
                      height: '24px',
                      padding: '0 6px',
                      borderRadius: '4px',
                      background: `${color}25`,
                      color: color,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PanelWrapper>
  );
}
