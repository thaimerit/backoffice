'use strict';

/**
 * chinese-zodiac service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::chinese-zodiac.chinese-zodiac');
