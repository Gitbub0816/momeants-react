import React from 'react';
import Link from 'next/link';

const TICKETS = [
  { id: 't1', subject: 'Can\'t upload photos on iOS 17', user: 'Jordan Ellis', email: 'jordan@example.com', category: 'bug', priority: 'high', status: 'open', created: '2024-11-15 09:10' },
  { id: 't2', subject: 'How do I delete a moment?', user: 'Ava Chen', email: 'ava@example.com', category: 'question', priority: 'low', status: 'open', created: '2024-11-15 08:45' },
  { id: 't3', subject: 'Sparks not loading', user: 'Noah Kim', email: 'noah@example.com', category: 'bug', priority: 'medium', status: 'in_progress', created: '2024-11-14 17:30' },
  { id: 't4', subject: 'Clique invite link expired', user: 'Mia Torres', email: 'mia@example.com', category: 'bug', priority: 'medium', status: 'in_progress', created: '2024-11-14 14:00' },
  { id: 't5', subject: 'Request account data export', user: 'Alex Rivera', email: 'alex@example.com', category: 'privacy', priority: 'high', status: 'open', created: '2024-11-14 11:20' },
  { id: 't6', subject: 'Notification settings reset after update', user: 'Sam Ellis', email: 'sam@example.com', category: 'bug', priority: 'medium', status: 'open', created: '2024-11-13 16:55' },
  { id: 't7', subject: 'Calendar not syncing birthdays', user: 'Taylor Park', email: 'taylor@example.com', category: 'bug', priority: 'low', status: 'resolved', created: '2024-11-12 09:00' },
  { id: 't8', subject: 'Password reset email not arriving', user: 'Casey Walsh', email: 'casey@example.com', category: 'account', priority: 'high', status: 'resolved', created: '2024-11-10 14:30' },
];

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  high: { color: '#FF6E91' },
  medium: { color: '#FFD28A' },
  low: { color: 'rgba(248,244,255,0.48)' },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open: { background: 'rgba(120,167,255,0.15)', color: '#78A7FF', border: '1px solid rgba(120,167,255,0.3)' },
  in_progress: { background: 'rgba(255,210,138,0.15)', color: '#FFD28A', border: '1px solid rgba(255,210,138,0.3)' },
  resolved: { background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' },
};

const CAT_STYLE: Record<string, React.CSSProperties> = {
  bug: { background: 'rgba(255,110,145,0.12)', color: '#FF6E91' },
  question: { background: 'rgba(120,167,255,0.12)', color: '#78A7FF' },
  privacy: { background: 'rgba(181,124,255,0.12)', color: '#B57CFF' },
  account: { background: 'rgba(255,179,138,0.12)', color: '#FFB38A' },
  feature: { background: 'rgba(76,175,80,0.12)', color: '#4CAF50' },
};

export default function SupportPage() {
  const open = TICKETS.filter(t => t.status === 'open').length;

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Support Tickets</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>{open} open tickets · {TICKETS.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search tickets…" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: '8px 14px', outline: 'none', width: 200 }} />
          {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
            <button key={f} style={{ background: f === 'All' ? 'rgba(181,124,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${f === 'All' ? 'rgba(181,124,255,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: f === 'All' ? '#B57CFF' : 'rgba(248,244,255,0.60)', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Subject', 'User', 'Category', 'Priority', 'Status', 'Created', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TICKETS.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < TICKETS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#F8F4FF', fontWeight: 500, maxWidth: 280 }}>{t.subject}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: 'rgba(248,244,255,0.72)', fontSize: 13 }}>{t.user}</div>
                  <div style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11, marginTop: 2 }}>{t.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(CAT_STYLE[t.category] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{t.category}</span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 12, ...PRIORITY_STYLE[t.priority] }}>{t.priority}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(STATUS_STYLE[t.status] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t.status.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)', fontSize: 12 }}>{t.created}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/support/${t.id}`} style={{ color: '#B57CFF', textDecoration: 'none', fontSize: 12 }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
