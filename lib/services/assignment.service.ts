import { insertAssignment, getAssignmentById } from "@/lib/actions/assignment.actions";
import { insertRubric, getRubricByAssignmentId } from "@/lib/actions/rubric.actions";
import { generateAssignment } from "@/lib/actions/llm.actions";
import { CreateAssignmentInput, Assignment } from "@/lib/schemas/assignment.schema";
import { Rubric } from "@/lib/schemas/rubric.schema";
import { Result, ok, err } from "@/lib/utils/result";

type AssignmentWithRubric = Assignment & { rubric: Rubric };

export async function createAssignmentWithRubric(
  input: CreateAssignmentInput
): Promise<Result<AssignmentWithRubric>> {
  const assignment = await insertAssignment(input);
  if (assignment.error !== null) return assignment;

  const generated = await generateAssignment({
    title: input.title,
    description: input.description,
  });
  if (generated.error !== null) return generated;

  const rubric = await insertRubric(
    assignment.data.id,
    generated.data.rubric.criteria,
    generated.data.problems,
    generated.data.rubric.total_points
  );
  if (rubric.error !== null) return rubric;

  return ok({
    ...assignment.data,
    rubric: rubric.data,
  });
}

export async function getAssignmentDetails(
  id: string
): Promise<Result<AssignmentWithRubric>> {
  const assignment = await getAssignmentById(id);
  if (assignment.error !== null) return assignment;

  const rubric = await getRubricByAssignmentId(id);
  if (rubric.error !== null) {
    return err("Rubric not found", 404);
  }

  return ok({
    ...assignment.data,
    rubric: rubric.data,
  });
}
