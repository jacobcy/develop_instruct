import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

function adminOk(req: Request) {
  const p = req.headers.get("x-admin-password");
  return p && p === process.env.ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!adminOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const db = supabaseAdmin();
  let query = db.from("applications").select("*").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`player_id.ilike.%${q}%,invite_code.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
