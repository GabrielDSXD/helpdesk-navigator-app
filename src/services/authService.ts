
import api from './api';
import { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  sector: string;
}

interface LoginResponse {
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<LoginResponse>('/sessions', credentials);
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  
  register: async (userData: RegisterCredentials) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};
