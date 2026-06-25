import React from 'react';

const SERVICES = [
  { name: 'API Server', status: 'operational', uptime: '99.97%', latency: '42ms', ok: true },
  { name: 'Database (Postgres)', status: 'operational', uptime: '99.99%', latency: '8ms', ok: true },
  { name: 'Storage (Supabase)', status: 'operational', uptime: '99.95%', latency: '120ms', ok: true },
  { name: 'Auth Provider', status: 'operational', uptime: '100%', latency: '34ms', ok: true },
  { name: 'Push Notifications (Expo)', status: 'degraded', uptime: '98.21%', latency: '890ms', ok: false },
  { name: 'Edge Functions', status: 'operational', uptime: '99.94%', latency: '65ms', ok: true },
  { name: 'Background Jobs (pg_cron)', status: 'operational', uptime: '99.99%', latency: '—', ok: true },
  { name: 'CDN / Image Storage', status: 'operational', uptime: '99.99%', latency: '55ms', ok: true },
];

const JOBS = [
  { name: 'Spark Engine Delivery', schedule: 'Every 4 hours', lastRun: '2024-11-15 08:44', duration: '1.2s', status: 'success' },
  { name: 'Memory Resurfacing', schedule: 'Daily 08:30', lastRun: '2024-11-15 08:30', duration: '4.8s', status: 'success' },
  { name: 'Daily Metrics Snapshot', schedule: 'Daily 07:00', lastRun: '2024-11-15 07:00', duration: '0.9s', status: 'success' },
  { name: 'DB Backup', schedule: 'Daily 07:55', lastRun: '2024-11-15 07:55', duration: '3m 12s', status: 'success' },
  { name: 'Inactive User Sweep', schedule: 'Weekly Sun 02:00', lastRun: '2024-11-10 02:00', duration: '8.3s', status: 'success' },
  { name: 'Push Failure Retry', schedule: 'Every 30 min', lastRun: '2024-11-15 09:00', duration: '0.4s', status: 'warning' },
];

const ERRORS = [
  { time: '09:12', level: 'ERROR', service: 'push', message: 'Expo push token invalid for user u7 — 400 DeviceNotRegistered' },
  { time: '08:50', level: 'WARN', service: 'spark-engine', message: 'Slow delivery batch: 1,203 sparks took 1.2s (threshold 1s)' },
  { time: '07:55', level: 'ERROR', service: 'push', message: 'Rate limit hit — 279 notifications delayed to next retry window' },
  { time: '07:00', level: 'INFO', service: 'metrics', message: 'Daily snapshot collected — 10,284 users, 47.2 GB storage' },
];

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 };

export default function SystemPage() {
  const degraded = SERVICES.filter(s => !s.ok).length;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>System Health</h1>
        <p style={{ margin: 0, color: degraded > 0 ? '#FFD28A' : '#4CAF50', fontSize: 13, fontWeight: 600 }}>
          {degraded > 0 ? `${degraded} service degraded` : 'All systems operational'}
        </p>
      </div>

      {/* Services */}
      <div style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Services</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Service', 'Status', 'Uptime (30d)', 'Latency'].map(h => (
                <th key={h} style={{ padding: '8px 0', textAlign: 'left', color: 'rgba(248,244,255,0.36)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s, i) => (
              <tr key={s.name} style={{ borderBottom: i < SERVICES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '10px 0', color: '#F8F4FF', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{ background: s.ok ? 'rgba(76,175,80,0.15)' : 'rgba(255,210,138,0.15)', color: s.ok ? '#4CAF50' : '#FFD28A', border: `1px solid ${s.ok ? 'rgba(76,175,80,0.3)' : 'rgba(255,210,138,0.3)'}`, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.status}</span>
                </td>
                <td style={{ padding: '10px 0', color: 'rgba(248,244,255,0.72)' }}>{s.uptime}</td>
                <td style={{ padding: '10px 0', color: s.ok ? 'rgba(248,244,255,0.72)' : '#FFD28A', fontFamily: 'monospace', fontSize: 12 }}>{s.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Background Jobs */}
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Background Jobs</h2>
          {JOBS.map((j, i) => (
            <div key={j.name} style={{ padding: '10px 0', borderBottom: i < JOBS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ color: '#F8F4FF', fontWeight: 500, fontSize: 13 }}>{j.name}</span>
                <span style={{ background: j.status === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(255,210,138,0.15)', color: j.status === 'success' ? '#4CAF50' : '#FFD28A', padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{j.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(248,244,255,0.40)' }}>
                <span>{j.schedule}</span>
                <span>Last: {j.lastRun}</span>
                <span>{j.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Error Log */}
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Errors</h2>
          {ERRORS.map((e, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < ERRORS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11 }}>{e.time}</span>
                <span style={{ background: e.level === 'ERROR' ? 'rgba(255,110,145,0.15)' : e.level === 'WARN' ? 'rgba(255,210,138,0.15)' : 'rgba(120,167,255,0.15)', color: e.level === 'ERROR' ? '#FF6E91' : e.level === 'WARN' ? '#FFD28A' : '#78A7FF', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{e.level}</span>
                <span style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11, fontFamily: 'monospace' }}>{e.service}</span>
              </div>
              <div style={{ color: 'rgba(248,244,255,0.60)', fontSize: 12, lineHeight: 1.4 }}>{e.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
