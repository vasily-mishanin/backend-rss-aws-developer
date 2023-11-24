import { HEADERS } from '../../constants';
import {
  AttributeValue,
  DynamoDB,
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { IProduct } from '../../../types';
const { v4: uuidv4 } = require('uuid');
import { z } from 'zod';
import { marshallInput } from '@aws-sdk/lib-dynamodb/dist-types/commands/utils';

const dynamodb = new DynamoDBClient();

export const createProduct = async (body: string | null) => {
  const productUUID: string = uuidv4();

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing body' }),
    };
  }

  const parsedBody = JSON.parse(body) as IProduct;

  const productSchema = z.object({
    title: z.string()!,
    description: z.string(),
    price: z.number(),
    thumbnail: z.string(),
    count: z.number(),
  });

  const { success: newProductIsValid } = productSchema.safeParse(parsedBody);

  if (!newProductIsValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product data is invalid' }),
    };
  }

  const { count, id, ...newProduct } = parsedBody;

  const newProductItem: Record<string, AttributeValue> = {
    id: { S: productUUID },
    title: { S: newProduct.title },
    description: { S: newProduct.description },
    price: { N: newProduct.price.toString() },
    thumbnail: { S: newProduct.thumbnail },
  };

  const newStockItem: Record<string, AttributeValue> = {
    product_id: { S: productUUID },
    count: { N: count.toString() },
  };

  const productParams = {
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: newProductItem,
        },
      },
      {
        Put: {
          TableName: process.env.STOCK_TABLE_NAME,
          Item: newStockItem,
        },
      },
    ],
  };

  const transactionCommand = new TransactWriteItemsCommand(productParams);

  try {
    // await dynamodb.send(
    //   new PutCommand({
    //     TableName: process.env.PRODUCTS_TABLE_NAME,
    //     Item: { id: uuid, ...parsedBody },
    //   })
    // );

    await dynamodb.send(transactionCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Product - ${parsedBody.title} - successfully added`,
      }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server or DB connections Error',
      }),
    };
  }
};
