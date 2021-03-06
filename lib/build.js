'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _path = require('path');

var _build = _interopRequireDefault(require('af-webpack/build'));

var _getUserConfig = _interopRequireDefault(
  require('af-webpack/getUserConfig'),
);

var _umiNotify = _interopRequireDefault(require('umi-notify'));

var _getWebpackConfig = _interopRequireDefault(require('./getWebpackConfig'));

var _getPaths = _interopRequireDefault(require('./getPaths'));

var _registerBabel = _interopRequireDefault(require('./registerBabel'));

var _buildStatisticsWebpackPlugin = _interopRequireDefault(
  require('build-statistics-webpack-plugin'),
);

var _bigbrotherWebpackPlugin = _interopRequireDefault(
  require('bigbrother-webpack-plugin'),
);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const debug = require('debug')('roadhog:build');

function _default(opts = {}) {
  _umiNotify.default.onBuildStart({
    name: 'roadhog',
    version: '2-beta',
  });

  const _opts$cwd = opts.cwd,
    cwd = _opts$cwd === void 0 ? process.cwd() : _opts$cwd,
    watch = opts.watch,
    entry = opts.entry;
  const babel = (0, _path.resolve)(__dirname, './babel.js');
  const paths = (0, _getPaths.default)(cwd);
  const stagesPath = (0, _path.join)(
    __dirname,
    '../.run/build-statistics/compilation.json',
  );

  const roadhogPkg = require((0, _path.join)(__dirname, '../package.json'));

  return new Promise(resolve => {
    // register babel for config files
    (0, _registerBabel.default)(babel, {
      cwd,
      configOnly: true,
    }); // get user config

    const _getConfig = (0, _getUserConfig.default)({
        cwd,
      }),
      config = _getConfig.config;

    debug(`user config: ${JSON.stringify(config)}`); // get webpack config

    const webpackConfig = (0, _getWebpackConfig.default)({
      cwd,
      config,
      babel,
      paths,
      entry,
    });
    webpackConfig.plugins.push(
      new _buildStatisticsWebpackPlugin.default({
        path: stagesPath,
      }),
      new _bigbrotherWebpackPlugin.default({
        cwd,
        tool: {
          name: 'roadhog',
          version: roadhogPkg.version,
          stagesPath,
        },
      }),
    );
    (0, _build.default)({
      webpackConfig,
      watch,

      success() {
        _umiNotify.default.onBuildComplete(
          {
            name: 'roadhog',
            version: '2-beta',
          },
          {
            err: null,
          },
        );

        resolve();
      },

      fail(err) {
        _umiNotify.default.onBuildComplete(
          {
            name: 'roadhog',
            version: '2-beta',
          },
          {
            err,
          },
        );
      },
    });
  });
}
