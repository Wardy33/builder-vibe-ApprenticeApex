import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5204,
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
    ...(mode === "development" ? [expressPlugin()] : [])
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

function expressPlugin(): Plugin {
  let serverInitialized = false;
  let expressApp: any = null;

  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Prevent multiple initializations
      if (serverInitialized) {
        console.log('🔄 Express server already initialized, skipping...');
        return;
      }

      try {
        console.log('🚀 Initializing Express server plugin...');
        
        // Add global error handlers first
        process.removeAllListeners('uncaughtException');
        process.removeAllListeners('unhandledRejection');
        
        process.on('uncaughtException', (error) => {
          console.error('❌ Uncaught Exception in Express plugin:', error.message);
          // Don't exit, just log
        });

        process.on('unhandledRejection', (reason: any) => {
          console.error('❌ Unhandled Rejection in Express plugin:', reason);
          // Don't exit, just log
        });

        // Import server functions with error handling
        let createServer, connectToDatabase;
        try {
          const serverModule = require('./server/index.ts');
          createServer = serverModule.createServer;
          connectToDatabase = serverModule.connectToDatabase;
          
          if (!createServer) {
            throw new Error('createServer function not found in server/index.ts');
          }
        } catch (importError) {
          console.error('❌ Failed to import server modules:', importError.message);
          console.log('🔄 Attempting alternative import...');
          
          // Try alternative import method
          try {
            const serverModule = await import('./server/index.ts');
            createServer = serverModule.createServer;
            connectToDatabase = serverModule.connectToDatabase;
          } catch (altImportError) {
            console.error('❌ Alternative import failed:', altImportError.message);
            console.log('⚠️  Express server will not be available');
            return;
          }
        }

        // Connect to database with timeout and fallback
        console.log('🔌 Attempting database connection...');
        if (connectToDatabase) {
          try {
            const dbConnected = await Promise.race([
              connectToDatabase(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database connection timeout')), 10000)
              )
            ]);
            
            if (dbConnected) {
              console.log('✅ Database connection established');
            } else {
              console.log('⚠️  Database connection failed, continuing without DB');
            }
          } catch (dbError) {
            console.warn('⚠️  Database connection failed:', dbError.message);
            console.log('📝 Continuing in development mode without database');
          }
        } else {
          console.log('⚠️  No database connection function found, continuing without DB');
        }

        // Create Express app with error handling
        console.log('🔨 Creating Express application...');
        try {
          expressApp = createServer();
          console.log('✅ Express application created successfully');
        } catch (appError) {
          console.error('❌ Failed to create Express app:', appError.message);
          console.log('⚠️  Express server will not be available');
          return;
        }

        // Add Express app as middleware to Vite dev server with error handling
        console.log('🔗 Integrating Express with Vite dev server...');
        server.middlewares.use((req, res, next) => {
          // Add error boundary for each request
          try {
            if (expressApp) {
              expressApp(req, res, next);
            } else {
              next();
            }
          } catch (middlewareError) {
            console.error('❌ Express middleware error:', middlewareError.message);
            // Send error response if headers not sent
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: middlewareError.message
              }));
            }
          }
        });

        serverInitialized = true;
        console.log('🎯 Express plugin initialization completed successfully');
        console.log('📡 API endpoints available at: http://localhost:5204/api/*');
        console.log('🧪 Test auth endpoint: http://localhost:5204/api/auth/test');

      } catch (pluginError) {
        console.error('❌ Express plugin initialization failed:', pluginError.message);
        console.error('Stack trace:', pluginError.stack);
        console.log('⚠️  Vite will continue without Express integration');
      }
    },

    // Handle server restart/cleanup
    buildStart() {
      // Reset initialization flag when build starts
      if (serverInitialized) {
        console.log('🔄 Build started, resetting server state...');
        serverInitialized = false;
        expressApp = null;
      }
    },

    // Handle hot updates more gracefully
    handleHotUpdate({ file, server: viteServer }) {
      // Only restart if server files changed
      if (file.includes('/server/') && !file.includes('.test.') && !file.includes('.spec.')) {
        console.log(`🔥 Server file changed: ${file.split('/').pop()}`);
        console.log('🔄 Express server will reinitialize on next request');
        serverInitialized = false;
        expressApp = null;
      }
      return undefined; // Let Vite handle the update normally
    }
  };
}