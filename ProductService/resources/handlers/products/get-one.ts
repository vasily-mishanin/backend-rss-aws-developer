import { products } from '../../mockData/productsData';

export const getProductsById = ({ productId }: { productId: string }) => {
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
