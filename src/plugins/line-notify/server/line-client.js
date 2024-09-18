const { Client, Message } = require("@line/bot-sdk");

let lineClient = null;

module.exports = {
  send: async (userIds, message) => {
    return await lineClient.multicast(userIds, message);
  },
  init: async (strapi) => {
    const lineConfig = await strapi.db
      .query("plugin::line-notify.line-notify-config")
      .findOne();

    let config = {
      channelAccessToken: lineConfig.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: lineConfig.LINE_CHANNEL_SECRET,
    };

    console.log("LINE Config", { config });

    lineClient = new Client(config);
  },
};
