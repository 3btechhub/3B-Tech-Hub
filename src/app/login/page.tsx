"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/login/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send sign-in code.");
      setUserId(data.userId); setNotice("Check your email for the sign-in code."); setStep("code");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to send sign-in code."); }
    finally { setBusy(false); }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, secret: secret.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to verify code.");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/admin");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to verify code."); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={step === "email" ? requestCode : verifyCode}>
        {step === "email" ? <>
          <label htmlFor="owner-email">Email</label>
          <input id="owner-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
        </> : <>
          <label htmlFor="owner-code">Verification code</label>
          <input id="owner-code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={128} value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter code" />
        </>}
        {notice && <p className="auth-message" role="status">{notice}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={busy} type="submit">{busy ? "Please wait…" : step === "email" ? "Continue" : "Sign in"}</button>
        {step === "code" && <button className="auth-back" type="button" disabled={busy} onClick={() => { setStep("email"); setSecret(""); setNotice(""); setError(""); }}>Change email</button>}
        <Link className="auth-home" href="/">Home</Link>
      </form>
    </main>
  );
}
