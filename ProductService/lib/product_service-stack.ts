import * as cdk from 'aws-cdk-lib';
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS Queue create (or update if already created)
    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue');

    // Export the 👆 SQS Queue URL - it is needed for another stack ->
    // -> import-service -> for importFileParser lambda to SEND messages to SQS
    new cdk.CfnOutput(this, 'CatalogItemsQueueUrl', {
      value: catalogItemsQueue.queueUrl,
    });

    // declare existing DynamoDB tables
    const productsDbTable = Table.fromTableName(
      this,
      'id_ProductsTable',
      'ProductsTable'
    );

    const stockDbTable = Table.fromTableName(
      this,
      'id_StockTable',
      'StockTable'
    );

    //API Gateway
    const api = new RestApi(this, 'productsRestAPI', {
      restApiName: 'productsRestAPI',
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
    const getProductsListLambda = new NodejsFunction(
      this,
      'getProductsListLambda',
      {
        entry: 'resources/endpoints/products.ts',
        handler: 'handler',
        environment: {
          PRODUCTS_TABLE_NAME: productsDbTable.tableName,
          STOCK_TABLE_NAME: stockDbTable.tableName,
        },
      }
    );

    const getProductsByIdLambda = new NodejsFunction(
      this,
      'getProductsByIdLambda',
      {
        entry: 'resources/endpoints/product.ts',
        handler: 'handler',
        environment: {
          PRODUCTS_TABLE_NAME: productsDbTable.tableName,
          STOCK_TABLE_NAME: stockDbTable.tableName,
        },
      }
    );

    const createProductLambda = new NodejsFunction(
      this,
      'createProductLambda',
      {
        entry: 'resources/endpoints/products.ts',
        handler: 'handler',
        environment: {
          PRODUCTS_TABLE_NAME: productsDbTable.tableName,
          STOCK_TABLE_NAME: stockDbTable.tableName,
        },
      }
    );

    // lambda that is triggered by SQS and process imported records from import-service
    const catalogBatchProcessLambda = new NodejsFunction(
      this,
      'catalogBatchProcessLambda',
      {
        entry: 'resources/handlers/catalogBatchProcess.ts',
        handler: 'handler',
        environment: {
          PRODUCTS_TABLE_NAME: productsDbTable.tableName,
          STOCK_TABLE_NAME: stockDbTable.tableName,
        },
      }
    );

    catalogBatchProcessLambda.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );

    // Grant 👆 Lambda permissions to READ messages from the SQS queue
    catalogItemsQueue.grantConsumeMessages(catalogBatchProcessLambda);

    // CONNECT another Lambdas to DynamoDB tables
    // for get all
    productsDbTable.grantReadWriteData(getProductsListLambda);
    stockDbTable.grantReadWriteData(getProductsListLambda);

    // for get one
    productsDbTable.grantReadWriteData(getProductsByIdLambda);
    stockDbTable.grantReadWriteData(getProductsByIdLambda);

    // for create-one
    productsDbTable.grantReadWriteData(createProductLambda);
    stockDbTable.grantReadWriteData(createProductLambda);

    // LINK all together
    // Integrate an AWS Lambda function to an API Gateway method.
    const products = api.root.addResource('products'); // add /products   endpoint
    const product = products.addResource('{productId}'); // add /products/{productId}  endpoint

    const productsIntegration = new LambdaIntegration(getProductsListLambda);
    const productIntegration = new LambdaIntegration(getProductsByIdLambda);
    const createProductIntegration = new LambdaIntegration(createProductLambda);

    products.addMethod('GET', productsIntegration, { apiKeyRequired: false });
    product.addMethod('GET', productIntegration, { apiKeyRequired: false });

    products.addMethod('POST', createProductIntegration, {
      apiKeyRequired: false,
    });

    // new cdk.CfnOutput(this, 'API Key ID', {
    //   value: apiKey.keyId,
    // });
  }
}
