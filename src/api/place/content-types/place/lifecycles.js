const slugify = require('slugify');

module.exports = {

  async beforeCreate(event) {
    event.params.data.fullname = `${event.params.data.name} ${event.params.data.templeName}`

    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
  async beforeUpdate(event) {
    event.params.data.fullname = `${event.params.data.name} ${event.params.data.templeName}`

    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
  async afterFindMany(event) {
    event.result = event.result.map(o=>{
      o.fullname = `${o.name} ${o.templeName}`
      return o
    })
  },
  async afterFindOne(event) {
    if(event.result?.name)
    event.result.fullname = `${event.result.name} ${event.result.templeName}`
  },
};
