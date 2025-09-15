import { createResource } from "@/lib/actions/resources";
// import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embedding";
import { env } from "@/lib/env.mjs";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // const model = openai("gpt-4o")
  //   const model = google(env.GOOGLE_GENERATIVE_AI_MODEL);
  const model = google("gemini-2.5-flash");

  const result = streamText({
    model: model,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
