'use strict';

/**
 *  order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;
const e = require('express');
const Omise = require("omise");
const order = require('../routes/order');
const Handlebars = require("handlebars");
const jwt = require("jsonwebtoken");
const { waitPaymentWebHook } = require('../../../util/paymentWebHook');

// module.exports = createCoreController('api::order.order');

async function sendMessage({order, user}){
  // send message
  try {
    let messageTemplate = {
      title : "สร้างรายการสำเร็จ #{{order.id}}",
      message : `รหัสคำสั่งซื้อ {{order.id}}\nจำนวนเงิน {{order.sum}}`,
    }

    if(order.type == "package"){

      let settingMessgage = await strapi.db.query("api::message-template.message-template").findOne({
        where: {
          slug: "order-package-created"
        }
      })

      if(settingMessgage){
        messageTemplate = settingMessgage
      }

    }else
    if(order.type == "product"){
      let settingMessgage = await strapi.db.query("api::message-template.message-template").findOne({
        where: {
          slug: "order-product-created"
        }
      })

      if(settingMessgage){
        messageTemplate = settingMessgage
      }
    }

    console.log({
      messageTemplate
    })


    let tTemplate = Handlebars.compile(messageTemplate.title);
    let mTemplate = Handlebars.compile(messageTemplate.message);

    let title = tTemplate({ order, user })
    let message = mTemplate({ order, user })

    console.log({
      messageTemplateWithData: {
        title,
        message
      }
    })

    console.log({
      notify: {
        title,
        message,
        type: "order",
        user: user.id,
        order: order.id,
      }
    })

    //send notification
    await strapi.entityService.create("api::notification.notification", {
      "populate": {
        "user": true,
        "order": true,
        "createdBy": true,
        "updatedBy": true
      },
      data: {
        title,
        message,
        type: "order",
        user: user.id,
        order: order.id,
      }
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  find: async (ctx, next) => {

    const { user } = ctx.state;

    // ctx.query = {
    //   // filters: {
    //   //   user: user.id
    //   // },
    //   // populate: ["orderItems"],
    // }
    let query = ctx.request.query

    // query['filter[user][id]'] = user.id
    if (query?.filters?.user) {
      delete query.filters
    }
    query.filters = {
      ...query.filters,
      user: {
        id: user.id
      },
      $and: [
        {
          status: {
            $ne: "draft"
          }
        }
      ]
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories,payment.transferSlip"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    query.sort= {
      createdAt: "desc"
    }

    let data = await strapi.entityService.findPage('api::order.order', query)

    data.results = data.results.map(o => {
      o.orderItem = null
      o.product = null
      o.place = null
      if (o.orderItems) {
        if (o.orderItems.length > 0) {
          o.orderItem = o.orderItems[0]
          if (o.orderItem.product) {
            o.product = o.orderItem.product
            o.place = o.orderItem.product.place
          } else
            if (o.orderItem.place) {
              o.place = o.orderItem.place
            }
        }
      }

      let payment = null

      if (o.payment) {
        payment = {
          paymentMethod: o.payment?.paymentMethod,
          amount: o.payment?.amount,
          status: o.payment?.status,
          createdAt: o.payment?.createdAt,
        }

        if (o.payment?.transferSlip) {
          payment.transferSlip = o.payment?.transferSlip?.url
        } else {
          payment.transferSlip = null
        }

        if (payment.paymentMethod == "omise") {
          payment.paymentMethod = "creditCard"
          payment.transaction = o.payment?.responseBody?.transaction
          payment.creditCard = {
            brand: o.payment?.responseBody?.card?.brand,
            bank: o.payment?.responseBody?.card?.bank,
            name: o.payment?.responseBody?.card?.name,
          }
        } else
          if (payment.paymentMethod == "bank") {
            payment.transaction = "bank_" + o.payment?.id
            payment.banks = []
          }
      }

      o.payment = payment

      return o
    })

    ctx.body = {
      data: data.results,
      meta: {
        pagination: data.pagination
      }
    }
  },
  carts: async (ctx, next) => {

    const { user } = ctx.state;

    // ctx.query = {
    //   // filters: {
    //   //   user: user.id
    //   // },
    //   // populate: ["orderItems"],
    // }
    let query = ctx.request.query

    // query['filter[user][id]'] = user.id
    if (query?.filters?.user) {
      delete query.filters
    }
    query.filters = {
      status: "draft",
      user: {
        id: user.id
      }
    }

    query.populate = "orderItems.product,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.coverImages,orderItems.product.coverImages.image,orderItems.product.categories,payment.transferSlip"

    if (query.pagination) {
      query = { ...query, ...query.pagination }
    }

    query.sort= {
      createdAt: "desc"
    }

    let data = await strapi.entityService.findPage('api::order.order', query)

    data.results = data.results.map(o => {
      o.orderItem = null
      o.product = null
      o.place = null
      if (o.orderItems) {
        if (o.orderItems.length > 0) {
          o.orderItem = o.orderItems[0]
          if (o.orderItem.product) {
            o.product = o.orderItem.product
            o.place = o.orderItem.product.place
          } else
            if (o.orderItem.place) {
              o.place = o.orderItem.place
            }
        }
      }

      let payment = null

      if (o.payment) {
        payment = {
          paymentMethod: o.payment?.paymentMethod,
          amount: o.payment?.amount,
          status: o.payment?.status,
          createdAt: o.payment?.createdAt,
        }

        if (o.payment?.transferSlip) {
          payment.transferSlip = o.payment?.transferSlip?.url
        } else {
          payment.transferSlip = null
        }

        if (payment.paymentMethod == "omise") {
          payment.paymentMethod = "creditCard"
          payment.transaction = o.payment?.responseBody?.transaction
          payment.creditCard = {
            brand: o.payment?.responseBody?.card?.brand,
            bank: o.payment?.responseBody?.card?.bank,
            name: o.payment?.responseBody?.card?.name,
          }
        } else
          if (payment.paymentMethod == "bank") {
            payment.transaction = "bank_" + o.payment?.id
            payment.banks = []
          }
      }

      o.payment = payment

      return o
    })

    ctx.body = {
      data: data.results,
      meta: {
        pagination: data.pagination
      }
    }
  },
  cartCount: async (ctx, next) => {

    const { user } = ctx.state;

    let count = await strapi.db.query('api::order.order').count({
      where: {
        status: "draft",
        user: {
          id: user.id
        }
      }
    })

    ctx.body = {
      count
    }
  },
  findOne: async (ctx, next) => {

    let id = ctx.request.params.id
    const { user } = ctx.state;


    let data = await strapi.entityService.findMany('api::order.order', {
      filters: {
        id: id,
        user: user.id,
      },
      populate: "orderItems.place.bankAccounts.bank,orderItems.product,orderItems.product.place.province,orderItems.product.place,orderItems.place.province,orderItems.place,orderItems.place.galleries,orderItems.place.coverImages,orderItems.product.galleries,orderItems.product.coverImages.image,orderItems.product.categories,evidenceOfActions,payment.transferSlip"
    })

    if (data.length == 0) {
      throw new NotFoundError()
    }

    let o = data[0]

    o.orderItem = null
    o.product = null
    o.place = null
    if (o.orderItems) {
      if (o.orderItems.length > 0) {
        o.orderItem = o.orderItems[0]
        if (o.orderItem.product) {
          o.product = o.orderItem.product
          o.place = o.orderItem.product.place
        } else
          if (o.orderItem.place) {
            o.place = o.orderItem.place
          }
      }
    }

    let payment = null

    if (o.payment) {
      payment = {
        paymentMethod: o.payment?.paymentMethod,
        amount: o.payment?.amount,
        status: o.payment?.status,
        createdAt: o.payment?.createdAt,
      }

      if (o.payment?.transferSlip) {
        payment.transferSlip = o.payment?.transferSlip?.url
      } else {
        payment.transferSlip = null
      }

      if (payment.paymentMethod == "omise") {
        payment.paymentMethod = "creditCard"
        payment.transaction = o.payment?.responseBody?.transaction
        payment.creditCard = {
          brand: o.payment?.responseBody?.card?.brand,
          bank: o.payment?.responseBody?.card?.bank,
          name: o.payment?.responseBody?.card?.name,
        }
      } else
        if (payment.paymentMethod == "bank") {

          let appConfig = await strapi.entityService.findMany('api::app-config.app-config', {
            populate: "bankAccounts.bank.image"
          })

          if (appConfig?.bankAccounts) {
            payment.banks = appConfig.bankAccounts.map(bankAccount => {

              delete bankAccount.bank.createdAt
              delete bankAccount.bank.updatedAt

              return bankAccount
            })
          }

          payment.transaction = "trxn_bank_" + o.payment?.id
        }
    }

    o.payment = payment

    ctx.body = o
  },
  payment: async (ctx, next) => {

    let id = ctx.request.params.id
    const { user } = ctx.state;
    const body = ctx.request.body;

    console.log({
      body
    })

    if (!id) {
      throw new ApplicationError("orderId not found")
    }

    if (!body.type) {
      throw new ApplicationError("type not found")
    }

    let data = await strapi.entityService.findMany('api::order.order', {
      filters: {
        id: id,
        user: user.id,
      }
    })

    if (data.length == 0) {
      throw new NotFoundError()
    }

    let order = data[0]
    let status = 'pending'
    let error_message = null
    let charge = null


    if (body.type == "omise") {

      let token = body.omise?.token

      if (!token) {
        throw new ApplicationError("omise.token not found")
      }

      let config = await strapi.entityService.findMany('api::config.config')
      let omise = Omise({
        publicKey: config.OMISE_PUBLIC_KEY,
        secretKey: config.OMISE_SECRET_KEY
      })

      let tokenJwt = jwt.sign({
          orderId: order.id,
          userId: user.id
      }, process.env.ADMIN_JWT_SECRET, { expiresIn: "10m" });

      const chargeBody = {
        amount: Math.ceil(order.total * 100),
        currency: "thb",
        description: JSON.stringify({ orderId: order.id, userId: user.id }),
        card: token,
        return_uri: `${process.env.PUBLIC_URL}/api/orders/${order.id}/payment-complete?token=${tokenJwt}`
      }

      let payment = null

      try {

        charge = await omise.charges.create(chargeBody)

        // if (charge.paid) {
        //   status = 'pending'
        // } else if (charge.status == "failed") {
        //   status = 'fail'
        // }

        payment = await strapi.entityService.create('api::payment.payment', {
          data: {
            paymentMethod: body.type,
            amount: charge.amount / 100,
            requestBody: chargeBody,
            responseBody: charge,
            omiseChargeId: charge.id,
            status,
            order: order.id
          }
        })

        let paymentWebhookData = await waitPaymentWebHook(charge,{
          publicKey: config.OMISE_PUBLIC_KEY,
          secretKey: config.OMISE_SECRET_KEY
        })

        status = 'success'

        await strapi.entityService.update('api::payment.payment', payment.id, {
          data: {
            status,
            responseBody: paymentWebhookData.data
          }
        })

      } catch (error) {

        status = 'fail'

        error_message = error.message

        await strapi.entityService.update('api::payment.payment', payment.id, {
          data: {
            status,
            responseBody: error.data
          }
        })

      }

    } else if (body.type == "bank") {

      if (!body?.bank?.image) {
        throw new ApplicationError("bank.image not found")
      }

      let payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          status: "pending",
          paymentMethod: body.type,
          amount: order.sum,
          order: order.id,
          transferSlip: body.bank?.image,
        }
      })

      status = 'success'
    }

    if (status == 'success') {
      let paymentStatus = null

      if (body.type == "omise") {
        // paymentStatus = 'purchase'
        paymentStatus = 'pending'
      } else if (body.type == "bank") {
        paymentStatus = 'waiting-for-payment'
      }

      await strapi.entityService.update('api::order.order', id, {
        data: {
          paymentStatus: paymentStatus
        }
      })
    }

    if(status == 'fail'){
      throw new ApplicationError(error_message || "ชำระเงินไม่สำเร็จ")
    }

    ctx.body = {
      authorize_uri:charge?.authorize_uri,
      order
    }
  },
  paymentComplete: async (ctx, next) => {
    try {
      let id = ctx.request.params.id
      const query = ctx.request.query;

      if (!id) {
        throw new ApplicationError("orderId not found")
      }

      if (!query.token) {
        throw new ApplicationError("token not found")
      }

      const decoded = jwt.verify(query.token, process.env.ADMIN_JWT_SECRET, { ignoreExpiration: true })

      let order = await strapi.db.query('api::order.order').findOne({
        where: {
          id: decoded.orderId,
          user: decoded.userId,
        },
        populate: ["payment"]
      })

      if (!order) {
        throw new NotFoundError()
      }

      await strapi.entityService.update('api::order.order', decoded.orderId, {
        data: {
          paymentStatus: "purchase"
        }
      })

      await strapi.entityService.update('api::payment.payment', order.payment.id, {
        data: {
          status: "success"
        }
      })


      ctx.redirect(process.env.WEB_URL + "/payment-complete");

    } catch (error) {
      // return ctx.badRequest('Token invalid');
      ctx.redirect(process.env.WEB_URL + "/payment-complete?error=" + error.message);
    }

  },
  update: async (ctx, next) => {

    let id = ctx.request.params.id
    const { user } = ctx.state;
    const body = ctx.request.body;
    let qty = body.qty ? +body.qty : null
    let status = body.status ? body.status : null

    if (!id) {
      throw new ApplicationError("orderId not found")
    }

    let order = await strapi.db.query('api::order.order').findOne({
      where: {
        id: id,
        user: user.id,
      },
      populate: ["orderItems.product","orderItems.place"]
    })

    if (!order) {
      throw new NotFoundError()
    }

    let orderItem = order.orderItems[0]
    if(orderItem.product){
      orderItem.product = orderItem.product.id
    }
    if(orderItem.place){
      orderItem.place = orderItem.place.id
    }

    if (qty) {

      // await strapi.db.query('order.order-item').update({
      //   where: {
      //     id: orderItem.id
      //   },
      //   data: {
      //     ...orderItem,
      //     qty
      //   }
      // })

      // await strapi.db.query('api::order.order').update({
      //   where: {
      //     id: orderItem.id
      //   },
      //   data: {
      //     ...orderItem,
      //     qty
      //   }
      // })

      orderItem.qty = qty

      await strapi.entityService.update('api::order.order', id, {
        data: {
          orderItems: [orderItem]
        }
      })

    }

    if(status){
      if(status=="cancel"){
        if( ["draft", "pending"].indexOf(order.status) == -1){
          throw new ApplicationError("order is no draft or pending")
        }

        await strapi.db.query('api::order.order').update({
          where: {
            id
          },
          data: {
            status : "cancel"
          }
        })

      }else
      if(status=="pending"){

        if(order.status != "draft"){
          throw new ApplicationError("order is no draft")
        }

        await strapi.db.query('api::order.order').update({
          where: {
            id
          },
          data: {
            status : "pending"
          }
        })

        await sendMessage({
          order,
          user
        })

      }else{
        throw new ApplicationError("status invalid")
      }
    }

    if(qty || status){
      order = await strapi.db.query('api::order.order').findOne({
        where: {
          id: id,
          user: user.id,
        },
        populate: ["orderItems.product","orderItems.place"]
      })
    }

    ctx.body = {
      order
    }
  },
  delete: async (ctx, next) => {

    let id = ctx.request.params.id
    const { user } = ctx.state;


    let data = await strapi.entityService.findMany('api::order.order', {
      filters: {
        id: id,
        user: user.id,
      },
      // populate: "orderItems.product,orderItems.place,orderItems.place.galleries,orderItems.place.coverImages,orderItems.product.galleries,orderItems.product.coverImages.image,orderItems.product.categories"
    })

    if (data.length == 0) {
      throw new NotFoundError()
    }

    if (data[0].status != "pending") {
      throw new ApplicationError("ไม่สามารถยกเลิกได้")
    }

    await strapi.entityService.update('api::order.order', id, {
      data: {
        status: "cancel"
      }
    })

    ctx.body = data[0]
  },
  create: async (ctx, next) => {
    const { user } = ctx.state;
    let body = ctx.request.body


    let orderItems = body.orderItems
    let type = body.type
    let total = 0
    let packagePlace = null
    let packagePeriod = null
    let packageDate = null

    let ps = orderItems.map(async (orderItem) => {

      if (orderItem.productId) {
        orderItem.product = orderItem.productId
        delete orderItem.productId
      }
      if (orderItem.placeId) {
        orderItem.place = orderItem.placeId
        delete orderItem.placeId
      }
      if (body.type == "package") {

        let product = await strapi.db.query('api::product.product').findOne({
          where: {
            publishedAt: {
              $notNull: true
            },
            id: orderItem.product
          },
          populate: ["place"],
        })

        if (!product) {
          throw new ApplicationError('ไม่พบ productId=' + orderItem.productId, 404);
        }

        packagePlace = product.place.id
        packagePeriod = orderItem.period
        packageDate = orderItem.date
      }

      // orderItem.price = product.price
      // orderItem.promotionPrice = product.promotionPrice ? product.promotionPrice : 0

      // let price = +product.price
      // if (product.promotionPrice) {
      //   price = +product.promotionPrice
      // }

      // orderItem.total = price * orderItem.qty

      // total += orderItem.total

      // orderItem.price = 0
      // orderItem.promotionPrice = 0
      // orderItem.total = 0

      return orderItem
    })

    orderItems = await Promise.all(ps)


    let order = {
      orderItems,
      type,
      user: user.id
    }

    if (body.type == "donation") {
      order.customer_firstname = body.customer_firstname
      order.customer_lastname = body.customer_lastname
      order.customer_taxno = body.customer_taxno
    }

    if(body.customer_name){
      order.customer_name = body.customer_name
    }

    if (body.type == "package") {
      order.packagePlace = packagePlace
      order.packagePeriod = packagePeriod
      order.packageDate = packageDate
    }

    if (body.type == "product") {
      order.shippingAddress = body.shippingAddress
    }

    let orderResult = await strapi.entityService.create('api::order.order', {
      data: order
    })

    let data = await strapi.entityService.findOne('api::order.order', orderResult.id)

    ctx.body = { data }
  }
}
