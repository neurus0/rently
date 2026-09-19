import { useEffect, useState } from 'react';
import { Store, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Loading } from '../../components/Loading';

type AdminSeller = {
  id: string;
  shopName: string;
  description?: string;
  address?: string;
  city: string;
  state?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  user: { name: string; email: string; phone?: string };
  _count: { products: number; orders: number };
};

export function AdminSellers() {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchSellers = () => {
    api<{ sellers: AdminSeller[] }>('/admin/sellers')
      .then(r => setSellers(r.sellers))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleStatusChange = async (sellerId: string, status: string) => {
    setUpdatingId(sellerId);
    setMessage('');
    try {
      await api(`/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Seller status updated to ${status}.`);
      fetchSellers();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading seller partners…" />;

  const pendingCount = sellers.filter(s => s.status === 'PENDING').length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Seller & Partner Approvals</h1>
        <p style={{ color: '#64748b' }}>Approve vendor store applications, verify contact locations, and manage partner status.</p>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ShieldCheck size={22} style={{ color: '#2563eb', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>{pendingCount} Vendor Application(s) Awaiting Verification</strong>
            <p style={{ color: '#1d4ed8', fontSize: '0.85rem', margin: 0 }}>Review business details below and approve or reject their marketplace storefront.</p>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Shop Details</th>
              <th style={{ padding: '1rem' }}>Owner & Contact</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Products / Orders</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>{s.shopName}</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', maxWidth: '280px' }}>
                    {s.description || 'No description provided'}
                  </p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{s.user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{s.user.email}</p>
                  {s.user.phone && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{s.user.phone}</p>}
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>
                  {s.city}{s.state ? `, ${s.state}` : ''}
                  {s.address && <span style={{ display: 'block', fontSize: '0.75rem' }}>{s.address}</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>{s._count.products} products</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{s._count.orders} order(s)</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      background: s.status === 'APPROVED' ? '#ecfdf5' : s.status === 'PENDING' ? '#fffbeb' : '#fee2e2',
                      color: s.status === 'APPROVED' ? '#047857' : s.status === 'PENDING' ? '#b45309' : '#991b1b',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {s.status !== 'APPROVED' && (
                      <button
                        type="button"
                        disabled={updatingId === s.id}
                        onClick={() => handleStatusChange(s.id, 'APPROVED')}
                        style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {s.status !== 'SUSPENDED' && s.status !== 'REJECTED' && (
                      <button
                        type="button"
                        disabled={updatingId === s.id}
                        onClick={() => handleStatusChange(s.id, 'SUSPENDED')}
                        style={{
                          background: '#fff1f2',
                          color: '#be123c',
                          border: '1px solid #fecdd3',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Suspend
                      </button>
                    )}
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
