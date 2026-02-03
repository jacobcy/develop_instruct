"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

type Invite = { id: string; code: string; note: string | null; active: boolean; created_at: string };
type AppRow = any;

export default function Admin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const [invites, setInvites] = useState<Invite[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [q, setQ] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const p = sessionStorage.getItem("admin_password");
    if (p) setPassword(p);
  }, []);

  const login = async () => {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json();
    if (j.ok) {
      sessionStorage.setItem("admin_password", password);
      setAuthed(true);
      await refreshAll(password);
    } else {
      alert("Nope 🙂");
    }
  };

  const refreshAll = async (p: string) => {
    const [i, a] = await Promise.all([
      fetch("/api/admin/invites", { headers: { "x-admin-password": p } }).then(r => r.json()),
      fetch(`/api/admin/applications?q=${encodeURIComponent(q)}`, { headers: { "x-admin-password": p } }).then(r => r.json()),
    ]);
    setInvites(i.data || []);
    setApps(a.data || []);
  };

  const createInvite = async () => {
    const r = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ code: newCode.trim() || null, note: newNote }),
    });
    const j = await r.json();
    if (!j.ok) return alert(j.msg || "failed");
    setNewCode("");
    setNewNote("");
    await refreshAll(password);
  };

  const patchInvite = async (row: Invite, patch: Partial<Invite>) => {
    const r = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: row.id, ...patch }),
    });
    const j = await r.json();
    if (!j.ok) return alert(j.msg || "failed");
    await refreshAll(password);
  };

  if (!authed) {
    return (
      <div className="container">
        <div className="hero">
          <div className="h1">Admin</div>
          <div className="sub">Password: <b>Spartans</b> (change via env)</div>
          <div className="formRow">
            <input className="input" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn" onClick={login}>Enter</button>
            <button className="btn2" onClick={() => router.push("/")}>Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="badge"><span>235</span></div>
          <div>
            <div style={{ color: "var(--gold)", fontWeight: 800 }}>Admin Panel</div>
            <div className="small">invites • applications</div>
          </div>
        </div>
        <div className="pill">
          <button className="btn2" onClick={() => refreshAll(password)}>Refresh</button>
          <button className="btn2" onClick={() => router.push("/")}>Home</button>
        </div>
      </div>

      <div className="hero">
        <div className="h1" style={{ fontSize: 28 }}>Invites</div>
        <div className="formRow">
          <input className="input" placeholder="Custom code (optional) e.g. sparta-235" value={newCode} onChange={e=>setNewCode(e.target.value)} />
          <input className="input" placeholder="Note (optional)" value={newNote} onChange={e=>setNewNote(e.target.value)} />
          <button className="btn" onClick={createInvite}>Create</button>
        </div>

        <div className="small">Tip: leave code empty to auto-generate 3-word code.</div>

        <hr className="sep" />
        <div className="card">
          <h3>Invite list (editable)</h3>
          <div className="small">Edit code/note, toggle active.</div>
          <div style={{ display:"grid", gap:10, marginTop:10 }}>
            {invites.map(row => (
              <div key={row.id} style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr .6fr .8fr", gap:10, alignItems:"center" }}>
                <input className="input" value={row.code} onChange={e=>patchInvite(row, { code: e.target.value })} />
                <input className="input" value={row.note || ""} onChange={e=>patchInvite(row, { note: e.target.value as any })} />
                <button className={row.active ? "btn" : "btn2"} onClick={()=>patchInvite(row, { active: !row.active })}>
                  {row.active ? "Active" : "Disabled"}
                </button>
                <div className="small">{new Date(row.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero" style={{ marginTop: 18 }}>
        <div className="h1" style={{ fontSize: 28 }}>Applications</div>
        <div className="formRow">
          <input className="input" placeholder="Search player_id / invite_code" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn2" onClick={() => refreshAll(password)}>Search</button>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <h3>Latest (up to 200)</h3>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color:"var(--gold)" }}>
                  <th align="left">Time</th>
                  <th align="left">Player</th>
                  <th align="left">HQ</th>
                  <th align="left">Invite</th>
                  <th align="left">Message</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((r:any) => (
                  <tr key={r.id} style={{ borderTop:"1px solid rgba(42,58,82,.5)" }}>
                    <td style={{ padding:"8px 6px", color:"var(--muted)" }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ padding:"8px 6px" }}>{r.player_id}</td>
                    <td style={{ padding:"8px 6px" }}>{r.hq_level ?? ""}</td>
                    <td style={{ padding:"8px 6px", color:"var(--gold)" }}>{r.invite_code}</td>
                    <td style={{ padding:"8px 6px", color:"var(--muted)" }}>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
