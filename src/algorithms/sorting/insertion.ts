import type { SortingVisualizerStep } from '../../types';

export function insertionSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    const sortedBefore = a.slice(0, i).map((_, idx) => idx);

    steps.push({
      array: [...a],
      comparing: [i],
      swapping: [],
      sorted: sortedBefore,
      current: i,
      subarray: { start: 0, end: i + 1 },
      description: `Pick a[${i}] = ${key} to insert into sorted portion [0..${i - 1}]`,
    });

    while (j >= 0 && a[j] > key) {
      steps.push({
        array: [...a],
        comparing: [j],
        swapping: [],
        sorted: sortedBefore,
        current: j + 1,
        subarray: { start: j, end: i + 1 },
        description: `a[${j}] = ${a[j]} > key ${key}  →  shift a[${j}] right`,
      });

      a[j + 1] = a[j];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [j, j + 1],
        sorted: sortedBefore,
        current: j,
        subarray: { start: j, end: i + 1 },
        description: `Shifted a[${j}] → a[${j + 1}]   (gap now at ${j})`,
      });
      j--;
    }

    if (j + 1 !== i) {
      a[j + 1] = key;
    }
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: a.slice(0, i + 1).map((_, idx) => idx),
      current: j + 1,
      subarray: { start: 0, end: i + 1 },
      description: `Inserted ${key} at position ${j + 1}  →  [0..${i}] now sorted`,
    });
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

export function insertionSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}

export function insertionSortMetrics(arr: number[]): { comparisons: number; shifts: number; memoryEstimate: number } {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let shifts = 0;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      comparisons++;
      a[j + 1] = a[j];
      shifts++;
      j--;
    }
    if (j >= 0) comparisons++;
    a[j + 1] = key;
  }
  return { comparisons, shifts, memoryEstimate: 4 };
}
