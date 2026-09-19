import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Shield, Store, Bell, LogOut, ArrowRight, UserCheck, Wrench } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      nav(params.get('next') || '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your rentals, inventory, and bookings.">
      <form onSubmit={submit}>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button wide" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        New to Rently? <Link to="/signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    marketingConsent: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      nav('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Rently to rent equipment or list your own inventory.">
      <form onSubmit={submit}>
        <label>
          Full name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label>
          City
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.marketingConsent}
            onChange={e => setForm({ ...form, marketingConsent: e.target.checked })}
          />{' '}
          Keep me updated with relevant equipment discounts and availability.
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button wide" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <Link className="brand" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
          <span><Wrench size={20} /></span> Rently
        </Link>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export function Account() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();

  if (loading) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="lead">Loading account details…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container empty page">
        <h1>Your Account</h1>
        <p className="lead">Log in to access your rental history, orders, and dashboard.</p>
        <Link className="button" to="/login">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="container page account">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow">Account Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p className="lead">Manage your rentals, account settings, and vendor portals.</p>
        </div>
        <span
          style={{
            background: user.role === 'ADMIN' ? '#fef3c7' : user.role === 'SELLER' ? '#e0f2fe' : '#ecfdf5',
            color: user.role === 'ADMIN' ? '#92400e' : user.role === 'SELLER' ? '#0369a1' : '#047857',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {user.role} ACCOUNT
        </span>
      </div>

      <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} style={{ color: 'var(--color-primary)' }} /> Profile Details
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Phone:</b> {user.phone || 'Not provided'}</p>
            <p><b>Location:</b> {user.city || 'India'}</p>
            <p><b>Marketing Alerts:</b> {user.marketingConsent ? 'Active (Opted In)' : 'Disabled'}</p>
          </div>
        </section>

        {/* Orders Portal */}
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} style={{ color: '#10b981' }} /> My Rentals & Orders
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              View your booking confirmations, live tracking milestones, invoices, and deposit returns.
            </p>
          </div>
          <Link className="button" to="/orders" style={{ justifyContent: 'center' }}>
            View My Orders <ArrowRight size={16} />
          </Link>
        </section>

        {/* Seller / Admin Portal */}
        {user.role === 'ADMIN' ? (
          <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} style={{ color: '#8b5cf6' }} /> Administrator Console
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Manage marketplace users, approve seller stores, moderate catalog listings, review financial metrics.
              </p>
            </div>
            <Link className="button" to="/admin" style={{ background: '#8b5cf6', borderColor: '#8b5cf6', justifyContent: 'center' }}>
              Open Admin Dashboard <ArrowRight size={16} />
            </Link>
          </section>
        ) : user.role === 'SELLER' ? (
          <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={20} style={{ color: 'var(--color-primary)' }} /> Vendor Shop Portal
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Manage equipment catalog, bulk import CSV inventory, process incoming rental orders, view revenue.
              </p>
            </div>
            <Link className="button" to="/seller" style={{ justifyContent: 'center' }}>
              Open Seller Dashboard <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={20} style={{ color: '#64748b' }} /> Become a Seller
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Have tools or equipment sitting idle? List your gear on Rently and start earning steady rental revenue.
              </p>
            </div>
            <Link className="button light" to="/seller/register" style={{ justifyContent: 'center' }}>
              Register Vendor Shop <ArrowRight size={16} />
            </Link>
          </section>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <button
          className="text-link plain"
          onClick={() => {
            logout();
            nav('/');
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={16} /> Sign out of Rently
        </button>
      </div>
    </main>
  );
}
