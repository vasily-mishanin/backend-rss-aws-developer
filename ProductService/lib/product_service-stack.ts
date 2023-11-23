import * as cdk from 'aws-cdk-lib';
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // declare existing tables
    const productsDbTable = Table.fromTableName(
      this,
      'ProductsTable',
      'products'
    );
    const stocksDbTable = Table.fromTableName(this, 'StocksTable', 'stocks');

    //API
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
          STOCKS_TABLE_NAME: stocksDbTable.tableName,
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
          STOCKS_TABLE_NAME: stocksDbTable.tableName,
        },
      }
    );

    // connect Lambdas to DynamoDB tables
    // for get all
    productsDbTable.grantReadWriteData(getProductsListLambda);
    productsDbTable.grantReadWriteData(getProductsListLambda);
    stocksDbTable.grantReadWriteData(getProductsListLambda);
    stocksDbTable.grantReadWriteData(getProductsListLambda);
    // for get one
    productsDbTable.grantReadWriteData(getProductsByIdLambda);
    productsDbTable.grantReadWriteData(getProductsByIdLambda);
    stocksDbTable.grantReadWriteData(getProductsByIdLambda);
    stocksDbTable.grantReadWriteData(getProductsByIdLambda);

    // link all together
    const products = api.root.addResource('products');
    const product = products.addResource('{productId}');

    const productsIntegration = new LambdaIntegration(getProductsListLambda);
    const productIntegration = new LambdaIntegration(getProductsByIdLambda);

    products.addMethod('GET', productsIntegration, { apiKeyRequired: false });
    product.addMethod('GET', productIntegration, { apiKeyRequired: false });

    new cdk.CfnOutput(this, 'API Key ID', {
      value: apiKey.keyId,
    });
  }
}
