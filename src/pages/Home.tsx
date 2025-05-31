
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import HeroCarousel from '../components/HeroCarousel';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CategoryForFilter {
  id: string;
  name: string;
  slug: string;
}

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Fetch products using React Query with error handling
  const { 
    data: products = [], 
    isLoading: productsLoading,
    error: productsError 
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      console.log('Fetching products for category:', selectedCategory);
      if (selectedCategory === 'all') {
        const result = await productsService.getProducts();
        console.log('Products fetched:', result);
        return result;
      } else {
        const result = await productsService.getProductsByCategory(selectedCategory);
        console.log('Products by category fetched:', result);
        return result;
      }
    },
    retry: 1, // Reduce retries to fail faster
    retryDelay: 1000,
    onError: (error) => {
      console.error('Query error:', error);
      if (error.code === 'ERR_NETWORK') {
        setIsUsingMockData(true);
      }
    },
    onSuccess: (data) => {
      // Check if we got mock data (has specific mock product IDs)
      if (data && data.length > 0 && data[0].id === '1') {
        setIsUsingMockData(true);
      } else {
        setIsUsingMockData(false);
      }
    }
  });

  // Fetch categories using React Query
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    retry: 1,
    retryDelay: 1000,
    onError: () => {
      // Use fallback categories if API fails
      return [
        { id: 'makanan', name: 'Makanan', slug: 'makanan' },
        { id: 'minuman', name: 'Minuman', slug: 'minuman' },
        { id: 'snack', name: 'Snack', slug: 'snack' },
        { id: 'bumbu-dapur', name: 'Bumbu Dapur', slug: 'bumbu-dapur' },
        { id: 'kebutuhan-rumah', name: 'Kebutuhan Rumah', slug: 'kebutuhan-rumah' },
        { id: 'produk-segar', name: 'Produk Segar', slug: 'produk-segar' }
      ];
    }
  });

  // Show error toast only for non-network errors
  useEffect(() => {
    if (productsError && productsError.code !== 'ERR_NETWORK') {
      toast({
        title: "Error",
        description: "Gagal memuat produk. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  }, [productsError]);

  // Transform categories for CategoryFilter component
  const categories: CategoryForFilter[] = [
    { id: 'all', name: 'Semua', slug: 'all' },
    ...categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    }))
  ];

  // Transform products to match ProductCard interface
  const transformedProducts = products.map(product => ({
    id: parseInt(product.id),
    name: product.name,
    price: product.price,
    image: product.image_url || "https://images.unsplash.com/photo-1586201375761-83865001e544?w=400",
    category: product.category,
    stock: product.stock,
    description: product.description || 'Tidak ada deskripsi tersedia'
  }));

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen">
        <HeroCarousel />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Show warning if using mock data */}
        {isUsingMockData && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Backend tidak dapat dijangkau. Menampilkan data contoh untuk demo. 
              Silakan periksa koneksi backend di <code>jamblangcloud.online</code>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Featured Products' : `${categories.find(c => c.id === selectedCategory)?.name || 'Products'}`}
            </h2>
            <Link to="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {transformedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {productsError ? 'Terjadi kesalahan saat memuat produk' : 'Tidak ada produk tersedia'}
              </p>
              {productsError && (
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Muat Ulang
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {transformedProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

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
