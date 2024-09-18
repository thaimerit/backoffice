"use strict";
const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;

module.exports = ({ strapi }) => ({
  async token(ctx) {
    try {
      const { fcmToken, platform } = ctx.request.body;
      const { user } = ctx.state;

      if(user){
        ctx.body = await strapi
          .plugin("fcm")
          .service("token")
          .registerToken({ user, fcmToken, platform });
      }else{

        let user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            username:"_GUEST"
          }
        });

        ctx.body = await strapi
          .plugin("fcm")
          .service("token")
          .registerToken({ user, fcmToken, platform });
      }

    } catch (error) {
      throw new ApplicationError(error.message);
    }
  },
});
