import { SQSEvent, SQSRecord } from 'aws-lambda';
import { handler } from '../catalogBatchProcess';
import { createProduct } from '../products/add-one';
import {
  SNSClient,
  PublishCommand,
  PublishCommandOutput,
} from '@aws-sdk/client-sns';

jest.mock('../products/add-one', () => ({
  createProduct: jest.fn(),
}));

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(),
  PublishCommand: jest.fn(),
}));

describe('SQS Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process SQS records and publish messages to SNS', async () => {
    const records: SQSRecord[] = [
      {
        messageId: '1',
        receiptHandle: 'handle1',
        body: JSON.stringify('record1'),
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
        body: JSON.stringify('record2'),
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

    // Mock SNSClient.send method
    const mockSNSClientSend = jest.fn();
    (SNSClient as jest.Mock).mockImplementationOnce(() => ({
      send: mockSNSClientSend,
    }));

    // Mock the response from the SNS publish command
    const mockPublishResponse: PublishCommandOutput = {
      MessageId: 'mocked-message-id',
      $metadata: {},
    };
    mockSNSClientSend.mockResolvedValueOnce(mockPublishResponse);

    await handler(event);

    // Check if createProduct is called with the correct records
    expect(createProduct).toHaveBeenCalledWith(JSON.stringify('record1'));
    expect(createProduct).toHaveBeenCalledWith(JSON.stringify('record2'));

    // Check if SNSClient.send is called with the expected PublishCommand
    expect(mockSNSClientSend).toHaveBeenCalledWith(
      new PublishCommand({
        TopicArn:
          'arn:aws:sns:us-east-1:230091350506:ProductServiceStack-CreateProductTopicE4CD9217-d8IDnTwBjXKR',
        Message:
          '{"message":"New product(s) created: record1","productTitle":"record1"}',
        Subject: 'Product Creation Event',
      })
    );
    expect(mockSNSClientSend).toHaveBeenCalledWith(
      new PublishCommand({
        TopicArn:
          'arn:aws:sns:us-east-1:230091350506:ProductServiceStack-CreateProductTopicE4CD9217-d8IDnTwBjXKR',
        Message:
          '{"message":"New product(s) created: record2","productTitle":"record2"}',
        Subject: 'Product Creation Event',
      })
    );
  });
});
