const path = require('path');
const webpack = require('webpack');
const version = require('./package.json').version;

// Custom webpack rules
const rules = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.js$/, loader: 'source-map-loader' },
  { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
  { test: /\.(png|svg|jpg)$/i, use: ['file-loader'] }
];

// Packages that shouldn't be bundled but loaded at runtime
const externals = ['@jupyter-widgets/base'];

const resolve = {
  extensions: [".webpack.js", ".web.js", ".js", ".css"]
};

module.exports = [
  /**
   * Notebook extension
   *
   * This bundle only contains the part of the JavaScript that is run on load in the notebook.
   */
  {
    entry: './lib/index.js',
    target: 'web',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'igv', 'nbextension', 'static'),
      libraryTarget: 'amd',
      // TODO: Replace after release to unpkg.org
      publicPath: '' // 'https://unpkg.com/@igvteam/igv-jupyter@' + version + '/dist/'
    },
    module: {
      rules: rules
    },
    devtool: 'source-map',
    externals,
    resolve,
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
  },

  /**
   * Embeddable nbtools bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  {
    entry: './lib/index.js',
    target: 'web',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'amd',
        library: "@igvteam/igv-jupyter",
        // TODO: Replace after release to unpkg.org
        publicPath: '' // 'https://unpkg.com/@igvteam/igv-jupyter@' + version + '/dist/'
    },
    module: {
        rules: rules
    },
    devtool: 'source-map',
    externals,
    resolve,
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
  },

];
