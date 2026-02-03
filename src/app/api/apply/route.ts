import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const payload = await req.json();
  const invite_code = String(payload.invite_code || "").trim().toLowerCase();
  const player_id = String(payload.player_id || "").trim();
  if (!invite_code || !player_id) {
    return NextResponse.json({ ok: false, msg: "Need invite_code & player_id" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const v = await db.from("invites").select("code,active").eq("code", invite_code).maybeSingle();
  if (!v.data?.active) return NextResponse.json({ ok: false, msg: "Invalid invite" }, { status: 403 });

  const { error } = await db.from("applications").insert({
    invite_code,
    player_id,
    hq_level: payload.hq_level ?? null,
    buildings: payload.buildings ?? {},
    tech: payload.tech ?? {},
    heroes: payload.heroes ?? {},
    tanks: payload.tanks ?? {},
    message: payload.message ?? ""
  });

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
