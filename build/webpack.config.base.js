const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENTRY = path.resolve(__dirname, '../src/index.ts');
const STATIC_DIR = path.resolve(__dirname, '../assets');
const LIB_DIR = path.resolve(__dirname, '../lib');
const NODE_MODULES_DIR = path.resolve(__dirname, '../node_modules');

module.exports = {
    entry: ENTRY,
    node: {
        fs: 'empty'
    },
    module: {
        rules: [{
            test: /-worker\.ts$/,
            exclude: /node_modules/,
            use: {
                loader: 'worker-loader',
                options: {
                    name: '[name].worker.[hash].js'
                }
            }
        }, {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader'
            }
        }],
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: STATIC_DIR
        }]),
    ],
    resolve: {
        extensions: [
            '.ts',
            '.js',
            '.scss',
            '.css'
        ],

        alias: {
            'opencv': path.resolve(__dirname, '../lib/opencv'),
        }
    }
};
