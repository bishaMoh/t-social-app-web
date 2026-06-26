const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export const auth = {
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const users = {
  me: () => api('/users/me'),
  updateMe: (body) => api('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  list: () => api('/users/'),
  get: (id) => api(`/users/${id}`),
};

export const follows = {
  pending: () => api('/follows/pending'),
  send: (userId) => api(`/follows/${userId}`, { method: 'POST' }),
  accept: (followId) => api(`/follows/${followId}/accept`, { method: 'PUT' }),
  reject: (followId) => api(`/follows/${followId}/reject`, { method: 'PUT' }),
  unfollow: (userId) => api(`/follows/${userId}`, { method: 'DELETE' }),
};

export const tees = {
  published: () => api('/tees/'),
  feed: () => api('/tees/feed'),
  create: (body) => api('/tees/newt', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/tees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`/tees/${id}`, { method: 'DELETE' }),
  like: (id) => api(`/tees/${id}/like`, { method: 'POST' }),
  likes: (id) => api(`/tees/${id}/likes`),
  comments: (id) => api(`/tees/${id}/comments`),
  addComment: (id, text) =>
    api(`/tees/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteComment: (teeId, commentId) =>
    api(`/tees/${teeId}/comments/${commentId}`, { method: 'DELETE' }),
};
