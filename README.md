#### Backend code for Rolling Scopes School AWS Developer course

/product-service - is made using Serverless Framework - will be removed soon

/ProductService - is actual and completed task #3

### Task 3 Lambda

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

### Links

Link to Product Service API - https://qb6966ovig.execute-api.us-east-1.amazonaws.com/prod/products

Link to Frontend Repository - https://github.com/vasily-mishanin/nodejs-aws-shop-react/pull/2  
Link to Cloudfront Frontend Deploy - https://d38xygjrrazjb0.cloudfront.net/

Swagger info in the ProductService root `openapi3_0.yaml` file. Past it in https://editor.swagger.io/ and test the API
