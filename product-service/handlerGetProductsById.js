'use strict';

const { products } = require('./productsMock.js');

module.exports.getProductsById = async function (event) {
  const { productId } = event.pathParameters;
  const product = products.find((p) => p.id === parseInt(productId));

  const headers = {
    'Access-Control-Allow-Origin': 'https://d38xygjrrazjb0.cloudfront.net',
  };

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not found' }),
      headers,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(product, null, 2),
  };
};

// sls deploy
