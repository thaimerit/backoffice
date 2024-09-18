'use strict';

//patch 2022-08-31

const { prop, pick } = require('lodash/fp');
const { MANY_RELATIONS } = require('@strapi/utils').relations.constants;
const { setCreatorFields, pipeAsync } = require('@strapi/utils');

const { getService, pickWritableAttributes } = require('../utils');
const { validateBulkDeleteInput, validatePagination } = require('./validation');

module.exports = {
  async find(ctx) {
    const { userAbility } = ctx.state;
    let { model } = ctx.params;
    let { query } = ctx.request;

    if(model=="api::order.order"){
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "type": "package"
      })
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "type": "product"
      })
    }else
    if(model=="api::product.product"){
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "type": "product"
      })
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "type": "package"
      })
    }else
    if(model=="plugin::users-permissions.user"){
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "role": {
          "name": {
            "$eq": "Authenticated"
          }
        }
      })
    }else
    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
      if(!query.filters) query.filters ={ $and : []}
      query.filters.$and.push({
        "role": {
          "name": {
            "$eq": "LiffApp"
          }
        }
      })
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const permissionQuery = permissionChecker.buildReadQuery(query);

    const { results, pagination } = await entityManager.findWithRelationCountsPage(
      permissionQuery,
      model
    );

    const sanitizedResults = await Promise.all(
      results.map((result) => permissionChecker.sanitizeOutput(result))
    );

    ctx.body = {
      results: sanitizedResults,
      pagination,
    };
  },

  async findOne(ctx) {
    const { userAbility } = ctx.state;
    let { model, id } = ctx.params;

    if(model=="plugin::users-permissions.user"){
    }else
    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.read(entity)) {
      return ctx.forbidden();
    }

    ctx.body = await permissionChecker.sanitizeOutput(entity);
  },

  async create(ctx) {
    const { userAbility, user } = ctx.state;
    let { model } = ctx.params;
    const { body } = ctx.request;

    let contentType = null
    if(model=="api::product.product"){
      contentType = "product"
    }else
    if(model=="api::package.package"){
      contentType = "package"
      model = "api::product.product"
    }else
    if(model=="api::order.order"){
      contentType = "product"
    }else
    if(model=="api::product-order.product-order"){
      contentType = "package"
      model = "api::order.order"
    }

    const totalEntries = await strapi.query(model).count();

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.create()) {
      return ctx.forbidden();
    }

    const pickWritables = pickWritableAttributes({ model });
    const pickPermittedFields = permissionChecker.sanitizeCreateInput;
    const setCreator = setCreatorFields({ user });

    const sanitizeFn = pipeAsync(pickWritables, pickPermittedFields, setCreator);

    let sanitizedBody = await sanitizeFn(body);

    if(
      model=="api::product.product" ||
      model=="api::package.package" ||
      model=="api::order.order" ||
      model=="api::product-order.product-order"
    ){
      sanitizedBody.type = contentType
    }

    const entity = await entityManager.create(sanitizedBody, model);

    ctx.body = await permissionChecker.sanitizeOutput(entity);

    if (totalEntries === 0) {
      strapi.telemetry.send('didCreateFirstContentTypeEntry', { model });
    }
  },

  async update(ctx) {
    const { userAbility, user } = ctx.state;
    let { id, model } = ctx.params;
    const { body } = ctx.request;

    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.update()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.update(entity)) {
      return ctx.forbidden();
    }

    const pickWritables = pickWritableAttributes({ model });
    const pickPermittedFields = permissionChecker.sanitizeUpdateInput(entity);
    const setCreator = setCreatorFields({ user, isEdition: true });

    const sanitizeFn = pipeAsync(pickWritables, pickPermittedFields, setCreator);

    const sanitizedBody = await sanitizeFn(body);
    const updatedEntity = await entityManager.update(entity, sanitizedBody, model);

    ctx.body = await permissionChecker.sanitizeOutput(updatedEntity);
  },

  async delete(ctx) {
    const { userAbility } = ctx.state;
    let { id, model } = ctx.params;

    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.delete()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.delete(entity)) {
      return ctx.forbidden();
    }

    const result = await entityManager.delete(entity, model);

    ctx.body = await permissionChecker.sanitizeOutput(result);
  },

  async publish(ctx) {
    const { userAbility, user } = ctx.state;
    let { id, model } = ctx.params;

    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.publish()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.publish(entity)) {
      return ctx.forbidden();
    }

    const result = await entityManager.publish(
      entity,
      setCreatorFields({ user, isEdition: true })({}),
      model
    );

    ctx.body = await permissionChecker.sanitizeOutput(result);
  },

  async unpublish(ctx) {
    const { userAbility, user } = ctx.state;
    let { id, model } = ctx.params;

    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.unpublish()) {
      return ctx.forbidden();
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.unpublish(entity)) {
      return ctx.forbidden();
    }

    const result = await entityManager.unpublish(
      entity,
      setCreatorFields({ user, isEdition: true })({}),
      model
    );

    ctx.body = await permissionChecker.sanitizeOutput(result);
  },

  async bulkDelete(ctx) {
    const { userAbility } = ctx.state;
    let { model } = ctx.params;
    const { query, body } = ctx.request;
    const { ids } = body;

    if(model=="api::user-partner.user-partner"){
      model = "plugin::users-permissions.user"
    }else
    if(model=="api::package.package"){
      model = "api::product.product"
    }else
    if(model=="api::product-order.product-order"){
      model = "api::order.order"
    }

    await validateBulkDeleteInput(body);

    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.delete()) {
      return ctx.forbidden();
    }

    // TODO: fix
    const permissionQuery = permissionChecker.buildDeleteQuery(query);

    const idsWhereClause = { id: { $in: ids } };
    const params = {
      ...permissionQuery,
      filters: {
        $and: [idsWhereClause].concat(permissionQuery.filters || []),
      },
    };

    const { count } = await entityManager.deleteMany(params, model);

    ctx.body = { count };
  },

  async previewManyRelations(ctx) {
    const { userAbility } = ctx.state;
    const { model, id, targetField } = ctx.params;
    const { pageSize = 10, page = 1 } = ctx.request.query;

    validatePagination({ page, pageSize });

    const contentTypeService = getService('content-types');
    const entityManager = getService('entity-manager');
    const permissionChecker = getService('permission-checker').create({ userAbility, model });

    if (permissionChecker.cannot.read()) {
      return ctx.forbidden();
    }

    const modelDef = strapi.getModel(model);
    const assoc = modelDef.attributes[targetField];

    if (!assoc || !MANY_RELATIONS.includes(assoc.relation)) {
      return ctx.badRequest('Invalid target field');
    }

    const entity = await entityManager.findOneWithCreatorRoles(id, model);

    if (!entity) {
      return ctx.notFound();
    }

    if (permissionChecker.cannot.read(entity, targetField)) {
      return ctx.forbidden();
    }

    let relationList;
    // FIXME: load relations using query.load
    if (!assoc.inversedBy && !assoc.mappedBy) {
      const populatedEntity = await entityManager.findOne(id, model, [targetField]);
      const relationsListIds = populatedEntity[targetField].map(prop('id'));

      relationList = await entityManager.findPage(
        {
          page,
          pageSize,
          filters: {
            id: relationsListIds,
          },
        },
        assoc.target
      );
    } else {
      relationList = await entityManager.findPage(
        {
          page,
          pageSize,
          filters: {
            [assoc.inversedBy || assoc.mappedBy]: entity.id,
          },
        },
        assoc.target
      );
    }

    const config = await contentTypeService.findConfiguration({ uid: model });
    const mainField = prop(['metadatas', targetField, 'edit', 'mainField'], config);

    ctx.body = {
      pagination: relationList.pagination,
      results: relationList.results.map(pick(['id', mainField])),
    };
  },
};
