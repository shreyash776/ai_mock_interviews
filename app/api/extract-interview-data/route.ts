import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const transcript = messages.map((m: { content: string }) => m.content).join(" ");

  const prompt = `
Extract the following fields from this transcript:
- role
- level
- techstack
- type
- amount

Transcript:
${transcript}

Return as a JSON object with keys: role, level, techstack, type, amount.
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    const data = JSON.parse(text);
    return NextResponse.json({
      role: data.role || "",
      level: data.level || "",
      techstack: data.techstack || "",
      type: data.type || "",
      amount: Number(data.amount) || 3,
    });
  } catch (err) {
    console.error("Failed to parse interview data:", err);
    return NextResponse.json({
      role: "frontend",
      level: "entry",
      techstack: "react,typescript",
      type: "technical",
      amount: 3,
    });
  }
}
