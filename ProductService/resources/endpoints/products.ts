import { APIGatewayProxyEvent } from 'aws-lambda';
import { getProductsList } from '../handlers/products/get-all';
import { createProduct } from '../handlers/products/add-one';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Lambda call: ', { event });

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getProductsList(); // get-all
        break;
      case 'POST':
        return await createProduct(event.body); // add-one
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: `Invalid HTTP method - ${event.httpMethod}`,
          }),
        };
        break;
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};
