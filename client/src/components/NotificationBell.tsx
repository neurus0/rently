import { useEffect, useState, useRef } from 'react';
import { Bell, Check, ArrowRight, Package, CreditCard, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification } from '../types';
import { useAuth } from '../context/AuthContext';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    if (!user) return;
    api<{ notifications: Notification[]; unreadCount: number }>('/notifications')
      .then(res => {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          color: '#334155',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '340px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <strong style={{ fontSize: '0.9rem' }}>Notifications ({unreadCount} new)</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {!notifications.length ? (
              <p style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No notifications right now.
              </p>
            ) : (
              notifications.slice(0, 8).map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.read ? '#fff' : '#f0f9ff',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ marginTop: '2px', color: n.type === 'PAYMENT' ? '#10b981' : 'var(--color-primary)' }}>
                    {n.type === 'PAYMENT' ? <CreditCard size={16} /> : <Package size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                      {n.title}
                    </p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={e => markAsRead(n.id, e)}
                      title="Mark as read"
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              View all notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
