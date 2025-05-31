
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Keranjang Belanja Kosong
          </h2>
          <p className="text-gray-600 mb-8">
            Belum ada produk di keranjang. Yuk, mulai belanja!
          </p>
          <Link to="/">
            <Button size="lg">
              Mulai Belanja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-gray-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-lg font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">
                    Lanjut Belanja
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
