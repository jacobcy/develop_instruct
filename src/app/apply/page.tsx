"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { t, Lang } from "@/lib/i18n";

function ApplyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const copy = useMemo(() => t(lang), [lang]);

  const code = (params.get("code") || "").toLowerCase();
  const [ok, setOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [user_name, setUserName] = useState("");
  const [hq_level, setHq] = useState<number | "">("");
  const [squad_power, setSquadPower] = useState("");
  const [tank_level, setTankLevel] = useState<number | "">("");
  const [alliance_comm, setAllianceComm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang) || "en";
    setLang(saved === "zh" ? "zh" : "en");
  }, []);

  useEffect(() => {
    (async () => {
      if (!code) return setOk(false);
      const r = await fetch("/api/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await r.json();
      const isOk = !!j.ok;
      setOk(isOk);

      // If code is OK, try to fetch existing application for THIS CODE
      if (isOk) {
        const ar = await fetch(`/api/apply?code=${code}`);
        const aj = await ar.json();
        if (aj.ok && aj.data) {
          const d = aj.data;
          setUserName(d.user_name || "");
          setHq(d.hq_level ?? "");
          setSquadPower(d.squad_power ? String(d.squad_power) : "");
          setTankLevel(d.tank_level ?? "");
          setAllianceComm(d.alliance_comm ?? "");
          setMessage(d.message ?? "");
          setMsg(lang === "zh" ? "✨ 已自动恢复此邀请码对应的申请数据" : "✨ Restored application data for this invite code.");
        }
      }
    })();
  }, [code, lang]);

  const submit = async () => {
    setMsg("");

    if (!user_name.trim()) return setMsg(copy.userName + (lang === "zh" ? " 必填" : " is required"));

    const hq = Number(hq_level);
    if (isNaN(hq) || hq < 1 || hq > 35) {
      return setMsg(lang === "zh" ? "总部等级必须是 1-35 之间的数字" : "HQ Level must be a number between 1 and 35");
    }

    const power = parseFloat(squad_power);
    if (isNaN(power) || power <= 0) {
      return setMsg(lang === "zh" ? "主力战队战力必须是有效数字" : "Main Squad Power must be a valid number");
    }

    const tLevel = Number(tank_level);
    if (isNaN(tLevel) || tLevel <= 0) {
      return setMsg(lang === "zh" ? "坦克等级必须是有效数字" : "Tank Level must be a valid number");
    }

    setLoading(true);
    try {
      const r = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: code,
          user_name: user_name.trim(),
          hq_level: hq,
          squad_power: power,
          tank_level: tLevel,
          alliance_comm: alliance_comm.trim(),
          message: message.trim(),
        }),
      });
      const j = await r.json();
      if (!j.ok) setMsg(j.msg || copy.error);
      else {
        setMsg(copy.success);
        setTimeout(() => router.push("/"), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  if (ok === null) return <div className="container"><div className="small">{lang === "zh" ? "正在激活信号…" : "Initializing signal…"}</div></div>;

  if (!ok) {
    return (
      <div className="container">
        <div className="hero">
          <div className="h1">{lang === "zh" ? "识别码已过期" : "Code Expired"}</div>
          <div className="sub">{lang === "zh" ? "你需要一个有效的邀请码才能加入战斗。" : "You need a valid code to enter the battlefield."}</div>
          <div className="formRow">
            <button className="btn" onClick={() => router.push("/")}>{copy.back}</button>
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
            <div style={{ color: "var(--gold)", fontWeight: 800 }}>{copy.title}</div>
            <div className="small">ENTRY-CODE: <b style={{ color: "var(--gold)" }}>{code.toUpperCase()}</b></div>
          </div>
        </div>
        <div className="pill">
          <button className="btn2" onClick={() => router.push("/")}>{copy.back}</button>
        </div>
      </div>

      <div className="hero">
        <div className="sub" style={{ fontSize: 14 }}>
          {copy.subtitle}
        </div>

        <div className="grid3" style={{ textAlign: 'left', marginBottom: 10 }}>
          <div className="card">
            <h3>{lang === "zh" ? "1. 身份识别" : "1. Identification"}</h3>
            <p className="small">{copy.hintId}</p>
          </div>
          <div className="card">
            <h3>{lang === "zh" ? "2. 战力报告" : "2. Battle Report"}</h3>
            <p className="small">{copy.hintStats}</p>
          </div>
          <div className="card">
            <h3>{lang === "zh" ? "3. 听候指令" : "3. Deploy"}</h3>
            <p className="small">{lang === "zh" ? "总部复核后会主动联络。" : "HQ will contact you after review."}</p>
          </div>
        </div>

        <div className="formRow">
          <input className="input" placeholder={copy.userName} value={user_name} onChange={e => setUserName(e.target.value)} />
          <input className="input" type="number" min="1" max="35" placeholder={copy.hqLevel} value={hq_level} onChange={e => setHq(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>

        <div className="formRow">
          <input className="input" type="number" step="0.1" placeholder={copy.squadPower} value={squad_power} onChange={e => setSquadPower(e.target.value)} />
          <input className="input" type="number" placeholder={copy.tankLevel} value={tank_level} onChange={e => setTankLevel(e.target.value === "" ? "" : Number(e.target.value))} />
          <input className="input" placeholder={copy.allianceComm} value={alliance_comm} onChange={e => setAllianceComm(e.target.value)} />
        </div>

        <div className="formRow" style={{ marginTop: 10 }}>
          <textarea className="input" style={{ minHeight: 100 }} placeholder={copy.message} value={message} onChange={e => setMessage(e.target.value)} />
        </div>

        <div className="formRow" style={{ marginTop: 20 }}>
          <button className="btn" onClick={submit} disabled={loading} style={{ flex: 2, padding: 15, fontSize: 16 }}>
            {loading ? copy.loading : copy.submit}
          </button>
        </div>

        {msg && <div className="small" style={{ color: "var(--gold)", fontWeight: 'bold', marginTop: 10 }}>{msg}</div>}
      </div>
    </div>
  );
}

export default function Apply() {
  return (
    <Suspense fallback={<div className="container"><div className="small">Loading...</div></div>}>
      <ApplyForm />
    </Suspense>
  );
}