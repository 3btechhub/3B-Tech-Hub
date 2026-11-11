import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
export const runtime="nodejs";
const schema=z.object({userId:z.string().min(1).max(36),secret:z.string().min(1).max(128)});
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");if(!origin||origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 const endpoint=process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/,"");const projectId=process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!endpoint||!projectId)return NextResponse.json({error:"Authentication is not configured."},{status:503});
 if(!parsed.success)return NextResponse.json({error:"Enter the email verification code."},{status:400});
 try{
  const upstream=await fetch(endpoint+"/account/tokens/email/verify",{method:"POST",headers:{"Content-Type":"application/json","X-Appwrite-Project":projectId},body:JSON.stringify(parsed.data),cache:"no-store"});
  if(!upstream.ok)return NextResponse.json({error:"Verification code is invalid or expired."},{status:400});
  const session=await upstream.json() as {secret?:string;userId?:string};
  if(!session.secret)return NextResponse.json({error:"Email verification did not create a session."},{status:502});
  const response=NextResponse.json({ok:true});
  response.cookies.set("a_session_"+projectId,session.secret,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
  return response;
 }catch{return NextResponse.json({error:"Authentication service unavailable."},{status:502});}
}
