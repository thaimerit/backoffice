module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/liff/auth',
     handler: 'liff.auth',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'GET',
      path: '/liff/profile',
      handler: 'liff.profile',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/pending-orders',
      handler: 'liff.findNotAcceptedOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/complete-orders',
      handler: 'liff.findCompleteOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/orders',
      handler: 'liff.findOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/summary',
      handler: 'liff.findSummary',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/orders/:id',
      handler: 'liff.findOneOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/liff/orders/:id/accept',
      handler: 'liff.acceptOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/liff/orders/:id/complete',
      handler: 'liff.completeOrders',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/liff/orders/:id/evidence-of-actions',
      handler: 'liff.evidenceOfActions_Upload',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/liff/orders/:id/evidence-of-actions/:photoId',
      handler: 'liff.evidenceOfActions_Delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liff/orders/:id/evidence-of-actions',
      handler: 'liff.evidenceOfActions_Get',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //  method: 'POST',
    //  path: '/liff/auth/callback',
    //  handler: 'liff.authCallback',
    //  config: {
    //    policies: [],
    //    middlewares: [],
    //  },
    // },
    // {
    //   method: 'GET',
    //   path: '/liff/auth/callback',
    //   handler: 'liff.authCallback',
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    //  },
  ],
};
