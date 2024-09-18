const slugify = require('slugify');

module.exports = {

  async beforeCreate(event) {
    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
  async beforeUpdate(event) {
    if (event.params.data.slug) {
      event.params.data.slug = slugify(event.params.data.slug, { lower: true, remove: /[*+~.()'"!:@]/g });
    }
  },
};
