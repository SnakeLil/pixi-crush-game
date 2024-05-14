export default {
    base: './',
    server: {
        host: true,
        port: 8000,
        hmr: true
    },
    define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
}