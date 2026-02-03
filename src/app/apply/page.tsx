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

  const [player_id, setPlayerId] = useState("");
  const [hq_level, setHq] = useState<number | "">("");
  const [buildings, setBuildings] = useState("");
  const [tech, setTech] = useState("");
  const [heroes, setHeroes] = useState("");
  const [tanks, setTanks] = useState("");
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
      setOk(!!j.ok);
    })();
  }, [code]);

  const parseLines = (s: string) => {
    const text = s.trim();
    if (!text) return {};
    if (text.includes(":")) {
      const obj: Record<string, string> = {};
      text.split("\n").map(l => l.trim()).filter(Boolean).forEach(line => {
        const [k, ...rest] = line.split(":");
        obj[k.trim()] = rest.join(":").trim();
      });
      return obj;
    }
    return { items: text.split(",").map(x => x.trim()).filter(Boolean) };
  };

  const submit = async () => {
    setMsg("");
    if (!player_id.trim()) return setMsg(lang==="zh" ? "玩家ID 必填啦" : "Player ID is required");
    setLoading(true);
    try {
      const r = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: code,
          player_id: player_id.trim(),
          hq_level: hq_level === "" ? null : Number(hq_level),
          buildings: parseLines(buildings),
          tech: parseLines(tech),
          heroes: parseLines(heroes),
          tanks: parseLines(tanks),
          message: message.trim(),
        }),
      });
      const j = await r.json();
      if (!j.ok) setMsg(j.msg || (lang==="zh" ? "提交失败 😵" : "Submit failed 😵"));
      else {
        setMsg(lang==="zh" ? "提交成功！已进入候选名单 ✅" : "Sent! You're in the queue ✅");
        setTimeout(() => router.push("/"), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  if (ok === null) return <div className="container"><div className="small">{lang==="zh"?"加载中…":"Loading…"}</div></div>;

  if (!ok) {
    return (
      <div className="container">
        <div className="hero">
          <div className="h1">{lang==="zh"?"邀请码不对":"Invalid code"}</div>
          <div className="sub">{lang==="zh"?"回去重新输一个吧 🤷":"Go back and try another 🤷"}</div>
          <div className="formRow">
            <button className="btn" onClick={() => router.push("/")}>{lang==="zh"?"返回":"Back"}</button>
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
            <div style={{ color: "var(--gold)", fontWeight: 800 }}>{lang==="zh"?"申请加入":"Apply"}</div>
            <div className="small">{lang==="zh"?"邀请码":"Invite"}: <b style={{ color:"var(--gold)" }}>{code}</b></div>
          </div>
        </div>
        <div className="pill">
          <button className="btn2" onClick={() => router.push("/")}>{lang==="zh"?"首页":"Home"}</button>
        </div>
      </div>

      <div className="hero">
        <div className="sub">
          {lang==="zh" ? "随便填，别太正式。能看出你是个狠人就行 😄" : "Keep it chill. Just enough to show you're cracked 😄"}
        </div>

        <div className="formRow">
          <input className="input" placeholder={lang==="zh"?"玩家ID（必填）":"Player ID (required)"} value={player_id} onChange={e=>setPlayerId(e.target.value)} />
          <input className="input" placeholder={lang==="zh"?"HQ 等级（可选）":"HQ level (optional)"} value={hq_level} onChange={e=>setHq(e.target.value===""?"":Number(e.target.value))} />
        </div>

        <hr className="sep" />

        <div className="grid3">
          <div className="card"><h3>Buildings</h3><p>{lang==="zh"?"a:10 换行；或 a,b,c":"Use a:10 per line or a,b,c"}</p></div>
          <div className="card"><h3>Tech</h3><p>{lang==="zh"?"同上，越简单越好":"Same format. simple is fine."}</p></div>
          <div className="card"><h3>Heroes / Tanks</h3><p>{lang==="zh"?"写你最拿手的几个":"List your best ones."}</p></div>
        </div>

        <div className="formRow">
          <textarea className="input" style={{ minHeight: 110 }} placeholder="Buildings" value={buildings} onChange={e=>setBuildings(e.target.value)} />
          <textarea className="input" style={{ minHeight: 110 }} placeholder="Tech" value={tech} onChange={e=>setTech(e.target.value)} />
        </div>

        <div className="formRow">
          <textarea className="input" style={{ minHeight: 110 }} placeholder="Heroes" value={heroes} onChange={e=>setHeroes(e.target.value)} />
          <textarea className="input" style={{ minHeight: 110 }} placeholder="Tanks" value={tanks} onChange={e=>setTanks(e.target.value)} />
        </div>

        <div className="formRow">
          <textarea className="input" style={{ minHeight: 90 }} placeholder={lang==="zh"?"想说的话（可选）":"Message (optional)"} value={message} onChange={e=>setMessage(e.target.value)} />
        </div>

        <div className="formRow">
          <button className="btn" onClick={submit} disabled={loading}>
            {loading ? (lang==="zh"?"提交中…":"Sending…") : (lang==="zh"?"提交申请":"Send application")}
          </button>
          <button className="btn2" onClick={() => router.push("/")}>{lang==="zh"?"返回":"Back"}</button>
        </div>

        {msg && <div className="small" style={{ color: "var(--gold)" }}>{msg}</div>}
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