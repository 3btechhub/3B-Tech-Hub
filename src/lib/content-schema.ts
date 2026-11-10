import { z } from "zod";
import { roles, type Role } from "./permissions";

const safeHref = z.string().trim().min(1).max(500).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}, "Use an internal path or a secure HTTPS URL.");

const heroSectionSchema = z.object({
  type: z.literal("hero"),
  heading: z.string().trim().min(1).max(120),
  subheading: z.string().trim().max(300).default(""),
  imageUrl: z.string().url().optional(),
  primaryAction: z.object({
    label: z.string().trim().min(1).max(40),
    href: safeHref,
  }).optional(),
}).strict();

const richTextSectionSchema = z.object({
  type: z.literal("rich_text"),
  heading: z.string().trim().max(120).default(""),
  body: z.string().trim().min(1).max(8000),
}).strict();

const serviceGridSectionSchema = z.object({
  type: z.literal("service_grid"),
  heading: z.string().trim().min(1).max(120),
  serviceIds: z.array(z.string().trim().min(1).max(64)).min(1).max(24),
}).strict();

const faqSectionSchema = z.object({
  type: z.literal("faq"),
  heading: z.string().trim().min(1).max(120),
  items: z.array(z.object({
    question: z.string().trim().min(1).max(240),
    answer: z.string().trim().min(1).max(2000),
  }).strict()).min(1).max(30),
}).strict();

const ctaSectionSchema = z.object({
  type: z.literal("cta"),
  heading: z.string().trim().min(1).max(120),
  body: z.string().trim().max(300).default(""),
  actionLabel: z.string().trim().min(1).max(40),
  actionHref: safeHref,
}).strict();

export const pageSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  richTextSectionSchema,
  serviceGridSectionSchema,
  faqSectionSchema,
  ctaSectionSchema,
]);

export const pageSeoSchema = z.object({
  title: z.string().trim().max(70).default(""),
  description: z.string().trim().max(180).default(""),
  canonicalPath: z.string().trim().startsWith("/").max(500).optional(),
  noIndex: z.boolean().default(false),
}).strict();

export const pageRevisionSchema = z.object({
  pageId: z.string().trim().min(1).max(64).optional(),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  locale: z.enum(["en", "bn"]),
  title: z.string().trim().min(1).max(120),
  status: z.enum(["draft", "in_review", "approved", "published"]),
  sections: z.array(pageSectionSchema).min(1).max(40),
  seo: pageSeoSchema,
  revision: z.number().int().positive(),
}).strict();

export type PageRevision = z.infer<typeof pageRevisionSchema>;
export type PageStatus = PageRevision["status"];

const transitions: Record<PageStatus, readonly PageStatus[]> = {
  draft: ["in_review"],
  in_review: ["draft", "approved"],
  approved: ["draft", "published"],
  published: [],
};

export function canTransitionPageStatus(
  current: PageStatus,
  next: PageStatus,
  actorRole: Role,
): boolean {
  if (!roles.includes(actorRole) || !transitions[current].includes(next)) return false;
  if (next === "approved" || next === "published") return actorRole === "owner";
  return true;
}
