const path = require('path');
const merge = require('webpack-merge');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const baseConfig = require('./webpack.config.base.js');
const createPostcssConfig = require('./postcss.config');

const BUILD_PATH = path.resolve(__dirname, '../dist');
const INDEX_HTML = path.resolve(__dirname, '../src/views/index.html');

module.exports = merge(baseConfig, {
    devtool: 'source-map',
    output: {
        path: BUILD_PATH
    },
    module: {
        rules: [{
            test: /\.(scss|css|sass)$/,
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
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: INDEX_HTML,
            // Inject the js bundle at the end of the body of the given template
            inject: 'body',
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
                sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
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
            background: '#fff',
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
