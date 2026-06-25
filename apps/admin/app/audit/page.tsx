import React from 'react';

const AUDIT_LOG = [
  { id: 'a1', time: '2024-11-15 09:42', admin: 'admin@momeants.com', action: 'flag_user', target: '@morgan_k', targetType: 'user', details: 'Flagged for review after report #r1', ip: '10.0.1.5' },
  { id: 'a2', time: '2024-11-15 09:15', admin: 'system', action: 'push_batch', target: '2,401 users', targetType: 'notification', details: 'Daily spark push batch delivered', ip: '—' },
  { id: 'a3', time: '2024-11-14 16:30', admin: 'admin@momeants.com', action: 'disable_flag', target: 'sparks_v1_engine', targetType: 'feature_flag', details: 'Disabled legacy engine after V2 rollout reached 100%', ip: '10.0.1.5' },
  { id: 'a4', time: '2024-11-14 14:20', admin: 'admin@momeants.com', action: 'ban_user', target: '@remy_d', targetType: 'user', details: 'Banned following confirmed harassment report #r2', ip: '10.0.1.5' },
  { id: 'a5', time: '2024-11-14 12:00', admin: 'admin@momeants.com', action: 'send_campaign', target: 'Holiday Spark Pack', targetType: 'notification', details: 'Push campaign sent to 2,380 active users', ip: '10.0.1.5' },
  { id: 'a6', time: '2024-11-13 11:05', admin: 'admin@momeants.com', action: 'resolve_report', target: 'Report #r3', targetType: 'report', details: 'Dismissed — content deemed acceptable', ip: '10.0.1.5' },
  { id: 'a7', time: '2024-11-12 09:00', admin: 'admin@momeants.com', action: 'enable_flag', target: 'offline_mode', targetType: 'feature_flag', details: 'Enabled offline mode for 30% rollout', ip: '10.0.1.5' },
  { id: 'a8', time: '2024-11-11 09:00', admin: 'system', action: 'email_digest', target: '10,284 users', targetType: 'notification', details: 'Weekly digest email batch sent', ip: '—' },
  { id: 'a9', time: '2024-11-10 14:30', admin: 'admin@momeants.com', action: 'reset_password', target: '@casey_w', targetType: 'user', details: 'Manual password reset triggered via support ticket #t8', ip: '10.0.1.5' },
  { id: 'a10', time: '2024-11-10 08:15', admin: 'admin@momeants.com', action: 'resolve_report', target: 'Report #r5', targetType: 'report', details: 'Resolved — account confirmed fake, user warned', ip: '10.0.1.5' },
  { id: 'a11', time: '2024-11-08 19:00', admin: 'admin@momeants.com', action: 'remove_moment', target: 'Moment #m_priv01', targetType: 'moment', details: 'Removed for privacy violation — contains identifiable third-party', ip: '10.0.1.5' },
  { id: 'a12', time: '2024-11-08 10:00', admin: 'admin@momeants.com', action: 'enable_spark', target: 'Rapid Fire: Couple Edition', targetType: 'spark', details: 'Re-enabled after content review', ip: '10.0.1.5' },
];

const ACTION_COLOR: Record<string, string> = {
  flag_user: '#FFD28A',
  ban_user: '#FF6E91',
  disable_flag: '#FFB38A',
  enable_flag: '#4CAF50',
  send_campaign: '#B57CFF',
  email_digest: '#B57CFF',
  push_batch: '#B57CFF',
  resolve_report: '#4CAF50',
  reset_password: '#78A7FF',
  remove_moment: '#FF6E91',
  enable_spark: '#4CAF50',
};

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  user: { background: 'rgba(120,167,255,0.12)', color: '#78A7FF' },
  notification: { background: 'rgba(181,124,255,0.12)', color: '#B57CFF' },
  feature_flag: { background: 'rgba(255,179,138,0.12)', color: '#FFB38A' },
  report: { background: 'rgba(255,210,138,0.12)', color: '#FFD28A' },
  moment: { background: 'rgba(255,122,200,0.12)', color: '#FF7AC8' },
  spark: { background: 'rgba(76,175,80,0.12)', color: '#4CAF50' },
};

export default function AuditPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Audit Log</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>Immutable record of all admin actions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Filter by admin, action…" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: '8px 14px', outline: 'none', width: 220 }} />
          <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: 'rgba(248,244,255,0.60)', fontSize: 12, padding: '8px 14px', cursor: 'pointer' }}>Export CSV</button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Time', 'Admin', 'Action', 'Target', 'Type', 'Details', 'IP'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOG.map((entry, i) => (
              <tr key={entry.id} style={{ borderBottom: i < AUDIT_LOG.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '10px 16px', color: 'rgba(248,244,255,0.48)', fontSize: 12, whiteSpace: 'nowrap' }}>{entry.time}</td>
                <td style={{ padding: '10px 16px', color: entry.admin === 'system' ? 'rgba(248,244,255,0.36)' : 'rgba(248,244,255,0.72)', fontFamily: 'monospace', fontSize: 11 }}>{entry.admin}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ color: ACTION_COLOR[entry.action] ?? '#F8F4FF', fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{entry.action}</span>
                </td>
                <td style={{ padding: '10px 16px', color: '#F8F4FF', fontWeight: 500, fontSize: 12 }}>{entry.target}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ ...(TYPE_STYLE[entry.targetType] ?? {}), padding: '2px 8px', borderRadius: 20, fontSize: 10 }}>{entry.targetType.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '10px 16px', color: 'rgba(248,244,255,0.48)', fontSize: 12, maxWidth: 260 }}>{entry.details}</td>
                <td style={{ padding: '10px 16px', color: 'rgba(248,244,255,0.36)', fontFamily: 'monospace', fontSize: 11 }}>{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
