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

### Task 7 Authorization

https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/07_authorization
Check using WebApp
Hi! I suggest you to try to download products using the FE App
All evaluating tasks are done - 100/100

You can grab data here - https://github.com/vasily-mishanin/nodejs-aws-shop-react/tree/main/webApp/src/mocks/mock_data

Download CSV -> WebAPP -> Import -> try no token, invalid token, valid token.

You can use browser's devtools to set authorization_token in Local Storage
Valid Token - dmFzaWx5X21pc2hhbmluOlRFU1RfUEFTU1dPUkQ=
Decoded string - 'vasily_mishanin:TEST_PASSWORD' - no needed actually

Web App - https://d38xygjrrazjb0.cloudfront.net/

In UI you should see Auth messages:

No token ( No 'authorization_token' in Local Storage):
Screenshot 2023-12-17 at 12 47 04

Invalid token ('authorization_token' in Local Storage is some invalid string)
Screenshot 2023-12-17 at 12 48 38

Import Service - https://xx44v5lsg3.execute-api.us-east-1.amazonaws.com/prod/import

FE PR - vasily-mishanin/nodejs-aws-shop-react#5

### Task 8 (Integration with SQL Database)

https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/08_integration_with_sql_database

Hi! Sometimes lambda is working only after second request
Task 8.1
Task 8.2 - https://github.com/vasily-mishanin/rss-nodejs-aws-cart-api/blob/task-8-sql-db/create_orders_and_items.sql
Task 8.3 - https://1pixe3aon6.execute-api.us-east-1.amazonaws.com/prod/api/profile/cart - reload please if not OK
orders table created and integrated

- https://1pixe3aon6.execute-api.us-east-1.amazonaws.com/prod/api/profile/order - reload if not ОК

90/100
Screenshot 2023-12-28 at 20 19 00

Web App - https://d38xygjrrazjb0.cloudfront.net/
API Gateway for Cart Service - https://1pixe3aon6.execute-api.us-east-1.amazonaws.com/prod/swagger

FE PR - vasily-mishanin/nodejs-aws-shop-react#6

### Task - 9 - Docker + AWS Beanstalk

https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/09_containerization/README.md

"test" Environmnent Domain On BeanStalk

http://vasily-mishanin-cart-api-test.us-east-1.elasticbeanstalk.com/api/profile/cart
http://vasily-mishanin-cart-api-test.us-east-1.elasticbeanstalk.com/api/profile/order
https proxy (via API Gateway)

https://8n6zt7471d.execute-api.us-east-1.amazonaws.com/api/profile/cart
https://8n6zt7471d.execute-api.us-east-1.amazonaws.com/api/profile/order
Dockerfile (optimized, with comments) - https://github.com/vasily-mishanin/rss-nodejs-aws-cart-api/blob/task-9-docker-beanstalk/nest-js-app/Dockerfile
Screenshot 2024-01-02 at 01 36 47

.dockerignore with comments - https://github.com/vasily-mishanin/rss-nodejs-aws-cart-api/blob/task-9-docker-beanstalk/nest-js-app/.dockerignore

FE app - https://d38xygjrrazjb0.cloudfront.net/
FE PR - vasily-mishanin/nodejs-aws-shop-react#7

### Task - 10 (Backend For Frontend)

task-10 - https://github.com/rolling-scopes-school/aws/tree/main/aws-developer/10_backend_for_frontend
Self estimation - 80/100

Check flow:
Open FE App => open Postman => get products => get one product => add product => see in FE App

FRONTEND:
Cloudfront Distribution - https://d38xygjrrazjb0.cloudfront.net/
FE PR - https://github.com/vasily-mishanin/nodejs-aws-shop-react/pull/8

BFF Service API URL:

- GET (/products and products/:id)
  http://vasily-mishanin-bff-api-bfftest.us-east-1.elasticbeanstalk.com/products
  http://vasily-mishanin-bff-api-bfftest.us-east-1.elasticbeanstalk.com/cart

- POST - createProduct
  http://vasily-mishanin-bff-api-bfftest.us-east-1.elasticbeanstalk.com/products
  Example body:
  `{
    "title":"3D Embellishment Art Lamp",
    "description":"3D led lamp sticker Wall sticker 3d wall art light on/off button  cell operated (included)",
    "price":333,
    "thumbnail":"https://cdn.dummyjson.com/product-images/28/thumbnail.jpg",
    "count":222
}`

API Gateway Proxy for BFF - https://a4lbovzku0.execute-api.us-east-1.amazonaws.com

Product Service API - https://qb6966ovig.execute-api.us-east-1.amazonaws.com/prod
Cart API (https proxy via API Gateway):
https://8n6zt7471d.execute-api.us-east-1.amazonaws.com/api/profile/cart
https://8n6zt7471d.execute-api.us-east-1.amazonaws.com/api/profile/order

You can use browser's devtools to set `authorization_token` in Local Storage
Valid Token - `dmFzaWx5X21pc2hhbmluOlRFU1RfUEFTU1dPUkQ=`

### Links

Link to Product Service API - https://qb6966ovig.execute-api.us-east-1.amazonaws.com/prod/products

Link to Frontend Repository - https://github.com/vasily-mishanin/nodejs-aws-shop-react/pull/2  
Link to Cloudfront Frontend Deploy - https://d38xygjrrazjb0.cloudfront.net/

Swagger info in the ProductService root `openapi3_0.yaml` file. Past it in https://editor.swagger.io/ and test the API
