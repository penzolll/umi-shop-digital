
# UMI Store Laravel Backend API

Complete Laravel 11 backend for UMI Store e-commerce platform with Sanctum authentication.

## Features

- **Authentication**: Laravel Sanctum with JWT tokens
- **User Management**: User registration, login, profile management
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, update, remove items from cart
- **Order Management**: Complete order processing with order items
- **Admin Panel**: Admin-only endpoints for managing products and orders
- **CORS Support**: Configured for frontend integration

## Quick Start

### 1. Installation

```bash
# Clone or extract the Laravel backend files
cd laravel-backend

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. Configuration

Edit the `.env` file with your settings:

```env
DB_DATABASE=umi_store
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Update with your frontend domain
SANCTUM_STATEFUL_DOMAINS=jamblangcloud.online,localhost,your-frontend-domain.com
```

### 3. Manual Setup (if deployment script fails)

```bash
# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Sanctum setup
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Clear cache
php artisan config:cache
php artisan route:cache
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (supports category and search filters)
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get single category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/{id}` - Update category (admin only)
- `DELETE /api/categories/{id}` - Delete category (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item quantity
- `DELETE /api/cart/{id}` - Remove item from cart

### Orders
- `POST /api/order` - Create new order (checkout)
- `GET /api/user/orders` - Get user's orders
- `GET /api/user/orders/{id}` - Get single order
- `GET /api/admin/orders` - Get all orders (admin only)
- `PUT /api/admin/orders/{id}` - Update order status (admin only)

## Authentication

The API uses Laravel Sanctum for authentication. Include the token in requests:

```
Authorization: Bearer {token}
```

## Default Users

After seeding, these users are available:

**Admin User:**
- Email: `admin@umistore.my.id`
- Password: `password`
- Role: `admin`

**Test User:**
- Email: `user@umistore.my.id`
- Password: `password`
- Role: `user`

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `role`, `timestamps`

### Categories
- `id`, `name`, `slug`, `description`, `is_active`, `timestamps`

### Products
- `id`, `name`, `description`, `price`, `image_url`, `stock`, `discount_percentage`, `unit`, `category`, `category_id`, `is_active`, `featured`, `timestamps`

### Cart
- `id`, `user_id`, `product_id`, `quantity`, `timestamps`

### Orders
- `id`, `order_number`, `user_id`, `status`, `total_amount`, `subtotal`, `tax`, `shipping_cost`, `discount`, `payment_method`, `payment_status`, `customer_name`, `phone`, `shipping_address`, `notes`, `timestamps`

### Order Items
- `id`, `order_id`, `product_id`, `quantity`, `price`, `timestamps`

## CORS Configuration

CORS is configured to allow all origins by default. For production, update `config/cors.php`:

```php
'allowed_origins' => ['https://your-frontend-domain.com'],
```

## Development

### Testing API Endpoints

```bash
# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@umistore.my.id","password":"password"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Running the Server

```bash
# Development server
php artisan serve

# Or use Laravel Sail for Docker
./vendor/bin/sail up
```

## Production Deployment

1. **Server Requirements:**
   - PHP 8.1+
   - MySQL/PostgreSQL
   - Composer
   - Web server (Apache/Nginx)

2. **Deployment Steps:**
   - Upload files to server
   - Run deployment script or manual setup
   - Configure web server to point to `/public`
   - Set proper file permissions
   - Configure SSL certificate

3. **Web Server Configuration:**

**Apache (.htaccess in public folder):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/laravel/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Support

For issues or questions about this Laravel backend implementation, please refer to the API documentation or check the Laravel documentation at https://laravel.com/docs.
