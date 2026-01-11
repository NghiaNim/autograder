import { NextRequest, NextResponse } from "next/server";
import { createOrGetStudent } from "@/lib/actions/student.actions";
import { CreateStudentSchema } from "@/lib/schemas/student.schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createOrGetStudent(parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: 201 });
}
