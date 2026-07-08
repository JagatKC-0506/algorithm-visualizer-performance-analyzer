import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}

export default function PanelWrapper({ title, children, style, accent }: Props) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        background: 'var(--surface)',
        ...style,
      }}
    >
      <div
        style={{
          padding: '0.5rem 0.75rem',
          background: accent ? `${accent}15` : 'var(--accent-alpha)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: accent || 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {title}
      </div>
      <div style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>
        {children}
      </div>
    </div>
  );
}
