import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Package, CreditCard, Shield, Clock, Check } from 'lucide-react';
import { api } from '../lib/api';
import type { Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api<{ notifications: Notification[] }>('/notifications')
      .then(res => setNotifications(res.notifications))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  if (loading) return <Loading label="Loading your notification alerts…" />;

  return (
    <main className="container page" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow">Activity & Updates</p>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Notification Inbox</h1>
          <p className="lead">Stay up to date on your order milestones, rental return reminders, and payments.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="button light"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {!notifications.length ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Bell size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Notifications Yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Order updates and payment receipts will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                background: n.read ? '#fff' : '#f0f9ff',
                border: n.read ? '1px solid #e2e8f0' : '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  background: n.type === 'PAYMENT' ? '#ecfdf5' : '#e0f2fe',
                  color: n.type === 'PAYMENT' ? '#10b981' : 'var(--color-primary)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {n.type === 'PAYMENT' ? <CreditCard size={20} /> : <Package size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem', color: '#0f172a' }}>{n.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{n.message}</p>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  title="Mark as read"
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    color: '#0284c7',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Check size={14} /> Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
