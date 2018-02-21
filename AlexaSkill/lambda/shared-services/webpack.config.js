const path = require('path');
const fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
    target: 'node',
    entry: './index.js',
    output: {
      filename: 'shared-services.js',
      path: path.resolve(__dirname, 'dist')
    },
    externals: nodeModules
  };