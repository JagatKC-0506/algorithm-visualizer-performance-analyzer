import { useState } from 'react';
import type { GraphAlgorithmType, GraphMetrics } from '../../types';
import { graphAlgorithms } from '../../algorithms/graph';
import { generateGraph } from '../../algorithms/graph/generator';
import Button from '../common/Button';

const GRAPH_ANALYSIS_ALGOS: GraphAlgorithmType[] = ['bfs', 'dfs', 'dijkstra'];

export default function GraphAnalyzer() {
  const [numNodes, setNumNodes] = useState(8);
  const [startNode, setStartNode] = useState(0);
  const [results, setResults] = useState<{ algorithm: GraphAlgorithmType; metrics: GraphMetrics }[]>([]);

  const runAnalysis = () => {
    const weightedGraph = generateGraph(numNodes, true);
    const unweightedGraph = generateGraph(numNodes, false);
    const res: { algorithm: GraphAlgorithmType; metrics: GraphMetrics }[] = [];

    for (const algo of GRAPH_ANALYSIS_ALGOS) {
      const g = algo === 'dijkstra' ? weightedGraph : unweightedGraph;
      const steps = graphAlgorithms[algo].steps(g, startNode);
      const last = steps[steps.length - 1];
      const start = performance.now();
      graphAlgorithms[algo].steps(g, startNode);
      const end = performance.now();
      res.push({
        algorithm: algo,
        metrics: {
          executionTime: end - start,
          visitedNodes: last.visitedNodes.length,
          traversedEdges: last.exploredEdges.length,
          memoryEstimate: g.nodes.length * 8 + last.visitedNodes.length * 4,
          pathLength: last.pathEdges.length,
        },
      });
    }
    setResults(res);
  };

  const timeComplexities: Record<GraphAlgorithmType, string> = {
    bfs: 'O(V + E)',
    dfs: 'O(V + E)',
    dijkstra: 'O(V + E log V)',
  };

  const spaceComplexities: Record<GraphAlgorithmType, string> = {
    bfs: 'O(V)',
    dfs: 'O(V)',
    dijkstra: 'O(V)',
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Graph Performance Analyzer</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Nodes:
          <input type="number" min={3} max={15} value={numNodes} onChange={e => setNumNodes(Number(e.target.value))} style={{ width: '50px' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Start Node:
          <input type="number" min={0} max={numNodes - 1} value={startNode} onChange={e => setStartNode(Number(e.target.value))} style={{ width: '50px' }} />
        </label>
        <Button onClick={runAnalysis}>Analyze All</Button>
      </div>
      {results.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Metric</th>
                {results.map(r => (
                  <th key={r.algorithm} style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', textAlign: 'center' }}>
                    {r.algorithm.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Execution Time', get: (r: typeof results[0]) => `${(r.metrics.executionTime * 1000).toFixed(2)} µs` },
                { label: 'Visited Nodes', get: (r: typeof results[0]) => String(r.metrics.visitedNodes) },
                { label: 'Traversed Edges', get: (r: typeof results[0]) => String(r.metrics.traversedEdges) },
                { label: 'Memory Usage', get: (r: typeof results[0]) => `${r.metrics.memoryEstimate} B` },
                { label: 'Path Length', get: (r: typeof results[0]) => String(r.metrics.pathLength) },
                { label: 'Time Complexity', get: (r: typeof results[0]) => timeComplexities[r.algorithm] },
                { label: 'Space Complexity', get: (r: typeof results[0]) => spaceComplexities[r.algorithm] },
              ].map(row => (
                <tr key={row.label}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{row.label}</td>
                  {results.map(r => (
                    <td key={r.algorithm} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      {row.get(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
