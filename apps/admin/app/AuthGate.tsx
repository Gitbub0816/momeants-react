'use client';

import React, { useState, useEffect } from 'react';

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#050711',
  } as React.CSSProperties,
  card: {
    background: '#090C18',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '36px 32px',
    width: 340,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  title: {
    color: '#B57CFF',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  label: {
    color: 'rgba(248,244,255,0.60)',
    fontSize: 12,
    marginBottom: 4,
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 7,
    color: '#F8F4FF',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    padding: '10px',
    background: '#B57CFF',
    color: '#050711',
    border: 'none',
    borderRadius: 7,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center' as const,
  },
};

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const val = sessionStorage.getItem('admin_auth');
    setAuthed(!!val);
  }, []);

  if (authed === null) return null;

  if (authed) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === 'momeants2024') {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.title}>Momeants Admin</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@momeants.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button}>Sign in</button>
        </form>
      </div>
    </div>
  );
}
