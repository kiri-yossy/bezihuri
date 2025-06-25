import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ★★★ ここから下を追記 ★★★
  server: {
    proxy: {
      // '/api' という文字列で始まるAPIリクエストをプロキシする
      '/api': {
        // 転送先のサーバー
        target: 'http://localhost:3000',
        // オリジンを偽装する
        changeOrigin: true,
      }
    }
  }
})