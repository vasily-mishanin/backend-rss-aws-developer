import { HEADERS } from '../../constants';
import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { IProduct } from '../../../types';
const { v4: uuidv4 } = require('uuid');
import { z } from 'zod';

const dynamoDBClient = new DynamoDBClient();

export const createProduct = async (body: string | null) => {
  const productUUID: string = uuidv4();

  if (!body) {
    console.log('NO Body!');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing body' }),
      headers: HEADERS,
    };
  }

  const parsedBody = JSON.parse(body) as IProduct;

  const productSchema = z.object({
    title: z.string()!,
    description: z.string(),
    price: z.number(),
    thumbnail: z.string(),
    count: z.number()!,
  });

  const { success: isNewProductValid } = productSchema.safeParse(parsedBody);

  if (!isNewProductValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product data is invalid' }),
      headers: HEADERS,
    };
  }

  const { count, id, ...newProduct } = parsedBody;

  console.log({ parsedBody });

  const queryProductItemCommand = new QueryCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    IndexName: 'title-index',
    ExpressionAttributeValues: {
      ':value': { S: newProduct.title },
    },
    KeyConditionExpression: 'title = :value',
  });

  try {
    // check if product with such title is already in DB
    const { Items: existingProducts } = await dynamoDBClient.send(
      queryProductItemCommand
    );

    if (existingProducts && existingProducts.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Product with title ${newProduct.title} - already exists`,
        }),
        headers: HEADERS,
      };
    }
  } catch (error) {
    console.error('Query Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error when Query existing product ',
      }),
      headers: HEADERS,
    };
  }

  // in not in DB - add new
  try {
    // await dynamodb.send(
    //   new PutCommand({
    //     TableName: process.env.PRODUCTS_TABLE_NAME,
    //     Item: { id: uuid, ...parsedBody },
    //   })
    // );

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

    await dynamoDBClient.send(transactionCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Product - ${parsedBody.title} - successfully added`,
      }),
      headers: HEADERS,
    };
  } catch (error) {
    console.error('Error while adding new item:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server or DB connections Error',
      }),
      headers: HEADERS,
    };
  }
};
