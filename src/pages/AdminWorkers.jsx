import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/apiClient';

const emptyForm = {
  username: '', password: '', name: '', email: '', phone: '',
  specialization: 'Electrical', experience: '', rating: 4.8,
};
const specializations = ['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Other'];
const token = () => localStorage.getItem('authToken');

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadWorkers = useCallback(async () => {
    try {
      setError('');
      const result = await api.request('/api/users', { token: token() });
      setWorkers((result.users || []).filter((user) => user.role === 'Worker'));
    } catch (loadError) {
      setError(loadError.message || 'Could not load the worker directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkers(); }, [loadWorkers]);

  const filteredWorkers = useMemo(() => workers.filter((worker) => {
    const term = search.trim().toLowerCase();
    const searchMatches = !term || [worker.name, worker.username, worker.email, worker.phone, worker.specialization].some((value) => String(value || '').toLowerCase().includes(term));
    return searchMatches && (specializationFilter === 'All' || worker.specialization === specializationFilter);
  }), [workers, search, specializationFilter]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingWorker(null);
    setShowForm(false);
  };

  const startEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({ username: worker.username || '', password: '', name: worker.name || '', email: worker.email || '', phone: worker.phone || '', specialization: worker.specialization || 'Other', experience: worker.experience || '', rating: worker.rating ?? 4.8 });
    setShowForm(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Name, email and phone are required.');
      return;
    }
    if (!editingWorker && (!formData.username.trim() || !formData.password)) {
      setError('A username and password are required for a new worker.');
      return;
    }
    if (!editingWorker && formData.password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    const payload = {
      name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(),
      specialization: formData.specialization, experience: formData.experience.trim() || 'New professional',
      rating: Number(formData.rating), role: 'Worker',
    };
    if (!editingWorker) {
      payload.username = formData.username.trim();
      payload.password = formData.password;
    } else if (formData.password.trim()) {
      if (formData.password.length < 8) {
        setError('Use a password with at least 8 characters, or leave it blank to keep the existing password.');
        return;
      }
      payload.password = formData.password;
    }

    setSaving(true);
    try {
      if (editingWorker) {
        await api.request(`/api/users/${editingWorker.id}`, { method: 'PATCH', body: payload, token: token() });
        setSuccess('Worker profile updated successfully.');
      } else {
        await api.request('/api/users', { method: 'POST', body: payload, token: token() });
        setSuccess('Worker added to your team.');
      }
      resetForm();
      await loadWorkers();
    } catch (saveError) {
      setError(saveError.message || 'Could not save this worker. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (worker) => {
    if (!window.confirm(`Remove ${worker.name} from the team? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await api.request(`/api/users/${worker.id}`, { method: 'DELETE', token: token() });
      setSuccess(`${worker.name} was removed from the team.`);
      await loadWorkers();
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove this worker.');
    }
  };

  const counts = specializations.map((type) => ({ type, count: workers.filter((worker) => worker.specialization === type).length }));

  return (
    <div className="page-shell"><div className="page-container">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="page-eyebrow">TEAM OPERATIONS</p><h1 className="page-title">People who keep homes running.</h1><p className="page-lede">Add professionals, keep their details current and find the right specialist quickly.</p></div><button onClick={() => { setShowForm((value) => !value); setEditingWorker(null); setFormData(emptyForm); setError(''); setSuccess(''); }} className="button-primary w-fit">{showForm && !editingWorker ? '× Close form' : '+ Add a worker'}</button></div>

      {error && <div role="alert" className="notice-error mt-5 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div role="status" className="notice-success mt-5 rounded-xl px-4 py-3 text-sm">{success}</div>}

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="team-metric team-metric-main"><span className="team-metric-icon">♧</span><span className="team-metric-label">TOTAL PROFESSIONALS</span><strong>{workers.length}</strong><small>Registered worker profiles</small></div>{counts.map((item) => <div className="team-metric" key={item.type}><span className="team-metric-label">{item.type.toUpperCase()}</span><strong>{item.count}</strong><small>{item.count === 1 ? 'professional' : 'professionals'}</small></div>)}</div>

      {showForm && <section className="app-panel mt-6 p-5 sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="page-eyebrow">{editingWorker ? 'UPDATE PROFILE' : 'BUILD YOUR TEAM'}</p><h2 className="mt-1 text-xl font-extrabold text-slate-800">{editingWorker ? `Edit ${editingWorker.name}` : 'Add a new professional'}</h2><p className="mt-1 text-xs text-slate-500">Worker accounts can sign in and access matching service requests.</p></div><span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800">TEAM MEMBER</span></div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label htmlFor="worker-name" className="form-label-modern">Full name *</label><input id="worker-name" name="name" value={formData.name} onChange={handleChange} className="form-control-modern" placeholder="Professional's name" required /></div>
          <div><label htmlFor="worker-email" className="form-label-modern">Email address *</label><input id="worker-email" name="email" type="email" value={formData.email} onChange={handleChange} className="form-control-modern" placeholder="name@example.com" required /></div>
          <div><label htmlFor="worker-phone" className="form-label-modern">Phone *</label><input id="worker-phone" name="phone" value={formData.phone} onChange={handleChange} className="form-control-modern" placeholder="03xx xxxxxxx" required /></div>
          <div><label htmlFor="worker-username" className="form-label-modern">Username *</label><input id="worker-username" name="username" value={formData.username} onChange={handleChange} className="form-control-modern" placeholder="Unique sign-in name" required disabled={Boolean(editingWorker)} /></div>
          <div><label htmlFor="worker-password" className="form-label-modern">{editingWorker ? 'New password (optional)' : 'Initial password *'}</label><input id="worker-password" name="password" value={formData.password} onChange={handleChange} type="password" className="form-control-modern" placeholder={editingWorker ? 'Leave blank to keep current' : 'At least 8 characters'} required={!editingWorker} minLength={editingWorker ? undefined : 8} /></div>
          <div><label htmlFor="worker-specialization" className="form-label-modern">Specialisation *</label><select id="worker-specialization" name="specialization" value={formData.specialization} onChange={handleChange} className="form-control-modern">{specializations.map((type) => <option key={type}>{type}</option>)}</select></div>
          <div><label htmlFor="worker-experience" className="form-label-modern">Experience</label><input id="worker-experience" name="experience" value={formData.experience} onChange={handleChange} className="form-control-modern" placeholder="e.g. 5 years" /></div>
          <div><label htmlFor="worker-rating" className="form-label-modern">Display rating</label><input id="worker-rating" name="rating" type="number" min="1" max="5" step="0.1" value={formData.rating} onChange={handleChange} className="form-control-modern" /></div>
          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3"><button type="submit" disabled={saving} className="button-primary disabled:opacity-60">{saving ? 'Saving…' : editingWorker ? 'Save changes' : 'Add professional'} <span>↗</span></button><button type="button" onClick={resetForm} className="button-secondary">Cancel</button></div>
        </form>
      </section>}

      <section className="mt-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="page-eyebrow">THE TEAM DIRECTORY</p><h2 className="mt-1 text-xl font-extrabold text-slate-800">Your professionals <span className="ml-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{filteredWorkers.length}</span></h2></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><input aria-label="Search workers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, username..." className="form-control-modern !min-h-10 !bg-white sm:w-64" /><select aria-label="Filter by specialisation" value={specializationFilter} onChange={(event) => setSpecializationFilter(event.target.value)} className="form-control-modern !min-h-10 !bg-white sm:w-44"><option value="All">All specialisations</option>{specializations.map((type) => <option key={type}>{type}</option>)}</select></div></div>
        {loading ? <div className="app-panel mt-5 p-10 text-center text-sm text-slate-500">Loading team directory…</div> : filteredWorkers.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredWorkers.map((worker) => <article key={worker.id} className="team-member-card"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="team-avatar">{String(worker.name || 'P').trim().charAt(0).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-extrabold text-slate-800">{worker.name}</h3><p className="mt-1 truncate text-[10px] font-semibold text-slate-400">@{worker.username}</p></div></div><span className="team-rating">★ {worker.rating ?? '4.8'}</span></div><div className="mt-4"><span className={`specialty-pill specialty-${(worker.specialization || 'other').toLowerCase()}`}>{worker.specialization || 'Other'}</span></div><div className="team-contact-list"><div><span>EMAIL</span><strong>{worker.email || '—'}</strong></div><div><span>PHONE</span><strong>{worker.phone || '—'}</strong></div><div><span>EXPERIENCE</span><strong>{worker.experience || 'Not specified'}</strong></div></div><div className="mt-4 flex gap-2 border-t border-slate-100 pt-4"><button onClick={() => startEdit(worker)} className="button-secondary flex-1 !rounded-xl !py-2.5">Edit profile</button><button onClick={() => handleDelete(worker)} className="remove-worker-button">Remove</button></div></article>)}</div> : <div className="app-panel mt-5 p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-xl">♧</div><h3 className="mt-3 font-extrabold text-slate-700">No workers found</h3><p className="mt-1 text-sm text-slate-500">Try another filter or add a professional to your team.</p><button onClick={() => { setSearch(''); setSpecializationFilter('All'); setShowForm(true); }} className="mt-4 text-sm font-extrabold text-emerald-700">Add a worker →</button></div>}
      </section>
      <style>{`
        .team-metric{position:relative;padding:16px;border:1px solid #e2ebe3;border-radius:16px;background:#fff;min-width:0}.team-metric-main{background:#edf7e9;border-color:#d7e8d1}.team-metric-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:11px;background:#d9eccf;color:#347448;font-size:20px}.team-metric-label{display:block;color:#93a196;font-size:8px;font-weight:900;letter-spacing:.85px}.team-metric-main .team-metric-label{margin-top:13px;color:#67886b}.team-metric strong{display:block;margin-top:9px;color:#264d3b;font-size:30px;font-weight:900;letter-spacing:-1px;line-height:1}.team-metric small{display:block;margin-top:8px;color:#9aa99d;font-size:9px}.team-member-card{min-width:0;padding:19px;border:1px solid #e3ece4;border-radius:19px;background:#fff;box-shadow:0 6px 19px rgba(25,64,45,.03);transition:transform .18s,box-shadow .18s}.team-member-card:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(25,64,45,.065)}.team-avatar{display:flex;align-items:center;justify-content:center;width:45px;height:45px;flex-shrink:0;border-radius:15px;background:#e5f2df;color:#34734c;font-size:18px;font-weight:900}.team-rating{padding:6px 8px;border-radius:9px;background:#fff5d9;color:#a17a2c;font-size:10px;font-weight:900}.specialty-pill{display:inline-flex;padding:6px 9px;border-radius:8px;background:#ecf4e7;color:#46764c;font-size:9px;font-weight:850}.specialty-electrical{background:#fff2d7;color:#9b762b}.specialty-plumbing{background:#e3f3fa;color:#447d9c}.specialty-furniture{background:#ffede1;color:#a8734e}.specialty-cleaning{background:#e5f5e8;color:#438352}.specialty-other{background:#eee9ff;color:#796ab2}.team-contact-list{display:grid;gap:11px;margin-top:17px;padding:14px;background:#fafcf9;border:1px solid #edf2eb;border-radius:13px}.team-contact-list span{display:block;color:#a1aea3;font-size:7px;font-weight:900;letter-spacing:1px}.team-contact-list strong{display:block;margin-top:4px;overflow-wrap:anywhere;color:#506657;font-size:10px;font-weight:700}.remove-worker-button{padding:9px 12px;border:1px solid #f3d8d4;border-radius:12px;background:#fff7f5;color:#b85045;font-size:10px;font-weight:800}.remove-worker-button:hover{background:#ffece8}
      `}</style>
    </div></div>
  );
}
