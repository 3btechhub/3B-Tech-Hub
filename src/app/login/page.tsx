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
      if (!response.ok) throw new Error(data.error ?? "Login failed.");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/profile");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form auth-login-form" onSubmit={signIn}>
        <input
          aria-label="Email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
        />
        <input
          aria-label="Password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={256}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit auth-login-submit" disabled={busy} type="submit">
          {busy ? "Logging in…" : "Login"}
        </button>
        <div className="auth-secondary-actions">
          <Link className="auth-secondary-button" href="/login/recovery">Forgot Password</Link>
          <Link className="auth-secondary-button" href="/login/register">Create Account</Link>
        </div>
      </form>
    </main>
  );
}
