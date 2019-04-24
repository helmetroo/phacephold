const path = require('path');
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.config.base.js');

const INDEX_HTML = path.resolve(__dirname, '../src/views/index.html');

module.exports = merge(baseConfig, {
    devtool: 'inline-source-map',
    devServer: {
        port: 8080,
        contentBase: path.join(__dirname, '../dist')
    },
    module: {
        rules: [{
            test: /\.(scss|css)$/,
            use: [{
                // creates style nodes from JS strings
                loader: 'style-loader',
                options: {
                    sourceMap: true
                }
            }, {
                // translates CSS into CommonJS
                loader: 'css-loader',
                options: {
                    sourceMap: true
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
                    // On development we want to see where the file is coming from, hence we preserve the [path]
                    name: '[path][name].[ext]?hash=[hash:20]',
                    limit: 8192
                }
            }]
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: INDEX_HTML,
            inject: true
        })
    ]
});
