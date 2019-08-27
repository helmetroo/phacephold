const path = require('path');
const merge = require('webpack-merge');
const fs = require('fs');

const baseConfig = require('./webpack.config.base.js');

const COMPONENTS_ROOT = path.resolve(__dirname, '../src/components');
const GLOBAL_STYLES_ROOT = path.resolve(__dirname, '../src/global-styles');

const NODE_MODULES_DIR = /node_modules/;
const OUTPUT_DIR = path.join(__dirname, '../dist');

const KEY = path.join(__dirname, '../phacephold.local.key');
const CERT = path.join(__dirname, '../phacephold.local.crt');

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        http2: true,
        https: {
            key: fs.readFileSync(KEY),
            cert: fs.readFileSync(CERT)
        },
        host: '0.0.0.0',
        port: 8080,
        contentBase: OUTPUT_DIR,
        compress: true,
        overlay: true
    },
    module: {
        rules: [{
            test: /\.(ts|js)$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            targets: [
                                'Edge >= 16',
                                'Firefox >= 60',
                                'Chrome >= 61',
                                'Safari >= 11',
                                'Opera >= 48'
                            ]
                        }]
                    ]
                }
            }
        }, {
            // Global styles
            test: /\.(scss|css)$/,
            include: [
                GLOBAL_STYLES_ROOT
            ],
            use: [{
                loader: 'style-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'sass-loader',
                options: {
                    outputStyle: 'expanded',
                    sourceMap: true,
                    sourceMapContents: true
                }
            }]
        }, {
            // Component-level styles
            test: /\.(scss|sass|css)$/,
            include: [
                COMPONENTS_ROOT
            ],
            use: [{
                loader: 'to-string-loader'
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true,
                    modules: false
                }
            }, {
                loader: 'sass-loader',
                options: {
                    outputStyle: 'expanded',
                    sourceMap: true,
                    sourceMapContents: true
                }
            }]
        }, {
            // Load all images as base64 encoding if they are smaller than 8192 bytes
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    // On development we want to see where the file is coming from, hence we preserve the [path]
                    name: '[path][name].[ext]?hash=[hash:20]',
                    limit: 8192
                }
            }]
        }],
    },
    plugins: []
});
