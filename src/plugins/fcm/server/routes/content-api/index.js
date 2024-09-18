'use strict';

const fcmNotification = require('./fcm-notification');

module.exports = {
  type: 'content-api',
  routes: [...fcmNotification],
};
