import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'

const appVersion = process.env.VITE_APP_VERSION ?? new Date().toISOString()

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  build: {
    assetsInlineLimit: Infinity,
  },
  plugins: [
    svelte(),
    viteSingleFile(),
    {
      name: 'inject-app-version',
      transformIndexHtml(html) {
        return html.replaceAll('__APP_VERSION__', appVersion)
      },
    },
  ],
})
