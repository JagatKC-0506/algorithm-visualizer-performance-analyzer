import type { SortingVisualizerStep } from '../../types';

interface Props {
  array: number[];
  step: SortingVisualizerStep | null;
}

const BAR_W = 48;
const BAR_GAP = 4;

function getBoxState(idx: number, step: SortingVisualizerStep, gapIdx: number | null): string {
  if (step.sorted.includes(idx) && idx !== gapIdx) return 'sorted';
  if (step.swapping.includes(idx)) return 'swapping';
  if (step.comparing.includes(idx)) return 'comparing';
  if (idx === gapIdx) return 'gap';
  return 'default';
}

const BOX_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  sorted: { bg: '#22c55e', border: '#1a8a47', text: '#fff' },
  swapping: { bg: 'rgba(239,68,68,0.35)', border: '#ef4444', text: '#ef4444' },
  comparing: { bg: 'rgba(245,158,11,0.35)', border: '#f59e0b', text: '#f59e0b' },
  gap: { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#3b82f6' },
  default: { bg: 'var(--accent)', border: 'transparent', text: '#fff' },
};

const BOX_ANIMATIONS: Record<string, string> = {
  comparing: 'comparePulse 0.8s ease-in-out infinite',
  swapping: 'shiftPush 0.45s ease-in-out',
  gap: 'gapPulse 0.8s ease-in-out infinite',
};

function getBoxAnimState(idx: number, step: SortingVisualizerStep, gapIdx: number | null): string {
  const inSwap = step.swapping.includes(idx);
  const inCompare = step.comparing.includes(idx);
  const isGap = idx === gapIdx;
  const desc = step.description.toLowerCase();

  if (inSwap && (idx === step.swapping[0] || idx === step.swapping[1])) return 'swapping';
  if (inCompare && isGap) return 'gap';
  if (inCompare) return 'comparing';
  if (isGap && desc.includes('insert')) return 'none';
  if (isGap) return 'gap';
  return 'none';
}

export default function InsertionSortDiagram({ array, step }: Props) {
  if (!step || step.current < 0) {
    return null;
  }

  const desc = step.description.toLowerCase();
  const gapIdx = step.current;
  const isPicking = step.comparing.length === 1 && step.comparing[0] === gapIdx;
  const isInserting = desc.includes('nsert');
  const keyVal = isPicking ? array[gapIdx] : null;

  return (
    <div
      style={{
        background: 'var(--bg)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
        }}
      >
        Insertion Sort
      </div>

      {/* Badges row */}
      <div
        style={{
          display: 'flex',
          gap: `${BAR_GAP}px`,
          justifyContent: 'center',
          minHeight: '26px',
          alignItems: 'flex-end',
        }}
      >
        {array.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: `${BAR_W}px`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {idx === gapIdx && !isInserting && (
              <div
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  color: '#3b82f6',
                  background: 'rgba(59,130,246,0.12)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                KEY{isPicking ? `:${keyVal}` : ''}
              </div>
            )}
            {isPicking && idx === gapIdx && (
              <span
                style={{
                  position: 'absolute',
                  marginTop: '-2px',
                  fontSize: '0.7rem',
                  color: '#3b82f6',
                }}
              >
                ↑
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Elements row */}
      <div
        style={{
          display: 'flex',
          gap: `${BAR_GAP}px`,
          justifyContent: 'center',
        }}
      >
        {array.map((val, idx) => {
          const isGap = idx === gapIdx && !isInserting && !desc.includes('sorted');
          const boxState = getBoxState(idx, step, isGap ? gapIdx : null);
          const colors = BOX_COLORS[boxState];
          const anim = getBoxAnimState(idx, step, isGap ? gapIdx : null);
          const boxAnimName = BOX_ANIMATIONS[anim] || 'fadeIn 0.2s ease-out';

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: `${BAR_W}px`,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: colors.bg,
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  boxShadow: boxState === 'comparing'
                    ? '0 0 10px rgba(245,158,11,0.5)'
                    : boxState === 'gap'
                      ? '0 0 6px rgba(59,130,246,0.25)'
                      : '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'background 0.2s, border 0.2s, color 0.2s',
                  animation: boxAnimName,
                  position: 'relative',
                  transform: isPicking && idx === gapIdx ? 'translateY(-4px)' : 'none',
                  zIndex: isPicking && idx === gapIdx ? 2 : 1,
                } as React.CSSProperties}
              >
                {isGap ? '○' : val}
              </div>
              <span
                style={{
                  marginTop: '4px',
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {idx}
                {idx === gapIdx && !isInserting && !desc.includes('sorted')
                  ? ' gap'
                  : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step description */}
      <div
        style={{
          marginTop: '0.6rem',
          fontSize: '0.85rem',
          color: 'var(--text)',
          textAlign: 'center',
          fontWeight: 500,
          padding: '0.3rem 0.75rem',
          background: 'var(--surface)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
        }}
      >
        {step.description}
      </div>
    </div>
  );
}
