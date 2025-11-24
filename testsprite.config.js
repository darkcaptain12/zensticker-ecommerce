/** @type {import('testsprite').Config} */
module.exports = {
  // Project configuration
  projectName: 'zensticker-ecommerce',
  projectPath: process.cwd(),
  
  // Application configuration
  type: 'frontend', // 'frontend' or 'backend'
  localPort: 3001, // Next.js port (site 3001'de çalışıyor)
  
  // Test configuration
  testScope: 'codebase', // 'codebase' or 'diff'
  
  // Paths configuration
  pathname: '', // Base pathname (empty for root)
  
  // Authentication (if needed)
  needLogin: true, // Admin paneli testleri için login gerekli
  loginCredentials: {
    email: 'admin@zensticker.com',
    password: 'Admin123!',
  },
  
  // Environment variables
  env: {
    NODE_ENV: 'test',
    // Add other test environment variables here
  },
  
  // Test settings
  settings: {
    // Timeout for test operations (in milliseconds)
    timeout: 30000,
    
    // Screenshot settings
    screenshot: {
      enabled: true,
      path: './testsprite-screenshots',
    },
    
    // Video recording settings
    video: {
      enabled: false,
      path: './testsprite-videos',
    },
  },
  
  // Exclude paths from testing
  exclude: [
    '/api',
    '/admin',
    '/_next',
    '/static',
  ],
  
  // Custom test paths - Public pages
  testPaths: [
    '/',
    '/kategoriler',
    '/kampanyalar',
    '/kargo-takip',
    '/iletisim',
    '/giris',
    '/kayit',
  ],
  
  // Admin panel test paths
  adminTestPaths: [
    '/admin',
    '/admin/urunler',
    '/admin/kategoriler',
    '/admin/kampanyalar',
    '/admin/banner',
    '/admin/site-ayarlari',
    '/admin/static-pages',
    '/admin/siparisler',
    '/admin/kullanicilar',
  ],
  
  // PayTR Test Mode Configuration
  paytr: {
    testMode: true, // PayTR test mode aktif
    testCard: {
      number: '4355084355084358',
      cvv: '000',
      month: '12',
      year: '2025',
    },
  },
}

