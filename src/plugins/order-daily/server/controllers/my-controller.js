'use strict';

const dayjs = require("dayjs");

module.exports = ({ strapi }) => ({
  async index(ctx) {
    try {
      const { query } = ctx;
      const orders = await strapi.entityService.findMany('api::order.order', {
        // fields: ['username'],
        populate: ['orderItems','orderItems.product'],
        filters: {
          $and: [
            {
              createdAt: { $lte: dayjs(query.endDate).add(7,'hors').endOf("day").toISOString() },
            },
            {
              createdAt: { $gte: dayjs(query.startDate).add(7,'hors').startOf("day").toISOString() },
            },
          ],
        },
      })
      ctx.body = {
        success: true,
        data: orders
      }
    } catch (error) {
      ctx.body = error;
    }
  }
});
