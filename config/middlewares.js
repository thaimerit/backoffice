module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true, 
        directives: {
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net','www.gstatic.com'],
        },
      }
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  {
    name: 'strapi::public',
    config: {
      index: "index.html",
      defaultIndex: false
    },
  }
];
