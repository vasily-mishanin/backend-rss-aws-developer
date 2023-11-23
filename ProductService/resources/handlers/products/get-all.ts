import { HEADERS } from '../../constants';
import { products } from '../../mockData/productsData';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export const getProductsList = async () => {
  const productsFromDB = await dynamodb.send(
    new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME })
  );

  const stocksFromDB = await dynamodb.send(
    new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME })
  );

  const joinedProducts = productsFromDB.Items?.map((product) => {
    const stock = stocksFromDB.Items?.find(
      (stock) => stock.product_id === product.id
    );
    return stock ? { ...product, count: stock.count } : product;
  });

  return {
    statusCode: 200,
    body: JSON.stringify(joinedProducts, null, 2),
    headers: HEADERS,
  };
};
