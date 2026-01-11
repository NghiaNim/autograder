import { z } from "zod";

export const WhiteboardDataSchema = z.object({
  strokes: z.array(
    z.object({
      points: z.array(z.object({ x: z.number(), y: z.number() })),
      color: z.string(),
      width: z.number(),
    })
  ),
  image_url: z.string().url().optional(),
});

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  problem_index: z.number().int().min(0),
  whiteboard_data: WhiteboardDataSchema,
  submitted_at: z.string(),
});

export const CreateSubmissionSchema = z.object({
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  problem_index: z.number().int().min(0),
  whiteboard_data: WhiteboardDataSchema,
});

export type WhiteboardData = z.infer<typeof WhiteboardDataSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;
