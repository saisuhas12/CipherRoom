import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageDeleteResult } from "./types";

let r2ClientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (r2ClientInstance) return r2ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY)."
    );
  }

  r2ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2ClientInstance;
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Missing R2_BUCKET_NAME environment variable.");
  }
  return bucket;
}

/**
 * Generate a short-lived presigned PUT URL for Cloudflare R2.
 * Pins the exact Content-Type to prevent client tampering.
 * Default expiry: 300 seconds (5 minutes).
 */
export async function createR2PresignedUploadUrl(
  storagePath: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storagePath,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a short-lived presigned GET URL for Cloudflare R2 download/preview.
 * Default expiry: 3600 seconds (1 hour).
 */
export async function createR2PresignedDownloadUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storagePath,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Delete a specific object from Cloudflare R2.
 * Idempotent: If object is already gone, returns { success: true, alreadyGone: true }.
 */
export async function deleteR2Object(
  storagePath: string
): Promise<StorageDeleteResult> {
  try {
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: storagePath,
    });

    await client.send(command);
    return { success: true };
  } catch (err: unknown) {
    const errorName = (err as { name?: string })?.name;
    const statusCode = (err as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;

    // Treat 404 / NoSuchKey as already gone (success)
    if (errorName === "NoSuchKey" || errorName === "NotFound" || statusCode === 404) {
      return { success: true, alreadyGone: true };
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[R2] Delete failed for ${storagePath}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if an object exists in Cloudflare R2.
 */
export async function checkR2ObjectExists(
  storagePath: string
): Promise<boolean> {
  try {
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: storagePath,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete all objects in Cloudflare R2 under a specific prefix (e.g. `${roomId}/`).
 * Used during room cleanup to catch any stray/orphaned unconfirmed uploads scoped strictly to that room.
 */
export async function deleteR2Prefix(
  prefix: string
): Promise<{ deletedCount: number; errors: string[] }> {
  const client = getR2Client();
  const bucket = getBucketName();
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;

  let continuationToken: string | undefined = undefined;
  let deletedCount = 0;
  const errors: string[] = [];

  try {
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      });

      const listResponse: ListObjectsV2CommandOutput = await client.send(listCommand);
      const objects = listResponse.Contents || [];

      for (const obj of objects) {
        if (obj.Key) {
          const deleteResult = await deleteR2Object(obj.Key);
          if (deleteResult.success) {
            deletedCount++;
          } else if (deleteResult.error) {
            errors.push(`Failed to delete ${obj.Key}: ${deleteResult.error}`);
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[R2] Failed to list/delete prefix ${normalizedPrefix}:`, errorMessage);
    errors.push(errorMessage);
  }

  return { deletedCount, errors };
}
