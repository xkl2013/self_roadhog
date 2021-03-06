'use strict';

var _chalk = _interopRequireDefault(require('chalk'));

var _child_process = require('child_process');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

require('graceful-process')({
  logLevel: 'warn',
});

const script = process.argv[2];
const args = process.argv.slice(3);
const nodeVersion = process.versions.node;
const versions = nodeVersion.split('.');
const major = versions[0];
const minor = versions[1];

if (major * 10 + minor * 1 < 65) {
  console.log(`Node version must >= 6.5, but got ${major}.${minor}`);
  process.exit(1);
} // Notify update when process exits

const updater = require('update-notifier');

const pkg = require('../package.json');

updater({
  pkg: pkg,
}).notify({
  defer: true,
});
const scriptAlias = {
  server: 'dev',
};
const aliasedScript = scriptAlias[script] || script;

switch (aliasedScript) {
  case '-v':
  case '--version':
    const pkg = require('../package.json');

    console.log(pkg.version);

    if (!(pkg._from && pkg._resolved)) {
      console.log(_chalk.default.cyan('@local'));
    }

    break;

  case 'build':
  case 'dev':
  case 'test':
    const proc = (0, _child_process.fork)(
      require.resolve(`../lib/scripts/${aliasedScript}`),
      args,
      {
        stdio: 'inherit',
      },
    );
    proc.once('exit', code => {
      process.exit(code);
    });
    process.once('exit', () => {
      proc.kill();
    });
    break;

  default:
    console.log(`Unknown script ${_chalk.default.cyan(script)}.`);
    break;
}
