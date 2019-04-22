const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENTRY = path.resolve(__dirname, '../src/index.js');
const STATIC_DIR = path.resolve(__dirname, '../assets');
const LIB_DIR = path.resolve(__dirname, '../lib');

module.exports = {
    entry: ENTRY,
    node: {
        fs: 'empty'
    },
    module: {
        rules: [{
            test: /(!opencv)\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }, {
            test: /\.worker\.js$/,
            use: {
                loader: 'worker-loader',
                options: {
                    name: 'js/[name].js'
                }
            }
        }],
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: STATIC_DIR
        }, {
            from: path.join(LIB_DIR, '/opencv/opencv_js.wasm'),
            to: 'lib/opencv'
        }]),
    ],
    resolve: {
        alias: {
            'opencv': path.resolve(__dirname, '../lib/opencv'),
        }
    }
};
