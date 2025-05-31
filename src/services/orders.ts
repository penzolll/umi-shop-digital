
import { supabase } from '../integrations/supabase/client';
import { api } from './api';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  payment_method: string;
  customer_name: string;
  phone: string | null;
  shipping_address: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export const ordersService = {
  // Create new order
  async createOrder(orderData: {
    customer_name: string;
    phone: string;
    shipping_address: string;
    payment_method: string;
    total_amount: number;
    subtotal: number;
    shipping_cost?: number;
    tax?: number;
    discount?: number;
    notes?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: orderData.customer_name,
          phone: orderData.phone,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          total_amount: orderData.total_amount,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost || 0,
          tax: orderData.tax || 0,
          discount: orderData.discount || 0,
          notes: orderData.notes,
          order_number: `UMI-${Date.now()}` // Will be replaced by trigger
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      return orderData as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(): Promise<Order[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Order[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      // Fallback to Laravel API
      try {
        const response = await api.get('/user/orders');
        return response.data;
      } catch (apiError) {
        console.error('Error fetching orders from API:', apiError);
        return [];
      }
    }
  },

  // Get all orders (admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Order[];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      // Fallback to Laravel API
      try {
        const response = await api.get('/admin/orders');
        return response.data;
      } catch (apiError) {
        console.error('Error fetching admin orders from API:', apiError);
        return [];
      }
    }
  },

  // Update order status (admin)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};
