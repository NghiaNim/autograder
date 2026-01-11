import { z } from "zod";

export const CriterionLevelSchema = z.object({
  name: z.enum(["Excellent", "Good", "Developing", "Beginning"]),
  description: z.string(),
  percentage: z.number().min(0).max(100),
});

export const CriterionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  points: z.number().int().positive(),
  levels: z.array(CriterionLevelSchema).length(4),
});

export const ProblemSchema = z.object({
  question: z.string(),
  hint: z.string().nullable(),
});

export const RubricSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  criteria: z.array(CriterionSchema),
  problems: z.array(ProblemSchema),
  total_points: z.number().int().positive(),
  updated_at: z.string(),
});

export const RubricResponseSchema = z.object({
  criteria: z.array(CriterionSchema),
  total_points: z.number().int().positive(),
});

export const AssignmentGenerationResponseSchema = z.object({
  problems: z.array(ProblemSchema),
  rubric: z.object({
    criteria: z.array(CriterionSchema),
    total_points: z.number().int().positive(),
  }),
});

export const UpdateRubricSchema = z.object({
  criteria: z.array(CriterionSchema),
  total_points: z.number().int().positive(),
});

export type Problem = z.infer<typeof ProblemSchema>;
export type Criterion = z.infer<typeof CriterionSchema>;
export type CriterionLevel = z.infer<typeof CriterionLevelSchema>;
export type Rubric = z.infer<typeof RubricSchema>;
export type RubricResponse = z.infer<typeof RubricResponseSchema>;
export type AssignmentGenerationResponse = z.infer<typeof AssignmentGenerationResponseSchema>;
export type UpdateRubricInput = z.infer<typeof UpdateRubricSchema>;
