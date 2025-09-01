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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({});

export async function POST(req: Request) {
  const { model, messages }: { messages: UIMessage[]; model: string } =
    await req.json();

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
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
