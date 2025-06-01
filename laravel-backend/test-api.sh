
#!/bin/bash

# API Testing Script
echo "🧪 Testing UMI Store API..."

BASE_URL="https://jamblangcloud.online/api"
echo "Base URL: $BASE_URL"

echo ""
echo "1. Testing Products Endpoint..."
curl -s -X GET "$BASE_URL/products" | jq '.' || echo "❌ Products endpoint failed"

echo ""
echo "2. Testing Categories Endpoint..."
curl -s -X GET "$BASE_URL/categories" | jq '.' || echo "❌ Categories endpoint failed"

echo ""
echo "3. Testing Login Endpoint..."
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@umistore.my.id","password":"password"}')

echo $RESPONSE | jq '.' || echo "❌ Login endpoint failed"

# Extract token if login successful
TOKEN=$(echo $RESPONSE | jq -r '.token // empty')

if [ ! -z "$TOKEN" ]; then
    echo ""
    echo "4. Testing Authenticated Endpoint..."
    curl -s -X GET "$BASE_URL/profile" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json" | jq '.' || echo "❌ Profile endpoint failed"
else
    echo "❌ Could not get authentication token"
fi

echo ""
echo "✅ API testing completed!"
