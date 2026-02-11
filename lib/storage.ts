import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function assertStorageEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!url || !serviceKey || !bucket) {
    return false;
  }

  if (!url.startsWith("https://") || url.includes("your-project.supabase.co")) {
    return false;
  }

  if (serviceKey === "your-service-role-key") {
    return false;
  }

  return true;
}

function getSupabaseClient() {
  const url = assertStorageEnv("SUPABASE_URL");
  const serviceKey = assertStorageEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function resolveExtension(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "bin";
}

async function uploadImageLocally(params: {
  file: File;
  deviceId: string;
}): Promise<{ imageUrl: string }> {
  const { file, deviceId } = params;
  const extension = resolveExtension(file.type);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const relativeDir = path.join("uploads", deviceId);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, fileName), bytes);

  return {
    imageUrl: `/${relativeDir}/${fileName}`,
  };
}

export async function uploadImageToCloud(params: {
  file: File;
  deviceId: string;
}): Promise<{ imageUrl: string }> {
  const { file, deviceId } = params;

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new Error("Unsupported image format");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image file is too large");
  }

  if (!isSupabaseConfigured()) {
    return uploadImageLocally({ file, deviceId });
  }

  try {
    const bucket = assertStorageEnv("SUPABASE_STORAGE_BUCKET");
    const client = getSupabaseClient();
    const extension = resolveExtension(file.type);
    const filePath = `letters/${deviceId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error("Failed to generate image URL");
    }

    return { imageUrl: data.publicUrl };
  } catch {
    return uploadImageLocally({ file, deviceId });
  }
}
