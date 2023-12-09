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

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // declare existing tables
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

    // connect Lambdas to DynamoDB tables
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
    const products = api.root.addResource('products');
    const product = products.addResource('{productId}');

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
