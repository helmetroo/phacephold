const path = require('path');

const webpack = require('webpack');
const cssnano = require('cssnano');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackMultiBuildPlugin = require('html-webpack-multi-build-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const createPostcssConfig = require('./postcss.config');
const POSTCSS_LOADER = {
    loader: 'postcss-loader',
    options: {
        sourceMap: true,
        plugins: createPostcssConfig
    }
};

const SCSS_LOADER = {
    loader: 'sass-loader',
    options: {
        outputStyle: 'compressed',
        sourceMap: false,
        sourceMapContents: false
    }
};

const SRC_ROOT = path.resolve(__dirname, '../src');
const COMPONENTS_ROOT = path.join(SRC_ROOT, './components');
const GLOBAL_STYLES_ROOT = path.join(SRC_ROOT, './global-styles');

const TEMPLATE = path.join(SRC_ROOT, './views/prod.ejs');

const config = {
    mode: 'production',
    devtool: 'none',
    optimization: {
        /*
        splitChunks: {
            name: false,
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: 'all',
                },
            },
        },
        */
        splitChunks: {
            chunks: 'all'
        },
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                extractComments: true,
            }),

            new OptimizeCssAssetsPlugin({
                cssProcessor: cssnano,
                cssProcessorOptions: {
                    map: {
                        inline: false,
                    },
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            }),
        ],
    },
    module: {
        rules: [{
            test: /\.(scss|sass|css)$/,
            include: [
                GLOBAL_STYLES_ROOT
            ],
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                loader: 'css-loader',
            }, {
                ...POSTCSS_LOADER
            }, {
                ...SCSS_LOADER
            }]
        }, {
            test: /\.(scss|sass|css)$/,
            include: [
                COMPONENTS_ROOT
            ],
            use: [{
                loader: 'to-string-loader'
            }, {
                loader: 'css-loader'
            }, {
                ...POSTCSS_LOADER
            }, {
                ...SCSS_LOADER
            }]
        }, {
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

        new HtmlWebpackPlugin({
            inject: false,
            minify: true,
            template: TEMPLATE,
            title: 'phacephold',
            base: '/',
            meta: {
                charset: 'UTF-8',
                viewport: 'width=device-width, initial-scale=1',
                description: 'Camera app employing face folding',
                'twitter:card': 'Webpack basic starter project',
            },
        }),

        new HtmlWebpackMultiBuildPlugin()
    ]
};

module.exports = config;
