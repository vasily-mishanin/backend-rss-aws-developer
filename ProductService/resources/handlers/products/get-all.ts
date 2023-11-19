import { products } from '../../mockData/productsData';

const headers = {
  'Access-Control-Allow-Origin': 'https://d38xygjrrazjb0.cloudfront.net',
};

export const getProductsList = () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products, null, 2),
    headers,
  };
};
