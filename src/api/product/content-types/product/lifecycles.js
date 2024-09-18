const slugify = require('slugify');
const numberFormat = require('../../../../util/number-format');

module.exports = {

  async beforeCreate(event) {
    event.params.data.fullname = `${event.params.data.name} ${numberFormat(+event.params.data.price)}`

    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
  async beforeUpdate(event) {
    event.params.data.fullname = `${event.params.data.name} ${numberFormat(+event.params.data.price)}`

    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
  async afterFindMany(event) {
    event.result = event.result.map(o=>{
      o.fullname = `${o.name} ${numberFormat(o.price)}`
      return o
    })
  },
  async afterFindOne(event) {
    if(event.result?.name)
    event.result.fullname = `${event.result.name} ${numberFormat(event.result.price)}`
  },
};
