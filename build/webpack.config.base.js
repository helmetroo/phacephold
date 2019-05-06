const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENTRY = path.resolve(__dirname, '../src/index.ts');
const STATIC_DIR = path.resolve(__dirname, '../assets');
const NODE_MODULES_DIR = /node_modules/;

module.exports = {
    entry: ENTRY,
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
            test: /\.ts$/,
            exclude: NODE_MODULES_DIR,
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
        ]
    }
};
