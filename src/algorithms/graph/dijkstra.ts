import type { GraphData, GraphStep } from '../../types';

interface PQEntry {
  node: number;
  dist: number;
}

export function dijkstraSteps(graph: GraphData, start: number): GraphStep[] {
  const steps: GraphStep[] = [];
  const distances = new Map<number, number>();
  const parent = new Map<number, number | null>();
  const visited = new Set<number>();
  const visitedNodes: number[] = [];
  const exploredEdges: { from: number; to: number }[] = [];
  const pathEdges: { from: number; to: number }[] = [];
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
    });

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
        });
      }
    }
  }

  const endNodes = Array.from(distances.entries())
    .filter(([id, d]) => d > 0 && d < Infinity);
  if (endNodes.length > 0) {
    let target = endNodes[endNodes.length - 1][0];
    while (parent.get(target) !== null && parent.get(target) !== undefined) {
      const p = parent.get(target)!;
      pathEdges.unshift({ from: p, to: target });
      target = p;
    }
  }

  steps.push({
    visitedNodes: [...visitedNodes],
    currentNode: -1,
    queue: [],
    stack: [],
    priorityQueue: [],
    exploredEdges: [...exploredEdges],
    pathEdges,
    distances: new Map(distances),
    description: 'Dijkstra complete! Shortest paths found.',
  });

  return steps;
}
