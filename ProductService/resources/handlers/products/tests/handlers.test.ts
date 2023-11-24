import { products } from '../../../mockData/productsData';
import { getProductsList } from '../get-all';
import { getProductsById } from '../get-one';

const testHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

describe('Handlers', async () => {
  test('getProductsList returns correct response', async () => {
    const response = await getProductsList();
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));

    const products = JSON.parse(response.body);
    expect(products).toBeInstanceOf(Array); // Ensure products is an array
    expect(products.length).toBe(10); // Ensure the ar
  });

  test('getProductsById returns correct response for existing product', async () => {
    const productId = '7c3ae206-40eb-4357-958c-746bdd1e1222';
    const response = await getProductsById({ productId });
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));

    const product = JSON.parse(response.body);
    expect(product.title).toBe('HP Pavilion 15-DK1056WM');
  });

  test('getProductsById returns correct response for non-existing product', async () => {
    const productId = 'nonexisten-id';
    const response = await getProductsById({ productId });
    expect(response.statusCode).toBe(404);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));
  });
});
