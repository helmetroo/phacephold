const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

//const INDEX_HTML = path.resolve(__dirname, '../src/views/index.html');
const INDEX_HTML = path.resolve(__dirname, '../src/views/index-v2.html');

//const ENTRY = path.resolve(__dirname, '../src/index.ts');
const ENTRY = path.resolve(__dirname, '../src/index-v2.ts');

const STATIC_DIR = path.resolve(__dirname, '../assets');
const WEBCOMPONENTS_DIR = path.resolve(__dirname, '../node_modules/@webcomponents/webcomponentsjs');
const BUILD_DIR = path.resolve(__dirname, '../dist');
const BUILD_VENDOR_DIR = path.resolve(BUILD_DIR, 'vendor');
const MIXIN_STYLES_DIR = path.resolve(__dirname, '../src/mixin-styles');

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
        rules: []
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
