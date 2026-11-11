import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
export const runtime="nodejs";
const schema=z.object({email:z.string().email().max(254),password:z.string().min(12).max(256),name:z.string().trim().min(1).max(100)});
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");if(!origin||origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 const endpoint=process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/,"");const projectId=process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!endpoint||!projectId)return NextResponse.json({error:"Authentication is not configured."},{status:503});
 if(!parsed.success)return NextResponse.json({error:"Enter a valid name, email and password of at least 12 characters."},{status:400});
 try{
  const created=await fetch(endpoint+"/account",{method:"POST",headers:{"Content-Type":"application/json","X-Appwrite-Project":projectId},body:JSON.stringify({userId:"unique()",email:parsed.data.email,password:parsed.data.password,name:parsed.data.name}),cache:"no-store"});
  if(!created.ok)return NextResponse.json({error:created.status===409?"An account with this email already exists.":"Unable to create account."},{status:created.status===409?409:400});
  const user=await created.json() as {$id:string};
  const token=await fetch(endpoint+"/account/tokens/email",{method:"POST",headers:{"Content-Type":"application/json","X-Appwrite-Project":projectId},body:JSON.stringify({userId:user.$id,email:parsed.data.email}),cache:"no-store"});
  if(!token.ok)return NextResponse.json({error:"Account created, but verification email could not be sent. Contact the site owner."},{status:502});
  return NextResponse.json({ok:true,userId:user.$id});
 }catch{return NextResponse.json({error:"Authentication service unavailable."},{status:502});}
}
