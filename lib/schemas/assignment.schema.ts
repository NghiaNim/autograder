import { z } from "zod";

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  teacher_id: z.string().uuid(),
  share_code: z.string().length(6),
  created_at: z.string(),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  teacher_id: z.string().uuid(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
