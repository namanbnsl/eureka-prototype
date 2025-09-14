import { inngest } from "./inngest";
import { generateManimScript } from "./gemini";
import { renderManimVideo } from "./e2b";
import { uploadVideo } from "./uploadthing";

export const generateVideo = inngest.createFunction(
  { id: "generate-manim-video" },
  { event: "video/generate.request" },
  async ({ event, step }) => {
    const { prompt, userId, chatId } = event.data;

    console.log(`Starting video generation for prompt: "${prompt}"`);

    // Step 1: Generate Manim Python script
    const script = await step.run("generate-manim-script", async () => {
      return await generateManimScript({ prompt });
    });

    console.log("Generated Manim script", { scriptLength: script.length });

    // Step 2: Render script to MP4
    const videoPath = await step.run("render-manim-video", async () => {
      return await renderManimVideo({ script, prompt });
    });

    console.log("Rendered video to path:", videoPath);

    // Step 3: Upload video to storage
    const videoUrl = await step.run("upload-video", async () => {
      return await uploadVideo({ videoPath, userId });
    });

    console.log("Video uploaded successfully:", videoUrl);

    // Return the final result
    return {
      success: true,
      videoUrl,
      prompt,
      userId,
      chatId,
      generatedAt: new Date().toISOString(),
      scriptLength: script.length,
    };
  }
);
