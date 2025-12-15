import { apiClient } from './apiClient';
import { ENDPOINTS, getTenantId } from '../config';
import { Player } from '../types';

export interface AuthResponse {
  token: string;
  user: Player;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { 
      email, 
      password,
      tenantId: getTenantId() 
    });
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, { 
      username, 
      email, 
      password,
      tenantId: getTenantId()
    });
  },

  logout: async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
    } catch (e) {
      console.warn("Logout on server failed, clearing local state anyway");
    } finally {
      localStorage.removeItem('auth_token');
    }
  }
};