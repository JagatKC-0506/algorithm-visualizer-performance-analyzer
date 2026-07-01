import type { GraphAlgorithmType, GraphMetrics } from '../types';
import { graphAlgorithms } from '../algorithms/graph';
import type { GraphData } from '../types';

export function analyzeGraphAlgorithm(
  algorithm: GraphAlgorithmType,
  graph: GraphData,
  start: number,
): GraphMetrics {
  const steps = graphAlgorithms[algorithm].steps(graph, start);
  const lastStep = steps[steps.length - 1];
  const startTime = performance.now();
  const allSteps = graphAlgorithms[algorithm].steps(graph, start);
  const endTime = performance.now();

  return {
    executionTime: endTime - startTime,
    visitedNodes: lastStep.visitedNodes.length,
    traversedEdges: lastStep.exploredEdges.length,
    memoryEstimate: graph.nodes.length * 8 + lastStep.visitedNodes.length * 4,
    pathLength: lastStep.pathEdges.length,
  };
}
