'use strict';

/**
 *  color-of-week controller
 */

const moment = require('moment');
const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::color-of-week.color-of-week');

module.exports = {
  async colorOfWeek(ctx) {
    const entry = await strapi.db.query('api::color-of-week.color-of-week').findOne({
      where: {
        publishedAt: {
          $notNull: true
        },
        slug: {
          $eq : "color-for-week"
        }
      },
      populate: ['colors', 'colors.workColors', 'colors.moneyColors', 'colors.loveColors', 'colors.unfortunateColors'],
    });
    return {data:entry}
  },
  async colorForYou(ctx) {

    const { user } = ctx.state;

    let dayOfWeek = null
    let dayOfWeekName = null

    if (user.dateOfBirth) {
      dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD").locale("en").format("dddd").toLocaleLowerCase()
      dayOfWeekName = "วัน" + moment(user.dateOfBirth, "YYYY-MM-DD").locale("th").format("dddd")
    }

    console.log({
      dayOfWeek
    })

    const entry = await strapi.db.query('api::color-of-week.color-of-week').findOne({ // uid syntax: 'api::api-name.content-type-name'
      where: {
        publishedAt: {
          $notNull: true
        },
        slug: {
          $eq : "color-for-you"
        }
        // $or: [
        //   {
        //     $and: [
        //       {
        //         startDate: { $lte: moment().startOf("day").format('YYYY-MM-DD HH:mm:ss') },
        //       },
        //       {
        //         endDate: { $gte: moment().startOf("day").format('YYYY-MM-DD HH:mm:ss') },
        //       }
        //     ]
        //   },
        //   {
        //     $and: [
        //       {
        //         startDate: { $null: true },
        //       },
        //       {
        //         endDate: { $null: true },
        //       }
        //     ]
        //   }
        // ]
      },
      populate: ['colors', 'colors.workColors', 'colors.moneyColors', 'colors.loveColors', 'colors.unfortunateColors'],
    });

    let newData = null

    if (entry && dayOfWeek) {
      newData = {
        "id": entry.id,
        "name": entry.name,
        "slug": entry.slug,
        "by": entry.by
      }

      let color = entry.colors.find(color => color.dayOfWeek == dayOfWeek)

      if(!color) return {data:{
        unfortunateColors: [],
        fortunateColors: []
      }}


      color.dayOfWeekName = dayOfWeekName

      newData.unfortunateColors = color.unfortunateColors.map(o => {
        o.luckName = "สีต้องห้าม"
        return o
      })
      newData.fortunateColors = [
        ...color.moneyColors.map(o => {
          o.luckName = "การเงิน"
          return o
        }),
        ...color.workColors.map(o => {
          o.luckName = "การงาน"
          return o
        }),
        ...color.loveColors.map(o => {
          o.luckName = "ความรัก"
          return o
        }),
      ]

    }

    return {data:newData}
  }
}
