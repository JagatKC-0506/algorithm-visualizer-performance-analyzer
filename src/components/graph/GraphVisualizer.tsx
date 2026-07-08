import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import type { GraphAlgorithmType, GraphGenerationType, GraphData, GraphStep } from '../../types';
import { graphAlgorithms } from '../../algorithms/graph';
import { generateGraph } from '../../algorithms/graph/generator';
import Button from '../common/Button';
import StepHistoryTable from './StepHistoryTable';
import QueuePanel from './QueuePanel';
import StackPanel from './StackPanel';
import PriorityQueuePanel from './PriorityQueuePanel';
import VisitedPanel from './VisitedPanel';
import TraversalPanel from './TraversalPanel';
import EventLogPanel from './EventLogPanel';
import PseudocodePanel from './PseudocodePanel';
import DistanceTable from './DistanceTable';
import ParentTable from './ParentTable';
import RelaxationPanel from './RelaxationPanel';
import ShortestPathPanel from './ShortestPathPanel';
import LevelPanel from './LevelPanel';

interface Props {
  algorithm: GraphAlgorithmType;
}

type EditMode = 'view' | 'move' | 'addNode' | 'removeNode' | 'addEdge' | 'removeEdge';

const NODE_COLORS: Record<string, string> = {
  unvisited: 'var(--text-secondary)',
  visiting: '#f59e0b',
  visited: '#3b82f6',
  current: '#ef4444',
  path: '#22c55e',
  backtrack: '#a882ff',
};

const EDGE_COLORS: Record<string, string> = {
  default: 'var(--border)',
  exploring: '#f59e0b',
  visited: '#3b82f6',
  path: '#22c55e',
};

const PHASE_BG: Record<string, string> = {
  exploring: 'rgba(59,130,246,0.1)',
  backtracking: 'rgba(168,130,255,0.1)',
  'path-found': 'rgba(34,197,94,0.1)',
  complete: 'rgba(34,197,94,0.08)',
};

const PHASE_ICON: Record<string, string> = {
  exploring: '\u25B6',
  backtracking: '\u21A9',
  'path-found': '\u2605',
  complete: '\u2713',
};

const EDIT_BUTTONS: { mode: EditMode; label: string; icon: string }[] = [
  { mode: 'view', label: 'View', icon: '\uD83D\uDC46' },
  { mode: 'move', label: 'Move', icon: '\u270B' },
  { mode: 'addNode', label: 'Add Node', icon: '\u2795' },
  { mode: 'removeNode', label: 'Remove Node', icon: '\u274C' },
  { mode: 'addEdge', label: 'Add Edge', icon: '\uD83D\uDD17' },
  { mode: 'removeEdge', label: 'Remove Edge', icon: '\u2702' },
];

const GRAPH_TYPE_BUTTONS: { type: GraphGenerationType; label: string }[] = [
  { type: 'random', label: 'Random' },
  { type: 'grid', label: 'Grid' },
  { type: 'tree', label: 'Tree' },
  { type: 'complete', label: 'Complete' },
  { type: 'disconnected', label: 'Disconnected' },
];

const BFS_PSEUDOCODE = [
  'enqueue(start)',
  'mark start visited',
  'while queue not empty',
  '  node = dequeue()',
  '  for each neighbour',
  '    enqueue(neighbour)',
];

const DFS_PSEUDOCODE = [
  'push(start)',
  'while stack not empty',
  '  node = pop()',
  '  if node not visited',
  '    mark visited',
  '    push neighbours',
];

const DIJKSTRA_PSEUDOCODE = [
  'dist[start] = 0',
  'push(start)',
  'while priority queue not empty',
  '  u = extractMin()',
  '  for each neighbour v',
  '    relax(u, v)',
];

