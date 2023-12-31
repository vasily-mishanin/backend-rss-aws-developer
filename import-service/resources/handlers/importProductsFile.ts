import { HEADERS } from '../constants';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = 'us-east-1';
const BUCKET_NAME = 'import-service-s3-bucket-aws';

export async function importProductsFile({ fileName }: { fileName: string }) {
  const KEY = `uploaded/${fileName}`;
  console.log('importProductsFile KEY ', KEY);

  if (!fileName.toLowerCase().endsWith('.csv')) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({
        message: `File ${fileName} is not CSV file. Provide valid CSV file.`,
      }),
    };
  }

  const createPresignedUrlWithClient = ({
    region,
    bucket,
    key,
  }: {
    region: string;
    bucket: string;
    key: string;
  }) => {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  };

  try {
    const clientUrl = await createPresignedUrlWithClient({
      region: REGION,
      bucket: BUCKET_NAME,
      key: KEY,
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ s3UploadSignedUrl: clientUrl }),
    };
  } catch (err) {
    console.error('ERROR create Signed Upload URL: ', err);

    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: 'ERROR create Signed Upload URL' }),
    };
  }
}
