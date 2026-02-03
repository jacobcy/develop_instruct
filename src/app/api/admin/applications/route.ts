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
  const statusFilter = searchParams.get("status");
  const joinedFilter = searchParams.get("joined");

  const db = supabaseAdmin();
  let query = db.from("applications").select("*").order("created_at", { ascending: false }).limit(200);

  if (q) query = query.or(`user_name.ilike.%${q}%,invite_code.ilike.%${q}%`);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (joinedFilter) query = query.eq("joined", joinedFilter === "true");

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: Request) {
  if (!adminOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, status, joined } = await req.json();
  const db = supabaseAdmin();

  const { error } = await db.from("applications")
    .update({
      status: status ?? undefined,
      joined: typeof joined === "boolean" ? joined : undefined
    })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
