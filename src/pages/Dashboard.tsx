
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { User, ShoppingBag, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  // Mock order data
  const mockOrders = [
    {
      id: 1,
      date: '2024-01-15',
      status: 'delivered',
      total: 97000,
      items: ['Beras Premium 5kg', 'Minyak Goreng 2L']
    },
    {
      id: 2,
      date: '2024-01-20',
      status: 'processing',
      total: 45000,
      items: ['Sabun Mandi', 'Deterjen Bubuk 1kg']
    }
  ];

  const handleProfileUpdate = async () => {
    try {
      // TODO: Implement profile update API
      console.log('Updating profile:', profileData);
      toast({
        title: "Profile Updated",
        description: "Profil berhasil diperbarui",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "Anda telah logout",
    });
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Selamat datang kembali, {user?.name}!</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Pesanan</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Kelola informasi profil dan data pribadi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleProfileUpdate}>
                      Simpan Perubahan
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan</CardTitle>
              <CardDescription>
                Lihat semua pesanan yang pernah Anda buat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Pesanan #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Items:</strong> {order.items.join(', ')}
                      </p>
                      <p className="text-sm">
                        <strong>Total:</strong> {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Akun</CardTitle>
              <CardDescription>
                Kelola pengaturan akun dan keamanan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Ubah Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Pengaturan Notifikasi
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Kebijakan Privasi
                </Button>
              </div>
              
              <div className="pt-6 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
