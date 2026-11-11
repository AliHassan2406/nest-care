import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/apiClient';
import { getCurrentUser } from '../utils/auth';

export default function Services() {
  const currentUser = getCurrentUser();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDirectory() {
      setLoading(true);
      setError('');
      try {
        const serviceResult = await api.request('/api/services');
        const serviceList = serviceResult.services || [];
        if (!active) return;
        setServices(serviceList);
        setSelectedService((current) => current || serviceList[0] || null);
        const token = localStorage.getItem('authToken');
        if (token) {
          const workerResult = await api.request('/api/workers', { token });
          if (active) setWorkers(workerResult.workers || []);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'We could not load the service directory.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDirectory();
    return () => { active = false; };
  }, []);

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter((service) => [service.name, service.title, service.description, service.type].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [services, search]);

  const activeService = filteredServices.find((service) => service.id === selectedService?.id) || filteredServices[0] || null;
  const serviceWorkers = useMemo(() => workers.filter((worker) => activeService && worker.specialization === activeService.type), [workers, activeService]);

  const handleContactWorker = (worker) => {
    const phone = String(worker.phone || '').replace(/\D/g, '');
    if (!phone) return;
    const message = `Hi ${worker.name}, I found your profile on NestCare and would like to ask about ${activeService?.name || 'home service'} support.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="page-eyebrow">A LITTLE HELP GOES A LONG WAY</p><h1 className="page-title">Find the right help for home.</h1><p className="page-lede max-w-2xl">Browse services, meet the people behind the work, and start a request when you’re ready.</p></div>
          {currentUser?.role === 'User' && <Link to="/submit" className="button-primary w-fit">Book a service <span>↗</span></Link>}
        </div>

        <div className="directory-toolbar mt-8 flex flex-col gap-3 rounded-2xl border border-[#e4ece4] bg-white p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input aria-label="Search services" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plumbing, cleaning, electrical..." className="form-control-modern !min-h-11 !rounded-xl !border-0 !bg-[#f7faf6] pl-11" /></div>
          <span className="px-3 text-xs font-bold text-slate-400">{filteredServices.length} {filteredServices.length === 1 ? 'SERVICE' : 'SERVICES'}</span>
        </div>

        {error && <div className="notice-error mt-5 rounded-xl p-4 text-sm">{error}</div>}
        {loading ? <div className="app-panel mt-6 p-10 text-center text-sm text-slate-500">Loading the service directory…</div> : filteredServices.length === 0 ? <div className="app-panel mt-6 p-10 text-center"><p className="text-lg font-bold text-slate-700">No services match that search.</p><button className="mt-3 text-sm font-bold text-emerald-700" onClick={() => setSearch('')}>Clear search</button></div> : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service, index) => {
              const isSelected = activeService?.id === service.id;
              const count = workers.filter((worker) => worker.specialization === service.type).length;
              return <button key={service.id} onClick={() => setSelectedService(service)} className={`directory-service-card ${isSelected ? 'directory-service-card-selected' : ''}`}>
                <div className="flex items-start justify-between"><span className={`directory-service-icon directory-icon-${service.accent || 'green'}`}>{service.icon || '🧰'}</span><span className={`directory-card-arrow ${isSelected ? 'selected' : ''}`}>↗</span></div>
                <p className="mt-5 text-[9px] font-extrabold tracking-[1.4px] text-slate-400">SERVICE 0{index + 1}</p>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-800">{service.title || service.name}</h2>
                <p className="mt-2 min-h-[43px] text-xs leading-6 text-slate-500">{service.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-bold text-emerald-800">{service.startingPrice || 'Request a quote'}</span><span className="text-[10px] font-semibold text-slate-400">{currentUser ? `${count} ${count === 1 ? 'pro' : 'pros'}` : 'Local professionals'}</span></div>
              </button>;
            })}
          </div>
        )}

        {activeService && !loading && filteredServices.length > 0 && (
          <section className="mt-10">
            <div className="flex flex-col justify-between gap-3 border-b border-[#e2ebe2] pb-5 sm:flex-row sm:items-end"><div><p className="page-eyebrow">MEET YOUR SERVICE TEAM</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#244638]">{activeService.icon} {activeService.title || activeService.name}</h2><p className="mt-2 text-sm text-slate-500">{currentUser ? 'Choose a professional to contact, or send a booking request.' : 'Sign in to view team contact details and manage your bookings.'}</p></div>{currentUser?.role === 'User' && <Link to="/submit" className="text-sm font-extrabold text-emerald-700 hover:text-emerald-900">Request this service →</Link>}</div>
            {!currentUser ? <div className="app-panel mt-5 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-slate-800">Keep your booking details in one place</h3><p className="mt-1 text-sm text-slate-500">Create an account to submit a request and see status updates.</p></div><Link to="/login" className="button-primary">Sign in to continue <span>↗</span></Link></div> : serviceWorkers.length > 0 ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{serviceWorkers.map((worker) => <article className="worker-profile-card" key={worker.id}><div className="flex items-center gap-3"><div className="worker-avatar">{String(worker.name || 'P').trim().charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate font-extrabold text-slate-800">{worker.name}</h3><p className="mt-1 text-xs font-semibold text-emerald-700">{worker.specialization}</p></div><span className="worker-rating">★ {worker.rating ?? '4.8'}</span></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="worker-detail-cell"><span>EXPERIENCE</span><strong>{worker.experience || 'Experienced'}</strong></div><div className="worker-detail-cell"><span>CONTACT</span><strong>{worker.phone || 'Ask in app'}</strong></div></div><div className="mt-5 flex gap-2"><button onClick={() => handleContactWorker(worker)} disabled={!worker.phone} className="button-primary flex-1 !rounded-xl !py-3 disabled:opacity-50">WhatsApp <span>↗</span></button><a href={worker.email ? `mailto:${worker.email}` : undefined} className={`button-secondary flex-1 !rounded-xl !py-3 ${!worker.email ? 'pointer-events-none opacity-50' : ''}`}>Email</a></div></article>)}</div> : <div className="app-panel mt-5 p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">♧</div><h3 className="mt-3 font-bold text-slate-800">We’re building this service team</h3><p className="mt-1 text-sm text-slate-500">You can still send in a request and the administrator can route it to the right person.</p>{currentUser.role === 'User' && <Link to="/submit" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Start a request →</Link>}</div>}
          </section>
        )}
      </div>
      <style>{`
        .directory-service-card{width:100%;text-align:left;padding:22px;border:1px solid #e4ece4;border-radius:20px;background:#fff;transition:all .2s ease;box-shadow:0 5px 18px rgba(25,64,45,.025)}
        .directory-service-card:hover{transform:translateY(-3px);border-color:#bfd9c1;box-shadow:0 15px 32px rgba(25,64,45,.07)}
        .directory-service-card-selected{border-color:#80b795;box-shadow:0 0 0 3px rgba(106,171,126,.12),0 12px 24px rgba(25,64,45,.05)}
        .directory-service-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:17px;font-size:25px}
        .directory-icon-amber{background:#fff1d1}.directory-icon-sky,.directory-icon-blue{background:#e2f3fb}.directory-icon-orange{background:#ffeadf}.directory-icon-emerald,.directory-icon-green{background:#e3f3e3}.directory-icon-violet{background:#eee9ff}
        .directory-card-arrow{display:flex;align-items:center;justify-content:center;width:31px;height:31px;color:#99a99d;border-radius:11px;background:#f8faf6}
        .directory-card-arrow.selected{background:#e9f5e6;color:#24744f}
        .worker-profile-card{padding:20px;border:1px solid #e3ece4;border-radius:19px;background:#fff;box-shadow:0 7px 22px rgba(25,64,45,.035)}
        .worker-avatar{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:16px;color:#2a6747;background:#e8f3e3;font-size:18px;font-weight:900}
        .worker-rating{padding:6px 8px;border-radius:9px;background:#fff6de;color:#9a7227;font-size:11px;font-weight:850}
        .worker-detail-cell{padding:11px;border:1px solid #edf1ea;border-radius:12px;background:#fbfcf9;min-width:0}
        .worker-detail-cell span{display:block;color:#9ca89d;font-size:8px;letter-spacing:1px;font-weight:850}
        .worker-detail-cell strong{display:block;overflow-wrap:anywhere;margin-top:6px;color:#526b5b;font-size:10px;font-weight:750}
      `}</style>
    </div>
  );
}
