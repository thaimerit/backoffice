'use strict';

const moment = require("moment");
require("moment/locale/th");
const Handlebars = require("handlebars");

const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;

/**
 * search service.
 */

async function sendNotify(_title, _message, params = {}) {

  let tTemplate = Handlebars.compile(_title);
  let mTemplate = Handlebars.compile(_message);

  let title = tTemplate(params);
  let message = mTemplate(params);
  let type = "message"

  if(params.sendNotification?.product){
    type = params.sendNotification?.product?.type
  }

  return await strapi.entityService.create("api::notification.notification", {
    populate: {
      user: true,
      order: true,
      createdBy: true,
      updatedBy: true,
    },
    data: {
      title,
      message,
      type,
      user: params.user,
      product: params.sendNotification?.product,
      sendNotification: params.sendNotification
    },
  });

}

module.exports = () => ({
  async updateSendingDate(id, data = {}) {
    try {
      let nofi = await strapi.query('api::send-notification.send-notification').findOne({
        where: {
          id
        }
      });
      console.log({
        check: moment(nofi.scheduleSendingDate).format("YYYYMMDDHHmm") != moment(data.scheduleSendingDate).format("YYYYMMDDHHmm"),
        sendingDate1: moment(nofi.scheduleSendingDate).format("YYYYMMDDHHmm"),
        sendingDate2: moment(data.scheduleSendingDate).format("YYYYMMDDHHmm"),
      })

      if (moment(nofi.scheduleSendingDate).format("YYYYMMDDHHmm") != moment(data.scheduleSendingDate).format("YYYYMMDDHHmm")){
        console.log("scheduleSendingDate", id)
        await strapi.entityService.update('api::send-notification.send-notification', id, {
          data
        })
      }
    } catch (error) {
      console.error(error)
    }
  },
  async send(id, option = {}) {

    try {



      let nofi = await strapi.query('api::send-notification.send-notification').findOne({
        populate: ["thumbnail", "product.coverImages.image"],
        where: {
          id
        }
      });

      if (!nofi) {
        throw new NotFoundError()
      }

      // console.log("NOTI", JSON.stringify(nofi, null, 4))

      let users = await strapi.query('plugin::users-permissions.user').findMany({
        where: {
          role: 1,
          receiveNewsletter: true,
        }
      });

      console.log({ usersCount: users.length })

      let ps = users.map(user => {

        return sendNotify(nofi.title, nofi.message, {
          user,
          sendNotification: nofi
        })

      })

      let results = await Promise.all(ps)

      await strapi.entityService.update('api::send-notification.send-notification', id, {
        data:{
          sentDate: new Date
        }
      })

      return results

    } catch (error) {
      console.error(error)
    }
  }
});
