import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        oceanco: resolve(__dirname, 'project-oceanco.html'),
        lafuente: resolve(__dirname, 'project-lafuente.html'),
        broederliefde: resolve(__dirname, 'project-broederliefde.html')
      }
    }
  }
});
