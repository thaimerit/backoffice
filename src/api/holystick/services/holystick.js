'use strict';

/**
 * holystick service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::holystick.holystick');
