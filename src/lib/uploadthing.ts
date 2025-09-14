import { UTApi } from "uploadthing/server";
import { writeFile, unlink } from "fs/promises";

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
    let tempFilePath: string;
    let shouldDeleteFile = false;

    // Check if videoPath is a base64 data URL
    if (videoPath.startsWith("data:video/mp4;base64,")) {
      // Convert base64 to file
      const base64Data = videoPath.replace("data:video/mp4;base64,", "");
      const buffer = Buffer.from(base64Data, "base64");
      tempFilePath = `/tmp/upload_video_${Date.now()}.mp4`;
      await writeFile(tempFilePath, buffer);
      shouldDeleteFile = true;
      console.log("Converted base64 to temporary file for upload");
    } else {
      // Use the provided file path
      tempFilePath = videoPath;
      shouldDeleteFile = false; // Don't delete user-provided files
    }

    // For now, return a placeholder URL for testing
    // In production, this would upload to UploadThing
    const placeholderUrl = `https://example.com/videos/manim_video_${Date.now()}.mp4`;

    console.log(`Video upload placeholder: ${placeholderUrl}`);

    // Clean up the temporary file if we created it
    if (shouldDeleteFile) {
      try {
        await unlink(tempFilePath);
        console.log("Temporary file cleaned up");
      } catch (cleanupError) {
        console.error("Failed to clean up temporary file:", cleanupError);
      }
    }

    return placeholderUrl;
  } catch (error) {
    console.error("Upload failed:", error);

    // Don't try to delete if it's a data URL (no file to delete)
    if (videoPath && !videoPath.startsWith("data:")) {
      try {
        await unlink(videoPath);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up temporary file after error:",
          cleanupError
        );
      }
    }

    throw new Error(`Video upload failed: ${(error as Error).message}`);
  }
}
