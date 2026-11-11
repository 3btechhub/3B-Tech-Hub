"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send password reset email.");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send password reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={requestReset}>
        <h1 className="auth-title">Reset password</h1>
        {sent ? <p className="auth-message" role="status">If this is the configured Owner email, a password reset link has been sent. Check your inbox.</p> : <>
          <p className="auth-message">Enter your Owner email to receive a password reset link.</p>
          <label htmlFor="recovery-email">Email</label>
          <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={busy} type="submit">{busy ? "Sending…" : "Send reset link"}</button>
        </>}
        <Link className="auth-home" href="/login">Back to sign in</Link>
      </form>
    </main>
  );
}
