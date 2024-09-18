'use strict';

/**
 * zodiac service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::zodiac.zodiac');
