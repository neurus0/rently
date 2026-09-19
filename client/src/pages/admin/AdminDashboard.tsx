import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, DollarSign, TrendingUp, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { api, money } from '../../lib/api';
import { Loading } from '../../components/Loading';
import type { AnalyticsOverview } from '../../types';

type DashboardData = {
  metrics: {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    totalRentalVolume: number;
  };
  recentUsers: { id: string; name: string; email: string; role: string; city: string; createdAt: string }[];
  recentOrders: { id: string; trackingCode: string; totalAmount: number; status: string; customer: { name: string }; seller: { shopName: string } }[];
  categoryDistribution: { id: string; name: string; productCount: number }[];
  websiteAnalytics: AnalyticsOverview['websiteAnalytics'];
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<Omit<DashboardData, 'websiteAnalytics'>>('/admin/dashboard'),
      api<AnalyticsOverview>('/analytics/overview'),
    ])
      .then(([dashboard, analytics]) => setData({ ...dashboard, websiteAnalytics: analytics.websiteAnalytics }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading marketplace control metrics…" />;
  if (!data) return <p className="error">Failed to load admin overview.</p>;

  const { metrics } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Platform Master Overview</h1>
          <p style={{ color: '#64748b' }}>Real-time health, order volume, commission earnings, and vendor approvals.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button" to="/admin/analytics">
            View Deep Analytics &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gross GMV Volume</span>
            <DollarSign size={18} style={{ color: '#10b981' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{money(metrics.totalRevenue)}</p>
          <small style={{ color: '#10b981', fontWeight: 600 }}>All platform transactions</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rently Commission</span>
            <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{money(metrics.totalCommission)}</p>
          <small style={{ color: '#8b5cf6', fontWeight: 600 }}>10% Platform fee earned</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Bookings</span>
            <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{metrics.totalOrders}</p>
          <small style={{ color: '#64748b' }}>Across all regions</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Registered Users</span>
            <Users size={18} style={{ color: '#f59e0b' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{metrics.totalUsers}</p>
          <small style={{ color: '#64748b' }}>{metrics.totalSellers} Verified Sellers</small>
        </div>
      </div>

      <section style={{ background: '#0f2d35', color: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Website Analytics</h2>
            <p style={{ color: '#b8d0d3', fontSize: '0.85rem' }}>Audience reach, acquisition quality, and search visibility.</p>
          </div>
          <Link className="text-link" to="/admin/analytics" style={{ color: '#8ee3d4', fontSize: '0.85rem' }}>Open full analytics &rarr;</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            ['Visits', data.websiteAnalytics.footfall.visits.toLocaleString()],
            ['Unique visitors', data.websiteAnalytics.footfall.uniqueVisitors.toLocaleString()],
            ['Bounce rate', `${data.websiteAnalytics.footfall.bounceRate}%`],
            ['Organic visits', data.websiteAnalytics.seo.organicVisits.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#17434c', borderRadius: '10px', padding: '0.9rem' }}>
              <span style={{ display: 'block', color: '#b8d0d3', fontSize: '0.75rem' }}>{label}</span>
              <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.3rem' }}>{value}</strong>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div><strong>Top locations</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.locations.map(location => location.city).join(' · ') || 'No location data'}</p></div>
          <div><strong>Audience devices</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.devices.map(device => `${device.name} ${device.value}%`).join(' · ')}</p></div>
          <div><strong>SEO health</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.seo.indexedPages} indexed pages · {data.websiteAnalytics.seo.keywordVisibility}% visibility</p></div>
        </div>
      </section>

      {/* Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Latest Marketplace Bookings</h3>
            <Link className="text-link" to="/admin/orders" style={{ fontSize: '0.85rem' }}>
              View all orders &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.recentOrders.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{o.trackingCode || o.id.slice(-6)}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {o.customer?.name} &rarr; {o.seller?.shopName}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{money(o.totalAmount)}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>{o.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>New User Registrations</h3>
            <Link className="text-link" to="/admin/users" style={{ fontSize: '0.85rem' }}>
              Manage users &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.recentUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{u.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email} · {u.city || 'India'}</p>
                </div>
                <span style={{ background: u.role === 'SELLER' ? '#e0f2fe' : u.role === 'ADMIN' ? '#fef3c7' : '#f1f5f9', color: u.role === 'SELLER' ? '#0369a1' : u.role === 'ADMIN' ? '#b45309' : '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
