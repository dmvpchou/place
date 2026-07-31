import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// 產品名尚未定案（見 handoff README 第 2 節），UI 端一律讀 src/constants.ts 的
// PRODUCT_NAME。這裡是唯一的第二處，改名時兩處一起改。
const PRODUCT_NAME = '未寄'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: PRODUCT_NAME,
        short_name: PRODUCT_NAME,
        description: '讓心情有地方放',
        lang: 'zh-Hant',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#EFEEE9',
        theme_color: '#EFEEE9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 字體有 213 個分片、共 5.6MB，全部 precache 等於要使用者第一次開就
        // 下載一整套中文字。它們改用 runtime cache：抓過哪片就留哪片。
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/fonts\/[^/]+\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weiji-fonts',
              // 分片檔名固定、內容不變，可以放心長期快取
              expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
