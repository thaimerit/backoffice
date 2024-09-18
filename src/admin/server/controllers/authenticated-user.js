'use strict';

//patch 2022-08-31

const { validateProfileUpdateInput } = require('../validation/user');
const { getService } = require('../utils');

module.exports = {
  async getMe(ctx) {
    const userInfo = getService('user').sanitizeUser(ctx.state.user);

    ctx.body = {
      data: userInfo,
    };
  },

  async updateMe(ctx) {
    const input = ctx.request.body;

    await validateProfileUpdateInput(input);

    const userService = getService('user');
    const authServer = getService('auth');

    const { currentPassword, ...userInfo } = input;

    if (currentPassword && userInfo.password) {
      const isValid = await authServer.validatePassword(currentPassword, ctx.state.user.password);

      if (!isValid) {
        return ctx.badRequest('ValidationError', {
          currentPassword: ['Invalid credentials'],
        });
      }
    }

    const updatedUser = await userService.updateById(ctx.state.user.id, userInfo);

    ctx.body = {
      data: userService.sanitizeUser(updatedUser),
    };
  },

  async getOwnPermissions(ctx) {
    const { findUserPermissions, sanitizePermission } = getService('permission');
    const { user } = ctx.state;

    const userPermissions = await findUserPermissions(user);
    let data = userPermissions.map(sanitizePermission)

    let index = data.findIndex(o=>o.subject == "api::user-partner.user-partner" && o.action == "plugin::content-manager.explorer.create")
    if(index!=-1){
      data.splice(index, 1)
    }

    ctx.body = {
      data
    };
  },
};
