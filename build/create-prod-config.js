const { smart } = require('webpack-merge');

const commonConfig = require('./common.config');
const prodConfig = require('./prod.config');
const modernConfig = require('./modern.config');
const legacyConfig = require('./legacy.config');

const fullProdConfig = smart(commonConfig, prodConfig);
const modernProdConfig = smart(fullProdConfig, modernConfig);
const legacyProdConfig = smart(fullProdConfig, legacyConfig);

module.exports = [
    modernProdConfig,
    legacyProdConfig
];
