import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  path: string;
}

export default function BreadcrumbNav({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
        {crumbs.map((crumb, idx) => (
          <li key={crumb.path}>
            {idx < crumbs.length - 1 ? (
              <>
                <Link to={crumb.path} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>/</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