export default function GraphVisualizer({ algorithm }: Props) {
  const [numNodes, setNumNodes] = useState(8);
  const [startNode, setStartNode] = useState(0);
  const [destNode, setDestNode] = useState<number>(7);
  const [graphType, setGraphType] = useState<GraphGenerationType>('random');
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [hasStarted, setHasStarted] = useState(false);
  const [pathRevealCount, setPathRevealCount] = useState(0);

  const [editMode, setEditMode] = useState<EditMode>('view');
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ from: number; to: number } | null>(null);
  const [edgeSource, setEdgeSource] = useState<number | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const pathTimerRef = useRef<number | null>(null);

  const weighted = algorithm === 'dijkstra';

  const pseudocode = algorithm === 'bfs' ? BFS_PSEUDOCODE : algorithm === 'dfs' ? DFS_PSEUDOCODE : DIJKSTRA_PSEUDOCODE;

  const generateNewGraph = useCallback(() => {
    if (pathTimerRef.current) clearInterval(pathTimerRef.current);
    const g = generateGraph(numNodes, weighted, graphType);
    setGraph(g);
    const s = graphAlgorithms[algorithm].steps(g, startNode, destNode >= numNodes ? numNodes - 1 : destNode);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
    setHasStarted(false);
    setPathRevealCount(0);
    setEdgeSource(null);
  }, [numNodes, algorithm, weighted, graphType]);

  useEffect(() => {
    generateNewGraph();
  }, [generateNewGraph]);

  useEffect(() => {
    if (!graph) return;
    const dest = destNode >= graph.nodes.length ? graph.nodes.length - 1 : destNode;
    const s = graphAlgorithms[algorithm].steps(graph, startNode, dest);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
    setHasStarted(false);
    setPathRevealCount(0);
  }, [startNode, destNode]);

  useEffect(() => {
    if (playing && currentStep < steps.length - 1) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
      timerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [playing, speed, steps.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pathTimerRef.current) clearInterval(pathTimerRef.current);
    };
  }, []);

  const step = currentStep < steps.length ? steps[currentStep] : null;

  useEffect(() => {
    if (pathTimerRef.current) {
      clearInterval(pathTimerRef.current);
      pathTimerRef.current = null;
    }
    if (step && step.pathEdges.length > 0 && step.phase === 'path-found') {
      setPathRevealCount(0);
      let count = 0;
      pathTimerRef.current = window.setInterval(() => {
        count++;
        setPathRevealCount(count);
        if (count >= step.pathEdges.length) {
          if (pathTimerRef.current) clearInterval(pathTimerRef.current);
          pathTimerRef.current = null;
        }
      }, 250);
    } else {
      setPathRevealCount(step?.pathEdges.length || 0);
    }
  }, [currentStep, step?.pathEdges.length]);

  const regenerateSteps = useCallback(() => {
    if (!graph) return;
    const dest = destNode >= graph.nodes.length ? graph.nodes.length - 1 : destNode;
    const s = graphAlgorithms[algorithm].steps(graph, startNode, dest);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
    setHasStarted(false);
    setPathRevealCount(0);
  }, [graph, algorithm, startNode, destNode]);

  const getNodeState = (nodeId: number): string => {
    if (!step) return 'unvisited';
    if (nodeId === step.currentNode) {
      if (step.phase === 'backtracking') return 'backtrack';
      return 'current';
    }
    if (step.pathEdges.length > 0 && pathRevealCount > 0) {
      const revealed = step.pathEdges.slice(0, pathRevealCount);
      if (revealed.some(e => e.from === nodeId || e.to === nodeId)) return 'path';
    }
    if (step.pathEdges.some(e => e.from === nodeId || e.to === nodeId)) return 'path';
    if (step.visitedNodes.includes(nodeId)) return 'visited';
    if (step.queue.includes(nodeId) || step.stack.includes(nodeId) || step.priorityQueue.some(e => e.node === nodeId))
      return 'visiting';
    return 'unvisited';
  };

  const isFrontier = (nodeId: number): boolean => {
    if (!step) return false;
    return (
      step.queue.includes(nodeId) ||
      step.stack.includes(nodeId) ||
      step.priorityQueue.some(e => e.node === nodeId)
    );
  };

  const isDestination = (nodeId: number): boolean => nodeId === destNode;

  const getEdgeState = (from: number, to: number): string => {
    if (!step) return 'default';
    if (step.pathEdges.length > 0 && pathRevealCount > 0) {
      const revealed = step.pathEdges.slice(0, pathRevealCount);
      if (revealed.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return 'path';
    }
    if (step.pathEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return 'path';
    if (step.exploredEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return 'exploring';
    return 'default';
  };

  const goToStep = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && currentStep > 0) { setPlaying(false); setCurrentStep(currentStep - 1); }
    if (dir === 'next' && currentStep < steps.length - 1) { setPlaying(false); setCurrentStep(currentStep + 1); }
  };

  const jumpToStep = (stepIdx: number) => {
    setPlaying(false);
    setCurrentStep(stepIdx);
  };

  const reset = () => {
    setPlaying(false);
    setCurrentStep(0);
  };

  const handlePlay = () => {
    if (!playing && !hasStarted) setHasStarted(true);
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setPlaying(true);
      if (!hasStarted) setHasStarted(true);
    } else {
      setPlaying(p => !p);
      if (!hasStarted) setHasStarted(true);
    }
  };

  /* ---- Interactive editing handlers ---- */
  const getSVGCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 700 / rect.width;
    const scaleY = 560 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleSVGMouseDown = (e: React.MouseEvent) => {
    if (!graph) return;
    const coords = getSVGCoords(e);

    if (editMode === 'view') {
      const node = graph.nodes.find(n => {
        const dx = n.x - coords.x;
        const dy = n.y - coords.y;
        return Math.sqrt(dx * dx + dy * dy) < 25;
      });
      if (!node) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        panOffsetStart.current = { x: pan.x, y: pan.y };
      }
      return;
    }

    if (editMode !== 'move' || !graph) return;
    const node = graph.nodes.find(n => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    if (node) {
      setDraggingNode(node.id);
      setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
    }
  };

  const handleSVGMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const scale = 700 / rect.width;
        setPan({
          x: panOffsetStart.current.x + dx * scale,
          y: panOffsetStart.current.y + dy * scale,
        });
      }
      return;
    }

    if (!graph) return;
    const coords = getSVGCoords(e);

    if (draggingNode !== null) {
      const newGraph: GraphData = {
        ...graph,
        nodes: graph.nodes.map(n =>
          n.id === draggingNode
            ? { ...n, x: Math.max(20, Math.min(680, coords.x - dragOffset.x)), y: Math.max(20, Math.min(540, coords.y - dragOffset.y)) }
            : n
        ),
      };
      setGraph(newGraph);
      return;
    }

    const node = graph.nodes.find(n => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    setHoveredNode(node ? node.id : null);

    const edge = graph.edges.find(e => {
      const from = graph.nodes.find(n => n.id === e.from);
      const to = graph.nodes.find(n => n.id === e.to);
      if (!from || !to) return false;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return false;
      const t = Math.max(0, Math.min(1, ((coords.x - from.x) * dx + (coords.y - from.y) * dy) / (len * len)));
      const projX = from.x + t * dx;
      const projY = from.y + t * dy;
      const dist = Math.sqrt((coords.x - projX) ** 2 + (coords.y - projY) ** 2);
      return dist < 12;
    });
    setHoveredEdge(edge ? { from: edge.from, to: edge.to } : null);
  };

  const handleSVGMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (draggingNode !== null) {
      setDraggingNode(null);
      regenerateSteps();
    }
  };

  const handleSVGClick = (e: React.MouseEvent) => {
    if (!graph) return;
    const coords = getSVGCoords(e);

    if (editMode === 'addNode') {
      const newId = graph.nodes.length;
      const newGraph: GraphData = {
        ...graph,
        nodes: [...graph.nodes, { id: newId, label: `${newId}`, x: coords.x, y: coords.y, state: 'unvisited' as const }],
        edges: [...graph.edges],
        adjacencyList: new Map(graph.adjacencyList).set(newId, []),
      };
      setGraph(newGraph);
      setTimeout(() => regenerateSteps(), 0);
      return;
    }

    if (editMode === 'addEdge') {
      const node = graph.nodes.find(n => {
        const dx = n.x - coords.x;
        const dy = n.y - coords.y;
        return Math.sqrt(dx * dx + dy * dy) < 25;
      });
      if (!node) return;
      if (edgeSource === null) {
        setEdgeSource(node.id);
      } else if (edgeSource !== node.id) {
        const exists = graph.edges.some(
          e => (e.from === edgeSource && e.to === node.id) || (e.from === node.id && e.to === edgeSource)
        );
        if (!exists) {
          const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
          const newEdges = [...graph.edges, { from: edgeSource, to: node.id, weight: w, state: 'default' as const }];
          const newAdj = new Map(graph.adjacencyList);
          newAdj.get(edgeSource)!.push({ to: node.id, weight: w });
          newAdj.get(node.id)!.push({ to: edgeSource, weight: w });
          setGraph({ ...graph, edges: newEdges, adjacencyList: newAdj });
          setTimeout(() => regenerateSteps(), 0);
        }
        setEdgeSource(null);
      }
      return;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastWheel = 0;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 30) return;
      lastWheel = now;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const s = 700 / rect.width;
      const mx = (e.clientX - rect.left) * s;
      const my = (e.clientY - rect.top) * s;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setZoom(prev => {
        const newZoom = Math.max(0.25, Math.min(4, prev * factor));
        setPan(p => ({
          x: mx - (mx - p.x) / prev * newZoom,
          y: my - (my - p.y) / prev * newZoom,
        }));
        return newZoom;
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleNodeClick = (nodeId: number) => {
    if (!graph) return;
    if (editMode === 'removeNode') {
      const newNodes = graph.nodes.filter(n => n.id !== nodeId);
      const newEdges = graph.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
      const newAdj = new Map(graph.adjacencyList);
      newAdj.delete(nodeId);
      for (const [, list] of newAdj) {
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].to === nodeId) list.splice(i, 1);
        }
      }
      setGraph({ nodes: newNodes, edges: newEdges, adjacencyList: newAdj });
      setTimeout(() => regenerateSteps(), 0);
    }
  };

  const handleEdgeClick = (from: number, to: number) => {
    if (!graph) return;
    if (editMode === 'removeEdge') {
      const newEdges = graph.edges.filter(e => !(e.from === from && e.to === to) && !(e.from === to && e.to === from));
      const newAdj = new Map(graph.adjacencyList);
      const removeFromList = (list: { to: number; weight: number }[], target: number) => {
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].to === target) list.splice(i, 1);
        }
      };
      removeFromList(newAdj.get(from)!, to);
      removeFromList(newAdj.get(to)!, from);
      setGraph({ ...graph, edges: newEdges, adjacencyList: newAdj });
      setTimeout(() => regenerateSteps(), 0);
    }
  };

  if (!graph) return null;

  const dataStructureLabel = algorithm === 'bfs' ? 'Queue' : algorithm === 'dfs' ? 'Stack' : 'Priority Queue';

  const panelStyle: CSSProperties = {
    minWidth: 0,
    overflow: 'hidden',
  };

  return (
    <div>
      {/* Controls Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Nodes:
          <input type="range" min={3} max={15} value={numNodes} onChange={e => setNumNodes(Number(e.target.value))} />
          <span style={{ fontWeight: 600 }}>{numNodes}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Start:
          <input type="number" min={0} max={Math.max(0, graph.nodes.length - 1)} value={startNode} onChange={e => setStartNode(Number(e.target.value))} style={{ width: '45px', padding: '0.2rem 0.3rem' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Dest:
          <input type="number" min={0} max={Math.max(0, graph.nodes.length - 1)} value={destNode} onChange={e => setDestNode(Number(e.target.value))} style={{ width: '45px', padding: '0.2rem 0.3rem' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Speed:
          <input type="range" min={100} max={1500} value={1600 - speed} onChange={e => setSpeed(1600 - Number(e.target.value))} />
        </label>
        <Button onClick={generateNewGraph}>Generate</Button>
        <Button onClick={reset} variant="secondary">Reset</Button>
      </div>

      {/* Graph Type Buttons */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {GRAPH_TYPE_BUTTONS.map(bt => (
          <button
            key={bt.type}
            onClick={() => setGraphType(bt.type)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '0.3rem',
              border: graphType === bt.type ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: graphType === bt.type ? 'var(--accent)' : 'var(--surface)',
              color: graphType === bt.type ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: graphType === bt.type ? 600 : 400,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <Button onClick={handlePlay}>
            {playing ? 'Pause' : currentStep >= steps.length - 1 ? 'Replay' : !hasStarted ? 'Play' : 'Play'}
          </Button>
          <Button onClick={() => goToStep('prev')} disabled={currentStep <= 0} variant="secondary">Prev</Button>
          <Button onClick={() => goToStep('next')} disabled={currentStep >= steps.length - 1} variant="secondary">Next</Button>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          Step {currentStep}/{steps.length - 1}
        </span>
      </div>

      {/* Edit Mode Toolbar */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {EDIT_BUTTONS.map(btn => (
          <button
            key={btn.mode}
            onClick={() => { setEditMode(btn.mode); setEdgeSource(null); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '0.3rem',
              border: editMode === btn.mode ? '2px solid #6366f1' : '1px solid var(--border)',
              background: editMode === btn.mode ? 'rgba(99,102,241,0.12)' : 'var(--surface)',
              color: editMode === btn.mode ? '#6366f1' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: editMode === btn.mode ? 600 : 400,
              fontSize: '0.75rem',
            }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
        {editMode === 'addEdge' && edgeSource !== null && (
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            Click destination node for edge from {edgeSource}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '520px',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : editMode === 'view' ? 'grab' : editMode === 'move' ? 'grab' : editMode === 'addNode' ? 'crosshair' : editMode === 'addEdge' ? 'pointer' : 'default',
        }}
      >
        <svg
          ref={svgRef}
          className="graph-visualizer-svg"
          width="100%" height="100%"
          viewBox="0 0 700 560"
          onMouseDown={handleSVGMouseDown}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={() => { setIsPanning(false); setDraggingNode(null); }}
          onClick={handleSVGClick}
          style={{ cursor: isPanning ? 'grabbing' : editMode === 'view' ? 'grab' : editMode === 'move' ? 'grab' : editMode === 'addNode' ? 'crosshair' : editMode === 'addEdge' ? 'pointer' : 'default' }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <defs>
              <marker id="arrow-exploring" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-path" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
              </marker>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border)" />
              </marker>
              <marker id="arrow-hover" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Edges */}
            {graph.edges.map((edge, ei) => {
              const from = graph.nodes.find(n => n.id === edge.from);
              const to = graph.nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const state = getEdgeState(edge.from, edge.to);
              const isHover = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to;
              const isPath = state === 'path';

              return (
                <g key={ei}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="transparent" strokeWidth={20}
                    style={{ cursor: editMode === 'removeEdge' ? 'pointer' : 'default' }}
                    onClick={() => handleEdgeClick(edge.from, edge.to)}
                    onMouseEnter={() => setHoveredEdge({ from: edge.from, to: edge.to })}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isHover ? '#6366f1' : EDGE_COLORS[state] || EDGE_COLORS.default}
                    strokeWidth={isHover ? 3.5 : isPath ? 3 : state === 'exploring' ? 2.5 : 1.5}
                    strokeDasharray={state === 'exploring' ? '6,4' : 'none'}
                    className={isPath ? 'path-edge' : state === 'exploring' ? 'exploring-edge' : undefined}
                    markerEnd={
                      isHover ? 'url(#arrow-hover)' :
                      isPath ? 'url(#arrow-path)' :
                      state === 'exploring' ? 'url(#arrow-exploring)' :
                      'url(#arrow-default)'
                    }
                  />
                  <g>
                    <rect
                      x={(from.x + to.x) / 2 - 10}
                      y={(from.y + to.y) / 2 - 14}
                      width={20} height={18}
                      rx={9} ry={9}
                      fill={isHover ? 'rgba(99,102,241,0.15)' : 'var(--bg)'}
                      stroke={isHover ? '#6366f1' : 'var(--border)'}
                      strokeWidth={0.5}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 1}
                      fill={isHover ? '#6366f1' : 'var(--text-secondary)'}
                      fontSize={11}
                      fontWeight={600}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: 'none' }}
                    >
                      {edge.weight}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map(node => {
              const state = getNodeState(node.id);
              const isFront = isFrontier(node.id);
              const isDest = isDestination(node.id);
              const isStart = node.id === startNode;
              const isHover = hoveredNode === node.id;
              const isEdgeSource = edgeSource === node.id;
              const nodeDist = step?.distances.get(node.id);
              const showDist = nodeDist !== undefined && nodeDist < Infinity && state !== 'unvisited';
              const isBacktrack = state === 'backtrack';
              const isPath = state === 'path';

              return (
                <g key={node.id}>
                  {isDest && (
                    <circle
                      cx={node.x} cy={node.y} r={27}
                      fill="none"
                      stroke="#eab308"
                      strokeWidth={2}
                      strokeDasharray="4,3"
                    />
                  )}

                  {isFront && !isBacktrack && (
                    <circle
                      cx={node.x} cy={node.y} r={22}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      className="frontier-pulse"
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  {isHover && editMode === 'move' && (
                    <circle
                      cx={node.x} cy={node.y} r={26}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="3,2"
                    />
                  )}

                  {isEdgeSource && (
                    <circle
                      cx={node.x} cy={node.y} r={26}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                    />
                  )}

                  <circle
                    cx={node.x} cy={node.y}
                    r={isPath ? 24 : 22}
                    fill={
                      isHover && editMode === 'removeNode'
                        ? 'rgba(239,68,68,0.5)'
                        : isBacktrack
                          ? 'rgba(168,130,255,0.4)'
                          : NODE_COLORS[state] || NODE_COLORS.unvisited
                    }
                    stroke={
                      isHover && editMode === 'removeNode' ? '#ef4444' :
                      isBacktrack ? '#a882ff' :
                      isPath ? '#22c55e' :
                      isDest ? '#eab308' :
                      isStart ? '#6366f1' :
                      state === 'current' ? '#ef4444' :
                      'transparent'
                    }
                    strokeWidth={
                      isHover && editMode === 'removeNode' ? 3 :
                      isBacktrack ? 2 :
                      isPath ? 3 :
                      isDest ? 3 :
                      state === 'current' ? 3 :
                      0
                    }
                    style={{
                      opacity: isBacktrack ? 0.5 : 1,
                      cursor: editMode === 'move' ? 'grab' :
                             editMode === 'removeNode' ? 'pointer' :
                             editMode === 'addEdge' ? 'pointer' :
                             'default',
                    }}
                    onMouseDown={e => { e.stopPropagation(); handleSVGMouseDown(e); }}
                    onClick={e => { e.stopPropagation(); handleNodeClick(node.id); }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />

                  <text
                    x={node.x} y={node.y + 1}
                    fill="#fff" fontSize={13}
                    textAnchor="middle" dominantBaseline="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>

                  {isStart && (
                    <text x={node.x} y={node.y - 28} fill="#6366f1" fontSize={11} textAnchor="middle" fontWeight={700}>
                      START
                    </text>
                  )}

                  {isDest && (
                    <text x={node.x} y={node.y - 28} fill="#eab308" fontSize={11} textAnchor="middle" fontWeight={700}>
                      DEST
                    </text>
                  )}

                  {showDist && (
                    <text x={node.x} y={node.y + 36} fill="var(--text-secondary)" fontSize={10} textAnchor="middle" style={{ pointerEvents: 'none' }}>
                      d={nodeDist}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.375rem',
          padding: '0.2rem',
          opacity: 0.8,
        }}>
          <button
            onClick={() => {
              const newZoom = Math.max(0.25, zoom / 1.3);
              const mx = 350, my = 260;
              setPan(prev => ({
                x: mx - (mx - prev.x) / zoom * newZoom,
                y: my - (my - prev.y) / zoom * newZoom,
              }));
              setZoom(newZoom);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', padding: '0.1rem 0.35rem', lineHeight: 1 }}
            title="Zoom out"
          >-</button>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => {
              const newZoom = Math.min(4, zoom * 1.3);
              const mx = 350, my = 260;
              setPan(prev => ({
                x: mx - (mx - prev.x) / zoom * newZoom,
                y: my - (my - prev.y) / zoom * newZoom,
              }));
              setZoom(newZoom);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', padding: '0.1rem 0.35rem', lineHeight: 1 }}
            title="Zoom in"
          >+</button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.1rem 0.3rem', lineHeight: 1 }}
            title="Reset zoom"
          >&#x21BA;</button>
        </div>
      </div>

      {/* Step description */}
      {step && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: step.phase ? PHASE_BG[step.phase] || 'var(--surface)' : 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          {step.phase && (
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>
              {PHASE_ICON[step.phase] || '\u25B6'}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>
              {step.description}
            </div>
            {step.phase === 'path-found' && step.pathEdges.length > 0 && (
              <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#22c55e', fontFamily: 'monospace' }}>
                Path: {step.pathEdges.map(e => `${e.from}\u2192${e.to}`).join(' ')}
              </div>
            )}
          </div>
          {step.phase && (
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: step.phase === 'backtracking' ? '#a882ff' : step.phase === 'path-found' ? '#22c55e' : 'var(--text-secondary)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {step.phase}
            </span>
          )}
        </div>
      )}

      {/* Panels below the visualizer - responsive grid */}
      {step && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.5rem',
          marginTop: '0.75rem',
        }}>
          {/* Data Structure - algorithm-specific */}
          {algorithm === 'bfs' && (
            <QueuePanel queue={step.queue} currentNode={step.currentNode} />
          )}
          {algorithm === 'dfs' && (
            <StackPanel stack={step.stack} currentNode={step.currentNode} />
          )}
          {algorithm === 'dijkstra' && (
            <PriorityQueuePanel priorityQueue={step.priorityQueue} currentNode={step.currentNode} />
          )}

          {/* Common panels */}
          <VisitedPanel visitedNodes={step.visitedNodes} currentNode={step.currentNode} />
          <TraversalPanel traversalOrder={step.traversalOrder} currentNode={step.currentNode} />

          {/* BFS-specific */}
          {algorithm === 'bfs' && (
            <LevelPanel levels={step.levels} visitedNodes={step.visitedNodes} />
          )}

          {/* Dijkstra-specific */}
          {algorithm === 'dijkstra' && (
            <DistanceTable distances={step.distances} visitedNodes={step.visitedNodes} />
          )}
          {algorithm === 'dijkstra' && (
            <ParentTable parent={step.parent} visitedNodes={step.visitedNodes} />
          )}
          {algorithm === 'dijkstra' && (
            <RelaxationPanel relaxation={step.relaxation ?? null} />
          )}
          {algorithm === 'dijkstra' && (
            <ShortestPathPanel
              pathEdges={step.pathEdges}
              distances={step.distances}
              destination={destNode}
            />
          )}

          {/* Pseudocode - always visible */}
          <PseudocodePanel
            lines={pseudocode}
            currentLine={step.pseudocodeLine}
            phase={step.phase}
          />

          {/* Event Log - always visible */}
          <EventLogPanel logEntries={step.logEntries} currentStep={currentStep} />
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', justifyContent: 'center' }}>
        {Object.entries(NODE_COLORS).map(([state, color]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', background: color, borderRadius: '50%', display: 'inline-block' }} />
            {state}
          </div>
        ))}
      </div>

      <StepHistoryTable
        steps={steps}
        currentStep={currentStep}
        algorithm={algorithm}
        onJumpToStep={jumpToStep}
        hasStarted={hasStarted}
        playing={playing}
      />
    </div>
  );
}
