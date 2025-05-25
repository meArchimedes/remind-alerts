/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['index.html', './src/**/*.{jsx,html,js,ts}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
            gridTemplateColumns: {
                '70/30': '70% 28%',
            }
        },
    },
    plugins: [],
}

