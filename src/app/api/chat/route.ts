import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  generateText,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "@/prompt";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Allow streaming responses up to 120 seconds for video generation
export const maxDuration = 120;

const google = createGoogleGenerativeAI({});

export async function POST(req: Request) {
  const { model, messages }: { messages: UIMessage[]; model: string } =
    await req.json();

  const result = streamText({
    model: google(model),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      execute_python: tool({
        description:
          "Execute python code in a Jupyter notebook cell and return result",
        inputSchema: z.object({
          code: z
            .string()
            .describe("The python code to execute in a single cell"),
        }),
        execute: async ({ code }) => {
          const sandbox = await Sandbox.create();
          const { text, results, logs, error } = await sandbox.runCode(code);
          return { text, results, logs, error };
        },
      }),
      create_video: tool({
        description: "Create a video explanation of a concept using manim.",
        inputSchema: z.object({
          prompt: z.string().describe("The concept to explain in the video."),
        }),
        execute: async ({ prompt }) => {
          try {
            // 1. Generate Manim code from the prompt
            const manimPrompt = `
You are an expert in Manim. Your task is to generate a Python script for a Manim animation based on the user's prompt.
The script should contain a class named 'VideoScene' that inherits from 'Scene'.
The animation should be simple and clear, suitable for a short video explanation.
The final video will be 480p and 15fps, so keep the animations concise.
Do not include any code to render the scene, just the scene definition.

User's prompt: "${prompt}"

Your response should be only the python code, enclosed in \`\`\`python ... \`\`\`.
`;

            const { text: manimCodeResponse } = await generateText({
              model: google(model),
              prompt: manimPrompt,
            });

            const manimCode = manimCodeResponse.match(/```python\n([\s\S]*?)\n```/)?.[1] || "";
            if (!manimCode) {
              throw new Error("Failed to generate Manim code.");
            }

            // 2. Create a sandbox with the manim template
            const sandbox = await Sandbox.create({ template: "manim-sandbox" });

            // 3. Write the Manim script to a file
            const scriptPath = "/home/user/video_script.py";
            await sandbox.filesystem.write(scriptPath, manimCode);

            // 4. Run Manim to render the video
            const process = await sandbox.process.start({
              cmd: `python3 -m manim -ql ${scriptPath} VideoScene`,
            });
            const { stdout, stderr } = await process.wait();

            if (stderr) {
              console.error("Manim execution error:", stderr);
              if (stderr.includes("No scene found")) {
                throw new Error("Failed to render video: No scene found in the generated code. The LLM might have failed to generate a valid Manim script.");
              }
              throw new Error(`Failed to render video: ${stderr}`);
            }

            console.log("Manim execution output:", stdout);

            // 5. Find the video file path from manim's output
            const renderedFilePathMatch = stdout.match(/File ready at '([^']*)'/);
            if (!renderedFilePathMatch) {
              console.error("Could not find rendered file path in manim output:", stdout);
              throw new Error("Could not find the rendered video file path in Manim's output.");
            }
            const renderedFilePath = renderedFilePathMatch[1];


            // 6. Download the video file
            const remotePath = path.join("/home/user", renderedFilePath);
            const fileContentBuffer = await sandbox.downloadFile(remotePath);

            await sandbox.close();

            // 7. Save the video to the public directory
            const publicDir = path.join(process.cwd(), "public", "videos");
            await fs.mkdir(publicDir, { recursive: true });
            const videoFileName = `${uuidv4()}.mp4`;
            const localPath = path.join(publicDir, videoFileName);
            await fs.writeFile(localPath, fileContentBuffer);

            // 8. Return the public URL
            const videoUrl = `/videos/${videoFileName}`;
            return { videoUrl };

          } catch (error: any) {
            console.error("Error creating video:", error);
            return { error: error.message };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
