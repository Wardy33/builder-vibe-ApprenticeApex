import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createApp } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
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
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      console.log('🔧 Express plugin configureServer called');

      try {
        // Import functions from server with explicit path
        const serverModule = require('./server/index.ts');
        console.log('🔧 Server module imported successfully');
        console.log('🔧 Available functions:', Object.keys(serverModule));

        const { createServer, connectToDatabase } = serverModule;

        if (!connectToDatabase) {
          console.error('❌ connectToDatabase function not found in server module');
          console.log('Available functions:', Object.keys(serverModule));
        } else {
          console.log('✅ connectToDatabase function found, calling it...');

          // Initialize database connection first
          connectToDatabase().then(() => {
            console.log('✅ Database connection initialized successfully in Vite plugin');
          }).catch((error) => {
            console.error('❌ Database connection failed in Vite plugin:', error);
            console.error('❌ Full error stack:', error.stack);
          });
        }

        if (!createServer) {
          console.error('❌ createServer function not found in server module');
        } else {
          console.log('✅ createServer function found, creating Express app...');
          const app = createServer();
          console.log('🔧 Express app created successfully, adding to Vite middleware');

          // Add Express app as middleware to Vite dev server
          server.middlewares.use(app);
        }

      } catch (error) {
        console.error('❌ Failed to setup Express plugin:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
    },
  };
}