import { useMemo, useRef, useEffect } from 'react';
import type { MergeSortFrameNode } from '../../utils/mergeSortDiagram';
import type { SortingVisualizerStep } from '../../types';
import { generateMergeSortDiagram } from '../../utils/mergeSortDiagram';

interface Props {
  array: number[];
  currentStep: number;
  totalSteps: number;
  step: SortingVisualizerStep | null;
}

const STATE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  dividing: { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: 'var(--text)' },
  merging: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: 'var(--text)' },
  done: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: 'var(--text)' },
  hidden: { bg: 'transparent', border: 'transparent', text: 'transparent' },
};

const MINI_BAR_COLORS: Record<string, string> = {
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#22c55e',
};

const NODE_DEFAULT_COLORS: Record<string, string> = {
  dividing: 'rgba(59,130,246,0.35)',
  merging: 'rgba(245,158,11,0.35)',
  done: 'rgba(34,197,94,0.35)',
};

function getMiniColor(globalIdx: number, step: SortingVisualizerStep | null, nodeState: string): string {
  if (!step) return NODE_DEFAULT_COLORS[nodeState] ?? 'var(--accent)';
  if (step.sorted.includes(globalIdx)) return MINI_BAR_COLORS.sorted;
  if (step.swapping.includes(globalIdx)) return MINI_BAR_COLORS.swapping;
  if (step.comparing.includes(globalIdx)) return MINI_BAR_COLORS.comparing;
  return NODE_DEFAULT_COLORS[nodeState] ?? 'var(--accent)';
}

export default function MergeSortDiagram({ array, currentStep, step }: Props) {
  const diagramData = useMemo(() => generateMergeSortDiagram(array), [array]);
  const { allNodes, frames } = diagramData;

  const frameIndex = Math.min(currentStep, Math.max(frames.length - 1, 0));
  const frame = frames[frameIndex] ?? null;

  const frameMap = useMemo(() => {
    const m = new Map<string, MergeSortFrameNode>();
    if (frame) {
      for (const fn of frame.nodes) {
        m.set(fn.id, fn);
      }
    }
    return m;
  }, [frame]);

  const prevVisibleRef = useRef(new Set<string>());
  const collapsingRef = useRef(new Set<string>());
  const prevValuesRef = useRef(new Map<string, string>());

  const visibleNow = useMemo(() => {
    const s = new Set<string>();
    if (frame) {
      for (const fn of frame.nodes) {
        if (fn.state !== 'hidden') s.add(fn.id);
      }
    }
    return s;
  }, [frame]);

  const newlyVisible = useMemo(() => {
    const nv = new Set<string>();
    for (const id of visibleNow) {
      if (!prevVisibleRef.current.has(id)) nv.add(id);
    }
    return nv;
  }, [visibleNow]);

  const newlyHidden = useMemo(() => {
    const nh = new Set<string>();
    for (const id of prevVisibleRef.current) {
      if (frame && !visibleNow.has(id)) {
        nh.add(id);
      }
    }
    return nh;
  }, [frame, visibleNow]);

  for (const id of newlyHidden) {
    collapsingRef.current.add(id);
  }

  useEffect(() => {
    collapsingRef.current.clear();
  });

  function renderNode(nodeId: string, depth: number): React.ReactNode {
    const node = allNodes.find(n => n.id === nodeId);
    const fn = frameMap.get(nodeId);

    const isHidden = !fn || fn.state === 'hidden';
    const isCollapsing = collapsingRef.current.has(nodeId);
    if (isHidden && !isCollapsing) return null;

    const style = STATE_STYLES[fn!.state];
    const isNew = newlyVisible.has(nodeId);
    const isActive = fn!.state === 'dividing' || fn!.state === 'merging';
    const isMerging = fn!.state === 'merging';

    const valKey = fn!.values.join(',');
    const prevVal = prevValuesRef.current.get(nodeId);
    const valChanged = prevVal !== undefined && prevVal !== valKey;
    prevValuesRef.current.set(nodeId, valKey);

    const children = node!.children?.filter(c => {
      const cf = frameMap.get(c);
      const isCHidden = !cf || cf.state === 'hidden';
      const isCCollapsing = collapsingRef.current.has(c);
      return !isCHidden || isCCollapsing;
    });

    const staggerDelay = `${depth * 60}ms`;

    return (
      <div
        key={nodeId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            '--border-color': style.border,
            background: isCollapsing ? 'transparent' : style.bg,
            border: `2px solid ${isCollapsing ? 'transparent' : style.border}`,
            borderRadius: '8px',
            padding: '6px 8px',
            transition: 'background 0.25s, border 0.25s, box-shadow 0.25s',
            boxShadow: isActive
              ? `0 0 0 3px ${style.border}44, 0 0 16px ${style.border}22`
              : '0 1px 3px rgba(0,0,0,0.1)',
            animation: isCollapsing
              ? 'collapseNode 0.35s ease-out forwards'
              : isNew
                ? `nodeEnter 0.35s ease-out both`
                : isActive
                  ? `nodePulse 1.8s ease-in-out infinite`
                  : 'none',
            animationDelay: isNew ? staggerDelay : '0s',
          } as React.CSSProperties}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              key={valChanged ? valKey + '-new' : valKey}
              style={{
                display: 'flex',
                gap: '3px',
                animation: valChanged ? 'valueSwapIn 0.3s ease-out' : 'none',
              }}
            >
              {fn!.values.map((val, i) => {
                const globalIdx = node!.start + i;
                const miniColor = getMiniColor(globalIdx, step, fn!.state);
                const isActiveItem = step && (
                  step.comparing.includes(globalIdx) ||
                  step.swapping.includes(globalIdx) ||
                  step.sorted.includes(globalIdx)
                );
                return (
                  <div
                    key={i}
                    style={{
                      width: '20px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: miniColor,
                      borderRadius: '3px',
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      color: '#fff',
                      transition: 'background 0.15s, box-shadow 0.15s',
                      boxShadow: isActiveItem
                        ? '0 0 0 1px rgba(255,255,255,0.6)'
                        : 'none',
                      flexShrink: 0,
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {children && children.length > 0 && (
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
                height: '14px',
                background: isMerging ? '#f59e0b' : 'var(--border)',
                transformOrigin: 'top',
                animation: isNew
                  ? 'lineGrowVertical 0.3s ease-out'
                  : isMerging
                    ? 'linePulse 0.8s ease-in-out infinite'
                    : 'none',
                animationDelay: isNew ? staggerDelay : '0s',
              }}
            />
            <div style={{ display: 'flex', gap: '40px', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: isMerging ? '#f59e0b' : 'var(--border)',
                  transformOrigin: 'center',
                  animation: isNew
                    ? 'lineGrowHorizontal 0.3s ease-out'
                    : isMerging
                      ? 'linePulse 0.8s ease-in-out infinite'
                      : 'none',
                  animationDelay: isNew ? staggerDelay : '0s',
                }}
              />
              {children.map(childId => (
                <div
                  key={childId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '2px',
                      height: '14px',
                      background: isMerging ? '#f59e0b' : 'var(--border)',
                      transformOrigin: 'top',
                      animation: 'lineGrowVertical 0.3s ease-out',
                      animationDelay: staggerDelay,
                    }}
                  />
                  {renderNode(childId, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  prevVisibleRef.current = visibleNow;

  if (!frame || allNodes.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        No data to display
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '1.5rem 1rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          minHeight: '250px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {renderNode(allNodes[0].id, 0)}
      </div>
      {frame && (
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: '0.9rem',
            color: 'var(--text)',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {frame.description}
        </p>
      )}
    </div>
  );
}
