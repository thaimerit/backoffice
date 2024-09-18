const moment = require('moment');
var cron = require('node-cron');

let strapi = null
let cronItems = []

async function init(_strapi) {
  strapi = _strapi
  createCron()
}
async function createCron() {

  cronItems.forEach((o, i) => {
    console.log("CRON-STOP::" + o.id)
    o.cron.stop()
  })

  cronItems = []

  let items = await strapi.entityService.findMany('api::send-notification.send-notification', {
    filters: {
      // $and: [{
      //   scheduleDate: {
      //     $notNull: true
      //   },
      //   scheduleDate: {
      //     $gte: new Date
      //   },
      //   scheduleRepeat: "ONETIME",
      // }],
      // scheduleDate: {
      //   $notNull: true
      // },
      $or: [
        {
          $and: [{
            // scheduleDate: {
            //   $gte: new Date
            // },
            scheduleRepeat: "ONETIME",
          }]
        },
        {
          $and: [{
            scheduleDate: {
              $notNull: true
            },
            scheduleRepeat: {
              $ne: "ONETIME"
            },
          }]
        }
      ],
      status: "ACTIVE"
    },
  })

  if (items) {
    items = items.filter(item => {
      if (item.scheduleRepeat == 'ONETIME') {
        if (item.sentDate == null) {
          return true
        }
      } else {
        return true
      }
      return false
    });
    console.log("send.items", items)
    items = items.map(async (item) => {
      let scheduleDate = item.scheduleDate ? moment(item.scheduleDate) : moment().add(5, "second")
      let second = scheduleDate.second()
      let minute = scheduleDate.minute()
      let hour = scheduleDate.hour()
      let day = scheduleDate.date()
      let month = scheduleDate.month() + 1
      let week = scheduleDate.weekday()

      let cron = `${second} ${minute} ${hour} ${day} ${month} *`
      let nextDate = scheduleDate

      if (item.scheduleRepeat == 'EVERY_DAY') {
        cron = `${second} ${minute} ${hour} * * *`
        nextDate = moment()
        nextDate.minute(minute)
        nextDate.hour(hour)
        if (nextDate < moment()) {
          nextDate.add(1, "day")
        }
      } else
        if (item.scheduleRepeat == 'EVERY_WEEK') {
          cron = `${second} ${minute} ${hour} * * ${week}`
          nextDate = moment()
          nextDate.minute(minute)
          nextDate.hour(hour)
          nextDate.date(day)
          nextDate.weekday(week)
          if (nextDate < moment()) {
            nextDate.add(1, "week")
          }
        } else
          if (item.scheduleRepeat == 'EVERY_MONTH') {
            cron = `${second} ${minute} ${hour} ${day} * *`
            nextDate = moment()
            nextDate.minute(minute)
            nextDate.hour(hour)
            nextDate.date(day)
            if (nextDate < moment()) {
              nextDate.add(1, "month")
            }
          }

      item.cron = cron
      item.scheduleSendingDate = nextDate
      // await strapi.service('api::send-notification.send').updateSendingDate(item.id, { scheduleSendingDate: nextDate.toDate() })
      return item
    });
  }

  items = await Promise.all(items)

  items.forEach(item => {
    console.log('CRON-CREATE::' + item.id + " | " + item.cron);
    const cronItem = cron.schedule(item.cron, () => {
      console.log('CRON-START::' + item.id);
      strapi.service('api::send-notification.send').send(item.id, { cron: true })
    });
    if (!cronItems.find(o => o.id == item.id)) {
      cronItems.push({
        id: item.id,
        cron: cronItem
      })
    }

  })

  console.log("CRON-ALL::" + cronItems.length)
}


module.exports = {
  init,
  createCron
}
