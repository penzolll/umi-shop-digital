
import { apiHelpers } from './api';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string;
  };
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_name: string;
  phone: string;
  shipping_address: string;
  notes?: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  phone: string;
  shipping_address: string;
  payment_method: string;
  notes?: string;
}

export const ordersService = {
  // Create new order (checkout)
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    try {
      const response = await apiHelpers.createOrder(orderData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiHelpers.getUserOrders();
      return response.data || response;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    try {
      const response = await apiHelpers.getOrder(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Admin: Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiHelpers.admin.getOrders();
      return response.data || response;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Admin: Update order status
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    try {
      const response = await apiHelpers.admin.updateOrderStatus(id, status);
      return response.data || response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get order status options
  getOrderStatuses: () => Order['status'][] => {
    return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  },

  // Get payment status options
  getPaymentStatuses: () => Order['payment_status'][] => {
    return ['pending', 'paid', 'failed', 'refunded'];
  },

  // Format order total
  formatOrderTotal: (order: Order): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(order.total_amount);
  },

  // Get order status color
  getOrderStatusColor: (status: Order['status']): string => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }
};
