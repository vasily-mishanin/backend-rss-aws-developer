import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { HEADERS } from '../constants';

// This basicAuthorizer lambda should take Basic Authorization token, decode it and check that credentials
// provided by token exist in the lambda environment variable.
//
// This lambda should return 403 HTTP status if access is denied for this user (invalid authorization_token)
// and 401 HTTP status if Authorization header is not provided.

// import { HEADERS } from '../constants';

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  console.log({ event });
  console.log('ENV ', process.env);
  const token = event.authorizationToken.split(' ')[1]; // ['Basic', 'dmFzaWx5X21pc2hhbmluOlRFU1RfUEFTU1dPUkQ=']
  console.log({ token }); // base-64 encoded like dmFzaWx5X21pc2hhbmluOlRFU1RfUEFTU1dPUkQ=

  if (!token) {
    console.log('No Authorization header provided');

    throw Error('Unauthorized');
  }

  const decodedString = Buffer.from(token, 'base64').toString('utf-8'); // <github-account>:TEST_PASSWORD
  const decodedPassword = decodedString.split(':')[1];

  if (decodedPassword === process.env.MY_GH_ACC_NAME) {
    console.log('Basic Authorizer works. Access granted');
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  console.log('Invalid authorization_token');
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: event.methodArn,
        },
      ],
    },
  };
};
