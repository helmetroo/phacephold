const { smart } = require('webpack-merge');

const commonConfig = require('./common.config');
const devConfig = require('./dev.config');
const modernConfig = require('./modern.config');

const fullDevConfig = smart(commonConfig, devConfig, modernConfig);
module.exports = fullDevConfig;
