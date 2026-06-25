import React from 'react';
import Link from 'next/link';

const USERS = [
  { id: 'u1', name: 'Jordan Ellis', email: 'jordan@example.com', joined: '2024-01-15', lastActive: '2024-11-15', moments: 47, status: 'active' },
  { id: 'u2', name: 'Ava Chen', email: 'ava@example.com', joined: '2024-02-08', lastActive: '2024-11-14', moments: 31, status: 'active' },
  { id: 'u3', name: 'Noah Kim', email: 'noah@example.com', joined: '2024-02-20', lastActive: '2024-11-13', moments: 19, status: 'active' },
  { id: 'u4', name: 'Mia Torres', email: 'mia@example.com', joined: '2024-03-10', lastActive: '2024-11-12', moments: 22, status: 'active' },
  { id: 'u5', name: 'Alex Rivera', email: 'alex@example.com', joined: '2024-04-01', lastActive: '2024-11-14', moments: 88, status: 'active' },
  { id: 'u6', name: 'Sam Ellis', email: 'sam@example.com', joined: '2024-01-20', lastActive: '2024-11-10', moments: 15, status: 'active' },
  { id: 'u7', name: 'Morgan K.', email: 'morgan@example.com', joined: '2024-05-18', lastActive: '2024-11-09', moments: 5, status: 'flagged' },
  { id: 'u8', name: 'Casey Walsh', email: 'casey@example.com', joined: '2024-06-22', lastActive: '2024-09-01', moments: 0, status: 'inactive' },
  { id: 'u9', name: 'Remy Davis', email: 'remy@example.com', joined: '2024-07-04', lastActive: '2024-10-30', moments: 3, status: 'banned' },
  { id: 'u10', name: 'Taylor Park', email: 'taylor@example.com', joined: '2024-08-11', lastActive: '2024-11-15', moments: 61, status: 'active' },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active: { background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' },
  inactive: { background: 'rgba(255,255,255,0.05)', color: 'rgba(248,244,255,0.40)', border: '1px solid rgba(255,255,255,0.10)' },
  flagged: { background: 'rgba(255,210,138,0.15)', color: '#FFD28A', border: '1px solid rgba(255,210,138,0.3)' },
  banned: { background: 'rgba(255,110,145,0.15)', color: '#FF6E91', border: '1px solid rgba(255,110,145,0.3)' },
};

export default function UsersPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Users</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>10,284 total users</p>
        </div>
        <input placeholder="Search users…" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: '8px 14px', outline: 'none', width: 240 }} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Name', 'Email', 'Joined', 'Last Active', 'Moments', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < USERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#F8F4FF', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.60)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)' }}>{u.joined}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)' }}>{u.lastActive}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{u.moments}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...STATUS_STYLE[u.status], padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{u.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/users/${u.id}`} style={{ color: '#B57CFF', textDecoration: 'none', fontSize: 12 }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
