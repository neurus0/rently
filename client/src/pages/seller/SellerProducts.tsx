import { useEffect, useState, FormEvent } from 'react';
import { Plus, Upload, Trash2, Edit2, Package, Check, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { api, money } from '../../lib/api';
import type { Category, Product } from '../../types';
import { Loading } from '../../components/Loading';

export function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    pricePerDay: '',
    securityDeposit: '',
    totalStock: '1',
    location: '',
    condition: 'Excellent',
    images: [] as string[],
  });

  // CSV Text State
  const [csvText, setCsvText] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchCatalog = () => {
    Promise.all([
      api<{ products: Product[] }>('/sellers/products'),
      api<{ categories: Category[] }>('/categories'),
    ])
      .then(([p, c]) => {
        setProducts(p.products);
        setCategories(c.categories);
        if (c.categories.length && !form.categoryId) {
          setForm(f => ({ ...f, categoryId: c.categories[0].id }));
        }
      })
      .catch(err => setError(err.message || 'Failed to load catalog.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingProduct) {
        await api(`/sellers/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            categoryId: form.categoryId,
            description: [form.description],
            pricePerDay: Number(form.pricePerDay),
            securityDeposit: Number(form.securityDeposit),
            totalStock: Number(form.totalStock),
            location: form.location,
            condition: form.condition,
          }),
        });
        setSuccess('Product updated successfully.');
      } else {
        await api('/sellers/products', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            categoryId: form.categoryId,
            description: [form.description],
            pricePerDay: Number(form.pricePerDay),
            securityDeposit: Number(form.securityDeposit),
            totalStock: Number(form.totalStock),
            location: form.location,
            condition: form.condition,
            images: ['/images/products/dslr-camera.jpg'],
          }),
        });
        setSuccess('New equipment listing added to catalog.');
      }

      setShowAddModal(false);
      setEditingProduct(null);
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this listing?')) return;
    try {
      await api(`/sellers/products/${id}`, { method: 'DELETE' });
      setSuccess('Product removed from active listings.');
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  const handleCsvImport = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must contain a header row and at least one item row.');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 5) continue;

        // name, categorySlug, pricePerDay, securityDeposit, totalStock, location, condition, description
        const name = parts[0];
        const catSlug = parts[1];
        const category = categories.find(c => c.slug === catSlug || c.name.toLowerCase() === catSlug.toLowerCase()) || categories[0];
        const pricePerDay = Number(parts[2]) || 500;
        const securityDeposit = Number(parts[3]) || 2000;
        const totalStock = Number(parts[4]) || 1;
        const location = parts[5] || 'Mumbai';
        const condition = parts[6] || 'Good';
        const description = parts[7] || name;

        rows.push({
          name,
          categoryId: category.id,
          pricePerDay,
          securityDeposit,
          totalStock,
          location,
          condition,
          description,
        });
      }

      await api('/sellers/products/csv', {
        method: 'POST',
        body: JSON.stringify({ rows }),
      });

      setSuccess(`Successfully imported ${rows.length} products!`);
      setShowCsvModal(false);
      setCsvText('');
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'CSV Import failed. Please verify format.');
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      categoryId: p.category?.id || categories[0]?.id || '',
      description: Array.isArray(p.description) ? p.description.join(' ') : String(p.description),
      pricePerDay: String(p.pricePerDay),
      securityDeposit: String(p.securityDeposit),
      totalStock: String(p.totalStock),
      location: p.location,
      condition: p.condition,
      images: p.images || [],
    });
    setShowAddModal(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      pricePerDay: '500',
      securityDeposit: '2000',
      totalStock: '1',
      location: 'Mumbai',
      condition: 'Excellent',
      images: [],
    });
    setShowAddModal(true);
  };

  if (loading) return <Loading label="Loading catalog…" />;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Products & Catalog</h1>
          <p style={{ color: '#64748b' }}>Add single equipment items or bulk upload your catalog via CSV.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="button light" onClick={() => setShowCsvModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} /> Bulk CSV Import
          </button>
          <button className="button" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Add Equipment
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>{success}</div>}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Equipment Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Daily Rate</th>
              <th style={{ padding: '1rem' }}>Deposit</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!products.length ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <Package size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                  <p>No equipment listings found. Click "Add Equipment" or "Bulk CSV Import" to start.</p>
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={18} style={{ color: '#94a3b8' }} />
                        )}
                      </div>
                      <div>
                        {p.name}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{p.location} · {p.condition}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{p.category?.name || 'General'}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{money(p.pricePerDay)}/day</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{money(p.securityDeposit)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 600, color: p.availableStock > 0 ? '#10b981' : '#ef4444' }}>
                      {p.availableStock} / {p.totalStock}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: p.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9', color: p.status === 'ACTIVE' ? '#047857' : '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '0.75rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingProduct ? 'Edit Equipment Listing' : 'Add New Equipment'}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Equipment Title *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bosch Professional Rotary Hammer Drill"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Category *</label>
                    <select
                      value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Condition</label>
                    <select
                      value={form.condition}
                      onChange={e => setForm({ ...form, condition: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option>Brand New</option>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Daily Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.pricePerDay}
                      onChange={e => setForm({ ...form, pricePerDay: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Deposit (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.securityDeposit}
                      onChange={e => setForm({ ...form, securityDeposit: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Total Stock *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.totalStock}
                      onChange={e => setForm({ ...form, totalStock: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Location / City *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Mumbai West, Bandra Hub"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description & Features</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Includes battery charger, extra bit set, and heavy-duty carry case."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="button light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="button">Save Product</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {showCsvModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} style={{ color: 'var(--color-primary)' }} /> Bulk CSV Equipment Upload
              </h2>
              <button onClick={() => setShowCsvModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Paste comma-separated rows below or load our sample template.
              Format: <code>name, categorySlug, pricePerDay, securityDeposit, totalStock, location, condition, description</code>
            </p>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="button light"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                onClick={() => {
                  setCsvText(
                    `name,categorySlug,pricePerDay,securityDeposit,totalStock,location,condition,description\n` +
                    `Dewalt 20V Cordless Drill,power-tools,350,1500,4,Mumbai,Excellent,Compact brushless drill with 2 batteries\n` +
                    `Sony FX3 Cinema Camera,cameras-production,3800,15000,2,Mumbai,Brand New,Full frame cinema camera 4K 120p\n` +
                    `Pioneer DDJ-FLX6 Controller,dj-electronic,1800,8000,3,Mumbai,Excellent,4-channel DJ performance controller\n` +
                    `Karcher K5 Pressure Washer,home-cleaning,850,3000,5,Mumbai,Good,High pressure 145 bar surface cleaner`
                  );
                }}
              >
                Insert Sample Template Data
              </button>
            </div>

            <form onSubmit={handleCsvImport}>
              <textarea
                rows={8}
                required
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="name,categorySlug,pricePerDay,securityDeposit,totalStock,location,condition,description..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="button light" onClick={() => setShowCsvModal(false)}>Cancel</button>
                <button type="submit" disabled={uploading} className="button">
                  {uploading ? <><Loader2 className="spin" size={16} /> Importing…</> : 'Import CSV Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
