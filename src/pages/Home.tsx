
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import HeroCarousel from '../components/HeroCarousel';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockProducts: Product[] = [
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
    },
    {
      id: 4,
      name: "Deterjen Bubuk 1kg",
      price: 28000,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
      category: "kebersihan",
      stock: 25,
      description: "Deterjen bubuk untuk mencuci bersih"
    },
    {
      id: 5,
      name: "Susu UHT 1L",
      price: 18000,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
      category: "minuman",
      stock: 40,
      description: "Susu UHT segar dan bergizi"
    },
    {
      id: 6,
      name: "Teh Celup",
      price: 12000,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
      category: "minuman",
      stock: 60,
      description: "Teh celup aroma harum"
    }
  ];

  const mockCategories: Category[] = [
    { id: 1, name: "Semua", slug: "all" },
    { id: 2, name: "Makanan", slug: "makanan" },
    { id: 3, name: "Minuman", slug: "minuman" },
    { id: 4, name: "Kebersihan", slug: "kebersihan" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          setProducts(mockProducts);
          setCategories(mockCategories);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data as fallback
        setProducts(mockProducts);
        setCategories(mockCategories);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Featured Products' : `${categories.find(c => c.slug === selectedCategory)?.name || 'Products'}`}
            </h2>
            <Link to="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Promo Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Special Offers</h2>
          <p className="text-xl mb-6">Get up to 30% off on selected items!</p>
          <Button size="lg" variant="secondary">
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
