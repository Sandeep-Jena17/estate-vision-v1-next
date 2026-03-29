'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children:    React.ReactNode;
  role?:       'agent' | 'admin' | null;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role       = null,
  redirectTo = '/auth?mode=login',
}) => {
  const { user, isLoggedIn, isLoading, isAgent, isAdmin } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      localStorage.setItem('ev_redirect', pathname);
      router.replace(redirectTo);
    }
  }, [isLoading, isLoggedIn, pathname, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="route-loading">
        <div className="route-spinner" aria-label="Loading…" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const hasAccess =
    role === null    ? true    :
    role === 'admin' ? isAdmin :
    role === 'agent' ? isAgent :
    false;

  if (!hasAccess) {
    const message =
      role === 'admin'
        ? 'This area is for administrators only.'
        : 'This area is for registered agents only.';

    return (
      <div className="access-denied">
        <div className="access-denied-card">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8, color: 'var(--text)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
            {message}
          </p>
          <button className="btn btn-gold" onClick={() => router.push('/')}>
            Go Home
          </button>
          {role === 'agent' && user?.role === 'buyer' && (
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
              Want to list properties?{' '}
              <button className="auth-link" onClick={() => router.push('/auth?mode=register')}>
                Register as an agent
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
