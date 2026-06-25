import React from 'react';

const REPORTS = [
  { id: 'r1', reason: 'Inappropriate content', reporter: 'Taylor Park', target: 'Morgan K.', targetType: 'user', date: '2024-11-15 09:42', status: 'open', severity: 'high' },
  { id: 'r2', reason: 'Harassment', reporter: 'Ava Chen', target: 'Remy Davis', targetType: 'user', date: '2024-11-14 14:20', status: 'open', severity: 'high' },
  { id: 'r3', reason: 'Spam', reporter: 'Noah Kim', target: 'Suspicious content', targetType: 'moment', date: '2024-11-13 11:05', status: 'reviewing', severity: 'medium' },
  { id: 'r4', reason: 'Off-topic content', reporter: 'Sam Ellis', target: 'Concert night', targetType: 'moment', date: '2024-11-12 16:30', status: 'reviewing', severity: 'low' },
  { id: 'r5', reason: 'Fake account', reporter: 'Jordan Ellis', target: 'unknown_user99', targetType: 'user', date: '2024-11-10 08:15', status: 'resolved', severity: 'medium' },
  { id: 'r6', reason: 'Privacy violation', reporter: 'Mia Torres', target: 'Family BBQ', targetType: 'moment', date: '2024-11-08 19:00', status: 'resolved', severity: 'high' },
  { id: 'r7', reason: 'Bullying', reporter: 'Casey Walsh', target: 'Morgan K.', targetType: 'user', date: '2024-11-07 13:45', status: 'dismissed', severity: 'medium' },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open: { background: 'rgba(255,110,145,0.15)', color: '#FF6E91', border: '1px solid rgba(255,110,145,0.3)' },
  reviewing: { background: 'rgba(255,210,138,0.15)', color: '#FFD28A', border: '1px solid rgba(255,210,138,0.3)' },
  resolved: { background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' },
  dismissed: { background: 'rgba(255,255,255,0.05)', color: 'rgba(248,244,255,0.40)', border: '1px solid rgba(255,255,255,0.10)' },
};

const SEV_STYLE: Record<string, React.CSSProperties> = {
  high: { color: '#FF6E91' },
  medium: { color: '#FFD28A' },
  low: { color: 'rgba(248,244,255,0.48)' },
};

export default function ReportsPage() {
  const open = REPORTS.filter(r => r.status === 'open').length;
  const reviewing = REPORTS.filter(r => r.status === 'reviewing').length;

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Reports & Moderation</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>{open} open · {reviewing} under review</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Open', 'Reviewing', 'Resolved'].map(f => (
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
              {['Reason', 'Reporter', 'Target', 'Type', 'Severity', 'Date', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < REPORTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#F8F4FF', fontWeight: 500 }}>{r.reason}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{r.reporter}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{r.target}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: r.targetType === 'user' ? 'rgba(120,167,255,0.12)' : 'rgba(255,122,200,0.12)', color: r.targetType === 'user' ? '#78A7FF' : '#FF7AC8', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{r.targetType}</span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 12, ...SEV_STYLE[r.severity] }}>{r.severity}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)', fontSize: 12 }}>{r.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(STATUS_STYLE[r.status] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'none', border: 'none', color: '#B57CFF', cursor: 'pointer', fontSize: 12 }}>Review</button>
                    {r.status === 'open' && <button style={{ background: 'none', border: 'none', color: '#FF6E91', cursor: 'pointer', fontSize: 12 }}>Dismiss</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
