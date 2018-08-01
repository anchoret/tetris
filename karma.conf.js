let webpackConfigFunction = require('./webpack.config');
let webpackMode = "development";
let webpackConfig = webpackConfigFunction({}, {mode: webpackMode});
let webpack = require("webpack");

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
        'test/**/*.ts',
        {pattern: 'src/**/*.ts', included: false, served: false},
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.ts': ["webpack", "sourcemap"]
    },
    webpack: {
      mode: webpackMode,
      resolve: webpackConfig.resolve,
      module: webpackConfig.module,
      devtool: false,
      plugins: [
          new webpack.SourceMapDevToolPlugin({
              test: [/\.js$/, /\.ts$/],
              exclude: 'vendor',
          })
      ],
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [],
    singleRun: false,
    concurrency: Infinity,
    client: {
      mocha: {
        reporter: 'html',
      }
    }
  })
}
