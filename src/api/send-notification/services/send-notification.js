'use strict';

/**
 * send-notification service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::send-notification.send-notification');
