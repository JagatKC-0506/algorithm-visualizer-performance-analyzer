import type { SortingVisualizerStep } from '../../types';

export function heapSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;

  function heapify(size: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      steps.push({
        array: [...a],
        comparing: [left, largest],
        swapping: [],
        sorted: a.slice(size).map((_, idx) => size + idx),
        current: i,
        description: `Heapify: comparing a[${left}] = ${a[left]} with a[${largest}] = ${a[largest]}`,
      });
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      steps.push({
        array: [...a],
        comparing: [right, largest],
        swapping: [],
        sorted: a.slice(size).map((_, idx) => size + idx),
        current: i,
        description: `Heapify: comparing a[${right}] = ${a[right]} with a[${largest}] = ${a[largest]}`,
      });
      if (a[right] > a[largest]) largest = right;
    }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [i, largest],
        sorted: a.slice(size).map((_, idx) => size + idx),
        current: i,
        description: `Swapped a[${i}] with a[${largest}]: ${a[i]} ↔ ${a[largest]}`,
      });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      current: i,
      description: `Building max-heap: heapifying at index ${i}`,
    });
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [0, i],
      sorted: a.slice(i).map((_, idx) => i + idx),
      current: 0,
      description: `Extracted max: swapped a[0] with a[${i}]`,
    });
    heapify(i, 0);
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

export function heapSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  function heapify(size: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(size, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    heapify(i, 0);
  }
  return a;
}

export function heapSortMetrics(arr: number[]): { comparisons: number; swaps: number; memoryEstimate: number } {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  function heapify(size: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < size) {
      comparisons++;
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      comparisons++;
      if (a[right] > a[largest]) largest = right;
    }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      swaps++;
      heapify(size, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    swaps++;
    heapify(i, 0);
  }
  return { comparisons, swaps, memoryEstimate: 4 };
}
