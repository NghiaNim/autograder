import { createServerClient } from "@/lib/supabase/server";
import { Score } from "@/lib/schemas/score.schema";
import { Result, ok, err } from "@/lib/utils/result";

export async function insertScore(input: {
  submission_id: string;
  rubric_id: string;
  points_earned: number;
  feedback: string;
}): Promise<Result<Score>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("scores")
    .insert(input)
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Score);
}

export async function getScoresByAssignment(
  assignmentId: string
): Promise<Result<Array<Score & { submission: { student_id: string; problem_index: number } }>>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("scores")
    .select(`
      *,
      submissions!inner(student_id, problem_index, assignment_id)
    `)
    .eq("submissions.assignment_id", assignmentId);

  if (error) {
    return err(error.message, 500);
  }

  return ok(
    data.map((d) => ({
      ...d,
      submission: {
        student_id: d.submissions.student_id,
        problem_index: d.submissions.problem_index,
      },
    }))
  );
}
