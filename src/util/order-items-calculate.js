const OrderItemsCalculate = async (data) => {
  let productId = data.product


  let product = await strapi.db.query('api::product.product').findOne({
    where: {
      id: productId
    }
  })

  if (!product) {
    throw new ApplicationError('ไม่พบ productId=' + orderItem.productId, 404);
  }

  data.price = product.price
  data.promotionPrice = product.promotionPrice ? product.promotionPrice : 0

  let price = +product.price
  if (product.promotionPrice) {
    price = +product.promotionPrice
  }

  let total = price * data.qty
  let point = product.point ? product.point * data.qty : 0

  data.total = total
  data.point = point

  return data
}

module.exports = OrderItemsCalculate
