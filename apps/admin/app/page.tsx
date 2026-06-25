import React from 'react';

const KPI = [
  { label: 'Daily Active Users', value: '2,847', delta: '+12%', color: '#B57CFF' },
  { label: 'New Users Today', value: '143', delta: '+8%', color: '#78A7FF' },
  { label: 'Moments Created', value: '891', delta: '+5%', color: '#FF7AC8' },
  { label: 'Sparks Completed', value: '312', delta: '+18%', color: '#FFD28A' },
  { label: 'Reports Open', value: '7', delta: '-2', color: '#FF6E91' },
  { label: 'Support Tickets', value: '14', delta: '+3', color: '#FFB38A' },
  { label: 'Crash-Free Rate', value: '99.4%', delta: '→', color: '#B57CFF' },
  { label: 'Push Failures', value: '23', delta: '-15%', color: '#78A7FF' },
];

const RECENT_EVENTS = [
  { time: '09:42', type: 'report', text: 'New report filed against user @morgan_k', severity: 'warn' },
  { time: '09:31', text: 'Spark "Family Story: Childhood Home" completed 28 times', type: 'spark', severity: 'ok' },
  { time: '09:15', text: 'Push notification batch sent — 2,401 delivered', type: 'notif', severity: 'ok' },
  { time: '08:58', text: 'User @alex_r2 account flagged for review', type: 'moderation', severity: 'warn' },
  { time: '08:44', text: 'Resurfacing cron job completed — 1,203 memories sent', type: 'cron', severity: 'ok' },
  { time: '08:30', text: '5 support tickets assigned to queue', type: 'support', severity: 'info' },
  { time: '07:55', text: 'DB backup completed (4.2 GB)', type: 'system', severity: 'ok' },
  { time: '07:00', text: 'Daily metrics snapshot collected', type: 'system', severity: 'ok' },
];

const SEVERITY_COLORS: Record<string, string> = {
  ok: '#4CAF50',
  warn: '#FFD28A',
  info: '#78A7FF',
  error: '#FF6E91',
};

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 20,
};

export default function DashboardPage() {
  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200 }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Dashboard</h1>
      <p style={{ margin: '0 0 28px', color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {KPI.map((k) => (
          <div key={k.label} style={{ ...card, borderLeft: `3px solid ${k.color}` }}>
            <div style={{ color: 'rgba(248,244,255,0.48)', fontSize: 12, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#F8F4FF', lineHeight: 1 }}>{k.value}</div>
            <div style={{ color: k.delta.startsWith('+') ? '#4CAF50' : k.delta.startsWith('-') && !k.label.includes('Failures') && !k.label.includes('Reports') ? '#FF6E91' : '#4CAF50', fontSize: 12, marginTop: 6 }}>
              {k.delta} vs yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent activity */}
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'rgba(248,244,255,0.72)' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT_EVENTS.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11, flexShrink: 0, paddingTop: 2 }}>{e.time}</span>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: SEVERITY_COLORS[e.severity], flexShrink: 0, marginTop: 4 }} />
                <span style={{ color: 'rgba(248,244,255,0.72)', fontSize: 13, lineHeight: 1.4 }}>{e.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System status */}
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'rgba(248,244,255,0.72)' }}>System Status</h2>
          {[
            { label: 'API Server', status: 'Operational', ok: true },
            { label: 'Database (Postgres)', status: 'Operational', ok: true },
            { label: 'Storage (Supabase)', status: 'Operational', ok: true },
            { label: 'Auth Provider', status: 'Operational', ok: true },
            { label: 'Push Notifications (Expo)', status: 'Degraded', ok: false },
            { label: 'Edge Functions', status: 'Operational', ok: true },
            { label: 'Background Jobs', status: 'Operational', ok: true },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(248,244,255,0.72)', fontSize: 13 }}>{s.label}</span>
              <span style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 20,
                background: s.ok ? 'rgba(76,175,80,0.15)' : 'rgba(255,210,138,0.15)',
                color: s.ok ? '#4CAF50' : '#FFD28A',
                border: `1px solid ${s.ok ? 'rgba(76,175,80,0.3)' : 'rgba(255,210,138,0.3)'}`,
              }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
