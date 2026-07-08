import PanelWrapper from './PanelWrapper';

interface Props {
  lines: string[];
  currentLine: number;
  phase?: string;
}

export default function PseudocodePanel({ lines, currentLine, phase }: Props) {
  return (
    <PanelWrapper title="Pseudocode" accent="#8b5cf6">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {lines.map((line, i) => {
          const isActive = i === currentLine;
          const isPast = currentLine > i;
          return (
            <div
              key={i}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                lineHeight: 1.5,
                background: isActive
                  ? 'rgba(139,92,246,0.2)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #8b5cf6'
                  : '3px solid transparent',
                color: isActive
                  ? '#8b5cf6'
                  : isPast
                    ? 'var(--text-secondary)'
                    : 'var(--text)',
                fontWeight: isActive ? 700 : 400,
                transition: 'all 0.25s ease',
                opacity: isPast ? 0.7 : 1,
              }}
            >
              {isActive && (
                <span style={{ marginRight: '0.3rem', fontSize: '0.65rem' }}>▶</span>
              )}
              {line}
            </div>
          );
        })}
      </div>
      {currentLine < 0 && phase === 'path-found' && (
        <div style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>
          ✓ Algorithm complete — path found!
        </div>
      )}
      {currentLine < 0 && phase === 'complete' && (
        <div style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>
          ✓ Algorithm complete
        </div>
      )}
    </PanelWrapper>
  );
}
