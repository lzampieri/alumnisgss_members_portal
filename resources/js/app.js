require('./bootstrap');

import { createInertiaApp } from '@inertiajs/react'
import MainLayout from './Layout/MainLayout';
import { createRoot } from 'react-dom/client';

import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false

createInertiaApp({
    resolve: name => {
        const page = require(`./${name}`).default
        page.layout = MainLayout
        return page
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
    title: (title) => `${process.env.MIX_APP_NAME_PREFIX}${title} - ${process.env.MIX_APP_NAME_SUFFIX}`,
})
