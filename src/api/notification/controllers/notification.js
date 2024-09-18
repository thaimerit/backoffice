"use strict";

const { stripHtml, substringText } = require("../../../util/filterHtmlUtil");

/**
 *  notification controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { ApplicationError, NotFoundError } = require("@strapi/utils").errors;
// module.exports = createCoreController('api::notification.notification');

module.exports = {
  find: async (ctx, next) => {
    const { user } = ctx.state;
    let data = {
      results: [],
      pagination: {},
    };

    let query = ctx.request.query;

    let pagination = {};
    if (query?.pagination) {
      pagination = query.pagination;
    }

    if (user) {
      data = await strapi.entityService.findPage(
        "api::notification.notification",
        {
          populate: [
            "order",
            "sendNotification.thumbnail",
            "sendNotification.product.coverImages.image",
          ],
          filters: {
            user: { id: user.id },
          },
          ...pagination,
          sort: { createdAt: "desc" },
        }
      );

      data.results = data.results.map((item) => {
        let thumbnail = item.sendNotification?.thumbnail;
        let type = item.type;
        let productObj = {};
        if (item.sendNotification?.product) {

          type = item.sendNotification?.product?.type;
          productObj = {
            [type]: {
              id: item.sendNotification?.product?.id,
            },
          };

          if (item.sendNotification?.product?.coverImages?.length > 0) {
            thumbnail = item.sendNotification?.product.coverImages[0].image;
          }
        }

        return {
          id: item.id,
          title: stripHtml(item.title),
          message: substringText(stripHtml(item.message)),
          order: item.order,
          thumbnail,
          // product: item.sendNotification?.product,
          read: item.read,
          type,
          ...productObj,
          createdAt: item.createdAt,
        };
      });
    } else {
      data = await strapi.entityService.findPage(
        "api::send-notification.send-notification",
        {
          populate: ["thumbnail", "product.coverImages.image"],
          filters: {},
          ...pagination,
          sort: { createdAt: "desc" },
        }
      );

      data.results = data.results.map((item) => {
        let thumbnail = item.thumbnail;

        if (item.product?.coverImages) {
          thumbnail = item.product.coverImages[0].image;
        }

        return {
          id: item.id,
          title: stripHtml(item.title),
          message: substringText(stripHtml(item.message)),
          order: null,
          thumbnail: item.thumbnail,
          read: false,
          type: "message",
          createdAt: item.createdAt,
        };
      });
    }

    ctx.body = {
      data: data.results,
      meta: {
        pagination: data.pagination,
      },
    };
  },
  findOne: async (ctx, next) => {
    const { user } = ctx.state;
    let data = null;

    if (user) {
      const items = await strapi.entityService.findMany(
        "api::notification.notification",
        {
          populate: [
            "order",
            "sendNotification.galleries",
            // "sendNotification.product.galleries",
          ],
          filters: {
            id: ctx.request.params.id,
            user: user.id,
          },
        }
      );

      if (items.length > 0) {
        data = items[0];
        data.galleries = data.sendNotification?.galleries;

        // if(data.sendNotification?.product?.galleries){
        //   data.galleries = data.sendNotification?.product?.galleries
        // }

        delete data.debug;
      }

      if (!data) {
        throw new NotFoundError();
      }
    } else {
      const items = await strapi.entityService.findMany(
        "api::send-notification.send-notification",
        {
          populate: ["galleries"],
          filters: {
            id: ctx.request.params.id,
          },
        }
      );

      if (items.length > 0) {
        data = items[0];
      }

      if (!data) {
        throw new NotFoundError();
      }
    }

    ctx.body = data;
  },
  unread: async (ctx, next) => {
    const { user } = ctx.state;
    let count = 0;
    if (user) {
      count = await strapi.entityService.count(
        "api::notification.notification",
        {
          filters: {
            user: user.id,
            read: false,
          },
        }
      );
    } else {
      count = await strapi.entityService.count(
        "api::send-notification.send-notification",
        {
          filters: {},
        }
      );
    }

    ctx.body = {
      count,
    };
  },
  read: async (ctx, next) => {
    const { user } = ctx.state;

    const items = await strapi.entityService.findMany(
      "api::notification.notification",
      {
        populate: ["order"],
        filters: {
          id: ctx.request.params.id,
          user: user.id,
        },
      }
    );

    let data = null;
    if (items.length > 0) {
      data = items[0];
    }

    if (!data) {
      throw new NotFoundError();
    }

    if (data.read == false) {
      await strapi.entityService.update(
        "api::notification.notification",
        ctx.request.params.id,
        {
          data: {
            read: true,
          },
        }
      );
    }

    ctx.body = data;
  },
  delete: async (ctx, next) => {
    const { user } = ctx.state;

    const items = await strapi.entityService.findMany(
      "api::notification.notification",
      {
        populate: ["order"],
        filters: {
          id: ctx.request.params.id,
          user: user.id,
        },
      }
    );

    let data = null;
    if (items.length > 0) {
      data = items[0];
    }

    if (!data) {
      throw new NotFoundError();
    }

    await strapi.entityService.delete(
      "api::notification.notification",
      ctx.request.params.id
    );

    ctx.body = data;
  },
  readAll: async (ctx, next) => {
    const { user } = ctx.state;

    if (user) {
      let notifications = await strapi.db
        .query("api::notification.notification")
        .findMany({
          where: {
            user: { id: user.id },
            read: false,
          },
        });

      let notificationId = notifications.map((o) => o.id);

      let result = await strapi.db
        .query("api::notification.notification")
        .updateMany({
          where: {
            id: { $in: notificationId },
          },
          data: {
            read: true,
          },
        });
    }

    ctx.body = true;
  },
  deleteAll: async (ctx, next) => {
    const { user } = ctx.state;

    let notifications = await strapi.db
      .query("api::notification.notification")
      .findMany({
        where: {
          user: { id: user.id },
        },
      });

    let notificationId = notifications.map((o) => o.id);

    let result = await strapi.db
      .query("api::notification.notification")
      .deleteMany({
        where: {
          id: { $in: notificationId },
        },
      });

    ctx.body = result;
  },
};
