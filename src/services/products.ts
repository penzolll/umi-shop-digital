
import { apiHelpers } from './api';

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  discount_percentage: number;
  unit: string;
  description?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

// Mock products for fallback
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Beras Premium 5kg',
    price: 75000,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e544?w=400',
    stock: 50,
    discount_percentage: 0,
    unit: 'kg',
    description: 'Beras premium kualitas terbaik untuk keluarga',
    category: 'Makanan'
  },
  {
    id: '2',
    name: 'Minyak Goreng 1L',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    stock: 30,
    discount_percentage: 10,
    unit: 'liter',
    description: 'Minyak goreng berkualitas untuk memasak',
    category: 'Bumbu Dapur'
  },
  {
    id: '3',
    name: 'Telur Ayam 1kg',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1569288052389-dac9b01ac8d8?w=400',
    stock: 25,
    discount_percentage: 0,
    unit: 'kg',
    description: 'Telur ayam segar pilihan',
    category: 'Produk Segar'
  },
  {
    id: '4',
    name: 'Gula Pasir 1kg',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    stock: 40,
    discount_percentage: 0,
    unit: 'kg',
    description: 'Gula pasir putih berkualitas',
    category: 'Bumbu Dapur'
  },
  {
    id: '5',
    name: 'Susu UHT 1L',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    stock: 35,
    discount_percentage: 5,
    unit: 'liter',
    description: 'Susu UHT full cream',
    category: 'Minuman'
  },
  {
    id: '6',
    name: 'Roti Tawar',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    stock: 20,
    discount_percentage: 0,
    unit: 'pcs',
    description: 'Roti tawar lembut dan segar',
    category: 'Makanan'
  }
];

export const productsService = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<Product[]> => {
    try {
      console.log('Attempting to fetch products from API...');
      console.log('API URL:', `${import.meta.env.VITE_API_URL || 'https://jamblangcloud.online/api'}/products`);
      
      const response = await apiHelpers.getProducts(params);
      console.log('API response received:', response);
      return response.data || response; // Handle different response formats
    } catch (error) {
      console.error('Error fetching products from API:', error);
      console.log('API Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      
      // Check if it's a network error or server error
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.log('Network error detected, using mock data as fallback');
        // Return mock data for now while backend is being set up
        let filteredProducts = [...MOCK_PRODUCTS];
        
        // Apply category filter if provided
        if (params?.category && params.category !== 'all') {
          filteredProducts = filteredProducts.filter(product => 
            product.category.toLowerCase() === params.category.toLowerCase()
          );
        }
        
        // Apply search filter if provided
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        return filteredProducts;
      }
      
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    try {
      console.log('Attempting to fetch product by ID:', id);
      const response = await apiHelpers.getProduct(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching product:', error);
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.log('Network error detected, using mock data as fallback for product ID:', id);
        const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
        if (mockProduct) {
          return mockProduct;
        }
      }
      
      throw error;
    }
  },

  // Admin: Create new product
  createProduct: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    try {
      const response = await apiHelpers.admin.createProduct(productData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Admin: Update product
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await apiHelpers.admin.updateProduct(id, productData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Admin: Delete product
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await apiHelpers.admin.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      return await productsService.getProducts({ search: query });
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      return await productsService.getProducts({ category });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
};
