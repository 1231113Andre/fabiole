import { S3Client } from "@aws-sdk/client-s3";
import { Logger } from "./utils/logger";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
    Logger.warn('System', "Storage Configuration: Cloudflare R2 credentials are not fully provisioned. Artifact storage services may be unavailable.");
}

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "fabiole-app-avatars";
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
