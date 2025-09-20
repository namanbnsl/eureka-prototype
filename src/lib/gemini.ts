import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export interface ManimScriptRequest {
  prompt: string;
}

export interface ManimScript {
  code: string;
}

export async function generateManimScript({
  prompt,
}: ManimScriptRequest): Promise<string> {
  const model = google("gemini-2.5-pro");

  const systemPrompt = `
You are a Manim animation expert. Generate Python code for a Manim Community v0.18.0 animation based on the user's request.

Requirements:
- Return ONLY the complete Python code, nothing else
- DO NOT DO 3D things for now.
- KEEP THE CODE SIMPLE.
- USE SIMPLE COLORS. NO NEED TO USE COMPLEX COLORS.
- Use manim's Scene class and construct()
- Include all necessary imports
- Create a single, meaningful animation
- Ensure syntax is valid Python
- Use Manim's best practices for smooth animations
- ALWAYS USE THE NAME "MyScene" for all scenes just like the example. DO NOT CHANGE IT.

Example structure:
from manim import *

class MyScene(Scene):
    def construct(self):
        # Your animation code here
        pass

Common objects: Text, Circle, Rectangle, Line, Arrow
Common animations: self.play(), self.add(), self.wait()
`;

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: `User request: ${prompt}\n\nGenerate the complete Manim script:`,
  });

  // Extract code from potential markdown formatting
  const code = text
    .replace(/```python?\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return code;
}
