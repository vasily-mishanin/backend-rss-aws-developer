import { SQSEvent, SQSRecord } from 'aws-lambda';
import { handler } from '../catalogBatchProcess';
import { createProduct } from '../products/add-one';

jest.mock('../products/add-one', () => ({
  createProduct: jest.fn(),
}));

describe('SQS Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process SQS records', async () => {
    const records: SQSRecord[] = [
      {
        messageId: '1',
        receiptHandle: 'handle1',
        body: 'record1',
        md5OfBody: 'md5hash1', // Add this line
        attributes: {
          ApproximateReceiveCount: '1',
          SentTimestamp: '123456789',
          SenderId: 'senderId1',
          ApproximateFirstReceiveTimestamp: '123456789',
        },
        messageAttributes: {},
        awsRegion: 'us-east-1',
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:your-queue-name',
      },
      {
        messageId: '2',
        receiptHandle: 'handle2',
        body: 'record2',
        md5OfBody: 'md5hash2', // Add this line
        attributes: {
          ApproximateReceiveCount: '2',
          SentTimestamp: '123456789',
          SenderId: 'senderId2',
          ApproximateFirstReceiveTimestamp: '123456789',
        },
        messageAttributes: {},
        awsRegion: 'us-east-1',
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:your-queue-name',
      },
    ];

    const event: SQSEvent = {
      Records: records,
    };

    await handler(event);

    // Check if createProduct is called with the correct records
    expect(createProduct).toHaveBeenCalledWith('record1');
    expect(createProduct).toHaveBeenCalledWith('record2');
  });
});
