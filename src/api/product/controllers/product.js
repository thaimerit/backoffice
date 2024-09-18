'use strict';

/**
 *  product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query }
    let filters = ctx.query?.filters ? ctx.query?.filters : {}

    filters.$or = [
      {
        $and: [
          {
            type: "package",
            place: {
              id: {
                $notNull: true
              }
            }
          }
        ]
      },
      {
        $and: [
          {
            type: "product",
          }
        ]
      }
    ]
    filters.publishedAt= {
      $notNull: true
    }
    // filters.place = {
    //   id: {
    //     $notNull: true
    //   }
    // }

    ctx.query.filters = { ...filters }

    console.log(ctx.query)

    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::product.product').findOne(id, query);

    if(!entity.publishedAt){
      throw new NotFoundError()
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    if (!entity.place && entity.type=="package") {
      throw new NotFoundError()
    }

    return this.transformResponse(sanitizedEntity);
  }
}));
