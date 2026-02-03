export type Lang = "en" | "zh";

export const t = (lang: Lang) => {
  const en = {
    title: "Spartans of 235",
    subtitle: "Grab your shield. Enter a code. Flex your stats. No paperwork, just vibes.",
    go: "Let’s go",
    admin: "Admin",
    switchTo: "中文",
    steps1: "1) Enter code",
    steps2: "2) Quick apply",
    steps3: "3) Chill — we review",
    codeHint: "Example: olive-lion-spear",
  };

  const zh = {
    title: "235 斯巴达勇士",
    subtitle: "拿起盾牌，输邀请码，秀一下战力。别太正式，我们就图个痛快。",
    go: "开冲",
    admin: "管理",
    switchTo: "EN",
    steps1: "1）输入邀请码",
    steps2: "2）快速申请",
    steps3: "3）等管理员翻牌子",
    codeHint: "示例：olive-lion-spear",
  };

  return lang === "zh" ? zh : en;
};
