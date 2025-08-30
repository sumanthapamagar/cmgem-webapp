import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default ({ mode }) => {
    // Load app-level env vars to node-level env vars.
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    
    const isDev = mode === 'development';
    
    return defineConfig({
        root: 'public',
        jsx: 'react',
        build: {
            outDir: '../dist'
        },
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: '*.docx',
                        dest: '.'
                    },
                    {
                        src: '*.jpg',
                        dest: '.'
                    },
                    {
                        src: '*.png',
                        dest: '.'
                    }
                ]
            }),
            // Only enable PWA in production mode
            !isDev && VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                devOptions: {
                    enabled: false // Disable in development
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}']
                },
                includeAssets: [
                    'favicon.ico',
                    'apple-touch-icon-180x180.png',
                    'maskable-icon-512x512'
                ],
                manifest: {
                    name: 'CMGEM',
                    short_name: 'cmgem',
                    description: 'CMGEM Audit App',
                    theme_color: '#000',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png'
                        }
                    ]
                }
            })
        ].filter(Boolean), // Remove falsy plugins
        esbuild: {
            jsxInject: `import React from 'react';`
        },
        server: {
          port: 5173,
            watch: {
                usePolling: true,
            }
        },
        preview: {
          port: 3000,
            watch: {
                usePolling: true,
            }
        },
    });
};
