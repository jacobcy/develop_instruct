import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invite_code = searchParams.get("code")?.toLowerCase();
  const user_name = searchParams.get("name");

  if (!invite_code || !user_name) return NextResponse.json({ ok: false }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db.from("applications")
    .select("*")
    .eq("invite_code", invite_code)
    .eq("user_name", user_name)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const invite_code = String(payload.invite_code || "").trim().toLowerCase();
  const user_name = String(payload.user_name || "").trim();

  if (!invite_code || !user_name) {
    return NextResponse.json({ ok: false, msg: "Need invite_code & user_name" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const v = await db.from("invites").select("code,active").eq("code", invite_code).maybeSingle();
  if (!v.data?.active) return NextResponse.json({ ok: false, msg: "Invalid invite" }, { status: 403 });

  // Format squad_power to 1 decimal place
  let squad_power = null;
  if (payload.squad_power !== null && payload.squad_power !== undefined) {
    squad_power = Math.round(Number(payload.squad_power) * 10) / 10;
  }

  // Use upsert to handle updates for same user_name + invite_code
  const { error } = await db.from("applications").upsert({
    invite_code,
    user_name,
    hq_level: payload.hq_level ?? null,
    squad_power,
    tank_level: payload.tank_level ?? null,
    alliance_comm: payload.alliance_comm ?? "",
    message: payload.message ?? "",
    status: "pending"
  }, {
    onConflict: "user_name,invite_code"
  });

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
