require('./bootstrap');

import React from 'react'
import { render } from 'react-dom'
import { createInertiaApp } from '@inertiajs/react'
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
