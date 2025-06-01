
#!/bin/bash

# Quick Setup Script - Simpler version
echo "🚀 UMI Store Quick Setup..."

# Make auto-deploy executable
chmod +x auto-deploy.sh

# Run the main deployment
sudo ./auto-deploy.sh

echo "✅ Quick setup completed!"
echo "Your API is ready at: https://jamblangcloud.online/api"
