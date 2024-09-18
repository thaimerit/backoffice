'use strict';

/**
 * payment router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
const defaultRouter = createCoreRouter('api::payment.payment')

const customRouter = require('../../../util/custom-router');

module.exports = customRouter(defaultRouter, [
  {
    method: "POST",
    path: "/payments/webhook",
    handler: "payment.webhook",
  }
]);
