import { NextRequest, NextResponse } from "next/server";
import { createAssignmentWithRubric } from "@/lib/services/assignment.service";
import { CreateAssignmentSchema } from "@/lib/schemas/assignment.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createAssignmentWithRubric(parsed.data);

    if (result.error !== null) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (e) {
    console.error("POST /api/assignments error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
