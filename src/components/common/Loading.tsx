export default function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}
