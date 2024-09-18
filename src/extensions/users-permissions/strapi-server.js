// src/extensions/users-permissions/strapi-server.js
// this route is only allowed for authenticated users
const _ = require('lodash');
const utils = require('@strapi/utils');
const { sanitize } = utils;
const { ApplicationError, ValidationError, NotFoundError } = utils.errors;
const { validateUpdateUserBody } = require("./validation/user");
const getService = name => {
  return strapi.plugin('users-permissions').service(name);
};
const sanitizeOutput = (user, ctx) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(user, schema, { auth });
};

module.exports = (plugin) => {

  /*******************************  CUSTOM CONTROLERS  ********************************/
  plugin.controllers.user.updateProfile = async (ctx) => {

    // try {
    const advancedConfigs = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();

    const { id } = ctx.state.user;
    const { email, username, password } = ctx.request.body.data;

    const user = await getService('user').fetch(id);
    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    await validateUpdateUserBody(ctx.request.body.data);

    if (user.provider === 'local' && _.has(ctx.request.body.data, 'password') && !password) {
      throw new ValidationError('password.notNull');
    }

    if (_.has(ctx.request.body.data, 'username')) {
      const userWithSameUsername = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { username } });

      if (userWithSameUsername && userWithSameUsername.id != id) {
        throw new ApplicationError('Username already taken');
      }
    }

    if (_.has(ctx.request.body.data, 'password')) {
      if (ctx.request.body.data.password != ctx.request.body.data.passwordConfirmation) {
        throw new ApplicationError('Password not match');
      }

      const user = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { id } });

      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
        ctx.request.body.data.oldPassword,
        user.password,
      );

      if(!validPassword){
        throw new ApplicationError('Password invalid');
      }
    }

    if (_.has(ctx.request.body.data, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email.toLowerCase() } });

      if (userWithSameEmail && userWithSameEmail.id != id) {
        throw new ApplicationError('Email already taken');
      }
      ctx.request.body.data.email = ctx.request.body.data.email.toLowerCase();
    }

    let updateData = {
      ...ctx.request.body.data,
    };

    const data = await getService('user').edit(user.id, updateData);
    const sanitizedData = await sanitizeOutput(data, ctx);

    ctx.send(sanitizedData);

  }

  /*******************************  CUSTOM ROUTES  ********************************/
  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/users/updateProfile",
      handler: "user.updateProfile",
      config: {
        prefix: "",
        policies: []
      }
    }
  )

  return plugin;
};
