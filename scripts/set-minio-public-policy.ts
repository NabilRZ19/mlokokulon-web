import { readFileSync } from "fs";
import { resolve } from "path";
import { S3Client, PutBucketPolicyCommand } from "@aws-sdk/client-s3";

async function main() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  const bucket = process.env.S3_BUCKET || "mlokokulon";

  const publicPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };

  console.log(`Setting public read policy for MinIO bucket: '${bucket}'...`);

  await s3.send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(publicPolicy),
    })
  );

  console.log(`SUCCESS! MinIO bucket '${bucket}' is now publicly readable.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to set MinIO bucket policy:", err);
    process.exit(1);
  });
