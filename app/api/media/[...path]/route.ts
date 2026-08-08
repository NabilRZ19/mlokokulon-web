import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const S3_ENDPOINT = process.env.S3_ENDPOINT;
if (!S3_ENDPOINT) {
  throw new Error("S3_ENDPOINT wajib diisi di environment variables.");
}

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: process.env.S3_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse("Missing media file path", { status: 400 });
  }

  const bucket = process.env.S3_BUCKET || "mlokokulon";

  // path bisa berupa ["mlokokulon", "media", "filename.jpg"] atau ["media", "filename.jpg"]
  let key = path.join("/");
  if (key.startsWith(`${bucket}/`)) {
    key = key.substring(bucket.length + 1);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const s3Response = await s3.send(command);

    if (!s3Response.Body) {
      return new NextResponse("File not found", { status: 404 });
    }

    const byteArray = await s3Response.Body.transformToByteArray();
    const contentType = s3Response.ContentType || "image/jpeg";

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[api/media] S3 GetObject error:", err);

    // Fallback direct HTTP fetch ke MinIO jika AWS S3 SDK mengalami kendala
    try {
      const s3Endpoint = (process.env.S3_ENDPOINT || "").replace(/\/$/, "");
      const directUrl = `${s3Endpoint}/${bucket}/${key}`;
      const res = await fetch(directUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (fetchErr) {
      console.error("[api/media] Fallback fetch error:", fetchErr);
    }

    return new NextResponse("Media file not found", { status: 404 });
  }
}
