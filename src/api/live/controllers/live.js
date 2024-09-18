'use strict';

/**
 *  live controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::live.live');

module.exports = {
  find: async (ctx, next) => {

    // const lives = await strapi.db.query('api::live.live').findMany({
    //   populate: ["place", "dayOfWeeks"],
    //   where: {
    //     startDateTime: {
    //       $lte: new Date
    //     },
    //     endDateTime: {
    //       $gte: new Date
    //     }
    //   }
    // })

    const page = await strapi.entityService.findPage('api::live.live', {
      populate: ["place", "place.coverImages.image", "thumbnail", "dayOfWeeks"],
      filters: {
        startDateTime: {
          $lte: new Date
        },
        endDateTime: {
          $gte: new Date
        },
        publishedAt: {
          $notNull: true
        },
      }
    })

    page.results = page.results.map(item => {
      item.placeId = item.place.id
      return item
    });

    ctx.body = {
      data: page.results,
      meta: {
        pagination: page.pagination
      }
    }

    // let placeIds = lives.map(o => o.place.id)

    // let query = ctx.request.query
    // query.filters = {
    //   id: {
    //     $in: placeIds
    //   }
    // }
    // if (!query.populate) {
    //   query.populate = "coverImages.image,province"
    // }


    // let data = await strapi
    //   .controller('api::place.place')
    //   .find(ctx);

    // data.data = data.data.map(place => {
    //   let _live = lives.find(live => live.place.id == place.id)
    //   let live = { ..._live }
    //   delete live.place

    //   place.attributes.live = live
    //   return place
    // })

    // ctx.body = data
  },
  findOne: async (ctx, next) => {

    const data = await strapi.entityService.findOne('api::live.live', ctx.request.params.id, {
      populate: ["place", "place.coverImages.image", "place.galleries", "place.province", "thumbnail", "dayOfWeeks"],
    })

    ctx.body = data
  },
  findPlaces: async (ctx, next) => {

    const lives = await strapi.db.query('api::live.live').findMany({
      populate: ["place", "dayOfWeeks"],
      where: {
        startDateTime: {
          $lte: new Date
        },
        endDateTime: {
          $gte: new Date
        },
        publishedAt: {
          $notNull: true
        },
      }
    })

    let query = ctx.request.query
    if (!query.populate) {
      query.populate = "coverImages.image,province"
    }

    let data = await strapi
      .controller('api::place.place')
      .find(ctx);

    data.data = data.data.map(place => {
      let _live = lives.find(live => live.place.id == place.id)
      let live = { ..._live }
      delete live.place

      place.attributes.live = live
      return place
    })

    ctx.body = data

  },
  findOnePlace: async (ctx, next) => {

    // const data = await strapi.entityService.findOne('api::live.live', ctx.request.params.id, {
    //   populate: ["place", "place.coverImages.image", "place.galleries", "place.province", "thumbnail", "dayOfWeeks"],
    // })

    let id = ctx.request.params.id
    let query = ctx.request.query
    if (!query.populate) {
      query.populate = "galleries,coverImages.image,categories,bankAccounts.bank,sacredTypes,tags,province"
    }

    const live = await strapi.db.query('api::live.live').findOne({
      populate: ["place", "dayOfWeeks", "thumbnail"],
      where: {
        place: {
          id
        },
        startDateTime: {
          $lte: new Date
        },
        endDateTime: {
          $gte: new Date
        },
        publishedAt: {
          $notNull: true
        },
      }
    })

    let result = await strapi
      .controller('api::place.place')
      .findOne(ctx);

    result.data.attributes.live = live

    ctx.body = result
  },
}
