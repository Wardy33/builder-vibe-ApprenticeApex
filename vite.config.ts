import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - keep small and cacheable
          react: ['react', 'react-dom'],
          
          // Router - separate for better caching
          router: ['react-router-dom'],
          
          // Radix UI - split into smaller chunks
          'radix-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ],
          'radix-forms': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider'
          ],
          'radix-layout': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-separator',
            '@radix-ui/react-scroll-area'
          ],
          'radix-feedback': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover'
          ],
          
          // Icons - separate chunk
          icons: ['lucide-react'],
          
          // Utility libraries - split by function
          'utils-style': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'utils-date': ['date-fns'],
          
          // Form handling
          forms: ['@hookform/resolvers', 'react-hook-form'],
          
          // Charts - separate as they're large
          charts: ['recharts'],
          
          // Animation - separate for better loading
          motion: ['framer-motion'],
          
          // 3D libraries - only load when needed
          'three-core': ['three'],
          'three-react': ['@react-three/fiber', '@react-three/drei'],
          
          // UI components - split by type
          'ui-components': [
            'sonner',
            'vaul',
            'cmdk',
            'react-day-picker'
          ],
          
          // Query and state management
          query: ['@tanstack/react-query'],
          
          // Layout utilities
          layout: [
            'react-resizable-panels',
            'embla-carousel-react'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 300, // Reduced from 1000 to catch large chunks early
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-dialog'
    ]
  },
  plugins: [
    react({
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
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  }
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
