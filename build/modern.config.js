const WebpackModuleNomodulePlugin = require('webpack-module-nomodule-plugin');

const config = {
    output: {
        filename: '[name].mjs'
    },

    module: {
        rules: [{
            test: /\.[tj]s$/,
            exclude: /node_modules[\/\\](?!(lit-element)[\/\\]).*/,
            use: {
                loader: 'babel-loader',
                options: {
                    envName: 'modern'
                },
            },
        }]
    },

    plugins: [
        new WebpackModuleNomodulePlugin('modern')
    ]
};

module.exports = config;
