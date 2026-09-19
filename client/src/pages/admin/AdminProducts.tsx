import { useEffect, useState } from 'react';
import { Package, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { Product } from '../../types';
import { Loading } from '../../components/Loading';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    api<{ products: Product[] }>(`/admin/products?${params.toString()}`)
      .then(r => setProducts(r.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingId(product.id);
    setMessage('');
    try {
      await api(`/admin/products/${product.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setMessage(`"${product.name}" set to ${newStatus}.`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading catalog moderation…" />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Equipment Catalog Moderation</h1>
        <p style={{ color: '#64748b' }}>Audit all 50+ listings across the marketplace, verify specifications, and toggle visibility.</p>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by product name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button type="submit" className="button" style={{ padding: '0.65rem 1rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Product Title</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Vendor Store</th>
              <th style={{ padding: '1rem' }}>Price / Deposit</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Visibility</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={18} style={{ color: '#94a3b8' }} />
                      )}
                    </div>
                    <div>
                      {p.name}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{p.location} · {p.condition}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{p.category?.name}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{p.seller?.shopName}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>{money(p.pricePerDay)}/day</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Dep: {money(p.securityDeposit)}</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{p.availableStock} / {p.totalStock}</td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      background: p.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9',
                      color: p.status === 'ACTIVE' ? '#047857' : '#64748b',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {p.status || 'ACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    disabled={updatingId === p.id}
                    onClick={() => handleStatusToggle(p)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: p.status === 'ACTIVE' ? '1px solid #fecdd3' : '1px solid #a7f3d0',
                      background: p.status === 'ACTIVE' ? '#fff1f2' : '#ecfdf5',
                      color: p.status === 'ACTIVE' ? '#be123c' : '#047857',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
