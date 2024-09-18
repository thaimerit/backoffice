"use strict";
const moment = require("moment");
const { getContentSection } = require("../../../util/content-section");
const { ZodiacSign } = require("../../../util/zodiacsigns");
const { ApplicationError } = require("@strapi/utils").errors;
/**
 * A set of functions called "actions" for `home`
 */

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  packagesInteresting: async (ctx, next) => {
    const { user } = ctx.state;

    let dayOfWeek = null;
    let dayOfWeekName = null;

    if (user) {
      if (user.dateOfBirth) {
        dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD")
          .format("dddd")
          .toLocaleLowerCase();
        dayOfWeekName = moment(user.dateOfBirth, "YYYY-MM-DD")
          .locale("th")
          .format("dddd");
      }
    }

    // const packages = await strapi.entityService.findMany('api::product.product', {
    //   filters: {
    //     type: {
    //       $eq: 'package',
    //     },
    //     dayOfWeeks: {
    //       name : [dayOfWeekName]
    //     },
    //     publishedAt: {
    //       $notNull: true
    //     },
    //   },
    //   populate: ["galleries", "coverImages", "coverImages.image", "categories", "dayOfWeeks"],
    // });
    ctx.query = {
      // 'filters[type]' : 'package',
      // 'filters[dayOfWeeks][name]' : dayOfWeekName,
      filters: {
        type: {
          $eq: "package",
        },
        // dayOfWeeks: {
        //   name: [dayOfWeekName]
        // }
      },
      populate: [
        "galleries",
        "coverImages",
        "coverImages.image",
        "categories",
        "dayOfWeeks",
      ],
    };
    let data = await strapi.controller("api::product.product").find(ctx);
    data.dayOfWeekName = dayOfWeekName;
    data.interesting = true;

    ctx.body = data;
  },
  productsInteresting: async (ctx, next) => {
    const { user } = ctx.state;

    let dayOfWeek = null;
    let dayOfWeekName = null;

    if (user) {
      if (user.dateOfBirth) {
        dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD")
          .format("dddd")
          .toLocaleLowerCase();
        dayOfWeekName = moment(user.dateOfBirth, "YYYY-MM-DD")
          .locale("th")
          .format("dddd");
      }
    }

    // const packages = await strapi.entityService.findMany('api::product.product', {
    //   filters: {
    //     type: {
    //       $eq: 'package',
    //     },
    //     dayOfWeeks: {
    //       name : [dayOfWeekName]
    //     },
    //     publishedAt: {
    //       $notNull: true
    //     },
    //   },
    //   populate: ["galleries", "coverImages", "coverImages.image", "categories", "dayOfWeeks"],
    // });
    ctx.query = {
      // 'filters[type]' : 'package',
      // 'filters[dayOfWeeks][name]' : dayOfWeekName,
      filters: {
        type: {
          $eq: "product",
        },
        // dayOfWeeks: {
        //   name: [dayOfWeekName]
        // }
      },
      populate: [
        "galleries",
        "coverImages",
        "coverImages.image",
        "categories",
        "dayOfWeeks",
      ],
    };
    let data = await strapi.controller("api::product.product").find(ctx);
    data.dayOfWeekName = dayOfWeekName;
    data.interesting = true;

    ctx.body = data;
  },
  horoscope: async (ctx, next) => {
    const { user } = ctx.state;

    let dayOfWeek = null;
    let dayOfWeekName = null;
    let zodiac = null;

    if (user) {
      if (user.dateOfBirth) {
        dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD")
          .format("dddd")
          .toLocaleLowerCase();
        dayOfWeekName = moment(user.dateOfBirth, "YYYY-MM-DD")
          .locale("th")
          .format("dddd");
        let zodiacName = new ZodiacSign(user.dateOfBirth, "en").sign;

        console.log({
          dayOfWeekName,
          zodiacName
        })

        zodiac = await strapi.db.query("api::zodiac.zodiac").findOne({
          where: {
            slug: zodiacName
          }
        })
      }
    }

    const horoscopes = await strapi.entityService.findMany(
      "api::horoscope.horoscope",
      {
        filters: {
          dayOfWeek: {
            name: [dayOfWeekName],
          },
          zodiac: zodiac.id,
          publishedAt: {
            $notNull: true,
          },
        },
        populate: ["dayOfWeek", "horoscopes"],
      }
    );

    if (horoscopes.length > 0) {
      let index = getRandomInt(1, horoscopes[0].horoscopes.length);

      let yourHoroscope = horoscopes[0].horoscopes[index - 1];

      yourHoroscope.zodiac = zodiac
      yourHoroscope.dayOfWeek = dayOfWeekName

      ctx.body = { data: yourHoroscope };
    } else {
      throw new ApplicationError("ไม่พบข้อมูล", 404);
    }
  },
  supplement: async (ctx, next) => {
    const { user } = ctx.state;

    let dayOfWeek = null;
    let dayOfWeekName = null;
    let zodiac = null;

    if (user) {
      if (user.dateOfBirth) {
        dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD")
          .format("dddd")
          .toLocaleLowerCase();
        dayOfWeekName = moment(user.dateOfBirth, "YYYY-MM-DD")
          .locale("th")
          .format("dddd");
        let zodiacName = new ZodiacSign(user.dateOfBirth, "en").sign;

        console.log({
          dayOfWeekName,
          zodiacName
        })

        zodiac = await strapi.db.query("api::zodiac.zodiac").findOne({
          where: {
            slug: zodiacName
          }
        })
      }
    }

    const horoscopes = await strapi.entityService.findMany(
      "api::birthday-recommendation.birthday-recommendation",
      {
        filters: {
          dayOfWeek: {
            name: [dayOfWeekName],
          },
          zodiac: zodiac.id,
          publishedAt: {
            $notNull: true,
          },
        },
        populate: ["dayOfWeek", "recommendations"],
      }
    );

    if (horoscopes.length > 0) {
      let index = getRandomInt(1, horoscopes[0].recommendations.length);

      let yourHoroscope = horoscopes[0].recommendations[index - 1];

      yourHoroscope.zodiac = zodiac
      yourHoroscope.dayOfWeek = dayOfWeekName

      ctx.body = { data: yourHoroscope };
    } else {
      throw new ApplicationError("ไม่พบข้อมูล", 404);
    }
  },
  index: async (ctx, next) => {
    // try {

    const { user } = ctx.state;

    let dayOfWeek = null;
    let dayOfWeekName = null;

    if (user) {
      if (user.dateOfBirth) {
        dayOfWeek = moment(user.dateOfBirth, "YYYY-MM-DD")
          .format("dddd")
          .toLocaleLowerCase();
        dayOfWeekName = moment(user.dateOfBirth, "YYYY-MM-DD")
          .locale("th")
          .format("dddd");
      }
    }

    const page = await strapi.db.query("api::page.page").findOne({
      where: {
        slug: "home",
        publishedAt: {
          $notNull: true,
        },
      },
      populate: ["contentSections.sacreds", "contentSections.tags"],
    });

    if (page.contentSections) {
      let ps = page.contentSections
        .filter((o) => o.active)
        .map(async (contentSections) => {
          let responseData = {
            name: contentSections.title,
            type: contentSections.contentType,
            slug: contentSections.slug,
            limit: contentSections.limit,
            totalLink: contentSections.totalLink,
            items: [],
          };
          let params = {
            ...contentSections.params,
            tags:
              contentSections?.tags?.length > 0 ? contentSections?.tags : null,
            limit: contentSections.limit,
          };

          if (!params.where) {
            params.where = {};
          }

          if (contentSections.sacreds.length > 0) {
            params.sacredTypes = contentSections.sacreds.map(o => o.id)
          }

          params.hasCoverImage = true;

          let result = null;
          if (contentSections.contentType) {
            result = await getContentSection(
              contentSections.contentType,
              params
            );
          }

          if (user && contentSections.slug == "recommend-birthday") {
            params.user = user;
            params.dayOfWeekName = dayOfWeekName;
            responseData.name = "แนะสำหรับคนเกิดวัน" + dayOfWeekName;
            result = await getContentSection(contentSections.contentType, params);
            responseData.type = contentSections.contentType;
          }

          responseData = {
            ...responseData,
            ...result,
          };

          return responseData;
        });

      page.contentSections = await Promise.all(ps);

      if (!user) {
        let index = page.contentSections.findIndex(
          (o) => o.slug == "recommend-birthday"
        );
        page.contentSections.splice(index, 1);
      }

      ctx.body = {
        data: page.contentSections,
      };

      return;

      //   const packages = await strapi.entityService.findMany(
      //     "api::product.product",
      //     {
      //       filters: {
      //         type: {
      //           $eq: "package",
      //         },
      //         dayOfWeeks: {
      //           name: [dayOfWeekName],
      //         },
      //         publishedAt: {
      //           $notNull: true,
      //         },
      //       },
      //       populate: [
      //         "galleries",
      //         "coverImages",
      //         "coverImages.image",
      //         "categories",
      //         "dayOfWeeks",
      //       ],
      //     }
      //   );

      // }

      // const packages = await strapi.entityService.findMany(
      //   "api::product.product",
      //   {
      //     filters: {
      //       type: {
      //         $eq: "package",
      //       },
      //       dayOfWeeks: {
      //         name: [dayOfWeekName],
      //       },
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: [
      //       "galleries",
      //       "coverImages",
      //       "coverImages.image",
      //       "categories",
      //       "dayOfWeeks",
      //     ],
      //   }
      // );

      // const recommendTops = await strapi.entityService.findMany(
      //   "api::place.place",
      //   {
      //     filters: {
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: ["galleries", "coverImages", "coverImages.image"],
      //   }
      // );

      // const recommendPlaces = await strapi.entityService.findMany(
      //   "api::place.place",
      //   {
      //     filters: {
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: ["galleries", "coverImages", "coverImages.image"],
      //   }
      // );

      // const holysticks = await strapi.entityService.findMany(
      //   "api::holystick.holystick",
      //   {
      //     filters: {
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: [
      //       "place",
      //       "place.galleries",
      //       "place.coverImages",
      //       "place.coverImages.image",
      //     ],
      //   }
      // );

      // const recommendMakeMeritPackages = await strapi.db
      //   .query("api::product.product")
      //   .findMany({
      //     where: {
      //       type: {
      //         $eq: "package",
      //       },
      //       categories: {
      //         id: {
      //           // $in: [3],
      //         },
      //       },
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: [
      //       "galleries",
      //       "coverImages",
      //       "coverImages.image",
      //       "categories",
      //     ],
      //   });

      // const recommendProducts = await strapi.db
      //   .query("api::product.product")
      //   .findMany({
      //     where: {
      //       type: {
      //         $eq: "product",
      //       },
      //       publishedAt: {
      //         $notNull: true,
      //       },
      //     },
      //     populate: [
      //       "galleries",
      //       "coverImages",
      //       "coverImages.image",
      //       "categories",
      //     ],
      //   });

      // ctx.body = {
      //   data: [
      //     {
      //       name: "",
      //       slug: "packages",
      //       type: "places",
      //       items: recommendTops.filter((o) => o.galleries),
      //     },
      //     ...(user && dayOfWeekName
      //       ? [
      //           {
      //             name: "แนะสำหรับคนเกิดวัน" + dayOfWeekName,
      //             slug: "recommend-birthday",
      //             type: "products",
      //             items: packages.filter((o) => o.galleries),
      //           },
      //         ]
      //       : []),
      //     {
      //       name: "สถานที่ศักดิ์สิทธิ์แนะนำ",
      //       slug: "recommend-places",
      //       type: "places",
      //       items: recommendPlaces.filter((o) => o.galleries),
      //     },
      //     {
      //       name: "แพคเกจทำบุญขอพรยอดนิยม",
      //       slug: "recommend-make-merit-packages",
      //       type: "products",
      //       items: recommendMakeMeritPackages.filter((o) => o.galleries),
      //     },
      //     {
      //       name: "เซียมซีวัดดัง",
      //       slug: "holystick",
      //       type: "holystics",
      //       items: holysticks,
      //     },
      //     {
      //       name: "ของที่ระลึกยอดนิยม",
      //       slug: "recommend-product",
      //       type: "products",
      //       items: recommendProducts.filter((o) => o.galleries),
      //     },
      //   ],
      // };
      // } catch (err) {
      //   ctx.body = err;
    }

    ctx.body = {
      data: [],
    };
  },
  packages: async (ctx, next) => {
    const { user } = ctx.state;

    const page = await strapi.db.query("api::page.page").findOne({
      where: {
        slug: "packages",
        publishedAt: {
          $notNull: true,
        },
      },
      populate: ["contentSections.tags"],
    });

    if (page.contentSections) {
      let ps = page.contentSections
        .filter((o) => o.active)
        .map(async (contentSections) => {
          let responseData = {
            name: contentSections.title,
            type: contentSections.contentType,
            slug: contentSections.slug,
            limit: contentSections.limit,
            totalLink: contentSections.totalLink,
            items: [],
          };
          let params = {
            ...contentSections.params,
            tags:
              contentSections?.tags?.length > 0 ? contentSections?.tags : null,
            limit: contentSections.limit,
          };

          if (!params.where) {
            params.where = {};
          }

          // params.hasCoverImage = true

          let result = null;
          if (contentSections.contentType) {
            result = await getContentSection(
              contentSections.contentType,
              params
            );
          }

          responseData = {
            ...responseData,
            ...result,
          };

          return responseData;
        });

      page.contentSections = await Promise.all(ps);

      ctx.body = {
        data: page.contentSections,
      };

      return;
    }

    ctx.body = {
      data: [],
    };
  },
  packageSectionDetail: async (ctx, next) => {
    const { user } = ctx.state;
    const { sectionSlug } = ctx.params;
    const pagination = ctx.query.pagination;

    const page = await strapi.db.query("api::page.page").findOne({
      where: {
        slug: "packages",
        publishedAt: {
          $notNull: true,
        },
      },
      populate: ["contentSections.tags"],
    });

    if (page.contentSections) {
      let ps = page.contentSections
        .filter((o) => o.slug == sectionSlug)
        .filter((o) => o.active)
        .map(async (contentSections) => {
          let responseData = {
            name: contentSections.title,
            type: contentSections.contentType,
            slug: contentSections.slug,
            limit: contentSections.limit,
            totalLink: contentSections.totalLink,
            items: [],
          };
          let params = {
            ...contentSections.params,
            tags:
              contentSections?.tags?.length > 0 ? contentSections?.tags : null,
          };

          if (!params.where) {
            params.where = {};
          }

          if (pagination) {
            if (pagination.page) {
              params.page = +pagination.page;
            }
            if (pagination.pageSize) {
              params.pageSize = +pagination.pageSize;
            }
          }

          // params.hasCoverImage = true

          let result = null;
          if (contentSections.contentType) {
            result = await getContentSection(
              contentSections.contentType,
              params
            );
          }

          responseData = {
            ...responseData,
            ...result,
          };

          return responseData;
        });

      page.contentSections = await Promise.all(ps);
    }

    if (page?.contentSections.length == 0) {
      throw new ApplicationError("ไม่พบข้อมูล", 404);
    }

    ctx.body = page?.contentSections ? page.contentSections[0] : null;
  },
  placesHasPackages: async (ctx, next) => {
    const pagination = ctx.query.pagination;
    let orderBy = {
      createdAt: "desc",
    };

    let populate = ["galleries", "coverImages", "coverImages.image", "province"];

    let filters = {
      products: {
        type: "package",
        id: {
          $notNull: true
        },
        publishedAt: {
          $notNull: true
        },
      },
      publishedAt: {
        $notNull: true
      },
    }

    let params = {}

    if (pagination) {
      if (pagination.page) {
        params.page = +pagination.page;
      }
      if (pagination.pageSize) {
        params.pageSize = +pagination.pageSize;
      }
    }

    let data = await strapi.entityService.findPage('api::place.place', {
      populate,
      filters,
      orderBy,
      page: params?.page,
      pageSize: params?.pageSize,
    });

    let results = data.results

    ctx.body = {
      data: results,
      meta: {
        pagination: data.pagination
      }
    }
  }
};
