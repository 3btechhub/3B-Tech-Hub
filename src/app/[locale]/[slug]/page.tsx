import Image from "next/image";
import Link from "next/link";
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
    <main className="published-page">
      <article className="published-page-shell">
        <header className="published-page-header">
          <Link href={`/${locale}/home`} className="published-page-brand">3B TECH HUB</Link>
          <h1>{page.title}</h1>
        </header>
        {page.sections.map((section, index) => {
          if (section.type === "hero") return <section key={index} className="published-section published-hero-section">{section.imageUrl && <Image src={section.imageUrl} alt="" width={1200} height={420} unoptimized loading="lazy" className="published-hero-image" />}<h2>{section.heading}</h2><p>{section.subheading}</p>{section.primaryAction && <a href={section.primaryAction.href} className="published-action">{section.primaryAction.label} →</a>}</section>;
          if (section.type === "rich_text") return <section key={index} className="published-section">{section.heading && <h2>{section.heading}</h2>}<p className="published-rich-text">{section.body}</p></section>;
          if (section.type === "service_grid") return <section key={index} className="published-section"><h2>{section.heading}</h2><div className="published-service-grid">{section.serviceIds.map((id) => <div key={id} className="published-service-item">{id.replaceAll("-", " ")}</div>)}</div></section>;
          if (section.type === "faq") return <section key={index} style={{ padding: "32px 0" }}><h2>{section.heading}</h2>{section.items.map((item) => <details key={item.question} className="published-faq-item"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>;
          return <section key={index} className="published-callout"><h2>{section.heading}</h2><p>{section.body}</p><a href={section.actionHref} className="published-action">{section.actionLabel} →</a></section>;
        })}
      </article>
    </main>
  );
}
