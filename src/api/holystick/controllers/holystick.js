'use strict';

const { filterHtmlUtilHolystick } = require('../../../util/filterHtmlUtil');



/**
 *  holystick controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = createCoreController('api::holystick.holystick', ({ strapi }) => ({
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query };
    let populate = ctx.query.populate
    if(populate){
      let populateArray = populate.split(",")
      if(populateArray.indexOf("place.coverImages.image") != -1){
        populateArray.push("coverImages.image")
      }
      populate = populateArray.join(",")
      ctx.query.populate = populate
    }

    // Calling the default core action
    const { data, meta } = await super.find(ctx);

    data.forEach(item => {
      if(item.attributes?.predictions){
        item.attributes?.predictions.forEach(p=>{
          p.description = filterHtmlUtilHolystick(p.description)
        })
      }
      if(item.attributes?.coverImages?.length > 0){
        if(item.attributes?.place?.data?.attributes?.coverImages){
          item.attributes.place.data.attributes.coverImages = item.attributes?.coverImages
        }
      }
    });

    return { data, meta };
  },
  async prediction(ctx) {
    const { id } = ctx.params

    const entry = await strapi.db.query('api::holystick.holystick').findOne({
      where: {
        publishedAt: {
          $notNull: true
        },
        id: {
          $eq : id
        }
      },
      populate: ["predictions"],
    });

    if(entry){

      let index = getRandomInt(1, entry.predictions.length)

      let yourFortune = entry.predictions[index-1]

      delete entry.predictions
      delete entry.publishedAt
      delete entry.updatedAt
      delete entry.createdAt

      if(yourFortune?.description){
        yourFortune.description = filterHtmlUtilHolystick(yourFortune.description)
      }

      entry.yourPrediction = yourFortune

    }

    return entry
  },
}));
