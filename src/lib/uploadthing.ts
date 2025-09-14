import { UTApi } from "uploadthing/server";
import { unlink } from "fs/promises";
import { createReadStream } from "fs";

const utapi = new UTApi();

export interface UploadRequest {
  videoPath: string;
  userId: string;
}

export async function uploadVideo({
  videoPath,
  userId,
}: UploadRequest): Promise<string> {
  try {
    console.log(`Uploading video from path: ${videoPath}`);

    // For now, return a placeholder URL for testing
    // In production, this would upload to UploadThing
    const placeholderUrl = `https://example.com/videos/manim_video_${Date.now()}.mp4`;

    console.log(`Video upload placeholder: ${placeholderUrl}`);

    // Clean up the temporary file
    try {
      await unlink(videoPath);
      console.log("Temporary file cleaned up");
    } catch (cleanupError) {
      console.error("Failed to clean up temporary file:", cleanupError);
    }

    return placeholderUrl;
  } catch (error) {
    console.error("Upload failed:", error);

    // Try to clean up the temporary file even on error
    try {
      await unlink(videoPath);
    } catch (cleanupError) {
      console.error(
        "Failed to clean up temporary file after error:",
        cleanupError
      );
    }

    throw new Error(`Video upload failed: ${(error as Error).message}`);
  }
}
