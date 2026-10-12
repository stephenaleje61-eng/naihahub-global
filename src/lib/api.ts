const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('naijahub_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Marketplace
  getProducts: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/marketplace/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id: string) => request<any>(`/marketplace/products/${id}`),
  createProduct: (body: any) => request<any>('/marketplace/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<any>(`/marketplace/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<any>(`/marketplace/products/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id: string) => request<any>(`/marketplace/products/${id}/favorite`, { method: 'POST' }),

  // Connect (Social Feed & Friends)
  getPosts: () => request<any>('/connect/posts'),
  createPost: (body: any) => request<any>('/connect/posts', { method: 'POST', body: JSON.stringify(body) }),
  deletePost: (id: string) => request<any>(`/connect/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) => request<any>(`/connect/posts/${id}/like`, { method: 'POST' }),
  commentPost: (id: string, content: string) => request<any>(`/connect/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  getUsers: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/connect/users${query ? `?${query}` : ''}`);
  },
  sendFriendRequest: (receiverId: string) => request<any>('/connect/friends/request', { method: 'POST', body: JSON.stringify({ receiverId }) }),
  respondFriendRequest: (requestId: string, action: 'accept' | 'decline') => request<any>('/connect/friends/respond', { method: 'POST', body: JSON.stringify({ requestId, action }) }),

  // Business Connect & Messaging
  getRooms: () => request<any>('/chat/rooms'),
  getRoomMessages: (roomId: string) => request<any>(`/chat/rooms/${roomId}/messages`),
  sendRoomMessage: (roomId: string, body: any) => request<any>(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify(body) }),
  getConversations: () => request<any>('/chat/conversations'),
  startConversation: (body: any) => request<any>('/chat/conversations', { method: 'POST', body: JSON.stringify(body) }),
  getConversationMessages: (convId: string) => request<any>(`/chat/conversations/${convId}/messages`),
  sendDirectMessage: (convId: string, body: any) => request<any>(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify(body) }),

  // Services & Jobs
  getJobs: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/services/jobs${query ? `?${query}` : ''}`);
  },
  getJob: (id: string) => request<any>(`/services/jobs/${id}`),
  createJob: (body: any) => request<any>('/services/jobs', { method: 'POST', body: JSON.stringify(body) }),
  applyJob: (id: string, body: any) => request<any>(`/services/jobs/${id}/apply`, { method: 'POST', body: JSON.stringify(body) }),
  getProviders: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/services/providers${query ? `?${query}` : ''}`);
  },
  createProvider: (body: any) => request<any>('/services/providers', { method: 'POST', body: JSON.stringify(body) }),
  bookService: (body: any) => request<any>('/services/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request<any>('/services/my-bookings'),
  updateBookingStatus: (id: string, status: string) => request<any>(`/services/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Global Search
  search: (q: string) => request<any>(`/search?q=${encodeURIComponent(q)}`),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Reports
  submitReport: (body: any) => request<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),

  // Payments & Monetization
  getPackages: () => request<any>('/payments/packages'),
  initializePayment: (body: any) => request<any>('/payments/initialize', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (reference: string) => request<any>('/payments/verify', { method: 'POST', body: JSON.stringify({ reference }) }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any>('/admin/users'),
  suspendUser: (id: string, isSuspended: boolean) => request<any>(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ isSuspended }) }),
  getAdminReports: () => request<any>('/admin/reports'),
  resolveReport: (id: string, status: string, notes?: string) => request<any>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  getAuditLogs: () => request<any>('/admin/audit-logs'),
  runLoadTest: (body: any) => request<any>('/admin/load-test', { method: 'POST', body: JSON.stringify(body) }),
};
