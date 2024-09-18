'use strict';

const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;
const moment = require("moment");
const Handlebars = require("handlebars");

/**
 * liff service.
 */


 async function sendMessage({order}){

  console.log("sendMessage", {
    order,
  })

  // send message
  try {
    let user = order.user

    let messageTemplate = {
      title : "ทำบุญออนไลน์เรียบร้อยแล้ว #{{order.id}}",
      message : `รหัสคำสั่งซื้อ {{order.id}}`,
    }

    if(order.type == "package"){

      let settingMessgage = await strapi.db.query("api::message-template.message-template").findOne({
        where: {
          slug: "order-package-complete"
        }
      })

      if(settingMessgage){
        messageTemplate = settingMessgage
      }

    }

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

 module.exports = ({ strapi }) => ({
  async completeOrders({userId, orderId}) {

    console.log({userId, orderId})

    let order = await strapi.db.query('api::order.order').findOne({
      populate:["packagePlace", "user"],
      where: {
        type: "package",
        status: "approve",
        partnerAcceptStatus: "accepted",
        id: orderId,
      }
    })

    if(!order){
      throw new NotFoundError()
    }

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place", "partnerTimeslotTrackers"],
      where: {
        place: order.packagePlace,
        user: userId,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      throw new ApplicationError("ไม่มีสิิทธิ์แก้ไขข้อมูล")
    }

    if (order.packagePeriod == "morning") {
      if(partnerTimeslot.morningQuota <= 0){
        throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
      }
    } else if (order.packagePeriod == "evening") {
      if(partnerTimeslot.eveningQuota <= 0){
        throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
      }
    }

    let date = moment().format("YYYY-MM-DD")

    let partnerTimeslotTracker = partnerTimeslot.partnerTimeslotTrackers.find((o)=>o.date == date)

    if(partnerTimeslotTracker){
      //update

      if (!partnerTimeslotTracker.morningQuotaUsed) partnerTimeslotTracker.morningQuotaUsed = 0
      if (!partnerTimeslotTracker.eveningQuotaUsed) partnerTimeslotTracker.eveningQuotaUsed = 0

      if (order.packagePeriod == "morning") {
        if(partnerTimeslotTracker.morningQuotaUsed >= partnerTimeslot.morningQuota){
          throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
        }
      } else if (order.packagePeriod == "evening") {
        if(partnerTimeslotTracker.eveningQuotaUsed >= partnerTimeslot.eveningQuota){
          throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
        }
      }

      if (order.packagePeriod == "morning") {
        partnerTimeslotTracker.morningQuotaUsed = partnerTimeslotTracker.morningQuotaUsed + 1
      } else if (order.packagePeriod == "evening") {
        partnerTimeslotTracker.eveningQuotaUsed = partnerTimeslotTracker.eveningQuotaUsed + 1
      }

      console.log({
        packagePeriod: order.packagePeriod,
        where: {
          id: partnerTimeslotTracker.id
        },
        data: partnerTimeslotTracker
      })

      await strapi.db.query('partner-timeslot-tracker.partner-timeslot-tracker').update({
        where: {
          id: partnerTimeslotTracker.id
        },
        data: partnerTimeslotTracker
      })

    }else{
      //create

      partnerTimeslotTracker = {
        date,
        morningQuotaUsed: 0,
        eveningQuotaUsed: 0
      }

      if (order.packagePeriod == "morning") {
        partnerTimeslotTracker.morningQuotaUsed = partnerTimeslotTracker.morningQuotaUsed + 1
      } else if (order.packagePeriod == "evening") {
        partnerTimeslotTracker.eveningQuotaUsed = partnerTimeslotTracker.eveningQuotaUsed + 1
      }

     await  strapi.entityService.update('api::partner-timeslot.partner-timeslot', partnerTimeslot.id, {
        data: {
          partnerTimeslotTrackers: [
            ...partnerTimeslot.partnerTimeslotTrackers,
            partnerTimeslotTracker
          ]
        }
      })

    }

    // sendMessage({order})

    await strapi.entityService.update('api::order.order', orderId, {
      data: {
        status: "complete",
        partnerUser: userId
      }
    })

  },
  async acceptOrders({userId, orderId}) {

    console.log({userId, orderId})

    let order = await strapi.db.query('api::order.order').findOne({
      populate:["packagePlace", "user"],
      where: {
        type: "package",
        status: "approve",
        partnerAcceptStatus: "pending",
        id: orderId,
      }
    })

    if(!order){
      throw new NotFoundError()
    }

    let partnerTimeslot = await strapi.db.query('api::partner-timeslot.partner-timeslot').findOne({
      populate: ["place", "partnerTimeslotTrackers"],
      where: {
        place: order.packagePlace,
        user: userId,
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (!partnerTimeslot) {
      throw new ApplicationError("ไม่มีสิิทธิ์แก้ไขข้อมูล")
    }

    if (order.packagePeriod == "morning") {
      if(partnerTimeslot.morningQuota <= 0){
        throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
      }
    } else if (order.packagePeriod == "evening") {
      if(partnerTimeslot.eveningQuota <= 0){
        throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
      }
    }

    let date = moment().format("YYYY-MM-DD")

    let partnerTimeslotTracker = partnerTimeslot.partnerTimeslotTrackers.find((o)=>o.date == date)

    if(partnerTimeslotTracker){
      //update

      if (!partnerTimeslotTracker.morningQuotaUsed) partnerTimeslotTracker.morningQuotaUsed = 0
      if (!partnerTimeslotTracker.eveningQuotaUsed) partnerTimeslotTracker.eveningQuotaUsed = 0

      if (order.packagePeriod == "morning") {
        if(partnerTimeslotTracker.morningQuotaUsed >= partnerTimeslot.morningQuota){
          throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
        }
      } else if (order.packagePeriod == "evening") {
        if(partnerTimeslotTracker.eveningQuotaUsed >= partnerTimeslot.eveningQuota){
          throw new ApplicationError("เกินจำนวนที่กำหนดแล้ว")
        }
      }

      if (order.packagePeriod == "morning") {
        partnerTimeslotTracker.morningQuotaUsed = partnerTimeslotTracker.morningQuotaUsed + 1
      } else if (order.packagePeriod == "evening") {
        partnerTimeslotTracker.eveningQuotaUsed = partnerTimeslotTracker.eveningQuotaUsed + 1
      }

      console.log({
        packagePeriod: order.packagePeriod,
        where: {
          id: partnerTimeslotTracker.id
        },
        data: partnerTimeslotTracker
      })

      await strapi.db.query('partner-timeslot-tracker.partner-timeslot-tracker').update({
        where: {
          id: partnerTimeslotTracker.id
        },
        data: partnerTimeslotTracker
      })

    }else{
      //create

      partnerTimeslotTracker = {
        date,
        morningQuotaUsed: 0,
        eveningQuotaUsed: 0
      }

      if (order.packagePeriod == "morning") {
        partnerTimeslotTracker.morningQuotaUsed = partnerTimeslotTracker.morningQuotaUsed + 1
      } else if (order.packagePeriod == "evening") {
        partnerTimeslotTracker.eveningQuotaUsed = partnerTimeslotTracker.eveningQuotaUsed + 1
      }

     await  strapi.entityService.update('api::partner-timeslot.partner-timeslot', partnerTimeslot.id, {
        data: {
          partnerTimeslotTrackers: [
            ...partnerTimeslot.partnerTimeslotTrackers,
            partnerTimeslotTracker
          ]
        }
      })

    }

    // sendMessage({order})

    await strapi.entityService.update('api::order.order', orderId, {
      data: {
        partnerAcceptStatus: "accepted",
        partnerUser: userId
      }
    })

  },
});
