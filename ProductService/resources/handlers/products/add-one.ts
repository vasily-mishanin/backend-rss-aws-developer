import { HEADERS } from '../../constants';
import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { IProduct } from '../../../types';
const { v4: uuidv4 } = require('uuid');
import { z } from 'zod';

const dynamodb = new DynamoDBClient();

export const createProduct = async (body: string | null) => {
  const productUUID: string = uuidv4();

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing body' }),
      header: HEADERS,
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

  const { success: newProductIsValid } = productSchema.safeParse(parsedBody);

  if (!newProductIsValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product data is invalid' }),
      header: HEADERS,
    };
  }

  const { count, id, ...newProduct } = parsedBody;

  //check if product with such title already in DB
  const getProductItemCommand = new GetItemCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    Key: {
      title: { S: newProduct.title },
    },
  });

  const { Item: ExistingProductItem } = await dynamodb.send(
    getProductItemCommand
  );

  if (ExistingProductItem) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Product with title ${ExistingProductItem.title.S} - already exists`,
      }),
      header: HEADERS,
    };
  }

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
      header: HEADERS,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server or DB connections Error',
      }),
      header: HEADERS,
    };
  }
};
