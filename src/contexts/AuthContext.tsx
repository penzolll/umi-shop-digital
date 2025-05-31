
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { apiHelpers } from '../services/api';
import { cleanupAuthState } from '../utils/authCleanup';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  laravelToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncWithLaravel: (supabaseUser: SupabaseUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUPABASE_SESSION'; payload: { user: SupabaseUser | null; session: Session | null } }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SUPABASE_SESSION':
      return {
        ...state,
        supabaseUser: action.payload.user,
        session: action.payload.session,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        laravelToken: action.payload.token,
        isLoading: false,
      };
    case 'LOGOUT':
      return { 
        user: null, 
        supabaseUser: null, 
        session: null, 
        laravelToken: null, 
        isLoading: false 
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    supabaseUser: null,
    session: null,
    isLoading: true,
    laravelToken: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing Laravel token first
      const token = localStorage.getItem('laravel_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({ type: 'SET_USER', payload: { user, token } });
          
          // Verify token is still valid
          await apiHelpers.getProfile();
        } catch (error) {
          console.error('Invalid stored token, clearing:', error);
          localStorage.removeItem('laravel_token');
          localStorage.removeItem('user');
        }
      }
      
      // Set up Supabase auth state listener for Google OAuth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Supabase auth event:', event, session?.user?.email);
          
          dispatch({ 
            type: 'SET_SUPABASE_SESSION', 
            payload: { user: session?.user ?? null, session } 
          });

          if (session?.user && event === 'SIGNED_IN') {
            // Sync with Laravel backend for Google OAuth
            setTimeout(() => {
              syncWithLaravel(session.user);
            }, 0);
          }
        }
      );

      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      dispatch({ 
        type: 'SET_SUPABASE_SESSION', 
        payload: { user: session?.user ?? null, session } 
      });
      
      if (session?.user && !token) {
        await syncWithLaravel(session.user);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const syncWithLaravel = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Syncing with Laravel backend...');
      
      // For now, we'll primarily use Laravel backend authentication
      // This sync is mainly for Google OAuth integration
      const response = await apiHelpers.login(
        supabaseUser.email!,
        'google_oauth_temp_password'
      );

      const { user, token } = response;
      
      localStorage.setItem('laravel_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      console.error('Failed to sync with Laravel:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Use Laravel backend for primary authentication
      const response = await apiHelpers.login(email, password);
      const { user, token } = response;
      
      localStorage.setItem('laravel_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Use Laravel backend for primary registration
      const response = await apiHelpers.register(name, email, password);
      const { user, token } = response;
      
      localStorage.setItem('laravel_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Logout from Laravel backend
      await apiHelpers.logout();
      
      // Sign out from Supabase
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Supabase logout error:', err);
      }
      
      cleanupAuthState();
      dispatch({ type: 'LOGOUT' });
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if logout fails
      cleanupAuthState();
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      syncWithLaravel 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
