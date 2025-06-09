
// Environment configuration - Updated for Laravel Backend
export const config = {
  supabase: {
    url: "https://aiyevcdiinciusiqpinp.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeWV2Y2RpaW5jaXVzaXFwaW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTE1MjAsImV4cCI6MjA2MzgyNzUyMH0.vmiaFrJ87kR13X4-GrHKhgub8hAuVgdnlAFdRRQPoXw"
  },
  api: {
    // Laravel backend API URL - production ready
    baseUrl: import.meta.env.VITE_API_URL || 'https://jamblangcloud.online/api',
    timeout: 15000  // Increased timeout for image uploads
  },
  app: {
    name: 'UMI Store',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development'
  }
};
