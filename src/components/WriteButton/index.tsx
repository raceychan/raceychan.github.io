import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

export default function WriteButton(): React.ReactElement | null {
  const location = useLocation();
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Don't show on the write page itself
  if (location.pathname === '/write') {
    return null;
  }

  return (
    <div style={{
      marginBottom: '1rem',
      textAlign: 'right',
    }}>
      <Link
        to="/write"
        className="button button--primary button--sm"
        style={{
          textDecoration: 'none',
          fontSize: '0.875rem',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        New Post
      </Link>
    </div>
  );
}