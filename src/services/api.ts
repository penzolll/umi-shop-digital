
import axios from 'axios';
import { config } from '../config/env';

export const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('laravel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available (for Laravel)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    
    // Handle different error status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied');
    } else if (error.response?.status === 422) {
      // Validation error - Laravel returns validation errors in this format
      console.error('Validation errors:', error.response.data.errors);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.status);
    }
    
    return Promise.reject(error);
  }
);

// API helper functions for common operations
export const apiHelpers = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('user');
    }
  },
  
  // Profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
  
  // Products
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  // Cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/cart', { product_id: productId, quantity });
    return response.data;
  },
  
  updateCartItem: async (id: string, quantity: number) => {
    const response = await api.put(`/cart/${id}`, { quantity });
    return response.data;
  },
  
  removeFromCart: async (id: string) => {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  },
  
  // Orders
  createOrder: async (orderData: any) => {
    const response = await api.post('/order', orderData);
    return response.data;
  },
  
  getUserOrders: async () => {
    const response = await api.get('/user/orders');
    return response.data;
  },
  
  getOrder: async (id: string) => {
    const response = await api.get(`/user/orders/${id}`);
    return response.data;
  },
  
  // Admin endpoints
  admin: {
    getOrders: async () => {
      const response = await api.get('/admin/orders');
      return response.data;
    },
    
    updateOrderStatus: async (id: string, status: string) => {
      const response = await api.put(`/admin/orders/${id}`, { status });
      return response.data;
    },
    
    createProduct: async (productData: any) => {
      const response = await api.post('/products', productData);
      return response.data;
    },
    
    updateProduct: async (id: string, productData: any) => {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    },
    
    deleteProduct: async (id: string) => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
  }
};
