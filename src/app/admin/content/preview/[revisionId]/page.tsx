import Link from "next/link";
import { notFound } from "next/navigation";
import { pageRevisionSchema, type PageRevision } from "@/lib/content-schema";
import { getAppwriteRow, isContentStoreConfigured } from "@/lib/appwrite-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Protected content preview", robots: { index: false, follow: false, noarchive: true } };

type Props = { params: Promise<{ revisionId: string }> };

export default async function ContentPreviewPage({ params }: Props) {
  const { revisionId } = await params;
  if (!isContentStoreConfigured()) notFound();
  let revision: PageRevision;
  try {
    const row = await getAppwriteRow(process.env.APPWRITE_CONTENT_TABLE_ID!, revisionId);
    if (typeof row.payload !== "string") notFound();
    const parsed = pageRevisionSchema.safeParse(JSON.parse(row.payload));
    if (!parsed.success) notFound();
    revision = parsed.data;
  } catch { notFound(); }

  return (
    <main className="content-preview-page">
      <article className="content-preview-article">
        <Link href="/admin/content" className="content-preview-back">← Back to content editor</Link>
        <p className="content-preview-meta">PROTECTED PREVIEW · {revision.locale.toUpperCase()} · REVISION {revision.revision}</p>
        <h1>{revision.title}</h1>
        <p className="content-preview-status">Status: {revision.status} · URL: /{revision.locale}/{revision.slug}</p>
        {revision.sections.map((section, index) => {
          if (section.type === "hero") return <section key={index} className="content-preview-section"><h2>{section.heading}</h2><p>{section.subheading}</p>{section.primaryAction && <a href={section.primaryAction.href} className="published-action">{section.primaryAction.label}</a>}</section>;
          if (section.type === "rich_text") return <section key={index} className="content-preview-section">{section.heading && <h2>{section.heading}</h2>}<p>{section.body}</p></section>;
          if (section.type === "service_grid") return <section key={index} className="content-preview-section"><h2>{section.heading}</h2><ul>{section.serviceIds.map((id) => <li key={id}>{id}</li>)}</ul></section>;
          if (section.type === "faq") return <section key={index} className="content-preview-section"><h2>{section.heading}</h2>{section.items.map((item) => <div key={item.question} className="content-preview-faq-item"><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>;
          return <section key={index} className="content-preview-callout"><h2>{section.heading}</h2><p>{section.body}</p><a href={section.actionHref} className="published-action">{section.actionLabel}</a></section>;
        })}
        <p className="content-preview-status">This is a private preview. It is not published to the public website.</p>
      </article>
    </main>
  );
}
