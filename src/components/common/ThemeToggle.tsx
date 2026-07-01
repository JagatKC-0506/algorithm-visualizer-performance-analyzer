import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        cursor: 'pointer',
        color: 'var(--text)',
        fontSize: '1rem',
        lineHeight: 1,
      }}
    >
      {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
    </button>
  );
}
