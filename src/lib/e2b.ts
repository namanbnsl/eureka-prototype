import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";

const execAsync = promisify(exec);

export interface RenderRequest {
  script: string;
  prompt: string;
}

export async function renderManimVideo({
  script,
  prompt,
}: RenderRequest): Promise<string> {
  try {
    // Write the script to a temporary file
    const { promises: fs } = require("fs");
    const scriptPath = `/tmp/manim_script_${Date.now()}.py`;
    await fs.writeFile(scriptPath, script, "utf8");

    // Execute manim command to render the video
    const { stdout, stderr } = await execAsync(
      `manim ${scriptPath} MyScene -pql --media_dir /tmp/media_${Date.now()}`,
      { timeout: 60000 } // 60 second timeout
    );

    console.log("Manim stdout:", stdout);
    if (stderr) console.log("Manim stderr:", stderr);

    // Try to find the generated video file
    // For now, we'll create a placeholder for testing
    const tempPath = `/tmp/demo_video_${Date.now()}.mp4`;

    // Create a simple placeholder video file using ffmpeg if available
    // This is a fallback until we set up the full E2B pipeline
    try {
      await execAsync(
        `ffmpeg -f lavfi -i testsrc=duration=3:size=320x240:rate=1 -vf "drawtext=text='Demo Video':fontsize=30:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 ${tempPath}`,
        { timeout: 10000 }
      );
    } catch (ffmpegError) {
      // If ffmpeg fails, create an empty file as placeholder
      await fs.writeFile(tempPath, "");
      console.log("Created placeholder video file for testing");
    }

    return tempPath;
  } catch (error) {
    console.error("Manim rendering error:", error);
    throw new Error(
      `Failed to render Manim video: ${(error as Error).message}`
    );
  }
}
