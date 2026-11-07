import {NextRequest,NextResponse} from "next/server";
import {Pool} from "pg";
import {isAdmin,sameOrigin} from "../../../../../lib/admin-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
let pool:Pool|undefined;
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private"}});
// Manual, single-record rights-request deletion. Never runs on schedule.
export async function DELETE(request:NextRequest){
  if(process.env.VERCEL_ENV!=="preview")return reply({error:"Not found"},404);
  if(!isAdmin(request))return reply({error:"Unauthorized"},401);
  if(!sameOrigin(request))return reply({error:"Forbidden"},403);
  if(!process.env.DATABASE_URL)return reply({error:"Database unavailable"},503);
  const raw=await request.text();
  if(raw.length>1024)return reply({error:"Invalid request"},413);
  let data:unknown;
  try{data=JSON.parse(raw)}catch{return reply({error:"Invalid JSON"},400)}
  if(!data||typeof data!=="object"||Array.isArray(data))return reply({error:"Invalid request"},400);
  const record=data as Record<string,unknown>;
  if(typeof record.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.id)
     ||typeof record.email!=="string"||record.email.length>254
     ||record.confirm!=="DELETE REGISTRATION")return reply({error:"Missing deletion confirmation"},400);
  try{
    pool??=new Pool({connectionString:process.env.DATABASE_URL,max:2});
    const client=await pool.connect();let transaction=false;
    try{
      await client.query("BEGIN");transaction=true;
      const found=await client.query(
        `SELECT id,email,full_name FROM public.worship_interest
         WHERE id::text=$1 AND LOWER(email)=LOWER($2) FOR UPDATE`,[record.id,record.email]);
      if(found.rowCount!==1){await client.query("ROLLBACK");transaction=false;return reply({error:"Matching participant not found"},404)}
      const participant=found.rows[0];
      if(participant.full_name==="TEST REGISTRATION (admin)"&&
         /^wu-admin-test-[0-9a-f-]{36}@example\.invalid$/i.test(participant.email)){
        await client.query("ROLLBACK");transaction=false;
        return reply({error:"Use the Delete test action for fictional records"},400);
      }
      // Safely handle older installations without the optional consent table.
      // When migration 004 is applied it cascades on record deletion.
      const deleted=await client.query(
        "DELETE FROM public.worship_interest WHERE id::text=$1 AND LOWER(email)=LOWER($2) RETURNING id",
        [record.id,record.email]);
      if(deleted.rowCount!==1)throw new Error("Record changed during deletion");
      await client.query("COMMIT");transaction=false;
      return reply({ok:true,message:"Registration deleted from the live database. Review backups and any exported copies separately."});
    }finally{
      if(transaction)try{await client.query("ROLLBACK")}catch{}
      client.release();
    }
  }catch(error){
    console.error("Manual registration deletion failed",error instanceof Error?error.message:"unknown");
    return reply({error:"Deletion failed; no success confirmed."},500);
  }
}
