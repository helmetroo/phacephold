const path = require('path');

const webpack = require('webpack');
const cssnano = require('cssnano');
const { minify } = require('terser');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const PwaManifestPlugin = require('webpack-pwa-manifest');

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
const LOGO = path.join(SRC_ROOT, './assets/icon.png');

const config = {
    mode: 'production',
    devtool: 'none',
    optimization: {
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
        new webpack.DefinePlugin({
            SERVICE_WORKER_ENABLED: true
        }),

        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css'
        }),

        new HtmlWebpackPlugin({
            inject: true,
            template: TEMPLATE,
            title: 'phacephold',
            base: '/',
            meta: {
                charset: 'UTF-8',
                viewport: 'width=device-width, initial-scale=1',
                description: 'Camera app employing face folding',
                'twitter:card': 'Webpack basic starter project',
            },
            minify: {
                collapseWhitespace: true,
                removeComments: false,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                sortAttributes: true,
                sortClassName: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: (code) => minify(code).code,
            }
        }),

        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        }),

        new PwaManifestPlugin({
            name: 'phacephold',
            display: 'standalone',
            shortname: 'phold',
            description: 'PHOLD YOUR PHACE',
            theme_color: '#000',
            background_color: '#000',
            inject: true,
            ios: {
                'apple-mobile-web-app-title': 'phacephold',
                'apple-mobile-web-app-status-bar-style': 'black'
            },
            icons: [{
                src: LOGO,
                destination: '/icons/ios',
                sizes: [120, 152, 167, 180, 1024],
                ios: true
            }, {
                src: LOGO,
                destination: '/icons/ios',
                size: 1024,
                ios: 'startup'
            }, {
                src: LOGO,
                destination: '/icons/android',
                sizes: [36, 48, 72, 96, 144, 192, 512],
            }]
        }),
    ]
};

module.exports = config;
