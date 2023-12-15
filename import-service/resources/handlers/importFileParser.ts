import { S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
const csv = require('csv-parser');
import { Readable } from 'stream';
import CSVFileValidator from 'csv-file-validator';
import { HEADERS } from '../constants';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';

const REGION = 'us-east-1';
const BUCKET_NAME = 'import-service-s3-bucket-aws';
const KEY = 'uploaded/catalogCSV.csv';

const validatorConfig = {
  headers: [
    { name: 'id', inputName: 'id' },
    { name: 'title', inputName: 'title' },
    { name: 'description', inputName: 'description' },
    { name: 'price', inputName: 'price' },
    { name: 'discountPercentage', inputName: 'discountPercentage' },
    { name: 'rating', inputName: 'rating' },
    { name: 'stock', inputName: 'stock' },
    { name: 'brand', inputName: 'brand' },
    { name: 'category', inputName: 'category' },
    { name: 'thumbnail', inputName: 'thumbnail' },
  ], // required
  isHeaderNameOptional: true,
  isColumnIndexAlphabetic: false,
};

export const handler = async (event: S3Event) => {
  console.log('PARSER Lambda call: ', event.Records);
  const clientS3 = new S3Client({ region: REGION });
  const sqsClient = new SQSClient();

  async function sendMessagesToSQS(records: Object[], queueUrl: string) {
    const batches = [];

    for (let i = 0; i < records.length; i += 10) {
      const batch = records.slice(i, i + 10);
      batches.push(batch);
    }

    // Send messages to SQS in batches
    for (const batch of batches) {
      console.log({ batch });
      const entries = batch.map((record, index) => ({
        Id: `${index + 1}`,
        MessageBody: JSON.stringify(record),
      }));

      const params = {
        Entries: entries,
        QueueUrl: queueUrl,
      };

      try {
        const command = new SendMessageBatchCommand(params);
        const response = await sqsClient.send(command);
        console.log('Batch sent successfully:', response);
      } catch (error) {
        console.error('Error sending batch:', error);
      }
    }
  }

  async function moveObject(
    sourceKey: string,
    destinationKey: string,
    bucket: string
  ): Promise<void> {
    // Copy the object to the new location
    await clientS3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `/${bucket}/${sourceKey}`,
        Key: destinationKey,
      })
    );

    // Delete the original object
    await clientS3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: sourceKey,
      })
    );
  }

  try {
    for (const record of event.Records) {
      // in there are multiple CSV files
      const bucket = record.s3.bucket.name;
      const key = record.s3.object.key;
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const getObjectCommandOutput = await clientS3.send(getObjectCommand);

      if (!getObjectCommandOutput) {
        console.log('NOTHING TO PARSE, no object');
      }

      const objectAsString =
        await getObjectCommandOutput.Body?.transformToString();

      if (objectAsString) {
        // validate CSV
        const validatioinResult = await CSVFileValidator(
          objectAsString,
          validatorConfig
        );

        if (validatioinResult.inValidData.length > 0) {
          console.error('Invalid file. Provide valid CSV file');
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
              message: `File ${key} is not CSV file. Provide valid CSV file.`,
            }),
          };
        }

        const s3Stream = stringToStream(objectAsString);
        const records: any[] = [];

        const endPromise = new Promise((resolve, reject) => {
          s3Stream
            .pipe(csv()) // Parse CSV using csv-parser
            .on('data', async (data: any) => {
              records.push(data);
              // Log each record to CloudWatch
              // console.log('CSV Record:', data);
              // 👇  - send each data record as message to SQS "catalogItemsQueue" from "ProductsService"
              // await sendMessageToSQS(data);
            })
            .on('end', async () => {
              try {
                console.log('move object from /uploads to /parsed');
                const parsedKey = `parsed/${key}`;
                await moveObject(key, parsedKey, bucket);
                resolve(records);
              } catch (error) {
                reject(error);
              }
            });
        });

        try {
          const records = (await endPromise) as Object[];
          console.log('After End: ', { records });
          await sendMessagesToSQS(
            records,
            process.env.CATALOG_ITEMS_QUEUE_URL as string
          );
        } catch (error) {
          console.error('Error processing CSV:', error);
        }
      } else {
        console.log('NOTHING TO PARSE, no such file OR file is empty');
      }
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        message: `File(s) parsed correctly`,
      }),
    };
  } catch (error) {
    console.error('PARSING  File:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        message: `Error parsing  File`,
      }),
    };
  }
};

function stringToStream(csvString: string): Readable {
  const stream = new Readable();
  stream._read = () => {}; // Necessary to implement _read method

  // Push the CSV string into the stream
  stream.push(csvString);
  stream.push(null); // Signal the end of the stream

  return stream;
}
