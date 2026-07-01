import { useState, useEffect, useRef, useCallback } from 'react';
import type { AlgorithmType, SortingVisualizerStep, ElementState } from '../../types';
import { sortingAlgorithms } from '../../algorithms/sorting';
import { generateRandomArray } from '../../utils/helpers';
import Button from '../common/Button';

interface Props {
  algorithm: AlgorithmType;
}

const BAR_COLORS: Record<ElementState, string> = {
  default: 'var(--accent)',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#22c55e',
  current: '#3b82f6',
  pivot: '#8b5cf6',
  subarray: '#6366f1',
  merging: '#14b8a6',
};

export default function SortingVisualizer({ algorithm }: Props) {
  const [array, setArray] = useState<number[]>([]);
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(100);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SortingVisualizerStep[]>([]);
  const [playing, setPlaying] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const playRef = useRef(false);

  const getBarColor = (idx: number, step: SortingVisualizerStep): string => {
    if (step.sorted.includes(idx)) return BAR_COLORS.sorted;
    if (step.swapping.includes(idx)) return BAR_COLORS.swapping;
    if (step.comparing.includes(idx)) return BAR_COLORS.comparing;
    if (step.pivot !== undefined && idx === step.pivot) return BAR_COLORS.pivot;
    if (step.current === idx) return BAR_COLORS.current;
    return BAR_COLORS.default;
  };

  const generateNewArray = useCallback(() => {
    const arr = generateRandomArray(size, 5, 100);
    setArray(arr);
    const newSteps = sortingAlgorithms[algorithm].steps(arr);
    setSteps(newSteps);
    setCurrentStep(0);
    setPlaying(false);
    setComparisons(0);
    setSwaps(0);
    setStartTime(null);
    setElapsed(0);
  }, [algorithm, size]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  useEffect(() => {
    if (playing && currentStep < steps.length - 1) {
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
  }, [playing, speed, steps.length]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setArray(step.array);
      if (step.description.toLowerCase().includes('compar')) {
        setComparisons(p => p + 1);
      }
      if (step.description.toLowerCase().includes('swapp')) {
        setSwaps(p => p + 1);
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
    if (currentStep >= steps.length - 1) return;
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
    if (dir === 'next' && currentStep < steps.length - 1) {
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
    const arr = generateRandomArray(size, 5, 100);
    setArray(arr);
    const newSteps = sortingAlgorithms[algorithm].steps(arr);
    setSteps(newSteps);
  };

  const step = currentStep < steps.length ? steps[currentStep] : null;
  const maxVal = Math.max(...array, 1);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <Button onClick={generateNewArray}>Generate New Array</Button>
        <Button onClick={restart} variant="secondary">Restart</Button>
        <Button onClick={() => { const arr = [...array].sort(() => Math.random() - 0.5); setArray(arr); }} variant="secondary">Shuffle</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Size:
          <input type="range" min={5} max={50} value={size} onChange={e => setSize(Number(e.target.value))} />
          <span style={{ minWidth: '2rem' }}>{size}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Speed:
          <input type="range" min={10} max={500} value={1100 - speed} onChange={e => setSpeed(1100 - Number(e.target.value))} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <Button onClick={togglePlay}>
          {playing ? 'Pause' : currentStep >= steps.length - 1 ? 'Done' : 'Play'}
        </Button>
        <Button onClick={() => goToStep('prev')} disabled={currentStep <= 0} variant="secondary">
          Previous Step
        </Button>
        <Button onClick={() => goToStep('next')} disabled={currentStep >= steps.length - 1} variant="secondary">
          Next Step
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Step {currentStep}/{steps.length - 1}
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
      <div
        style={{
          width: '100%',
          height: '350px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          padding: '0.5rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          position: 'relative',
        }}
        role="img"
        aria-label={`Sorting visualization for ${algorithm}`}
      >
        {array.map((val, idx) => {
          const barHeight = (val / maxVal) * 300;
          const color = step ? getBarColor(idx, step) : BAR_COLORS.default;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${Math.max(barHeight, 4)}px`,
                background: color,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.08s ease, background 0.15s ease',
                minWidth: '4px',
              }}
              title={`Index ${idx}: ${val}`}
            />
          );
        })}
      </div>
      {step && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          {step.description}
        </p>
      )}
      {step?.subarray && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Active sub-array: [{step.subarray.start}..{step.subarray.end - 1}]
        </div>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
        {Object.entries(BAR_COLORS).map(([state, color]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', background: color, borderRadius: '2px', display: 'inline-block' }} />
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
