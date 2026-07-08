import type { RelaxationInfo } from '../../types';
import PanelWrapper from './PanelWrapper';

interface Props {
  relaxation: RelaxationInfo | null;
}

export default function RelaxationPanel({ relaxation }: Props) {
  if (!relaxation) {
    return (
      <PanelWrapper title="Relaxation Panel" accent="#ec4899">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          waiting for edge relaxation...
        </span>
      </PanelWrapper>
    );
  }

  const { from, to, weight, oldDist, newDist, updated } = relaxation;

  return (
    <PanelWrapper title="Relaxation Panel" accent="#ec4899">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.78rem' }}>
          Current Edge: {from} → {to} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(weight = {weight})</span>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: 'var(--bg)', padding: '0.4rem 0.5rem', borderRadius: '4px', lineHeight: 1.6 }}>
          <div>
            <span style={{ color: '#10b981' }}>dist[{to}]</span> &gt; <span style={{ color: '#10b981' }}>dist[{from}]</span> + {weight}
          </div>
          <div>
            <span style={{ color: updated ? '#ef4444' : 'var(--text-secondary)' }}>
              {oldDist === Infinity ? '\u221E' : oldDist}
            </span>
            {' > '}
            <span style={{ color: '#10b981' }}>
              {distDisplay(oldDist)}{oldDist !== Infinity ? ' + ' + weight : ''}
            </span>
          </div>
          <div style={{ color: updated ? '#22c55e' : 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {updated ? (
              <>✓ Update: <strong style={{ color: '#22c55e' }}>dist[{to}] = {newDist}</strong></>
            ) : (
              <>✗ No update needed (dist[{to}] = {oldDist === Infinity ? '\u221E' : oldDist})</>
            )}
          </div>
        </div>
      </div>
    </PanelWrapper>
  );
}

function distDisplay(d: number): string {
  if (d === Infinity) return '\u221E';
  return `${d}`;
}
