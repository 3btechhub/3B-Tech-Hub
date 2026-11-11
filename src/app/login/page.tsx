"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={signIn}>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-message">Use your Owner email and password.</p>
        <label htmlFor="owner-email">Email</label>
        <input id="owner-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
        <label htmlFor="owner-password">Password</label>
        <input id="owner-password" type="password" autoComplete="current-password" required minLength={8} maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</button>
        <Link className="auth-home" href="/login/recovery">Forgot password?</Link>
        <Link className="auth-home" href="/">Home</Link>
      </form>
    </main>
  );
}
