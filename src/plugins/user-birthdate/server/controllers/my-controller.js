'use strict';

const _ = require('lodash')
const dayjs = require('dayjs')

module.exports = ({ strapi }) => ({
  async index(ctx) {
    try {
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        // fields: ['username'],
        filters: {
          $not: {
            dateOfBirth: null
          },
        },
      })
      ctx.body = {
        success: true,
        data: users
      }
    } catch (error) {
      ctx.body = error;
    }
  },
});
