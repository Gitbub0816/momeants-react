import React from 'react';

const SPARKS = [
  { id: 's1', title: 'This or That: Road Trip Edition', category: 'conversation', gameType: 'this_or_that', completionRate: 72, starts: 1204, enabled: true },
  { id: 's2', title: 'Would You Rather: Family Memories', category: 'family', gameType: 'would_you_rather', completionRate: 68, starts: 891, enabled: true },
  { id: 's3', title: 'Golden Hour Photo Challenge', category: 'photo', gameType: 'photo_challenge', completionRate: 45, starts: 543, enabled: true },
  { id: 's4', title: 'Describe Each Other in 3 Words', category: 'relationship', gameType: 'finish_the_sentence', completionRate: 81, starts: 2103, enabled: true },
  { id: 's5', title: 'Family Story: Funniest Holiday', category: 'family', gameType: 'story_game', completionRate: 63, starts: 712, enabled: true },
  { id: 's6', title: 'Rapid Fire: Couple Edition', category: 'couple', gameType: 'rapid_fire', completionRate: 89, starts: 1567, enabled: true },
  { id: 's7', title: 'Holiday Traditions Quiz', category: 'holiday', gameType: 'seasonal', completionRate: 55, starts: 334, enabled: false },
  { id: 's8', title: 'First Memory We Made Together', category: 'memory', gameType: 'memory_game', completionRate: 77, starts: 945, enabled: true },
  { id: 's9', title: 'Caption Battle: Childhood Photos', category: 'creative', gameType: 'photo_challenge', completionRate: 38, starts: 201, enabled: true },
  { id: 's10', title: 'Deep Question: What Are You Proud Of?', category: 'conversation', gameType: 'deep_question', completionRate: 71, starts: 682, enabled: true },
];

const CAT_COLORS: Record<string, string> = {
  conversation: '#78A7FF',
  family: '#FFB38A',
  photo: '#FF7AC8',
  relationship: '#B57CFF',
  couple: '#FF6E91',
  holiday: '#FFD28A',
  memory: '#B57CFF',
  creative: '#78A7FF',
};

export default function SparksPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Sparks Library</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>{SPARKS.length} sparks · {SPARKS.filter(s => s.enabled).length} active</p>
        </div>
        <button style={{ background: '#B57CFF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, padding: '9px 18px', cursor: 'pointer', fontWeight: 600 }}>+ New Spark</button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Title', 'Category', 'Game Type', 'Starts', 'Completion', 'Enabled'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPARKS.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < SPARKS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#F8F4FF', fontWeight: 500 }}>{s.title}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: `${CAT_COLORS[s.category] ?? '#B57CFF'}22`, color: CAT_COLORS[s.category] ?? '#B57CFF', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{s.category}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.60)', fontFamily: 'monospace', fontSize: 12 }}>{s.gameType}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{s.starts.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${s.completionRate}%`, height: '100%', background: s.completionRate > 60 ? '#4CAF50' : '#FFD28A', borderRadius: 2 }} />
                    </div>
                    <span style={{ color: s.completionRate > 60 ? '#4CAF50' : '#FFD28A', fontSize: 12, fontWeight: 600 }}>{s.completionRate}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: s.enabled ? '#B57CFF' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: 7, background: '#fff', top: 3, left: s.enabled ? 18 : 4, transition: 'left 0.2s' }} />
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
