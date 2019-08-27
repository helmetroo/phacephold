const createConfig = (env) => {
    const targets = (env === 'modern')
          ? { esmodules: true }
          : {};

    return {
        presets: [
            ['@babel/preset-env', {
                targets,
                useBuiltIns: 'usage',
                corejs: 3
            }],
            '@babel/preset-typescript'
        ],

        plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/proposal-class-properties',
            '@babel/proposal-object-rest-spread',
            '@babel/plugin-syntax-dynamic-import',
            [
                '@babel/plugin-proposal-decorators', {
                    'decoratorsBeforeExport': true
                }
            ]
        ]
    };
};

const config = {
    env: {
        modern: createConfig('modern'),
        legacy: createConfig('legacy')
    }
};

module.exports = config;
