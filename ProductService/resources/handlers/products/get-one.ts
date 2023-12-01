import { IProduct } from '../../../types';
import { HEADERS } from '../../constants';
import {
  GetItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({});

export const getProductsById = async ({ productId }: { productId: string }) => {
  console.log('getProductsById ', typeof productId, productId);
  console.log('TABLE ', process.env.PRODUCTS_TABLE_NAME);

  const queryProductItemCommand = new QueryCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    ExpressionAttributeValues: { ':value': { S: productId } },
    KeyConditionExpression: 'id = :value',
    //ProjectionExpression: 'title',
  });

  const getStockItemCommand = new GetItemCommand({
    TableName: process.env.STOCK_TABLE_NAME,
    Key: {
      product_id: { S: productId },
    },
  });

  try {
    const { Items: existingProducts } = await dynamoDBClient.send(
      queryProductItemCommand
    );
    const { Item: existingStock } = await dynamoDBClient.send(
      getStockItemCommand
    );

    if (!existingProducts || !existingProducts?.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
        headers: HEADERS,
      };
    }

    const productItem = existingProducts[0];

    const foundProduct: IProduct = {
      id: productItem.id.S,
      title: productItem.title.S!,
      description: productItem.description.S!,
      thumbnail: productItem.thumbnail.S!,
      price: parseFloat(productItem.price.N!),
      count: parseInt(existingStock?.count.N!),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(foundProduct, null, 2),
      headers: HEADERS,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server or DB query Error' }),
    };
  }
};
