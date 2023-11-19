import { products } from '../../../mockData/productsData';
import { getProductsList } from '../get-all';
import { getProductsById } from '../get-one';

const testHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

describe('Handlers', () => {
  test('getProductsList returns correct response', () => {
    const response = getProductsList();
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));

    const products = JSON.parse(response.body);
    expect(products).toBeInstanceOf(Array); // Ensure products is an array
    expect(products.length).toBe(10); // Ensure the ar
  });

  test('getProductsById returns correct response for existing product', () => {
    const productId = '10'; // Replace with an existing product ID
    const response = getProductsById({ productId });
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));

    const product = JSON.parse(response.body);
    expect(product.title).toBe('HP Pavilion 15-DK1056WM');
  });

  test('getProductsById returns correct response for non-existing product', () => {
    const productId = 'nonexistent'; // Replace with a non-existing product ID
    const response = getProductsById({ productId });
    expect(response.statusCode).toBe(404);
    expect(response.headers).toEqual(expect.objectContaining(testHeaders));
  });
});
