import type { GraphData, GraphNode, GraphEdge } from '../../types';

export function generateGraph(
  numNodes: number,
  weighted: boolean,
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacencyList = new Map<number, { to: number; weight: number }[]>();

  for (let i = 0; i < numNodes; i++) {
    const angle = (2 * Math.PI * i) / numNodes - Math.PI / 2;
    const radius = 250;
    const cx = 350, cy = 280;
    nodes.push({
      id: i,
      label: `${i}`,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      state: 'unvisited',
    });
    adjacencyList.set(i, []);
  }

  for (let i = 0; i < numNodes; i++) {
    let connected = false;
    const numEdges = Math.min(2 + Math.floor(Math.random() * Math.max(2, numNodes / 3)), numNodes - 1);
    const candidates: number[] = [];
    for (let j = 0; j < numNodes; j++) {
      if (j !== i && !adjacencyList.get(i)!.some(e => e.to === j)) {
        candidates.push(j);
      }
    }
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    const toAdd = Math.min(numEdges, shuffled.length);

    for (let k = 0; k < toAdd; k++) {
      const j = shuffled[k];
      if (i === j) continue;
      if (adjacencyList.get(i)!.some(e => e.to === j)) continue;
      const weight = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: j, weight, state: 'default' });
      adjacencyList.get(i)!.push({ to: j, weight });
      adjacencyList.get(j)!.push({ to: i, weight });
      connected = true;
    }

    if (!connected && i !== 0) {
      const j = i - 1;
      const weight = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: j, weight, state: 'default' });
      adjacencyList.get(i)!.push({ to: j, weight });
      adjacencyList.get(j)!.push({ to: i, weight });
    }
  }

  if (numNodes > 1) {
    const visited = new Set<number>();
    const queue = [0];
    visited.add(0);
    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const { to } of adjacencyList.get(node) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          queue.push(to);
        }
      }
    }
    for (let i = 0; i < numNodes; i++) {
      if (!visited.has(i)) {
        const j = 0;
        const weight = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
        edges.push({ from: i, to: j, weight, state: 'default' });
        adjacencyList.get(i)!.push({ to: j, weight });
        adjacencyList.get(j)!.push({ to: i, weight });
      }
    }
  }

  return { nodes, edges, adjacencyList };
}
