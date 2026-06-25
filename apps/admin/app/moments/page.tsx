import React from 'react';

const MOMENTS = [
  { id: 'm1', title: 'Sunset at the beach', author: 'Jordan Ellis', authorId: 'u1', date: '2024-11-15', visibility: 'clique', reactions: 12, reported: false },
  { id: 'm2', title: 'Birthday dinner', author: 'Ava Chen', authorId: 'u2', date: '2024-11-14', visibility: 'private', reactions: 8, reported: false },
  { id: 'm3', title: 'First day at new job', author: 'Alex Rivera', authorId: 'u5', date: '2024-11-14', visibility: 'clique', reactions: 24, reported: false },
  { id: 'm4', title: 'Morning hike', author: 'Taylor Park', authorId: 'u10', date: '2024-11-13', visibility: 'clique', reactions: 6, reported: false },
  { id: 'm5', title: 'Graduation photo', author: 'Noah Kim', authorId: 'u3', date: '2024-11-12', visibility: 'clique', reactions: 31, reported: false },
  { id: 'm6', title: 'Family BBQ', author: 'Mia Torres', authorId: 'u4', date: '2024-11-12', visibility: 'clique', reactions: 18, reported: false },
  { id: 'm7', title: 'Suspicious content', author: 'Morgan K.', authorId: 'u7', date: '2024-11-09', visibility: 'clique', reactions: 0, reported: true },
  { id: 'm8', title: 'Road trip selfie', author: 'Sam Ellis', authorId: 'u6', date: '2024-11-08', visibility: 'private', reactions: 4, reported: false },
  { id: 'm9', title: 'Concert night', author: 'Casey Walsh', authorId: 'u8', date: '2024-09-01', visibility: 'clique', reactions: 9, reported: false },
  { id: 'm10', title: 'Dog at the park', author: 'Remy Davis', authorId: 'u9', date: '2024-10-30', visibility: 'private', reactions: 2, reported: false },
];

const VIS_STYLE: Record<string, React.CSSProperties> = {
  clique: { background: 'rgba(181,124,255,0.15)', color: '#B57CFF', border: '1px solid rgba(181,124,255,0.3)' },
  private: { background: 'rgba(255,255,255,0.05)', color: 'rgba(248,244,255,0.48)', border: '1px solid rgba(255,255,255,0.10)' },
  public: { background: 'rgba(120,167,255,0.15)', color: '#78A7FF', border: '1px solid rgba(120,167,255,0.3)' },
};

export default function MomentsPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#F8F4FF' }}>Moments</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>891 moments created today · 1 flagged</p>
        </div>
        <input placeholder="Search moments…" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: '8px 14px', outline: 'none', width: 240 }} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['Title', 'Author', 'Date', 'Visibility', 'Reactions', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(248,244,255,0.48)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOMENTS.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: i < MOMENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: m.reported ? 'rgba(255,110,145,0.04)' : 'transparent' }}>
                <td style={{ padding: '12px 16px', color: '#F8F4FF', fontWeight: 500 }}>{m.title}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{m.author}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.48)' }}>{m.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...(VIS_STYLE[m.visibility] ?? VIS_STYLE.private), padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.visibility}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(248,244,255,0.72)' }}>{m.reactions}</td>
                <td style={{ padding: '12px 16px' }}>
                  {m.reported
                    ? <span style={{ background: 'rgba(255,110,145,0.15)', color: '#FF6E91', border: '1px solid rgba(255,110,145,0.3)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Reported</span>
                    : <span style={{ color: 'rgba(248,244,255,0.24)', fontSize: 11 }}>—</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#B57CFF', cursor: 'pointer', fontSize: 12 }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
