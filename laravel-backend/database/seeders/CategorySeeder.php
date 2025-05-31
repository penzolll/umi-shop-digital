
<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Makanan',
                'slug' => 'makanan',
                'description' => 'Produk makanan dan bahan pokok',
                'is_active' => true,
            ],
            [
                'name' => 'Minuman',
                'slug' => 'minuman',
                'description' => 'Berbagai jenis minuman',
                'is_active' => true,
            ],
            [
                'name' => 'Bumbu Dapur',
                'slug' => 'bumbu-dapur',
                'description' => 'Bumbu dan rempah untuk memasak',
                'is_active' => true,
            ],
            [
                'name' => 'Produk Segar',
                'slug' => 'produk-segar',
                'description' => 'Produk segar seperti sayur dan buah',
                'is_active' => true,
            ],
            [
                'name' => 'Kebutuhan Rumah',
                'slug' => 'kebutuhan-rumah',
                'description' => 'Kebutuhan rumah tangga',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
