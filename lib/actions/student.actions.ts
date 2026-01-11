import { createServerClient } from "@/lib/supabase/server";
import { Student, CreateStudentInput } from "@/lib/schemas/student.schema";
import { Result, ok, err } from "@/lib/utils/result";

export async function createOrGetStudent(
  input: CreateStudentInput
): Promise<Result<Student>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("students")
    .insert({ name: input.name })
    .select()
    .single();

  if (error) {
    return err(error.message, 500);
  }

  return ok(data as Student);
}

export async function getStudentById(id: string): Promise<Result<Student>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return err(error.message, 404);
  }

  return ok(data as Student);
}
