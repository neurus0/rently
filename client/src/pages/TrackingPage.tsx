import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Truck, CheckCircle2, Clock, Package, MapPin, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Loading } from '../components/Loading';

type TrackingData = {
  orderId: string;
  trackingCode: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerCity?: string;
  sellerShop?: string;
  sellerCity?: string;
  items: { id: string; name: string; quantity: number; startDate: string; endDate: string; image: string }[];
  events: { id: string; status: string; description: string; timestamp: string }[];
};

const milestoneSteps = [
  { key: 'BOOKING_CONFIRMED', label: 'Booking Confirmed' },
  { key: 'PAYMENT_SUCCESS', label: 'Payment Received' },
  { key: 'READY_FOR_PICKUP', label: 'Prepared by Shop' },
  { key: 'DISPATCHED', label: 'Dispatched / In Transit' },
  { key: 'DELIVERED', label: 'Delivered / Handed Over' },
  { key: 'IN_USE', label: 'Equipment In Use' },
  { key: 'RETURN_INITIATED', label: 'Return Initiated' },
  { key: 'COMPLETED', label: 'Completed & Deposit Returned' },
];

export function TrackingPage() {
  const { code } = useParams();
  const nav = useNavigate();
  const [queryCode, setQueryCode] = useState(code || '');
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState('');

  const fetchTracking = (c: string) => {
    if (!c.trim()) return;
    setLoading(true);
    setError('');
    api<TrackingData>(`/tracking/${c.trim()}`)
      .then(setData)
      .catch(err => {
        setData(null);
        setError(err.message || 'No tracking information found for this code.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (code) {
      setQueryCode(code);
      fetchTracking(code);
    }
  }, [code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCode) {
      nav(`/tracking/${encodeURIComponent(queryCode.trim())}`);
      fetchTracking(queryCode);
    }
  };

  const getStepIndex = (status: string) => {
    return milestoneSteps.findIndex(s => s.key === status);
  };

  const currentIdx = data ? getStepIndex(data.status) : -1;

  return (
    <main className="container page" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p className="eyebrow">Real-Time Milestone Tracking</p>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Track Your Rental Order</h1>
        <p className="lead">Enter your tracking code or order ID to see equipment prep and delivery milestones.</p>

        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '500px', margin: '1.5rem auto 0', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="e.g. RNT-XYZ123 or order ID"
              value={queryCode}
              onChange={e => setQueryCode(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" className="button" style={{ padding: '0.75rem 1.5rem' }}>
            Track Gear
          </button>
        </form>
      </div>

      {loading && <Loading label="Locating package milestones…" />}

      {error && (
        <div className="error" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '2rem', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Identifier</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.2rem 0 0' }}>
                {data.trackingCode || data.orderId}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Status</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1', margin: '0.2rem 0 0' }}>
                {data.status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Stepper Progress Visual */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Milestone Progress</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { label: '1. Confirmed', active: currentIdx >= 0 },
                { label: '2. Dispatched', active: currentIdx >= 3 },
                { label: '3. In Use', active: currentIdx >= 5 },
                { label: '4. Returned', active: currentIdx >= 7 },
              ].map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      background: step.active ? 'var(--color-primary)' : '#e2e8f0',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step.active ? '#0f172a' : '#94a3b8' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Events List */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Activity History</h3>
            <div style={{ display: 'grid', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0' }}>
              {data.events.map((event, i) => (
                <div key={event.id || i} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.95rem',
                      top: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: i === data.events.length - 1 ? 'var(--color-primary)' : '#94a3b8',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 2px #e2e8f0',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{event.status.replace(/_/g, ' ')}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#475569' }}>{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Fulfillment Partner */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Package Items</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={18} style={{ color: '#64748b' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                        Qty: {item.quantity} · {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Partner Shop: <strong>{data.sellerShop || 'Verified Partner'}</strong> ({data.sellerCity})</span>
              <span>Delivery Hub: <strong>{data.customerCity || 'Local Hub'}</strong></span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
