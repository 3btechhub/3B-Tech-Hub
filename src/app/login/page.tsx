"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/admin") ? next : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#f4f6f9" }}>
      <form onSubmit={submit} style={{ width: "min(420px,100%)", padding: 28, borderRadius: 18, background: "white", border: "1px solid #e5e7eb", boxShadow: "0 12px 36px #10182812" }}>
        <p style={{ color: "#0b5cab", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>3B TECH HUB</p>
        <h1 style={{ fontSize: 28, margin: "8px 0" }}>Owner sign in</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 14 }}>Use your existing Appwrite account. Public registration is disabled.</p>
        <label style={{ display: "block", marginTop: 20, fontSize: 14, fontWeight: 600 }}>Email</label>
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ boxSizing: "border-box", width: "100%", padding: 12, border: "1px solid #d0d5dd", borderRadius: 9, marginTop: 7 }} />
        <label style={{ display: "block", marginTop: 16, fontSize: 14, fontWeight: 600 }}>Password</label>
        <input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={{ boxSizing: "border-box", width: "100%", padding: 12, border: "1px solid #d0d5dd", borderRadius: 9, marginTop: 7 }} />
        {error && <p role="alert" style={{ color: "#b42318", fontSize: 14 }}>{error}</p>}
        <button disabled={busy} type="submit" style={{ width: "100%", marginTop: 22, padding: 13, border: 0, borderRadius: 9, background: "#0b5cab", color: "white", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Signing in…" : "Sign in securely"}</button>
        <Link href="/" style={{ display: "inline-block", marginTop: 18, color: "#475467", fontSize: 13 }}>← Back to website</Link>
      </form>
    </main>
  );
}
