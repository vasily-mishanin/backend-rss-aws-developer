import { products } from '../../mockData/productsData';

export const getProductsList = () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products, null, 2),
  };
};