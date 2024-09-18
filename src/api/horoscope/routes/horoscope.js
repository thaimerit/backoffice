'use strict';

/**
 * horoscope router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::horoscope.horoscope');
