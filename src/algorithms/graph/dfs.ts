import type { GraphData, GraphStep } from '../../types';

export function dfsSteps(graph: GraphData, start: number, destination?: number): GraphStep[] {
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
    phase: 'exploring',
  });

  while (stack.length > 0) {
    const node = stack.pop()!;

    const neighbors = graph.adjacencyList.get(node) || [];
    const allNeighborsVisited = neighbors.length > 0 && neighbors.every(n => visited.has(n.to));
    const isBacktrack = node !== start && allNeighborsVisited;

    steps.push({
      visitedNodes: [...visitedNodes],
      currentNode: node,
      queue: [],
      stack: [...stack],
      priorityQueue: [],
      exploredEdges: [...exploredEdges],
      pathEdges: [],
      distances: new Map(distances),
      description: isBacktrack
        ? `Backtracking to node ${node} \u2014 all neighbors already explored`
        : `Popped node ${node} from stack, exploring its neighbors`,
      phase: isBacktrack ? 'backtracking' : 'exploring',
    });

    if (destination !== undefined && node === destination) {
      const path: { from: number; to: number }[] = [];
      let cur = node;
      while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
        const p = parent.get(cur)!;
        path.unshift({ from: p, to: cur });
        cur = p;
      }
      steps.push({
        visitedNodes: [...visitedNodes],
        currentNode: -1,
        queue: [],
        stack: [...stack],
        priorityQueue: [],
        exploredEdges: [...exploredEdges],
        pathEdges: path,
        distances: new Map(distances),
        description: `DFS complete! Path found from ${start} to ${destination}: ${path.map(e => `${e.from}\u2192${e.to}`).join(' ')}`,
        phase: 'path-found',
      });
      return steps;
    }

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
          phase: 'exploring',
        });
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
    queue: [],
    stack: [...stack],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: finalPath,
    distances: new Map(distances),
    description: destination
      ? `DFS complete. Destination ${destination} ${finalPath.length > 0 ? 'reached' : 'not reachable'} from ${start}.`
      : 'DFS complete! All reachable nodes visited.',
    phase: 'complete',
  });

  return steps;
}
