import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Global variables to prevent re-initialization
let serverApp: any = null;
let serverInitialized = false;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5204,
    watch: {
      // Ignore server files to prevent restart loops
      ignored: [
        '**/server/**/*.ts',
        '**/server/**/*.js',
        '**/dist/**',
        '**/node_modules/**'
      ]
    }
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - Critical path
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],

          // UI Library - Split by usage frequency
          'vendor-ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu'
          ],
          'vendor-ui-extended': [
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-popover',
            '@radix-ui/react-alert-dialog'
          ],

          // Icons - Heavy dependency
          'vendor-icons': ['lucide-react'],

          // Utilities - Lightweight
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],

          // Forms - Only if used
          'vendor-forms': ['@hookform/resolvers', 'react-hook-form'],

          // Charts - Lazy loaded
          'vendor-charts': ['recharts'],

          // Date utilities
          'vendor-date': ['date-fns'],

          // Socket.io for real-time features
          'vendor-socket': ['socket.io-client']
        },

        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `${facadeModuleId}-[hash].js`;
        },

        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for faster builds
    reportCompressedSize: false, // Skip compressed size reporting
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: [
      'recharts', // Lazy load heavy chart library
      '@react-three/fiber', // Lazy load 3D library if used
      'framer-motion' // Lazy load animation library
    ]
  },
  plugins: [
    react({
      // Optimize React plugin for faster builds
      tsDecorators: true,
    }),
    ...(mode === "development" ? [stableExpressPlugin()] : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Add define to reduce bundle size
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  }
}));

function stableExpressPlugin(): Plugin {
  return {
    name: "stable-express-plugin",
    apply: "serve",
    configureServer(server) {
      // Only initialize once
      if (serverInitialized) {
        console.log('🔄 Express server already running, using existing instance');
        return;
      }

      // Simple one-time initialization
      console.log('🚀 Starting Express server integration...');

      // Add basic middleware to handle API routes
      server.middlewares.use('/api', (req, res, next) => {
        // Simple fallback for when server isn't ready
        if (!serverApp) {
          console.log('⚠️ Express server not ready, initializing...');
          initializeExpressServer().then(() => {
            if (serverApp) {
              serverApp(req, res, next);
            } else {
              // Send a basic response if server still not ready
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'Server initializing, please try again'
              }));
            }
          }).catch(error => {
            console.error('❌ Server initialization failed:', error.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Server initialization error'
            }));
          });
          return;
        }

        // Use existing server app
        try {
          serverApp(req, res, next);
        } catch (error) {
          console.error('❌ Express error:', error.message);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Internal server error'
            }));
          }
        }
      });

      // Initialize Express server asynchronously
      initializeExpressServer();
    }
  };
}

async function initializeExpressServer() {
  if (serverInitialized) return;

  try {
    console.log('🔧 Initializing Express server...');

    // Import server with timeout
    const serverModule = await Promise.race([
      import('./server/index.ts'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Server import timeout')), 15000)
      )
    ]) as any;

    console.log('📦 Server module imported successfully');

    // Initialize database connection (optional)
    if (serverModule.connectToDatabase) {
      try {
        console.log('🔌 Connecting to database...');
        await Promise.race([
          serverModule.connectToDatabase(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database timeout')), 10000)
          )
        ]);
        console.log('✅ Database connected');
      } catch (dbError) {
        console.warn('⚠️ Database connection failed:', dbError.message);
        console.log('📝 Continuing without database');
      }
    }

    // Create server app
    if (serverModule.createServer) {
      serverApp = serverModule.createServer();
      console.log('✅ Express server created successfully');
    } else {
      throw new Error('createServer function not found');
    }

    serverInitialized = true;
    console.log('🎯 Express server ready at /api/*');
    console.log('🧪 Test: http://localhost:5204/api/auth/test');

  } catch (error) {
    console.error('❌ Failed to initialize Express server:', error.message);
    console.log('⚠️ API endpoints will not be available');

    // Create a minimal fallback server
    serverApp = (req: any, res: any) => {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'Server initialization failed',
        details: error.message
      }));
    };
  }
}