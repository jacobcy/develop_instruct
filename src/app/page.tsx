"use client";
import { useEffect, useMemo, useState } from "react";
import { t, Lang } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang) || (process.env.NEXT_PUBLIC_DEFAULT_LANG as Lang) || "en";
    setLang(saved === "zh" ? "zh" : "en");
  }, []);

  const copy = useMemo(() => t(lang), [lang]);

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  const goApply = async () => {
    setMsg("");
    const c = code.trim().toLowerCase();
    if (!c) return;

    setLoading(true);
    try {
      const r = await fetch("/api/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const j = await r.json();
      if (!j.ok) setMsg(lang === "zh" ? "邀请码不对 / 已停用 🤷" : "Code not valid / disabled 🤷");
      else router.push(`/apply?code=${encodeURIComponent(c)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="badge"><span>235</span></div>
          <div>
            <div style={{ color: "var(--gold)", fontWeight: 800 }}>Spartans</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>Greek-ish • casual • guild vibes</div>
          </div>
        </div>
        <div className="pill">
          <button className="btn2" onClick={() => router.push("/admin")}>{copy.admin}</button>
          <button className="btn" onClick={toggleLang}>{copy.switchTo}</button>
        </div>
      </div>

      <div className="hero">
        <div className="h1">{copy.title}</div>
        <div className="sub">{copy.subtitle}</div>

        <div className="grid3">
          <div className="card"><h3>{copy.steps1}</h3><p>{lang==="zh"?"拿到暗号就行":"Got the magic words? type it."}</p></div>
          <div className="card"><h3>{copy.steps2}</h3><p>{lang==="zh"?"随便填，别紧张":"Quick form. Nothing sweaty."}</p></div>
          <div className="card"><h3>{copy.steps3}</h3><p>{lang==="zh"?"管理员看到会私你":"We’ll peek and DM you."}</p></div>
        </div>

        <div className="formRow">
          <input
            className="input"
            placeholder={copy.codeHint}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goApply()}
          />
          <button className="btn" onClick={goApply} disabled={loading}>
            {loading ? (lang==="zh"?"校验中…":"Checking…") : copy.go}
          </button>
        </div>
        {msg && <div className="small" style={{ color: "var(--gold)" }}>{msg}</div>}
        <div className="small">
          {lang==="zh"
            ? "提示：邀请码是好记的三词组合，比如 olive-lion-spear。"
            : "Tip: codes are 3 memorable words like olive-lion-spear."}
        </div>
      </div>

      <hr className="sep" />
      <div className="small">
        {lang==="zh"
          ? "⚔️ 235 斯巴达：轻松招募页（Vercel + Supabase）。"
          : "⚔️ Spartans of 235: chill recruiting page (Vercel + Supabase)."}
      </div>
    </div>
  );
}
