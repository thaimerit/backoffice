'use strict';

/**
 * birthday-recommendation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::birthday-recommendation.birthday-recommendation');
