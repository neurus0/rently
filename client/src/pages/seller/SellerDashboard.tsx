import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { Order, Product } from '../../types';
import { Loading } from '../../components/Loading';

export function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ products: Product[] }>('/sellers/products'),
      api<{ orders: Order[] }>('/sellers/orders'),
    ])
      .then(([p, o]) => {
        setProducts(p.products);
        setOrders(o.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading seller store metrics…" />;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? o.rentalAmount : 0), 0);
  const activeRentals = orders.filter(o => ['DELIVERED', 'IN_USE', 'DISPATCHED', 'READY_FOR_PICKUP'].includes(o.status)).length;
  const lowStockProducts = products.filter(p => p.availableStock === 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Store Overview</h1>
          <p style={{ color: '#64748b' }}>Monitor your gear inventory, incoming booking requests, and rental earnings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button" to="/seller/products">
            + Add New Equipment
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Rental Income</span>
            <DollarSign size={18} style={{ color: '#10b981' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{money(totalRevenue)}</p>
          <small style={{ color: '#10b981', fontWeight: 600 }}>From {orders.length} total booking(s)</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Rentals</span>
            <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{activeRentals}</p>
          <small style={{ color: '#64748b' }}>Currently with customers</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Catalog Listings</span>
            <Package size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{products.length}</p>
          <small style={{ color: '#64748b' }}>Active equipment models</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lowStockProducts.length ? 'Low Inventory Alerts' : 'Inventory Health'}</span>
            <AlertTriangle size={18} style={{ color: lowStockProducts.length ? '#f59e0b' : '#10b981' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{lowStockProducts.length}</p>
          <small style={{ color: lowStockProducts.length ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
            {lowStockProducts.length ? 'Units requiring restock' : 'All equipment is available'}
          </small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Incoming Orders</h3>
            <Link className="text-link" to="/seller/orders" style={{ fontSize: '0.85rem' }}>
              View all orders &rarr;
            </Link>
          </div>

          {!orders.length ? (
            <p style={{ color: '#64748b', padding: '1rem 0' }}>No incoming orders yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {orders.slice(0, 4).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{o.trackingCode || o.id.slice(-6)}</strong>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Renter: {o.customer?.name} ({o.items.length} items)</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{money(o.totalAmount)}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watch */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Inventory Status</h3>
            <Link className="text-link" to="/seller/inventory" style={{ fontSize: '0.85rem' }}>
              Manage stock &rarr;
            </Link>
          </div>

          {!lowStockProducts.length ? (
            <p style={{ color: '#10b981', padding: '1rem 0', fontWeight: 600 }}>✓ All gear inventory is well stocked.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {lowStockProducts.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                    <p style={{ fontSize: '0.75rem', color: '#92400e' }}>Available: {p.availableStock} of {p.totalStock}</p>
                  </div>
                  <Link to="/seller/inventory" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
