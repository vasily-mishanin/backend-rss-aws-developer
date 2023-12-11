import { SQSEvent } from 'aws-lambda';
import { createProduct } from './products/add-one';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const TOPIC_ARN =
  'arn:aws:sns:us-east-1:230091350506:ProductServiceStack-CreateProductTopicE4CD9217-d8IDnTwBjXKR';

export const handler = async (event: SQSEvent) => {
  //console.log('Records', event.Records);
  const records = event.Records.map((record) => record.body);

  console.log('received SQS records ---', records);

  const createProductPromises = records.map((record) => createProduct(record));
  const results = await Promise.all(createProductPromises);
  console.log({ createProductPromises: results });

  // SNS Configuration
  const snsClient = new SNSClient({ region: 'us-east-1' });
  const snsMessages = records.map((record) => {
    const product = JSON.parse(record);
    return {
      message: `New product(s) created: ${product.title}`,
      productTitle: product.title,
    };
  });

  const publishCommands = snsMessages.map(
    (message) =>
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Message: JSON.stringify(message),
        Subject: 'Product Creation Event',
      })
  );

  // Publish message to SNS topic
  try {
    for (const publishCommand of publishCommands) {
      const publishResponse = await snsClient.send(publishCommand);
      console.log({ publishCommand });
      console.log('Message published to SNS:', publishResponse);
    }
  } catch (error) {
    console.error('Error publishing message to SNS:', error);
  }
  // await createManyProducts(records);
};

// import { HEADERS } from '../constants';
// import {
//   AttributeValue,
//   DynamoDBClient,
//   GetItemCommand,
//   QueryCommand,
//   TransactWriteItemsCommand,
// } from '@aws-sdk/client-dynamodb';
// import { IProduct } from '../../types';
// const { v4: uuidv4 } = require('uuid');
// import { z } from 'zod';

// export const createManyProducts = async (records: string[] | null) => {
//   console.log({ createManyProducts: records });
//   const dynamoDBClient = new DynamoDBClient();
//   const productUUID: string = uuidv4();

//   if (!records || records.length === 0) {
//     console.log('NO Records to add provided');
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'Missing body' }),
//       headers: HEADERS,
//     };
//   }

//   const parsedRecords: IProduct[] = records
//     .map((record) => JSON.parse(record))
//     .map((record) => ({
//       title: record.title,
//       description: record.description,
//       price: parseFloat(record.price),
//       thumbnail: record.thumbnail,
//       count: parseInt(record.count),
//     }));

//   console.log({ parsedRecords });

//   const productSchema = z.object({
//     title: z.string()!,
//     description: z.string(),
//     price: z.number(),
//     thumbnail: z.string(),
//     count: z.number()!,
//   });

//   const isNewProductsValid = parsedRecords.every((record) => {
//     console.log({ record });
//     const { success } = productSchema.safeParse(record);
//     return success;
//   });

//   if (!isNewProductsValid) {
//     console.error('Products data is invalid');
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'Products data is invalid' }),
//       headers: HEADERS,
//     };
//   }

//   const itemsToAdd = parsedRecords.map((record) => {
//     // for ProductsTable
//     const newProductItem: Record<string, AttributeValue> = {
//       id: { S: productUUID },
//       title: { S: record.title },
//       description: { S: record.description },
//       price: { N: record.price.toString() },
//       thumbnail: { S: record.thumbnail },
//     };

//     // for StockTable
//     const newStockItem: Record<string, AttributeValue> = {
//       product_id: { S: productUUID },
//       count: { N: record.count.toString() },
//     };

//     return { newProductItem, newStockItem };
//   });

//   const transactItems = itemsToAdd
//     .map((itemPair) => [
//       {
//         Put: {
//           TableName: process.env.PRODUCTS_TABLE_NAME,
//           Item: itemPair.newProductItem,
//         },
//       },

//       {
//         Put: {
//           TableName: process.env.STOCK_TABLE_NAME,
//           Item: itemPair.newStockItem,
//         },
//       },
//     ])
//     .flat();

//   const productsParams = {
//     TransactItems: transactItems,
//   };

//   try {
//     const transactionCommand = new TransactWriteItemsCommand(productsParams);

//     const transactResult = await dynamoDBClient.send(transactionCommand);

//     console.log({ transactResult });

//     console.log('---transactionCommand have sent---');
//     console.log(`${transactItems.length} - products successfully added`);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: `${transactItems.length} - products successfully added`,
//       }),
//       headers: HEADERS,
//     };
//   } catch (error) {
//     console.error('Error while adding new item:', error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: 'Internal Server or DB connections Error',
//       }),
//       headers: HEADERS,
//     };
//   }
// };
