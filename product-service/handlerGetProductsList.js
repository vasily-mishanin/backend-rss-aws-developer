'use strict';

const { products } = require('./productsMock.js');

module.exports.getProductsList = async function (event) {
  return {
    statusCode: 200,
    body: JSON.stringify(products, null, 2),
    headers: {
      'Access-Control-Allow-Origin': 'https://d38xygjrrazjb0.cloudfront.net',
    },
  };
};

// sls deploy
