"use client";

import { FormEvent,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage(){
 const router = useRouter();
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState("");
 const [userId,setUserId]=useState(""); const [code,setCode]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [sent,setSent]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch(sent?"/api/auth/register/verify":"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sent?{userId,secret:code}:{email:email.trim(),password,name:name.trim()})});
   const data=await response.json();if(!response.ok)throw new Error(data.error??"Unable to continue.");
   if(sent){router.push("/profile");return;}
   setUserId(data.userId);setSent(true);
  }catch(e){setError(e instanceof Error?e.message:"Unable to continue.");}finally{setBusy(false);}
 }
 return <main className="auth-page"><form className="auth-form" onSubmit={submit}>
  {sent?<><h1 className="auth-title">Verify your email</h1><p className="auth-message">Enter the verification code sent to your email.</p><input aria-label="Verification code" placeholder="Enter email verification code" autoComplete="one-time-code" inputMode="numeric" required value={code} onChange={e=>setCode(e.target.value)}/></>:<>
   <h1 className="auth-title">Create Account</h1>
   <input aria-label="Name" placeholder="Enter your name" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/>
   <input aria-label="Email" placeholder="Enter your email address" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/>
   <input aria-label="Password" placeholder="Create a password (12+ characters)" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/>
  </>}
  {error&&<p className="auth-error" role="alert">{error}</p>}
  <button className="auth-submit" type="submit" disabled={busy}>{busy?"Please wait…":sent?"Verify email":"Create Account"}</button>
  <Link className="auth-secondary-button" href="/login">Back to Login</Link>
 </form></main>;
}
