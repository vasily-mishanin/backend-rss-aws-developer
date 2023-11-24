import { IProduct } from '../../../types';
import { HEADERS } from '../../constants';
//import { products } from '../../mockData/productsData';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

//const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDBClient = new DynamoDBClient();

export const getProductsById = async ({ productId }: { productId: string }) => {
  try {
    // const product = products.find((p) => p.id === parseInt(productId));
    const getProductItemCommand = new GetItemCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: {
        id: { S: productId },
      },
    });

    const getStockItemCommand = new GetItemCommand({
      TableName: process.env.STOCK_TABLE_NAME,
      Key: {
        product_id: { S: productId },
      },
    });

    const { Item: ProductItem } = await dynamoDBClient.send(
      getProductItemCommand
    );

    const { Item: StockItem } = await dynamoDBClient.send(getStockItemCommand);

    if (!ProductItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
        headers: HEADERS,
      };
    }

    const foundProduct: IProduct = {
      id: ProductItem.id?.S,
      title: ProductItem.title?.S!,
      description: ProductItem.description.S!,
      thumbnail: ProductItem.thumbnail.S!,
      price: parseFloat(ProductItem.price.N!),
      count: parseInt(StockItem?.count.N!),
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
      body: JSON.stringify({ error: 'Internal Server or DB connection Error' }),
    };
  }
};
