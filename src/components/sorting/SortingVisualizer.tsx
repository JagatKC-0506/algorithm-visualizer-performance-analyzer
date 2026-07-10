import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AlgorithmType, SortingVisualizerStep, ElementState } from '../../types';
import { sortingAlgorithms } from '../../algorithms/sorting';
import { SORTING_ALGORITHMS } from '../../types/algorithms';
import { generateRandomArray, generateSortedArray, generateNearlySortedArray, generateReverseSortedArray } from '../../utils/helpers';
import { generateMergeSortDiagram } from '../../utils/mergeSortDiagram';
import MergeSortDiagram from './MergeSortDiagram';
import HeapSortDiagram from './HeapSortDiagram';
import QuickSortDiagram from './QuickSortDiagram';
import InsertionSortDiagram from './InsertionSortDiagram';
import Button from '../common/Button';

interface Props {
  algorithm: AlgorithmType;
}

const CELL_COLORS: Record<ElementState, string> = {
  default: 'var(--accent)',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#22c55e',
  current: '#3b82f6',
  pivot: '#8b5cf6',
  subarray: '#6366f1',
  merging: '#14b8a6',
};

function getExpectedComplexity(algo: AlgorithmType, type: string): string {
  const tc = SORTING_ALGORITHMS[algo]?.timeComplexity;
  if (!tc) return '';
  switch (type) {
    case 'sorted':
      if (algo === 'bubble' || algo === 'insertion') return tc.best;
      if (algo === 'quick') return tc.worst;
      return tc.average;
    case 'reverse-sorted':
      if (algo === 'insertion') return tc.worst;
      if (algo === 'quick') return tc.worst;
      return tc.average;
    case 'nearly-sorted':
      if (algo === 'bubble' || algo === 'insertion') return `~${tc.best}`;
      if (algo === 'quick') return `~${tc.average}`;
      return tc.average;
    default:
      return tc.average;
  }
}

function getActiveInstructionStep(algo: AlgorithmType, description: string): number {
  const d = description.toLowerCase();
  switch (algo) {
    case 'bubble':
      if (d.includes('no swap') || d.includes('already sorted') || d.includes('array is sorted')) return 5;
      if (d.includes('largest') || d.includes('bubble') || d.includes('pass')) return 4;
      if (d.includes('swap')) return 2;
      if (d.includes('compar')) return 1;
      return 0;
    case 'selection':
      if (d.includes('minimum') || d.includes('min ') || d.includes('smallest')) return 0;
      if (d.includes('swap')) return 1;
      if (d.includes('expand') || d.includes('boundar')) return 2;
      if (d.includes('repeat') || d.includes('sorted') || d.includes('done')) return 3;
      return 0;
    case 'insertion':
      if (d.includes('insert') || d.includes('key') || d.includes('place')) return 3;
      if (d.includes('shift')) return 2;
      if (d.includes('compar')) return 1;
      if (d.includes('repeat') || d.includes('move') || d.includes('next') || d.includes('sorted')) return 4;
      return 0;
    case 'merge':
      if (d.includes('merg') || d.includes('compar')) return 2;
      if (d.includes('divid') || d.includes('split') || d.includes('half')) return 0;
      if (d.includes('sort') || d.includes('recurs')) return 1;
      if (d.includes('contin') || d.includes('result') || d.includes('sorted')) return 3;
      return 0;
    case 'quick':
      if (d.includes('pivot')) {
        if (d.includes('choos') || d.includes('select')) return 0;
        return 2;
      }
      if (d.includes('partit')) return 1;
      if (d.includes('left') || d.includes('right') || d.includes('sub')) {
        if (d.includes('left')) return 3;
        return 4;
      }
      return 0;
    case 'heap':
      if (d.includes('build') || d.includes('max heap')) return 0;
      if (d.includes('swap') && d.includes('root')) return 1;
      if (d.includes('reduc') || d.includes('size')) return 2;
      if (d.includes('heapif')) return 3;
      if (d.includes('repeat') || d.includes('sorted') || d.includes('remaining')) return 4;
      return 0;
  }
}

