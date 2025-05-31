
# API Integration Documentation

## Overview
This document outlines the API integration between the UMI Store frontend (Lovable) and the Laravel backend.

## Base Configuration
- **API Base URL**: Configurable in `src/config/env.ts`
- **Default**: `https://api.umistore.my.id/api`
- **Timeout**: 10 seconds
- **Authentication**: Bearer token stored in localStorage

## Authentication Flow

### 1. Laravel Authentication
The primary authentication is handled by the Laravel backend using Sanctum.

**Login Process:**
1. User submits email/password
2. Frontend calls `/login` endpoint
3. Backend returns user data and token
4. Token stored in localStorage as `laravel_token`
5. User data stored in localStorage as `user`

**Registration Process:**
1. User submits name, email, password
2. Frontend calls `/register` endpoint
3. Backend creates user and returns data with token
4. Same storage process as login

### 2. Google OAuth Integration
Google OAuth is handled through Supabase with sync to Laravel backend.

**Google Login Process:**
1. User clicks "Login with Google"
2. Supabase handles OAuth flow
3. On success, frontend syncs with Laravel backend
4. Laravel creates/updates user record
5. Returns Laravel token for API access

## API Endpoints

### Authentication
- `POST /login` - Email/password login
- `POST /register` - User registration
- `POST /logout` - Logout (clears server session)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Products
- `GET /products` - Get all products (with optional filters)
- `GET /products/{id}` - Get single product
- `POST /products` - Create product (admin only)
- `PUT /products/{id}` - Update product (admin only)
- `DELETE /products/{id}` - Delete product (admin only)

### Cart
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/{id}` - Update cart item quantity
- `DELETE /cart/{id}` - Remove item from cart

### Orders
- `POST /order` - Create new order (checkout)
- `GET /user/orders` - Get user's orders
- `GET /user/orders/{id}` - Get single order

### Admin Orders
- `GET /admin/orders` - Get all orders (admin only)
- `PUT /admin/orders/{id}` - Update order status (admin only)

## Request/Response Format

### Standard Request Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
X-CSRF-TOKEN: {csrf_token} (when available)
```

### Standard Response Format
```json
{
  "success": true,
  "data": {}, 
  "message": "Success message"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": {} // Validation errors if applicable
}
```

## Error Handling

### Status Codes
- `401 Unauthorized` - Invalid/expired token, redirects to login
- `403 Forbidden` - User doesn't have permission
- `422 Unprocessable Entity` - Validation errors
- `500+ Server Error` - Backend server issues

### Frontend Error Handling
The API service automatically handles:
- Token refresh on 401 errors
- Redirect to login on authentication failures
- Logging of validation errors
- User-friendly error messages

## Development vs Production

### Development
- API URL: `http://localhost:8000/api`
- CORS enabled for localhost:5173
- Debug mode enabled

### Production
- API URL: `https://api.umistore.my.id/api`
- CORS configured for production domain
- Error logging enabled

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **CORS**: Properly configured for allowed origins
3. **CSRF Protection**: CSRF tokens included when available
4. **Input Validation**: All inputs validated on both frontend and backend
5. **Rate Limiting**: Implemented on Laravel backend

## Next Steps

1. **Laravel Backend Setup**: Create Laravel 11 project with required endpoints
2. **Database Migration**: Set up all required tables and relationships
3. **Testing**: Comprehensive API testing with Postman
4. **Integration**: Connect frontend services to actual Laravel backend
5. **Deployment**: Set up production environment and CI/CD pipeline
