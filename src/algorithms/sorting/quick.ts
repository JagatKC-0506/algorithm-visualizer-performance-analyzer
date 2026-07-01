import type { SortingVisualizerStep } from '../../types';

export function quickSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const pivotIdx = partition(low, high);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [],
        current: -1,
        pivot: pivotIdx,
        subarray: { start: low, end: high },
        description: `Pivot a[${pivotIdx}] = ${a[pivotIdx]} is in its final position`,
      });
      quickSort(low, pivotIdx - 1);
      quickSort(pivotIdx + 1, high);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      current: -1,
      pivot: high,
      subarray: { start: low, end: high },
      description: `Partitioning: pivot = a[${high}] = ${pivot}`,
    });
    for (let j = low; j < high; j++) {
      steps.push({
        array: [...a],
        comparing: [j, high],
        swapping: [],
        sorted: [],
        current: j,
        pivot: high,
        subarray: { start: low, end: high },
        description: `Comparing a[${j}] = ${a[j]} with pivot ${pivot}`,
      });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({
            array: [...a],
            comparing: [],
            swapping: [i, j],
            sorted: [],
            current: i,
            pivot: high,
            subarray: { start: low, end: high },
            description: `Swapped a[${i}] with a[${j}]: ${a[i]} ↔ ${a[j]}`,
          });
        }
      }
    }
    if (i + 1 !== high) {
      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [i + 1, high],
        sorted: [],
        current: i + 1,
        pivot: i + 1,
        subarray: { start: low, end: high },
        description: `Placed pivot ${pivot} at position ${i + 1}`,
      });
    }
    return i + 1;
  }

  quickSort(0, n - 1);
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

export function quickSort(arr: number[]): number[] {
  const a = [...arr];
  function quickSortRec(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSortRec(low, pi - 1);
      quickSortRec(pi + 1, high);
    }
  }
  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    return i + 1;
  }
  quickSortRec(0, a.length - 1);
  return a;
}

export function quickSortMetrics(arr: number[]): { comparisons: number; swaps: number; memoryEstimate: number } {
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;
  function quickSortRec(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSortRec(low, pi - 1);
      quickSortRec(pi + 1, high);
    }
  }
  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) swaps++;
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    swaps++;
    return i + 1;
  }
  quickSortRec(0, a.length - 1);
  return { comparisons, swaps, memoryEstimate: a.length * 4 + 8 };
}
