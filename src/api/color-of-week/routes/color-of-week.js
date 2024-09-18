'use strict';

/**
 * color-of-week router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::color-of-week.color-of-week');

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/color-of-weeks",
      handler: "color-of-week.colorOfWeek",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/color-for-you",
      handler: "color-of-week.colorForYou",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
