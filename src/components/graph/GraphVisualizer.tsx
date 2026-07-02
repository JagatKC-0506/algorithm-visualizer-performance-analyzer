import { useState, useEffect, useRef, useCallback } from 'react';
import type { GraphAlgorithmType, GraphData, GraphStep } from '../../types';
import { graphAlgorithms } from '../../algorithms/graph';
import { generateGraph } from '../../algorithms/graph/generator';
import Button from '../common/Button';

interface Props {
  algorithm: GraphAlgorithmType;
}

const NODE_COLORS: Record<string, string> = {
  unvisited: 'var(--text-secondary)',
  visiting: '#f59e0b',
  visited: '#3b82f6',
  current: '#ef4444',
  path: '#22c55e',
};

const EDGE_COLORS: Record<string, string> = {
  default: 'var(--border)',
  exploring: '#f59e0b',
  visited: '#3b82f6',
  path: '#22c55e',
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
  const timerRef = useRef<number | null>(null);

  const weighted = algorithm === 'dijkstra';

  const generateNewGraph = useCallback(() => {
    const g = generateGraph(numNodes, weighted);
    setGraph(g);
    const dest = destNode >= numNodes ? numNodes - 1 : destNode;
    if (destNode >= numNodes) setDestNode(Math.max(0, numNodes - 1));
    const s = graphAlgorithms[algorithm].steps(g, startNode, dest);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
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

  const step = currentStep < steps.length ? steps[currentStep] : null;

  const getNodeState = (nodeId: number): string => {
    if (!step) return 'unvisited';
    if (nodeId === step.currentNode) return 'current';
    if (step.pathEdges.some(e => e.from === nodeId || e.to === nodeId)) return 'path';
    if (step.visitedNodes.includes(nodeId)) return 'visited';
    if (step.queue.includes(nodeId) || step.stack.includes(nodeId) || step.priorityQueue.some(e => e.node === nodeId))
      return 'visiting';
    return 'unvisited';
  };

  const isDestination = (nodeId: number): boolean => nodeId === destNode;

  const getEdgeState = (from: number, to: number): string => {
    if (!step) return 'default';
    if (step.pathEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return 'path';
    if (step.exploredEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return 'exploring';
    return 'default';
  };

  const goToStep = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && currentStep > 0) { setPlaying(false); setCurrentStep(currentStep - 1); }
    if (dir === 'next' && currentStep < steps.length - 1) { setPlaying(false); setCurrentStep(currentStep + 1); }
  };

  const reset = () => {
    setPlaying(false);
    setCurrentStep(0);
  };

  if (!graph) return null;

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
        <Button onClick={() => setPlaying(p => !p)}>{playing ? 'Pause' : currentStep >= steps.length - 1 ? 'Done' : 'Play'}</Button>
        <Button onClick={() => goToStep('prev')} disabled={currentStep <= 0} variant="secondary">Prev Step</Button>
        <Button onClick={() => goToStep('next')} disabled={currentStep >= steps.length - 1} variant="secondary">Next Step</Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Step {currentStep}/{steps.length - 1}</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '500px',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 700 560">
          {graph.edges.map((edge, ei) => {
            const from = graph.nodes[edge.from];
            const to = graph.nodes[edge.to];
            if (!from || !to) return null;
            const state = getEdgeState(edge.from, edge.to);
            return (
              <g key={ei}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={EDGE_COLORS[state] || EDGE_COLORS.default}
                  strokeWidth={state === 'path' ? 3 : state === 'exploring' ? 2 : 1}
                  strokeDasharray={state === 'exploring' ? '5,5' : 'none'}
                />
                {weighted && (
                  <text
                    x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}
                    fill="var(--text-secondary)" fontSize={12} textAnchor="middle"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}
          {graph.nodes.map(node => {
            const state = getNodeState(node.id);
            const isPath = step?.pathEdges.some(e => e.from === node.id || e.to === node.id);
            const isDest = isDestination(node.id);
            return (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={22}
                  fill={NODE_COLORS[state] || NODE_COLORS.unvisited}
                  stroke={isPath ? '#22c55e' : isDest ? '#eab308' : 'transparent'}
                  strokeWidth={isPath ? 3 : isDest ? 3 : 0}
                />
                {isDest && (
                  <circle
                    cx={node.x} cy={node.y} r={27}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth={2}
                    strokeDasharray="4,3"
                  />
                )}
                <text x={node.x} y={node.y + 1} fill="#fff" fontSize={13} textAnchor="middle" dominantBaseline="middle">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {step && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          {step.description}
        </p>
      )}
      {step && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center', fontSize: '0.85rem' }}>
          {algorithm === 'bfs' && (
            <div>
              <strong>Queue: </strong>
              [{step.queue.join(', ')}]
            </div>
          )}
          {algorithm === 'dfs' && (
            <div>
              <strong>Stack: </strong>
              [{step.stack.join(', ')}]
            </div>
          )}
          {algorithm === 'dijkstra' && (
            <div>
              <strong>Priority Queue: </strong>
              [{step.priorityQueue.map(e => `(${e.node},${e.dist})`).join(', ')}]
            </div>
          )}
          <div>
            <strong>Visited: </strong>
            [{step.visitedNodes.join(', ')}]
          </div>
          <div>
            <strong>Distances: </strong>
            [{Array.from(step.distances.entries()).filter(([, d]) => d < Infinity).map(([n, d]) => `${n}:${d}`).join(', ')}]
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
        {Object.entries(NODE_COLORS).map(([state, color]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', background: color, borderRadius: '50%', display: 'inline-block' }} />
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
