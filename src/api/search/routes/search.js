module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/search',
     handler: 'search.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/search/:section',
     handler: 'search.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
