import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getRequiredEnv } from "./env";

let client: S3Client | null = null;

function getR2Client() {
  if (client) return client;

  client = new S3Client({
    region: "auto",
    endpoint: `https://${getRequiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return client;
}

export function getR2Bucket() {
  return getRequiredEnv("R2_BUCKET");
}

export function getStorageUrl(key: string) {
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!publicBaseUrl) return `r2://${getR2Bucket()}/${key}`;
  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

export function createStorageKey(userId: string, folderId: string, fileId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${userId}/${folderId}/${fileId}-${safeName}`;
}

export async function createUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 10 },
  );
}

export async function createDownloadUrl(key: string, fileName: string) {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName.replace(/"/g, "")}"`,
    }),
    { expiresIn: 60 * 5 },
  );
}

export async function createPreviewUrl(key: string, fileName: string) {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      ResponseContentDisposition: `inline; filename="${fileName.replace(/"/g, "")}"`,
    }),
    { expiresIn: 60 * 5 },
  );
}

export async function verifyObject(key: string, expectedBytes: number) {
  const result = await getR2Client().send(
    new HeadObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    }),
  );
  return result.ContentLength === expectedBytes;
}

export async function deleteObject(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    }),
  );
}
