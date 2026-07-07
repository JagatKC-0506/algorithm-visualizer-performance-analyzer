import type { GraphData, GraphNode, GraphEdge, GraphGenerationType } from '../../types';

const SVG_W = 700;
const SVG_H = 560;
const CX = 350;
const CY = 280;

function forceDirectedLayout(nodes: GraphNode[], edges: GraphEdge[]): void {
  const k = Math.sqrt((SVG_W * SVG_H) / nodes.length) * 0.6;
  const iterations = 80;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<number, { fx: number; fy: number }>();
    for (const n of nodes) forces.set(n.id, { fx: 0, fy: 0 });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) { dist = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
        const rep = (k * k) / dist;
        const fx = (dx / dist) * rep;
        const fy = (dy / dist) * rep;
        forces.get(nodes[i].id)!.fx -= fx;
        forces.get(nodes[i].id)!.fy -= fy;
        forces.get(nodes[j].id)!.fx += fx;
        forces.get(nodes[j].id)!.fy += fy;
      }
    }

    for (const edge of edges) {
      const a = nodes.find(n => n.id === edge.from);
      const b = nodes.find(n => n.id === edge.to);
      if (!a || !b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { dist = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
      const attr = (dist * dist) / k;
      const fx = (dx / dist) * attr;
      const fy = (dy / dist) * attr;
      forces.get(edge.from)!.fx += fx;
      forces.get(edge.from)!.fy += fy;
      forces.get(edge.to)!.fx -= fx;
      forces.get(edge.to)!.fy -= fy;
    }

    const temp = (SVG_W / 12) * (1 - iter / iterations);
    for (const n of nodes) {
      const f = forces.get(n.id)!;
      const d = Math.sqrt(f.fx * f.fx + f.fy * f.fy);
      if (d < 0.01) continue;
      n.x += (f.fx / d) * Math.min(d, temp);
      n.y += (f.fy / d) * Math.min(d, temp);
      n.x = Math.max(40, Math.min(SVG_W - 40, n.x));
      n.y = Math.max(40, Math.min(SVG_H - 40, n.y));
    }
  }
}

function ensureConnected(
  nodes: GraphNode[],
  edges: GraphEdge[],
  adjacencyList: Map<number, { to: number; weight: number }[]>,
  weighted: boolean,
): void {
  if (nodes.length <= 1) return;
  const visited = new Set<number>();
  const queue = [nodes[0].id];
  visited.add(nodes[0].id);
  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const { to } of adjacencyList.get(node) || []) {
      if (!visited.has(to)) { visited.add(to); queue.push(to); }
    }
  }
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      const target = nodes[0].id;
      const weight = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: n.id, to: target, weight, state: 'default' });
      adjacencyList.get(n.id)!.push({ to: target, weight });
      adjacencyList.get(target)!.push({ to: n.id, weight });
      visited.add(n.id);
    }
  }
}

function circleLayout(nodes: GraphNode[]): void {
  const r = Math.min(SVG_W, SVG_H) * 0.38;
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    n.x = CX + r * Math.cos(angle);
    n.y = CY + r * Math.sin(angle);
  });
}

function addEdge(adjacencyList: Map<number, { to: number; weight: number }[]>, from: number, to: number, weight: number): void {
  adjacencyList.get(from)!.push({ to, weight });
  adjacencyList.get(to)!.push({ to: from, weight });
}

function makeNodes(numNodes: number): GraphNode[] {
  return Array.from({ length: numNodes }, (_, i) => ({
    id: i,
    label: `${i}`,
    x: CX + (Math.random() - 0.5) * SVG_W * 0.3,
    y: CY + (Math.random() - 0.5) * SVG_H * 0.3,
    state: 'unvisited' as const,
  }));
}

function makeAdjList(numNodes: number): Map<number, { to: number; weight: number }[]> {
  const map = new Map<number, { to: number; weight: number }[]>();
  for (let i = 0; i < numNodes; i++) map.set(i, []);
  return map;
}

/* ---- Random graph ---- */
function generateRandomGraph(numNodes: number, weighted: boolean): GraphData {
  const nodes = makeNodes(numNodes);
  const edges: GraphEdge[] = [];
  const adjacencyList = makeAdjList(numNodes);

  for (let i = 0; i < numNodes; i++) {
    const numEdges = Math.min(2 + Math.floor(Math.random() * Math.max(2, numNodes / 3)), numNodes - 1);
    const candidates: number[] = [];
    for (let j = 0; j < numNodes; j++) {
      if (j !== i && !adjacencyList.get(i)!.some(e => e.to === j)) candidates.push(j);
    }
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    const toAdd = Math.min(numEdges, shuffled.length);
    for (let k = 0; k < toAdd; k++) {
      const j = shuffled[k];
      const weight = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: j, weight, state: 'default' });
      adjacencyList.get(i)!.push({ to: j, weight });
      adjacencyList.get(j)!.push({ to: i, weight });
    }
  }

  ensureConnected(nodes, edges, adjacencyList, weighted);
  forceDirectedLayout(nodes, edges);
  return { nodes, edges, adjacencyList };
}

