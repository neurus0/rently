import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, Truck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { total } = useCart();

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/products${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    setOpen(false);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/logo.png" alt="Rently" />
        </Link>

        <form className="nav-search" onSubmit={go}>
          <Search size={17} />
          <input
            aria-label="Search equipment"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search power tools, cameras, sound gear..."
          />
        </form>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Open navigation">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'links active' : 'links'}>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            Browse
          </NavLink>
          <NavLink to="/categories" onClick={() => setOpen(false)}>
            Categories
          </NavLink>
          <NavLink to="/tracking" onClick={() => setOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Truck size={15} /> Track Order
          </NavLink>
          <NavLink to="/how-it-works" onClick={() => setOpen(false)}>
            How it works
          </NavLink>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" onClick={() => setOpen(false)} style={{ color: '#8b5cf6', fontWeight: 700 }}>
                  Admin
                </NavLink>
              )}
              {user.role === 'SELLER' && (
                <NavLink to="/seller" onClick={() => setOpen(false)} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  Seller Hub
                </NavLink>
              )}
              {user.role === 'CUSTOMER' && (
                <NavLink to="/seller/register" onClick={() => setOpen(false)}>
                  Become a Seller
                </NavLink>
              )}

              <NavLink to="/orders" onClick={() => setOpen(false)}>
                My Orders
              </NavLink>

              <NavLink to="/account" onClick={() => setOpen(false)}>
                Account
              </NavLink>

              <NotificationBell />

              <button
                className="link-button"
                onClick={() => {
                  logout();
                  nav('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/seller/register" onClick={() => setOpen(false)}>
                Become a Seller
              </NavLink>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
            </>
          )}

          <NavLink className="cart-link" to="/cart" onClick={() => setOpen(false)}>
            <ShoppingBag size={19} />
            Cart {total > 0 && <b>{total}</b>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
