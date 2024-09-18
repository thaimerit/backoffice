"use strict";
const firebase = require("./firebase");
const cron = require("./cron");

module.exports = ({ strapi }) => {
  // bootstrap phase

  firebase.init(strapi);
  cron.init(strapi);

  strapi.db.lifecycles.subscribe({
    models: ["api::fcm.fcm-plugin-configuration"],
    afterUpdate: async (event) => {
      firebase.init(strapi)
    },
  });

  strapi.db.lifecycles.subscribe({
    models: ["api::notification.notification"],
    afterCreate: async (event) => {

      let data = event.result;

      if(event.params.data.product){
        data.product = event.params.data.product
      }
      if(event.params.data.sendNotification){
        data.sendNotification = event.params.data.sendNotification
      }

      await strapi
        .plugin("fcm")
        .service("token")
        .sendNotification(data)
        .then((result) => {})
        .catch((err) => {
          console.error(error)
        });
    },
  });
};
