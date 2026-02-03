"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

type Invite = { id: string; code: string; note: string | null; active: boolean; created_at: string };
type AppRow = {
  id: string;
  user_name: string;
  hq_level: number | null;
  squad_power: number | null;
  tank_level: number | null;
  alliance_comm: string | null;
  invite_code: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  joined: boolean;
  created_at: string;
};

export default function Admin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const [invites, setInvites] = useState<Invite[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [joinedFilter, setJoinedFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppRow | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newNote, setNewNote] = useState("");

  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

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

  const refreshAll = async (p: string, sf = sortField, so = sortOrder) => {
    const sVar = p || password;
    if (!sVar) return;

    const statusParam = statusFilter ? `&status=${statusFilter}` : "";
    const joinedParam = joinedFilter ? `&joined=${joinedFilter}` : "";
    const sortParam = `&sort=${sf}&order=${so}`;

    const [i, a] = await Promise.all([
      fetch("/api/admin/invites", { headers: { "x-admin-password": sVar } }).then(r => r.json()),
      fetch(`/api/admin/applications?q=${encodeURIComponent(q)}${statusParam}${joinedParam}${sortParam}`, {
        headers: { "x-admin-password": sVar }
      }).then(r => r.json()),
    ]);
    setInvites(i.data || []);
    setApps(a.data || []);
  };

  const toggleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);
    refreshAll(password, field, newOrder);
  };

  const downloadCSV = () => {
    if (apps.length === 0) return alert("Nothing to export");

    const headers = ["User Name", "HQ Level", "Squad Power (M)", "Tank Level", "Alliance Comm", "Invite Code", "Status", "Joined", "Created At"];
    const rows = apps.map(r => [
      r.user_name,
      r.hq_level,
      r.squad_power,
      r.tank_level,
      `"${r.alliance_comm}"`,
      r.invite_code,
      r.status,
      r.joined,
      new Date(r.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateApp = async (id: string, patch: Partial<AppRow>) => {
    const r = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id, ...patch }),
    });
    const j = await r.json();
    if (!j.ok) alert(j.msg || "Update failed");
    else {
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, ...patch });
      }
      await refreshAll(password);
    }
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
          <div className="h1">Admin Login</div>
          <div className="formRow">
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
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
            <div style={{ color: "var(--gold)", fontWeight: 800 }}>Command Center</div>
            <div className="small">Operations Management</div>
          </div>
        </div>
        <div className="pill">
          <button className="btn2" onClick={() => refreshAll(password)}>Sync</button>
          <button className="btn2" onClick={() => router.push("/")}>Landing</button>
        </div>
      </div>

      <div className="hero">
        <div className="h1" style={{ fontSize: 24 }}>Access Control (Invites)</div>
        <div className="formRow">
          <input className="input" placeholder="Custom code" value={newCode} onChange={e => setNewCode(e.target.value)} />
          <input className="input" placeholder="Memo/Note" value={newNote} onChange={e => setNewNote(e.target.value)} />
          <button className="btn" onClick={createInvite}>Deploy Code</button>
        </div>

        <div className="card" style={{ marginTop: 15, textAlign: 'left' }}>
          <div style={{ display: "grid", gap: 8 }}>
            {invites.map(row => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr .5fr .7fr", gap: 10, alignItems: "center", borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 5 }}>
                <input className="input" style={{ fontSize: 13 }} value={row.code} onChange={e => patchInvite(row, { code: e.target.value })} />
                <input className="input" style={{ fontSize: 13 }} value={row.note || ""} onChange={e => patchInvite(row, { note: e.target.value as any })} />
                <button className={row.active ? "btn" : "btn2"} style={{ fontSize: 11 }} onClick={() => patchInvite(row, { active: !row.active })}>
                  {row.active ? "Enabled" : "Halted"}
                </button>
                <div className="small" style={{ fontSize: 10 }}>{new Date(row.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero" style={{ marginTop: 20 }}>
        <div className="h1" style={{ fontSize: 24 }}>Personnel Review (Applications)</div>
        <div className="formRow" style={{ flexWrap: 'wrap', gap: 10 }}>
          <input className="input" style={{ flex: '1 1 200px' }} placeholder="Search Name / Code" value={q} onChange={e => setQ(e.target.value)} />
          <select className="input" style={{ flex: '0 0 120px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="input" style={{ flex: '0 0 120px' }} value={joinedFilter} onChange={e => setJoinedFilter(e.target.value)}>
            <option value="">Joined?</option>
            <option value="true">Joined</option>
            <option value="false">Not Joined</option>
          </select>
          <button className="btn" onClick={() => refreshAll(password)}>Scan</button>
          <button className="btn2" onClick={downloadCSV}>Export CSV</button>
        </div>

        <div className="card" style={{ marginTop: 15, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
              <tr style={{ color: "var(--gold)" }}>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => toggleSort('user_name')}>
                  User Name {sortField === 'user_name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('hq_level')}>
                  HQ {sortField === 'hq_level' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('squad_power')}>
                  Power (M) {sortField === 'squad_power' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('tank_level')}>
                  Tank {sortField === 'tank_level' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('alliance_comm')}>
                  Comm. (%) {sortField === 'alliance_comm' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                  Status {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('created_at')}>
                  Date {sortField === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(42,58,82,.5)" }}>
                  <td style={{ padding: 10 }}>{r.user_name}</td>
                  <td>{r.hq_level}</td>
                  <td>{r.squad_power}</td>
                  <td>{r.tank_level}</td>
                  <td>{r.alliance_comm}</td>
                  <td>
                    <span className={`badge-${r.status}`} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: r.status === 'approved' ? '#2e7d32' : r.status === 'rejected' ? '#c62828' : '#616161' }}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn2" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setSelectedApp(r)}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {apps.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No records found.</div>}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <h2 style={{ color: 'var(--gold)', margin: 0 }}>Personnel Detail</h2>
              <button className="btn2" onClick={() => setSelectedApp(null)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
              <div><strong style={{ opacity: 0.6 }}>User Name:</strong><br />{selectedApp.user_name}</div>
              <div><strong style={{ opacity: 0.6 }}>HQ Level:</strong><br />{selectedApp.hq_level}</div>
              <div><strong style={{ opacity: 0.6 }}>Squad Power (M):</strong><br />{selectedApp.squad_power}</div>
              <div><strong style={{ opacity: 0.6 }}>Tank Level:</strong><br />{selectedApp.tank_level}</div>
              <div><strong style={{ opacity: 0.6 }}>Alliance Comm.:</strong><br />{selectedApp.alliance_comm}</div>
              <div><strong style={{ opacity: 0.6 }}>Invite Code:</strong><br />{selectedApp.invite_code}</div>
            </div>

            <div style={{ marginBottom: 25 }}>
              <strong style={{ opacity: 0.6 }}>Battle Cry / Message:</strong>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8, marginTop: 8, lineHeight: 1.5 }}>
                {selectedApp.message || "---"}
              </div>
            </div>

            <hr className="sep" style={{ margin: '20px 0' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <select className="input" style={{ flex: 1 }} value={selectedApp.status} onChange={e => updateApp(selectedApp.id, { status: e.target.value as any })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className={selectedApp.joined ? "btn" : "btn2"} style={{ minWidth: 120 }} onClick={() => updateApp(selectedApp.id, { joined: !selectedApp.joined })}>
                {selectedApp.joined ? "Joined ✅" : "Not Joined"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
