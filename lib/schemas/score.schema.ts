import { z } from "zod";

export const ScoreSchema = z.object({
  id: z.string().uuid(),
  submission_id: z.string().uuid(),
  rubric_id: z.string().uuid(),
  points_earned: z.number().int().min(0),
  feedback: z.string(),
  graded_at: z.string(),
});

export const GradeResponseSchema = z.object({
  scores: z.array(
    z.object({
      criterion_name: z.string(),
      level: z.enum(["Excellent", "Good", "Developing", "Beginning"]),
      points_earned: z.number(),
      reasoning: z.string(),
    })
  ),
  total_earned: z.number().int().min(0),
  overall_feedback: z.string(),
});

export type Score = z.infer<typeof ScoreSchema>;
export type GradeResponse = z.infer<typeof GradeResponseSchema>;
