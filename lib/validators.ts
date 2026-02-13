import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(40),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().min(2).max(120),
  job_type: z.string().min(2).max(120),
  urgency: z.enum(["emergency", "today", "this_week", "quote"]),
  description: z.string().max(2000).optional(),
  preferred_contact_window: z.enum(["morning", "afternoon", "evening"]).optional(),
  source: z.enum(["organic", "paid", "direct", "unknown"]).default("unknown"),
  page_source: z.string().max(120).default("unknown"),
  turnstileToken: z.string().min(1),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  utm_term: z.string().max(120).optional(),
  utm_content: z.string().max(120).optional()
});

export const leadStatusSchema = z.enum(["new", "contacted", "booked", "won", "lost", "deposit_paid"]);
