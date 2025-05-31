
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

export const productsService = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<Product[]> => {
    try {
      const response = await apiHelpers.getProducts(params);
      return response.data || response; // Handle different response formats
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    try {
      const response = await apiHelpers.getProduct(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching product:', error);
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
