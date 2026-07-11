import type { AlgorithmType, GraphAlgorithmType } from '../types';
import { getComplexityValue } from './sorting';

export function getComplexityCurves(
  algoType: AlgorithmType | GraphAlgorithmType,
  maxN: number,
): { best: { x: number; y: number }[]; average: { x: number; y: number }[]; worst: { x: number; y: number }[] } {
  const points: number[] = [];
  const step = Math.max(1, Math.floor(maxN / 50));
  for (let n = 1; n <= maxN; n += step) points.push(n);
  if (points[points.length - 1] !== maxN) points.push(maxN);

  const complexityMap: Record<string, { best: string; average: string; worst: string }> = {
    bubble: { best: 'n', average: 'n²', worst: 'n²' },
    selection: { best: 'n²', average: 'n²', worst: 'n²' },
    insertion: { best: 'n', average: 'n²', worst: 'n²' },
    quick: { best: 'n log n', average: 'n log n', worst: 'n²' },
    heap: { best: 'n log n', average: 'n log n', worst: 'n log n' },
    bfs: { best: 'n', average: 'n', worst: 'n' },
    dfs: { best: 'n', average: 'n', worst: 'n' },
    dijkstra: { best: 'n log n', average: 'n log n', worst: 'n log n' },
  };

  const c = complexityMap[algoType] || { best: 'n²', average: 'n²', worst: 'n²' };

  return {
    best: points.map(n => ({ x: n, y: getComplexityValue(c.best, n) })),
    average: points.map(n => ({ x: n, y: getComplexityValue(c.average, n) })),
    worst: points.map(n => ({ x: n, y: getComplexityValue(c.worst, n) })),
  };
}
