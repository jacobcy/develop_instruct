import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { generateCode } from "@/lib/codegen";

function adminOk(req: Request) {
  const p = req.headers.get("x-admin-password");
  return p && p === process.env.ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!adminOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db.from("invites").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  if (!adminOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const { code, note } = await req.json();
  const finalCode = (code && String(code).trim()) || generateCode();

  const db = supabaseAdmin();
  const { error } = await db.from("invites").insert({ code: finalCode.toLowerCase(), note: note ?? "" });
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, code: finalCode.toLowerCase() });
}

export async function PATCH(req: Request) {
  if (!adminOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, code, note, active } = await req.json();
  const db = supabaseAdmin();

  const { error } = await db.from("invites")
    .update({
      code: code?.trim()?.toLowerCase(),
      note: note ?? "",
      active: typeof active === "boolean" ? active : undefined,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
