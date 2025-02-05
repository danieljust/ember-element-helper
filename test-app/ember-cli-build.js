'use strict';

// eslint-disable-next-line node/no-unpublished-require
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  if (app.env === 'test') {
    app.import('node_modules/ember-source/dist/ember-template-compiler.js', {
      type: 'test',
    });
  }

  // eslint-disable-next-line node/no-unpublished-require
  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
