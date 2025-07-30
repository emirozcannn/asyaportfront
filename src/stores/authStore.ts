import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    console.log('Login started:', { email, passwordLength: password.length });
    set({ isLoading: true });
    
    try {
      console.log('Calling authService.login...');
      const response = await authService.login({ email, password });
      console.log('Backend response:', response);
      
      // Backend'den direkt token ve user geliyor, success field'i yok
      if (response.token && response.user) {
        console.log('Login successful, saving auth data...');
        authService.saveAuthData(response.token, response.user);
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        console.log('Login failed - no token or user in response');
        set({ isLoading: false });
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      
      set({ isLoading: false });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Bağlantı hatası';
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false
    });
  },

  initAuth: () => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user) {
        set({
          user,
          isAuthenticated: true
        });
      }
    }
  }
}));