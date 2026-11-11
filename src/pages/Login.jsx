import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';

const demoCredentials = [
  { role: 'Administrator', username: 'admin', password: 'admin123', icon: '🛡️' },
  { role: 'Electrician', username: 'worker', password: 'worker123', icon: '⚡' },
  { role: 'Plumber', username: 'plumber', password: 'worker123', icon: '🚿' },
  { role: 'Customer', username: 'user', password: 'user123', icon: '🏡' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter both your username and password to continue.');
      return;
    }
    setBusy(true);
    const user = await loginUser(username, password);
    setBusy(false);
    if (user) navigate('/dashboard', { replace: true });
    else setError('We couldn’t sign you in with those details. Check them and try again.');
  };

  const chooseDemo = (credentials) => {
    setUsername(credentials.username);
    setPassword(credentials.password);
    setError('');
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-aside"><div className="auth-aside-content"><Link to="/" className="brand-lockup"><span className="brand-mark"><span>n</span><i /></span><span className="brand-copy"><strong>NestCare</strong><small>HOME SERVICES, MADE SIMPLE</small></span></Link><h1>Make room for <em>peace of mind.</em></h1><p>Your home-care requests, trusted professionals and progress updates — organised in one calm, simple workspace.</p><div className="auth-benefits"><div className="auth-benefit"><span>✓</span> Keep every request in one place</div><div className="auth-benefit"><span>✓</span> See updates as work progresses</div><div className="auth-benefit"><span>✓</span> Connect with the right service team</div></div></div><div className="auth-aside-foot">HOME CARE, WITH A LITTLE MORE CARE.</div></aside>
        <section className="auth-form-panel"><p className="page-eyebrow">WELCOME BACK</p><h2 className="mt-2">Sign in to NestCare</h2><p className="auth-form-subtitle">Pick up where you left off. Your home workspace is waiting.</p>
          {location.state?.registered && <div role="status" className="notice-success mt-5 rounded-xl px-4 py-3 text-xs">Your account is ready. Sign in to get started.</div>}
          {error && <div role="alert" className="notice-error mt-5 rounded-xl px-4 py-3 text-xs">{error}</div>}
          <form onSubmit={handleLogin} className="auth-form"><div><label className="form-label-modern" htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" className="form-control-modern" /></div><div><div className="mb-2 flex items-center justify-between gap-3"><label className="form-label-modern !mb-0" htmlFor="password">Password</label><span className="text-[10px] font-semibold text-slate-400">At least 8 characters for new accounts</span></div><input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="form-control-modern" /></div><button type="submit" disabled={busy} className="button-primary mt-1 w-full !rounded-xl !py-3.5 disabled:opacity-60">{busy ? 'Signing you in…' : 'Sign in'} <span>↗</span></button></form>
          <div className="mt-5 text-center text-xs text-slate-500">New to NestCare? <Link to="/register" className="font-extrabold text-emerald-800 hover:text-emerald-950">Create an account</Link></div>
          <div className="auth-divider">DEMO ACCOUNTS FOR LOCAL TESTING</div>
          <div className="auth-demo-list">{demoCredentials.map((credential) => <button type="button" key={credential.username} onClick={() => chooseDemo(credential)} className="auth-demo-button"><span className="auth-demo-icon">{credential.icon}</span><span><strong>{credential.role}</strong><small>{credential.username} · click to fill</small></span></button>)}</div>
          <p className="auth-footnote mt-4">Demo passwords are for local development only. Change them before deploying this project publicly.</p>
        </section>
      </div>
    </div>
  );
}
