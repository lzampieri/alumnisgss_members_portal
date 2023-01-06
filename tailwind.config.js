/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.vue",
        "./node_modules/tailwind-datepicker-react/dist/**/*.js",
    ],
    theme: require( './resources/js/theme.js' ),
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
