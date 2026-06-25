import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Sidebar from './Sidebar';
import AuthGate from './AuthGate';

export const metadata: Metadata = {
  title: 'Momeants Admin',
  description: 'Momeants internal operations console',
};

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#050711',
    color: '#F8F4FF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
  } as React.CSSProperties,
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
          <Sidebar />
          <main style={styles.main}>
            <AuthGate>{children}</AuthGate>
          </main>
        </div>
      </body>
    </html>
  );
}
