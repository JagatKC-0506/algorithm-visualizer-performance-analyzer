import type { SortingVisualizerStep } from '../../types';

export function bubbleSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: a.slice(n - i).map((_, idx) => n - i + idx),
        current: j,
        subarray: { start: 0, end: n - i },
        description: `Comparing a[${j}] = ${a[j]} and a[${j + 1}] = ${a[j + 1]}`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: a.slice(n - i).map((_, idx) => n - i + idx),
          current: j + 1,
          subarray: { start: 0, end: n - i },
          description: `Swapped a[${j}] and a[${j + 1}]`,
        });
        swapped = true;
      }
    }
    if (!swapped) {
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: a.map((_, idx) => idx),
        current: -1,
        subarray: { start: 0, end: n },
        description: 'No swaps in this pass. Array is sorted!',
      });
      break;
    }
  }
  return steps;
}

export function bubbleSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

export function bubbleSortMetrics(arr: number[]): { comparisons: number; swaps: number; memoryEstimate: number } {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { comparisons, swaps, memoryEstimate: 4 };
}
