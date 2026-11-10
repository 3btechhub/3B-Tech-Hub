import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageRevisionSchema, type PageRevision } from "@/lib/content-schema";
import { isContentStoreConfigured, listAppwriteRows } from "@/lib/appwrite-server";

export const dynamic = "force-dynamic";

async function getPublishedPage(locale: string, slug: string): Promise<PageRevision | null> {
  if ((locale !== "en" && locale !== "bn") || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !isContentStoreConfigured()) return null;
  try {
    const result = await listAppwriteRows(process.env.APPWRITE_CONTENT_TABLE_ID!, 100);
    const rows = (result.rows ?? [])
      .filter((row) => row.status === "published" && row.slug === slug && row.locale === locale)
      .sort((a, b) => Number(b.revision ?? 0) - Number(a.revision ?? 0));
    for (const row of rows) {
      if (typeof row.payload !== "string") continue;
      let value: unknown;
      try { value = JSON.parse(row.payload); } catch { continue; }
      const parsed = pageRevisionSchema.safeParse(value);
      if (parsed.success && parsed.data.status === "published" && parsed.data.slug === slug && parsed.data.locale === locale) return parsed.data;
    }
    return null;
  } catch { return null; }
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedPage(locale, slug);
  if (!page) return { title: "Page not found | 3B TECH HUB", robots: { index: false, follow: false } };
  return {
    title: page.seo.title || page.title,
    description: page.seo.description,
    robots: page.seo.noIndex ? { index: false, follow: false } : undefined,
    alternates: page.seo.canonicalPath ? { canonical: page.seo.canonicalPath } : undefined,
  };
}

export default async function PublishedPage({ params }: Props) {
  const { locale, slug } = await params;
  const page = await getPublishedPage(locale, slug);
  if (!page) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#172033", padding: "32px 18px" }}>
      <article style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header style={{ padding: "20px 0 40px", borderBottom: "1px solid #eaecf0" }}>
          <a href={`/${locale}/home`} style={{ fontWeight: 800, color: "#155eef", textDecoration: "none" }}>3B TECH HUB</a>
          <h1 style={{ fontSize: "clamp(34px,6vw,64px)", lineHeight: 1.08, marginTop: 32 }}>{page.title}</h1>
        </header>
        {page.sections.map((section, index) => {
          if (section.type === "hero") return <section key={index} style={{ padding: "48px 0", borderBottom: "1px solid #eaecf0" }}>{section.imageUrl && <Image src={section.imageUrl} alt="" width={1200} height={420} unoptimized loading="lazy" style={{ width: "100%", height: "auto", maxHeight: 420, objectFit: "cover", borderRadius: 16 }} />}<h2 style={{ fontSize: "clamp(28px,5vw,48px)" }}>{section.heading}</h2><p style={{ fontSize: 18, lineHeight: 1.7 }}>{section.subheading}</p>{section.primaryAction && <a href={section.primaryAction.href} style={{ display: "inline-block", marginTop: 12, color: "#155eef", fontWeight: 700 }}>{section.primaryAction.label} →</a>}</section>;
          if (section.type === "rich_text") return <section key={index} style={{ padding: "32px 0" }}>{section.heading && <h2>{section.heading}</h2>}<p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{section.body}</p></section>;
          if (section.type === "service_grid") return <section key={index} style={{ padding: "32px 0" }}><h2>{section.heading}</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>{section.serviceIds.map((id) => <div key={id} style={{ padding: 18, background: "#f2f4f7", borderRadius: 12 }}>{id.replaceAll("-", " ")}</div>)}</div></section>;
          if (section.type === "faq") return <section key={index} style={{ padding: "32px 0" }}><h2>{section.heading}</h2>{section.items.map((item) => <details key={item.question} style={{ padding: "14px 0", borderBottom: "1px solid #eaecf0" }}><summary style={{ fontWeight: 700, cursor: "pointer" }}>{item.question}</summary><p style={{ lineHeight: 1.7 }}>{item.answer}</p></details>)}</section>;
          return <section key={index} style={{ padding: 28, margin: "28px 0", background: "#f2f4f7", borderRadius: 14 }}><h2>{section.heading}</h2><p>{section.body}</p><a href={section.actionHref} style={{ color: "#155eef", fontWeight: 700 }}>{section.actionLabel} →</a></section>;
        })}
      </article>
    </main>
  );
}
