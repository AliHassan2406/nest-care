import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../utils/auth';

const itemBase = 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const links = currentUser ? [
    { to: '/dashboard', label: 'Overview', icon: '⌂' },
    ...(currentUser.role === 'User' ? [
      { to: '/services', label: 'Find a pro', icon: '✳' },
      { to: '/submit', label: 'Book a service', icon: '+' },
    ] : []),
    ...(currentUser.role === 'Worker' ? [{ to: '/my-requests', label: 'My jobs', icon: '▤' }] : []),
    ...(currentUser.role === 'Admin' ? [
      { to: '/admin-requests', label: 'Requests', icon: '▤' },
      { to: '/admin-workers', label: 'Team', icon: '♧' },
    ] : []),
  ] : [
    { to: '/', label: 'Home', icon: '⌂' },
    { to: '/services', label: 'Our services', icon: '✳' },
  ];

  const handleLogout = () => {
    logoutUser();
    setShowMenu(false);
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={currentUser ? '/dashboard' : '/'} className="brand-lockup" aria-label="NestCare home">
          <span className="brand-mark"><span>n</span><i /></span>
          <span className="brand-copy"><strong>NestCare</strong><small>HOME SERVICES, MADE SIMPLE</small></span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={`${itemBase} ${isActive(link.to) ? 'nav-item-active' : 'nav-item'}`}>
              <span className="nav-item-icon">{link.icon}</span>{link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <div className="relative">
              <button onClick={() => setShowMenu((value) => !value)} className="profile-trigger" aria-expanded={showMenu}>
                <span className="avatar-bubble">{(currentUser.name || 'N').trim().charAt(0).toUpperCase()}</span>
                <span className="max-w-32 text-left"><strong className="block truncate text-sm">{currentUser.name}</strong><small className="block text-xs text-slate-500">{currentUser.role}</small></span>
                <span className="text-xs text-slate-400">⌄</span>
              </button>
              {showMenu && (
                <div className="profile-menu">
                  <div className="border-b border-slate-100 px-4 py-3"><p className="text-sm font-bold text-slate-800">{currentUser.name}</p><p className="mt-1 text-xs text-slate-500">{currentUser.email}</p></div>
                  <Link to="/dashboard" onClick={() => setShowMenu(false)} className="profile-menu-link">My workspace <span>↗</span></Link>
                  <button onClick={handleLogout} className="profile-menu-link w-full text-left text-rose-600">Sign out <span>⇥</span></button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">Sign in</Link>
              <Link to="/register" className="button-primary !px-5 !py-2.5">Get started <span>↗</span></Link>
            </>
          )}
        </div>

        <button className="mobile-menu-button lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
          <span>{mobileOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-nav lg:hidden">
          {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`${itemBase} ${isActive(link.to) ? 'nav-item-active' : 'nav-item'}`}>{link.icon} {link.label}</Link>)}
          {currentUser ? <button onClick={handleLogout} className="mobile-signout">Sign out ↗</button> : <div className="grid grid-cols-2 gap-3"><Link to="/login" onClick={() => setMobileOpen(false)} className="button-secondary">Sign in</Link><Link to="/register" onClick={() => setMobileOpen(false)} className="button-primary">Get started ↗</Link></div>}
        </div>
      )}
    </header>
  );
}
