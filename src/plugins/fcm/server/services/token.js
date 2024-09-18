"use strict";

const { stripHtml, substringText } = require("../../../../util/filterHtmlUtil");
const firebase = require("../firebase");

module.exports = ({ strapi }) => ({
  async registerToken({ user, fcmToken, platform }) {
    //if (!user) throw new Error("user not found");
    if (!fcmToken) throw new Error("fcmToken not found");
    if (!platform) throw new Error("platform not found");

    if (["ios", "android"].indexOf(platform) == -1)
      throw new Error("platform invalid");

    await strapi
      .query("plugin::fcm.fcm-token")
      .deleteMany({ where: { fcmToken } });

    let fcm = await strapi
      .query("plugin::fcm.fcm-token")
      .findOne({ where: { user, fcmToken, platform } });

    if (!fcm) {
      fcm = await strapi
        .query("plugin::fcm.fcm-token")
        .create({
          populate: { user: true },
          data: { user, fcmToken, platform },
        });
    } else {
      fcm = await strapi
        .query("plugin::fcm.fcm-token")
        .update({
          populate: { user: true },
          where: { id: fcm.id },
          data: { fcmToken },
        });
    }

    return fcm;
  },
  async sendNotification(notification) {
    try {

      let product = null
      let imageUrl = null

      if(notification?.product){
        product = notification?.product

        if (product?.coverImages?.length > 0) {
          let thumbnail = product.coverImages[0].image;
          imageUrl = `${process.env.PUBLIC_URL}${thumbnail.url}`
        }
      }

      let _tokens = await strapi.query("plugin::fcm.fcm-token").findMany({
        where: {
          user: notification.user.id,
        },
      });

      let result = null;
      let perPage = 1000;

      if (_tokens.length >= 0) {

        let pages = Math.ceil(_tokens.length / perPage);

        for (let page = 1; page <= pages; page++) {
          // let startIndex = (page - 1) * perPage;
          let tokens = _tokens.splice(0, perPage);

          tokens = tokens.map((o) => o.fcmToken);
          let target = tokens.join(",");

          let payload = {
            type: notification.type,
          };

          if (notification.order) {
            payload.order = JSON.stringify(notification.order);
          }

          if (notification.type == "package") {
            payload.package = JSON.stringify({
              id : product?.id
            })
          }

          if (notification.type == "product") {
            payload.product = JSON.stringify({
              id : product?.id
            })
          }

          try {
            result = await firebase.send({
              title: stripHtml(notification.title),
              body: substringText(stripHtml(notification.message)),
              image: imageUrl,
              payload: {
                data: payload,
              },
              target,
            });

            // console.log("fcm.result");
            // console.log(JSON.stringify(result, null, 2));

            if (result) {
              let deletes = [];
              result.results.forEach((o, index) => {
                if (o.error) {
                  deletes.push(tokens[index]);
                }
              });
              if (deletes.length > 0) {
                await strapi.query("plugin::fcm.fcm-token").deleteMany({
                  where: {
                    fcmToken: { $in: deletes },
                  },
                });
              }
            }
          } catch (error) {
            result = error.message;
          }
        }
      } else {
        result = "tokens not found";
      }

      await strapi.query("api::notification.notification").update({
        where: {
          id: notification.id,
        },
        data: {
          debug: {
            token: _tokens,
            result,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
});
