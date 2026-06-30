import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import presetUno from '@unocss/preset-uno'
import { resolve } from 'path'
import 'dotenv/config';

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  build: {
    outDir: process.env.VITE_BUILD_DIR || 'dist',
  },
  plugins: [
    vue(),
    UnoCSS({
      presets: [presetUno()],
      theme: {
        colors: {
          vs: {
            base: '#1E1E1E',
            panel: '#2D2D2D',
            sidebar: '#252526',
            input: '#3C3C3C',
            hover: 'rgba(255,255,255,0.06)',
            active: 'rgba(255,255,255,0.12)',
            selection: '#04395E',
            border: '#3C3C3C',
            text: '#CCCCCC',
            muted: '#858585',
            dim: '#5A5A5A',
            blue: '#569CD6',
            green: '#4EC9B0',
            yellow: '#DCDCAA',
            red: '#F48771',
            orange: '#CE9178',
            focus: '#007ACC',
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
