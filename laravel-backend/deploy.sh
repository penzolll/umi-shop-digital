
#!/bin/bash

# UMI Store Laravel Backend Deployment Script
echo "🚀 Starting UMI Store Backend Deployment..."

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: composer.json not found. Make sure you're in the Laravel project directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing Composer dependencies..."
composer install --optimize-autoloader --no-dev

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials and other settings."
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Publish Sanctum configuration
echo "🔐 Publishing Sanctum configuration..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run database migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Seed the database
echo "🌱 Seeding database with sample data..."
php artisan db:seed --force

# Create storage symbolic link
echo "🔗 Creating storage symbolic link..."
php artisan storage:link

# Clear and cache configurations
echo "🧹 Clearing and caching configurations..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache

# Set proper permissions
echo "🔧 Setting proper permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || echo "⚠️  Could not change ownership to www-data (you may need to run as root or adjust manually)"

echo "✅ UMI Store Backend deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Update SANCTUM_STATEFUL_DOMAINS with your frontend domain"
echo "3. Configure your web server (Apache/Nginx) to point to the /public directory"
echo "4. Test the API endpoints"
echo ""
echo "🔗 Test endpoints:"
echo "  GET  /api/products"
echo "  POST /api/login (email: admin@umistore.my.id, password: password)"
echo "  POST /api/register"
echo ""
echo "🎉 Happy coding!"
