import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, money, rentalDays } from '../lib/api';
import type { Order } from '../types';

export function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, clear } = useCart();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const rental = items.reduce(
    (s, i) => s + i.product.pricePerDay * i.quantity * rentalDays(i.startDate, i.endDate),
    0
  );
  const deposit = items.reduce((s, i) => s + i.product.securityDeposit * i.quantity, 0);
  const total = rental + deposit;

  if (authLoading) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="lead">Preparing checkout…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container empty page">
        <h1>Log In to Continue Checkout</h1>
        <p className="lead">Please log in or create an account to finalize your equipment booking.</p>
        <Link className="button" to="/login?next=/checkout" style={{ marginTop: '1.5rem' }}>
          Log in / Sign up
        </Link>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="container empty page">
        <h1>Your Cart is Empty</h1>
        <p className="lead">Add equipment to your cart before proceeding to checkout.</p>
        <Link className="button" to="/products" style={{ marginTop: '1.5rem' }}>
          Browse Equipment
        </Link>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');

    try {
      // First sync cart items to server backend cart so /api/orders can process it
      for (const item of items) {
        await api('/cart', {
          method: 'POST',
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate,
          }),
        });
      }

      // Create orders
      const res = await api<{ orders: Order[] }>('/orders', {
        method: 'POST',
      });

      // Clear local cart
      clear();

      // Collect order IDs
      const orderIds = res.orders.map(o => o.id).join(',');
      nav(`/payment?orderIds=${orderIds}`);
    } catch (err: any) {
      setError(err.message || 'Could not place rental order. Please check item stock.');
      setSubmitting(false);
    }
  };

  return (
    <main className="container page checkout">
      <p className="eyebrow">Review & Confirm</p>
      <h1>Rental Checkout</h1>

      {error && (
        <div className="error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="checkout-layout">
        <section>
          <div className="checkout-card">
            <h2>Renter Profile Information</h2>
            <div className="customer-grid">
              <p>
                <b>Name</b>
                {user.name}
              </p>
              <p>
                <b>Email</b>
                {user.email}
              </p>
              <p>
                <b>Phone</b>
                {user.phone || 'Not provided'}
              </p>
              <p>
                <b>City</b>
                {user.city || 'Not provided'}
              </p>
            </div>
            <Link className="text-link" to="/account" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              Edit profile details &rarr;
            </Link>
          </div>

          <div className="checkout-card">
            <h2>Selected Rental Equipment ({items.length} Item{items.length > 1 ? 's' : ''})</h2>
            {items.map(i => {
              const days = rentalDays(i.startDate, i.endDate);
              const lineTotal = i.product.pricePerDay * i.quantity * days;
              return (
                <div className="checkout-line" key={i.id}>
                  <div>
                    <b>{i.product.name}</b>
                    <span>
                      {i.quantity} unit(s) × {days} day(s) · Vendor: {i.product.seller.shopName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b' }}>
                      <Calendar size={13} /> {i.startDate.slice(0, 10)} to {i.endDate.slice(0, 10)}
                    </span>
                  </div>
                  <div>
                    <b>{money(lineTotal)}</b>
                    <small style={{ display: 'block', color: '#64748b', textAlign: 'right' }}>
                      Deposit: {money(i.product.securityDeposit * i.quantity)}
                    </small>
                  </div>
                </div>
              );
            })}
            <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              Security deposits are held in escrow and returned immediately upon equipment handover inspection.
            </p>
          </div>
        </section>

        <aside className="summary">
          <h2>Order Cost Breakdown</h2>
          <p>
            Rental charges <b>{money(rental)}</b>
          </p>
          <p>
            Refundable security deposit <b>{money(deposit)}</b>
          </p>
          <hr />
          <strong>
            Total Payable <b>{money(total)}</b>
          </strong>
          <small style={{ color: '#64748b', display: 'block', margin: '0.75rem 0' }}>
            Instant order confirmation & real-time milestone tracking on next step.
          </small>
          <button
            className="button wide"
            disabled={submitting}
            onClick={handlePlaceOrder}
            style={{ justifyContent: 'center' }}
          >
            {submitting ? (
              <>
                <Loader2 className="spin" size={18} /> Processing Booking…
              </>
            ) : (
              <>
                Proceed to Payment <ArrowRight size={17} />
              </>
            )}
          </button>
        </aside>
      </div>
    </main>
  );
}
