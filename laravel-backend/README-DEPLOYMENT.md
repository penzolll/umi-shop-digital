
# UMI Store Laravel Backend - Production Ready Deployment

## 🚀 SUPER QUICK DEPLOYMENT (Recommended)

### One-Command Setup
```bash
# Download and run the super deployment script
wget https://raw.githubusercontent.com/your-repo/umi-store/main/laravel-backend/super-deploy.sh
chmod +x super-deploy.sh
sudo ./super-deploy.sh
```

### What This Does
✅ **Complete Laravel 11 Setup** - Fully configured with Sanctum authentication  
✅ **MySQL Database** - Auto-configured with sample data  
✅ **Admin User Ready** - admin@umistore.my.id / password  
✅ **Image Upload System** - Ready for product photos (up to 10MB)  
✅ **Nginx Configuration** - Optimized for jamblangcloud.online  
✅ **CORS Setup** - Perfect frontend integration  
✅ **Security Hardened** - Production-ready security measures  
✅ **SSL Preparation** - Ready for HTTPS certificate  

## 🎯 After Deployment

### 1. Point Your Domain
Point `jamblangcloud.online` DNS A record to your EC2 IP address.

### 2. Setup SSL Certificate
```bash
sudo certbot --nginx -d jamblangcloud.online
```

### 3. Test Everything
```bash
chmod +x test-everything.sh
./test-everything.sh
```

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@umistore.my.id`
- Password: `password`

**Database:**
- Database: `umi_store`
- Username: `umi_user`
- Password: Auto-generated (check deployment-info.txt)

## 📡 API Endpoints

**Base URL:** `https://jamblangcloud.online/api`

### Authentication
- `POST /login` - Admin/User login
- `POST /register` - User registration
- `POST /logout` - Logout
- `GET /profile` - Get user profile

### Products (Public)
- `GET /products` - Get all products
- `GET /products/{id}` - Get single product

### Products (Admin Only)
- `POST /products` - Create product (with image upload)
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

## 📸 Image Upload Features

✅ **Supported Formats:** JPEG, PNG, JPG, GIF  
✅ **Max File Size:** 10MB  
✅ **Auto Storage:** `/storage/products/`  
✅ **URL Generation:** Automatic public URLs  
✅ **Security:** File type validation  

### Upload Example
```bash
curl -X POST https://jamblangcloud.online/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Product Name" \
  -F "price=25000" \
  -F "stock=100" \
  -F "category=Category Name" \
  -F "unit=pcs" \
  -F "description=Product description" \
  -F "image=@/path/to/image.jpg"
```

## 🧪 Quick Tests

### Test API Connection
```bash
curl -X GET https://jamblangcloud.online/api/products
```

### Test Admin Login
```bash
curl -X POST https://jamblangcloud.online/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@umistore.my.id","password":"password"}'
```

### Frontend Integration Test
The frontend at your domain should automatically connect to the API.

## 🔧 Troubleshooting

### Check Logs
```bash
# Laravel application logs
tail -f /var/www/umi-backend-laravel/storage/logs/laravel.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.2-fpm.log
```

### Restart Services
```bash
sudo systemctl restart nginx php8.2-fpm mysql
```

### Fix Permissions
```bash
sudo chown -R www-data:www-data /var/www/umi-backend-laravel
sudo chmod -R 775 /var/www/umi-backend-laravel/storage
sudo chmod -R 775 /var/www/umi-backend-laravel/public/uploads
```

### Reset Database
```bash
cd /var/www/umi-backend-laravel
php artisan migrate:fresh --seed
```

## 🎯 Frontend Integration

Your frontend is already configured with the correct API URL:
```typescript
export const config = {
  api: {
    baseUrl: 'https://jamblangcloud.online/api'
  }
};
```

## 📊 Performance Optimizations

✅ **PHP OPcache** - Enabled for better performance  
✅ **Nginx Caching** - Static file caching configured  
✅ **Laravel Caching** - Config, routes, and views cached  
✅ **Database Indexing** - Optimized database queries  
✅ **File Upload Optimization** - Efficient image handling  

## 🛡️ Security Features

✅ **CORS Protection** - Properly configured cross-origin requests  
✅ **CSRF Protection** - Laravel's built-in CSRF protection  
✅ **Input Validation** - All inputs validated and sanitized  
✅ **File Upload Security** - File type and size validation  
✅ **Authentication** - Laravel Sanctum token-based auth  
✅ **Admin Protection** - Role-based access control  

## 🚀 Production Ready

This deployment is production-ready with:
- Error logging and monitoring
- Automated backups support
- Scalable architecture
- Security hardening
- Performance optimization
- Easy maintenance procedures

**Your UMI Store backend is now ready for production use!**
