
import { supabase } from '../integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};
