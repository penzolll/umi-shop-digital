
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Beras Premium 5kg",
      price: 65000,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e544?w=400",
      category: "makanan",
      stock: 50,
      description: "Beras premium kualitas terbaik dengan butiran yang pulen dan aroma harum. Cocok untuk keluarga Indonesia yang mengutamakan kualitas makanan sehari-hari."
    },
    {
      id: 2,
      name: "Minyak Goreng 2L",
      price: 32000,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
      category: "makanan",
      stock: 30,
      description: "Minyak goreng berkualitas tinggi yang terbuat dari kelapa sawit pilihan. Hasil gorengan lebih renyah dan tidak mudah tengik."
    },
    {
      id: 3,
      name: "Sabun Mandi",
      price: 15000,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      category: "kebersihan",
      stock: 100,
      description: "Sabun mandi dengan aroma segar dan formula lembut yang cocok untuk semua jenis kulit. Mengandung moisturizer alami."
    }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          const foundProduct = mockProducts.find(p => p.id === parseInt(id || '0'));
          setProduct(foundProduct || null);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product.name} ditambahkan ke keranjang`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="capitalize mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-4xl font-bold text-green-600 mb-4">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Stok Tersedia</h3>
              <p className="text-gray-600">
                {product.stock} items tersedia
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Jumlah</h3>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
