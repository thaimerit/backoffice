'use strict';

const auth = require('./auth');

module.exports = {
  type: 'content-api',
  routes: [...auth],
};
