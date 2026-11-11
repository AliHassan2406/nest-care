import React, { useEffect, useMemo, useState } from 'react';
import RequestCard from './RequestCard';
import { api } from '../utils/apiClient';

const statuses = ['All', 'Pending', 'In Progress', 'Completed'];
const issueTypes = ['All', 'Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Other'];
const token = () => localStorage.getItem('authToken');

export default function RequestList({ requests, onRequestsChange, isAdmin = false, isWorker = false }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchType, setSearchType] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [workers, setWorkers] = useState([]);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    api.request('/api/workers', { token: token() }).then((data) => {
      if (active) setWorkers(data.workers || []);
    }).catch((error) => {
      if (active) setActionError(error.message || 'Could not load workers for job assignment.');
    });
    return () => { active = false; };
  }, [isAdmin]);

  const filteredRequests = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return requests.filter((request) => {
      const statusMatch = filterStatus === 'All' || request.status === filterStatus;
      const typeMatch = searchType === 'All' || request.type === searchType;
      const textMatch = !term || [request.id, request.name, request.location, request.description, request.assignedWorkerName].some((value) => String(value || '').toLowerCase().includes(term));
      return statusMatch && typeMatch && textMatch;
    });
  }, [requests, filterStatus, searchType, searchText]);

  const handleStatusChange = async (id, newStatus) => {
    setBusyId(id); setActionError('');
    try {
      await api.request(`/api/requests/${id}`, { method: 'PATCH', body: { status: newStatus }, token: token() });
      await onRequestsChange();
    } catch (error) {
      setActionError(error.message || 'Could not update the request status.');
    } finally { setBusyId(''); }
  };

  const handleAssign = async (id, assignedWorkerId) => {
    setBusyId(id); setActionError('');
    try {
      await api.request(`/api/requests/${id}`, { method: 'PATCH', body: { assignedWorkerId }, token: token() });
      await onRequestsChange();
    } catch (error) {
      setActionError(error.message || 'Could not assign that worker. Check that their speciality matches the request.');
    } finally { setBusyId(''); }
  };

  const handleDelete = async (id) => {
    setBusyId(id); setActionError('');
    try {
      await api.request(`/api/requests/${id}`, { method: 'DELETE', token: token() });
      await onRequestsChange();
    } catch (error) {
      setActionError(error.message || 'Could not delete the request.');
    } finally { setBusyId(''); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="page-eyebrow">{isAdmin ? 'SERVICE OPERATIONS' : isWorker ? 'YOUR JOB QUEUE' : 'YOUR REQUEST HISTORY'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#234638]">{isAdmin ? 'Request desk' : isWorker ? 'Requests for your team' : 'Your home-care requests'}</h2><p className="mt-1 text-xs text-slate-500">Search the details, filter by status or open a request to see its timeline.</p></div><span className="w-fit rounded-xl border border-[#e1eae1] bg-white px-3 py-2 text-xs font-extrabold text-slate-600">{filteredRequests.length} of {requests.length} requests</span></div>
      {actionError && <div role="alert" className="notice-error mb-4 rounded-xl px-4 py-3 text-sm">{actionError}</div>}
      <div className="request-filter-panel mb-5 grid gap-3 rounded-2xl border border-[#e2eae2] bg-white p-3 sm:grid-cols-3"><div className="sm:col-span-1"><label className="form-label-modern" htmlFor="request-search">Search requests</label><input id="request-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ID, name, location…" className="form-control-modern !min-h-10 !bg-[#fafcf9]" /></div><div><label className="form-label-modern" htmlFor="status-filter">Status</label><select id="status-filter" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="form-control-modern !min-h-10 !bg-[#fafcf9]">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div><label className="form-label-modern" htmlFor="type-filter">Service type</label><select id="type-filter" value={searchType} onChange={(event) => setSearchType(event.target.value)} className="form-control-modern !min-h-10 !bg-[#fafcf9]">{issueTypes.map((type) => <option key={type}>{type}</option>)}</select></div></div>
      {filteredRequests.length ? <div className="grid gap-4 xl:grid-cols-2">{filteredRequests.map((request) => <RequestCard key={request.id} request={request} onStatusChange={handleStatusChange} onDelete={handleDelete} isAdmin={isAdmin} isWorker={isWorker} workers={workers.filter((worker) => worker.specialization === request.type)} onAssign={handleAssign} busy={busyId === request.id} />)}</div> : <div className="app-panel px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">⌕</div><h3 className="mt-3 font-extrabold text-slate-700">No matching requests</h3><p className="mt-1 text-sm text-slate-500">Try clearing your filters or search for a different term.</p><button onClick={() => { setFilterStatus('All'); setSearchType('All'); setSearchText(''); }} className="mt-4 text-sm font-extrabold text-emerald-700">Clear filters →</button></div>}
    </div>
  );
}
