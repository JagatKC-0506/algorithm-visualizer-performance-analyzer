import { useState } from 'react';
import type { ComplexityDetail, ComplexityCase } from '../../types';

interface Props {
  details: ComplexityDetail[];
}

export default function ComplexityExplanation({ details }: Props) {
  const [selectedCase, setSelectedCase] = useState<ComplexityCase>('average');
  const detail = details.find(d => d.case === selectedCase) || details[0];

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Time Complexity Explanation</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['best', 'average', 'worst'] as ComplexityCase[]).map(c => (
          <button
            key={c}
            onClick={() => setSelectedCase(c)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: selectedCase === c ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: selectedCase === c ? 'var(--accent)' : 'var(--surface)',
              color: selectedCase === c ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {c.replace('-', ' ')} Case: {detail.notation}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.75rem' }}>
          {detail.notation}
        </p>
        {detail.explanation.map((exp, i) => (
          <p key={i} style={{ lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{exp}</p>
        ))}
      </div>
      {detail.recurrenceRelation && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Recurrence Relation</h4>
          <code style={{ fontSize: '1.1rem' }}>{detail.recurrenceRelation}</code>
        </div>
      )}
      {detail.recursionTree && detail.recursionTree.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Recursion Tree</h4>
          {detail.recursionTree.map((line, i) => (
            <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{line}</p>
          ))}
        </div>
      )}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Line-by-Line Complexity Calculation</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Line</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Cost</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Executions</th>
              </tr>
            </thead>
            <tbody>
              {detail.lineByLine.map((l, i) => (
                <tr key={i}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{l.line}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{l.cost}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{l.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Derivation</h4>
        {detail.derivation.map((step, i) => (
          <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{step}</p>
        ))}
      </div>
    </div>
  );
}
