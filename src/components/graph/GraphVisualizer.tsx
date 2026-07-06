import { useState, useEffect, useRef, useCallback } from 'react';
import type { GraphAlgorithmType, GraphData, GraphStep } from '../../types';
import { graphAlgorithms } from '../../algorithms/graph';
import { generateGraph } from '../../algorithms/graph/generator';
import Button from '../common/Button';
import StepHistoryTable from './StepHistoryTable';

interface Props {
  algorithm: GraphAlgorithmType;
}

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

export default function GraphVisualizer({ algorithm }: Props) {
  const [numNodes, setNumNodes] = useState(8);
  const [startNode, setStartNode] = useState(0);
  const [destNode, setDestNode] = useState<number>(numNodes - 1);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [hasStarted, setHasStarted] = useState(false);
  const [pathRevealCount, setPathRevealCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const pathTimerRef = useRef<number | null>(null);

  const weighted = algorithm === 'dijkstra';

  const generateNewGraph = useCallback(() => {
    if (pathTimerRef.current) clearInterval(pathTimerRef.current);
    const g = generateGraph(numNodes, weighted);
    setGraph(g);
    const dest = destNode >= numNodes ? numNodes - 1 : destNode;
    if (destNode >= numNodes) setDestNode(Math.max(0, numNodes - 1));
    const s = graphAlgorithms[algorithm].steps(g, startNode, dest);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
    setHasStarted(false);
    setPathRevealCount(0);
  }, [numNodes, startNode, destNode, algorithm, weighted]);

  useEffect(() => {
    generateNewGraph();
  }, [generateNewGraph]);

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

  const isPathEdge = (from: number, to: number): boolean => {
    if (!step) return false;
    const revealed = pathRevealCount > 0 ? step.pathEdges.slice(0, pathRevealCount) : step.pathEdges;
    return revealed.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
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

  if (!graph) return null;

  const dataStructureLabel = algorithm === 'bfs' ? 'Queue' : algorithm === 'dfs' ? 'Stack' : 'Priority Queue';

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Nodes:
          <input type="range" min={3} max={15} value={numNodes} onChange={e => setNumNodes(Number(e.target.value))} />
          <span>{numNodes}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Start:
          <input type="number" min={0} max={numNodes - 1} value={startNode} onChange={e => setStartNode(Number(e.target.value))} style={{ width: '50px' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Dest:
          <input type="number" min={0} max={numNodes - 1} value={destNode} onChange={e => setDestNode(Number(e.target.value))} style={{ width: '50px' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          Speed:
          <input type="range" min={100} max={1500} value={1600 - speed} onChange={e => setSpeed(1600 - Number(e.target.value))} />
        </label>
        <Button onClick={generateNewGraph}>Generate New Graph</Button>
        <Button onClick={reset} variant="secondary">Reset</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <Button onClick={handlePlay}>
          {playing ? 'Pause' : currentStep >= steps.length - 1 ? 'Replay' : !hasStarted ? 'Play' : 'Play'}
        </Button>
        <Button onClick={() => goToStep('prev')} disabled={currentStep <= 0} variant="secondary">Prev Step</Button>
        <Button onClick={() => goToStep('next')} disabled={currentStep >= steps.length - 1} variant="secondary">Next Step</Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Step {currentStep}/{steps.length - 1}</span>
      </div>

      <div
        style={{
          width: '100%',
          height: '520px',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg className="graph-visualizer-svg" width="100%" height="100%" viewBox="0 0 700 560">
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
          </defs>

          {graph.edges.map((edge, ei) => {
            const from = graph.nodes[edge.from];
            const to = graph.nodes[edge.to];
            if (!from || !to) return null;
            const state = getEdgeState(edge.from, edge.to);
            const isPath = state === 'path';
            return (
              <g key={ei}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={EDGE_COLORS[state] || EDGE_COLORS.default}
                  strokeWidth={isPath ? 3 : state === 'exploring' ? 2.5 : 1}
                  strokeDasharray={state === 'exploring' ? '6,4' : 'none'}
                  className={isPath ? 'path-edge' : state === 'exploring' ? 'exploring-edge' : undefined}
                  markerEnd={isPath ? 'url(#arrow-path)' : state === 'exploring' ? 'url(#arrow-exploring)' : 'url(#arrow-default)'}
                />
                {weighted && (
                  <text
                    x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}
                    fill="var(--text-secondary)" fontSize={12} textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {graph.nodes.map(node => {
            const state = getNodeState(node.id);
            const isFront = isFrontier(node.id);
            const isDest = isDestination(node.id);
            const isStart = node.id === startNode;
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

                <circle
                  cx={node.x} cy={node.y}
                  r={isBacktrack ? 18 : isPath ? 24 : 22}
                  fill={isBacktrack ? 'rgba(168,130,255,0.4)' : NODE_COLORS[state] || NODE_COLORS.unvisited}
                  stroke={isBacktrack ? '#a882ff' : isPath ? '#22c55e' : isDest ? '#eab308' : isStart ? '#6366f1' : state === 'current' ? '#ef4444' : 'transparent'}
                  strokeWidth={isBacktrack ? 2 : isPath ? 3 : isDest ? 3 : state === 'current' ? 3 : 0}
                  style={{ opacity: isBacktrack ? 0.5 : 1 }}
                />

                <text x={node.x} y={node.y + 1} fill="#fff" fontSize={13} textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>
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
        </svg>
      </div>

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

      {step && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', justifyContent: 'center' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {dataStructureLabel}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {algorithm === 'bfs' && (step.queue.length > 0 ? step.queue.map((n, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: 'rgba(245,158,11,0.15)',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}>{n}</span>
              )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>empty</span>)}
              {algorithm === 'dfs' && (step.stack.length > 0 ? step.stack.map((n, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: 'rgba(245,158,11,0.15)',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}>{n}</span>
              )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>empty</span>)}
              {algorithm === 'dijkstra' && (step.priorityQueue.length > 0 ? step.priorityQueue.map((e, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: 'rgba(245,158,11,0.15)',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}>
                  <span>{e.node}</span>
                  <span style={{ color: 'rgba(245,158,11,0.6)' }}>({e.dist})</span>
                </span>
              )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>empty</span>)}
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Visited
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {step.visitedNodes.length > 0 ? step.visitedNodes.map((n, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 6px',
                  borderRadius: '4px',
                  background: 'rgba(59,130,246,0.15)',
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}>{n}</span>
              )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>none</span>}
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Distances
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {Array.from(step.distances.entries())
                .filter(([, d]) => d < Infinity)
                .map(([n, d]) => (
                  <span key={n} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    height: '24px',
                    padding: '0 6px',
                    borderRadius: '4px',
                    background: 'rgba(99,102,241,0.1)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}>
                    <span style={{ color: 'var(--text)' }}>{n}:</span>
                    <span>{d}</span>
                  </span>
                ))}
              {Array.from(step.distances.entries()).filter(([, d]) => d < Infinity).length === 0 && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>none</span>
              )}
            </div>
          </div>
        </div>
      )}

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
