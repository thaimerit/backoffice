'use strict';

/**
 * order router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::order.order');

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/me/orders',
      handler: 'order.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/users/me/orders',
      handler: 'order.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/me/carts',
      handler: 'order.carts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/me/cart-count',
      handler: 'order.cartCount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/:id',
      handler: 'order.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders/:id/payment',
      handler: 'order.payment',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/:id/payment-complete',
      handler: 'order.paymentComplete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id',
      handler: 'order.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/orders/:id',
      handler: 'order.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
}
