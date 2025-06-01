
# UMI Store Laravel Backend - Easy Deployment

## Quick Start (1 Command)

```bash
# Download dan jalankan script deployment
wget https://raw.githubusercontent.com/your-repo/umi-store/main/laravel-backend/auto-deploy.sh
chmod +x auto-deploy.sh
sudo ./auto-deploy.sh
```

## Manual Steps

### 1. Upload Files
Upload semua file dari folder `laravel-backend/` ke server EC2 Anda.

### 2. Run Deployment Script
```bash
chmod +x auto-deploy.sh
sudo ./auto-deploy.sh
```

### 3. Setup DNS
Point domain `jamblangcloud.online` ke IP server EC2 Anda.

### 4. Setup SSL
```bash
sudo certbot --nginx -d jamblangcloud.online
```

### 5. Test API
```bash
chmod +x test-api.sh
./test-api.sh
```

## What the Script Does

✅ Installs PHP 8.2, MySQL, Nginx, Composer
✅ Creates Laravel 11 project with Sanctum
✅ Configures database automatically
✅ Sets up all custom models, controllers, migrations
✅ Configures Nginx for jamblangcloud.online
✅ Sets proper permissions and security
✅ Seeds database with sample data
✅ Prepares SSL certificate setup

## Default Credentials

**Admin Account:**
- Email: `admin@umistore.my.id`
- Password: `password`

**Database:**
- Database: `umi_store`
- Username: `umi_user`
- Password: Auto-generated (saved in deployment-info.txt)

## API Endpoints

- Base URL: `https://jamblangcloud.online/api`
- Products: `GET /api/products`
- Login: `POST /api/login`
- Register: `POST /api/register`
- Cart: `GET|POST|PUT|DELETE /api/cart`
- Orders: `POST /api/order`

## Frontend Integration

Update your frontend `src/config/env.ts`:

```typescript
export const API_BASE_URL = 'https://jamblangcloud.online/api';
```

## Troubleshooting

**Check logs:**
```bash
tail -f /var/www/umi-backend-laravel/storage/logs/laravel.log
tail -f /var/log/nginx/error.log
```

**Restart services:**
```bash
sudo systemctl restart nginx php8.2-fpm
```

**Fix permissions:**
```bash
sudo chown -R www-data:www-data /var/www/umi-backend-laravel/storage
sudo chmod -R 775 /var/www/umi-backend-laravel/storage
```

## Support

Jika ada error, kirim log file:
- `/var/www/umi-backend-laravel/storage/logs/laravel.log`
- `/var/log/nginx/error.log`
