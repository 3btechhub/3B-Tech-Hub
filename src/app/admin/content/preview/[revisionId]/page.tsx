import Link from "next/link";
import { notFound } from "next/navigation";
import { pageRevisionSchema } from "@/lib/content-schema";
import { getAppwriteRow, isContentStoreConfigured } from "@/lib/appwrite-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Protected content preview", robots: { index: false, follow: false, noarchive: true } };

type Props = { params: Promise<{ revisionId: string }> };

export default async function ContentPreviewPage({ params }: Props) {
  const { revisionId } = await params;
  if (!isContentStoreConfigured()) notFound();
  let revision;
  try {
    const row = await getAppwriteRow(process.env.APPWRITE_CONTENT_TABLE_ID!, revisionId);
    if (typeof row.payload !== "string") notFound();
    const parsed = pageRevisionSchema.safeParse(JSON.parse(row.payload));
    if (!parsed.success) notFound();
    revision = parsed.data;
  } catch {
    notFound();
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f9", color: "#172033", padding: "32px 18px" }}>
      <article style={{ maxWidth: 900, margin: "0 auto", background: "white", border: "1px solid #e4e7ec", borderRadius: 18, padding: "clamp(20px,5vw,48px)" }}>
        <Link href="/admin/content" style={{ color: "#155eef", fontWeight: 700 }}>← Back to content editor</Link>
        <p style={{ color: "#667085", fontSize: 12, letterSpacing: ".1em", fontWeight: 800, marginTop: 28 }}>PROTECTED PREVIEW · {revision.locale.toUpperCase()} · REVISION {revision.revision}</p>
        <h1 style={{ fontSize: "clamp(32px,6vw,54px)", lineHeight: 1.08, letterSpacing: "-.04em" }}>{revision.title}</h1>
        <p style={{ color: "#667085" }}>Status: {revision.status} · URL: /{revision.locale}/{revision.slug}</p>
        {revision.sections.map((section, index) => {
          if (section.type === "hero") return <section key={index} style={{ padding: "34px 0", borderBottom: "1px solid #eaecf0" }}><h2 style={{ fontSize: 36 }}>{section.heading}</h2><p>{section.subheading}</p>{section.primaryAction && <a href={section.primaryAction.href} style={{ color: "#155eef" }}>{section.primaryAction.label}</a>}</section>;
          if (section.type === "rich_text") return <section key={index} style={{ padding: "24px 0" }}>{section.heading && <h2>{section.heading}</h2>}<p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{section.body}</p></section>;
          if (section.type === "service_grid") return <section key={index} style={{ padding: "24px 0" }}><h2>{section.heading}</h2><ul>{section.serviceIds.map((id) => <li key={id}>{id}</li>)}</ul></section>;
          if (section.type === "faq") return <section key={index} style={{ padding: "24px 0" }}><h2>{section.heading}</h2>{section.items.map((item) => <div key={item.question} style={{ padding: "12px 0" }}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>;
          return <section key={index} style={{ padding: "28px", marginTop: 20, background: "#f2f4f7", borderRadius: 12 }}><h2>{section.heading}</h2><p>{section.body}</p><a href={section.actionHref} style={{ color: "#155eef", fontWeight: 700 }}>{section.actionLabel}</a></section>;
        })}
        <p style={{ borderTop: "1px solid #eaecf0", paddingTop: 18, color: "#667085", fontSize: 12 }}>This is a private preview. It is not published to the public website.</p>
      </article>
    </main>
  );
}
