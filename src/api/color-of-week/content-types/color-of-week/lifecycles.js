const slugify = require('slugify');
const { ApplicationError } = require("@strapi/utils").errors;

module.exports = {

  async beforeCreate(event) {
    // event.params.data.fullname = `${event.params.data.name} ${event.params.data.templeName}`

    // if (event.params.data.slug) {
    //   event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    // }
  },
  async beforeUpdate(event) {
    // if (event.params.data.publishedAt != null) {
    //   await strapi.db.query('api::color-of-week.color-of-week').updateMany({
    //     data: {
    //       publishedAt: null,
    //     },
    //   });
    // }
    // else {
    //   let countDraf = await strapi.db.query('api::color-of-week.color-of-week').count({
    //     where: {
    //       id: {
    //         $ne: event.params.where.id
    //       },
    //       publishedAt: {
    //         $null : true
    //       },
    //     },
    //   });
    //   let countAll = await strapi.db.query('api::color-of-week.color-of-week').count({
    //     where: {
    //       id: {
    //         $ne: event.params.where.id
    //       }
    //     }
    //   });
    //   console.log({
    //     countDraf,
    //     countAll
    //   })
    //   if (countDraf == countAll) {
    //     throw new ApplicationError('ไม่สามารถปิดทั้งหมดได้', 400);
    //   }
    // }
  },
};
