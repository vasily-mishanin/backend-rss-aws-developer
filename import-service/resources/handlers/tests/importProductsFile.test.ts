import { importProductsFile } from '../importProductsFile';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('importProductsFile', () => {
  it('should return a valid response on success', async () => {
    // Mock S3Client and getSignedUrl
    const mockGetSignedUrl = jest.fn().mockResolvedValue('mocked-signed-url');
    (S3Client as jest.Mock).mockImplementation(() => ({}));
    require('@aws-sdk/s3-request-presigner').getSignedUrl = mockGetSignedUrl;

    // Call the function with mock data
    const result = await importProductsFile({ fileName: 'example.csv' });

    // Assert the result
    expect(result.statusCode).toBe(200);
    expect(result.headers).toBeDefined();
    expect(result.body).toBeDefined();
    const body = JSON.parse(result.body);
    expect(body.s3UploadSignedUrl).toBe('mocked-signed-url');
  });

  it('should return an error response on failure', async () => {
    // Mock S3Client and getSignedUrl to throw an error
    (S3Client as jest.Mock).mockImplementation(() => ({
      // you can add more specific mock behavior here if needed
    }));
    require('@aws-sdk/s3-request-presigner').getSignedUrl = jest
      .fn()
      .mockRejectedValue(new Error('mocked-error'));

    // Call the function with mock data
    const result = await importProductsFile({ fileName: 'example.csv' });

    expect(result.statusCode).toBe(500);
    expect(result.headers).toBeDefined();
    expect(result.body).toBeDefined();
    const body = JSON.parse(result.body);
    expect(body.message).toBe('ERROR create Signed Upload URL');
  });
});
