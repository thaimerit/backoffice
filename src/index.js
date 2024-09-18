"use strict";

const Handlebars = require("handlebars");

const OrderItemsCalculate = require("./util/order-items-calculate");

async function sendNotifyOnRegisterSuccess(user) {

  if(user.sentNotificationOnRegister === true) return

  let settingMessgage = await strapi.db
    .query("api::message-template.message-template")
    .findOne({
      where: {
        slug: "register-complete",
      },
    });

  if (!settingMessgage) {
    return;
  }

  let tTemplate = Handlebars.compile(settingMessgage.title);
  let mTemplate = Handlebars.compile(settingMessgage.message);

  let title = tTemplate({ user });
  let text = mTemplate({ user });

  strapi.entityService.create("api::notification.notification", {
    populate: {
      user: true,
      order: true,
      createdBy: true,
      updatedBy: true,
    },
    data: {
      title,
      message: text,
      type: "message",
      user: user
    },
  })

  strapi.query('plugin::users-permissions.user').update({
    where: {
      id: user.id
    },
    data: {
      sentNotificationOnRegister : true
    }
  });
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // strapi.service('api::liff.liff').completeOrders({
    //   userId: 143,
    //   orderId: 718
    // })
    // .catch(error=>{
    //   console.log("completeOrders-->", error)
    // })

    strapi.db.lifecycles.subscribe({
      models: ["order.order-item"],
      beforeUpdate: async (event) => {
        let data = event.params.data;

        if (data.product) {
          event.params.data = await OrderItemsCalculate(data);
        } else if (data.place) {
          event.params.data.qty = 1;
          event.params.data.total = event.params.data.price;
        }
      },
      beforeCreate: async (event) => {
        let data = event.params.data;

        if (data.product) {
          event.params.data = await OrderItemsCalculate(data);
        } else if (data.place) {
          event.params.data.qty = 1;
          event.params.data.total = event.params.data.price;
        }
      },
    });

    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      beforeUpdate: async (event) => {},
      beforeCreate: async (event) => {},
      async afterCreate(event) {
        // try {
        //   let user = event.result
        //   sendNotify(user)
        // } catch (error) {
        // }
      },
      async afterUpdate(event) {},
    });

    strapi.db.lifecycles.subscribe({
      models: ["plugin::fcm.fcm-token"],
      beforeUpdate: async (event) => {},
      beforeCreate: async (event) => {},
      async afterCreate(event) {
        // console.log("fcm-token.afterCreate", JSON.stringify(event, null, 2))
        sendNotifyOnRegisterSuccess(event.result.user)
      },
      async afterUpdate(event) {
        // console.log("fcm-token.afterUpdate", JSON.stringify(event, null, 2))
        sendNotifyOnRegisterSuccess(event.result.user)
      },
    });
  },
};
