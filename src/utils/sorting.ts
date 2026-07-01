import type { SortMetrics, AlgorithmType } from '../types';
import { sortingAlgorithms } from '../algorithms/sorting';

export function analyzeSortingAlgorithm(
  algorithm: AlgorithmType,
  array: number[],
): SortMetrics {
  const start = performance.now();
  sortingAlgorithms[algorithm].sort(array);
  const end = performance.now();
  const metrics = sortingAlgorithms[algorithm].metrics(array);
  return {
    comparisons: metrics.comparisons,
    swaps: metrics.swaps ?? metrics.shifts ?? 0,
    executionTime: end - start,
    memoryEstimate: metrics.memoryEstimate,
  };
}

export function getComplexityValue(notation: string, n: number): number {
  const cleaned = notation.replace(/O\(|\)/g, '').trim();
  if (cleaned === '1' || cleaned === 'c') return 1;
  if (cleaned === 'n') return n;
  if (cleaned === 'n²' || cleaned === 'n^2') return n * n;
  if (cleaned === 'n log n' || cleaned === 'n log(n)' || cleaned === 'nlogn') return n * Math.log2(n);
  if (cleaned === 'log n' || cleaned === 'log(n)') return Math.log2(n);
  if (cleaned === 'v + e' || cleaned === 'v+e') return n;
  if (cleaned === 'v + e log v' || cleaned === 'v + e log(v)') return n * Math.log2(n);
  return n * Math.log2(n);
}
