"use client";

import {useEffect,useState} from "react";
export default function GoogleCallbackPage(){
 const [message,setMessage]=useState("Completing Google sign-in…");
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);const userId=params.get("userId");const secret=params.get("secret");
  if(!userId||!secret){setMessage("Google sign-in was cancelled or could not be completed.");return;}
  fetch("/api/auth/google/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,secret})})
   .then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error??"Google sign-in failed.");window.location.replace("/profile");})
   .catch(e=>setMessage(e instanceof Error?e.message:"Google sign-in failed."));
 },[]);
 return <main className="auth-page"><p className="auth-message" role="status">{message}</p></main>;
}
