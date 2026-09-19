import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Calendar, CheckCircle2, User, Phone, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { Order } from '../../types';
import { Loading } from '../../components/Loading';

const statuses = [
  'BOOKING_CONFIRMED',
  'PAYMENT_SUCCESS',
  'READY_FOR_PICKUP',
  'DISPATCHED',
  'DELIVERED',
  'IN_USE',
  'RETURN_INITIATED',
  'RETURNED',
  'COMPLETED',
  'CANCELLED',
];

export function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const fetchOrders = () => {
    api<{ orders: Order[] }>('/sellers/orders')
      .then(r => {
        setOrders(r.orders);
        const map: Record<string, string> = {};
        r.orders.forEach(o => {
          map[o.id] = o.status;
        });
        setSelectedStatus(map);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string) => {
    setUpdatingId(orderId);
    setMessage('');
    const status = selectedStatus[orderId];

    try {
      await api(`/sellers/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          description: customNote || `Order status updated to ${status.replace(/_/g, ' ').toLowerCase()}`,
        }),
      });

      setMessage(`Order #${orderId.slice(-6)} updated to ${status.replace(/_/g, ' ')}`);
      setCustomNote('');
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading orders…" />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Orders & Fulfillment</h1>
        <p style={{ color: '#64748b' }}>Track incoming booking reservations and advance equipment fulfillment milestones.</p>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {!orders.length ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Orders Yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>When customers book your gear, reservations will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Tracking: {order.trackingCode || order.id.slice(-6)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Order #{order.id.slice(-8)}</h3>
                    <span style={{ background: order.paymentStatus === 'SUCCESS' ? '#ecfdf5' : '#fffbeb', color: order.paymentStatus === 'SUCCESS' ? '#047857' : '#b45309', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Renter Earnings</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{money(order.rentalAmount)}</p>
                  <small style={{ color: '#64748b' }}>Deposit held: {money(order.securityDeposit)}</small>
                </div>
              </div>

              {/* Customer & Items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Items */}
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Booked Items</h4>
                  {order.items.map(i => (
                    <div key={i.id} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{i.name} × {i.quantity}</strong>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <Calendar size={13} /> {new Date(i.startDate).toLocaleDateString()} &rarr; {new Date(i.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ fontWeight: 600 }}>{money(i.pricePerDay * i.quantity)}/day</span>
                    </div>
                  ))}
                </div>

                {/* Customer Contact */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Renter Details</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={15} style={{ color: 'var(--color-primary)' }} /> {order.customer?.name}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{order.customer?.email}</p>
                  {order.customer?.phone && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Phone size={14} /> {order.customer.phone}
                    </p>
                  )}
                  {order.customer?.city && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <MapPin size={14} /> {order.customer.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Stepper Controls */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', background: '#fcfcfd', margin: '-1.75rem -1.75rem -1.75rem', padding: '1.25rem 1.75rem', borderRadius: '0 0 16px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                    Update Status:
                  </label>
                  <select
                    value={selectedStatus[order.id] || order.status}
                    onChange={e => setSelectedStatus({ ...selectedStatus, [order.id]: e.target.value })}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Milestone note (e.g. Courier tracking # / Item inspected)"
                    value={customNote}
                    onChange={e => setCustomNote(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="button"
                  disabled={updatingId === order.id}
                  onClick={() => handleStatusUpdate(order.id)}
                  className="button"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {updatingId === order.id ? <><Loader2 className="spin" size={16} /> Updating…</> : 'Save Milestone'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
