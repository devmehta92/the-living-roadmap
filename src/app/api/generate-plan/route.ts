import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import type { Milestone } from "@/lib/types/goal";

const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["Study", "Practice", "Rest", "Review"]),
  status: z.enum(["pending", "completed"]),
  estimatedMinutes: z.number().int().nonnegative(),
  estimatedHours: z.number().nonnegative(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  deliverable: z.string(),
  steps: z.array(z.string()),
  tips: z.array(z.string()),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    })
  ),
});

const GeneratePlanSchema = z.object({
  milestones: z.array(MilestoneSchema),
  summary: z.string(),
});

const RequestSchema = z.object({
  goalTitle: z.string().min(1),
  timeframe: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
  }),
  intensity: z.enum(["Casual", "Standard", "Intense"]),
  remainingMilestones: z.array(MilestoneSchema).optional(),
});

const SystemPrompt = [
  "You are a world-class strategic coach.",
  "Return ONLY valid JSON that matches this exact schema:",
  "{",
  '  "milestones": [',
  "    {",
  '      "id": "m1",',
  '      "title": "string",',
  '      "description": "string",',
  '      "category": "Study" | "Practice" | "Rest" | "Review",',
  '      "status": "pending",',
  '      "estimatedMinutes": 45,',
  '      "estimatedHours": 0.75,',
  '      "difficulty": "Easy" | "Medium" | "Hard",',
  '      "deliverable": "string",',
  '      "steps": ["string"],',
  '      "tips": ["string"],',
  '      "resources": [{"title": "string", "url": "https://..."}]',
  "    }",
  "  ],",
  '  "summary": "string"',
  "}",
  "Rules:",
  "- Use only the allowed category and difficulty values.",
  "- Always include all fields, even if short.",
  "- Provide 2-5 steps and 1-3 tips per milestone.",
  "- Provide 1-3 resources with real URLs.",
  "- Do NOT include dueDate, timeEstimate, or any extra fields.",
  "- Always return raw JSON, no code fences.",
  "- Reverse engineer the plan from the deadline back to today.",
  "- Include at least one Review milestone.",
].join("\n");

const stripCodeFences = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }
  const lines = trimmed.split("\n");
  const withoutFenceStart = lines.slice(1);
  const fenceEndIndex = withoutFenceStart.findIndex((line) =>
    line.trim().startsWith("```")
  );
  const body =
    fenceEndIndex >= 0
      ? withoutFenceStart.slice(0, fenceEndIndex)
      : withoutFenceStart;
  return body.join("\n").trim();
};

const parseJsonContent = (content: string) => {
  const stripped = stripCodeFences(content);
  try {
    return JSON.parse(stripped);
  } catch (error) {
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const slice = stripped.slice(firstBrace, lastBrace + 1);
      return JSON.parse(slice);
    }
    throw error;
  }
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = RequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SystemPrompt },
        {
          role: "user",
          content: JSON.stringify(parsedBody.data),
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    console.info("LLM response excerpt:", content.slice(0, 400));
    let parsed: unknown;

    try {
      parsed = parseJsonContent(content);
    } catch (error) {
      console.error("Invalid JSON from LLM", error, {
        excerpt: content.slice(0, 400),
      });
      return NextResponse.json(
        { error: "LLM returned invalid JSON." },
        { status: 422 }
      );
    }

    const validated = GeneratePlanSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn("LLM schema issues:", validated.error.issues);
      return NextResponse.json(
        {
          error: "LLM response failed schema validation.",
          issues: validated.error.issues,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "LLM processing failed." },
      { status: 500 }
    );
  }
}
