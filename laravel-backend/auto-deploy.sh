
#!/bin/bash

# UMI Store Laravel Backend Auto Deployment Script
# For jamblangcloud.online

set -e  # Exit on any error

echo "🚀 Starting UMI Store Laravel Backend Auto Deployment..."
echo "Domain: jamblangcloud.online"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (sudo ./auto-deploy.sh)"
    exit 1
fi

# Get current user (the one who ran sudo)
CURRENT_USER=${SUDO_USER:-$USER}

print_status "Updating system packages..."
apt update && apt upgrade -y

print_status "Installing required packages..."
apt install -y software-properties-common curl wget unzip git

# Install PHP 8.2
print_status "Installing PHP 8.2 and extensions..."
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip php8.2-intl php8.2-bcmath php8.2-gd php8.2-tokenizer

# Install Composer
print_status "Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install MySQL
print_status "Installing MySQL..."
apt install -y mysql-server

# Secure MySQL installation automatically
print_status "Securing MySQL installation..."
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Create database and user
print_status "Creating database and user..."
DB_PASSWORD=$(openssl rand -base64 32)
mysql -e "CREATE DATABASE IF NOT EXISTS umi_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'umi_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON umi_store.* TO 'umi_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Create Laravel project
print_status "Creating Laravel project..."
cd /var/www
rm -rf umi-backend-laravel 2>/dev/null || true

# Create project directory
mkdir -p umi-backend-laravel
cd umi-backend-laravel

# Initialize as Laravel project
composer create-project laravel/laravel . "11.*" --prefer-dist --no-interaction

# Install Sanctum
print_status "Installing Laravel Sanctum..."
composer require laravel/sanctum

# Set proper ownership
chown -R $CURRENT_USER:www-data /var/www/umi-backend-laravel

# Create .env file
print_status "Configuring environment..."
cat > .env << EOF
APP_NAME="UMI Store API"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://jamblangcloud.online

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=umi_store
DB_USERNAME=umi_user
DB_PASSWORD=$DB_PASSWORD

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.jamblangcloud.online

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@jamblangcloud.online"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="\${APP_NAME}"
VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"

SANCTUM_STATEFUL_DOMAINS=jamblangcloud.online,localhost,127.0.0.1,*.lovableproject.com
CORS_ALLOWED_ORIGINS=*
CORS_ALLOWED_METHODS=*
CORS_ALLOWED_HEADERS=*
EOF

# Generate app key
print_status "Generating application key..."
php artisan key:generate --force

# Copy custom files (these should be in the same directory as this script)
print_status "Copying custom application files..."

# Check if custom files exist
if [ ! -f "../config/cors.php" ]; then
    print_warning "Custom files not found in parent directory. Using defaults."
else
    # Copy all custom files
    cp -r ../config/* config/ 2>/dev/null || true
    cp -r ../app/* app/ 2>/dev/null || true
    cp -r ../database/* database/ 2>/dev/null || true
    cp -r ../routes/* routes/ 2>/dev/null || true
    cp ../bootstrap/app.php bootstrap/ 2>/dev/null || true
    cp ../composer.json . 2>/dev/null || true
fi

# Install/update dependencies
print_status "Installing dependencies..."
composer install --optimize-autoloader --no-dev --no-interaction

# Publish Sanctum
print_status "Publishing Sanctum configuration..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --force

# Set proper permissions
print_status "Setting permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Run migrations
print_status "Running database migrations..."
php artisan migrate --force

# Seed database
print_status "Seeding database..."
php artisan db:seed --force

# Create storage link
print_status "Creating storage symbolic link..."
php artisan storage:link

# Cache configurations for production
print_status "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/jamblangcloud.online << 'EOF'
server {
    listen 80;
    server_name jamblangcloud.online www.jamblangcloud.online;
    root /var/www/umi-backend-laravel/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    index index.php index.html;

    charset utf-8;

    # Handle CORS
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Security headers for API
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site and remove default
ln -sf /etc/nginx/sites-available/jamblangcloud.online /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Restart services
print_status "Restarting services..."
systemctl restart php8.2-fpm
systemctl restart nginx
systemctl enable php8.2-fpm
systemctl enable nginx

# Create deployment info file
cat > /var/www/umi-backend-laravel/deployment-info.txt << EOF
UMI Store Laravel Backend Deployment Information
================================================

Deployment Date: $(date)
Domain: jamblangcloud.online
Laravel Version: 11.x
PHP Version: 8.2

Database Configuration:
- Database: umi_store
- Username: umi_user
- Password: $DB_PASSWORD

Default Admin Account:
- Email: admin@umistore.my.id
- Password: password

API Base URL: https://jamblangcloud.online/api

Test Endpoints:
- GET  /api/products
- GET  /api/categories
- POST /api/login
- POST /api/register

Next Steps:
1. Point your domain DNS to this server IP
2. Run: sudo certbot --nginx -d jamblangcloud.online
3. Update frontend API configuration
4. Test all endpoints

Logs Location:
- Laravel: /var/www/umi-backend-laravel/storage/logs/laravel.log
- Nginx: /var/log/nginx/error.log
EOF

# Final ownership fix
chown -R $CURRENT_USER:www-data /var/www/umi-backend-laravel

print_status "🎉 Deployment completed successfully!"
echo ""
echo "================================================"
echo "📋 DEPLOYMENT SUMMARY"
echo "================================================"
echo "✅ Laravel 11 installed and configured"
echo "✅ Database created and seeded"
echo "✅ Nginx configured for jamblangcloud.online"
echo "✅ SSL ready (run certbot command below)"
echo "✅ Firewall configured"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Point jamblangcloud.online DNS to this server IP: $(curl -s ifconfig.me)"
echo "2. Setup SSL certificate:"
echo "   sudo certbot --nginx -d jamblangcloud.online"
echo ""
echo "🧪 TEST YOUR API:"
echo "curl -X GET http://jamblangcloud.online/api/products"
echo "curl -X POST http://jamblangcloud.online/api/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@umistore.my.id\",\"password\":\"password\"}'"
echo ""
echo "📊 DATABASE PASSWORD: $DB_PASSWORD"
echo "   (Also saved in /var/www/umi-backend-laravel/deployment-info.txt)"
echo ""
echo "🎯 Frontend API URL: https://jamblangcloud.online/api"
echo "================================================"
