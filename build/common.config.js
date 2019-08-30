const path = require('path');

const { Configuration } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ForkTSCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const SRC_ROOT = path.resolve(__dirname, '../src');
const ENTRY_POINT = path.join(SRC_ROOT, './entry-point.ts');
const TEMPLATE = path.join(SRC_ROOT, './views/index.html');
const LOGO = path.join(SRC_ROOT, './assets/icon.png');

const COMPONENTS_ROOT = path.join(SRC_ROOT, './components');
const GLOBAL_STYLES_ROOT = path.join(SRC_ROOT, './global-styles');
const MIXIN_STYLES_DIR = path.join(SRC_ROOT, './mixin-styles');

const BUILD_DIR = path.resolve(__dirname, '../dist');
const BUILD_VENDOR_DIR = path.join(BUILD_DIR, './vendor');
const BUILD_VENDOR_BUNDLES_DIR = path.join(BUILD_DIR, './vendor/bundles');

const STATIC_DIR = path.resolve(__dirname, '../assets');
const WEBCOMPONENTS_DIR = path.resolve(__dirname, '../node_modules/@webcomponents/webcomponentsjs');

const config = {
    entry: {
        main: ENTRY_POINT
    },

    output: {
        path: BUILD_DIR
    },

    node: {
        fs: 'empty'
    },

    module: {
        rules: [{
            test: /\.[tj]s$/,
            exclude: /node_modules[\/\\](?!(lit-element)[\/\\]).*/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                },
            }
        }, {
            test: /\.svg$/,
            use: [{
                loader: 'svg-inline-loader',
                options: {
                    classPrefix: 'phold',
                    idPrefix: 'phold'
                }
            }]
        }, {
            test: /\.html$/,
            include: [
                COMPONENTS_ROOT
            ],
            use: [{
                loader: 'html-loader'
            }]
        }, {
            // Global styles
            test: /\.(scss|sass|css)$/,
            include: [
                GLOBAL_STYLES_ROOT
            ],
            use: [{
                loader: 'css-loader',
            }, {
                loader: 'sass-loader'
            }]
        }, {
            // Component-level styles
            test: /\.(scss|sass|css)$/,
            include: [
                COMPONENTS_ROOT
            ],
            use: [{
                loader: 'to-string-loader',
            }, {
                loader: 'css-loader',
            }, {
                loader: 'sass-loader'
            }]
        }, {
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    name: '[path][name].[ext]?hash=[hash:20]',
                    limit: 8192
                }
            }]
        }]
    },

    resolve: {
        plugins: [
            new TSConfigPathsPlugin()
        ],

        alias: {
            '@mixin-styles': MIXIN_STYLES_DIR
        },

        extensions: [
            '.ts',
            '.js',
            '.html',
            '.scss',
            '.css'
        ]
    },

    plugins: [
        new ForkTSCheckerWebpackPlugin(),

        // Causes problems with prod build (multi). It's ran twice :(
        //new CleanWebpackPlugin(),

        // TODO only copy custom-elements-es5 in legacy.
        new CopyWebpackPlugin([{
            from: STATIC_DIR
        }, {
            from: path.resolve(WEBCOMPONENTS_DIR, './webcomponents-*.{js,map}'),
            to: BUILD_VENDOR_DIR,
            flatten: true
        }, {
            from: path.resolve(WEBCOMPONENTS_DIR, './bundles/*.{js,map}'),
            to: BUILD_VENDOR_BUNDLES_DIR,
            flatten: true
        }, {
            from: path.resolve(WEBCOMPONENTS_DIR, './custom-elements-es5-adapter.js'),
            to: BUILD_VENDOR_DIR,
            flatten: true
        }]),

        new FaviconsWebpackPlugin({
            logo: LOGO,
            cache: true,
            inject: true,
            prefix: 'icons/',
            favicons: {
                background: '#000',
                theme_color: '#000',
            }
        }),
    ]
};

module.exports = config;
