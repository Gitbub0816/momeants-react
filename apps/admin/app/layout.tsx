import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Momeants Admin',
  description: 'Momeants internal operations console',
};

const NAV = [
  { href: '/', label: 'Dashboard', icon: '⌂' },
  { href: '/users', label: 'Users', icon: '👤' },
  { href: '/moments', label: 'Moments', icon: '📸' },
  { href: '/sparks', label: 'Sparks', icon: '⚡' },
  { href: '/reports', label: 'Reports', icon: '🚩' },
  { href: '/support', label: 'Support', icon: '🎧' },
  { href: '/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/feature-flags', label: 'Feature Flags', icon: '🚀' },
  { href: '/system', label: 'System Health', icon: '💻' },
  { href: '/audit', label: 'Audit Log', icon: '📋' },
];

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#050711',
    color: '#F8F4FF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
  } as React.CSSProperties,
  sidebar: {
    width: 220,
    background: '#090C18',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    overflowY: 'auto' as const,
  },
  logo: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: 8,
  },
  logoText: {
    color: '#B57CFF',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  logoSub: {
    color: 'rgba(248,244,255,0.36)',
    fontSize: 11,
    marginTop: 2,
  },
  nav: {
    flex: 1,
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 8,
    color: 'rgba(248,244,255,0.60)',
    textDecoration: 'none',
    fontSize: 13,
    transition: 'all 0.15s',
  },
  navIcon: { fontSize: 15, width: 18, textAlign: 'center' as const },
  sidebarBottom: {
    padding: '12px 20px 20px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(248,244,255,0.40)',
    fontSize: 12,
  },
  main: {
    flex: 1,
    overflow: 'auto',
    minWidth: 0,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={styles.root}>
          <aside style={styles.sidebar}>
            <div style={styles.logo}>
              <div style={styles.logoText}>Momeants Admin</div>
              <div style={styles.logoSub}>Operations Console</div>
            </div>
            <nav style={styles.nav}>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} style={styles.navItem}>
                  <span style={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div style={styles.sidebarBottom}>
              <div>Signed in as <strong>Admin</strong></div>
              <div style={{ marginTop: 4, cursor: 'pointer', color: 'rgba(248,244,255,0.40)' }}>Sign out</div>
            </div>
          </aside>
          <main style={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
