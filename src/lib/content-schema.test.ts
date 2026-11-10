import { describe, expect, it } from "vitest";
import { canTransitionPageStatus, pageRevisionSchema } from "./content-schema";

const validPage = {
  slug: "home",
  locale: "en",
  title: "Home",
  status: "draft",
  sections: [
    { type: "hero", heading: "Technology made simple", subheading: "Repair and support" },
    { type: "service_grid", heading: "Our services", serviceIds: ["phone-repair"] },
    { type: "cta", heading: "Need help?", actionLabel: "Contact us", actionHref: "/#contact" },
  ],
  seo: { title: "3B TECH HUB", description: "Technology services and repairs." },
  revision: 1,
};

describe("pageRevisionSchema", () => {
  it("accepts structured page sections", () => {
    expect(pageRevisionSchema.safeParse(validPage).success).toBe(true);
  });

  it("rejects non-HTTPS hero media URLs", () => {
    expect(pageRevisionSchema.safeParse({
      ...validPage,
      sections: [{ type: "hero", heading: "Hello", imageUrl: "http://images.example.com/hero.jpg" }],
    }).success).toBe(false);
  });

  it("accepts HTTPS hero media URLs", () => {
    expect(pageRevisionSchema.safeParse({
      ...validPage,
      sections: [{ type: "hero", heading: "Hello", imageUrl: "https://cdn.example.com/hero.webp" }],
    }).success).toBe(true);
  });

  it("rejects unsafe external CTA links", () => {
    const result = pageRevisionSchema.safeParse({
      ...validPage,
      sections: [{ type: "cta", heading: "Click", actionLabel: "Go", actionHref: "javascript:alert(1)" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown section types and extra fields", () => {
    expect(pageRevisionSchema.safeParse({
      ...validPage,
      sections: [{ type: "raw_html", html: "<script>alert(1)</script>" }],
    }).success).toBe(false);
  });

  it("enforces SEO description limits", () => {
    expect(pageRevisionSchema.safeParse({
      ...validPage,
      seo: { title: "Home", description: "x".repeat(181) },
    }).success).toBe(false);
  });
});

describe("page publishing workflow", () => {
  it("requires owner approval before approval and publishing", () => {
    expect(canTransitionPageStatus("in_review", "approved", "admin")).toBe(false);
    expect(canTransitionPageStatus("in_review", "approved", "owner")).toBe(true);
    expect(canTransitionPageStatus("approved", "published", "owner")).toBe(true);
  });

  it("does not let staff publish or skip review", () => {
    expect(canTransitionPageStatus("draft", "published", "staff")).toBe(false);
    expect(canTransitionPageStatus("draft", "in_review", "staff")).toBe(true);
  });

  it("does not allow edits directly on a published revision", () => {
    expect(canTransitionPageStatus("published", "draft", "owner")).toBe(false);
  });
});
