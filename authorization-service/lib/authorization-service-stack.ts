import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
require('dotenv').config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda  that is triggered by API Gateway when some client tries to get protected resource
    const basicAuthorizerLambda = new NodejsFunction(
      this,
      'basicAuthorizerLambda',
      {
        entry: 'resources/handlers/basicAuthorizer.ts',
        handler: 'handler',
        environment: {
          MY_GH_ACC_NAME: process.env.vasily_mishanin || 'no_password',
        },
      }
    );
  }
}
