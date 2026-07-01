interface AlgorithmInfoData {
  name: string;
  description: string;
  workingPrinciple: string;
  pseudocode: string[];
  steps: string[];
  advantages: string[];
  disadvantages: string[];
  commonMistakes: string[];
  realWorldApps: string[];
  whenToUse: string;
  whenNotToUse: string;
  applications?: string[];
}

interface Props {
  info: AlgorithmInfoData;
  type: 'sorting' | 'graph';
}

export default function AlgorithmExplanation({ info, type }: Props) {
  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Introduction</h3>
        <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{info.description}</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Working Principle</h3>
        <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{info.workingPrinciple}</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Pseudocode</h3>
        <pre
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            padding: '1rem',
            overflowX: 'auto',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {info.pseudocode.join('\n')}
        </pre>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Step-by-Step Explanation</h3>
        <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {info.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
      {info.applications && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Applications</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {info.applications.map((app, i) => (
              <li key={i}>{app}</li>
            ))}
          </ul>
        </section>
      )}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Advantages</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {info.advantages.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Disadvantages</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {info.disadvantages.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Common Mistakes</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {info.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Real-World Applications</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {info.realWorldApps.map((app, i) => <li key={i}>{app}</li>)}
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>When Should This Algorithm Be Used?</h3>
        <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{info.whenToUse}</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>When Should It NOT Be Used?</h3>
        <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{info.whenNotToUse}</p>
      </section>
    </div>
  );
}
