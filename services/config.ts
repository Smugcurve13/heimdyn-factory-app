const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

export const apiClient = {
  async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, { headers });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async post<T>(endpoint: string, data: unknown, requiresAuth: boolean = false): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown, requiresAuth: boolean = false): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    });
    if (response.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
