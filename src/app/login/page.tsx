"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("3btechhub@gmail.com");
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/login/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send sign-in code.");
      setUserId(data.userId);
      setNotice("A one-time code was sent to the Owner email. Check your inbox and spam folder.");
      setStep("code");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send sign-in code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, secret: secret.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to verify code.");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/admin") ? next : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#f4f6f9" }}>
      <form onSubmit={step === "email" ? requestCode : verifyCode} style={{ width: "min(420px,100%)", padding: 28, borderRadius: 18, background: "white", border: "1px solid #e5e7eb", boxShadow: "0 12px 36px #10182812" }}>
        <p style={{ color: "#0b5cab", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>3B TECH HUB</p>
        <h1 style={{ fontSize: 28, margin: "8px 0" }}>Owner sign in</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 14 }}>
          {step === "email" ? "Request a one-time sign-in code. Only the registered Owner email is allowed." : `Enter the one-time code sent to ${email}.`}
        </p>
        {step === "email" ? (
          <>
            <label htmlFor="owner-email" style={{ display: "block", marginTop: 20, fontSize: 14, fontWeight: 600 }}>Owner email</label>
            <input id="owner-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ boxSizing: "border-box", width: "100%", padding: 12, border: "1px solid #d0d5dd", borderRadius: 9, marginTop: 7 }} />
          </>
        ) : (
          <>
            <label htmlFor="owner-code" style={{ display: "block", marginTop: 20, fontSize: 14, fontWeight: 600 }}>Email verification code</label>
            <input id="owner-code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={128} value={secret} onChange={(e) => setSecret(e.target.value)} style={{ boxSizing: "border-box", width: "100%", padding: 12, border: "1px solid #d0d5dd", borderRadius: 9, marginTop: 7, letterSpacing: ".12em" }} />
          </>
        )}
        {notice && <p role="status" style={{ color: "#067647", fontSize: 13, lineHeight: 1.5 }}>{notice}</p>}
        {error && <p role="alert" style={{ color: "#b42318", fontSize: 14 }}>{error}</p>}
        <button disabled={busy} type="submit" style={{ width: "100%", marginTop: 22, padding: 13, border: 0, borderRadius: 9, background: "#0b5cab", color: "white", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "Please wait…" : step === "email" ? "Send sign-in code" : "Verify and sign in"}
        </button>
        {step === "code" && <button type="button" disabled={busy} onClick={() => { setStep("email"); setSecret(""); setNotice(""); setError(""); }} style={{ width: "100%", marginTop: 10, padding: 11, border: "1px solid #d0d5dd", borderRadius: 9, background: "white", color: "#344054" }}>Use a different email</button>}
        <Link href="/" style={{ display: "inline-block", marginTop: 18, color: "#475467", fontSize: 13 }}>← Back to website</Link>
      </form>
    </main>
  );
}
