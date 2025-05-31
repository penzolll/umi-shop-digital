
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, Eye } from 'lucide-react';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  shippingAddress: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '081234567890'
      },
      items: [
        { name: 'Beras Premium 5kg', quantity: 1, price: 65000 },
        { name: 'Minyak Goreng 2L', quantity: 1, price: 32000 }
      ],
      total: 97000,
      status: 'processing',
      paymentMethod: 'COD',
      createdAt: '2024-01-20',
      shippingAddress: 'Jl. Contoh No. 123, Jakarta'
    },
    {
      id: 2,
      customer: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '081234567891'
      },
      items: [
        { name: 'Sabun Mandi', quantity: 3, price: 15000 }
      ],
      total: 45000,
      status: 'delivered',
      paymentMethod: 'Transfer Bank',
      createdAt: '2024-01-19',
      shippingAddress: 'Jl. Sample No. 456, Bandung'
    },
    {
      id: 3,
      customer: {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '081234567892'
      },
      items: [
        { name: 'Deterjen Bubuk 1kg', quantity: 2, price: 28000 }
      ],
      total: 56000,
      status: 'pending',
      paymentMethod: 'E-Wallet',
      createdAt: '2024-01-21',
      shippingAddress: 'Jl. Test No. 789, Surabaya'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Menunggu</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Diproses</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">Dikirim</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as Order['status'] }
        : order
    ));
    
    toast({
      title: "Status Updated",
      description: `Status pesanan #${orderId} berhasil diperbarui`,
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pesanan</h1>
        <p className="text-gray-600">Kelola dan pantau semua pesanan pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari pesanan berdasarkan nama, ID, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="processing">Diproses</SelectItem>
            <SelectItem value="shipped">Dikirim</SelectItem>
            <SelectItem value="delivered">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Pesanan #{order.id}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.createdAt} • {order.customer.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                  <p className="text-sm text-gray-600">{order.customer.email}</p>
                  <p className="text-sm text-gray-600">{order.customer.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} item lainnya
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Total & Pembayaran</h4>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <strong>Alamat:</strong> {order.shippingAddress}
                  </p>
                  
                  <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="processing">Diproses</SelectItem>
                      <SelectItem value="shipped">Dikirim</SelectItem>
                      <SelectItem value="delivered">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada pesanan yang ditemukan</p>
        </div>
      )}

      {/* Order Detail Modal (could be implemented later) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Pesanan #{selectedOrder.id}</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between border-b py-2">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
