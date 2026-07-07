import { useMemo } from 'react';
import type { SortingVisualizerStep } from '../../types';

interface Props {
  array: number[];
  step: SortingVisualizerStep | null;
  steps?: SortingVisualizerStep[];
  currentStep?: number;
}

interface PartitionInfo {
  start: number;
  end: number;
  pivotIdx: number;
  pivotVal: number;
  completed: boolean;
  stepIndex: number;
  depth: number;
  children: PartitionInfo[];
}

const PIVOT_BG = '#8b5cf6';
const LEQ_BG = 'rgba(34,197,94,0.18)';
const GT_BG = 'rgba(249,115,22,0.18)';
const COMPARING_BG = 'rgba(245,158,11,0.3)';
const SWAPPING_BG = 'rgba(239,68,68,0.3)';
const SORTED_BG = '#22c55e';
const LEQ_BORDER = '#22c55e';
const GT_BORDER = '#f97316';

function isContained(child: { start: number; end: number }, parent: { start: number; end: number }): boolean {
  return parent.start <= child.start && child.end <= parent.end &&
    (parent.start !== child.start || parent.end !== child.end);
}

function buildPartitionTree(steps: SortingVisualizerStep[], currentStep: number): PartitionInfo[] {
  const raw: { start: number; end: number; pivotIdx: number; pivotVal: number; stepIndex: number; completed: boolean }[] = [];

  for (let i = 0; i <= currentStep; i++) {
    const s = steps[i];
    if (!s.subarray || s.pivot === undefined) continue;
    if (s.description.startsWith('Partitioning:')) {
      raw.push({
        start: s.subarray.start,
        end: s.subarray.end,
        pivotIdx: s.pivot,
        pivotVal: s.array[s.pivot],
        stepIndex: i,
        completed: false,
      });
    } else if (s.description.includes('is in its final position')) {
      for (let p = raw.length - 1; p >= 0; p--) {
        if (!raw[p].completed && raw[p].start === s.subarray.start && raw[p].end === s.subarray.end) {
          raw[p].completed = true;
          break;
        }
      }
    }
  }

  const sorted = [...raw].sort((a, b) => a.stepIndex - b.stepIndex);
  const roots: PartitionInfo[] = [];

  function findParentFor(node: { start: number; end: number }, candidates: PartitionInfo[]): PartitionInfo | null {
    for (const c of candidates) {
      if (isContained(node, c)) {
        const child = findParentFor(node, c.children);
        return child ?? c;
      }
    }
    return null;
  }

  for (const node of sorted) {
    const parent = findParentFor(node, roots);

    const treeNode: PartitionInfo = {
      ...node,
      depth: parent ? parent.depth + 1 : 0,
      children: [],
    };

    if (parent) {
      parent.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  return roots;
}

function renderPartitionNode(
  node: PartitionInfo,
  currentStep: number,
  isCurrent: boolean,
): React.ReactNode {
  const isActive = isCurrent && !node.completed && node.stepIndex <= currentStep;
  return (
    <div
      key={`p-${node.start}-${node.end}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: node.depth * 20,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '6px',
          background: node.completed
            ? 'rgba(34,197,94,0.12)'
            : isActive
              ? 'rgba(59,130,246,0.12)'
              : 'transparent',
          border: `2px solid ${
            node.completed
              ? '#22c55e'
              : isActive
                ? '#3b82f6'
                : 'var(--border)'
          }`,
          fontSize: '0.75rem',
          fontWeight: node.completed || isActive ? 700 : 500,
          color: node.completed
            ? '#22c55e'
            : isActive
              ? '#3b82f6'
              : 'var(--text-secondary)',
          transition: 'all 0.25s',
        }}
      >
        <span>
          [{node.start}..{node.end - 1}]
        </span>
        <span style={{ fontWeight: 700, color: PIVOT_BG }}>
          pivot: {node.pivotVal}
        </span>
        {node.completed && <span style={{ color: '#22c55e' }}>&#10003;</span>}
      </div>
      {node.children.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            marginTop: '6px',
          }}
        >
          {node.children.map(child =>
            renderPartitionNode(child, currentStep, isCurrent)
          )}
        </div>
      )}
    </div>
  );
}

export default function QuickSortDiagram({ array, step, steps, currentStep }: Props) {
  const partitionTree = useMemo(() => {
    if (!steps || currentStep === undefined) return [];
    return buildPartitionTree(steps, currentStep);
  }, [steps, currentStep]);

  if (!step || step.pivot === undefined || !step.subarray) {
    return (
      <div
        style={{
          padding: '1rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
        }}
      >
        No active partition — waiting for partitioning step
      </div>
    );
  }

  const { start, end } = step.subarray;
  const pivotIdx = step.pivot;
  const pivotVal = array[pivotIdx];
  const subarray = array.slice(start, end);

  const j = step.comparing.length > 0
    ? step.comparing[0]
    : step.current >= 0
      ? step.current
      : null;

  let i = start - 1;
  if (j !== null && j > start) {
    for (let k = start; k < j; k++) {
      if (k !== pivotIdx && array[k] <= pivotVal) {
        i = k;
      }
    }
  }

  function getBoxStyle(globalIdx: number, val: number, pivotIdx: number, pivotVal: number, pivotIsPlaced: boolean, st: SortingVisualizerStep) {
    if (st.sorted.includes(globalIdx)) {
      return {
        background: SORTED_BG,
        border: `2px solid #1a8a47`,
        color: '#fff',
        fontWeight: 700,
      };
    }
    if (st.swapping.includes(globalIdx)) {
      return {
        background: SWAPPING_BG,
        border: `2px solid #ef4444`,
        color: '#ef4444',
        fontWeight: 700,
      };
    }
    if (st.comparing.includes(globalIdx)) {
      return {
        background: COMPARING_BG,
        border: `2px solid #f59e0b`,
        color: '#f59e0b',
        fontWeight: 700,
        boxShadow: '0 0 10px rgba(245,158,11,0.5)',
      };
    }
    if (globalIdx === pivotIdx) {
      return {
        background: PIVOT_BG,
        border: `2px solid #7c3aed`,
        color: '#fff',
        fontWeight: 700,
      };
    }
    if (val <= pivotVal) {
      return {
        background: LEQ_BG,
        border: `2px solid ${LEQ_BORDER}`,
        color: '#22c55e',
        fontWeight: 600,
      };
    }
    return {
      background: GT_BG,
      border: `2px solid ${GT_BORDER}`,
      color: '#f97316',
      fontWeight: 600,
    };
  }

  const pivotIsPlaced = step.description.includes('Placed pivot') || step.description.includes('final position');

  return (
    <div
      style={{
        background: 'var(--bg)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border)',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      {/* Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
          Partition of [{start}..{end - 1}]
        </span>
        <span style={{ fontSize: '0.8rem', color: PIVOT_BG, fontWeight: 700 }}>
          Pivot: a[{pivotIdx}] = {pivotVal}
        </span>
      </div>

      {/* Element boxes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '0.5rem 0',
          position: 'relative',
        }}
      >
        {subarray.map((val, idx) => {
          const globalIdx = start + idx;
          const style = getBoxStyle(globalIdx, val, pivotIdx, pivotVal, pivotIsPlaced, step);
          const isJ = globalIdx === j;
          const isI = globalIdx === i;
          const isFinalPivot = globalIdx === pivotIdx && pivotIsPlaced;

          return (
            <div
              key={globalIdx}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                fontSize: '0.9rem',
                position: 'relative',
                transition: 'background 0.2s, border 0.2s, box-shadow 0.2s, transform 0.25s',
                transform: isFinalPivot ? 'translateY(-4px)' : 'none',
                ...style,
              } as React.CSSProperties}
            >
              {val}
              {globalIdx === pivotIdx && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-16px',
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    color: PIVOT_BG,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pivot
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* i and j pointers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          minHeight: '20px',
          marginTop: '4px',
        }}
      >
        {subarray.map((_, idx) => {
          const globalIdx = start + idx;
          const pointers: string[] = [];
          if (globalIdx === i && i >= start) pointers.push('i');
          if (globalIdx === j) pointers.push('j');
          return (
            <div
              key={`ptr-${globalIdx}`}
              style={{
                width: '44px',
                textAlign: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: globalIdx === j ? '#f59e0b' : globalIdx === i ? '#3b82f6' : 'transparent',
                fontFamily: 'monospace',
              }}
            >
              {pointers.join('/')}
            </div>
          );
        })}
      </div>

      {/* Region labels */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '2px',
        }}
      >
        {subarray.map((_, idx) => {
          const globalIdx = start + idx;
          const isLeq = globalIdx <= i && i >= start;
          const isGt = j !== null && globalIdx > i && globalIdx < j;
          const isPivot = globalIdx === pivotIdx;
          const isUnproc = j !== null && globalIdx >= j && globalIdx < end - 1;
          const isRightGt = globalIdx > pivotIdx && pivotIsPlaced;

          let label = '';
          let labelColor = 'transparent';
          if (isLeq) { label = '≤'; labelColor = '#22c55e'; }
          else if (isGt) { label = '>'; labelColor = '#f97316'; }
          else if (isPivot && pivotIsPlaced) { label = '✓'; labelColor = '#22c55e'; }

          return (
            <div
              key={`lbl-${globalIdx}`}
              style={{
                width: '44px',
                textAlign: 'center',
                fontSize: '0.6rem',
                fontWeight: 700,
                color: labelColor,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Partition tree */}
      {partitionTree.length > 0 && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Recursive Partitions
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {partitionTree.map(root =>
              renderPartitionNode(root, currentStep ?? 0, true)
            )}
          </div>
        </div>
      )}

      {/* Step description */}
      <div
        style={{
          marginTop: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text)',
          textAlign: 'center',
          fontWeight: 500,
          padding: '0.375rem 0.75rem',
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
