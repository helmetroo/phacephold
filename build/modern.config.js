const config = {
    output: {
        filename: '[name].mjs'
    },

    module: {
        rules: [{
            test: /\.[tj]s$/,
            exclude: /node_modules[\/\\](?!(lit-element)[\/\\]).*/,
            use: {
                loader: 'babel-loader',
                options: {
                    envName: 'modern'
                },
            },
        }]
    },
};

module.exports = config;
