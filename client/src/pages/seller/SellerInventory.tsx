import { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, AlertCircle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Loading } from '../../components/Loading';

type InventoryItem = {
  id: string;
  name: string;
  totalStock: number;
  availableStock: number;
  status: string;
  category: { name: string };
};

export function SellerInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchInventory = () => {
    api<{ products: InventoryItem[] }>('/sellers/inventory')
      .then(r => setItems(r.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const adjustStock = async (product: InventoryItem, delta: number) => {
    const newTotal = Math.max(1, product.totalStock + delta);
    setUpdatingId(product.id);
    setMessage('');

    try {
      await api(`/sellers/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          totalStock: newTotal,
        }),
      });

      setMessage(`Stock for "${product.name}" updated to ${newTotal}`);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading inventory status…" />;

  const lowStockCount = items.filter(i => i.availableStock <= 1).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Inventory Management</h1>
          <p style={{ color: '#64748b' }}>Monitor equipment availability, track in-circulation units, and replenish quantities.</p>
        </div>
        <button className="button light" onClick={fetchInventory} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Refresh Stock
        </button>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {lowStockCount > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>Attention: {lowStockCount} item(s) are low in stock</strong>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: 0 }}>Replenish inventory count below to ensure listings stay active on the marketplace.</p>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Equipment Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Rented Out</th>
              <th style={{ padding: '1rem' }}>Available</th>
              <th style={{ padding: '1rem' }}>Total Stock</th>
              <th style={{ padding: '1rem' }}>Stock Health</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {!items.length ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <Boxes size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                  <p>No inventory items found.</p>
                </td>
              </tr>
            ) : (
              items.map(item => {
                const rented = Math.max(0, item.totalStock - item.availableStock);
                const percent = Math.min(100, Math.round((item.availableStock / Math.max(1, item.totalStock)) * 100));

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{item.category.name}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: rented > 0 ? '#3b82f6' : '#64748b' }}>
                      {rented} unit{rented !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: item.availableStock > 0 ? '#10b981' : '#ef4444',
                        }}
                      >
                        {item.availableStock} available
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item.totalStock}</td>
                    <td style={{ padding: '1rem', width: '180px' }}>
                      <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            background: percent > 50 ? '#10b981' : percent > 20 ? '#f59e0b' : '#ef4444',
                            height: '100%',
                          }}
                        />
                      </div>
                      <small style={{ fontSize: '0.75rem', color: '#64748b' }}>{percent}% Available</small>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          disabled={updatingId === item.id || item.totalStock <= 1}
                          onClick={() => adjustStock(item, -1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => adjustStock(item, 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
