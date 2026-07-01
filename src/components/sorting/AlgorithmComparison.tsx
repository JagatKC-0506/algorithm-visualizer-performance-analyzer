import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AlgorithmType, ArrayType, SortMetrics } from '../../types';
import { SORTING_ALGORITHMS } from '../../types/algorithms';
import { generateRandomArray } from '../../utils/helpers';
import { analyzeSortingAlgorithm } from '../../utils/sorting';
import Button from '../common/Button';

const ALL_ALGORITHMS: AlgorithmType[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

export default function AlgorithmComparison() {
  const [selected, setSelected] = useState<AlgorithmType[]>(['bubble', 'merge', 'quick']);
  const [size, setSize] = useState(100);
  const [arrayType, setArrayType] = useState<ArrayType>('random');
  const [results, setResults] = useState<{ algorithm: AlgorithmType; metrics: SortMetrics }[]>([]);

  const toggleAlgo = (algo: AlgorithmType) => {
    setSelected(prev =>
      prev.includes(algo) ? prev.filter(a => a !== algo) : [...prev, algo],
    );
  };

  const runComparison = () => {
    const arr = generateRandomArray(size);
    const res = selected.map(algo => ({
      algorithm: algo,
      metrics: analyzeSortingAlgorithm(algo, [...arr]),
    }));
    setResults(res);
  };

  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    return results.map(r => ({
      name: SORTING_ALGORITHMS[r.algorithm]?.name || r.algorithm,
      'Time (µs)': Number((r.metrics.executionTime * 1000).toFixed(2)),
      Comparisons: r.metrics.comparisons,
      Swaps: r.metrics.swaps,
    }));
  }, [results]);

  const best = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((a, b) => a.metrics.executionTime < b.metrics.executionTime ? a : b);
  }, [results]);

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Algorithm Comparison</h3>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {ALL_ALGORITHMS.map(algo => (
          <label key={algo} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={selected.includes(algo)} onChange={() => toggleAlgo(algo)} />
            {SORTING_ALGORITHMS[algo]?.name || algo}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Size:
          <input type="number" min={5} max={500} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '60px' }} />
        </label>
        <select value={arrayType} onChange={e => setArrayType(e.target.value as ArrayType)} style={{ padding: '0.375rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="random">Random Array</option>
          <option value="nearly-sorted">Nearly Sorted</option>
          <option value="reverse-sorted">Reverse Sorted</option>
        </select>
        <Button onClick={runComparison}>Compare</Button>
      </div>
      {results.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {results.map(r => {
              const info = SORTING_ALGORITHMS[r.algorithm];
              const isWinner = best && r.algorithm === best.algorithm;
              return (
                <div key={r.algorithm} style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '0.5rem', border: `2px solid ${isWinner ? '#22c55e' : 'var(--border)'}`, position: 'relative' }}>
                  {isWinner && <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.7rem', background: '#22c55e', color: '#fff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>Winner</span>}
                  <h4 style={{ marginBottom: '0.75rem' }}>{info?.name}</h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Time', `${(r.metrics.executionTime * 1000).toFixed(2)} µs`],
                        ['Comparisons', String(r.metrics.comparisons)],
                        ['Swaps', String(r.metrics.swaps)],
                        ['Memory', `${r.metrics.memoryEstimate} B`],
                        ['Time Complexity', `${info?.timeComplexity.best} / ${info?.timeComplexity.average} / ${info?.timeComplexity.worst}`],
                        ['Space Complexity', info?.spaceComplexity || ''],
                        ['Stable', info?.stable ? 'Yes' : 'No'],
                        ['In-place', info?.inPlace ? 'Yes' : 'No'],
                        ['Best Use', info?.bestUseCase || ''],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={{ padding: '0.25rem 0.5rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{label}</td>
                          <td style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border)' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }} />
              <Legend />
              <Bar dataKey="Time (µs)" fill="#3b82f6" />
              <Bar dataKey="Comparisons" fill="#f59e0b" />
              <Bar dataKey="Swaps" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
