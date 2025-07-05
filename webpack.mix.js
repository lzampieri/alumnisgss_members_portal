const mix = require('laravel-mix');
// mix.env(process.env.ENV_FILE);

if( process.env.NODE_ENV == 'production' ) {
    process.env.ENV_FILE = '.env.production';
} else {
    process.env.ENV_FILE = '.env';
}

require('mix-env-file')
mix.env(process.env.ENV_FILE);


console.log("=================================")
console.log("Compiling using as environment:")
console.log(process.env.NODE_ENV);
console.log("and as file:")
console.log(process.env.ENV_FILE);
console.log("Compiling using as mix asset url:")
console.log(process.env.MIX_ASSET_URL);
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

mix.setResourceRoot(process.env.MIX_ASSET_URL)
    .js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [
        //
    ])
    .react();

if (mix.inProduction()) {
    mix.version();
} else {
    mix.disableNotifications();
}