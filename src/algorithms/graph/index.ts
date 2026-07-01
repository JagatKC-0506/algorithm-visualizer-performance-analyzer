export { bfsSteps } from './bfs';
export { dfsSteps } from './dfs';
export { dijkstraSteps } from './dijkstra';

import type { GraphAlgorithmType, GraphData, GraphStep } from '../../types';
import { bfsSteps } from './bfs';
import { dfsSteps } from './dfs';
import { dijkstraSteps } from './dijkstra';

export const graphAlgorithms: Record<GraphAlgorithmType, {
  steps: (graph: GraphData, start: number) => GraphStep[];
}> = {
  bfs: { steps: bfsSteps },
  dfs: { steps: dfsSteps },
  dijkstra: { steps: dijkstraSteps },
};
