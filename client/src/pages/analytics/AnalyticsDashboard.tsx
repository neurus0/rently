import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, MapPin, Layers, Package } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { AnalyticsOverview } from '../../types';
import { Loading } from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsOverview>('/analytics/overview')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Compiling analytics & visualization charts…" />;
  if (!data) return <p className="error">Failed to generate analytics dataset.</p>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{user?.role === 'SELLER' ? 'Store Performance Analytics' : 'Revenue & Marketplace Analytics'}</h1>
        <p style={{ color: '#64748b' }}>{user?.role === 'SELLER' ? 'Track your equipment turnover, renter profile, and store demand.' : 'Interactive charts covering financial trajectory, category demand, geographic reach, and renter demographics.'}</p>
      </div>

      <div style={{ background: '#0f2d35', color: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{user?.role === 'SELLER' ? 'Store Audience Snapshot' : 'Website Audience & SEO'}</h2>
        <p style={{ color: '#b8d0d3', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{user?.role === 'SELLER' ? 'Audience signals from customers who interacted with your listings.' : 'Understand who is finding Rently and how they reach the marketplace.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          {[
            ['Visits', data.websiteAnalytics.footfall.visits.toLocaleString()],
            ['Unique visitors', data.websiteAnalytics.footfall.uniqueVisitors.toLocaleString()],
            ['Avg. session', `${data.websiteAnalytics.footfall.averageSessionMinutes} min`],
            ['Conversion rate', `${data.websiteAnalytics.seo.conversionRate}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#17434c', borderRadius: '10px', padding: '0.9rem' }}><span style={{ display: 'block', color: '#b8d0d3', fontSize: '0.75rem' }}>{label}</span><strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.3rem' }}>{value}</strong></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          <div><strong>Age groups</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.ageGroups.filter(group => group.value > 0).map(group => `${group.name} ${group.value}`).join(' · ')}</p></div>
          <div><strong>Gender</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.gender.filter(group => group.value > 0).map(group => `${group.name} ${group.value}`).join(' · ')}</p></div>
          <div><strong>Devices</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.devices.map(device => `${device.name} ${device.value}%`).join(' · ')}</p></div>
          <div><strong>SEO</strong><p style={{ color: '#b8d0d3', marginTop: '0.4rem' }}>{data.websiteAnalytics.seo.indexedPages} indexed pages · {data.websiteAnalytics.seo.keywordVisibility}% visibility</p></div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Revenue</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{money(data.summary.totalRevenue)}</p>
          <small style={{ color: '#10b981', fontWeight: 600 }}>Gross booking volume</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Completed Bookings</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{data.summary.totalOrders}</p>
          <small style={{ color: '#0ea5e9', fontWeight: 600 }}>Rental transactions</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Average Order Value</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{money(data.summary.avgOrderValue)}</p>
          <small style={{ color: '#8b5cf6', fontWeight: 600 }}>Per rental booking</small>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Listings</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{data.summary.activeProducts}</p>
          <small style={{ color: '#f59e0b', fontWeight: 600 }}>Available in catalog</small>
        </div>
      </div>

      {/* Chart 1: Revenue Over Time (Area Chart) */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} /> Revenue & Commission Trajectory
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>Monthly gross rental turnover vs. platform commission</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(val: any) => [money(Number(val) || 0), '']} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Rental Turnover" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="commission" name="Rently Commission" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Categories & Geography */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Category Performance Bar Chart */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} style={{ color: '#8b5cf6' }} /> Category Performance
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Revenue generated per equipment category</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryPerformance.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val: any) => [money(Number(val) || 0), 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution Bar Chart */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} style={{ color: '#10b981' }} /> Geographic Demand by City
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Rental booking volume across major metro hubs</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geographicData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="city" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="rentals" name="Bookings" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Demographics & Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '1.5rem' }}>
        {/* Customer Demographics Pie */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: '#f59e0b' }} /> Customer Demographics
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Gender & Age segmentation</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.demographics.gender.filter(g => g.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.demographics.gender.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Rented Products */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: 'var(--color-primary)' }} /> Top Performing Equipment
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Most rented gear models across catalog</p>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.topProducts.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.9rem', width: '16px' }}>#{i + 1}</span>
                  <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{money(p.revenue)}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{p.rentals} rental(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