export default function SortingVisualizer({ algorithm }: Props) {
  const [array, setArray] = useState<number[]>([]);
  const [size, setSize] = useState(10);
  const [speed, setSpeed] = useState(500);
  const [arrayType, setArrayType] = useState<'random' | 'sorted' | 'nearly-sorted' | 'reverse-sorted'>('random');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SortingVisualizerStep[]>([]);
  const [playing, setPlaying] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const timerRef = useRef<number | null>(null);
  const playRef = useRef(false);
  const swapAnimRef = useRef(0);

  const getCellColor = (idx: number, step: SortingVisualizerStep): string => {
    if (step.sorted.includes(idx)) return CELL_COLORS.sorted;
    if (step.swapping.includes(idx)) return CELL_COLORS.swapping;
    if (step.comparing.includes(idx)) return CELL_COLORS.comparing;
    if (step.pivot !== undefined && idx === step.pivot) return CELL_COLORS.pivot;
    if (step.current === idx) return CELL_COLORS.current;
    return CELL_COLORS.default;
  };

  const generateArray = useCallback((type: string, sz: number) => {
    switch (type) {
      case 'sorted': return generateSortedArray(sz, 1, 99);
      case 'nearly-sorted': return generateNearlySortedArray(sz, 1, 99);
      case 'reverse-sorted': return generateReverseSortedArray(sz, 1, 99);
      default: return generateRandomArray(sz, 1, 99);
    }
  }, []);

  const generateNewArray = useCallback(() => {
    const arr = generateArray(arrayType, size);
    setArray(arr);
    const newSteps = sortingAlgorithms[algorithm].steps(arr);
    setSteps(newSteps);
    setCurrentStep(0);
    setPlaying(false);
    setComparisons(0);
    setSwaps(0);
    setStartTime(null);
    setElapsed(0);
  }, [algorithm, size, arrayType, generateArray]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  useEffect(() => {
    if (playing && currentStep < maxStep) {
      playRef.current = true;
      const interval = setInterval(() => {
        if (!playRef.current) return;
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, speed);
      timerRef.current = interval;
      return () => {
        clearInterval(interval);
        timerRef.current = null;
      };
    }
    }, [playing, speed, steps]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setArray(step.array);
      if (step.description.toLowerCase().includes('compar')) {
        setComparisons(p => p + 1);
      }
      if (step.description.toLowerCase().includes('swapp')) {
        setSwaps(p => p + 1);
        swapAnimRef.current += 1;
      }
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (playing && startTime === null) {
      setStartTime(performance.now());
    }
    if (!playing && startTime !== null) {
      setElapsed(prev => prev + performance.now() - startTime);
      setStartTime(null);
    }
    if (playing && startTime !== null) {
      const interval = setInterval(() => {
        setElapsed(prev => prev + 16);
      }, 16);
      return () => clearInterval(interval);
    }
  }, [playing, startTime]);

  const togglePlay = () => {
    if (currentStep >= maxStep) return;
    if (!playing) {
      setStartTime(performance.now());
    }
    setPlaying(p => !p);
  };

  const goToStep = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && currentStep > 0) {
      setPlaying(false);
      setCurrentStep(currentStep - 1);
    }
    if (dir === 'next' && currentStep < maxStep) {
      setPlaying(false);
      setCurrentStep(currentStep + 1);
    }
  };

  const restart = () => {
    setPlaying(false);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    setStartTime(null);
    setElapsed(0);
    const arr = generateArray(arrayType, size);
    setArray(arr);
    const newSteps = sortingAlgorithms[algorithm].steps(arr);
    setSteps(newSteps);
  };

  const step = currentStep < steps.length ? steps[currentStep] : null;
  const instructionSteps = SORTING_ALGORITHMS[algorithm]?.steps || [];
  const activeInstructionStep = step ? getActiveInstructionStep(algorithm, step.description) : -1;

  const diagramData = useMemo(() => {
    if (algorithm === 'merge') return generateMergeSortDiagram([...array]);
    return null;
  }, [algorithm, array]);

  const isMerge = algorithm === 'merge';
  const maxStep = isMerge && diagramData ? diagramData.frames.length - 1 : steps.length - 1;
  const diagramFrame = isMerge && diagramData
    ? diagramData.frames[Math.min(currentStep, diagramData.frames.length - 1)]
    : null;

  const activeSubarray = useMemo(() => {
    if (!isMerge || !diagramData || !diagramFrame) return null;
    for (const fn of diagramFrame.nodes) {
      if (fn.state === 'dividing' || fn.state === 'merging') {
        const nodeData = diagramData.allNodes.find(n => n.id === fn.id);
        if (nodeData) return { start: nodeData.start, end: nodeData.end };
      }
    }
    return null;
  }, [diagramData, diagramFrame, isMerge]);

  const started = playing || currentStep > 0;

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowSteps(!showSteps)}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          {showSteps ? '▼' : '▶'} Algorithm Steps
        </button>
        {showSteps && (
          <div
            style={{
              marginTop: '0.5rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {SORTING_ALGORITHMS[algorithm]?.name || algorithm} — Step by Step
            </div>
            {instructionSteps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0',
                  fontSize: '0.85rem',
                  color: i === activeInstructionStep ? 'var(--text)' : 'var(--text-secondary)',
                  fontWeight: i === activeInstructionStep ? 600 : 400,
                  opacity: i <= activeInstructionStep ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: i <= activeInstructionStep ? 'var(--accent)' : 'var(--border)',
                    color: i <= activeInstructionStep ? '#fff' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <Button onClick={generateNewArray}>Generate New Array</Button>
        <Button onClick={restart} variant="secondary">Restart</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Array:</span>
        {(['random', 'sorted', 'nearly-sorted', 'reverse-sorted'] as const).map(type => (
          <button
            key={type}
            onClick={() => { setArrayType(type); }}
            style={{
              background: arrayType === type ? 'var(--accent)' : 'var(--bg)',
              color: arrayType === type ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${arrayType === type ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '0.375rem',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {type === 'nearly-sorted' ? 'Nearly Sorted' : type === 'reverse-sorted' ? 'Reverse Sorted' : type}
          </button>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
          Expected: <strong style={{ color: 'var(--text)' }}>{getExpectedComplexity(algorithm, arrayType)}</strong>
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Size:
          <input type="range" min={3} max={30} value={size} onChange={e => setSize(Number(e.target.value))} />
          <span style={{ minWidth: '2rem' }}>{size}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Speed:
          <input type="range" min={1} max={100} value={101 - Math.round(speed / 20)} onChange={e => setSpeed((101 - Number(e.target.value)) * 20)} />
          <span style={{ minWidth: '3rem', textAlign: 'right' }}>{speed}ms</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <Button onClick={togglePlay}>
          {playing ? 'Pause' : currentStep >= maxStep ? 'Done' : 'Play'}
        </Button>
        <Button onClick={() => goToStep('prev')} disabled={currentStep <= 0} variant="secondary">
          Previous Step
        </Button>
        <Button onClick={() => goToStep('next')} disabled={currentStep >= maxStep} variant="secondary">
          Next Step
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Step {currentStep}/{Math.max(maxStep, 0)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Comparisons: <strong>{comparisons}</strong>
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Swaps: <strong>{swaps}</strong>
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Time: <strong>{(elapsed / 1000).toFixed(2)}s</strong>
        </span>
      </div>

      {isMerge && diagramData && (
        <>
          <MergeSortDiagram
            array={array}
            currentStep={currentStep}
            totalSteps={diagramData.frames.length}
            step={step}
          />
          {activeSubarray && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                padding: '0.25rem 0',
              }}
            >
              {array.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '48px',
                    height: '4px',
                    borderRadius: '2px',
                    background: (idx >= activeSubarray.start && idx < activeSubarray.end)
                      ? '#3b82f6' : 'var(--border)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
      {algorithm === 'heap' && (
        <div style={{ marginBottom: '1rem' }}>
          <HeapSortDiagram
            array={array}
            step={step}
            started={started}
            steps={steps}
            currentStep={currentStep}
          />
        </div>
      )}
      {algorithm === 'quick' && (
        <QuickSortDiagram
          array={array}
          step={step}
          steps={steps}
          currentStep={currentStep}
        />
      )}
      {algorithm === 'insertion' && (
        <InsertionSortDiagram
          array={array}
          step={step}
        />
      )}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          padding: '1rem 0.5rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
        }}
        role="img"
        aria-label={`Sorting visualization for ${algorithm}`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '4px',
            minWidth: 'fit-content',
            padding: '0 0.5rem',
          }}
        >
          {array.flatMap((val, idx) => {
            const color = step ? getCellColor(idx, step) : CELL_COLORS.default;
            const isSwapping = step?.swapping.includes(idx);
            const isComparing = step?.comparing.includes(idx);
            const isInSubarray = activeSubarray && idx >= activeSubarray.start && idx < activeSubarray.end;
            const isInStepSubarray = step?.subarray && idx >= step.subarray.start && idx < step.subarray.end;
            const isHighlighted = isInSubarray || isInStepSubarray;

            const sortedSet = new Set(step?.sorted ?? []);
            const isSorted = sortedSet.has(idx);
            const lastSortedIdx = step?.sorted.length ? Math.max(...step.sorted) : -1;
            const isFirstUnsorted = idx === lastSortedIdx + 1 && lastSortedIdx >= 0;

            const swapPartner = isSwapping && step?.swapping && step.swapping.length === 2
              ? step.swapping[step.swapping[0] === idx ? 1 : 0]
              : undefined;
            const swapOffset = swapPartner !== undefined ? `${(swapPartner - idx) * 52}px` : '0px';

            const items: React.ReactNode[] = [];

            items.push(
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  animation: isSwapping
                    ? `swapArrive 0.4s ease-out`
                    : 'none',
                  '--swap-from': swapOffset,
                } as React.CSSProperties}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '6px',
                    border: isComparing
                      ? '3px solid #fff'
                      : isHighlighted
                        ? '2px solid #6366f1'
                        : isFirstUnsorted
                          ? '2px dashed #22c55e'
                          : '3px solid transparent',
                    boxShadow: isComparing
                      ? '0 0 12px rgba(245,158,11,0.6)'
                      : isHighlighted
                        ? 'inset 0 -3px 0 rgba(99,102,241,0.3), 0 2px 4px rgba(0,0,0,0.15)'
                        : '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'background 0.12s ease, border 0.12s ease, box-shadow 0.12s ease',
                    position: 'relative',
                  }}
                  title={`Index ${idx}: ${val}`}
                >
                  {val}
                  {isSwapping && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.65rem' }}>
                      🔄
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: isHighlighted ? '#6366f1' : 'var(--text-secondary)',
                    fontWeight: isHighlighted ? 700 : 500,
                  }}
                >
                  {idx}
                </span>
              </div>
            );

            return items;
          })}
        </div>
      </div>

      {step && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text)', textAlign: 'center', fontWeight: 500 }}>
          {step.description}
        </p>
      )}
      {step?.subarray && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Active sub-array: [{step.subarray.start}..{step.subarray.end - 1}]
        </div>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
        {Object.entries(CELL_COLORS).map(([state, color]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '14px', height: '14px', background: color, borderRadius: '3px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
