import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, QrCode, Shield, Smartphone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api, money } from '../lib/api';
import type { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export function Payment() {
  const [searchParams] = useSearchParams();
  const orderIdsParam = searchParams.get('orderIds');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('rently@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!orderIdsParam) {
      setError('No orders specified for payment.');
      setLoading(false);
      return;
    }

    const ids = orderIdsParam.split(',').filter(Boolean);
    Promise.all(ids.map(id => api<{ order: Order }>(`/orders/${id}`).catch(() => null)))
      .then(results => {
        const valid = results.map(r => r?.order).filter(Boolean) as Order[];
        if (!valid.length) {
          setError('Could not find order details.');
        } else {
          setOrders(valid);
        }
      })
      .catch(() => setError('Failed to load orders for payment.'))
      .finally(() => setLoading(false));
  }, [orderIdsParam]);

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDeposit = orders.reduce((sum, o) => sum + o.securityDeposit, 0);
  const totalRent = orders.reduce((sum, o) => sum + o.rentalAmount, 0);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate gateway delay
      await new Promise(res => setTimeout(res, 1200));

      // Process payment for all orders
      for (const order of orders) {
        if (order.paymentStatus !== 'SUCCESS') {
          await api('/payments', {
            method: 'POST',
            body: JSON.stringify({
              orderId: order.id,
              method: paymentMethod,
            }),
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/order-confirmation?orderIds=${orderIdsParam}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 className="spin" size={36} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
        <p className="lead">Preparing your secure payment checkout…</p>
      </main>
    );
  }

  if (error && !orders.length) {
    return (
      <main className="container page empty">
        <AlertCircle size={44} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
        <h2>Payment Session Error</h2>
        <p>{error}</p>
        <Link className="button" to="/cart" style={{ marginTop: '1.5rem' }}>
          Return to Cart
        </Link>
      </main>
    );
  }

  if (success) {
    return (
      <main className="container page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <CheckCircle2 size={56} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
        <h1>Payment Successful!</h1>
        <p className="lead">Your payment has been verified. Redirecting to your order confirmation…</p>
      </main>
    );
  }

  return (
    <main className="container page">
      <p className="eyebrow">Secure Checkout</p>
      <h1>Complete Rental Payment</h1>
      <p className="lead">Pay securely using your preferred payment method.</p>

      {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2.5rem', marginTop: '2rem' }}>
        {/* Payment Methods */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: '#10b981' }} /> Select Payment Option
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              style={{
                padding: '1rem',
                border: paymentMethod === 'UPI' ? '2px solid var(--color-primary, #0ea5e9)' : '1px solid #e2e8f0',
                background: paymentMethod === 'UPI' ? '#f0f9ff' : '#fff',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              <Smartphone size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--color-primary)' }} />
              UPI / QR
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              style={{
                padding: '1rem',
                border: paymentMethod === 'CARD' ? '2px solid var(--color-primary, #0ea5e9)' : '1px solid #e2e8f0',
                background: paymentMethod === 'CARD' ? '#f0f9ff' : '#fff',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              <CreditCard size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--color-primary)' }} />
              Debit / Card
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('NETBANKING')}
              style={{
                padding: '1rem',
                border: paymentMethod === 'NETBANKING' ? '2px solid var(--color-primary, #0ea5e9)' : '1px solid #e2e8f0',
                background: paymentMethod === 'NETBANKING' ? '#f0f9ff' : '#fff',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              <QrCode size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--color-primary)' }} />
              Net Banking
            </button>
          </div>

          <form onSubmit={handlePay}>
            {paymentMethod === 'UPI' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Google Pay, PhonePe, Paytm and BHIM supported.
                </p>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Select Bank
                </label>
                <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="button"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', justifyContent: 'center' }}
            >
              {processing ? (
                <>
                  <Loader2 className="spin" size={18} /> Simulating Payment Authorization…
                </>
              ) : (
                <>
                  Pay {money(totalAmount)} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Breakdown Sidebar */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            Rental Order Summary
          </h3>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{order.seller?.shopName || 'Partner Vendor'}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Code: {order.trackingCode}</span>
                </div>
                {order.items.map(item => (
                  <div key={item.id} style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>{money(item.pricePerDay * item.quantity)}/day</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Equipment Rental Charges</span>
              <span>{money(totalRent)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Refundable Security Deposit</span>
              <span>{money(totalDeposit)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginTop: '0.5rem', borderTop: '2px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <span>Total Payable</span>
              <span>{money(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
