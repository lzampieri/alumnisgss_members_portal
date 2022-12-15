require('./bootstrap');

import React from 'react'
import { render } from 'react-dom'
import { createInertiaApp } from '@inertiajs/inertia-react'
import { InertiaProgress } from '@inertiajs/progress'
import MainLayout from './Layout/MainLayout';

createInertiaApp({
    resolve: name => {
        const page = require(`./${name}`).default
        page.layout = MainLayout
        return page
    },
    setup({ el, App, props }) {
        render(<App {...props} />, el)
    },
})

InertiaProgress.init( { delay: 0, showSpinner: true } )