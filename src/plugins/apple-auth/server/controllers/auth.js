"use strict";
const { ApplicationError } = require("@strapi/utils").errors;
const appleSignin = require('apple-signin-auth');
const jwt = require("jsonwebtoken");
const _ = require('lodash');
const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const utils = require('@strapi/utils');
const { sanitize } = utils;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin("apple-auth")
      .service("myService")
      .getWelcomeMessage();
  },
  async callback(ctx) {
    const provider = "apple";
    const params = ctx.request.body;
    const query = ctx.query;

    if (!query.access_token) {
      throw new ApplicationError("Access Token not found");
    }

    let data = null;

    try {

      const data = await appleSignin.verifyIdToken(query.access_token);

      let email = _.toLower(data.email);
      if(!email){
        email = `${data.sub}@apple.com`
      }

      let firstNames = email.split("@")
      let firstName = firstNames[0].substring(0, 30)

      const profile = {
        email: email,
        firstName,
        lastName: `apple`,
        username: `apple_${data.sub}`,
        password: `${data.sub}@apple@passw0rd`,
      };

      let user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          email: email
        },
        populate: ["role"]
      });

      console.log(profile)

      if(!user){
        //create
        const advancedSettings = await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get();

        // Retrieve default role.
        const defaultRole = await strapi
          .query("plugin::users-permissions.role")
          .findOne({ where: { type: advancedSettings.default_role } });

        // Create the new user.
        const newUser = {
          ...profile,
          email, // overwrite with lowercased email
          role: defaultRole.id,
          confirmed: true,
        };

        user = await strapi
          .query("plugin::users-permissions.user")
          .create({ data: newUser });
      }else{
        //update
      }

      let _jwt = getService('jwt').issue({ id: user.id })
      let _user = await sanitizeUser(user, ctx);
      _user.role = user.role

      return ctx.send({
        jwt: _jwt,
        user: _user
      });

    } catch (err) {
      // Token is not verified
      ctx.body = err;
    }
  },
});
