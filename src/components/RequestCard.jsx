import React, { useState } from 'react';
import RequestDetailsModal from './RequestDetailsModal';

const allowedNextStatuses = (status) => {
  if (status === 'Pending') return ['Pending', 'In Progress'];
  if (status === 'In Progress') return ['In Progress', 'Pending', 'Completed'];
  return ['Completed'];
};
const statusTone = (status) => status === 'Completed' ? 'status-completed' : status === 'In Progress' ? 'status-progress' : 'status-pending';
const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function RequestCard({ request, onStatusChange, onDelete, isAdmin = false, isWorker = false, workers = [], onAssign, busy = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const canManage = isAdmin || isWorker;
  const requesterPhone = String(request.phone || '').replace(/\D/g, '');
  const contactText = `Hello ${request.name || 'there'}, I am contacting you about home service request ${request.id}.`;
  const hasRequesterContact = requesterPhone.length >= 8 && canManage;

  return (
    <article className="request-card-modern">
      <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="request-type-icon">{request.type === 'Electrical' ? '⚡' : request.type === 'Plumbing' ? '🚿' : request.type === 'Furniture' ? '🪑' : request.type === 'Cleaning' ? '✨' : '🧰'}</div><div className="min-w-0"><h3 className="truncate text-sm font-extrabold text-slate-800">{request.type || 'Home service'}</h3><p className="mt-1 truncate text-[10px] font-semibold text-slate-400">{request.id}</p></div></div><span className={`status-pill-modern ${statusTone(request.status)}`}>{request.status}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><div className="request-info-cell"><span>REQUESTED BY</span><strong>{request.name || 'Customer'}</strong></div><div className="request-info-cell"><span>SUBMITTED</span><strong>{formatDate(request.createdAt || request.date)}</strong></div><div className="request-info-cell col-span-2"><span>LOCATION</span><strong>{request.location || '—'}</strong></div></div>
      <p className="request-description">{request.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">{request.priority === 'Urgent' && <span className="urgent-pill">URGENT</span>}{request.appointmentDate && <span className="request-meta-chip">◷ Preferred {formatDate(request.appointmentDate)}{request.preferredTime && request.preferredTime !== 'Any time' ? ` · ${request.preferredTime}` : ''}</span>}{request.assignedWorkerName && <span className="request-meta-chip">♧ {request.assignedWorkerName}</span>}</div>
      {canManage && <div className="mt-4 grid gap-3 sm:grid-cols-2">{isAdmin && <div><label className="mb-1.5 block text-[9px] font-extrabold tracking-wider text-slate-400" htmlFor={`assign-${request.id}`}>ASSIGN PROFESSIONAL</label><select id={`assign-${request.id}`} value={request.assignedWorkerId || ''} disabled={busy} onChange={(event) => onAssign(request.id, event.target.value)} className="form-control-modern !min-h-10 !rounded-xl !py-2 !text-xs"><option value="">Unassigned</option>{workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}</select></div>}<div><label className="mb-1.5 block text-[9px] font-extrabold tracking-wider text-slate-400" htmlFor={`status-${request.id}`}>UPDATE STATUS</label><select id={`status-${request.id}`} value={request.status} disabled={busy} onChange={(event) => onStatusChange(request.id, event.target.value)} className="form-control-modern !min-h-10 !rounded-xl !py-2 !text-xs">{allowedNextStatuses(request.status).map((status) => <option key={status}>{status}</option>)}</select></div></div>}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setDetailsOpen(true)} className="button-secondary !rounded-xl !px-3 !py-2 !text-xs">View timeline <span>↗</span></button>{hasRequesterContact && <a href={`https://wa.me/${requesterPhone}?text=${encodeURIComponent(contactText)}`} target="_blank" rel="noreferrer" className="request-contact-button">Contact requester ↗</a>}{isAdmin && <button type="button" disabled={busy} onClick={() => { if (window.confirm('Delete this request permanently?')) onDelete(request.id); }} className="request-delete-button">Delete</button>}{busy && <span className="ml-auto text-[10px] font-bold text-slate-400">Saving…</span>}</div>
      <RequestDetailsModal isOpen={detailsOpen} request={request} onClose={() => setDetailsOpen(false)} />
    </article>
  );
}
