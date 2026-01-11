import { createOpenRouterClient, AssignmentGenerationSchema, GradeSchema } from "@/lib/openrouter/client";
import { AssignmentGenerationResponse } from "@/lib/schemas/rubric.schema";
import { GradeResponse } from "@/lib/schemas/score.schema";
import { Criterion } from "@/lib/schemas/rubric.schema";
import { Result, ok, err } from "@/lib/utils/result";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const ASSIGNMENT_SYSTEM_PROMPT = `You are an expert educator creating educational assignments.
Given a topic/description, generate:
1. Exactly 5 practice problems/questions for students to solve (appropriate difficulty, clear wording)
2. A grading rubric with 3-5 criteria to evaluate student work

The problems should be progressive in difficulty and test understanding of the topic.
Each problem should be solvable by showing work on a whiteboard.`;

const GRADING_SYSTEM_PROMPT = `You are grading a student's work against a rubric.
Analyze the whiteboard submission and score each criterion.
Be fair but rigorous. Students do NOT see your feedback.`;

export async function generateAssignment(input: {
  title: string;
  description: string;
}): Promise<Result<AssignmentGenerationResponse>> {
  try {
    const llm = createOpenRouterClient();
    const structuredLlm = llm.withStructuredOutput(AssignmentGenerationSchema);

    const result = await structuredLlm.invoke([
      new SystemMessage(ASSIGNMENT_SYSTEM_PROMPT),
      new HumanMessage(
        `Topic: ${input.title}\n\nDescription: ${input.description}\n\nGenerate 5 problems and a grading rubric for this assignment.`
      ),
    ]);

    return ok(result as AssignmentGenerationResponse);
  } catch (e) {
    console.error("generateAssignment error:", e);
    return err(e instanceof Error ? e.message : "LLM error", 500);
  }
}

export async function gradeSubmission(
  criteria: Criterion[],
  totalPoints: number,
  problemQuestion: string,
  imageUrl: string
): Promise<Result<GradeResponse>> {
  try {
    const llm = createOpenRouterClient();
    const structuredLlm = llm.withStructuredOutput(GradeSchema);

    const rubricJson = JSON.stringify({ criteria, total_points: totalPoints }, null, 2);

    const result = await structuredLlm.invoke([
      new SystemMessage(GRADING_SYSTEM_PROMPT),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `## Rubric\n${rubricJson}\n\n## Problem\n${problemQuestion}\n\nGrade this student's whiteboard submission.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      }),
    ]);

    return ok(result as GradeResponse);
  } catch (e) {
    console.error("gradeSubmission error:", e);
    return err(e instanceof Error ? e.message : "LLM error", 500);
  }
}
