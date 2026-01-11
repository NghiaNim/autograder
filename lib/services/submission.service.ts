import { insertSubmission, getSubmissionsByAssignment } from "@/lib/actions/submission.actions";
import { insertScore, getScoresByAssignment } from "@/lib/actions/score.actions";
import { getRubricByAssignmentId } from "@/lib/actions/rubric.actions";
import { getAssignmentById } from "@/lib/actions/assignment.actions";
import { gradeSubmission } from "@/lib/actions/llm.actions";
import { CreateSubmissionInput, Submission } from "@/lib/schemas/submission.schema";
import { Result, ok, err } from "@/lib/utils/result";

type SubmissionWithScore = Submission & {
  score: { points_earned: number; total_points: number };
};

export async function submitAndGrade(
  input: CreateSubmissionInput
): Promise<Result<SubmissionWithScore>> {
  const submission = await insertSubmission(input);
  if (submission.error !== null) return submission;

  const assignment = await getAssignmentById(input.assignment_id);
  if (assignment.error !== null) return assignment;

  const rubric = await getRubricByAssignmentId(input.assignment_id);
  if (rubric.error !== null) return rubric;

  const imageUrl = input.whiteboard_data.image_url;
  if (!imageUrl) {
    return err("Whiteboard image required for grading", 400);
  }

  const problem = rubric.data.problems?.[input.problem_index];
  const problemQuestion = problem?.question || assignment.data.description;

  const gradeResult = await gradeSubmission(
    rubric.data.criteria,
    rubric.data.total_points,
    problemQuestion,
    imageUrl
  );

  if (gradeResult.error !== null) {
    return err(gradeResult.error, gradeResult.status);
  }

  const score = await insertScore({
    submission_id: submission.data.id,
    rubric_id: rubric.data.id,
    points_earned: gradeResult.data.total_earned,
    feedback: gradeResult.data.overall_feedback,
  });

  if (score.error !== null) return score;

  return ok({
    ...submission.data,
    score: {
      points_earned: score.data.points_earned,
      total_points: rubric.data.total_points,
    },
  });
}

type StudentReport = {
  id: string;
  name: string;
  problems_completed: number;
  total_problems: number;
  total_score: number;
  max_score: number;
  submitted_at: string | null;
};

type AssignmentReport = {
  assignment: { id: string; title: string; total_points: number };
  students: StudentReport[];
};

export async function getAssignmentReport(
  assignmentId: string
): Promise<Result<AssignmentReport>> {
  const assignment = await getAssignmentById(assignmentId);
  if (assignment.error !== null) return assignment;

  const rubric = await getRubricByAssignmentId(assignmentId);
  if (rubric.error !== null) return rubric;

  const submissions = await getSubmissionsByAssignment(assignmentId);
  if (submissions.error !== null) return submissions;

  const scores = await getScoresByAssignment(assignmentId);
  if (scores.error !== null) return scores;

  const studentMap = new Map<
    string,
    {
      problems: Set<number>;
      totalScore: number;
      lastSubmission: string;
      name: string;
    }
  >();

  for (const sub of submissions.data) {
    if (!studentMap.has(sub.student_id)) {
      studentMap.set(sub.student_id, {
        problems: new Set(),
        totalScore: 0,
        lastSubmission: sub.submitted_at,
        name: "",
      });
    }
    const entry = studentMap.get(sub.student_id)!;
    entry.problems.add(sub.problem_index);
    if (sub.submitted_at > entry.lastSubmission) {
      entry.lastSubmission = sub.submitted_at;
    }
  }

  for (const score of scores.data) {
    const studentId = score.submission.student_id;
    const entry = studentMap.get(studentId);
    if (entry) {
      entry.totalScore += score.points_earned;
    }
  }

  const students: StudentReport[] = Array.from(studentMap.entries()).map(
    ([id, data]) => ({
      id,
      name: `Student ${id.slice(0, 6)}`,
      problems_completed: data.problems.size,
      total_problems: 5,
      total_score: data.totalScore,
      max_score: rubric.data.total_points * 5,
      submitted_at: data.lastSubmission,
    })
  );

  return ok({
    assignment: {
      id: assignment.data.id,
      title: assignment.data.title,
      total_points: rubric.data.total_points,
    },
    students,
  });
}
