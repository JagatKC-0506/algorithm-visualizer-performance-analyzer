import type { GraphData, GraphStep } from '../../types';

export function bfsSteps(graph: GraphData, start: number, destination?: number): GraphStep[] {
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
    phase: 'exploring',
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
      phase: 'exploring',
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
        const reachedDest = to === destination;
        steps.push({
          visitedNodes: [...visitedNodes],
          currentNode: node,
          queue: [...queue],
          stack: [],
          priorityQueue: [],
          exploredEdges: [...exploredEdges],
          pathEdges: [],
          distances: new Map(distances),
          description: reachedDest
            ? `Reached destination node ${to}! Distance: ${distances.get(to)}`
            : `Visited neighbor ${to} from node ${node}. Distance: ${distances.get(to)}`,
          phase: 'exploring',
        });
        if (destination !== undefined && to === destination) {
          const path: { from: number; to: number }[] = [];
          let cur = to;
          while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
            const p = parent.get(cur)!;
            path.unshift({ from: p, to: cur });
            cur = p;
          }
          steps.push({
            visitedNodes: [...visitedNodes],
            currentNode: -1,
            queue: [...queue],
            stack: [],
            priorityQueue: [],
            exploredEdges: [...exploredEdges],
            pathEdges: path,
            distances: new Map(distances),
            description: `BFS complete! Shortest path found from ${start} to ${destination}: ${path.map(e => `${e.from}\u2192${e.to}`).join(' ')}`,
          phase: 'path-found',
        });
          return steps;
        }
      }
    }
  }

  const finalPath: { from: number; to: number }[] = [];
  let target: number | undefined = destination;
  if (target === undefined || !distances.has(target) || distances.get(target) === Infinity) {
    const endNodesArr = Array.from(distances.entries()).filter(([, d]) => d > 0);
    target = endNodesArr.length > 0 ? endNodesArr[endNodesArr.length - 1][0] : undefined;
  }
  if (target !== undefined) {
    let cur = target;
    while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
      const p = parent.get(cur)!;
      finalPath.unshift({ from: p, to: cur });
      cur = p;
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
    description: destination
      ? `BFS complete. Destination ${destination} ${finalPath.length > 0 ? 'reached' : 'not reachable'} from ${start}.`
      : 'BFS complete! All reachable nodes visited.',
    phase: 'complete',
  });

  return steps;
}
