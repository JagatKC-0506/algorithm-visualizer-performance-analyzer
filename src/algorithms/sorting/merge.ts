import type { SortingVisualizerStep } from '../../types';

export function mergeSortSteps(arr: number[]): SortingVisualizerStep[] {
  const steps: SortingVisualizerStep[] = [];
  const a = [...arr];
  const n = a.length;

  function mergeSort(start: number, end: number): number[] {
    if (end - start <= 1) {
      return a.slice(start, end);
    }
    const mid = Math.floor((start + end) / 2);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      current: -1,
      subarray: { start, end },
      description: `Dividing array from index ${start} to ${end - 1}, midpoint = ${mid}`,
    });
    mergeSort(start, mid);
    mergeSort(mid, end);
    merge(start, mid, end);
    return a.slice(start, end);
  }

  function merge(start: number, mid: number, end: number): void {
    const left = a.slice(start, mid);
    const right = a.slice(mid, end);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
      steps.push({
        array: [...a],
        comparing: [start + i, mid + j],
        swapping: [],
        sorted: [],
        current: k,
        subarray: { start, end },
        description: `Merging: comparing left[${i}] = ${left[i]} and right[${j}] = ${right[j]}`,
      });
      if (left[i] <= right[j]) {
        a[k] = left[i];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [k],
          sorted: [],
          current: k,
          subarray: { start, end },
          description: `Placed left[${i}] = ${left[i]} at position ${k}`,
        });
        i++;
      } else {
        a[k] = right[j];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [k],
          sorted: [],
          current: k,
          subarray: { start, end },
          description: `Placed right[${j}] = ${right[j]} at position ${k}`,
        });
        j++;
      }
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [k],
        sorted: [],
        current: k,
        subarray: { start, end },
        description: `Placed remaining left[${i}] = ${left[i]} at position ${k}`,
      });
      i++; k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [k],
        sorted: [],
        current: k,
        subarray: { start, end },
        description: `Placed remaining right[${j}] = ${right[j]} at position ${k}`,
      });
      j++; k++;
    }
  }

  mergeSort(0, n);
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

export function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

export function mergeSortMetrics(arr: number[]): { comparisons: number; memoryEstimate: number } {
  let comparisons = 0;
  function mergeSort(a: number[]): number[] {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const left = mergeSort(a.slice(0, mid));
    const right = mergeSort(a.slice(mid));
    const result: number[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i] <= right[j]) result.push(left[i++]);
      else result.push(right[j++]);
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
  mergeSort([...arr]);
  return { comparisons, memoryEstimate: arr.length * 4 + 4 };
}
