import { APIGatewayProxyEvent } from 'aws-lambda';
import { importProductsFile } from '../handlers/importProductsFile';
import { HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Lambda call: ', { event });

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({
        message: `Missed query parameter - name (file name)`,
      }),
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await importProductsFile({ fileName });
        break;
      default:
        return {
          statusCode: 400,
          headers: HEADERS,
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
      headers: HEADERS,
      body: JSON.stringify({ message: error }),
    };
  }
};
