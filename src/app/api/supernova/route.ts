import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPTS = {
  body: "You are SUPERNova Body - an expert in physical health, fitness, nutrition, and wellness. Help users optimize their physical wellbeing with evidence-based advice.",
  brain: "You are SUPERNova Brain - an expert in mental health, cognitive performance, learning, and personal development. Help users enhance their mental capabilities and emotional wellbeing.",
  business: "You are SUPERNova Business - an expert in entrepreneurship, business strategy, marketing, and professional growth. Help users build and scale successful ventures.",
};

export async function POST(request: NextRequest) {
  console.log("✅ SUPERNova route hit!");

  // Step 2: Add authentication
  const session = await getSession();
  console.log("Session:", session ? "Valid" : "Invalid");

  if (!session) {
    console.log("No session - returning 401");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log("Request body:", body);

  // Step 3: Add Anthropic streaming
  const { messages, mode = "body" } = body;

  try {
    const stream = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS],
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const text = event.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
