"use strict";

const { receivePaymentWebHook } = require("../../../util/paymentWebHook");
const utils = require('@strapi/utils');
const { UnauthorizedError } = utils.errors;

/**
 *  payment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::payment.payment", ({ strapi }) => ({
  async webhook(ctx) {
    let token = ctx.query.token;

    if(token!=process.env.PAYMENT_TOKEN) {
      console.log("token not found")
      throw new UnauthorizedError("token not found")
    }

    let body = ctx.request.body;

    console.log("PAYMENT_WEBHOOK", body);

    receivePaymentWebHook(body)

    return true;
  },
}));
