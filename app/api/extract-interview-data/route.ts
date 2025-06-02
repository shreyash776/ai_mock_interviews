import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const transcript = messages.map((m) => m.content).join(" ");

  const prompt = `
Extract the following fields from this transcript:
- role
- level
- techstack
- type
- amount

Transcript:
${transcript}

Return ONLY a valid JSON object, with no extra text, formatted exactly like:
{"role": "...", "level": "...", "techstack": "...", "type": "...", "amount": 3}
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Extract the first JSON object from the response
    const jsonMatch = text.match(/{[\s\S]*}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const responseData = {
      role: data.role || "",
      level: data.level || "",
      techstack: data.techstack || "",
      type: data.type || "",
      amount: Number(data.amount) || 3,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    // console.error("Failed to parse interview data:", err);
    const fallbackData = {
      role: "frontend",
      level: "entry",
      techstack: "react,typescript",
      type: "technical",
      amount: 3,
    };
    return NextResponse.json(fallbackData);
  }
}
