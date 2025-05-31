
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
    discount_percentage: number | null;
    unit: string;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
}

interface CartContextType extends CartState {
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      const total = action.payload.reduce((sum, item) => {
        const price = item.product.discount_percentage 
          ? item.product.price * (1 - item.product.discount_percentage / 100)
          : item.product.price;
        return sum + (price * item.quantity);
      }, 0);
      return { ...state, items: action.payload, total, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    total: 0,
  });

  const { user, supabaseUser } = useAuth();

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = item.product.discount_percentage 
        ? item.product.price * (1 - item.product.discount_percentage / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const fetchCart = async () => {
    if (!supabaseUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:products (
            id,
            name,
            price,
            image_url,
            stock,
            discount_percentage,
            unit
          )
        `)
        .eq('user_id', supabaseUser.id);

      if (error) throw error;

      // Transform data to match expected format
      const cartItems = (data || []).map(item => ({
        ...item,
        product: item.product as CartItem['product']
      })) as CartItem[];

      dispatch({ type: 'SET_CART', payload: cartItems });
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Fallback to Laravel API
      try {
        const response = await api.get('/cart');
        dispatch({ type: 'SET_CART', payload: response.data });
      } catch (apiError) {
        console.error('Error fetching cart from API:', apiError);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (!supabaseUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.product_id === productId.toString());
      
      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // Add new item to Supabase
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: supabaseUser.id,
          product_id: productId.toString(),
          quantity
        })
        .select(`
          *,
          product:products (
            id,
            name,
            price,
            image_url,
            stock,
            discount_percentage,
            unit
          )
        `)
        .single();

      if (error) throw error;

      const cartItem = {
        ...data,
        product: data.product as CartItem['product']
      } as CartItem;

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      
      toast({
        title: "Added to Cart",
        description: "Item successfully added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to Laravel API
      try {
        const response = await api.post('/cart', { product_id: productId, quantity });
        dispatch({ type: 'ADD_ITEM', payload: response.data });
        toast({
          title: "Added to Cart",
          description: "Item successfully added to your cart",
        });
      } catch (apiError) {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Fallback to Laravel API
      try {
        await api.put(`/cart/${itemId}`, { quantity });
        dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      } catch (apiError) {
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        });
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to Laravel API
      try {
        await api.delete(`/cart/${itemId}`);
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        toast({
          title: "Removed",
          description: "Item removed from cart",
        });
      } catch (apiError) {
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [supabaseUser]);

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
