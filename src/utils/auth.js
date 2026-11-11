import { api } from './apiClient';

const CURRENT_USER_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';

const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

// User profiles and passwords are owned by the auth service, not browser storage.
// This function remains for compatibility with App.jsx while the API seeds demo users.
export const initializeUsers = () => true;

export const loginUser = async (username, password) => {
  try {
    const response = await api.request('/api/auth/login', {
      method: 'POST',
      body: { username: String(username).trim(), password },
    });
    if (!response?.token || !response?.user) return null;
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
    return response.user;
  } catch (error) {
    console.warn('[auth] Login failed:', error.message);
    return null;
  }
};

export const registerUser = async (userData) => {
  const response = await api.request('/api/auth/register', {
    method: 'POST',
    body: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      username: userData.username,
      password: userData.password,
    },
  });
  return response?.user || null;
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAuthTokenValue = getAuthToken;

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = () => Boolean(getCurrentUser() && getAuthToken());

const authGet = (path) => api.request(path, { token: getAuthToken() });
const authPost = (path, body) => api.request(path, { method: 'POST', body, token: getAuthToken() });
const authPatch = (path, body) => api.request(path, { method: 'PATCH', body, token: getAuthToken() });
const authDelete = (path) => api.request(path, { method: 'DELETE', token: getAuthToken() });

export const getAllUsers = async () => (await authGet('/api/users')).users || [];
export const getAllWorkers = async () => (await authGet('/api/workers')).workers || [];
export const addUser = async (userData) => (await authPost('/api/users', userData)).user;
export const updateUser = async (userId, updates) => (await authPatch(`/api/users/${userId}`, updates)).user;
export const deleteUser = async (userId) => authDelete(`/api/users/${userId}`);
export const getServices = async () => (await api.request('/api/services')).services || [];
export const addService = async (serviceData) => (await authPost('/api/services', serviceData)).service;
export const deleteService = async (serviceId) => authDelete(`/api/services/${serviceId}`);
