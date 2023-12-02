import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //API
    const api = new RestApi(this, 'importRestAPI', {
      restApiName: 'importRestAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const apiKey = new ApiKey(this, 'ApiKey');

    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'UsagePlan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    // LAMBDAS
    const importProductsFileLambda = new NodejsFunction(
      this,
      'importProductsFileLambda',
      {
        entry: 'resources/endpoints/import-products.ts',
        handler: 'handler',
        environment: {},
      }
    );

    // Attach an IAM policy to Lambda function to allow it to read from S3
    importProductsFileLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: [
          'arn:aws:s3:::import-service-s3-bucket-aws',
          'arn:aws:s3:::import-service-s3-bucket-aws/*',
        ], // bucket ARN
      })
    );

    // LINK all together
    // Integrate AWS Lambda to an API Gateway method.
    const productsFileImport = api.root.addResource('import'); // create "/import" route

    const productsFileImportIntegration = new LambdaIntegration(
      importProductsFileLambda
    );

    productsFileImport.addMethod('GET', productsFileImportIntegration, {
      apiKeyRequired: false,
    });

    // new cdk.CfnOutput(this, 'API Key ID', {
    //   value: apiKey.keyId,
    // });
  }
}
