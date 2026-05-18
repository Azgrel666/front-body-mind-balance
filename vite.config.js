import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aprende: resolve(__dirname, 'aprende.html'),
        game: resolve(__dirname, 'game.html'),
      },
    },
  },
})
