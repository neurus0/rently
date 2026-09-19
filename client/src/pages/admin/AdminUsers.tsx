import { useEffect, useState } from 'react';
import { Search, UserCheck, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { User } from '../../types';
import { Loading } from '../../components/Loading';

type AdminUser = User & {
  _count?: { orders: number };
  seller?: { id: string; shopName: string; status: string };
  createdAt: string;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);

    api<{ users: AdminUser[] }>(`/admin/users?${params.toString()}`)
      .then(r => setUsers(r.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setMessage('');
    try {
      await api(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setMessage(`User role updated to ${newRole}.`);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading label="Loading users directory…" />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>User & Account Management</h1>
        <p style={{ color: '#64748b' }}>Search accounts, inspect registration data, and assign permission roles.</p>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button type="submit" className="button" style={{ padding: '0.65rem 1rem' }}>
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Role:</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SELLER">Sellers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Contact Info</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Orders Booked</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Modify Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>{u.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  {u.seller && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#0284c7', marginTop: '0.2rem' }}>
                      Store: {u.seller.shopName} ({u.seller.status})
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{u.email}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{u.phone || 'No phone'}</p>
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{u.city || 'India'}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{u._count?.orders ?? 0}</td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'SELLER' ? '#e0f2fe' : '#ecfdf5',
                      color: u.role === 'ADMIN' ? '#92400e' : u.role === 'SELLER' ? '#0369a1' : '#047857',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <select
                    disabled={updatingId === u.id}
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
