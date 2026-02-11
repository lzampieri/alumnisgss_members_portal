import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

console.log("=================================")
console.log("Compiling using as environment:")
console.log(process.env.NODE_ENV);
console.log("=================================")

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.jsx',
        ]),
        react(),
        tailwindcss()
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: () => 'everything.js',
            },
        },
    },
});