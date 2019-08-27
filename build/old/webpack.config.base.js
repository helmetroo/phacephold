const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const INDEX_HTML = path.resolve(__dirname, '../src/views/index.html');
const ENTRY = path.resolve(__dirname, '../src/index.ts');

const STATIC_DIR = path.resolve(__dirname, '../assets');
const WEBCOMPONENTS_DIR = path.resolve(__dirname, '../node_modules/@webcomponents/webcomponentsjs');
const BUILD_DIR = path.resolve(__dirname, '../dist');
const BUILD_VENDOR_DIR = path.resolve(BUILD_DIR, 'vendor');
const MIXIN_STYLES_DIR = path.resolve(__dirname, '../src/mixin-styles');

const COMPONENTS_ROOT = path.resolve(__dirname, '../src/components');

module.exports = {
    entry: ENTRY,
    output: {
        path: BUILD_DIR
    },
    node: {
        fs: 'empty'
    },
    output: {
        filename: '[name].[hash:20].js',
        chunkFilename: '[name].[hash:20].chunk.js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    module: {
        rules: [{
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
        }, ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([{
            from: STATIC_DIR
        }, {
            from: path.resolve(WEBCOMPONENTS_DIR, './webcomponents-*.{js,map}'),
            to: BUILD_VENDOR_DIR,
            flatten: true
        }, {
            from: path.resolve(WEBCOMPONENTS_DIR, './bundles/*.{js,map}'),
            to: BUILD_VENDOR_DIR,
            flatten: true
        }]),
        new HtmlWebpackPlugin({
            template: INDEX_HTML,
            inject: 'body'
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        }),
        new WebpackPwaManifest({
            name: 'phacephold',
            orientation: 'portrait',
            display: 'standalone',
            shortname: 'phold',
            description: 'PHOLD YOUR PHACE',
            theme_color: '#000',
            background_color: '#000',
            inject: true,
            icons: [{
                src: './src/assets/icon.png',
                sizes: [96, 128, 192, 256, 384, 512]
            }]
        }),
        new FaviconsWebpackPlugin({
            // Your source logo
            logo: './src/assets/icon.png',
            // The prefix for all image files (might be a folder or a name)
            prefix: 'icons-[hash]/',
            // Generate a cache file with control hashes and
            // don't rebuild the favicons until those hashes change
            persistentCache: true,
            // Inject the html into the html-webpack-plugin
            inject: true,
            // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
            background: '#000',
            // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
            title: 'phacephold',
            // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: true,
                coast: false,
                favicons: true,
                firefox: true,
                opengraph: false,
                twitter: false,
                yandex: false,
                windows: false
            }
        }),
    ],
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
    }
};
