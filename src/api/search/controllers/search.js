'use strict';

const { trim, isEmpty } = require("lodash");
const { ApplicationError } = require("@strapi/utils").errors;

/**
 * A set of functions called "actions" for `search`
 */

async function getFilterableForProduct() {
  let category = await strapi.entityService.findMany('api::category.category')

  return {
    price: {
      slug: "price",
      type: "sort",
      name: "ราคา",
      items: [
        {
          "text": "ราคา มาก ไป น้อย",
          "value": "price:desc"
        },
        {
          "text": "ราคา น้อย ไป มาก",
          "value": "price:asc"
        }
      ]
    },
    category: {
      slug: "category",
      type: "filters",
      name: "ประเภทแพ็จเกจ",
      items: category.map(o => ({ text: o.name, value: o.name }))
    },

  }

}

function getCategoryFilter(category) {
  if (category) {
    if (Array.isArray(category)) {
      return {
        categories: {
          slug: {
            $in: category
          }
        }
      }
    }

    return {
      categories: {
        slug: category
      }
    }
  }

  return {}
}

module.exports = {
  find: async (ctx, next) => {

    let sectionAllow = [
      'places',
      'packages',
      'holysticks',
      'products',
    ]

    let keyword = ctx.query.keyword
    let sacredType = ctx.query.sacredType
    let section = ctx.params.section || ctx.query.section
    let sort = ctx.query.sort
    let category = ctx.query.category
    let limit = null
    let page = null
    let pageSize = null
    let sortFilter = {}
    let categoryFilter = {}
    let filterable = {}

    if (isEmpty(section)) {
      section = "all"
    } else {
      if (sectionAllow.indexOf(section) == -1) {
        throw new ApplicationError("sectionSlug ไม่ถูกต้อง")
      }
    }

    // if (isEmpty(keyword)) {
    //   throw new ApplicationError("กรุณาใส่ keyword")
    // }

    if (sort) {
      let [sortField, sortDirection] = sort.split(":")
      sortFilter = {
        orderBy: {
          [sortField]: sortDirection
        }
      }
    }

    let keywordText = ""

    let places = { results: [] }
    let packages = { results: [] }
    let holysticks = { results: [] }
    let products = { results: [] }

    let searchTotal = 0
    let placeTotal = 0
    let packagesTotal = 0
    let holysticksTotal = 0
    let productsTotal = 0

    let findEngine = null

    if (section == "all") {
      limit = 5
      findEngine = 'findMany'
    } else {
      findEngine = 'findPage'
      page = ctx.query.page
      pageSize = ctx.query.pageSize
    }

    // if (!isEmpty(keyword)) {
    if (!isEmpty(keyword)) {
      keywordText += ` คำค้นหา "${keyword}"`
    }
    if (!isEmpty(sacredType)) {
      if (!isEmpty(keyword)) {
        keywordText += ` และ`
      }
      keywordText += ` เกี่ยวกับ "${sacredType}"`
    }

    if (section == "all" || section == "places") {
      let filters = {
        publishedAt: {
          $notNull: true
        },
      }

      if (!isEmpty(keyword)) {
        filters.$or = [
          {
            fullname: {
              $contains: keyword
            }
          },
          {
            highlightName: {
              $contains: keyword
            }
          },
        ]
      }
      if (!isEmpty(sacredType)) {
        filters.sacredTypes = {
          name: {
            $in: [sacredType]
          }
        }
      }

      places = await strapi.entityService[findEngine]('api::place.place', {
        filters,
        populate: ["galleries", "coverImages", "coverImages.image", "province"],
        limit,
        page,
        pageSize
      });
      placeTotal = await strapi.entityService.count('api::place.place', {
        filters
      });
      searchTotal += placeTotal
    }

    if (section == "all" || section == "packages") {

      filterable = await getFilterableForProduct()

      categoryFilter = getCategoryFilter(category)

      let where = {
        $or: [
          {
            $and: [
              {
                type: "package",
                place: {
                  id: {
                    $notNull: true
                  }
                }
              }
            ]
          },
          {
            $and: [
              {
                type: "product",
              }
            ]
          }
        ],
        type: {
          $eq: 'package',
        },
        publishedAt: {
          $notNull: true
        },
        ...categoryFilter
      }

      if (!isEmpty(keyword)) {
        where.fullname = {
          $contains: keyword
        }
      }
      if (!isEmpty(sacredType)) {
        where.sacredTypes = {
          name: {
            $in: [sacredType]
          }
        }
      }

      packages = await strapi.db.query('api::product.product')[findEngine]({
        where,
        populate: ["galleries", "coverImages", "coverImages.image", "categories"],
        limit,
        page,
        pageSize,
        ...sortFilter
      });
      packagesTotal = await strapi.db.query('api::product.product').count({
        where
      });
      searchTotal += packagesTotal
    }

    if (section == "all" || section == "holysticks") {
      let filters = {
        publishedAt: {
          $notNull: true
        },
      }

      if (!isEmpty(keyword)) {
        filters.$or = [
          {
            name: {
              $contains: keyword
            },
          },
          {
            place: {
              fullname: {
                $contains: keyword
              },
            }
          },
          {
            place: {
              highlightName: {
                $contains: keyword
              },
            }
          }
        ]
      }
      if (!isEmpty(sacredType)) {
        filters.place = {
          sacredTypes: {
            name: {
              $in: [sacredType]
            }
          }
        }
      }

      holysticks = await strapi.entityService[findEngine]('api::holystick.holystick', {
        filters,
        populate: ["place", "place.galleries", "place.coverImages", "place.coverImages.image"],
        limit,
        page,
        pageSize
      });
      holysticksTotal = await strapi.entityService.count('api::holystick.holystick', {
        filters
      });
      searchTotal += holysticksTotal
    }

    if (section == "all" || section == "products") {

      filterable = await getFilterableForProduct()

      categoryFilter = getCategoryFilter(category)

      let where = {
        type: {
          $eq: 'product',
        },
        publishedAt: {
          $notNull: true
        },
        ...categoryFilter
      }

      if (!isEmpty(keyword)) {
        where.fullname = {
          $contains: keyword
        }
      }
      if (!isEmpty(sacredType)) {
        where.sacredTypes = {
          name: {
            $in: [sacredType]
          }
        }
      }

      products = await strapi.db.query('api::product.product')[findEngine]({
        where,
        populate: ["galleries", "coverImages", "coverImages.image", "categories"],
        limit,
        page,
        pageSize,
        ...sortFilter
      });
      productsTotal = await strapi.db.query('api::product.product').count({
        where
      });
      searchTotal += productsTotal
    }
    // }

    let sections = []

    if (section == "all" || section == "places") {
      let data = {
        slug: "places",
        name: "สถานที่ศักดิ์",
        text: `ผลการค้นหา สถานที่ศักดิ์${keywordText}`,
        contentType: "places",
        total: placeTotal
      }

      if (section == "all") {
        data.results = places
        sections.push(data)
      } else {
        data = { ...data, ...places }
        sections = data
      }
    }

    if (section == "all" || section == "packages") {
      let data = {
        slug: "packages",
        name: "ขอพร แก้บน",
        text: `ผลการค้นหา ขอพร แก้บน${keywordText}`,
        contentType: "packages",
        type: "package",
        total: packagesTotal
      }

      if (section == "all") {
        data.results = packages
        sections.push(data)
      } else {
        data = { ...data, ...packages }
        sections = data
      }
    }

    if (section == "all" || section == "holysticks") {
      let data = {
        slug: "holysticks",
        name: "เสี่ยงเซียมซีออนไลน์",
        text: `ผลการค้นหา เสี่ยงเซียมซีออนไลน์${keywordText}`,
        contentType: "holysticks",
        total: holysticksTotal
      }

      if (section == "all") {
        data.results = holysticks
        sections.push(data)
      } else {
        data = { ...data, ...holysticks }
        sections = data
      }
    }

    if (section == "all" || section == "products") {
      let data = {
        slug: "products",
        name: "ของที่ระลึกยอดนิยม",
        text: `ผลการค้นหา ของที่ระลึกยอดนิยม${keywordText}`,
        contentType: "products",
        type: "product",
        total: productsTotal
      }

      if (section == "all") {
        data.results = products
        sections.push(data)
      } else {
        data = { ...data, ...products }
        sections = data
      }
    }

    let responseData = {
      keyword,
      total: searchTotal,
      ...sortFilter
    }

    if (section == "all") {
      responseData.sections = sections
    } else {
      responseData = { ...responseData, filterable, ...sections }
    }

    ctx.body = responseData;

  }
};
