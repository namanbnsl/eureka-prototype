// import { UTApi } from "uploadthing/server";
// import { writeFile, unlink } from "fs/promises";

// const utapi = new UTApi();

// export interface UploadRequest {
//   videoPath: string;
//   userId: string;
// }

// export async function uploadVideo({
//   videoPath,
//   userId,
// }: UploadRequest): Promise<string> {
//   try {
//     console.log(`Uploading video from path: ${videoPath}`);
//     let tempFilePath: string;
//     let shouldDeleteFile = false;

//     // Check if videoPath is a base64 data URL
//     if (videoPath.startsWith("data:video/mp4;base64,")) {
//       // Convert base64 to file
//       const base64Data = videoPath.replace("data:video/mp4;base64,", "");
//       const buffer = Buffer.from(base64Data, "base64");
//       tempFilePath = `/tmp/upload_video_${Date.now()}.mp4`;
//       await writeFile(tempFilePath, buffer);
//       shouldDeleteFile = true;
//       console.log("Converted base64 to temporary file for upload");
//     } else {
//       // Use the provided file path
//       tempFilePath = videoPath;
//       shouldDeleteFile = false; // Don't delete user-provided files
//     }

//     // Upload to UploadThing
//     const fileBuffer = require("fs").readFileSync(tempFilePath);
//     const file = new File([fileBuffer], `manim_video_${Date.now()}.mp4`, {
//       type: "video/mp4",
//     });

//     const response = await utapi.uploadFiles([file]);

//     if (!response || response.length === 0 || !response[0].data) {
//       throw new Error("Failed to upload video to UploadThing");
//     }

//     const uploadUrl = response[0].data.url;
//     console.log(`Video uploaded successfully: ${uploadUrl}`);

//     // Clean up the temporary file if we created it
//     if (shouldDeleteFile) {
//       try {
//         await unlink(tempFilePath);
//         console.log("Temporary file cleaned up");
//       } catch (cleanupError) {
//         console.error("Failed to clean up temporary file:", cleanupError);
//       }
//     }

//     return uploadUrl;
//   } catch (error) {
//     console.error("Upload failed:", error);

//     // Don't try to delete if it's a data URL (no file to delete)
//     if (videoPath && !videoPath.startsWith("data:")) {
//       try {
//         await unlink(videoPath);
//       } catch (cleanupError) {
//         console.error(
//           "Failed to clean up temporary file after error:",
//           cleanupError
//         );
//       }
//     }

//     throw new Error(`Video upload failed: ${(error as Error).message}`);
//   }
// }
import { UTApi } from "uploadthing/server";
import { writeFile, unlink, readFile } from "fs/promises";

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

    // Read the file as buffer
    const fileBuffer = await readFile(tempFilePath);

    // Create File object with proper name - convert Buffer to Uint8Array
    const fileName = `manim_video_${userId}_${Date.now()}.mp4`;
    const file = new File([new Uint8Array(fileBuffer)], fileName, {
      type: "video/mp4",
    });

    // Upload to UploadThing
    console.log("Starting upload to UploadThing...");
    const response = await utapi.uploadFiles([file]);

    // Check if upload was successful
    if (!response || response.length === 0) {
      throw new Error("No response from UploadThing");
    }

    const uploadResult = response[0];
    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error.message}`);
    }

    if (!uploadResult.data) {
      throw new Error("Upload succeeded but no data returned");
    }

    const uploadUrl = uploadResult.data.url;
    console.log(`Video uploaded successfully: ${uploadUrl}`);

    // Clean up the temporary file if we created it
    if (shouldDeleteFile) {
      try {
        await unlink(tempFilePath);
        console.log("Temporary file cleaned up");
      } catch (cleanupError) {
        console.error("Failed to clean up temporary file:", cleanupError);
      }
    }

    return uploadUrl;
  } catch (error) {
    console.error("Upload failed:", error);

    // Clean up temporary file if it was created from base64
    if (videoPath.startsWith("data:video/mp4;base64,")) {
      const tempFilePath = `/tmp/upload_video_${Date.now()}.mp4`;
      try {
        await unlink(tempFilePath);
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
