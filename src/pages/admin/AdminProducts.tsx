
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Beras Premium 5kg",
      price: 65000,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e544?w=400",
      category: "makanan",
      stock: 50,
      description: "Beras premium kualitas terbaik"
    },
    {
      id: 2,
      name: "Minyak Goreng 2L",
      price: 32000,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
      category: "makanan",
      stock: 30,
      description: "Minyak goreng berkualitas tinggi"
    },
    {
      id: 3,
      name: "Sabun Mandi",
      price: 15000,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      category: "kebersihan",
      stock: 100,
      description: "Sabun mandi dengan aroma segar"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    image: '',
    category: '',
    stock: 0,
    description: ''
  });

  const categories = ['makanan', 'minuman', 'kebersihan', 'rumah-tangga'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        description: product.description
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: 0,
        image: '',
        category: '',
        stock: 0,
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...editingProduct, ...formData }
          : p
      ));
      toast({
        title: "Product Updated",
        description: "Produk berhasil diperbarui",
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        ...formData
      };
      setProducts([...products, newProduct]);
      toast({
        title: "Product Added",
        description: "Produk baru berhasil ditambahkan",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Product Deleted",
      description: "Produk berhasil dihapus",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Produk</h1>
          <p className="text-gray-600">Kelola produk dan stok barang</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Perbarui informasi produk' : 'Tambahkan produk baru ke toko'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama produk"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="image">URL Gambar</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi produk"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSaveProduct} className="flex-1">
                  {editingProduct ? 'Update' : 'Tambah'} Produk
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stok: {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
