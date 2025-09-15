import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { BUNDLE_OPTIMIZATION } from './config/optimization';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [react()],
        define: {
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.')
            }
        },
        build: {
            minify: 'terser',
            outDir: 'dist',
            assetsDir: 'assets',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    manualChunks: BUNDLE_OPTIMIZATION.MANUAL_CHUNKS
                }
            }
        }
    };
});
