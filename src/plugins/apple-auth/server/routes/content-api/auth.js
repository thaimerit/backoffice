'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/auth/apple/callback',
    handler: 'auth.callback',
    config: {
      policies: [],
      prefix: '',
    },
  },
];
