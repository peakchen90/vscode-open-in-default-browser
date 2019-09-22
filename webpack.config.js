const path = require('path');
const pkg = require('./package.json');

const isDEV = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDEV ? 'development' : 'production',
  devtool: isDEV ? 'cheap-module-eval-source-map' : 'sourcemap',
  context: path.resolve(__dirname),
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.js', '.ts', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  target: 'node',
  node: {
    __filename: false,
    __dirname: false
  },
  externals: Object.keys(pkg.dependencies).reduce((curr, prev) => {
    curr[prev] = prev;
    return curr;
  }, {
    vscode: 'vscode'
  })
};
