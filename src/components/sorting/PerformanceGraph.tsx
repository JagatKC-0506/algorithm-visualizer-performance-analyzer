import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AlgorithmType, GraphAlgorithmType } from '../../types';
import { getComplexityCurves } from '../../utils/complexityData';

interface Props {
  algorithm: AlgorithmType | GraphAlgorithmType;
}

const COLORS = { best: '#22c55e', average: '#f59e0b', worst: '#ef4444' };

export default function PerformanceGraph({ algorithm }: Props) {
  const [showBest, setShowBest] = useState(true);
  const [showAvg, setShowAvg] = useState(true);
  const [showWorst, setShowWorst] = useState(true);
  const [maxN, setMaxN] = useState(100);

  const curves = getComplexityCurves(algorithm, maxN);

  const merged: { x: number; best?: number; average?: number; worst?: number }[] = curves.best.map((p, i) => ({
    x: p.x,
    best: showBest ? p.y : undefined,
    average: showAvg ? curves.average[i]?.y : undefined,
    worst: showWorst ? curves.worst[i]?.y : undefined,
  }));

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Performance Graph</h3>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showBest} onChange={e => setShowBest(e.target.checked)} />
          <span style={{ color: COLORS.best, fontWeight: 500 }}>Best Case</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showAvg} onChange={e => setShowAvg(e.target.checked)} />
          <span style={{ color: COLORS.average, fontWeight: 500 }}>Average Case</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showWorst} onChange={e => setShowWorst(e.target.checked)} />
          <span style={{ color: COLORS.worst, fontWeight: 500 }}>Worst Case</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Max N:
          <input type="range" min={10} max={500} value={maxN} onChange={e => setMaxN(Number(e.target.value))} />
          <span>{maxN}</span>
        </label>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={merged} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="x" label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5 }} stroke="var(--text-secondary)" />
          <YAxis label={{ value: 'Operations', angle: -90, position: 'insideLeft' }} stroke="var(--text-secondary)" />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }} />
          <Legend />
          {showBest && <Line type="monotone" dataKey="best" stroke={COLORS.best} dot={false} strokeWidth={2} name="Best Case" />}
          {showAvg && <Line type="monotone" dataKey="average" stroke={COLORS.average} dot={false} strokeWidth={2} name="Average Case" />}
          {showWorst && <Line type="monotone" dataKey="worst" stroke={COLORS.worst} dot={false} strokeWidth={2} name="Worst Case" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