/* ---- Grid graph ---- */
function generateGridGraph(numNodes: number, weighted: boolean): GraphData {
  const cols = Math.max(2, Math.ceil(Math.sqrt(numNodes)));
  const rows = Math.max(2, Math.ceil(numNodes / cols));
  const actual = rows * cols;
  const nodes: GraphNode[] = [];
  const adjacencyList = makeAdjList(actual);
  const edges: GraphEdge[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      nodes.push({
        id,
        label: `${id}`,
        x: 50 + (SVG_W - 100) * (c / (cols - 1 || 1)),
        y: 50 + (SVG_H - 100) * (r / (rows - 1 || 1)),
        state: 'unvisited',
      });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      if (c + 1 < cols) {
        const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
        edges.push({ from: id, to: id + 1, weight: w, state: 'default' });
        addEdge(adjacencyList, id, id + 1, w);
      }
      if (r + 1 < rows) {
        const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
        edges.push({ from: id, to: id + cols, weight: w, state: 'default' });
        addEdge(adjacencyList, id, id + cols, w);
      }
    }
  }

  const data: GraphData = { nodes, edges, adjacencyList };
  if (actual > numNodes) return trimNodes(data, numNodes);
  return data;
}

/* ---- Tree graph ---- */
function generateTreeGraph(numNodes: number, weighted: boolean): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacencyList = makeAdjList(numNodes);

  const depth = Math.ceil(Math.log2(numNodes + 1));
  const leafCount = Math.pow(2, depth - 1);

  const getX = (level: number, pos: number): number => {
    const positionsInLevel = Math.pow(2, level);
    return 50 + (SVG_W - 100) * ((pos + 0.5) / positionsInLevel);
  };
  const getY = (level: number): number => {
    return 50 + (SVG_H - 100) * (level / (depth - 1 || 1));
  };

  for (let i = 0; i < numNodes; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - Math.pow(2, level) + 1;
    nodes.push({
      id: i,
      label: `${i}`,
      x: getX(level, posInLevel),
      y: getY(level),
      state: 'unvisited',
    });
  }

  for (let i = 0; i < numNodes; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < numNodes) {
      const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: left, weight: w, state: 'default' });
      addEdge(adjacencyList, i, left, w);
    }
    if (right < numNodes) {
      const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: right, weight: w, state: 'default' });
      addEdge(adjacencyList, i, right, w);
    }
  }

  return { nodes, edges, adjacencyList };
}

/* ---- Complete graph ---- */
function generateCompleteGraph(numNodes: number, weighted: boolean): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacencyList = makeAdjList(numNodes);

  for (let i = 0; i < numNodes; i++) {
    nodes.push({ id: i, label: `${i}`, x: 0, y: 0, state: 'unvisited' });
  }

  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
      edges.push({ from: i, to: j, weight: w, state: 'default' });
      addEdge(adjacencyList, i, j, w);
    }
  }

  circleLayout(nodes);
  return { nodes, edges, adjacencyList };
}

/* ---- Disconnected graph ---- */
function generateDisconnectedGraph(numNodes: number, weighted: boolean): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacencyList = makeAdjList(numNodes);

  const numComponents = Math.min(3, Math.max(2, Math.floor(numNodes / 3)));
  const compSizes: number[] = [];
  let remaining = numNodes;
  for (let c = 0; c < numComponents; c++) {
    const size = c === numComponents - 1 ? remaining : Math.floor(numNodes / numComponents);
    compSizes.push(size);
    remaining -= size;
  }

  let offset = 0;
  for (let c = 0; c < numComponents; c++) {
    const size = compSizes[c];
    for (let i = 0; i < size; i++) {
      const id = offset + i;
      nodes.push({ id, label: `${id}`, x: 0, y: 0, state: 'unvisited' });
    }
    for (let i = 0; i < size; i++) {
      const from = offset + i;
      const numEdges = Math.min(1 + Math.floor(Math.random() * Math.max(1, size / 2)), size - 1);
      const candidates: number[] = [];
      for (let j = 0; j < size; j++) {
        const to = offset + j;
        if (to !== from && !adjacencyList.get(from)!.some(e => e.to === to)) candidates.push(to);
      }
      const shuffled = candidates.sort(() => Math.random() - 0.5);
      const toAdd = Math.min(numEdges, shuffled.length);
      for (let k = 0; k < toAdd; k++) {
        const to = shuffled[k];
        const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
        edges.push({ from, to, weight: w, state: 'default' });
        addEdge(adjacencyList, from, to, w);
      }
    }
    offset += size;
  }

  forceDirectedLayout(nodes, edges);
  return { nodes, edges, adjacencyList };
}

function trimNodes(data: GraphData, targetCount: number): GraphData {
  if (data.nodes.length <= targetCount) return data;
  const remove = data.nodes.slice(targetCount).map(n => n.id);
  const removeSet = new Set(remove);
  data.nodes = data.nodes.filter(n => !removeSet.has(n.id));
  data.edges = data.edges.filter(e => !removeSet.has(e.from) && !removeSet.has(e.to));
  for (const id of remove) {
    data.adjacencyList.delete(id);
  }
  for (const [, list] of data.adjacencyList) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (removeSet.has(list[i].to)) list.splice(i, 1);
    }
  }
  return data;
}

export function generateGraph(
  numNodes: number,
  weighted: boolean,
  graphType: GraphGenerationType = 'random',
): GraphData {
  switch (graphType) {
    case 'grid': return generateGridGraph(numNodes, weighted);
    case 'tree': return generateTreeGraph(numNodes, weighted);
    case 'complete': return generateCompleteGraph(numNodes, weighted);
    case 'disconnected': return generateDisconnectedGraph(numNodes, weighted);
    default: return generateRandomGraph(numNodes, weighted);
  }
}
