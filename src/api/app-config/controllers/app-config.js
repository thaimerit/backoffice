'use strict';

/**
 *  app-config controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::app-config.app-config');

module.exports = {
  find: async (ctx, next) => {

    let data = await strapi.entityService.findMany('api::app-config.app-config', {
      populate: "bankAccounts.bank.icon,bankAccounts.image,popupPromotions.image,popupTutorials,popupHoroscopeBackground,popupPromotionBackground"
    })

    let config = await strapi.entityService.findMany('api::config.config', {
      populate: "bankAccounts.bank.image"
    })

    if (data.bankAccounts) {
      data.bankAccounts = data.bankAccounts.map(bankAccount => {

        delete bankAccount.bank.createdAt
        delete bankAccount.bank.updatedAt

        return bankAccount
      })
    }

    data.omisePublicKey = config.OMISE_PUBLIC_KEY

    delete data.createdAt
    delete data.updatedAt

    if(data.popupHoroscopeBackground){
      data.popupHoroscopeBackground = {
        url : data.popupHoroscopeBackground.url
      }
    }

    if(data.popupPromotionBackground){
      data.popupPromotionBackground = {
        url : data.popupPromotionBackground.url
      }
    }

    let appConfig = {
      data: {
        attributes: data
      }
    }

    ctx.body = appConfig
  }
}
