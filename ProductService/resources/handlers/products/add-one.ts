import { HEADERS } from '../../constants';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { IProduct } from '../../../types';
const { v4: uuidv4 } = require('uuid');
import { z } from 'zod';
const dynamodb = new DynamoDB({});

export const createProduct = async (body: string | null) => {
  const uuid = uuidv4();

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
  });

  const { success: newProductIsValid } = productSchema.safeParse(parsedBody);

  if (!newProductIsValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product data is invalid' }),
    };
  }

  try {
    await dynamodb.send(
      new PutCommand({
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Item: { id: uuid, ...parsedBody },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Product ${parsedBody.title} successfully added`,
      }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server or DB connection Error' }),
    };
  }
};
