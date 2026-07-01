import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useApi = () => {
  const { token, logout } = useAuth();

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (res.status === 401) { logout(); return; }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  };

  const get = (endpoint) => request(endpoint);
  const post = (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  const del = (endpoint) => request(endpoint, { method: 'DELETE' });

  const uploadFile = async (endpoint, formData) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  };

  return { get, post, del, uploadFile, token };
};
