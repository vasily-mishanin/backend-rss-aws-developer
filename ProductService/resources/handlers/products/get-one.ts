import { HEADERS } from '../../constants';
import { products } from '../../mockData/productsData';

export const getProductsById = ({ productId }: { productId: string }) => {
  try {
    const product = products.find((p) => p.id === parseInt(productId));

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
        headers: HEADERS,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product, null, 2),
      headers: HEADERS,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server or DB connection Error' }),
    };
  }
};
