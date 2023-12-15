#### Backend code for Rolling Scopes School AWS Developer course

/product-service - is made using Serverless Framework - will be removed soon

/ProductService - is actual and completed task #3

### Task 3 Lambda

https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/03_serverless_api

1. What was done

- `/products` route invokes getProductsList Lambda

  - response with a full array of products (mocked)
  - integrated with Frontend app

- `/products/{productId}` route invokes getProductsById Lambda
  - response with 1 searched product from an array of products

Additionally

- Swagger `openapi3_0.yaml` file. Past it in https://editor.swagger.io/ and test the API
- UNIT tests for Lambda handlers in `ProductService/resources/handlers/products/tests/handlers.test.ts`
- Lambda handlers arr in different files
- Main error scenarios are handled by API

### Task 4 DynamoDB

https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/04_integration_with_nosql_database

All tasks including Additional (optional) tasks are done
Backend:
Product Service API - https://qb6966ovig.execute-api.us-east-1.amazonaws.com/prod
Swagger - https://app.swaggerhub.com/apis/VASILYMISHANIN_1/products-service-api/1.0.0-oas3

Frontend:
FE PR - vasily-mishanin/nodejs-aws-shop-react#3
Cloudfront Distribution - https://d38xygjrrazjb0.cloudfront.net/

### Task 5 Integration with S3 (import CSV and parsing)

https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/05_integration_with_s3

Import service is done
Import service integrated with Frontend
Uploading file is working by getting Presigned upload URL from lambda importProductsFile.
Uploaded file should be a valid CSV file.
After uploading the csv file, importFileParser lambda is called and parses the file and logs entries.
Then parsed file is moved from uploads/ to parsed/

FRONTEND:
FE PR - vasily-mishanin/nodejs-aws-shop-react#4
Cloudfront Distribution - https://d38xygjrrazjb0.cloudfront.net/

BACKEND:
Import Service API - https://xx44v5lsg3.execute-api.us-east-1.amazonaws.com/prod/import
required query parameter ?name=<filename>

You can check it in browser or Postman
https://xx44v5lsg3.execute-api.us-east-1.amazonaws.com/prod/import?name=productsCatalogCSVFileName.csv
it returns object {s3UploadSignedUrl:<url-for-uploading-an-object>}

After uploading an object there are logs in AWS CloudWatch

Swagger - https://app.swaggerhub.com/apis/VASILYMISHANIN_1/products-service-api/1.0.0-oas3

### Task 6 SQS & SNS, Async Microservices Communication

https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/06_async_microservices_communication/task.md  
https://github.com/vasily-mishanin/backend-rss-aws-developer/pull/4
All tasks are done including additional one.
import -> parsing -> message to SQS ->
-> notify another Lambda -> Put Transact Items in DynamoDB ->
-> SNS -> email notification with filtering (title that starts with 'IPhone' -> send to another email)

I have cleared DynamoDB for you to check in action.
You can download and use these CSV data for convenience to import:
https://github.com/vasily-mishanin/nodejs-aws-shop-react/tree/task-5-import-service/webApp/src/mocks/mock_data

### Links

Link to Product Service API - https://qb6966ovig.execute-api.us-east-1.amazonaws.com/prod/products

Link to Frontend Repository - https://github.com/vasily-mishanin/nodejs-aws-shop-react/pull/2  
Link to Cloudfront Frontend Deploy - https://d38xygjrrazjb0.cloudfront.net/

Swagger info in the ProductService root `openapi3_0.yaml` file. Past it in https://editor.swagger.io/ and test the API
