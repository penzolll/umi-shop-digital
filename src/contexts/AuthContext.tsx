
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { api } from '../services/api';
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
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth event:', event, session?.user?.email);
        
        dispatch({ 
          type: 'SET_SUPABASE_SESSION', 
          payload: { user: session?.user ?? null, session } 
        });

        if (session?.user && event === 'SIGNED_IN') {
          // Defer Laravel sync to prevent deadlocks
          setTimeout(() => {
            syncWithLaravel(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ 
        type: 'SET_SUPABASE_SESSION', 
        payload: { user: session?.user ?? null, session } 
      });
      
      if (session?.user) {
        syncWithLaravel(session.user);
      } else {
        // Check for existing Laravel token
        const token = localStorage.getItem('laravel_token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            dispatch({ type: 'SET_USER', payload: { user, token } });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (error) {
            localStorage.removeItem('laravel_token');
            localStorage.removeItem('user');
          }
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncWithLaravel = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Syncing with Laravel backend...');
      
      // Send Supabase user data to Laravel backend
      const response = await api.post('/auth/supabase-sync', {
        supabase_id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url
      });

      const { user, token } = response.data;
      
      localStorage.setItem('laravel_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      console.error('Failed to sync with Laravel:', error);
      // Continue with Supabase-only auth if Laravel sync fails
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Try Supabase auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback to Laravel direct login
        const response = await api.post('/login', { email, password });
        const { user, token } = response.data;
        
        localStorage.setItem('laravel_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ type: 'SET_USER', payload: { user, token } });
      }
      // If Supabase login successful, syncWithLaravel will be called automatically
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Register with Supabase first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        // Fallback to Laravel direct registration
        const response = await api.post('/register', { name, email, password });
        const { user, token } = response.data;
        
        localStorage.setItem('laravel_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ type: 'SET_USER', payload: { user, token } });
      }
      // If Supabase registration successful, syncWithLaravel will be called automatically
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      // syncWithLaravel will be called automatically when auth state changes
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear Laravel data
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
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
