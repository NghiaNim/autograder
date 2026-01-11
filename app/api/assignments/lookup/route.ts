import { NextRequest, NextResponse } from "next/server";
import { getAssignmentByShareCode } from "@/lib/actions/assignment.actions";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid share code" }, { status: 400 });
  }

  const result = await getAssignmentByShareCode(code);

  if (result.error !== null) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ id: result.data.id, title: result.data.title });
}
