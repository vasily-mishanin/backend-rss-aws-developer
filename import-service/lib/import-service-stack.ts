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
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const EXISTING_BUCKET_NAME = 'import-service-s3-bucket-aws';

    // // Import the SQS Queue URL from the "products-service" stack
    // const EXISTING_SQS_QUEUE_URL = cdk.Fn.importValue(
    //   'ProductsServiceStack:CatalogItemsQueueUrl'
    // );

    const EXISTING_SQS_QUEUE_URL =
      'https://sqs.us-east-1.amazonaws.com/230091350506/ProductServiceStack-CatalogItemsQueueB3B6CE23-tbNdqeD4k7Ia';
    // Replace  with the actual ARN of your existing SQS queue
    const EXISTING_SQS_QUEUE_ARN =
      'arn:aws:sqs:us-east-1:230091350506:ProductServiceStack-CatalogItemsQueueB3B6CE23-tbNdqeD4k7Ia';
    // Create a reference to the existing SQS queue
    const existingCatalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      'ExistingQueue',
      EXISTING_SQS_QUEUE_ARN
    );

    // Use the existing S3 bucket
    const bucketForImport = s3.Bucket.fromBucketName(
      this,
      'id_import-service-s3',
      EXISTING_BUCKET_NAME
    );

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
    // creates suged upload URL for PUT requests
    const importProductsFileLambda = new NodejsFunction(
      this,
      'importProductsFileLambda',
      {
        entry: 'resources/endpoints/import-products.ts',
        handler: 'handler',
        environment: {},
      }
    );

    // after loading to S3, grabs CSV file, parses it and sends messages to SQS
    const importFileParserLambda = new NodejsFunction(
      this,
      'importFileParserLambda',
      {
        entry: 'resources/handlers/importFileParser.ts',
        handler: 'handler',
        environment: {
          CATALOG_ITEMS_QUEUE_URL: EXISTING_SQS_QUEUE_URL,
        },
      }
    );

    // Add an S3 event notification to trigger the 👆 Lambda function
    bucketForImport.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded', suffix: '.csv' }
    );
    bucketForImport.grantReadWrite(importFileParserLambda);

    // Grant 👆 Lambda permissions to send messages to the SQS queue
    existingCatalogItemsQueue.grantSendMessages(importFileParserLambda);

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
