import { z } from 'zod';

export const aiRequestSchema = z.object({
  type: z.enum(['TASK_SUGGESTER', 'MEETING_SUMMARIZER', 'TIMELINE_GENERATOR', 'CODE_REVIEWER']),
  input: z.string().min(1).max(10000),
  context: z.record(z.any()).optional(),
});

export const taskSuggestionSchema = z.object({
  context: z.string().min(1).max(5000),
});

export const meetingSummarySchema = z.object({
  transcript: z.string().min(1).max(10000),
  participants: z.array(z.string()).min(1),
});

export const timelineGenerationSchema = z.object({
  projectContext: z.string().min(1).max(5000),
  milestones: z.array(z.string()).min(1),
});

export const codeReviewSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.string().min(1).max(50),
  context: z.string().max(1000).optional(),
}); 