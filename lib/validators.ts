import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().min(2),
  job_type: z.string().min(2),
  urgency: z.enum(["emergency", "today", "this_week", "quote"]),
  description: z.string().optional(),
  preferred_contact_window: z.enum(["morning", "afternoon", "evening"]).optional(),
  source: z.enum(["organic", "paid", "direct", "unknown"]).default("unknown"),
  turnstileToken: z.string().min(1),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional()
});

export type LeadInput = z.infer<typeof leadSchema>;
