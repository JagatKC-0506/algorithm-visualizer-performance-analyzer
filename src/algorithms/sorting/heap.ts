import type { SortingVisualizerStep } from '../../types';

export function heapSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;
  let heapifiedStart = n;

  function makeStep(
    opts: Partial<SortingVisualizerStep> & { description: string },
  ): SortingVisualizerStep {
    return {
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      current: -1,
      ...opts,
    };
  }

  function heapify(size: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    const sorted = size === n
      ? Array.from({ length: n - heapifiedStart }, (_, k) => heapifiedStart + k)
      : Array.from({ length: n - size }, (_, k) => size + k);

    if (left < size) {
      steps.push(makeStep({
        comparing: [left, largest],
        sorted,
        current: i,
        subarray: { start: 0, end: size },
        description: `Heapify: comparing a[${left}] = ${a[left]} with a[${largest}] = ${a[largest]}`,
      }));
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      steps.push(makeStep({
        comparing: [right, largest],
        sorted,
        current: i,
        subarray: { start: 0, end: size },
        description: `Heapify: comparing a[${right}] = ${a[right]} with a[${largest}] = ${a[largest]}`,
      }));
      if (a[right] > a[largest]) largest = right;
    }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push(makeStep({
        swapping: [i, largest],
        sorted,
        current: i,
        subarray: { start: 0, end: size },
        description: `Swapped a[${i}] with a[${largest}]: ${a[i]} ↔ ${a[largest]}`,
      }));
      heapify(size, largest);
    }
  }

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapifiedStart = i + 1;
    steps.push(makeStep({
      sorted: Array.from({ length: n - heapifiedStart }, (_, k) => heapifiedStart + k),
      current: i,
      subarray: { start: heapifiedStart, end: n },
      description: `Building max-heap: heapifying at index ${i}`,
    }));
    heapify(n, i);
  }

  // Extract phase
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    steps.push(makeStep({
      swapping: [0, i],
      sorted: Array.from({ length: n - i }, (_, k) => i + k),
      current: 0,
      subarray: { start: 0, end: i },
      description: `Extracted max: swapped a[0] with a[${i}]`,
    }));
    heapify(i, 0);
  }

  steps.push(makeStep({
    sorted: a.map((_, idx) => idx),
    current: -1,
    description: 'Array is fully sorted!',
  }));
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
