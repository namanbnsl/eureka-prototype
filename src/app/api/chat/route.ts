import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "@/prompt";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "@/lib/inngest";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({});

export async function POST(req: Request) {
  const { model, messages }: { messages: UIMessage[]; model: string } =
    await req.json();

  // Video generation is now handled by the generate_video tool

  const result = streamText({
    model: google(model),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      // Define a tool that runs code in a sandbox
      execute_python: tool({
        description:
          "Execute python code in a Jupyter notebook cell and return result",
        inputSchema: z.object({
          code: z
            .string()
            .describe("The python code to execute in a single cell"),
        }),
        execute: async ({ code }) => {
          // Create a sandbox, execute LLM-generated code, and return the result
          const sandbox = await Sandbox.create();
          const { text, results, logs, error } = await sandbox.runCode(code);
          return { text, results, logs, error };
        },
      }),
      // Define a tool for generating Manim animation videos
      generate_video: tool({
        description:
          "Generate a Manim animation video based on the user's description. Use this when users ask for animations, drawings, graphics, or video creation.",
        inputSchema: z.object({
          description: z
            .string()
            .describe(
              "A clear description of the animation or video to create"
            ),
        }),
        execute: async ({ description }) => {
          console.log("Starting video generation for:", description);

          // Dispatch background job to Inngest
          await inngest.send({
            name: "video/generate.request",
            data: {
              prompt: description,
              userId: "anonymous", // You can replace this with actual user ID
              chatId: Date.now().toString(), // Generate a chat ID
            },
          });

          return {
            status: "generating",
            message:
              "🎬 Generating your video animation... This may take a few minutes. The video will be displayed once ready.",
            description,
            timestamp: new Date().toISOString(),
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
