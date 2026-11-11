import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    if (Object.values(form).some((value) => !value.trim())) return setError('Please complete every field.');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    try {
      await registerUser(form);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (registrationError) {
      setError(registrationError.message || 'We could not create the account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell"><div className="auth-layout">
      <aside className="auth-aside"><div className="auth-aside-content"><Link to="/" className="brand-lockup"><span className="brand-mark"><span>n</span><i /></span><span className="brand-copy"><strong>NestCare</strong><small>HOME SERVICES, MADE SIMPLE</small></span></Link><h1>A little help can make <em>home feel better.</em></h1><p>Make a request when something needs attention. We’ll keep your details and updates organised for you.</p><div className="auth-benefits"><div className="auth-benefit"><span>✓</span> Free customer account</div><div className="auth-benefit"><span>✓</span> Request and status history</div><div className="auth-benefit"><span>✓</span> Notifications when things change</div></div></div><div className="auth-aside-foot">YOUR HOME. YOUR TIME. YOUR PEACE.</div></aside>
      <section className="auth-form-panel"><p className="page-eyebrow">LET’S GET YOU SET UP</p><h2 className="mt-2">Create your account</h2><p className="auth-form-subtitle">A few details now, smoother home care later.</p>
        {error && <div role="alert" className="notice-error mt-5 rounded-xl px-4 py-3 text-xs">{error}</div>}
        <form onSubmit={handleRegister} className="auth-form">
          <div><label className="form-label-modern" htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" value={form.name} onChange={change} placeholder="e.g. Ali Hassan" className="form-control-modern" /></div>
          <div><label className="form-label-modern" htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@example.com" className="form-control-modern" /></div>
          <div><label className="form-label-modern" htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={change} placeholder="03xx xxxxxxx" className="form-control-modern" /></div>
          <div><label className="form-label-modern" htmlFor="username">Choose a username</label><input id="username" name="username" autoComplete="username" value={form.username} onChange={change} placeholder="Something easy to remember" className="form-control-modern" /></div>
          <div><label className="form-label-modern" htmlFor="password">Create a password</label><input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} placeholder="At least 8 characters" className="form-control-modern" minLength={8} /><p className="mt-1.5 text-[10px] text-slate-400">Your password is hashed by the authentication service.</p></div>
          <button type="submit" disabled={busy} className="button-primary mt-1 w-full !rounded-xl !py-3.5 disabled:opacity-60">{busy ? 'Creating account…' : 'Create account'} <span>↗</span></button>
        </form>
        <div className="mt-5 text-center text-xs text-slate-500">Already have an account? <Link to="/login" className="font-extrabold text-emerald-800 hover:text-emerald-950">Sign in</Link></div>
        <p className="auth-footnote mt-5">By creating an account, you agree to use NestCare respectfully and provide accurate service-request details.</p>
      </section>
    </div></div>
  );
}
