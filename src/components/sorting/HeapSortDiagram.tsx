import { useRef } from 'react';
import type { SortingVisualizerStep } from '../../types';

interface Props {
  array: number[];
  step: SortingVisualizerStep | null;
}

function getNodeColor(idx: number, step: SortingVisualizerStep | null): string {
  if (!step) return 'var(--accent)';
  if (step.sorted.includes(idx)) return '#22c55e';
  if (step.swapping.includes(idx)) return '#ef4444';
  if (step.comparing.includes(idx)) return '#f59e0b';
  if (step.current === idx) return '#3b82f6';
  if (step.subarray && (idx < step.subarray.start || idx >= step.subarray.end)) return 'var(--border)';
  return 'var(--accent)';
}

export default function HeapSortDiagram({ array, step }: Props) {
  const prevValuesRef = useRef(new Map<number, number>());
  const initializedRef = useRef(false);

  const hasSorted = (step?.sorted.length ?? 0) > 0;
  const subEnd = step?.subarray?.end;
  const isBuildingPhase = hasSorted && subEnd === array.length;
  const isExtractPhase = subEnd !== undefined && subEnd < array.length;

  function renderHeap(index: number, depth: number): React.ReactNode {
    if (index >= array.length) return null;

    const left = 2 * index + 1;
    const right = 2 * index + 2;
    const hasChildren = left < array.length;
    const color = getNodeColor(index, step);
    const isActive = step && (
      step.comparing.includes(index) ||
      step.swapping.includes(index) ||
      step.current === index
    );
    const isSorted = step?.sorted.includes(index) ?? false;
    const isOutsideHeap = step?.subarray && (index < step.subarray.start || index >= step.subarray.end);
    const isHeapBoundary = isBuildingPhase && index === step?.subarray?.start;

    const staggerDelay = `${depth * 60}ms`;
    const prevVal = prevValuesRef.current.get(index);
    const valChanged = initializedRef.current && prevVal !== undefined && prevVal !== array[index];
    prevValuesRef.current.set(index, array[index]);

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          opacity: isOutsideHeap && isSorted ? 0.5 : 1,
          position: 'relative',
        }}
      >
        {isHeapBoundary && (
          <div
            style={{
              position: 'absolute',
              top: '-18px',
              fontSize: '0.55rem',
              fontWeight: 700,
              color: '#22c55e',
              background: 'rgba(34,197,94,0.1)',
              padding: '1px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            ✓ Heap
          </div>
        )}
        <div
          style={{
            '--border-color': color,
            background: `${color}18`,
            border: `2px solid ${
              isActive
                ? color
                : isSorted
                  ? '#22c55e'
                  : isOutsideHeap
                    ? 'var(--border)'
                    : isHeapBoundary
                      ? '#22c55e'
                      : color
            }`,
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOutsideHeap ? 'var(--text-secondary)' : '#fff',
            fontWeight: 700,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            transition: 'background 0.2s, border 0.2s, box-shadow 0.2s, opacity 0.3s',
            boxShadow: isActive
              ? `0 0 0 3px ${color}44, 0 0 16px ${color}22`
              : isSorted
                ? isBuildingPhase
                  ? '0 0 0 2px rgba(34,197,94,0.25)'
                  : '0 0 0 2px rgba(34,197,94,0.15)'
                : '0 1px 3px rgba(0,0,0,0.1)',
            animation: isActive
              ? `nodePulse 1.8s ease-in-out infinite`
              : `nodeEnter 0.35s ease-out both`,
            animationDelay: isActive ? '0s' : staggerDelay,
            position: 'relative',
            zIndex: isActive ? 2 : 1,
          } as React.CSSProperties}
        >
          <span
            key={valChanged ? `v-${index}-${array[index]}` : undefined}
            style={{
              animation: valChanged ? 'valueSwapIn 0.3s ease-out' : 'none',
            }}
          >
            {array[index]}
          </span>
        </div>

        {hasChildren && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '2px',
                height: '12px',
                background: 'var(--border)',
                transformOrigin: 'top',
                animation: 'lineGrowVertical 0.3s ease-out',
                animationDelay: staggerDelay,
              }}
            />
            <div style={{ display: 'flex', gap: `${Math.max(12, 36 - depth * 4)}px`, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: 'var(--border)',
                  transformOrigin: 'center',
                  animation: 'lineGrowHorizontal 0.3s ease-out',
                  animationDelay: staggerDelay,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '2px',
                    height: '12px',
                    background: 'var(--border)',
                    transformOrigin: 'top',
                    animation: 'lineGrowVertical 0.3s ease-out',
                    animationDelay: staggerDelay,
                  }}
                />
                {renderHeap(left, depth + 1)}
              </div>
              {right < array.length && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '2px',
                      height: '12px',
                      background: 'var(--border)',
                      transformOrigin: 'top',
                      animation: 'lineGrowVertical 0.3s ease-out',
                      animationDelay: staggerDelay,
                    }}
                  />
                  {renderHeap(right, depth + 1)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  initializedRef.current = true;

  if (array.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No data to display
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          textAlign: 'center',
          color: isBuildingPhase ? '#3b82f6' : isExtractPhase ? '#f59e0b' : 'var(--text-secondary)',
        }}
      >
        {isBuildingPhase && '🔨 Building Max-Heap'}
        {isExtractPhase && '📤 Extracting Max Elements'}
        {!isBuildingPhase && !isExtractPhase && '🌳 Heap Tree'}
      </div>
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '1.5rem 1rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          minHeight: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {renderHeap(0, 0)}
      </div>
      {step && (
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: '0.9rem',
            color: 'var(--text)',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {step.description}
        </p>
      )}
    </div>
  );
}
