import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    assetsInlineLimit: Infinity,
  },
  plugins: [svelte(), viteSingleFile()],
})
