import type { GraphData, GraphStep } from '../../types';

interface PQEntry {
  node: number;
  dist: number;
}

export function dijkstraSteps(graph: GraphData, start: number, destination?: number): GraphStep[] {
  const steps: GraphStep[] = [];
  const distances = new Map<number, number>();
  const parent = new Map<number, number | null>();
  const visited = new Set<number>();
  const visitedNodes: number[] = [];
  const exploredEdges: { from: number; to: number }[] = [];
  const pq: PQEntry[] = [];

  for (const node of graph.nodes) {
    distances.set(node.id, node.id === start ? 0 : Infinity);
    parent.set(node.id, null);
  }

  pq.push({ node: start, dist: 0 });

  steps.push({
    visitedNodes: [...visitedNodes],
    currentNode: -1,
    queue: [],
    stack: [],
    priorityQueue: pq.map(e => ({ ...e })),
    exploredEdges: [...exploredEdges],
    pathEdges: [],
    distances: new Map(distances),
    description: `Starting Dijkstra from node ${start}. Initial distances set.`,
    phase: 'exploring',
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node, dist } = pq.shift()!;

    if (dist > distances.get(node)!) continue;

    visited.add(node);
    visitedNodes.push(node);

    steps.push({
      visitedNodes: [...visitedNodes],
      currentNode: node,
      queue: [],
      stack: [],
      priorityQueue: pq.map(e => ({ ...e })),
      exploredEdges: [...exploredEdges],
      pathEdges: [],
      distances: new Map(distances),
      description: `Extracted node ${node} from priority queue with distance ${dist}`,
      phase: 'exploring',
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
        stack: [],
        priorityQueue: [],
        exploredEdges: [...exploredEdges],
        pathEdges: path,
        distances: new Map(distances),
        description: `Dijkstra complete! Shortest path from ${start} to ${destination}: distance=${dist}, path: ${path.map(e => `${e.from}\u2192${e.to}`).join(' ')}`,
        phase: 'path-found',
      });
      return steps;
    }

    const neighbors = graph.adjacencyList.get(node) || [];
    for (const { to, weight } of neighbors) {
      if (visited.has(to)) continue;
      const newDist = dist + weight;
      if (newDist < distances.get(to)!) {
        distances.set(to, newDist);
        parent.set(to, node);
        pq.push({ node: to, dist: newDist });
        exploredEdges.push({ from: node, to });
        steps.push({
          visitedNodes: [...visitedNodes],
          currentNode: node,
          queue: [],
          stack: [],
          priorityQueue: pq.map(e => ({ ...e })),
          exploredEdges: [...exploredEdges],
          pathEdges: [],
          distances: new Map(distances),
          description: `Updated distance to node ${to}: ${newDist} (via ${node}, weight ${weight})`,
          phase: 'exploring',
        });
      }
    }
  }

  const finalPathEdges: { from: number; to: number }[] = [];
  let target: number | undefined = destination;
  if (target === undefined || !distances.has(target) || distances.get(target) === Infinity) {
    const endNodesArr = Array.from(distances.entries())
      .filter(([id, d]) => d > 0 && d < Infinity);
    target = endNodesArr.length > 0 ? endNodesArr[endNodesArr.length - 1][0] : undefined;
  }
  if (target !== undefined) {
    let cur = target;
    while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
      const p = parent.get(cur)!;
      finalPathEdges.unshift({ from: p, to: cur });
      cur = p;
    }
  }

  steps.push({
    visitedNodes: [...visitedNodes],
    currentNode: -1,
    queue: [],
    stack: [],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges: finalPathEdges,
    distances: new Map(distances),
    description: destination
      ? `Dijkstra complete. Destination ${destination} ${finalPathEdges.length > 0 ? 'reached' : 'not reachable'} from ${start}.`
      : 'Dijkstra complete! Shortest paths found.',
    phase: 'complete',
  });

  return steps;
}
