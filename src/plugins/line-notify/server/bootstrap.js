'use strict';

const lineClient = require("./line-client");

module.exports = ({ strapi }) => {
  lineClient.init(strapi);
};
