"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function GoogleCallbackContent() {
  const params = useSearchParams();
  const userId = params.get("userId");
  const secret = params.get("secret");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId || !secret) return;

    fetch("/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, secret }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Google sign-in failed.");
        window.location.replace("/profile");
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Google sign-in failed.");
      });
  }, [userId, secret]);

  if (!userId || !secret) {
    return <p className="auth-message" role="status">Google sign-in was cancelled or could not be completed.</p>;
  }

  return <p className="auth-message" role="status">{message || "Completing Google sign-in…"}</p>;
}

export default function GoogleCallbackPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<p className="auth-message" role="status">Completing Google sign-in…</p>}>
        <GoogleCallbackContent />
      </Suspense>
    </main>
  );
}
