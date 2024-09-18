'use strict';

/**
 *  place controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;

module.exports = createCoreController('api::place.place',{
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::place.place').findOne(id, query);

    if(!entity.publishedAt){
      throw new NotFoundError()
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  }
});
