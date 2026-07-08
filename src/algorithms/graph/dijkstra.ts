import type { GraphData, GraphStep, RelaxationInfo } from '../../types';

const PSEUDOCODE = [
  'dist[start] = 0',
  'push(start)',
  'while priority queue not empty',
  '  u = extractMin()',
  '  for each neighbour v',
  '    relax(u, v)',
];

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
  const traversalOrder: number[] = [];
  const levels = new Map<number, number>();
  const logEntries: string[] = [];
  const pq: PQEntry[] = [];
  let stepCounter = 0;

  for (const node of graph.nodes) {
    distances.set(node.id, node.id === start ? 0 : Infinity);
    parent.set(node.id, null);
  }

  pq.push({ node: start, dist: 0 });

  stepCounter++;
  logEntries.push(`Step ${stepCounter}: Insert node ${start} with distance 0`);

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
    pseudocodeLine: 0,
    levels: new Map(levels),
    parent: new Map(parent),
    traversalOrder: [...traversalOrder],
    logEntries: [...logEntries],
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node, dist } = pq.shift()!;

    if (dist > distances.get(node)!) continue;

    visited.add(node);
    visitedNodes.push(node);
    traversalOrder.push(node);

    stepCounter++;
    logEntries.push(`Step ${stepCounter}: Visit node ${node} (distance ${dist})`);

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
      pseudocodeLine: 3,
      levels: new Map(levels),
      parent: new Map(parent),
      traversalOrder: [...traversalOrder],
      logEntries: [...logEntries],
    });

    if (destination !== undefined && node === destination) {
      const path: { from: number; to: number }[] = [];
      let cur = node;
      while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
        const p = parent.get(cur)!;
        path.unshift({ from: p, to: cur });
        cur = p;
      }
      stepCounter++;
      logEntries.push(`Step ${stepCounter}: Dijkstra complete! Shortest path found.`);
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
        pseudocodeLine: -1,
        levels: new Map(levels),
        parent: new Map(parent),
        traversalOrder: [...traversalOrder],
        logEntries: [...logEntries],
      });
      return steps;
    }

    const neighbors = graph.adjacencyList.get(node) || [];
    for (const { to, weight } of neighbors) {
      if (visited.has(to)) continue;
      const newDist = dist + weight;
      const oldDist = distances.get(to)!;
      const updated = newDist < oldDist;
      const relaxation: RelaxationInfo = {
        from: node,
        to,
        weight,
        oldDist,
        newDist,
        updated,
      };

      if (updated) {
        distances.set(to, newDist);
        parent.set(to, node);
        pq.push({ node: to, dist: newDist });
        exploredEdges.push({ from: node, to });
        stepCounter++;
        logEntries.push(`Step ${stepCounter}: Relax edge ${node} \u2192 ${to}: ${oldDist === Infinity ? '\u221E' : oldDist} > ${newDist}, updated dist[${to}] = ${newDist}`);
      } else {
        stepCounter++;
        logEntries.push(`Step ${stepCounter}: Relax edge ${node} \u2192 ${to}: no update needed`);
      }

      steps.push({
        visitedNodes: [...visitedNodes],
        currentNode: node,
        queue: [],
        stack: [],
        priorityQueue: pq.map(e => ({ ...e })),
        exploredEdges: [...exploredEdges],
        pathEdges: [],
        distances: new Map(distances),
        description: updated
          ? `Updated distance to node ${to}: ${newDist} (via ${node}, weight ${weight})`
          : `No update for node ${to}: current distance ${oldDist === Infinity ? '\u221E' : oldDist} \u2264 ${newDist}`,
        phase: 'exploring',
        pseudocodeLine: 5,
        levels: new Map(levels),
        parent: new Map(parent),
        traversalOrder: [...traversalOrder],
        logEntries: [...logEntries],
        relaxation,
      });
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

  stepCounter++;
  logEntries.push(`Step ${stepCounter}: Dijkstra complete. Shortest paths found.`);

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
    pseudocodeLine: -1,
    levels: new Map(levels),
    parent: new Map(parent),
    traversalOrder: [...traversalOrder],
    logEntries: [...logEntries],
  });

  return steps;
}
