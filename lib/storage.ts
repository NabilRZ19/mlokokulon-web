import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// MinIO S3-compatible, VPS milik teman. forcePathStyle wajib true buat MinIO (bukan AWS S3 asli).
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadToStorage(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
}
