import { NextRequest, NextResponse } from "next/server";
import { getAssignmentDetails } from "@/lib/services/assignment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getAssignmentDetails(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
