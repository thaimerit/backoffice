module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/home',
      handler: 'home.index',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/packages',
      handler: 'home.packages',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/places-has-packages',
      handler: 'home.placesHasPackages',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/packages/:sectionSlug',
      handler: 'home.packageSectionDetail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/products/interesting-packages',
      handler: 'home.packagesInteresting',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/products/interesting-products',
      handler: 'home.productsInteresting',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/horoscope',
      handler: 'home.horoscope',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/supplement',
      handler: 'home.supplement',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
