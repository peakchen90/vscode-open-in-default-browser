const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');
const json = require('rollup-plugin-json');
const buildInModules = require('builtin-modules');
const pkg = require('./package.json');

const config = {
  input: {
    extension: 'src/index.ts',
    runTest: 'test/runTest.ts'
  },
  output: {
    dir: 'dist',
    entryFileNames: '[name].js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    commonjs(),
    json(),
    typescript()
  ],
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.devDependencies),
    ...buildInModules,
    'vscode'
  ]
};

module.exports = config;
