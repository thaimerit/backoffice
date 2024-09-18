'use strict';

const fcmNotification = require('./fcm-notification');

module.exports = {
  type: 'admin',
  routes: [...fcmNotification],
};
