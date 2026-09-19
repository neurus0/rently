import { useEffect, useState, FormEvent } from 'react';
import { Megaphone, Send, Users, Plus, CheckCircle, Mail, MessageSquare, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Campaign } from '../../types';
import { Loading } from '../../components/Loading';

type Segment = {
  id: string;
  name: string;
  count: number;
  description: string;
};

export function MarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    channel: 'EMAIL',
    segment: 'opted_in',
    template: 'Hi {name}, rent equipment this weekend with 15% off using code RENTLY15!',
  });

  const fetchData = () => {
    Promise.all([
      api<{ campaigns: Campaign[] }>('/marketing/campaigns'),
      api<{ segments: Segment[] }>('/marketing/segments'),
    ])
      .then(([c, s]) => {
        setCampaigns(c.campaigns);
        setSegments(s.segments);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api('/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('New marketing campaign drafted.');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    }
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    setMessage('');
    try {
      const res = await api<{ message: string }>(`/marketing/campaigns/${id}/send`, {
        method: 'POST',
      });
      setMessage(res.message);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to send campaign');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <Loading label="Loading marketing console…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Marketing & Engagement Campaigns</h1>
          <p style={{ color: '#64748b' }}>Design personalized promotional email & SMS campaigns targeted to user lifecycle segments.</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Audience Segments Cards */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Audience Segments</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {segments.map(seg => (
          <div key={seg.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{seg.name}</span>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{seg.count}</p>
            <small style={{ color: '#64748b', fontSize: '0.8rem' }}>{seg.description}</small>
          </div>
        ))}
      </div>

      {/* Campaigns History */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Dispatched & Draft Campaigns</h2>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Campaign Name</th>
              <th style={{ padding: '1rem' }}>Channel</th>
              <th style={{ padding: '1rem' }}>Target Segment</th>
              <th style={{ padding: '1rem' }}>Template Preview</th>
              <th style={{ padding: '1rem' }}>Dispatched</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {!campaigns.length ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <Megaphone size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                  <p>No marketing campaigns created yet. Click "Create Campaign" to begin.</p>
                </td>
              </tr>
            ) : (
              campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      {c.channel === 'EMAIL' ? <Mail size={15} style={{ color: '#0284c7' }} /> : <MessageSquare size={15} style={{ color: '#16a34a' }} />}
                      {c.channel}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{c.segment.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '1rem', color: '#64748b', maxWidth: '300px' }}>
                    <span style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {c.template}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{c.sentCount} recipients</td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        background: c.status === 'SENT' ? '#ecfdf5' : '#fffbeb',
                        color: c.status === 'SENT' ? '#047857' : '#b45309',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {c.status === 'DRAFT' ? (
                      <button
                        type="button"
                        disabled={sendingId === c.id}
                        onClick={() => handleSend(c.id)}
                        className="button"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {sendingId === c.id ? <><Loader2 className="spin" size={14} /> Dispatching…</> : <><Send size={14} /> Send Now</>}
                      </button>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={15} /> Sent
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Create Marketing Campaign</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Monsoon Tool Rental Discount"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Channel *</label>
                    <select
                      value={form.channel}
                      onChange={e => setForm({ ...form, channel: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="EMAIL">Email Newsletter</option>
                      <option value="SMS">SMS Notification</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Audience Segment *</label>
                    <select
                      value={form.segment}
                      onChange={e => setForm({ ...form, segment: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="all">All Users</option>
                      <option value="opted_in">Marketing Opt-ins</option>
                      <option value="active_customers">Active Renters</option>
                      <option value="sellers">Seller Partners</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Message Template</label>
                  <textarea
                    rows={4}
                    required
                    value={form.template}
                    onChange={e => setForm({ ...form, template: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="button light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="button">Draft Campaign</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
