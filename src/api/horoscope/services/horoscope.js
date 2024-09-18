'use strict';

/**
 * horoscope service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::horoscope.horoscope');
