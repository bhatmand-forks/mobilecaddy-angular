var watch = require('@ionic/app-scripts/dist/watch');
var copy = require('@ionic/app-scripts/dist/copy');
var copyConfig = require('@ionic/app-scripts/config/copy.config');

module.exports = {
  srcFiles: {
    paths: [
      '{{SRC}}/**/*.(ts|html|s(c|a)ss)',
      '{{ROOT}}/mobilecaddy-angular/**/*.(ts|html|s(c|a)ss)'
    ],
    options: {
      ignored: [
        '{{SRC}}/**/*.spec.ts',
        '{{SRC}}/**/*.e2e.ts',
        '**/*.DS_Store',
        '{{SRC}}/index.html'
      ]
    },
    callback: watch.buildUpdate
  },
  copyConfig: copy.copyConfigToWatchConfig()
};
