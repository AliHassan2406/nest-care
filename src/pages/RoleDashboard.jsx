import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { api } from '../utils/apiClient';

const token = () => localStorage.getItem('authToken');
const roleCopy = {
  Admin: { label: 'ADMIN WORKSPACE', title: 'Your overview, at a glance.', subtitle: 'Keep requests moving and your service team organised.', accent: 'admin' },
  Worker: { label: 'PROFESSIONAL WORKSPACE', title: 'Good work starts here.', subtitle: 'See the jobs that match your skills and keep statuses current.', accent: 'worker' },
  User: { label: 'YOUR HOME WORKSPACE', title: 'A little less to worry about.', subtitle: 'Track your requests, check updates and plan the next home fix.', accent: 'customer' },
};
const statusTone = (status) => status === 'Completed' ? 'status-completed' : status === 'In Progress' ? 'status-progress' : 'status-pending';
const formatDate = (value) => {
  if (!value) return 'Date not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function RoleDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const copy = roleCopy[currentUser?.role] || roleCopy.User;
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamSize, setTeamSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const authToken = token();
      const requestResult = await api.request('/api/requests', { token: authToken });
      setRequests(requestResult.requests || []);
      try {
        const notificationResult = await api.request('/api/notifications', { token: authToken });
        setNotifications(notificationResult.notifications || []);
        setUnreadCount(notificationResult.unreadCount || 0);
      } catch (notificationError) {
        console.warn('[dashboard] Could not load notifications:', notificationError.message);
      }
      if (currentUser.role === 'Admin') {
        const userResult = await api.request('/api/users', { token: authToken });
        setTeamSize((userResult.users || []).filter((user) => user.role === 'Worker').length);
      }
    } catch (loadError) {
      setError(loadError.message || 'We could not load your workspace.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    loadDashboard();
  }, [currentUser?.id, navigate, loadDashboard]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => request.status === 'Pending').length,
    inProgress: requests.filter((request) => request.status === 'In Progress').length,
    completed: requests.filter((request) => request.status === 'Completed').length,
  }), [requests]);

  if (!currentUser) return null;

  const routeRequests = currentUser.role === 'Admin' ? '/admin-requests' : currentUser.role === 'Worker' ? '/my-requests' : '/requests';
  const quickActions = currentUser.role === 'Admin' ? [
    { icon: '▤', title: 'Manage requests', text: 'Review new jobs, update progress and remove old entries.', to: '/admin-requests', button: 'Open request desk', tone: 'action-green' },
    { icon: '♧', title: 'Manage your team', text: 'Add professionals, update profiles or change specialisations.', to: '/admin-workers', button: 'Open team directory', tone: 'action-violet' },
  ] : currentUser.role === 'Worker' ? [
    { icon: '🧰', title: 'Your job queue', text: 'Open the requests matched to your specialisation.', to: '/my-requests', button: 'View my jobs', tone: 'action-orange' },
  ] : [
    { icon: '＋', title: 'Book a home service', text: 'Describe the issue, choose a preferred date and mark its urgency.', to: '/submit', button: 'Create a request', tone: 'action-green' },
    { icon: '✳', title: 'Find a professional', text: 'Explore the service directory and connect with the right person.', to: '/services', button: 'Browse services', tone: 'action-violet' },
  ];

  const markRead = async (notification) => {
    if (notification.read) return;
    try {
      await api.request(`/api/notifications/${notification.id}/read`, { method: 'PATCH', token: token() });
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (markError) {
      setError(markError.message || 'Could not mark the notification as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.request('/api/notifications/read-all', { method: 'PATCH', token: token() });
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (markError) {
      setError(markError.message || 'Could not update notifications.');
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <section className={`dashboard-welcome dashboard-welcome-${copy.accent}`}><div className="dashboard-welcome-pattern" /><div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="dashboard-eyebrow">{copy.label}</p><h1>{copy.title}</h1><p>{copy.subtitle}</p><div className="mt-5 flex flex-wrap items-center gap-2"><span className="welcome-chip"><span className="welcome-online-dot" /> Signed in as {currentUser.role}</span>{currentUser.role === 'Worker' && <span className="welcome-chip">✳ {currentUser.specialization || 'General maintenance'}</span>}</div></div><div className="welcome-shortcut"><span>✦</span><div><strong>Welcome back, {currentUser.name?.split(' ')[0] || 'there'}.</strong><small>{currentUser.role === 'Admin' ? `${teamSize} professionals in your team` : currentUser.role === 'Worker' ? 'Your next task starts here' : 'Let’s make home care easier'}</small></div></div></div></section>

        {error && <div role="alert" className="notice-error mt-5 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <section className="dashboard-stat-grid mt-6" aria-label="Request statistics">
          <div className="dashboard-stat"><div className="stat-top"><span className="stat-icon stat-icon-total">▤</span><span className="stat-trend">ALL TIME</span></div><p className="stat-label">{currentUser.role === 'Worker' ? 'Matching jobs' : 'Total requests'}</p><p className="stat-number">{loading ? '—' : stats.total}</p><p className="stat-foot">{currentUser.role === 'User' ? 'Across your home-care history' : 'Visible in your workspace'}</p></div>
          <div className="dashboard-stat"><div className="stat-top"><span className="stat-icon stat-icon-pending">◷</span><span className="stat-trend">NEEDS ACTION</span></div><p className="stat-label">Pending</p><p className="stat-number">{loading ? '—' : stats.pending}</p><p className="stat-foot">Waiting for the next step</p></div>
          <div className="dashboard-stat"><div className="stat-top"><span className="stat-icon stat-icon-progress">↗</span><span className="stat-trend">IN MOTION</span></div><p className="stat-label">In progress</p><p className="stat-number">{loading ? '—' : stats.inProgress}</p><p className="stat-foot">Work that is underway</p></div>
          <div className="dashboard-stat"><div className="stat-top"><span className="stat-icon stat-icon-done">✓</span><span className="stat-trend">FINISHED</span></div><p className="stat-label">Completed</p><p className="stat-number">{loading ? '—' : stats.completed}</p><p className="stat-foot">Successfully wrapped up</p></div>
        </section>

        <section className="mt-9"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="page-eyebrow">THE NEXT STEP</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#264739]">Make it happen.</h2></div></div><div className="grid gap-4 md:grid-cols-2">{quickActions.map((action) => <article key={action.to} className="dashboard-action-card"><div className={`dashboard-action-icon ${action.tone}`}>{action.icon}</div><h3>{action.title}</h3><p>{action.text}</p><Link to={action.to} className="dashboard-action-link">{action.button} <span>↗</span></Link></article>)}</div></section>

        <div className="mt-9 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <section className="app-panel min-w-0 overflow-hidden"><div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="page-eyebrow">RECENT ACTIVITY</p><h2 className="mt-1 text-lg font-extrabold text-slate-800">Latest requests</h2></div><Link to={routeRequests} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900">View all ↗</Link></div>
            {loading ? <div className="p-8 text-sm text-slate-500">Loading your request activity…</div> : requests.length ? <div className="divide-y divide-slate-100">{[...requests].sort((a,b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || ''))).slice(0,5).map((request) => <div key={request.id} className="recent-request-row"><div className="recent-request-icon">{request.type === 'Electrical' ? '⚡' : request.type === 'Plumbing' ? '🚿' : request.type === 'Furniture' ? '🪑' : request.type === 'Cleaning' ? '✨' : '🧰'}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong>{request.type || 'Home service'}</strong><span className={`status-pill-modern ${statusTone(request.status)}`}>{request.status}</span>{request.priority === 'Urgent' && <span className="urgent-pill">URGENT</span>}</div><p className="mt-1 truncate text-xs text-slate-500">{request.location} · {request.id}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(request.createdAt || request.date)}{request.appointmentDate ? ` · Preferred ${formatDate(request.appointmentDate)}` : ''}</p></div><span className="text-slate-300">→</span></div>)}</div> : <div className="px-6 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">＋</div><h3 className="mt-3 text-sm font-extrabold text-slate-700">Your next request starts here</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">Once you submit a service request, its status and updates will appear in this list.</p>{currentUser.role === 'User' && <Link to="/submit" className="mt-4 inline-flex text-xs font-extrabold text-emerald-700">Create a request →</Link>}</div>}
          </section>

          <section className="app-panel min-w-0 overflow-hidden"><div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-5"><div><p className="page-eyebrow">STAY IN THE LOOP</p><h2 className="mt-1 text-lg font-extrabold text-slate-800">Notifications <span className="notification-count">{unreadCount}</span></h2></div>{unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900">Mark all read</button>}</div>
            {notifications.length ? <div className="divide-y divide-slate-100">{notifications.slice(0,5).map((notification) => <button onClick={() => markRead(notification)} key={notification.id} className={`notification-row ${notification.read ? '' : 'notification-unread'}`}><span className={`notification-dot ${notification.read ? 'read' : ''}`} /><span className="min-w-0 flex-1 text-left"><strong>{notification.title}</strong><small>{notification.message}</small><em>{formatDate(notification.createdAt)}</em></span>{!notification.read && <span className="notification-new">NEW</span>}</button>)}</div> : <div className="px-6 py-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lg">✧</div><h3 className="mt-3 text-sm font-extrabold text-slate-700">All quiet for now</h3><p className="mt-1 text-xs leading-5 text-slate-500">Updates about request submissions and status changes will appear here.</p></div>}
          </section>
        </div>
        {currentUser.role === 'Admin' && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3ece0] bg-[#f0f7ec] px-5 py-4"><div><p className="text-sm font-extrabold text-[#315d43]">Operations at a glance</p><p className="mt-1 text-xs text-[#79907e]">You currently have {teamSize} worker profiles registered in the system.</p></div><Link to="/admin-workers" className="text-xs font-extrabold text-emerald-800">Manage team →</Link></div>}
      </div>
      <style>{`
        .dashboard-welcome{position:relative;overflow:hidden;padding:29px;border-radius:24px;background:linear-gradient(120deg,#173f34,#1d654b);color:white;box-shadow:0 20px 40px rgba(22,69,49,.11)}
        .dashboard-welcome-admin{background:linear-gradient(120deg,#223e36,#345f4b)}.dashboard-welcome-worker{background:linear-gradient(120deg,#3d4b35,#6d7e43)}.dashboard-welcome-pattern{position:absolute;width:370px;height:370px;right:-60px;top:-245px;border:1px solid rgba(229,250,211,.15);border-radius:50%;box-shadow:0 0 0 38px rgba(229,250,211,.025),0 0 0 82px rgba(229,250,211,.025)}
        .dashboard-eyebrow{color:#c0e4b3;font-size:9px;font-weight:900;letter-spacing:1.8px}.dashboard-welcome h1{margin-top:11px;color:#f6fff2;font-size:clamp(25px,3.6vw,38px);font-weight:850;letter-spacing:-1.2px;line-height:1.12}.dashboard-welcome p:not(.dashboard-eyebrow){margin-top:10px;color:#c3d9ca;font-size:12px;line-height:1.7}.welcome-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);color:#e3f0e5;font-size:9px;font-weight:700}.welcome-online-dot{width:6px;height:6px;background:#a6dc86;border-radius:50%;box-shadow:0 0 0 3px rgba(166,220,134,.13)}.welcome-shortcut{display:flex;align-items:center;gap:11px;padding:13px 15px;border:1px solid rgba(255,255,255,.14);border-radius:15px;background:rgba(255,255,255,.08);min-width:225px}.welcome-shortcut>span{display:flex;align-items:center;justify-content:center;width:35px;height:35px;border-radius:12px;background:rgba(215,245,165,.14);color:#d5f2aa;font-size:20px}.welcome-shortcut strong{display:block;color:#fff;font-size:11px}.welcome-shortcut small{display:block;margin-top:4px;color:#bdd7c5;font-size:9px}
        .dashboard-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.dashboard-stat{padding:18px;border:1px solid #e4ece4;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(25,64,45,.025)}.stat-top{display:flex;align-items:center;justify-content:space-between;gap:7px}.stat-icon{display:flex;align-items:center;justify-content:center;width:35px;height:35px;border-radius:12px;font-size:16px;font-weight:900}.stat-icon-total{background:#e7f0ff;color:#4d74ad}.stat-icon-pending{background:#fff4d8;color:#af842d}.stat-icon-progress{background:#e6f3f5;color:#438a97}.stat-icon-done{background:#e5f4df;color:#468852}.stat-trend{color:#a2ada3;font-size:7px;font-weight:900;letter-spacing:.75px}.stat-label{margin-top:15px;color:#74867b;font-size:11px;font-weight:700}.stat-number{margin-top:3px;color:#234638;font-size:34px;font-weight:850;letter-spacing:-1.5px;line-height:1.1}.stat-foot{margin-top:9px;color:#a0aca2;font-size:9px}
        .dashboard-action-card{padding:21px;border:1px solid #e3ebe4;border-radius:19px;background:#fff;box-shadow:0 5px 18px rgba(25,64,45,.025);transition:transform .2s,box-shadow .2s}.dashboard-action-card:hover{transform:translateY(-3px);box-shadow:0 15px 30px rgba(25,64,45,.07)}.dashboard-action-icon{display:flex;align-items:center;justify-content:center;width:45px;height:45px;border-radius:15px;font-size:22px}.action-green{background:#e3f4e0;color:#2d7b4a}.action-violet{background:#eee9ff;color:#7a69b0}.action-orange{background:#ffeddf;color:#b9793f}.dashboard-action-card h3{margin-top:16px;color:#2c493b;font-size:16px;font-weight:850}.dashboard-action-card p{margin-top:7px;max-width:480px;color:#829087;font-size:11px;line-height:1.7}.dashboard-action-link{display:inline-flex;align-items:center;gap:9px;margin-top:18px;color:#25724e;font-size:11px;font-weight:850}
        .recent-request-row{display:flex;align-items:center;gap:13px;padding:15px 20px}.recent-request-icon{display:flex;align-items:center;justify-content:center;width:39px;height:39px;flex-shrink:0;border-radius:13px;background:#f0f6eb;font-size:18px}.recent-request-row strong{color:#3d5849;font-size:11px}.status-pill-modern{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:8px;font-weight:850}.status-pending{background:#fff3d5;color:#9b7629}.status-progress{background:#e3f2f5;color:#3b8794}.status-completed{background:#e5f4df;color:#42824d}.urgent-pill{border-radius:999px;padding:4px 6px;background:#fff0ec;color:#bd5b48;font-size:7px;font-weight:900;letter-spacing:.6px}.notification-count{display:inline-flex;align-items:center;justify-content:center;width:21px;height:21px;margin-left:4px;border-radius:8px;background:#e8f3e4;color:#397a4f;font-size:10px;vertical-align:2px}.notification-row{display:flex;width:100%;align-items:flex-start;gap:10px;padding:14px 16px;transition:background .15s}.notification-row:hover{background:#fafcf8}.notification-unread{background:#f5faf2}.notification-dot{display:block;width:7px;height:7px;flex-shrink:0;margin-top:5px;border-radius:50%;background:#5b9c63;box-shadow:0 0 0 4px #e2f1dd}.notification-dot.read{background:#d7e0d7;box-shadow:0 0 0 4px #f1f4ef}.notification-row strong{display:block;color:#3f5b4a;font-size:10px}.notification-row small{display:block;margin-top:4px;color:#87958b;font-size:10px;line-height:1.5}.notification-row em{display:block;margin-top:5px;color:#a8b2a8;font-size:8px;font-style:normal}.notification-new{color:#438758;font-size:7px;font-weight:900;letter-spacing:.7px}
        @media(max-width:850px){.dashboard-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.dashboard-welcome{padding:22px 19px}.welcome-shortcut{min-width:0;width:100%}.dashboard-stat{padding:14px}.stat-trend{font-size:6px}.stat-number{font-size:30px}.recent-request-row{padding:13px 12px;gap:9px}.recent-request-icon{width:34px;height:34px}.notification-row{padding:12px}}
      `}</style>
    </div>
  );
}
