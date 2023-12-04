import { S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
const csv = require('csv-parser');
import { Readable } from 'stream';

const REGION = 'us-east-1';
const BUCKET_NAME = 'import-service-s3-bucket-aws';
const KEY = 'uploaded/catalogCSV.csv';

export const handler = async (event: S3Event) => {
  console.log('PARSER Lambda call: ', event.Records);
  const clientS3 = new S3Client({ region: REGION });

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
        const s3Stream = stringToStream(objectAsString);
        // Parse CSV using csv-parser
        const results = [];
        s3Stream
          .pipe(csv())
          .on('data', (data: any) => {
            // Log each record to CloudWatch
            results.push(data);
            console.log('CSV Record:', data);
          })
          .on('end', async () => {
            console.log('CSV parsing finished.');
            //move object from /uploads to /parsed
            const parsedKey = `parsed/${key}`;
            await moveObject(key, parsedKey, bucket);
          });
      } else {
        console.log('NOTHING TO PARSE, no such file OR file is empty');
      }
    }
  } catch (error) {
    console.error('PARSING  File:', error);
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
