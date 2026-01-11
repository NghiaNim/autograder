import { z } from "zod";

export const StudentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  created_at: z.string(),
});

export const CreateStudentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export type Student = z.infer<typeof StudentSchema>;
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
