import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Package, ShoppingBag, CreditCard, BarChart3, Megaphone, ArrowLeft, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user || user.role !== 'ADMIN') {
    return (
      <main className="container empty page">
        <h1>Administrator Access Required</h1>
        <p className="lead">You need an administrator account to access this management console.</p>
        <Link className="button" to="/login" style={{ marginTop: '1.5rem' }}>
          Sign In with Admin Account
        </Link>
      </main>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 70px)', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          background: '#0f172a',
          color: '#f8fafc',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ padding: '0 0.75rem 1.25rem', borderBottom: '1px solid #334155', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>
              Master Console
            </span>
            <h3 style={{ fontSize: '1.1rem', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
              <Shield size={18} style={{ color: '#38bdf8' }} />
              Admin Portal
            </h3>
            <small style={{ color: '#38bdf8', fontWeight: 600 }}>Superadmin Mode</small>
          </div>

          <nav style={{ display: 'grid', gap: '0.35rem' }}>
            <NavLink
              to="/admin"
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Users size={18} /> Users & Roles
            </NavLink>

            <NavLink
              to="/admin/sellers"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Store size={18} /> Seller Approvals
            </NavLink>

            <NavLink
              to="/admin/products"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Package size={18} /> Catalog Moderation
            </NavLink>

            <NavLink
              to="/admin/orders"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <ShoppingBag size={18} /> Orders & Bookings
            </NavLink>

            <NavLink
              to="/admin/payments"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <CreditCard size={18} /> Payment Audit
            </NavLink>

            <NavLink
              to="/admin/analytics"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <BarChart3 size={18} /> Revenue Analytics
            </NavLink>

            <NavLink
              to="/admin/marketing"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Megaphone size={18} /> Marketing Campaigns
            </NavLink>
          </nav>
        </div>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <Link
            to="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#94a3b8',
              textDecoration: 'none',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={16} /> Public Marketplace
          </Link>
          <button
            onClick={() => {
              logout();
              nav('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#f87171',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div style={{ padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
