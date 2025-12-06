import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'parent' | 'creator' | 'admin';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: 'parent' | 'creator';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const payload = {
      email: data.email,
      password: data.password,
      name: data.name || 'User',
      role: data.role || 'parent',
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    const { access_token, user } = response.data;
    
    // Simpan token di cookie
    Cookies.set('access_token', access_token, { expires: 7 });
    
    // Simpan user di localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout(): void {
    Cookies.remove('access_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | undefined {
    return Cookies.get('access_token');
  },
};
