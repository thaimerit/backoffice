'use strict';

/**
 *  horoscope controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::horoscope.horoscope');
