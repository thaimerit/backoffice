'use strict';

/**
 * app-config router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::app-config.app-config');

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/app-config',
      handler: 'app-config.find',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
}
