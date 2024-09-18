'use strict';

const lineClient = require('../../line-client');

module.exports = {
    schema: require('./schema.json'),
    lifecycles: {
        afterCreate(event) {
        },
        afterUpdate(event) {
            lineClient.init(strapi);
        }
    },
};
