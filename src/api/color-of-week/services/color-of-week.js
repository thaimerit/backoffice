'use strict';

/**
 * color-of-week service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::color-of-week.color-of-week');
