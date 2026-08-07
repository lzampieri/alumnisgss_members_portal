import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import MainLayout from './Layout/MainLayout';

import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false


createInertiaApp({
    resolve: name => {
        const page = resolvePageComponent(
            `./${name}.jsx`,
            import.meta.glob('./**/*.jsx'
            )
        )
        page.then((module) => {
            module.default.layout = MainLayout;
        });
        return page
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
    title: (title) => `${import.meta.env.VITE_APP_NAME_PREFIX}${title} - ${import.meta.env.VITE_APP_NAME_SUFFIX}`,
})
