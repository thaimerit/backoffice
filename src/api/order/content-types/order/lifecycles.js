const lineClient = require("../../../../plugins/line-notify/server/line-client");
const { getPackagePeriod } = require("../../../../util/package-period");
const moment = require("moment");
require("moment/locale/th");
const Handlebars = require("handlebars");

async function sendNotifyToPartner(order, template) {
  try {
    if (order.type == "package" && order.packagePlace) {
      let placeId = order.packagePlace;

      let partnerTimeslots = await strapi.db
        .query("api::partner-timeslot.partner-timeslot")
        .findMany({
          populate: ["place", "user"],
          where: {
            place: placeId,
            publishedAt: {
              $notNull: true,
            },
          },
        });

      //console.log("partnerTimeslots", JSON.stringify(partnerTimeslots, null, 2));

      let lineUsers = partnerTimeslots
        .filter((item) => item.user)
        .filter((item) => item.user?.lineUserId)
        .map((item) => item.user.lineUserId);

      // console.log({
      //   lineUsers,
      // });

      let period = getPackagePeriod(order.packagePeriod);
      let date = moment(order.packageDate, "YYYY-MM-DD")
        .locale("th")
        .format("DD MMM YYYY");
      let messageTemplate = {
        type: "text",
        text: `มีรายการจอง #{{order.id}}\nวันที่ {{date}}\n{{period}}`,
      };

      let settingMessgage = await strapi.db
        .query("api::message-template.message-template")
        .findOne({
          where: {
            slug: template, //"line-order-approve",
          },
        });

      if (settingMessgage) {
        messageTemplate = settingMessgage;
      }

      let tTemplate = Handlebars.compile(messageTemplate.title);
      let mTemplate = Handlebars.compile(messageTemplate.message);

      let title = tTemplate({ order, date, period });
      let text = mTemplate({ order, date, period });
      let webLink = process.env.WEB_URL + "/liff/orders/" + order.id;

      let flexTexts = text.split("\n").filter(text=>text).map(text=>{
        return {
          type: "text",
          text: text,
        }
      })

      console.log({
        title,
        text,
        webLink,
        flexTexts,
      });

      let message = {
        type: "flex",
        altText: title,
        contents: {
          type: "bubble",
          // hero: {
          //   type: "image",
          //   url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
          //   size: "full",
          //   aspectRatio: "20:13",
          //   aspectMode: "cover",
          //   action: {
          //     type: "uri",
          //     uri: webLink,
          //   },
          // },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: title,
                weight: "bold",
                size: "xl",
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                spacing: "sm",
                contents: flexTexts,
              },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "link",
                height: "sm",
                action: {
                  type: "uri",
                  label: "รายละเอียด",
                  uri: webLink,
                },
              },
              {
                type: "box",
                layout: "vertical",
                contents: [],
                margin: "sm",
              },
            ],
            flex: 0,
          },
        },
      };

      await lineClient.send(lineUsers, message);
    }
  } catch (error) {
    console.log("===================================");
    console.log("===  sendNotifyToPartner ERROR  ===");
    console.log("===================================");
    if (error.response?.data) {
      console.log(error.response?.data);
    } else {
      console.log(error);
    }
  }
}

async function sendNotify(order, tempalte) {
  console.log("sendNotify--->", JSON.stringify(order, null, 2), tempalte);
  if (order.type == "package" && tempalte) {
    let settingMessgage = await strapi.db
      .query("api::message-template.message-template")
      .findOne({
        where: {
          slug: tempalte,
        },
      });

    if (!settingMessgage) {
      console.error("ไม่มี template");
      return;
    }

    if (settingMessgage) {
      messageTemplate = settingMessgage;
    }

    let tTemplate = Handlebars.compile(messageTemplate.title);
    let mTemplate = Handlebars.compile(messageTemplate.message);

    let title = tTemplate({ order });
    let text = mTemplate({ order });

    await strapi.entityService.create("api::notification.notification", {
      populate: {
        user: true,
        order: true,
        createdBy: true,
        updatedBy: true,
      },
      data: {
        title,
        message: text,
        type: "order",
        user: order.user,
        order: order.id,
      },
    });
  }
}

