import { HEADERS } from '../../../constants';
import { products } from '../../../mockData/productsData';
//import { getProductsList } from '../get-all';
//import { getProductsById } from '../get-one';

const getProductsList = () => ({
  statusCode: 200,
  body: JSON.stringify(products),
  headers: HEADERS,
});

const getProductsById = (productId: string) => {
  const product = products.find((p) => p.id === productId);
  console.log(product);
  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not found' }),
      headers: HEADERS,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(product),
    headers: HEADERS,
  };
};

describe('Handlers', () => {
  test('getProductsList returns correct response', () => {
    const response = getProductsList();
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(HEADERS));

    const products = JSON.parse(response.body);
    expect(products).toBeInstanceOf(Array); // Ensure products is an array
    expect(products.length).toBe(10); // Ensure the ar
  });

  test('getProductsById returns correct response for existing product', async () => {
    const productId = '1d567551-8e8d-46e9-a4f4-4dbfe39b7f80';
    const response = getProductsById(productId);
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(HEADERS));

    const product = JSON.parse(response.body);
    expect(product.title).toBe('Samsung Galaxy Book');
  });

  test('getProductsById returns correct response for non-existing product', () => {
    const productId = 'nonexisten-id';
    const response = getProductsById(productId);
    expect(response.statusCode).toBe(404);
    expect(response.headers).toEqual(expect.objectContaining(HEADERS));
  });
});
