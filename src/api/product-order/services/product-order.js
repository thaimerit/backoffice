'use strict';

/**
 * product-order service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product-order.product-order');
