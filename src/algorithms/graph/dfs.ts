import type { GraphData, GraphStep } from '../../types';

export function dfsSteps(graph: GraphData, start: number): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<number>();
  const stack: number[] = [start];
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
    queue: [],
    stack: [...stack],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: [],
    distances: new Map(distances),
    description: `Starting DFS from node ${start}`,
  });

  while (stack.length > 0) {
    const node = stack.pop()!;
    steps.push({
      visitedNodes: [...visitedNodes],
      currentNode: node,
      queue: [],
      stack: [...stack],
      priorityQueue: [],
      exploredEdges: [...exploredEdges],
      pathEdges: [],
      distances: new Map(distances),
      description: `Popped node ${node} from stack, exploring its neighbors`,
    });

    const neighbors = graph.adjacencyList.get(node) || [];
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        visitedNodes.push(to);
        stack.push(to);
        parent.set(to, node);
        distances.set(to, distances.get(node)! + 1);
        exploredEdges.push({ from: node, to });
        steps.push({
          visitedNodes: [...visitedNodes],
          currentNode: node,
          queue: [],
          stack: [...stack],
          priorityQueue: [],
          exploredEdges: [...exploredEdges],
          pathEdges: [],
          distances: new Map(distances),
          description: `Discovered neighbor ${to} from node ${node}. Depth level: ${distances.get(to)}`,
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
    queue: [],
    stack: [...stack],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: finalPath,
    distances: new Map(distances),
    description: 'DFS complete! All reachable nodes visited.',
  });

  return steps;
}
