import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Calendar, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
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

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchOrders = () => {
    const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
    api<{ orders: Order[] }>(url)
      .then(r => setOrders(r.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    setMessage('');
    try {
      await api(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: `Status updated by Admin to ${status}` }),
      });
      setMessage(`Order #${orderId.slice(-6)} set to ${status}.`);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading marketplace orders…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Marketplace Bookings Audit</h1>
          <p style={{ color: '#64748b' }}>Supervise all customer orders, delivery milestones, commission collection, and cancellations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Order / Tracking</th>
              <th style={{ padding: '1rem' }}>Renter</th>
              <th style={{ padding: '1rem' }}>Vendor Store</th>
              <th style={{ padding: '1rem' }}>Items</th>
              <th style={{ padding: '1rem' }}>Total / Commission</th>
              <th style={{ padding: '1rem' }}>Current Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Admin Override</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{o.trackingCode || o.id.slice(-6)}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{o.customer?.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{o.customer?.email}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{o.seller?.shopName}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{o.seller?.city}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>{o.items.length} item(s)</span>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{o.items.map(i => i.name).join(', ').slice(0, 30)}…</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>{money(o.totalAmount)}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>
                    Fee: {money(o.commissionAmount)}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <select
                    disabled={updatingId === o.id}
                    value={o.status}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
