export { bubbleSortSteps, bubbleSort, bubbleSortMetrics } from './bubble';
export { selectionSortSteps, selectionSort, selectionSortMetrics } from './selection';
export { insertionSortSteps, insertionSort, insertionSortMetrics } from './insertion';
export { mergeSortSteps, mergeSort, mergeSortMetrics } from './merge';
export { quickSortSteps, quickSort, quickSortMetrics } from './quick';
export { heapSortSteps, heapSort, heapSortMetrics } from './heap';

import type { AlgorithmType, SortingVisualizerStep } from '../../types';
import { bubbleSortSteps, bubbleSort, bubbleSortMetrics } from './bubble';
import { selectionSortSteps, selectionSort, selectionSortMetrics } from './selection';
import { insertionSortSteps, insertionSort, insertionSortMetrics } from './insertion';
import { mergeSortSteps, mergeSort, mergeSortMetrics } from './merge';
import { quickSortSteps, quickSort, quickSortMetrics } from './quick';
import { heapSortSteps, heapSort, heapSortMetrics } from './heap';

export const sortingAlgorithms: Record<AlgorithmType, {
  steps: (arr: number[]) => SortingVisualizerStep[];
  sort: (arr: number[]) => number[];
  metrics: (arr: number[]) => { comparisons: number; swaps?: number; shifts?: number; memoryEstimate: number };
}> = {
  bubble: { steps: bubbleSortSteps, sort: bubbleSort, metrics: bubbleSortMetrics },
  selection: { steps: selectionSortSteps, sort: selectionSort, metrics: selectionSortMetrics },
  insertion: { steps: insertionSortSteps, sort: insertionSort, metrics: insertionSortMetrics },
  merge: { steps: mergeSortSteps, sort: mergeSort, metrics: mergeSortMetrics },
  quick: { steps: quickSortSteps, sort: quickSort, metrics: quickSortMetrics },
  heap: { steps: heapSortSteps, sort: heapSort, metrics: heapSortMetrics },
};
