import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}

export default function Card({ children, style, onClick, className }: Props) {
  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...(onClick ? { ':hover': { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent-alpha)' } } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
