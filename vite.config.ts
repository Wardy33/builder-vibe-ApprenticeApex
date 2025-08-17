import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5204,
    proxy: {
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔴 Proxy error:', err.message);
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                error: 'Backend server not available'
              }));
            }
          });
        }
      }
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

          // Socket.io for real-time features (commented out - not currently used)
          // 'vendor-socket': ['socket.io-client']
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
  plugins: [react({ tsDecorators: true })],
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
