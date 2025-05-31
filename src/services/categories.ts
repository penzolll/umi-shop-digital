
import { apiHelpers } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const categoriesService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    try {
      // For now, return mock categories since Laravel backend may not have categories endpoint yet
      // This can be updated when the backend is ready
      const mockCategories: Category[] = [
        { id: '1', name: 'Makanan', slug: 'makanan' },
        { id: '2', name: 'Minuman', slug: 'minuman' },
        { id: '3', name: 'Snack', slug: 'snack' },
        { id: '4', name: 'Bumbu Dapur', slug: 'bumbu-dapur' },
        { id: '5', name: 'Kebutuhan Rumah', slug: 'kebutuhan-rumah' },
        { id: '6', name: 'Produk Segar', slug: 'produk-segar' }
      ];
      
      return mockCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    try {
      const categories = await categoriesService.getCategories();
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    try {
      const categories = await categoriesService.getCategories();
      const category = categories.find(cat => cat.slug === slug);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }
};
