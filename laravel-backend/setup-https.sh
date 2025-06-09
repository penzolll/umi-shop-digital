
#!/bin/bash

# HTTPS Setup Script for jamblangcloud.online
# This script will setup SSL certificate and configure HTTPS

set -e  # Exit on any error

echo "🔒 Setting up HTTPS with SSL Certificate for jamblangcloud.online..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (sudo ./setup-https.sh)"
    exit 1
fi

# Check if domain resolves to this server
print_info "Checking domain resolution..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short jamblangcloud.online | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "Domain jamblangcloud.online does not resolve to this server IP ($SERVER_IP)"
    print_warning "Current domain IP: $DOMAIN_IP"
    print_warning "Please update your DNS records first!"
    echo ""
    echo "DNS Setup Instructions:"
    echo "1. Go to your domain registrar or DNS provider"
    echo "2. Add/Update A record: jamblangcloud.online -> $SERVER_IP"
    echo "3. Add/Update A record: www.jamblangcloud.online -> $SERVER_IP"
    echo "4. Wait for DNS propagation (5-30 minutes)"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install Certbot if not already installed
print_status "Installing/Updating Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily for standalone certificate generation
print_status "Stopping Nginx for certificate generation..."
systemctl stop nginx

# Generate SSL certificate using standalone mode
print_status "Generating SSL certificate for jamblangcloud.online..."
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@jamblangcloud.online \
    --domains jamblangcloud.online,www.jamblangcloud.online

if [ $? -ne 0 ]; then
    print_error "Failed to generate SSL certificate"
    print_info "Trying without www subdomain..."
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email admin@jamblangcloud.online \
        --domains jamblangcloud.online
fi

# Create enhanced Nginx configuration with HTTPS
print_status "Creating HTTPS-enabled Nginx configuration..."
cat > /etc/nginx/sites-available/jamblangcloud.online << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name jamblangcloud.online www.jamblangcloud.online;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name jamblangcloud.online www.jamblangcloud.online;
    root /var/www/umi-backend-laravel/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/jamblangcloud.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jamblangcloud.online/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.php index.html;
    charset utf-8;

    # Enhanced CORS headers for API
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-CSRF-TOKEN,Accept' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-CSRF-TOKEN,Accept';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Increase upload size for image uploads
    client_max_body_size 10M;

    # Main location block
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Handle uploads directory
    location /uploads/ {
        alias /var/www/umi-backend-laravel/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # Handle storage directory
    location /storage/ {
        alias /var/www/umi-backend-laravel/public/storage/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # Handle API routes
    location /api/ {
        try_files $uri $uri/ /index.php?$query_string;
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        
        # Increase timeouts for large uploads
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }

    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' '*' always;
    }
}
EOF

# Enable the site configuration
print_status "Enabling site configuration..."
ln -sf /etc/nginx/sites-available/jamblangcloud.online /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Update firewall to allow HTTPS
print_status "Updating firewall for HTTPS..."
ufw allow 443/tcp

# Start Nginx
print_status "Starting Nginx with HTTPS configuration..."
systemctl start nginx
systemctl reload nginx

# Enable automatic certificate renewal
print_status "Setting up automatic certificate renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Test HTTPS connection
print_status "Testing HTTPS connection..."
sleep 3

if curl -s -I https://jamblangcloud.online/api/products > /dev/null 2>&1; then
    print_status "✅ HTTPS is working correctly!"
else
    print_warning "HTTPS test failed, but configuration is in place"
fi

# Update Laravel .env for HTTPS
if [ -f "/var/www/umi-backend-laravel/.env" ]; then
    print_status "Updating Laravel .env for HTTPS..."
    sed -i 's|APP_URL=http://jamblangcloud.online|APP_URL=https://jamblangcloud.online|g' /var/www/umi-backend-laravel/.env
    
    # Clear Laravel cache
    cd /var/www/umi-backend-laravel
    php artisan config:cache
    php artisan route:cache
fi

print_status "🎉 HTTPS Setup Complete!"
echo ""
echo "================================================"
echo "🔒 SSL CERTIFICATE SETUP SUMMARY"
echo "================================================"
echo "✅ SSL Certificate generated for jamblangcloud.online"
echo "✅ Nginx configured for HTTPS with security headers"
echo "✅ HTTP to HTTPS redirect enabled"
echo "✅ CORS headers configured for API access"
echo "✅ Automatic certificate renewal enabled"
echo "✅ Firewall updated to allow HTTPS traffic"
echo ""
echo "🌐 Your site is now accessible via:"
echo "   https://jamblangcloud.online"
echo "   https://jamblangcloud.online/api"
echo ""
echo "🧪 Test HTTPS API:"
echo "curl -X GET https://jamblangcloud.online/api/products"
echo ""
echo "🔐 Certificate will auto-renew every 90 days"
echo "================================================"
