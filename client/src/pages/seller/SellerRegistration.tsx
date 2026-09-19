import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function SellerRegistration() {
  const { user, refreshUser } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    shopName: '',
    description: '',
    address: '',
    city: user?.city || '',
    state: 'Maharashtra',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <main className="container empty page">
        <h1>Sign In to Become a Seller</h1>
        <p className="lead">Please create an account or sign in before registering your rental business.</p>
        <Link className="button" to="/login?next=/seller/register" style={{ marginTop: '1.5rem' }}>
          Sign In / Create Account
        </Link>
      </main>
    );
  }

  if (user.role === 'SELLER') {
    return (
      <main className="container empty page">
        <h1>You are Already a Registered Seller</h1>
        <p className="lead">Your vendor account is active. Manage your products and orders in the seller portal.</p>
        <Link className="button" to="/seller" style={{ marginTop: '1.5rem' }}>
          Go to Seller Dashboard
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api('/sellers/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      await refreshUser();
      setSubmitted(true);
      setTimeout(() => {
        nav('/seller');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register seller profile.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
        <h1>Seller Profile Created!</h1>
        <p className="lead">Welcome to the Rently Partner network. Redirecting you to your store dashboard…</p>
      </main>
    );
  }

  return (
    <main className="container page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <p className="eyebrow">Partner Onboarding</p>
      <h1>Register Your Rental Business</h1>
      <p className="lead">Join India's leading equipment sharing network and start accepting verified rental bookings.</p>

      {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Store / Business Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Heavy Rentals, CineGear Studio"
                value={form.shopName}
                onChange={e => setForm({ ...form, shopName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru, Delhi"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  State
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Store Address / Pickup Location
              </label>
              <input
                type="text"
                placeholder="Shop 12, Industrial Estate, Main Road"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Business Description & Equipment Speciality
              </label>
              <textarea
                rows={3}
                placeholder="We specialize in professional cameras, lenses, lighting, and sound gear for indie filmmakers and studios."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <ShieldCheck size={24} style={{ color: '#10b981', flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                By registering as a seller, you agree to inspect all equipment before dispatch and return customer security deposits upon intact receipt.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button"
              style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 className="spin" size={18} /> Submitting Application…
                </>
              ) : (
                <>
                  Submit Seller Profile <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
