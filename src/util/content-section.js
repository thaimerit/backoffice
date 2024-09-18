module.exports = {
  async getContentSection(contentType = "", params = {}) {
    let items = [];
    let pagination = {};
    let total = 0;
    let populate = null;
    let limit = 10;
    let orderBy = {
      createdAt: "desc",
    };
    let where = {
      publishedAt: {
        $notNull: true,
      },
    };

    if (params.where) {
      where = {
        ...where,
        ...params.where,
      };
    }

    if (params.filters) {
      where = {
        ...where,
        ...params.filters,
      };
    }

    if (params.populate) {
      populate = params.populate;
    }

    if (params.limit) {
      limit = +params.limit;
    }

    if (params.orderBy) {
      orderBy = params.orderBy;
    }

    switch (contentType) {
      case "places":
        if (!populate)
          populate = ["galleries", "coverImages", "coverImages.image", "province"];

        if (params.dayOfWeekName) {
          populate = [...populate, "dayOfWeeks"];
          where = {
            ...where,
            dayOfWeeks: {
              name: {
                $in: [params.dayOfWeekName],
              },
            },
          };
        }

        if (params.sacredTypes) {
          populate = [...populate, "sacredTypes"];
          where = {
            ...where,
            sacredTypes:{
              id: {
                $in: params.sacredTypes
              }
            }
          };
        }

        if (params.tags) {
          populate = [...populate, "tags"];

          let filterTags = {
            tags: {
              name: params.tags.map((o) => o.name),
            },
          };

          where = {
            ...where,
            ...filterTags,
          };
        }

        if (params.hasCoverImage) {
          where = {
            ...where,
            coverImages: {
              type: {
                $notNull: true,
              },
            },
          };
        }

        items = await strapi.db.query("api::place.place").findMany({
          where,
          populate,
          limit,
          orderBy,
        });
        total = await strapi.db.query("api::place.place").count({
          where,
        });

        break;
      case "packages":
        where = {
          ...where,
          type: {
            $eq: "package",
          },
          place: {
            id: {
              $notNull: true,
            },
          },
        };

        if (params.hasCoverImage) {
          where = {
            ...where,
            coverImages: {
              type: {
                $notNull: true,
              },
            },
          };
        }

        if (!populate)
          populate = ["galleries", "coverImages", "coverImages.image"];

        if (params.dayOfWeekName) {
          populate = [...populate, "dayOfWeeks"];
          where = {
            ...where,
            dayOfWeeks: {
              name: {
                $in: [params.dayOfWeekName],
              },
            },
          };
        }

        if (params.sacredTypes) {
          populate = [...populate, "sacredTypes"];
          where = {
            ...where,
            sacredTypes:{
              id: {
                $in: params.sacredTypes
              }
            }
          };
        }

        if (params.tags) {
          populate = [...populate, "tags"];

          let filterTags = {
            tags: {
              name: params.tags.map((o) => o.name),
            },
          };

          where = {
            ...where,
            ...filterTags,
          };
        }

        if (params?.page) {
          let paginate = await strapi.db
            .query("api::product.product")
            .findPage({
              where,
              populate,
              limit,
              orderBy,
              page: params?.page,
              pageSize: params?.pageSize,
            });
          items = paginate.results;
          total = paginate.pagination.total;
          pagination = paginate.pagination;
          limit = undefined;
        } else {
          items = await strapi.db.query("api::product.product").findMany({
            where,
            populate,
            limit,
            orderBy,
          });
        }
        total = await strapi.db.query("api::product.product").count({
          where,
        });

        break;
      case "products":
        where = {
          ...where,
          type: {
            $eq: "product",
          },
        };

        if (params.hasCoverImage) {
          where = {
            ...where,
            coverImages: {
              type: {
                $notNull: true,
              },
            },
          };
        }

        if (!populate)
          populate = ["galleries", "coverImages", "coverImages.image"];

        if (params.dayOfWeekName) {
          populate = [...populate, "dayOfWeeks"];
          where = {
            ...where,
            dayOfWeeks: {
              name: {
                $in: [params.dayOfWeekName],
              },
            },
          };
        }

        if (params.sacredTypes) {
          populate = [...populate, "sacredTypes"];
          where = {
            ...where,
            sacredTypes:{
              id: {
                $in: params.sacredTypes
              }
            }
          };
        }

        if (params.tags) {
          populate = [...populate, "tags"];

          let filterTags = {
            tags: {
              name: params.tags.map((o) => o.name),
            },
          };

          where = {
            ...where,
            ...filterTags,
          };
        }

        if (params?.page) {
          let paginate = await strapi.db
            .query("api::product.product")
            .findPage({
              where,
              populate,
              limit,
              orderBy,
              page: params?.page,
              pageSize: params?.pageSize,
            });
          items = paginate.results;
          total = paginate.pagination.total;
          pagination = paginate.pagination;
          limit = undefined;
        } else {
          items = await strapi.db.query("api::product.product").findMany({
            where,
            populate,
            limit,
            orderBy,
          });
          total = await strapi.db.query("api::product.product").count({
            where,
          });
        }

        break;
      case "holysticks":
        where = {
          ...where,
          place: {
            id: {
              $notNull: true,
            },
          },
        };

        if (params.hasCoverImage) {
          where = {
            ...where,
            place: {
              coverImages: {
                type: {
                  $notNull: true,
                },
              },
            },
          };
        }

        if (!populate)
          populate = [
            "place",
            "place.galleries",
            "place.coverImages",
            "place.coverImages.image",
          ];

        items = await strapi.db.query("api::holystick.holystick").findMany({
          where,
          populate,
          limit,
          orderBy,
        });
        total = await strapi.db.query("api::holystick.holystick").count({
          where,
        });

        break;

      default:
        break;
    }

    return {
      items,
      pagination: {
        total,
        limit,
        orderBy,
        dayOfWeekName: params.dayOfWeekName,
        ...pagination,
      },
    };
  },
};
