'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../common';
import { useAuth } from '@/hooks/useAuth';
import { User, UserRole } from '@/types/auth.types';

/* ── Theme hook ──────────────────────────────────────────── */
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ev-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('ev-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  return { isDark, toggle: () => setIsDark(d => !d) };
}

/* ── Nav dropdown menu items per role ────────────────────── */
const MENU_ITEMS: Record<UserRole, { icon: string; label: string; path: string }[]> = {
  admin: [
    { icon: '⊞',  label: 'Admin Panel',    path: '/admin'            },
    { icon: '🏠', label: 'All Listings',    path: '/admin/listings'   },
    { icon: '👥', label: 'Manage Agents',   path: '/admin/agents'     },
    { icon: '⚙',  label: 'Settings',        path: '/admin/settings'   },
  ],
  agent: [
    { icon: '⊞',  label: 'Agent Dashboard', path: '/agent'            },
    { icon: '🏠', label: 'My Listings',      path: '/agent/listings'   },
    { icon: '👥', label: 'My Leads',         path: '/agent/leads'      },
    { icon: '⚙',  label: 'Profile Settings', path: '/agent/profile'   },
  ],
  buyer: [
    { icon: '👤', label: 'My Dashboard',     path: '/dashboard'        },
    { icon: '♥',  label: 'Saved Properties', path: '/dashboard/saved'  },
    { icon: '📅', label: 'My Bookings',      path: '/dashboard/bookings'},
    { icon: '⚙',  label: 'Settings',         path: '/dashboard/settings'},
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '👑 Admin',
  agent: '🏢 Agent',
  buyer: '🏠 Buyer',
};

/* ── NavDropdown ─────────────────────────────────────────── */
interface DropdownProps {
  user:       User;
  onNavigate: (path: string) => void;
  onLogout:   () => void;
  onClose:    () => void;
}
const NavDropdown: React.FC<DropdownProps> = ({ user, onNavigate, onLogout, onClose }) => {
  const items = MENU_ITEMS[user.role];
  return (
    <div className="nav-dropdown">
      {/* User info header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{user.email}</div>
      </div>
      {items.map(item => (
        <button
          key={item.path}
          className="nav-dropdown-item"
          onClick={() => { onNavigate(item.path); onClose(); }}
        >
          <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div className="nav-dropdown-divider" />
      <button
        className="nav-dropdown-item danger"
        onClick={() => { onLogout(); onClose(); }}
      >
        <span style={{ width: 18, textAlign: 'center' }}>↩</span>
        Log Out
      </button>
    </div>
  );
};

/* ── Header ──────────────────────────────────────────────── */
export const Header: React.FC = () => {
  const router    = useRouter();
  const pathname  = usePathname();
  const { isDark, toggle }                    = useTheme();
  const { user, isLoggedIn, logout }          = useAuth();
  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen,     setDropdownOpen]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { label: 'Home',       path: '/'           },
    { label: 'Listings',   path: '/listings'   },
    { label: 'Properties', path: '/properties' },
    { label: 'Projects',   path: '/projects'   },
    { label: 'Agents',     path: '/agents'     },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* ── NAV ─────────────────────────────────────── */}
      <nav
        className="nav"
        style={{ boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,.08)' : 'none' }}
      >
        <div className="nav-inner">

          {/* Logo */}
          <button className="nav-logo" onClick={() => router.push('/')}>
            <span className="dot" />
            EstateVision
          </button>

          {/* Desktop nav links */}
          <div className="nav-desktop-links">
            {navItems.map(item => (
              <button
                key={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop: theme toggle + auth area */}
          <div className="nav-desktop-auth">
            <button
              className="theme-toggle"
              onClick={toggle}
              title={isDark ? 'Switch to light' : 'Switch to dark'}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {isLoggedIn && user ? (
              /* ── Logged-in user menu ── */
              <div className="nav-user-menu" ref={dropdownRef}>
                <button
                  className="nav-user-trigger"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-expanded={dropdownOpen}
                  aria-label="User menu"
                >
                  <img
                    src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`}
                    alt={user.name}
                    className="nav-avatar"
                  />
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <span className={`badge badge-role-${user.role}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>▾</span>
                </button>

                {dropdownOpen && (
                  <NavDropdown
                    user={user}
                    onNavigate={(path) => router.push(path)}
                    onLogout={handleLogout}
                    onClose={() => setDropdownOpen(false)}
                  />
                )}
              </div>
            ) : (
              /* ── Logged-out buttons ── */
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth?mode=login')}
                >
                  Log In
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => router.push('/auth?mode=register')}
                >
                  Sign Up Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="nav-mobile-right">
            <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            {isLoggedIn && user && (
              <img
                src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`}
                alt={user.name}
                className="nav-avatar"
                onClick={() => router.push(MENU_ITEMS[user.role][0].path)}
                style={{ cursor: 'pointer' }}
              />
            )}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </nav>

      {/* ── MOBILE OVERLAY ────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE MENU ───────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}

          {isLoggedIn && user ? (
            <div className="mobile-menu-auth">
              <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted)' }}>
                Signed in as <strong style={{ color: 'var(--text)' }}>{user.name.split(' ')[0]}</strong>
                {' '}<span className={`badge badge-role-${user.role}`}>{ROLE_LABELS[user.role]}</span>
              </div>
              {MENU_ITEMS[user.role].slice(0, 2).map(item => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => router.push(item.path)}
                >
                  {item.icon} {item.label}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                style={{ width: '100%' }}
                onClick={handleLogout}
              >
                ↩ Log Out
              </Button>
            </div>
          ) : (
            <div className="mobile-menu-auth">
              <Button
                variant="ghost"
                size="sm"
                style={{ width: '100%' }}
                onClick={() => router.push('/auth?mode=login')}
              >
                Log In
              </Button>
              <Button
                variant="gold"
                size="sm"
                style={{ width: '100%' }}
                onClick={() => router.push('/auth?mode=register')}
              >
                Sign Up Free
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

Header.displayName = 'Header';
