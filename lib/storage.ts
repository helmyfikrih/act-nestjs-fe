import { getAccessToken } from "./auth";

/**
 * Gets a presigned URL for uploading a file to MinIO temp storage.
 */
export async function getUploadUrl(fileName: string, contentType: string, bucket?: string) {
  const token = getAccessToken();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/storage/upload-url`);
  url.searchParams.append("fileName", fileName);
  url.searchParams.append("contentType", contentType);
  if (bucket) url.searchParams.append("bucket", bucket);

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to get upload URL");
  }

  return res.json() as Promise<{ uploadUrl: string, key: string }>;
}

/**
 * Uploads a file directly to a presigned URL.
 */
export async function uploadToPresignedUrl(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to upload file to storage");
  }

  return true;
}

/**
 * Combined helper to handle the full direct upload flow.
 * Returns the temporary key to be sent to the backend.
 */
export async function uploadFileToTemp(file: File, bucket?: string): Promise<string> {
  const { uploadUrl, key } = await getUploadUrl(file.name, file.type, bucket);
  await uploadToPresignedUrl(uploadUrl, file);
  return key;
}
