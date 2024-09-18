'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter("api::holystick.holystick");

const customRouter = require('../../../util/custom-router');

const myExtraRoutes = [
  {
    method: "GET",
    path: "/holystick/:id/prediction",
    handler: "holystick.prediction",
  }
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
