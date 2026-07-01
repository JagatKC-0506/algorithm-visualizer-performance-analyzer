import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', children, style, ...rest }: Props) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
    padding: size === 'sm' ? '0.375rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem',
    ...(variant === 'primary'
      ? { background: 'var(--accent)', color: '#fff' }
      : variant === 'secondary'
        ? { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }
        : { background: 'transparent', color: 'var(--text)' }),
    ...style,
  };

  return (
    <button style={base} {...rest}>
      {children}
    </button>
  );
}
