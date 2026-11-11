"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ConfirmPasswordRecoveryPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId") ?? "";
    const secret = params.get("secret") ?? "";
    if (!userId || !secret) {
      setError("This reset link is invalid or incomplete. Request a new one.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login/recovery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, secret, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update password.");
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={updatePassword}>
        <h1 className="auth-title">Choose a new password</h1>
        {done ? <p className="auth-message" role="status">Your password has been updated. You can now sign in.</p> : <>
          <label htmlFor="new-password">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} />
          <label htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <p className="auth-message">Use at least 12 characters.</p>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={busy} type="submit">{busy ? "Updating…" : "Update password"}</button>
        </>}
        <Link className="auth-home" href="/login">Back to sign in</Link>
      </form>
    </main>
  );
}
