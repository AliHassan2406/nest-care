import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient';
import { getCurrentUser } from '../utils/auth';

const issueTypes = ['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Other'];

export default function RequestForm() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [form, setForm] = useState({
    type: 'Electrical', location: '', description: '', appointmentDate: '', preferredTime: 'Any time', priority: 'Standard',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const minDate = useMemo(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.location.trim() || !form.description.trim()) {
      setError('Add the service location and a short description so the team knows what to expect.');
      return;
    }
    if (form.appointmentDate && form.appointmentDate < minDate) {
      setError('Choose today or a future date for your preferred appointment.');
      return;
    }
    setBusy(true);
    try {
      const result = await api.request('/api/requests', {
        method: 'POST',
        body: { ...form, location: form.location.trim(), description: form.description.trim() },
        token: localStorage.getItem('authToken'),
      });
      setSuccess(`Your request ${result.request.id} has been submitted successfully.`);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (submitError) {
      setError(submitError.message || 'We could not submit your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl">
        <div className="mb-7"><p className="page-eyebrow">LET’S GET IT SORTED</p><h1 className="page-title">Book a home service.</h1><p className="page-lede">Share a few details. Your request will be saved to your workspace so you can follow it all the way through.</p></div>
        <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
          <form onSubmit={handleSubmit} className="app-panel p-5 sm:p-8">
            {error && <div role="alert" className="notice-error mb-5 rounded-xl px-4 py-3 text-sm">{error}</div>}
            {success && <div role="status" className="notice-success mb-5 rounded-xl px-4 py-3 text-sm">{success}</div>}
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><h2 className="text-lg font-extrabold text-slate-800">Tell us about the job</h2><p className="mt-1 text-xs text-slate-500">Fields marked with * are required.</p></div><span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800">NEW REQUEST</span></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><label htmlFor="request-type" className="form-label-modern">What do you need help with? *</label><select id="request-type" name="type" value={form.type} onChange={handleChange} className="form-control-modern" required>{issueTypes.map((type) => <option value={type} key={type}>{type === 'Other' ? 'General maintenance' : type}</option>)}</select></div>
              <div className="sm:col-span-2"><label htmlFor="request-location" className="form-label-modern">Service address / area *</label><input id="request-location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. House 12, Street 4, Satellite Town" className="form-control-modern" required maxLength={180} /></div>
              <div><label htmlFor="request-date" className="form-label-modern">Preferred date</label><input id="request-date" name="appointmentDate" type="date" min={minDate} value={form.appointmentDate} onChange={handleChange} className="form-control-modern" /><p className="mt-1.5 text-[10px] text-slate-400">Optional — helps the team plan ahead.</p></div>
              <div><label htmlFor="request-time" className="form-label-modern">Preferred time</label><select id="request-time" name="preferredTime" value={form.preferredTime} onChange={handleChange} className="form-control-modern"><option>Any time</option><option>Morning · 8 AM–12 PM</option><option>Afternoon · 12–4 PM</option><option>Evening · 4–8 PM</option></select></div>
              <div className="sm:col-span-2"><label htmlFor="request-description" className="form-label-modern">Describe what’s happening *</label><textarea id="request-description" name="description" value={form.description} onChange={handleChange} placeholder="Tell us what needs fixing, when it started, and anything else that could help…" rows={5} maxLength={2000} className="form-control-modern !min-h-32 resize-y" required /><div className="mt-1 text-right text-[10px] text-slate-400">{form.description.length}/2000</div></div>
              <div className="sm:col-span-2"><span className="form-label-modern">How urgent is it?</span><div className="grid grid-cols-2 gap-3"><label className={`priority-choice ${form.priority === 'Standard' ? 'priority-choice-active' : ''}`}><input type="radio" name="priority" value="Standard" checked={form.priority === 'Standard'} onChange={handleChange} /><span className="priority-symbol">◷</span><span><strong>Standard</strong><small>Regular request</small></span></label><label className={`priority-choice ${form.priority === 'Urgent' ? 'priority-choice-urgent' : ''}`}><input type="radio" name="priority" value="Urgent" checked={form.priority === 'Urgent'} onChange={handleChange} /><span className="priority-symbol">!</span><span><strong>Urgent</strong><small>Needs attention soon</small></span></label></div></div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"><Link to="/dashboard" className="text-center text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</Link><button type="submit" disabled={busy} className="button-primary min-w-48 disabled:cursor-wait disabled:opacity-60">{busy ? 'Submitting request…' : 'Submit request'} <span>↗</span></button></div>
          </form>

          <aside className="space-y-4">
            <div className="app-panel p-5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">✦</div><h3 className="mt-4 font-extrabold text-slate-800">What happens next?</h3><div className="mt-4 space-y-4">{[{n:'01',title:'We receive it',text:'Your request appears in your workspace.'},{n:'02',title:'The team reviews it',text:'A matching service team can see the job details.'},{n:'03',title:'You follow progress',text:'Updates appear as the status changes.'}].map((step) => <div className="flex gap-3" key={step.n}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-extrabold text-emerald-800">{step.n}</span><div><p className="text-xs font-extrabold text-slate-700">{step.title}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{step.text}</p></div></div>)}</div></div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><span className="text-lg">ⓘ</span><h3 className="mt-2 text-sm font-extrabold text-amber-900">An important note</h3><p className="mt-2 text-xs leading-6 text-amber-800">Please don’t use this form for immediate danger or emergencies. Contact the appropriate local emergency service instead.</p></div>
            <div className="text-[10px] leading-5 text-slate-400">Booking as <strong className="text-slate-600">{currentUser?.name || 'NestCare customer'}</strong>. Your contact information comes from your account.</div>
          </aside>
        </div>
      </div>
      <style>{`.priority-choice{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid #e3ebe3;border-radius:13px;cursor:pointer;background:#fff;transition:all .15s}.priority-choice input{accent-color:#187254}.priority-choice-active{border-color:#9dc9a4;background:#f2f8ed;box-shadow:0 0 0 2px rgba(95,163,106,.08)}.priority-choice-urgent{border-color:#e5a293;background:#fff4f1;box-shadow:0 0 0 2px rgba(214,100,75,.06)}.priority-symbol{display:flex;align-items:center;justify-content:center;width:29px;height:29px;border-radius:10px;background:#e7f1e1;color:#3b7e53;font-weight:900}.priority-choice-urgent .priority-symbol{background:#ffe3dd;color:#b94f3d}.priority-choice strong{display:block;color:#3c5848;font-size:11px}.priority-choice small{display:block;margin-top:3px;color:#96a199;font-size:9px}`}</style>
    </div>
  );
}
