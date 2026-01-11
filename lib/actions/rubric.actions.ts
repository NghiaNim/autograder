import { createServerClient } from "@/lib/supabase/server";
import { Rubric, Criterion, Problem, UpdateRubricInput } from "@/lib/schemas/rubric.schema";
import { Result, ok, err } from "@/lib/utils/result";

export async function insertRubric(
  assignmentId: string,
  criteria: Criterion[],
  problems: Problem[],
  totalPoints: number
): Promise<Result<Rubric>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("rubrics")
    .insert({
      assignment_id: assignmentId,
      criteria,
      problems,
      total_points: totalPoints,
    })
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Rubric);
}

export async function getRubricByAssignmentId(
  assignmentId: string
): Promise<Result<Rubric>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("rubrics")
    .select("*")
    .eq("assignment_id", assignmentId)
    .single();

  if (error) {
    return err(error.message, 404);
  }

  return ok(data as Rubric);
}

export async function updateRubric(
  assignmentId: string,
  input: UpdateRubricInput
): Promise<Result<Rubric>> {
  const supabase = await createServerClient();

  const updateData: Record<string, unknown> = {
    criteria: input.criteria,
    total_points: input.total_points,
    updated_at: new Date().toISOString(),
  };

  if (input.problems) {
    updateData.problems = input.problems;
  }

  const { data, error } = await supabase
    .from("rubrics")
    .update(updateData)
    .eq("assignment_id", assignmentId)
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Rubric);
}
