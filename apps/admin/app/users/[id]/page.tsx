import React from 'react';
import Link from 'next/link';

const MOCK_USER = {
  id: 'u1',
  name: 'Jordan Ellis',
  email: 'jordan@example.com',
  username: '@jordan_e',
  joined: 'January 15, 2024',
  lastActive: 'November 15, 2024 at 9:42 AM',
  platform: 'iOS 17.1',
  appVersion: '1.0.0 (1)',
  moments: 47,
  sparks: 31,
  cliques: 3,
  daysRemembered: 82,
  status: 'active',
  notificationsEnabled: true,
  reports: 0,
  reportsAgainst: 0,
};

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 16 };

export default function UserDetailPage() {
  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      <Link href="/users" style={{ color: 'rgba(248,244,255,0.48)', textDecoration: 'none', fontSize: 13 }}>← Users</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0 24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>{MOCK_USER.name}</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>{MOCK_USER.email} · {MOCK_USER.username}</p>
        </div>
        <span style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Active</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Profile */}
        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Profile</h2>
          {[
            ['Joined', MOCK_USER.joined],
            ['Last Active', MOCK_USER.lastActive],
            ['Platform', MOCK_USER.platform],
            ['App Version', MOCK_USER.appVersion],
            ['Push Notifications', MOCK_USER.notificationsEnabled ? 'Enabled' : 'Disabled'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
              <span style={{ color: 'rgba(248,244,255,0.48)' }}>{k}</span>
              <span style={{ color: '#F8F4FF' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Activity</h2>
          {[
            ['Moments', MOCK_USER.moments],
            ['Sparks Completed', MOCK_USER.sparks],
            ['Cliques', MOCK_USER.cliques],
            ['Days Remembered', MOCK_USER.daysRemembered],
            ['Reports Filed', MOCK_USER.reports],
            ['Reports Against', MOCK_USER.reportsAgainst],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
              <span style={{ color: 'rgba(248,244,255,0.48)' }}>{k}</span>
              <span style={{ color: '#F8F4FF', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div style={card}>
        <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin Actions</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Send Password Reset', color: '#78A7FF' },
            { label: 'Force Logout', color: '#FFB38A' },
            { label: 'Export User Data', color: '#B57CFF' },
            { label: 'Disable Account', color: '#FFD28A' },
            { label: 'Ban Account', color: '#FF6E91' },
          ].map((a) => (
            <button key={a.label} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, color: a.color, fontSize: 12, padding: '7px 14px', cursor: 'pointer' }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div style={card}>
        <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Internal Notes</h2>
        <textarea placeholder="Add an internal note about this user…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: 12, resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }} />
        <button style={{ marginTop: 8, background: '#B57CFF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '7px 16px', cursor: 'pointer', fontWeight: 600 }}>Save Note</button>
      </div>
    </div>
  );
}
