import type { GraphData, GraphStep } from '../../types';

export function bfsSteps(graph: GraphData, start: number): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<number>();
  const queue: number[] = [start];
  const exploredEdges: { from: number; to: number }[] = [];
  const pathEdges: { from: number; to: number }[] = [];
  const distances = new Map<number, number>();
  const parent = new Map<number, number | null>();
  const visitedNodes: number[] = [];

  visited.add(start);
  visitedNodes.push(start);
  distances.set(start, 0);
  parent.set(start, null);

  steps.push({
    visitedNodes: [...visitedNodes],
    currentNode: -1,
    queue: [...queue],
    stack: [],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: [],
    distances: new Map(distances),
    description: `Starting BFS from node ${start}`,
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    steps.push({
      visitedNodes: [...visitedNodes],
      currentNode: node,
      queue: [...queue],
      stack: [],
      priorityQueue: [],
      exploredEdges: [...exploredEdges],
      pathEdges: [],
      distances: new Map(distances),
      description: `Dequeued node ${node}, visiting its neighbors`,
    });

    const neighbors = graph.adjacencyList.get(node) || [];
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        visitedNodes.push(to);
        queue.push(to);
        parent.set(to, node);
        distances.set(to, distances.get(node)! + 1);
        exploredEdges.push({ from: node, to });
        steps.push({
          visitedNodes: [...visitedNodes],
          currentNode: node,
          queue: [...queue],
          stack: [],
          priorityQueue: [],
          exploredEdges: [...exploredEdges],
          pathEdges: [],
          distances: new Map(distances),
          description: `Visited neighbor ${to} from node ${node}. Distance: ${distances.get(to)}`,
        });
      }
    }
  }

  const finalPath: { from: number; to: number }[] = [];
  const endNodes = Array.from(distances.entries()).filter(([, d]) => d > 0);
  if (endNodes.length > 0) {
    let target = endNodes[endNodes.length - 1][0];
    while (parent.get(target) !== null && parent.get(target) !== undefined) {
      const p = parent.get(target)!;
      finalPath.unshift({ from: p, to: target });
      target = p;
    }
  }

  steps.push({
    visitedNodes: [...visitedNodes],
    currentNode: -1,
    queue: [...queue],
    stack: [],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: finalPath,
    distances: new Map(distances),
    description: 'BFS complete! All reachable nodes visited.',
  });

  return steps;
}
