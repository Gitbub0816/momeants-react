import React from 'react';
import Link from 'next/link';

const MOCK_TICKET = {
  id: 't1',
  subject: "Can't upload photos on iOS 17",
  user: 'Jordan Ellis',
  email: 'jordan@example.com',
  userId: 'u1',
  category: 'bug',
  priority: 'high',
  status: 'open',
  created: '2024-11-15 09:10',
  platform: 'iOS 17.1',
  appVersion: '1.0.0 (1)',
  thread: [
    { from: 'user', name: 'Jordan Ellis', time: '09:10', text: "Hi, I'm trying to upload photos to my moments but the app freezes every time I tap the camera icon. I've restarted the app multiple times. iPhone 14 Pro, iOS 17.1." },
    { from: 'agent', name: 'Support Agent', time: '09:45', text: "Hi Jordan! Thanks for reaching out. I'm sorry to hear about this issue. Could you try force-closing the app, clearing the cache in Settings > Momeants > Storage, then reopening? Let me know if that helps!" },
    { from: 'user', name: 'Jordan Ellis', time: '10:02', text: "I tried that and it still freezes. The spinner just keeps going and nothing uploads." },
  ],
};

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 16 };

const CANNED = [
  'Thank you for contacting Momeants support!',
  "We've escalated this to our engineering team.",
  'Could you send a screenshot of the issue?',
  'This has been resolved in the latest app update.',
  'Your request has been forwarded to our privacy team.',
];

export default function SupportTicketPage() {
  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      <Link href="/support" style={{ color: 'rgba(248,244,255,0.48)', textDecoration: 'none', fontSize: 13 }}>← Support</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0 24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#F8F4FF' }}>{MOCK_TICKET.subject}</h1>
          <p style={{ margin: 0, color: 'rgba(248,244,255,0.48)', fontSize: 13 }}>
            {MOCK_TICKET.user} · {MOCK_TICKET.email} · Created {MOCK_TICKET.created}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: 'rgba(120,167,255,0.15)', color: '#78A7FF', border: '1px solid rgba(120,167,255,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Open</span>
          <span style={{ background: 'rgba(255,110,145,0.12)', color: '#FF6E91', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>High Priority</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div>
          {/* Thread */}
          <div style={card}>
            <h2 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Conversation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {MOCK_TICKET.thread.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: msg.from === 'user' ? 'rgba(181,124,255,0.3)' : 'rgba(120,167,255,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: msg.from === 'user' ? '#B57CFF' : '#78A7FF' }}>
                    {msg.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ color: '#F8F4FF', fontWeight: 600, fontSize: 13 }}>{msg.name}</span>
                      <span style={{ color: 'rgba(248,244,255,0.36)', fontSize: 11 }}>{msg.time}</span>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(248,244,255,0.72)', fontSize: 13, lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Canned replies */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(248,244,255,0.36)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Canned Replies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CANNED.map((c) => (
                  <button key={c} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, color: 'rgba(248,244,255,0.60)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>

            <textarea placeholder="Type a reply…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: 12, resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: '#B57CFF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Send Reply</button>
              <button style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8, color: '#4CAF50', fontSize: 12, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>Mark Resolved</button>
            </div>
          </div>

          {/* Internal Notes */}
          <div style={card}>
            <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Internal Notes</h2>
            <textarea placeholder="Add an internal note (not visible to user)…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 13, padding: 12, resize: 'vertical', minHeight: 60, outline: 'none', boxSizing: 'border-box' }} />
            <button style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#F8F4FF', fontSize: 12, padding: '7px 16px', cursor: 'pointer' }}>Save Note</button>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={card}>
            <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ticket Info</h2>
            {[
              ['Category', 'Bug'],
              ['Priority', 'High'],
              ['Platform', MOCK_TICKET.platform],
              ['App Version', MOCK_TICKET.appVersion],
              ['User ID', MOCK_TICKET.userId],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                <span style={{ color: 'rgba(248,244,255,0.48)' }}>{k}</span>
                <span style={{ color: '#F8F4FF' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: 'rgba(248,244,255,0.48)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'View User Profile', color: '#B57CFF', href: `/users/${MOCK_TICKET.userId}` },
                { label: 'Assign to Me', color: '#78A7FF' },
                { label: 'Escalate to Engineering', color: '#FFD28A' },
                { label: 'Close Ticket', color: '#FF6E91' },
              ].map((a) => (
                <button key={a.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: a.color, fontSize: 12, padding: '8px 14px', cursor: 'pointer', textAlign: 'left' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
