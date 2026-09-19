import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { Payment } from '../../types';
import { Loading } from '../../components/Loading';

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ payments: Payment[] }>('/admin/payments')
      .then(r => setPayments(r.payments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading payment ledger…" />;

  const totalProcessed = payments.reduce((sum, p) => sum + (p.status === 'SUCCESS' ? p.amount : 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Payment Transactions Ledger</h1>
          <p style={{ color: '#64748b' }}>Complete audit trail of all customer checkout transactions and payment methods.</p>
        </div>
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Settled Total</span>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', margin: 0 }}>{money(totalProcessed)}</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Transaction ID</th>
              <th style={{ padding: '1rem' }}>Order Code</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Method</th>
              <th style={{ padding: '1rem' }}>Date & Time</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Gateway Status</th>
            </tr>
          </thead>
          <tbody>
            {!payments.length ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <CreditCard size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                  <p>No payment records found.</p>
                </td>
              </tr>
            ) : (
              payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                    {p.transactionId}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {p.order?.trackingCode || p.orderId.slice(-6)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{p.customer?.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{p.customer?.email}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{money(p.amount)}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{p.method.replace(/^Demo\s+/i, '')}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <span
                      style={{
                        background: p.status === 'SUCCESS' ? '#ecfdf5' : '#fee2e2',
                        color: p.status === 'SUCCESS' ? '#047857' : '#991b1b',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
