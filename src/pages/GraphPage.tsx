import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GraphAlgorithmType } from '../types';
import { GRAPH_ALGORITHMS, GRAPH_COMPLEXITY_DETAILS } from '../types/algorithms';
import BreadcrumbNav from '../components/common/BreadcrumbNav';
import ThemeToggle from '../components/common/ThemeToggle';
import AlgorithmExplanation from '../components/common/AlgorithmExplanation';
import ComplexityExplanation from '../components/common/ComplexityExplanation';
import GraphVisualizer from '../components/graph/GraphVisualizer';
import PerformanceGraph from '../components/sorting/PerformanceGraph';

const GRAPH_ALGORITHM_KEYS: GraphAlgorithmType[] = ['bfs', 'dfs', 'dijkstra'];

export default function GraphPage() {
  const [selectedAlgo, setSelectedAlgo] = useState<GraphAlgorithmType>('bfs');
  const [activeTab, setActiveTab] = useState<'explanation' | 'complexity' | 'visualizer' | 'graph'>('visualizer');

  const info = GRAPH_ALGORITHMS[selectedAlgo];
  const complexity = GRAPH_COMPLEXITY_DETAILS[selectedAlgo] || [];
  const tabs = [
    { id: 'explanation', label: 'Explanation' },
    { id: 'complexity', label: 'Complexity' },
    { id: 'visualizer', label: 'Visualizer' },
    { id: 'graph', label: 'Performance Graph' },
  ] as const;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <BreadcrumbNav crumbs={[{ label: 'Home', path: '/' }, { label: 'Graph Algorithms', path: '/graph' }]} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Graph Algorithm Visualizer</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>Back to Home</Link>
          <ThemeToggle />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {GRAPH_ALGORITHM_KEYS.map(key => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: selectedAlgo === key ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: selectedAlgo === key ? 'var(--accent)' : 'var(--surface)',
              color: selectedAlgo === key ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
            }}
          >
            {GRAPH_ALGORITHMS[key]?.name || key}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '0.9rem',
              marginBottom: '-0.5rem',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1.5rem' }}>
        {activeTab === 'explanation' && info && (
          <AlgorithmExplanation info={{ ...info, realWorldApps: info.applications || [] }} type="graph" />
        )}
        {activeTab === 'complexity' && <ComplexityExplanation details={complexity} />}
        {activeTab === 'visualizer' && <GraphVisualizer algorithm={selectedAlgo} />}
        {activeTab === 'graph' && <PerformanceGraph algorithm={selectedAlgo} />}
      </div>
    </div>
  );
}
