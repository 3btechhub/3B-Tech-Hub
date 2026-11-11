import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
export const runtime="nodejs";
const schema=z.object({userId:z.string().min(1).max(36),secret:z.string().min(1).max(256)});
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");if(!origin||origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 const endpoint=process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/,"");const projectId=process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!endpoint||!projectId||!parsed.success)return NextResponse.json({error:"Invalid Google sign-in response."},{status:400});
 try{
  const check=await fetch(endpoint+"/account",{headers:{"X-Appwrite-Project":projectId,Cookie:"a_session_"+projectId+"="+parsed.data.secret},cache:"no-store"});
  if(!check.ok)return NextResponse.json({error:"Google session could not be verified."},{status:401});
  const account=await check.json() as {$id:string};
  if(account.$id!==parsed.data.userId)return NextResponse.json({error:"Google session identity mismatch."},{status:401});
  const response=NextResponse.json({ok:true});
  response.cookies.set("a_session_"+projectId,parsed.data.secret,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
  return response;
 }catch{return NextResponse.json({error:"Authentication service unavailable."},{status:502});}
}
