import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Hosted:  `vite build`                 -> dist/          (normal hashed assets)
// Offline: `vite build --mode offline`  -> dist-offline/  (one self-contained index.html;
//          Chrome refuses to load external module scripts from file://, so everything is inlined)
// base './' + HashRouter means both builds work from any folder or sub-path.
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  return {
    base: './',
    plugins: [react(), offline && viteSingleFile()].filter(Boolean),
    build: { outDir: offline ? 'dist-offline' : 'dist' },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{js,jsx}'],
      setupFiles: ['tests/setup.js'],
    },
  }
})
