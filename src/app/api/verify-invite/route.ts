import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { code } = await req.json();
  const c = String(code || "").trim().toLowerCase();
  if (!c) return NextResponse.json({ ok: false }, { status: 400 });

  const db = supabaseAdmin();
  const { data } = await db.from("invites").select("code,active").eq("code", c).maybeSingle();

  if (!data || !data.active) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true });
}
