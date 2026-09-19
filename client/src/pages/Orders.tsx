import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { api, money } from '../lib/api';
import type { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';

const statusColor: Record<string, { bg: string; text: string }> = {
  BOOKING_CONFIRMED: { bg: '#e0f2fe', text: '#0369a1' },
  PAYMENT_SUCCESS: { bg: '#ecfdf5', text: '#047857' },
  READY_FOR_PICKUP: { bg: '#fef3c7', text: '#b45309' },
  DISPATCHED: { bg: '#f3e8ff', text: '#6b21a8' },
  DELIVERED: { bg: '#dcfce7', text: '#15803d' },
  IN_USE: { bg: '#e0e7ff', text: '#3730a3' },
  RETURN_INITIATED: { bg: '#ffedd5', text: '#c2410c' },
  RETURNED: { bg: '#f1f5f9', text: '#475569' },
  COMPLETED: { bg: '#f0fdf4', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
};

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ orders: Order[] }>('/orders')
      .then(r => setOrders(r.orders))
      .catch(err => setError(err.message || 'Failed to load order history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading your rental history…" />;

  return (
    <main className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow">Customer Portal</p>
          <h1>My Rental Orders</h1>
          <p className="lead">Track your ongoing rentals, view invoices, and manage equipment returns.</p>
        </div>
        <Link className="button" to="/products">
          Rent More Gear <ArrowRight size={16} />
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {!orders.length ? (
        <div className="empty" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Package size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Rental Orders Found</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't rented any equipment yet.</p>
          <Link className="button" to="/products">Explore Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => {
            const sc = statusColor[order.status] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <strong style={{ fontSize: '1.15rem' }}>Code: {order.trackingCode || order.id.slice(-8)}</strong>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Paid</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{money(order.totalAmount)}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={22} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name} × {item.quantity}</p>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <Calendar size={13} /> {new Date(item.startDate).toLocaleDateString()} &rarr; {new Date(item.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 600 }}>{money(item.pricePerDay * item.quantity)}</p>
                        <small style={{ color: '#64748b' }}>Deposit: {money(item.securityDeposit * item.quantity)}</small>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Vendor: <strong>{order.seller?.shopName || 'Partner'}</strong> ({order.seller?.city || 'Local'})
                  </span>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {order.paymentStatus !== 'SUCCESS' && (
                      <Link className="button" to={`/payment?orderIds=${order.id}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Pay Now
                      </Link>
                    )}
                    <Link
                      className="button light"
                      to={`/tracking/${order.trackingCode || order.id}`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      <Truck size={15} /> Track Milestones
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
