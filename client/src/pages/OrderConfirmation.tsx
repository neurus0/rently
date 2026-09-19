import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { api, money } from '../lib/api';
import type { Order } from '../types';

export function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderIdsParam = searchParams.get('orderIds');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderIdsParam) {
      setLoading(false);
      return;
    }
    const ids = orderIdsParam.split(',').filter(Boolean);
    Promise.all(ids.map(id => api<{ order: Order }>(`/orders/${id}`).catch(() => null)))
      .then(results => {
        const valid = results.map(r => r?.order).filter(Boolean) as Order[];
        setOrders(valid);
      })
      .finally(() => setLoading(false));
  }, [orderIdsParam]);

  const totalPaid = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="lead">Loading your order confirmation…</p>
      </main>
    );
  }

  return (
    <main className="container page" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', background: '#ecfdf5', padding: '1rem', borderRadius: '50%', color: '#10b981', marginBottom: '1rem' }}>
          <CheckCircle size={48} />
        </div>
        <p className="eyebrow" style={{ color: '#10b981' }}>Booking Confirmed</p>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Thank You for Renting with Rently!</h1>
        <p className="lead" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Your rental booking has been dispatched to the vendor partners. You can track equipment fulfillment milestones in real time.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={22} style={{ color: 'var(--color-primary)' }} /> Order Summary ({orders.length} Package{orders.length > 1 ? 's' : ''})
        </h2>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Tracking Code</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>{order.trackingCode}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Fulfillment Partner</span>
                  <p style={{ fontWeight: 600 }}>{order.seller?.shopName} ({order.seller?.city})</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name} × {item.quantity}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} /> {new Date(item.startDate).toLocaleDateString()} &rarr; {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600 }}>{money(item.pricePerDay * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Subtotal + Deposit</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{money(order.totalAmount)}</span>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  className="button"
                  to={`/tracking/${order.trackingCode}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Truck size={16} /> Track Package Milestones
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Amount Paid</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{money(totalPaid)}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link className="button light" to="/orders">
              View All Orders
            </Link>
            <Link className="button" to="/products">
              Continue Browsing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <ShieldCheck size={28} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Deposit Protection</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Security deposit is kept safely in escrow and refunded after return inspection.</p>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <MapPin size={28} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Direct Handover</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Coordinate pickup directly or get doorstep delivery from our verified partners.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
