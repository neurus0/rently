import { ArrowRight, Building2, CalendarDays, CircleDollarSign, Search, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';

const categoryIcons: Record<string, string> = {
  'power-tools': '⚡',
  'construction-heavy': '🏗️',
  'electrical-power': '🔌',
  'plumbing-piping': '🔧',
  'gardening-landscaping': '🌿',
  'cameras-production': '📷',
  'audio-dj': '🎧',
  'stage-lighting': '💡',
  'travel-camping': '⛺',
  'event-party': '🎉',
  'dj-electronic': '🎛️',
  'fitness-gym': '🏋️',
  'automotive-tools': '🚗',
  'home-cleaning': '🧹',
  'electronic-appliances': '📺',
  'specialized-industrial': '🏭',
};

const defaultIcons = ['⚡', '🛻', '📷', '🏗️', '💡', '🔌', '🎧', '🪏', '⛺', '👨🏼‍🔧', '🎛️', '📽️', '🏭', '⚒️', '🏸', '🧳'];

export function Home() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([
      api<{ categories: Category[] }>('/categories'),
      api<{ products: Product[] }>('/products?sort=newest'),
    ])
      .then(([c, p]) => {
        setCategories(c.categories);
        setFeatured(p.products.slice(0, 8));
      })
      .catch(() => setError('We could not load the marketplace right now. Please try again.'));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <img className="hero-logo" src="/logo_with_text.png" alt="Rently" />
          <p className="pill">India’s Premier Equipment Rental Marketplace</p>
          <h1>
            Get the gear.<br />
            <em>Skip the ownership.</em>
          </h1>
          <p>
            From home repairs and construction to video productions and events, rent top-grade equipment only for the time you need it.
          </p>
          <form
            className="hero-search"
            onSubmit={e => {
              e.preventDefault();
              nav(`/products${query ? `?q=${encodeURIComponent(query)}` : ''}`);
            }}
          >
            <Search size={21} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What equipment do you need to rent today?"
            />
            <button type="submit">Search</button>
          </form>
          <div className="hero-actions">
            <Link className="button" to="/products">
              Browse equipment <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/seller/register">
              List your equipment &rarr;
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-tag tag-one">✓ Verified Commercial Gear</div>
          <div className="visual-tool">⚙️</div>
          <div className="visual-tag tag-two">✓ Doorstep Delivery Available</div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore by Category</p>
            <h2>Everything for your next project</h2>
          </div>
          <Link className="text-link" to="/categories">
            View all categories <ArrowRight size={16} />
          </Link>
        </div>
        {error ? (
          <p className="error">{error}</p>
        ) : categories.length ? (
          <div className="category-grid">
            {categories.map((c, i) => (
              <Link className="category" key={c.id} to={`/products?category=${c.slug}`}>
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.35rem' }}>
                  {categoryIcons[c.slug] || defaultIcons[i % defaultIcons.length]}
                </span>
                <strong>{c.name}</strong>
                <small>{c._count?.products ?? 0} items</small>
              </Link>
            ))}
          </div>
        ) : (
          <Loading label="Loading categories…" />
        )}
      </section>

      <section className="feature-strip">
        <div>
          <ShieldCheck />
          <span>
            <b>Inspected & Maintained</b>Every item is tested for safety and operational quality.
          </span>
        </div>
        <div>
          <CalendarDays />
          <span>
            <b>Flexible Durations</b>Daily, weekly, or custom duration rentals at transparent rates.
          </span>
        </div>
        <div>
          <CircleDollarSign />
          <span>
            <b>Zero Hidden Charges</b>Clear breakdown of rental rates and refundable security deposits.
          </span>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ready to Rent</p>
            <h2>Featured equipment listings</h2>
          </div>
          <Link className="text-link" to="/products">
            See all equipment <ArrowRight size={16} />
          </Link>
        </div>
        {error ? (
          <p className="error">{error}</p>
        ) : featured.length ? (
          <div className="product-grid">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <Loading label="Loading featured equipment…" />
        )}
      </section>

      <section className="how-section">
        <div className="container">
          <p className="eyebrow">Simple from start to finish</p>
          <h2>How Rently works</h2>
          <div className="steps">
            {[
              [Search, 'Find equipment', 'Browse a wide catalog of verified equipment in your city.'],
              [CalendarDays, 'Pick your dates', 'Select your start and return dates to calculate instant rates.'],
              [Building2, 'Book & Pay Securely', 'Confirm booking with transparent deposits and online payment.'],
              [Truck, 'Receive & Use', 'Get fast doorstep delivery or pickup from vendor hubs.'],
              [RotateCcw, 'Easy Returns', 'Return on time and get your security deposit refunded promptly.'],
            ].map(([Icon, title, text], i) => {
              const I = Icon as typeof Search;
              return (
                <div className="step" key={String(title)}>
                  <span>0{i + 1}</span>
                  <I size={24} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="seller-banner container">
        <div>
          <p className="eyebrow">For equipment owners & vendors</p>
          <h2>Turn idle tools into steady revenue.</h2>
          <p>List your commercial gear, manage bookings in real time, and scale your rental business with Rently.</p>
        </div>
        <Link className="button light" to="/seller/register">
          Become a Seller <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    api<{ categories: Category[] }>('/categories').then(r => setCategories(r.categories));
  }, []);

  return (
    <main className="container page">
      <p className="eyebrow">Browse the marketplace</p>
      <h1>Equipment Categories</h1>
      <p className="lead">Find high-performance, rental-ready gear across all project domains.</p>
      <div className="category-grid large">
        {categories.map((c, i) => (
          <Link className="category" key={c.id} to={`/products?category=${c.slug}`}>
            <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.5rem' }}>
              {categoryIcons[c.slug] || defaultIcons[i % defaultIcons.length]}
            </span>
            <strong>{c.name}</strong>
            <small>{c._count?.products ?? 0} available listings</small>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function HowItWorks() {
  return (
    <main className="container page prose">
      <p className="eyebrow">Rent without the commitment</p>
      <h1>How Rently Works</h1>
      <p className="lead">Rent top-tier professional gear with end-to-end tracking and guaranteed security deposits.</p>
      <ol style={{ lineHeight: '1.8', fontSize: '1.05rem', margin: '2rem 0', paddingLeft: '1.5rem' }}>
        <li style={{ marginBottom: '1rem' }}>
          <b>1. Search & Select:</b> Explore 16+ specialized categories and locate equipment in your area.
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <b>2. Choose Schedule:</b> Select your rental start and return dates. Rental calculations and deposits are calculated live.
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <b>3. Seamless Checkout & Payment:</b> Pay securely using instant UPI, Net Banking, or Credit/Debit cards.
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <b>4. Live Milestone Tracking:</b> Track your equipment from vendor dispatch to delivery with our real-time order tracking timeline.
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <b>5. Return & Deposit Refund:</b> When your project concludes, return the gear in good condition for instant deposit settlement.
        </li>
      </ol>
    </main>
  );
}

export function SellerCTA() {
  return (
    <main className="container page seller-page">
      <p className="eyebrow">For shops, contractors and owners</p>
      <h1>Your equipment can do more than sit idle.</h1>
      <p className="lead">List gear, set custom pricing, track inventory, and reach thousands of verified renters across India.</p>
      <div style={{ margin: '2rem 0' }}>
        <Link className="button" to="/seller/register">
          Apply as a Seller Partner <ArrowRight size={17} />
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>⚡ Instant Inventory Management</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload single items or import hundreds in bulk using CSV spreadsheets.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🛡️ Security Deposit Protection</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Rently handles refundable security deposits so your equipment is always insured.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📊 Business & Revenue Analytics</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time dashboard tracking sales, utilization rates, and client demographics.</p>
        </div>
      </div>
    </main>
  );
}
