import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, ShoppingBag, BarChart3, Store, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SellerLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <main className="container empty page">
        <h1>Seller Portal Access Required</h1>
        <p className="lead">You need an active seller account to view this section.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link className="button" to="/seller/register">
            Register as Seller
          </Link>
          <Link className="button light" to="/login">
            Sign In with Seller Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 70px)', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ padding: '0 0.75rem 1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              Vendor Console
            </span>
            <h3 style={{ fontSize: '1.1rem', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Store size={18} style={{ color: 'var(--color-primary)' }} />
              {user.seller?.shopName || 'My Rental Shop'}
            </h3>
            <small style={{ color: '#10b981', fontWeight: 600, display: 'inline-block', marginTop: '0.2rem' }}>
              ● {user.seller?.status || 'Active'} Partner
            </small>
          </div>

          <nav style={{ display: 'grid', gap: '0.35rem' }}>
            <NavLink
              to="/seller"
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#475569',
                background: isActive ? '#f0f9ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink
              to="/seller/products"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#475569',
                background: isActive ? '#f0f9ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Package size={18} /> Products & CSV
            </NavLink>

            <NavLink
              to="/seller/inventory"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#475569',
                background: isActive ? '#f0f9ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Boxes size={18} /> Inventory Stock
            </NavLink>

            <NavLink
              to="/seller/orders"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#475569',
                background: isActive ? '#f0f9ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <ShoppingBag size={18} /> Orders & Fulfillment
            </NavLink>

            <NavLink
              to="/seller/analytics"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#475569',
                background: isActive ? '#f0f9ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <BarChart3 size={18} /> Store Analytics
            </NavLink>
          </nav>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <Link
            to="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#64748b',
              textDecoration: 'none',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Marketplace
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
              color: '#ef4444',
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
