const path = require('path');

module.exports = {
  entry: './proxy-server/proxy.mjs',
  output: {
    filename: 'proxy.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
    ],
  },
};
