import { createServerClient } from "@/lib/supabase/server";
import { Submission, CreateSubmissionInput } from "@/lib/schemas/submission.schema";
import { Result, ok, err } from "@/lib/utils/result";

export async function insertSubmission(
  input: CreateSubmissionInput
): Promise<Result<Submission>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("submissions")
    .insert(input)
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Submission);
}

export async function getSubmissionsByAssignment(
  assignmentId: string
): Promise<Result<Submission[]>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: true });

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Submission[]);
}

export async function getSubmissionsByStudent(
  assignmentId: string,
  studentId: string
): Promise<Result<Submission[]>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .order("problem_index", { ascending: true });

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Submission[]);
}
