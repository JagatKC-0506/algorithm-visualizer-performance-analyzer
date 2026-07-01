import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GraphAlgorithmType, GraphMetrics } from '../../types';

interface Props {
  results: { algorithm: GraphAlgorithmType; metrics: GraphMetrics }[];
}

export default function GraphComparison({ results }: Props) {
  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    return results.map(r => ({
      name: r.algorithm.toUpperCase(),
      'Time (µs)': Number((r.metrics.executionTime * 1000).toFixed(2)),
      'Visited': r.metrics.visitedNodes,
      'Edges': r.metrics.traversedEdges,
    }));
  }, [results]);

  if (results.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>Run analysis to see comparison results.</p>;
  }

  const best = results.reduce((a, b) => a.metrics.executionTime < b.metrics.executionTime ? a : b);

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Graph Algorithm Comparison</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {results.map(r => {
          const isWinner = best && r.algorithm === best.algorithm;
          return (
            <div key={r.algorithm} style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', border: `2px solid ${isWinner ? '#22c55e' : 'var(--border)'}`, position: 'relative' }}>
              {isWinner && <span style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', fontSize: '0.7rem', background: '#22c55e', color: '#fff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>Fastest</span>}
              <h4 style={{ marginBottom: '0.5rem' }}>{r.algorithm.toUpperCase()}</h4>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Time', `${(r.metrics.executionTime * 1000).toFixed(2)} µs`],
                    ['Visited Nodes', String(r.metrics.visitedNodes)],
                    ['Traversed Edges', String(r.metrics.traversedEdges)],
                    ['Memory', `${r.metrics.memoryEstimate} B`],
                    ['Path Length', String(r.metrics.pathLength)],
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
          <Bar dataKey="Visited" fill="#f59e0b" />
          <Bar dataKey="Edges" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
