import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export function createOpenRouterClient(model: string = "openai/gpt-4o-mini") {
  return new ChatOpenAI({
    modelName: model,
    temperature: 0.5,
    maxTokens: 2000,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    apiKey: process.env.OPENROUTER_KEY,
  });
}

export const AssignmentGenerationSchema = z.object({
  problems: z.array(
    z.object({
      question: z.string().describe("The problem/question for students to solve"),
      hint: z.string().optional().describe("Optional hint for the problem"),
    })
  ).length(5).describe("Exactly 5 problems/questions for students to solve"),
  rubric: z.object({
    criteria: z.array(
      z.object({
        name: z.string().describe("Name of the grading criterion"),
        description: z.string().describe("What this criterion measures"),
        points: z.number().int().positive().describe("Maximum points for this criterion"),
        levels: z.array(
          z.object({
            name: z.enum(["Excellent", "Good", "Developing", "Beginning"]),
            description: z.string().describe("Description of performance at this level"),
            percentage: z.number().describe("Percentage of points earned (100, 75, 50, 25)"),
          })
        ).length(4),
      })
    ).describe("3-5 grading criteria"),
    total_points: z.number().int().positive().describe("Total points per problem"),
  }),
});

export const GradeSchema = z.object({
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
