import { HEADERS } from '../constants';
//import https from 'https';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
//import { fromIni } from '@aws-sdk/credential-providers';
//import { HttpRequest } from '@smithy/protocol-http';
import {
  getSignedUrl,
  S3RequestPresigner,
} from '@aws-sdk/s3-request-presigner';
// import { parseUrl } from '@smithy/url-parser';
// import { formatUrl } from '@aws-sdk/util-format-url';
// import { Hash } from '@smithy/hash-node';

const REGION = 'us-east-1';
const BUCKET_NAME = 'import-service-s3-bucket-aws';

export async function importProductsFile({ fileName }: { fileName: string }) {
  const KEY = `uploaded/${fileName}`;
  console.log('importProductsFile KEY ', KEY);

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
