'use strict';

//patch 2022-08-31

const { has, assoc, mapValues, prop } = require('lodash/fp');
const { getService } = require('../utils');
const { createModelConfigurationSchema, validateKind } = require('./validation');

const hasEditMainField = has('edit.mainField');
const getEditMainField = prop('edit.mainField');
const assocListMainField = assoc('list.mainField');

const assocMainField = (metadata) =>
  hasEditMainField(metadata) ? assocListMainField(getEditMainField(metadata), metadata) : metadata;

module.exports = {
  async findContentTypes(ctx) {
    const { kind } = ctx.query;

    try {
      await validateKind(kind);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    const contentTypes = getService('content-types').findContentTypesByKind(kind);
    const { toDto } = getService('data-mapper');
    let data = contentTypes.map(toDto)

    let indexUser = data.findIndex(o=>o.uid == "plugin::users-permissions.user")
    let indexPartner = data.findIndex(o=>o.uid == "api::user-partner.user-partner")
    if(indexPartner != -1 && indexUser != -1){
      data[indexPartner] = {...data[indexUser], info: data[indexPartner].info, uid: "api::user-partner.user-partner"}
    }

    ctx.body = { data };
  },

  async findContentTypesSettings(ctx) {
    const { findAllContentTypes, findConfiguration } = getService('content-types');

    const contentTypes = await findAllContentTypes();
    const configurations = await Promise.all(
      contentTypes.map(async (contentType) => {
        const { uid, settings } = await findConfiguration(contentType);
        return { uid, settings };
      })
    );

    ctx.body = {
      data: configurations,
    };
  },

  async findContentTypeConfiguration(ctx) {
    let { uid } = ctx.params;

    const contentTypeService = getService('content-types');

    let contentType = await contentTypeService.findContentType(uid);

    if (!contentType) {
      return ctx.notFound('contentType.notFound');
    }

    let configuration = await contentTypeService.findConfiguration(contentType);


    // if(uid=="api::user-partner.user-partner"){
    //   let contentTypePartner = await contentTypeService.findContentType("plugin::users-permissions.user");
    //   let configurationPartner = await contentTypeService.findConfiguration(contentTypePartner);

    //   configuration.layouts = configurationPartner.layouts
    //   configuration.metadatas = configurationPartner.metadatas
    //   configuration.settings = configurationPartner.settings
    // }

    const confWithUpdatedMetadata = {
      ...configuration,
      metadatas: mapValues(assocMainField, configuration.metadatas),
    };

    const components = await contentTypeService.findComponentsConfigurations(contentType);

    ctx.body = {
      data: {
        contentType: confWithUpdatedMetadata,
        components,
      },
    };
  },

  async updateContentTypeConfiguration(ctx) {
    const { userAbility } = ctx.state;
    const { uid } = ctx.params;
    const { body } = ctx.request;

    const contentTypeService = getService('content-types');
    const metricsService = getService('metrics');

    const contentType = await contentTypeService.findContentType(uid);

    if (!contentType) {
      return ctx.notFound('contentType.notFound');
    }

    if (!getService('permission').canConfigureContentType({ userAbility, contentType })) {
      return ctx.forbidden();
    }

    let input;
    try {
      input = await createModelConfigurationSchema(contentType).validate(body, {
        abortEarly: false,
        stripUnknown: true,
        strict: true,
      });
    } catch (error) {
      return ctx.badRequest(null, {
        name: 'validationError',
        errors: error.errors,
      });
    }

    const newConfiguration = await contentTypeService.updateConfiguration(contentType, input);

    await metricsService.sendDidConfigureListView(contentType, newConfiguration);

    const confWithUpdatedMetadata = {
      ...newConfiguration,
      metadatas: mapValues(assocMainField, newConfiguration.metadatas),
    };

    const components = await contentTypeService.findComponentsConfigurations(contentType);

    ctx.body = {
      data: {
        contentType: confWithUpdatedMetadata,
        components,
      },
    };
  },
};
