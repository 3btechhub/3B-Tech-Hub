"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function signIn(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim(),password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error??"Login failed.");
      const next=new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/")&&!next.startsWith("//")?next:"/profile");
    } catch(cause) { setError(cause instanceof Error?cause.message:"Login failed."); }
    finally { setBusy(false); }
  }

  const endpoint=(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT??"https://cloud.appwrite.io/v1").replace(/\/$/,"");
  const project=process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID??"";
  const origin=typeof window!=="undefined"?window.location.origin:"";
  const callback=origin+"/login/google/callback";
  const googleUrl=project&&origin?endpoint+"/account/sessions/oauth2/google?project="+encodeURIComponent(project)+"&success="+encodeURIComponent(callback)+"&failure="+encodeURIComponent(origin+"/login?google=failed"):"#";

  return (
    <main className="auth-page">
      <form className="auth-form auth-login-form" onSubmit={signIn}>
        <a className="auth-google-button" href={googleUrl} aria-label="Continue with Google" onClick={(event)=>{if(!project){event.preventDefault();setError("Google login is not configured for this Appwrite project.");}}}>
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6v-5.3H5.9a20 20 0 0 0 0 18.2l6.9-5.3Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.9 14.9l6.9 5.3C14.4 15.5 18.8 12 24 12Z"/></svg>
          Continue with Google
        </a>
        <input aria-label="Email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address"/>
        <input aria-label="Password" type="password" autoComplete="current-password" required minLength={8} maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>
        {error&&<p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit auth-login-submit" disabled={busy} type="submit">{busy?"Logging in…":"Login"}</button>
        <div className="auth-secondary-actions">
          <a className="auth-secondary-button" href="/login/recovery">Forgot Password</a>
          <a className="auth-secondary-button" href="/login/register">Create Account</a>
        </div>
      </form>
    </main>
  );
}
