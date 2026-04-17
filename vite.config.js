import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/order-ease-adminiui/',
  plugins: [
    vue(),
  ],
  server: {
    host: "0.0.0.0",
    port: "3000",
    proxy: {
      '/api': {
        target: 'https://www.xhsj.xyz',  // 后端接口地址
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 为构建产物添加内容哈希，解决浏览器缓存问题
        // 入口文件添加哈希
        entryFileNames: 'js/[name]-[hash].js',
        // 代码分割的 chunk 文件添加哈希
        chunkFileNames: 'js/[name]-[hash].js',
        // 资源文件（CSS、图片、字体等）添加哈希
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          // 图片文件
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'img/[name]-[hash][extname]'
          }
          // 字体文件
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          // CSS 文件
          if (ext === 'css') {
            return 'css/[name]-[hash][extname]'
          }
          // 其他资源文件
          return '[ext]/[name]-[hash][extname]'
        },
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia', 'element-plus', 'axios']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['element-plus']
  },
  test: {
    environment: 'jsdom',
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
