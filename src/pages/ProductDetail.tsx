
import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productsService.getProduct(id) : null,
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(parseInt(product.id), quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product.name} ditambahkan ke keranjang`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <Navigate to="/" replace />;
  }

  const discountedPrice = product.discount_percentage 
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1586201375761-83865001e544?w=400"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="capitalize mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-4xl font-bold text-green-600">
                {formatPrice(discountedPrice)}
              </p>
              {product.discount_percentage && product.discount_percentage > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </p>
                  <Badge variant="destructive">
                    -{product.discount_percentage}%
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Tidak ada deskripsi tersedia'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Stok Tersedia</h3>
              <p className="text-gray-600">
                {product.stock} {product.unit} tersedia
              </p>
            </div>
          </div>

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
                      {formatPrice(discountedPrice * quantity)}
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
