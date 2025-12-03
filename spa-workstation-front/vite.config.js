// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
//
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
//   server: {
//     host: '0.0.0.0', // 도커 컨테이너 외부에서 접근 가능
//     port: 5173,
//     watch: {
//       usePolling: true, // 도커 볼륨에서 파일 변경 감지
//     },
//     hmr: {
//       host: 'localhost', // HMR을 위한 호스트 설정
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 실행 모드가 'development' (npm run dev)인지 확인
  const isDev = mode === 'development';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,

      // [조건부 설정] 개발 환경 vs 도커(배포) 환경 분리
      ...(isDev ? {
        // 1. 로컬 개발 환경 (npm run dev)
        proxy: {
          '/api': {
            target: 'http://localhost:8889', // Spring Boot 로컬 포트
            changeOrigin: true,
            secure: false,
            // rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      } : {
        // 2. 도커/배포 환경
        host: '0.0.0.0',
        watch: {
          usePolling: true,
        },
        hmr: {
          host: 'localhost',
        }
      })
    }
  }
})