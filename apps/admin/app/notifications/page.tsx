import React from 'react';

const NOTIFICATIONS = [
  { id: 'n1', title: 'Daily Spark', body: 'Your next spark is ready!', type: 'push', audience: 'all_active', sent: 2401, delivered: 2389, opened: 892, failed: 12, sentAt: '2024-11-15 09:15', status: 'completed' },
  { id: 'n2', title: 'Memory Resurfacing', body: 'A memory from 1 year ago...', type: 'push', audience: 'all_active', sent: 1203, delivered: 1198, opened: 541, failed: 5, sentAt: '2024-11-15 08:44', status: 'completed' },
  { id: 'n3', title: 'Welcome to Momeants!', body: "You're all set. Start capturing...", type: 'push', audience: 'new_users', sent: 143, delivered: 143, opened: 98, failed: 0, sentAt: '2024-11-15 07:00', status: 'completed' },
  { id: 'n4', title: 'Clique Activity', body: 'Someone shared a new moment in Ellis Family', type: 'push', audience: 'clique_members', sent: 8, delivered: 8, opened: 6, failed: 0, sentAt: '2024-11-14 21:30', status: 'completed' },
  { id: 'n5', title: 'Holiday Spark Pack', body: 'New holiday sparks just dropped!', type: 'push', audience: 'all_active', sent: 2380, delivered: 2101, opened: 734, failed: 279, sentAt: '2024-11-14 12:00', status: 'completed' },
  { id: 'n6', title: 'Weekly Digest', body: 'Here are your highlights from this week', type: 'email', audience: 'all_users', sent: 10284, delivered: 10201, opened: 3892, failed: 83, sentAt: '2024-11-11 09:00', status: 'completed' },
  { id: 'n7', title: 'Cyber Monday Push', body: 'Upgrade to Momeants Pro — 40% off!', type: 'push', audience: 'free_users', sent: 0, delivered: 0, opened: 0, failed: 0, sentAt: '2024-12-02 10:00', status: 'scheduled' },
];

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  push: { background: 'rgba(181,124,255,0.15)', color: '#B57CFF', border: '1px solid rgba(181,124,255,0.3)' },
  email: { background: 'rgba(120,167,255,0.15)', color: '#78A7FF', border: '1px solid rgba(120,167,255,0.3)' },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  completed: { background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' },
  scheduled: { background: 'rgba(255,210,138,0.15)', color: '#FFD28A', border: '1px solid rgba(255,210,138,0.3)' },
  failed: { background: 'rgba(255,110,145,0.15)', color: '#FF6E91', border: '1px solid rgba(255,110,145,0.3)' },
};

export default function NotificationsPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Notifications</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>Push & email delivery log</p>
        </div>
        <button style={{ background: '#B57CFF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, padding: '9px 18px', cursor: 'pointer', fontWeight: 600 }}>+ New Campaign</button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Sent Today', value: '4,130', color: '#B57CFF' },
          { label: 'Delivered', value: '4,107', color: '#4CAF50' },
          { label: 'Opened', value: '1,537', color: '#78A7FF' },
          { label: 'Failed', value: '23', color: '#FF6E91' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${s.color}` }}>
            <div style={{ color: 'rgba(248,244,255,0.48)', fontSize: 11, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: '#F8F4FF', fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Title', 'Type', 'Audience', 'Sent', 'Delivered', 'Opened', 'Failed', 'Sent At', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATIONS.map((n, i) => (
              <tr key={n.id} style={{ borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: '#F8F4FF', fontWeight: 500 }}>{n.title}</div>
                  <div style={{ color: 'rgba(248,244,255,0.40)', fontSize: 11, marginTop: 2 }}>{n.body}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(TYPE_STYLE[n.type] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{n.type}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.60)', fontSize: 12 }}>{n.audience.replace(/_/g, ' ')}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{n.sent.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#4CAF50' }}>{n.delivered.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#78A7FF' }}>{n.opened.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: n.failed > 0 ? '#FF6E91' : 'rgba(248,244,255,0.36)' }}>{n.failed}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)', fontSize: 12 }}>{n.sentAt}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(STATUS_STYLE[n.status] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{n.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
