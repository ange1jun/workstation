import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // 도커 컨테이너 외부에서 접근 가능
    port: 5173,
    watch: {
      usePolling: true, // 도커 볼륨에서 파일 변경 감지
    },
    hmr: {
      host: 'localhost', // HMR을 위한 호스트 설정
    }
  }
})