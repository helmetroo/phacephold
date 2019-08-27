const path = require('path');
const merge = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const baseConfig = require('./webpack.config.base.js');
const createPostcssConfig = require('./postcss.config');

const NODE_MODULES_DIR = /node_modules/;
const COMPONENTS_ROOT = path.resolve(__dirname, '../src/components');
const GLOBAL_STYLES_ROOT = path.resolve(__dirname, '../src/global-styles');

module.exports = merge(baseConfig, {
    mode: 'production',
    devtool: 'none',
    module: {
        rules: [{
            test: /\.(ts|js)$/,
            use: {
                // babel-env config inferred from browserslist
                loader: 'babel-loader'
            }
        }, {
            test: /\.(scss|sass|css)$/,
            include: [
                GLOBAL_STYLES_ROOT
            ],
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                // translates CSS into CommonJS
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                // Runs compiled CSS through postcss for vendor prefixing
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    plugins: createPostcssConfig
                }
            }, {
                // compiles Sass to CSS
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
                // Runs compiled CSS through postcss for vendor prefixing
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    plugins: createPostcssConfig
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
                    name: '[name].[hash:20].[ext]',
                    limit: 8192
                }
            }]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css'
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                map: {
                    inline: false,
                },
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        })
    ]
});
