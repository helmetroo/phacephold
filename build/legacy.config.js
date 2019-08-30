const WebpackModuleNomodulePlugin = require('webpack-module-nomodule-plugin');

// Polyfills like @babel/polyfill should go here as entries
const config = {
    output: {
        filename: '[name]_legacy.js'
    },

    module: {
        rules: [{
            test: /\.[tj]s$/,
            exclude: /node_modules[\/\\](?!(lit-element)[\/\\]).*/,
            use: {
                loader: 'babel-loader',
                options: {
                    envName: 'legacy'
                },
            },
        }]
    },

    plugins: [
        new WebpackModuleNomodulePlugin('legacy')
    ]
};

module.exports = config;
