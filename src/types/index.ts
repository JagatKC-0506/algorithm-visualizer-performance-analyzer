export type AlgorithmType = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';
export type GraphAlgorithmType = 'bfs' | 'dfs' | 'dijkstra';
export type ComplexityCase = 'best' | 'average' | 'worst';
export type ArrayType = 'random' | 'nearly-sorted' | 'reverse-sorted' | 'custom';
export type ElementState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'current' | 'pivot' | 'subarray' | 'merging';
export type NodeState = 'unvisited' | 'visiting' | 'visited' | 'current' | 'path';
export type EdgeState = 'default' | 'exploring' | 'visited' | 'path';

export interface SortingVisualizerStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  current: number;
  pivot?: number;
  subarray?: { start: number; end: number };
  description: string;
}

export interface SortMetrics {
  comparisons: number;
  swaps: number;
  executionTime: number;
  memoryEstimate: number;
}

export interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  state: NodeState;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  state: EdgeState;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<number, { to: number; weight: number }[]>;
}

export interface GraphStep {
  visitedNodes: number[];
  currentNode: number;
  queue: number[];
  stack: number[];
  priorityQueue: { node: number; dist: number }[];
  exploredEdges: { from: number; to: number }[];
  pathEdges: { from: number; to: number }[];
  distances: Map<number, number>;
  description: string;
}

export interface GraphMetrics {
  executionTime: number;
  visitedNodes: number;
  traversedEdges: number;
  memoryEstimate: number;
  pathLength: number;
}

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable: boolean;
  inPlace: boolean;
  bestUseCase: string;
  description: string;
  workingPrinciple: string;
  pseudocode: string[];
  steps: string[];
  advantages: string[];
  disadvantages: string[];
  commonMistakes: string[];
  realWorldApps: string[];
  whenToUse: string;
  whenNotToUse: string;
}

export interface GraphAlgorithmInfo {
  id: GraphAlgorithmType;
  name: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable: boolean;
  inPlace: boolean;
  bestUseCase: string;
  description: string;
  workingPrinciple: string;
  pseudocode: string[];
  steps: string[];
  applications: string[];
  advantages: string[];
  disadvantages: string[];
  commonMistakes: string[];
  realWorldApps: string[];
  whenToUse: string;
  whenNotToUse: string;
}

export interface ComplexityDetail {
  case: ComplexityCase;
  notation: string;
  explanation: string[];
  lineByLine: { line: string; cost: string; count: string }[];
  derivation: string[];
  recurrenceRelation?: string;
  recursionTree?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SortResult {
  algorithm: AlgorithmType;
  metrics: SortMetrics;
  sortedArray: number[];
}
