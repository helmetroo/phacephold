const path = require('path');
const fs = require('fs');

const {
    Configuration,
    HotModuleReplacementPlugin,
    DefinePlugin
} = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const SCSS_LOADER = {
    loader: 'sass-loader',
    options: {
        outputStyle: 'expanded',
        sourceMap: true,
        sourceMapContents: true
    }
};

const KEY = path.join(__dirname, '../phacephold.local.key');
const CERT = path.join(__dirname, '../phacephold.local.crt');

const SRC_ROOT = path.resolve(__dirname, '../src');
const TEMPLATE = path.join(SRC_ROOT, './views/dev.ejs');
const COMPONENTS_ROOT = path.join(SRC_ROOT, './components');
const GLOBAL_STYLES_ROOT = path.join(SRC_ROOT, './global-styles');

const OUTPUT_DIR = path.resolve(__dirname, '../dist');

const config = {
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
            test: /\.(scss|sass|css)$/,
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
            }, {
                ...SCSS_LOADER
            }]
        }, {
            test: /\.(scss|sass|css)$/,
            include: [
                COMPONENTS_ROOT
            ],
            use: [{
                loader: 'to-string-loader',
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true,
                    modules: false
                }
            }, {
                ...SCSS_LOADER
            }]
        }]
    },
    plugins: [
        new DefinePlugin({
            SERVICE_WORKER_ENABLED: false
        }),

        new HotModuleReplacementPlugin(),

        // TODO how can we properly combine plugin options with webpack-merge?
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
        }),

        new ScriptExtHtmlWebpackPlugin({
            module: /\.mjs$/
        }),
    ]
};

module.exports = config;
