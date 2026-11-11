import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/apiClient';
import RequestList from '../components/RequestList';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.request('/api/requests', { token: localStorage.getItem('authToken') });
      setRequests(data.requests || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load the request desk.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  return <div className="page-shell"><div className="page-container"><div className="mb-7"><p className="page-eyebrow">SERVICE OPERATIONS</p><h1 className="page-title">All maintenance requests.</h1><p className="page-lede">Triage new work, assign matching professionals and keep each request moving toward completion.</p></div>{error && <div role="alert" className="notice-error mb-5 rounded-xl px-4 py-3 text-sm">{error}</div>}{loading ? <div className="app-panel p-10 text-center text-sm text-slate-500">Loading requests…</div> : <RequestList requests={requests} onRequestsChange={loadRequests} isAdmin />}</div></div>;
}
