'use strict';

const { products } = require('./productsMock.js');

module.exports.getProductsById = async function (event) {
  const { productId } = event.pathParameters;
  const product = products.find((p) => p.id === parseInt(productId));

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(product, null, 2),
  };
};
