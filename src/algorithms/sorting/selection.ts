import type { SortingVisualizerStep } from '../../types';

export function selectionSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    const sorted = a.slice(0, i).map((_, idx) => idx);
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...a],
        comparing: [j, minIdx],
        swapping: [],
        sorted,
        current: i,
        description: `Finding minimum: comparing a[${j}] = ${a[j]} with current min a[${minIdx}] = ${a[minIdx]}`,
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [i, minIdx],
        sorted: sorted,
        current: i,
        description: `Swapped a[${i}] with a[${minIdx}]: ${a[i]} ↔ ${a[minIdx]}`,
      });
    }
  }
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: a.map((_, idx) => idx),
    current: -1,
    description: 'Array is fully sorted!',
  });
  return steps;
}

export function selectionSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}

export function selectionSortMetrics(arr: number[]): { comparisons: number; swaps: number; memoryEstimate: number } {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
    }
  }
  return { comparisons, swaps, memoryEstimate: 4 };
}
