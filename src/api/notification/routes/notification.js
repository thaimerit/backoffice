'use strict';

/**
 * notification router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::notification.notification');

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/notifications',
      handler: 'notification.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PATCH',
      path: '/notifications/read-all',
      handler: 'notification.readAll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/delete-all',
      handler: 'notification.deleteAll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/unread',
      handler: 'notification.unread',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/:id',
      handler: 'notification.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'notification.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PATCH',
      path: '/notifications/:id/read',
      handler: 'notification.read',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}
