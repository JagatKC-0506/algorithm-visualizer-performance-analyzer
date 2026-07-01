import { useState } from 'react';
import type { AlgorithmType, ArrayType, SortMetrics } from '../../types';
import { sortingAlgorithms } from '../../algorithms/sorting';
import { generateRandomArray, generateNearlySortedArray, generateReverseSortedArray } from '../../utils/helpers';
import { analyzeSortingAlgorithm } from '../../utils/sorting';
import Button from '../common/Button';

const SORTING_ALGORITHM_LIST: AlgorithmType[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

export default function PerformanceAnalyzer({ algorithm }: { algorithm: AlgorithmType }) {
  const [size, setSize] = useState(50);
  const [arrayType, setArrayType] = useState<ArrayType>('random');
  const [customArray, setCustomArray] = useState('');
  const [metrics, setMetrics] = useState<SortMetrics | null>(null);

  const runAnalysis = () => {
    let arr: number[];
    switch (arrayType) {
      case 'random':
        arr = generateRandomArray(size);
        break;
      case 'nearly-sorted':
        arr = generateNearlySortedArray(size);
        break;
      case 'reverse-sorted':
        arr = generateReverseSortedArray(size);
        break;
      case 'custom':
        arr = customArray.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        break;
    }
    const m = analyzeSortingAlgorithm(algorithm, arr);
    setMetrics(m);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Performance Analyzer</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Size:
          <input type="number" min={5} max={200} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '60px' }} />
        </label>
        <select value={arrayType} onChange={e => setArrayType(e.target.value as ArrayType)} style={{ padding: '0.375rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="random">Random Array</option>
          <option value="nearly-sorted">Nearly Sorted</option>
          <option value="reverse-sorted">Reverse Sorted</option>
          <option value="custom">Custom Array</option>
        </select>
        {arrayType === 'custom' && (
          <input
            type="text"
            placeholder="e.g., 5,3,8,1,9"
            value={customArray}
            onChange={e => setCustomArray(e.target.value)}
            style={{ padding: '0.375rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', flex: 1, minWidth: '200px' }}
          />
        )}
        <Button onClick={runAnalysis}>Analyze</Button>
      </div>
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Execution Time</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{(metrics.executionTime * 1000).toFixed(2)} µs</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Comparisons</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metrics.comparisons}</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Swaps</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metrics.swaps}</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Estimated Memory</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metrics.memoryEstimate} bytes</div>
          </div>
        </div>
      )}
    </div>
  );
}
