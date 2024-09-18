'use strict';

const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;
const urljoin = require('url-join');
const axios = require('axios');
const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const utils = require('@strapi/utils');
const moment = require("moment");
const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = utils;

/**
 * A set of functions called "actions" for `liff`
 */

let api = axios.create({
  baseURL: "https://api.line.me"
})

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = {
  auth: async (ctx, next) => {
    try {

      const { accessToken } = ctx.request.body

      console.log({
        accessToken
      })

      let resultProfile = await api.get("/v2/profile", {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(response => response.data)

      console.log({
        resultProfile
      })

      let user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          lineUserId: resultProfile.userId
        },
        populate: ["role"]
      });

      console.log({
        user
      })

      if (user) {

        //update user

        await strapi.query('plugin::users-permissions.user').update({
          where: {
            lineUserId: resultProfile.userId
          },
          data: {
            lineAccessToken: accessToken
          }
        });


      } else {
        //create user

        console.log("no user")

        ctx.request.body = {
          email: `${resultProfile.userId}@line.me`,
          firstName: `${resultProfile.displayName}`,
          lastName: `line`,
          username: `line_${resultProfile.userId}`,
          password: `${resultProfile.userId}@line@passw0rd`,
          lineUserId: resultProfile.userId,
          lineAccessToken: accessToken,
          dateOfBirthType: 'day',
          role: 3
        }

        console.log("create.body", ctx.request.body)

        let data = await strapi
          .controller('plugin::users-permissions.user')
          .create(ctx);

        console.log("create.data", data)

        user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            lineUserId: resultProfile.userId
          },
          populate: ["role"]
        });

        console.log("create.user", user)

      }

      let jwt = getService('jwt').issue({ id: user.id })
      let _user = await sanitizeUser(user, ctx);
      _user.role = user.role

      console.log("line.jwt", jwt)

      return ctx.send({
        jwt: jwt,
        user: _user
      });

      // const config = await strapi.entityService.findMany('api::config.config', {
      // });

      // if (!config?.LINE_LIFF_CHANNEL_ID) {
      //   throw new ApplicationError('Config "LINE_LIFF_CHANNEL_ID" not found', 400);
      // }

      // let LINE_LIFF_CHANNEL_ID = config?.LINE_LIFF_CHANNEL_ID

      // const apiPrefix = strapi.config.get('api.rest.prefix');

      // const baseURL = urljoin(strapi.config.server.url, apiPrefix);

      // console.log(baseURL);

      // let authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_LIFF_CHANNEL_ID}&redirect_uri=${encodeURI(baseURL + "/liff/auth/callback")}&state=liff&scope=profile%20openid`

      // ctx.redirect(authUrl)
      // ctx.body = authUrl
    } catch (err) {
      console.log("line.err", err)
      ctx.body = err;
    }
  },
  profile: async (ctx, next) => {
    try {

      const { user } = ctx.state;

      if(user.confirmed==false){
        ctx.body = false
        return
      }

      if (user.role.name == "LiffApp") {
        ctx.body = true
        return
      } else {
        ctx.body = false
        return
      }

    } catch (err) {
      ctx.body = err;
    }
  },
  findOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let query = ctx.request.query

    console.log(query)

    query.filters = {
      ...query.filters,
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    let partnerTimeslots = await strapi.db.query('api::partner-timeslot.partner-timeslot').findMany({
      populate: ["place"],
      where: {
        user: user.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (partnerTimeslots.length == 0) {
      return ctx.body = {
        data: [],
        meta: {
          pagination: {}
        }
      }
    }

    let placeIds = partnerTimeslots.map(partnerTimeslot=>partnerTimeslot.place.id)

    let date = query.date ? moment(query.date, "YYYY-MM-DD") : null
    let filters = {
      type: "package",
      status: ["approve"],
      partnerAcceptStatus: "accepted",
      packagePlace: placeIds
    }

    if (query.period) {
      filters.packagePeriod = query.period
    }

    if (date) {
      filters.packageDate = {
        $gte: date.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        $lte: date.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      }
    }

    let page = 1
    let pageSize = 1000
    if (query.pagination) {
      pageSize = query.pagination.pageSize
      page = query.pagination.page
    }

    let data = await strapi.entityService.findPage('api::order.order', {
      populate: "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories",
      filters,
      pageSize,
      page,
      sort: { packageDate: 'asc' },
    })

    let results = data.results.map(item => {
      item.orderItem = item.orderItems[0]
      item.package = item.orderItems[0].product
      return item
    })

    ctx.body = {
      data: results,
      meta: {
        pagination: data.pagination
      }
    }
  },
  findNotAcceptedOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let query = ctx.request.query

    console.log(query)

    query.filters = {
      ...query.filters,
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    let partnerTimeslots = await strapi.db.query('api::partner-timeslot.partner-timeslot').findMany({
      populate: ["place"],
      where: {
        user: user.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (partnerTimeslots.length == 0) {
      return ctx.body = {
        data: [],
        meta: {
          pagination: {}
        }
      }
    }

    let placeIds = partnerTimeslots.map(partnerTimeslot=>partnerTimeslot.place.id)

    console.log({
      placeIds
    })

    let date = query.date ? moment(query.date, "YYYY-MM-DD") : null
    let filters = {
      type: "package",
      status: ["approve", "complete"],
      partnerAcceptStatus: "pending",
      packagePlace: placeIds
    }

    if (query.period) {
      filters.packagePeriod = query.period
    }

    if (date) {
      filters.packageDate = {
        $gte: date.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        $lte: date.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      }
    }
    else{
      // filters.packageDate = {
      //   $gte: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      //   // $lte: date.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      // }
    }

    let page = 1
    let pageSize = 1000
    if (query.pagination) {
      pageSize = query.pagination.pageSize
      page = query.pagination.page
    }

    let data = await strapi.entityService.findPage('api::order.order', {
      populate: "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories",
      filters,
      pageSize,
      page,
      sort: { packageDate: 'asc' },
    })

    let results = data.results.map(item => {
      item.orderItem = item.orderItems[0]
      item.package = item.orderItems[0].product
      return item
    })

    ctx.body = {
      data: results,
      meta: {
        pagination: data.pagination
      }
    }
  },
  findCompleteOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let query = ctx.request.query

    query.filters = {
      ...query.filters,
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    let partnerTimeslots = await strapi.db.query('api::partner-timeslot.partner-timeslot').findMany({
      populate: ["place"],
      where: {
        user: user.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (partnerTimeslots.length == 0) {
      return ctx.body = {
        data: [],
        meta: {
          pagination: {}
        }
      }
    }

    let placeIds = partnerTimeslots.map(partnerTimeslot=>partnerTimeslot.place.id)

    let date = query.date ? moment(query.date, "YYYY-MM-DD") : null
    let filters = {
      type: "package",
      status: ["complete"],
      partnerAcceptStatus: ["accepted"],
      packagePlace: placeIds,
    }

    if (query.period) {
      filters.packagePeriod = query.period
    }

    if (date) {
      filters.packageDate = {
        $gte: date.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        $lte: date.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      }
    }

    let page = 1
    let pageSize = 1000
    if (query.pagination) {
      pageSize = query.pagination.pageSize
      page = query.pagination.page
    }

    console.log({
      filters
    })

    let data = await strapi.entityService.findPage('api::order.order', {
      populate: "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories",
      filters,
      pageSize,
      page,
      sort: { packageDate: 'desc' },
    })

    let results = data.results.map(item => {
      item.orderItem = item.orderItems[0]
      item.package = item.orderItems[0].product
      return item
    })

    ctx.body = {
      data: results,
      meta: {
        pagination: data.pagination
      }
    }
  },
  findSummary: async (ctx, next) => {

    const { user } = ctx.state;
    let query = ctx.request.query

    query.filters = {
      ...query.filters,
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place"],
      where: {
        user: user.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      return ctx.body = {
        data: []
      }
    }

    let date = query.date ? moment(query.date, "YYYY-MM-DD") : null
    let filters = {
      type: "package",
      status: ["complete"],
      partnerUser: user.id
    }

    if (date) {
      filters.packageDate = {
        $gte: date.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        $lte: date.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      }
    }

    let orders = await strapi.entityService.findMany('api::order.order', {
      //populate: "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories",
      filters
    })

    let sum = 0
    orders.forEach(order=>{
      sum += order.total
    })

    ctx.body = {
      data: orders,
      meta: {
        sum,
        total: orders.length
      }
    }
  },
  findOneOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let params = ctx.request.params
    let query = ctx.request.query
    let orderId = params.id

    let filters = {
      type: "package",
      id: params.id,
    }

    let data = await strapi.entityService.findMany('api::order.order', {
      populate: "evidenceOfActions,orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories,packagePlace",
      filters
    })

    let results = data.map(item => {
      item.orderItem = item.orderItems[0]
      item.package = item.orderItems[0].product
      item.product = item.orderItems[0].product
      return item
    })

    if (results.length == 0) {
      throw new NotFoundError()
    }

    let result = results[0]

    console.log({result})
    console.log(result.packagePlace.id)

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place"],
      where: {
        user: user.id,
        place: result?.packagePlace?.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      throw new NotFoundError()
    }

    ctx.body = result
  },
  acceptOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let params = ctx.request.params
    let query = ctx.request.query

    await strapi.service('api::liff.liff').acceptOrders({
      userId: user.id,
      orderId: params.id
    })


    ctx.body = true
  },
  completeOrders: async (ctx, next) => {

    const { user } = ctx.state;
    let params = ctx.request.params
    let query = ctx.request.query

    await strapi.service('api::liff.liff').completeOrders({
      userId: user.id,
      orderId: params.id
    })


    ctx.body = true
  },
  evidenceOfActions_Get: async (ctx, next) => {
    ctx.body = []
  },
  evidenceOfActions_Upload: async (ctx, next) => {

    const { user } = ctx.state;
    let params = ctx.request.params
    let body = ctx.request.body

    let filters = {
      type: "package",
      id: params.id,
    }

    let results = await strapi.entityService.findMany('api::order.order', {
      filters,
      populate: ["evidenceOfActions", "packagePlace"]
    })

    if (results.length == 0) {
      throw new NotFoundError()
    }

    let result = results[0]

    console.log({
      result
    })

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place"],
      where: {
        user: user.id,
        place: result?.packagePlace?.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      throw new NotFoundError()
    }

    let oldEvidenceOfActions = result.evidenceOfActions ? result.evidenceOfActions.map(item => item.id) : []

    let upload = await strapi.entityService.update('api::order.order', result.id, {
      data: {
        evidenceOfActions: [...oldEvidenceOfActions, body.image],
        partnerUser: user.id
      }
    })

    ctx.body = upload
  },
  evidenceOfActions_Delete: async (ctx, next) => {

    const { user } = ctx.state;
    let params = ctx.request.params
    let body = ctx.request.body

    let filters = {
      type: "package",
      id: params.id,
    }

    let results = await strapi.entityService.findMany('api::order.order', {
      filters,
      populate: ["evidenceOfActions", "packagePlace"]
    })

    if (results.length == 0) {
      throw new NotFoundError()
    }

    let result = results[0]

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place"],
      where: {
        user: user.id,
        place: result?.packagePlace?.id,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      throw new NotFoundError()
    }

    let oldEvidenceOfActions = result.evidenceOfActions.map(item => item.id)

    let indexPhoto = oldEvidenceOfActions.indexOf(+params.photoId)

    if (indexPhoto != -1) {
      oldEvidenceOfActions.splice(indexPhoto, 1)
    }

    let upload = await strapi.entityService.update('api::order.order', result.id, {
      data: {
        evidenceOfActions: [...oldEvidenceOfActions]
      }
    })

    ctx.body = true
  },
  //   authCallback: async (ctx, next) => {
  //     try {

  //       const config = await strapi.entityService.findMany('api::config.config', {
  //       });

  //       if (!config?.LINE_LIFF_CHANNEL_ID) {
  //         throw new ApplicationError('Config "LINE_LIFF_CHANNEL_ID" not found', 400);
  //       }

  //       let LINE_LIFF_CHANNEL_ID = config?.LINE_LIFF_CHANNEL_ID
  //       let LINE_LIFF_CHANNEL_SECRET = config?.LINE_LIFF_CHANNEL_SECRET
  //       let LINE_LIFF_FRONT_END_URL = config?.LINE_LIFF_FRONT_END_URL

  //       const code = ctx.query.code

  //       const apiPrefix = strapi.config.get('api.rest.prefix');
  //       const baseURL = urljoin(strapi.config.server.url, apiPrefix);

  //       console.log({ query: ctx.query })

  //       const params = new URLSearchParams()
  //       params.append('grant_type', "authorization_code")
  //       params.append('code', code)
  //       params.append('redirect_uri', baseURL + "/liff/auth/callback")
  //       params.append('client_id', LINE_LIFF_CHANNEL_ID)
  //       params.append('client_secret', LINE_LIFF_CHANNEL_SECRET)

  //       let result = await api.post("/oauth2/v2.1/token", params, {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded'
  //         }
  //       }).then(response => response.data)

  //       let resultProfile = await api.get("/v2/profile", {
  //         headers: {
  //           'Authorization': 'Bearer ' + result.access_token
  //         }
  //       }).then(response => response.data)

  //       console.log({ resultProfile })

  //       let user = await strapi.query('plugin::users-permissions.user').findOne({
  //         where: {
  //           lineUserId: resultProfile.userId
  //         },
  //       });

  //       if (user) {

  //         //update user

  //         await strapi.query('plugin::users-permissions.user').update({
  //           where: {
  //             lineUserId: resultProfile.userId
  //           },
  //           data: {
  //             lineAccessToken: result.access_token
  //           }
  //         });


  //       } else {
  //         //create user

  //         ctx.request.body = {
  //           email: `${resultProfile.userId}@line.me`,
  //           firstName: `${resultProfile.displayName}`,
  //           lastName: `line`,
  //           username: `line_${resultProfile.userId}`,
  //           password: `${resultProfile.userId}@line@passw0rd`,
  //           lineUserId: resultProfile.userId,
  //           lineAccessToken: result.access_token,
  //           role: 3
  //         }

  //         let data = await strapi
  //           .controller('plugin::users-permissions.user')
  //           .create(ctx);

  //         user = await strapi.query('plugin::users-permissions.user').findOne({
  //           where: {
  //             lineUserId: resultProfile.userId
  //           },
  //         });

  //       }

  //       let jwt = getService('jwt').issue({ id: user.id })

  //       // ctx.body = ctx.query

  //       // return ctx.send({
  //       //   jwt: getService('jwt').issue({ id: user.id }),
  //       //   user: await sanitizeUser(user, ctx),
  //       // });
  //       return ctx.redirect(LINE_LIFF_FRONT_END_URL + "?access_token=" + jwt)
  //     } catch (err) {
  //       console.log(err)
  //       ctx.body = err;
  //     }
  //   }
};
