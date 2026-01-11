import { NextRequest, NextResponse } from "next/server";
import { submitAndGrade } from "@/lib/services/submission.service";
import { CreateSubmissionSchema } from "@/lib/schemas/submission.schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await submitAndGrade(parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: 201 });
}
