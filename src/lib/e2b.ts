import { Sandbox } from "@e2b/code-interpreter";

export interface RenderRequest {
  script: string;
  prompt: string;
}

export async function renderManimVideo({
  script,
  prompt,
}: RenderRequest): Promise<string> {
  let sandbox: Sandbox | null = null;

  try {
    // Create sandbox with extended timeout
    sandbox = await Sandbox.create("manim-sandbox-eureka-prototype", {
      timeoutMs: 300000, // 5 minutes
    });
    console.log("E2B sandbox created successfully");

    // Define paths
    const scriptPath = `/home/script.py`;
    const mediaDir = `/home/media`;
    const outputDir = `${mediaDir}/videos/MyScene/480p15`;

    // Write the Manim script
    await sandbox.files.write(scriptPath, script);
    console.log("Manim script written to sandbox");

    // Run manim directly as a command
    const proc = await sandbox.commands.run(
      `manim ${scriptPath} MyScene --media_dir ${mediaDir} -ql --disable_caching`
    );
    console.log("Manim process finished:", proc);

    // Verify success
    if (proc.exitCode !== 0) {
      throw new Error(
        `Manim failed with exit code ${proc.exitCode}\n${proc.stderr}`
      );
    }

    // List output directory
    const files = await sandbox.files.list(outputDir);
    console.log("Files in output directory:", files);

    const videoFiles = files.filter((file: any) => file.name.endsWith(".mp4"));
    if (videoFiles.length === 0) {
      throw new Error("No video file was generated");
    }

    const videoFile = videoFiles[0];
    const videoPath = `${outputDir}/${videoFile.name}`;
    console.log("Video file found:", videoPath);

    // Read file content
    const videoData = await sandbox.files.read(videoPath);

    // Convert to base64 for frontend
    const base64Data = Buffer.from(videoData).toString("base64");
    return `data:video/mp4;base64,${base64Data}`;
  } catch (error: any) {
    console.error("E2B sandbox rendering error:", error);
    throw new Error(`Failed to render Manim video: ${error.message}`);
  } finally {
    console.log("E2B sandbox will be closed by the framework");
  }
}
