"use strict";
const axios = require("axios").default;
const _ = require("lodash");
const dayjs = require("dayjs");

const dayOfWeeks = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัส",
  "ศุกร์",
  "เสาร์",
];

module.exports = ({ strapi }) => ({
  async index(ctx) {
    const ADJUST_API_TOKEN = process.env.ADJUST_API_TOKEN;
    const ADJUST_APP_TOKEN = process.env.ADJUST_APP_TOKEN;

    try {
      let [
        adjustData,
        guestUser,
        regisUser,
        orderList7Days,
        allOrders,
        adjustAndroid,
        adjustIos,
      ] = await Promise.allSettled([
        axios.get(
          `https://dash.adjust.com/control-center/reports-service/report`,
          {
            params: {
              cost_mode: `network`,
              app_token__in: ADJUST_APP_TOKEN,
              date_period: `2022-01-01:${dayjs()
                .add(3, "years")
                .endOf("year")
                .format("YYYY-MM-DD")}`,
              dimensions: `app,partner_name,campaign,campaign_id_network,campaign_network`,
              metrics: `installs,network_installs,network_cost,network_ecpi,uninstalls`,
            },
            headers: {
              Authorization: `Bearer ${ADJUST_API_TOKEN}`,
            },
          }
        ),
        strapi.entityService.findMany("plugin::fcm.fcm-token", {
          filters: {
            user: {
              username: "_GUEST",
            },
          },
        }),

        strapi.entityService.findMany("plugin::users-permissions.user", {
          // fields: ['username'],
          filters: {
            $not: {
              username: "_GUEST",
            },
          },
        }),
        strapi.entityService.findMany("api::order.order", {
          // fields: ['username'],
          filters: {
            createdAt: {
              $gt: dayjs().subtract(7, "days").startOf("days").toISOString(),
            },
          },
        }),
        strapi.entityService.findMany("api::order.order", {
          // fields: ['username'],
          // filters: {
          //   createdAt: { $gt: dayjs().subtract(7, 'days').startOf('days').toISOString() }
          // },
        }),
        axios.get(
          `https://dash.adjust.com/control-center/reports-service/report`,
          {
            params: {
              cost_mode: `network`,
              os_names: "android",
              app_token__in: ADJUST_APP_TOKEN,
              date_period: `2022-01-01:${dayjs()
                .add(3, "years")
                .endOf("year")
                .format("YYYY-MM-DD")}`,
              dimensions: `app,partner_name,campaign,campaign_id_network,campaign_network`,
              metrics: `installs,network_installs,network_cost,network_ecpi,uninstalls`,
            },
            headers: {
              Authorization: `Bearer ${ADJUST_API_TOKEN}`,
            },
          }
        ),
        axios.get(
          `https://dash.adjust.com/control-center/reports-service/report`,
          {
            params: {
              cost_mode: `network`,
              os_names: "ios",
              app_token__in: ADJUST_APP_TOKEN,
              date_period: `2022-01-01:${dayjs()
                .add(3, "years")
                .endOf("year")
                .format("YYYY-MM-DD")}`,
              dimensions: `app,partner_name,campaign,campaign_id_network,campaign_network`,
              metrics: `installs,network_installs,network_cost,network_ecpi,uninstalls`,
            },
            headers: {
              Authorization: `Bearer ${ADJUST_API_TOKEN}`,
            },
          }
        ),
      ]);

      if(adjustData.status == 'fulfilled'){
        adjustData = adjustData.value;
      }else{
        console.log(`error adjust`,adjustData.reason,adjustData.status);
        adjustData = null
      }

      if(guestUser.status == 'fulfilled'){
        guestUser = guestUser.value;

        console.log(guestUser);
      }else{
        console.log(`error guestUser`,guestUser.reason,guestUser.status);
        guestUser = null
      }

      if(regisUser.status == 'fulfilled'){
        regisUser = regisUser.value;
      }else{
        console.log(`error regisUser`,regisUser.reason,regisUser.status);
        regisUser = null
      }


      if(orderList7Days.status == 'fulfilled'){
        orderList7Days = orderList7Days.value;
      }else{
        console.log(`error orderList7Days`,orderList7Days.reason,orderList7Days.status);
        orderList7Days = null
      }

      if(allOrders.status == 'fulfilled'){
        allOrders = allOrders.value;
      }else{
        console.log(`error allOrders`,allOrders.reason,allOrders.status);
        allOrders = null
      }

      if(adjustAndroid.status == 'fulfilled'){
        adjustAndroid = adjustAndroid.value;
      }else{
        console.log(`error adjustAndroid`,adjustAndroid.reason,adjustAndroid.status);
        adjustAndroid = null
      }

      if(adjustIos.status == 'fulfilled'){
        adjustIos = adjustIos.value;
      }else{
        console.log(`error adjustIos`,adjustIos.reason,adjustIos.status);
        adjustIos = null
      }

//
//
//
//
//


      // console.log(adjustAndroid.data);
      // console.log(adjustIos.data);
      const adjustResp = _.get(adjustData, "data");
      console.log("adjustAndroid--->",adjustAndroid)
      const totals = {
        installs: _.get(adjustResp, "totals.installs"),
        uninstalls: _.get(adjustResp, "totals.uninstalls"),
        android_installs: _.get(adjustAndroid, "data.totals.installs") || 0,
        android_uninstalls: _.get(adjustAndroid, "data.totals.uninstalls") || 0,
        ios_installs: _.get(adjustIos, "data.totals.installs") || 0,
        ios_uninstalls: _.get(adjustIos, "data.totals.uninstalls") || 0,
      };

      // console.log(regisUser);

      const haveDateOfBirth = regisUser.filter(
        (item) => item.dateOfBirth != null
      );
      const haveNoDateOfBirth = regisUser.filter(
        (item) => item.dateOfBirth == null
      ).length;

      let default_day_of_weeks = {};

      for (const iterator of dayOfWeeks) {
        default_day_of_weeks[iterator] = 0;
      }
      const summary_day_of_week = haveDateOfBirth.reduce((acc, cur) => {
        const day_of_week = dayjs(cur.dateOfBirth).day();

        // if(acc.hasOwnProperty(dayOfWeeks[day_of_week])){
        acc[dayOfWeeks[day_of_week]] += 1;
        // }else{
        // acc[dayOfWeeks[day_of_week]] = 1
        // }

        return acc;
      }, default_day_of_weeks);

      const totalPurchase = await strapi.entityService.findMany(
        "api::order.order",
        {
          // fields: ['username'],
          filters: {
            paymentStatus: "purchase",
          },
        }
      );

      let { rows } = await strapi.db.connection.raw(
        `select sum(sum) as total from orders where payment_status='purchase';`
      );

      ctx.body = {
        ADJUST_API_TOKEN,
        ADJUST_APP_TOKEN,
        summary: {
          adjust: adjustResp ? { ...totals } : undefined,
          guestUser: guestUser.length,
          regisUser: regisUser.length,
          haveDateOfBirth: haveDateOfBirth.length,
          haveNoDateOfBirth,
          summary_day_of_week,
          orderList7Days,
          allOrders,
          totalPurchase,
          rows
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
});
