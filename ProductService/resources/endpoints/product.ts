import { APIGatewayProxyEvent } from 'aws-lambda';
import { getProductsList } from '../handlers/products/get-all';
import { getProductsById } from '../handlers/products/get-one';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Lambda call: ', { event });

  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missed path parameter - productId`,
      }),
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getProductsById({ productId }); // get-one
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
