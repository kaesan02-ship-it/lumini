import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 상대 경로를 사용하여 배포 유연성 확보
  build: {
    minify: false, // 빌드 시 크래시 방지를 위해 압축 비활성화
    emptyOutDir: true,
  }
})
