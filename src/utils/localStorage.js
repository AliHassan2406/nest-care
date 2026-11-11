import { api } from './apiClient';

const token = () => localStorage.getItem('authToken');

// Request data lives in the requests service. These async wrappers preserve the
// old utility names for components that haven't needed a direct rewrite yet.
export const getRequests = async () => {
  const data = await api.request('/api/requests', { token: token() });
  return data.requests || [];
};

export const addRequest = async (request) => {
  const data = await api.request('/api/requests', { method: 'POST', body: request, token: token() });
  return data.request;
};

export const updateRequest = async (id, updates) => {
  const data = await api.request(`/api/requests/${id}`, { method: 'PATCH', body: updates, token: token() });
  return data.request;
};

export const deleteRequest = async (id) => api.request(`/api/requests/${id}`, { method: 'DELETE', token: token() });

export const validateAdminPassword = () => false; // Admin access is checked by the API using JWT roles.

export const generateWhatsAppLink = (phoneNumber, requestId) => {
  const text = `I have submitted a repair request ID: ${requestId}. Please check its status.`;
  return `https://wa.me/${String(phoneNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
};

export const clearAllRequests = async () => {
  throw new Error('Bulk deletion is disabled. Delete requests individually from the admin panel.');
};
