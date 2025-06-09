
import { apiHelpers } from './api';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    stock: number;
  };
  created_at?: string;
  updated_at?: string;
}

export const cartService = {
  // Get cart items
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await apiHelpers.getCart();
      return response.data || response;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
    try {
      const response = await apiHelpers.addToCart(parseInt(productId), quantity);
      return response.data || response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (id: string, quantity: number): Promise<CartItem> => {
    try {
      const response = await apiHelpers.updateCartItem(id, quantity);
      return response.data || response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (id: string): Promise<void> => {
    try {
      await apiHelpers.removeFromCart(id);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    try {
      const cart = await cartService.getCart();
      await Promise.all(cart.map(item => cartService.removeFromCart(item.id)));
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get cart total
  getCartTotal: async (): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  },

  // Get cart item count
  getCartItemCount: async (): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      return cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
};
