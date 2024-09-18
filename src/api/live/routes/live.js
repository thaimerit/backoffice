'use strict';

/**
 * live router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::live.live');

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/lives/live',
      handler: 'live.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lives/live/:id',
      handler: 'live.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lives/places',
      handler: 'live.findPlaces',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lives/places/:id',
      handler: 'live.findOnePlace',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}
