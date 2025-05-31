
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      customer: 'John Doe',
      total: 97000,
      status: 'processing',
      date: '2024-01-20'
    },
    {
      id: 2,
      customer: 'Jane Smith',
      total: 45000,
      status: 'delivered',
      date: '2024-01-19'
    }
  ]);

  useEffect(() => {
    // Simulate API call for stats
    setTimeout(() => {
      setStats({
        totalOrders: 156,
        totalUsers: 89,
        totalProducts: 24,
        totalRevenue: 15670000
      });
    }, 1000);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500">Selesai</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Diproses</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Kelola toko dan pantau performa bisnis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +8% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +2 produk baru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
            <CardDescription>
              Pesanan yang baru masuk dan perlu diproses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Pesanan #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Ringkasan aktivitas sistem terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Produk baru ditambahkan</p>
                  <p className="text-xs text-gray-500">5 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Pesanan baru diterima</p>
                  <p className="text-xs text-gray-500">15 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Stok produk rendah</p>
                  <p className="text-xs text-gray-500">1 jam yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