async function formatOrder(id, data) {
  let appConfig = await strapi.db.entityManager.findOne(
    "api::app-config.app-config"
  );

  if (
    (JSON.stringify(Object.keys(data)) ==
      JSON.stringify(["total", "updatedAt"])) ==
    true
  )
    return;

  let total = 0;
  let totalPoint = 0;
  let sum = 0;
  let vat = 0;
  let vatTotal = 0;
  if (data.orderItems) {
    let ps = data.orderItems.map(async (orderItem) => {
      let _orderItem = await strapi.db.entityManager.findOne(
        "order.order-item",
        {
          where: {
            id: orderItem.id,
          },
        }
      );

      total += _orderItem.total;

      if (_orderItem.point) {
        totalPoint += _orderItem.point;
      }
    });

    await Promise.all(ps);

    if (data.type != "donation") {
      if (appConfig.vat) {
        vat = appConfig.vat;
      }

      vatTotal = (total * vat) / 100;
    }

    sum = total + vatTotal;

    await strapi.entityService.update("api::order.order", id, {
      data: {
        total,
        vat,
        sum,
        point: totalPoint,
      },
    });
  }

  // if (data.status == "approve") {
  //   data.id = id;
  //   sendNotifyToPartner(data, "line-order-approve");
  // }

  if (data.status == "complete" && data.complete == false) {
    await strapi.entityService.update("api::order.order", id, {
      data: {
        complete: true,
      },
    });

    let point = data.point;
    if (point) {
      let user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        data.user
      );

      console.log("USER--->", {
        userId: data.user,
        user,
        point,
      });

      if (user) {
        if (!user.point) user.point = 0;

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          data.user,
          {
            data: {
              point: user.point + point,
            },
          }
        );
      }
    }
  }
}

module.exports = {
  async beforeCreate(event) {},
  async beforeUpdate(event) {
    try {

      if(event?.params?.data?.updatedBy){
        event.params.data.updatedUserAt = new Date
        event.params.data.updatedUser = event.params?.data?.updatedBy
      }

      // if (event?.params?.data?.paymentStatus) {
        let oldData = await strapi.db.query("api::order.order").findOne({
          populate: ["user"],
          where: {
            id: event.params.where.id,
          },
        });

        if (!oldData) {
          return;
        }

        //status
        if (oldData.status != event.params.data.status) {
          switch (event.params.data.status) {
            case "approve":
              console.log("===================================");
              console.log("===========  approve  =============");
              console.log("===================================");
              sendNotifyToPartner(
                { ...oldData, ...event.params.data },
                "line-order-approve"
              );
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-status-has-approve"
              );
              break;
            case "cancel":
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-status-has-cancel"
              );
              break;
            case "complete":
              if (oldData.type == "package") {
                sendNotify(
                  { ...oldData, ...event.params.data },
                  "order-package-complete"
                );
              }
              if (oldData.type == "product") {
                sendNotify(
                  { ...oldData, ...event.params.data },
                  "order-product-complete"
                );
              }
              break;
          }
        }

        //partnerAcceptStatus
        if (
          oldData.partnerAcceptStatus != event.params.data.partnerAcceptStatus
        ) {
          switch (event.params.data.partnerAcceptStatus) {
            // case "pending":
            //   sendNotify(
            //     { ...oldData, ...event.params.data },
            //     "order-partner-has-pending"
            //   );
            //   break;
            case "accepted":
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-partner-has-accepted"
              );
              break;
            case "rejected":
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-partner-has-rejected"
              );
              break;
          }
        }

        //payment
        if (oldData.paymentStatus != event.params.data.paymentStatus) {
          switch (event.params.data.paymentStatus) {
            case "purchase":
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-payment-has-purchase"
              );
              break;
            case "cancel":
              sendNotify(
                { ...oldData, ...event.params.data },
                "order-payment-has-cancel"
              );
              break;
          }
        }
      // }
    } catch (error) {
      console.log("error-->", error);
    }
  },
  async afterCreate(event) {
    let id = event.result.id;
    let data = event.params.data;

    await formatOrder(id, data);
  },
  async afterUpdate(event) {
    let id = event.params.where.id;
    let data = event.params.data;

    await formatOrder(id, data);

    // if (JSON.stringify(Object.keys(data)) == JSON.stringify(['total', 'updatedAt']) == true) return

    // let total = 0
    // if (data.orderItems) {
    //   let ps = data.orderItems.map(async (orderItem) => {
    //     let _orderItem = await strapi.db.entityManager.findOne("order.order-item", {
    //       where: {
    //         id: orderItem.id
    //       }
    //     })

    //     total += _orderItem.total
    //   })

    //   await Promise.all(ps)

    //   await strapi.entityService.update("api::order.order", id, {
    //     data: {
    //       total
    //     }
    //   })
    // }
  },
};
