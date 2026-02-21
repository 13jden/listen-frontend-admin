import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({

  
  plugins: [vue()],
  
  // 服务器相关配置
  server: {
    port: 3000, // 设置开发服务器端口
    open: true,  // 启动时自动打开浏览器
    proxy: {
      '/api': {
        // target: 'http://115.190.53.97:8081', // 后端 API 地址
        target: 'http://localhost:8081', // 后端 API 地址
        changeOrigin: true, // 修改源地址，避免跨域问题
        rewrite: (path) => path.replace(/^\/api/, ''), // 可选：去掉路径中的 `/api`
      },
    },
  },

  // 构建相关配置
  build: {
    outDir: 'dist', // 构建输出目录
    assetsDir: 'assets', // 静态资源输出目录
    sourcemap: true, // 开启源码映射（调试用）
  },

  // CSS 相关配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`, // 全局引入样式变量
      },
    },
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': '/src', // 设置 @ 为 src 目录的别名
    },
  },

  // 配置环境变量
  define: {
    'process.env': process.env, // 用于在代码中访问环境变量
  },
})
