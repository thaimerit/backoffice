const moment = require("moment");
require("moment/locale/th");
const Handlebars = require("handlebars");
const { createCron } = require("../../../../plugins/fcm/server/cron");

async function sendNotify(_title, _message, params={}) {

    let tTemplate = Handlebars.compile(_title);
    let mTemplate = Handlebars.compile(_message);

    let title = tTemplate(params);
    let message = mTemplate(params);

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
        type: "message",
        user: params.user,
        sendNotification: params.sendNotification.id
      },
    });

}

module.exports = {
  async beforeCreate(event) {

  },
  async beforeUpdate(event) {
  },
  async afterCreate(event) {

    //let data = event.result

    createCron()

    //strapi.service('api::send-notification.send').send(data.id)

    // let users = await strapi.query('plugin::users-permissions.user').findMany({
    //   where: {
    //     role:1,
    //     receiveNewsletter: true,
    //     // fcmTokens: {
    //     //   fcmToken: {
    //     //     $notNull: true,
    //     //   }
    //     // }
    //   }
    // });

    // let ps = users.map(user=>{
    //   let data = event.result
    //   return sendNotify(data.title, data.message, {
    //     user,
    //     sendNotification: data
    //   })
    // })

    // Promise.all(ps).then(result=>{
    //   console.log({
    //     result
    //   })
    // })
  },
  async afterUpdate(event) {
    await createCron()
  },
  async afterDelete(event) {
    await createCron()
  },
};
