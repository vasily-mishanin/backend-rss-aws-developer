import { SQSEvent } from 'aws-lambda';
import { createProduct } from './products/add-one';

export const handler = async (event: SQSEvent) => {
  //console.log('Records', event.Records);

  const products = event.Records.map((record) => {
    return JSON.parse(record.body);
  });

  console.log('SQS messages ---', products);

  for (const record of event.Records) {
    await createProduct(record.body);
  }

  //console.log('SQS messages 👉', JSON.stringify(messages, null, 2));
};
