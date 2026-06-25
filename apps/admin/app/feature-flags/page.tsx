'use client';
import React, { useState } from 'react';

const INITIAL_FLAGS = [
  { id: 'ff1', key: 'sparks_v2_engine', name: 'Sparks V2 Engine', description: 'Enable the new ML-based spark recommendation engine', enabled: true, rollout: 100, environment: 'production', updatedAt: '2024-11-10' },
  { id: 'ff2', key: 'calendar_sync', name: 'Calendar Sync', description: 'Allow users to sync with Apple Calendar and Google Calendar', enabled: true, rollout: 50, environment: 'production', updatedAt: '2024-11-08' },
  { id: 'ff3', key: 'messages_tab', name: 'Messages Tab', description: 'Show the messages tab in the main navigation', enabled: true, rollout: 100, environment: 'production', updatedAt: '2024-11-01' },
  { id: 'ff4', key: 'ai_captions', name: 'AI Caption Suggestions', description: 'Auto-suggest captions for moments using on-device ML', enabled: false, rollout: 0, environment: 'staging', updatedAt: '2024-10-28' },
  { id: 'ff5', key: 'clique_reactions', name: 'Clique Reactions', description: 'Emoji reactions on moments within cliques', enabled: true, rollout: 75, environment: 'production', updatedAt: '2024-10-20' },
  { id: 'ff6', key: 'pro_tier', name: 'Pro Tier Paywall', description: 'Show Pro subscription upsell for advanced features', enabled: false, rollout: 0, environment: 'staging', updatedAt: '2024-10-15' },
  { id: 'ff7', key: 'offline_mode', name: 'Offline Mode', description: 'Cache moments and sparks for offline viewing', enabled: true, rollout: 30, environment: 'production', updatedAt: '2024-11-12' },
  { id: 'ff8', key: 'dark_mode_only', name: 'Force Dark Mode', description: 'Disable light mode option in app settings', enabled: true, rollout: 100, environment: 'production', updatedAt: '2024-09-01' },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  const toggle = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Feature Flags</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>{flags.filter(f => f.enabled).length} of {flags.length} flags enabled</p>
        </div>
        <button style={{ background: '#B57CFF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, padding: '9px 18px', cursor: 'pointer', fontWeight: 600 }}>+ New Flag</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {flags.map(flag => (
          <div key={flag.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${flag.enabled ? 'rgba(181,124,255,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Toggle */}
            <div
              onClick={() => toggle(flag.id)}
              style={{ width: 40, height: 22, borderRadius: 11, background: flag.enabled ? '#B57CFF' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
            >
              <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: 8, background: '#fff', top: 3, left: flag.enabled ? 20 : 4, transition: 'left 0.2s' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <span style={{ color: '#F8F4FF', fontWeight: 600, fontSize: 14 }}>{flag.name}</span>
                <span style={{ color: 'rgba(248,244,255,0.36)', fontFamily: 'monospace', fontSize: 11 }}>{flag.key}</span>
                <span style={{ background: flag.environment === 'production' ? 'rgba(76,175,80,0.12)' : 'rgba(255,210,138,0.12)', color: flag.environment === 'production' ? '#4CAF50' : '#FFD28A', padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{flag.environment}</span>
              </div>
              <div style={{ color: 'rgba(248,244,255,0.48)', fontSize: 12 }}>{flag.description}</div>
            </div>

            {/* Rollout */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: flag.enabled ? '#B57CFF' : 'rgba(248,244,255,0.36)', fontWeight: 700, fontSize: 16 }}>{flag.rollout}%</div>
              <div style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11, marginTop: 2 }}>rollout</div>
            </div>

            {/* Updated */}
            <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
              <div style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11 }}>Updated</div>
              <div style={{ color: 'rgba(248,244,255,0.48)', fontSize: 12 }}>{flag.updatedAt}</div>
            </div>

            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, color: 'rgba(248,244,255,0.48)', fontSize: 11, padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
