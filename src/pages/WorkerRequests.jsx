import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/apiClient';
import { getCurrentUser } from '../utils/auth';
import RequestList from '../components/RequestList';

export default function WorkerRequests() {
  const currentUser = getCurrentUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.request('/api/requests', { token: localStorage.getItem('authToken') });
      setRequests(data.requests || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load your job queue.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  return <div className="page-shell"><div className="page-container"><div className="mb-7"><p className="page-eyebrow">PROFESSIONAL WORKSPACE</p><h1 className="page-title">Your job queue.</h1><p className="page-lede">Requests matched to {currentUser?.specialization || 'your speciality'} appear here. Keep progress accurate so customers stay informed.</p><div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e1eae0] bg-white px-3 py-2 text-xs font-bold text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />{currentUser?.name} · {currentUser?.specialization}</div></div>{error && <div role="alert" className="notice-error mb-5 rounded-xl px-4 py-3 text-sm">{error}</div>}{loading ? <div className="app-panel p-10 text-center text-sm text-slate-500">Loading your job queue…</div> : <RequestList requests={requests} onRequestsChange={loadRequests} isWorker />}</div></div>;
}
