import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 로컬 개발 시 접속 편의를 위해 '/'로 변경 (배포 시 '/lumini/'로 복구 필요)
})
