
<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'name' => 'Beras Premium 5kg',
                'description' => 'Beras premium kualitas terbaik untuk keluarga',
                'price' => 75000,
                'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e544?w=400',
                'stock' => 50,
                'discount_percentage' => 0,
                'unit' => 'kg',
                'category' => 'Makanan',
                'is_active' => true,
                'featured' => true,
            ],
            [
                'name' => 'Minyak Goreng 1L',
                'description' => 'Minyak goreng berkualitas untuk memasak',
                'price' => 25000,
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
                'stock' => 30,
                'discount_percentage' => 10,
                'unit' => 'liter',
                'category' => 'Bumbu Dapur',
                'is_active' => true,
                'featured' => false,
            ],
            [
                'name' => 'Telur Ayam 1kg',
                'description' => 'Telur ayam segar pilihan',
                'price' => 28000,
                'image_url' => 'https://images.unsplash.com/photo-1569288052389-dac9b01ac8d8?w=400',
                'stock' => 25,
                'discount_percentage' => 0,
                'unit' => 'kg',
                'category' => 'Produk Segar',
                'is_active' => true,
                'featured' => true,
            ],
            [
                'name' => 'Gula Pasir 1kg',
                'description' => 'Gula pasir putih berkualitas',
                'price' => 15000,
                'image_url' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
                'stock' => 40,
                'discount_percentage' => 0,
                'unit' => 'kg',
                'category' => 'Bumbu Dapur',
                'is_active' => true,
                'featured' => false,
            ],
            [
                'name' => 'Susu UHT 1L',
                'description' => 'Susu UHT full cream',
                'price' => 18000,
                'image_url' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
                'stock' => 35,
                'discount_percentage' => 5,
                'unit' => 'liter',
                'category' => 'Minuman',
                'is_active' => true,
                'featured' => true,
            ],
            [
                'name' => 'Roti Tawar',
                'description' => 'Roti tawar lembut dan segar',
                'price' => 12000,
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
                'stock' => 20,
                'discount_percentage' => 0,
                'unit' => 'pcs',
                'category' => 'Makanan',
                'is_active' => true,
                'featured' => false,
            ],
            [
                'name' => 'Sabun Cuci Piring 800ml',
                'description' => 'Sabun cuci piring anti bakteri',
                'price' => 8500,
                'image_url' => 'https://images.unsplash.com/photo-1563453392212-326e67d4c2d4?w=400',
                'stock' => 45,
                'discount_percentage' => 15,
                'unit' => 'botol',
                'category' => 'Kebutuhan Rumah',
                'is_active' => true,
                'featured' => false,
            ],
            [
                'name' => 'Kopi Bubuk 200g',
                'description' => 'Kopi bubuk robusta pilihan',
                'price' => 22000,
                'image_url' => 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
                'stock' => 30,
                'discount_percentage' => 0,
                'unit' => 'pack',
                'category' => 'Minuman',
                'is_active' => true,
                'featured' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
