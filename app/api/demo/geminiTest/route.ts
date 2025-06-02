import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Use Gemini to generate a response to the prompt
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"), // or your preferred model
      prompt: prompt || "Say hello from Gemini!",
    });

    return NextResponse.json({ success: true, response: text });
  } catch (error: any) {
    console.error("Gemini test error:", error);
    return NextResponse.json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: "Gemini test endpoint is live!" });
}
