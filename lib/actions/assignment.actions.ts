import { createServerClient } from "@/lib/supabase/server";
import { Assignment, CreateAssignmentInput } from "@/lib/schemas/assignment.schema";
import { Result, ok, err } from "@/lib/utils/result";

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function insertAssignment(
  input: CreateAssignmentInput
): Promise<Result<Assignment>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      ...input,
      share_code: generateShareCode(),
    })
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Assignment);
}

export async function getAssignmentById(id: string): Promise<Result<Assignment>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return err(error.message, 404);
  }

  return ok(data as Assignment);
}

export async function getAssignmentByShareCode(
  shareCode: string
): Promise<Result<Assignment>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("share_code", shareCode.toUpperCase())
    .single();

  if (error) {
    return err("Assignment not found", 404);
  }

  return ok(data as Assignment);
}

export async function getAssignmentWithRubric(
  id: string
): Promise<Result<Assignment & { rubric: unknown }>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*, rubrics(*)")
    .eq("id", id)
    .single();

  if (error) {
    return err(error.message, 404);
  }

  return ok(data as Assignment & { rubric: unknown });
}
