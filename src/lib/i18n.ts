export type Lang = "en" | "zh";

export const t = (lang: Lang) => {
  const en = {
    title: "235 Spartans: The Last Defense",
    subtitle: "Join the elite server 235 squad. No weak links. Only warriors.",
    go: "Join the Fight",
    admin: "Command Center",
    switchTo: "切换中文",
    steps1: "1) Secure Code",
    steps2: "2) Flex Stats",
    steps3: "3) Ready Up",
    codeHint: "Identify with your invite code",
    // Form fields
    userName: "User Name",
    hqLevel: "HQ Level (1-35)",
    squadPower: "Main Squad Power (M)",
    tankLevel: "Tank Level",
    allianceComm: "Alliance Comm. (%)",
    message: "Battle Cry / Message",
    submit: "Deploy Application",
    loading: "Deploying...",
    success: "Deployed! Check back soon warrior.",
    error: "Signal lost. Try again.",
    // Instructions
    hintId: "Your in-game name.",
    hintStats: "Be honest. We verify.",
    back: "Back to Base"
  };

  const zh = {
    title: "235 斯巴达：最后防线",
    subtitle: "加入 235 服最强方阵。这里不收弱者，只留战神。",
    go: "申请入队",
    admin: "指挥部",
    switchTo: "English",
    steps1: "1）验证暗号",
    steps2: "2）展示战力",
    steps3: "3）等待征召",
    codeHint: "输入你的专属邀请码",
    // Form fields
    userName: "游戏 ID (用户昵称)",
    hqLevel: "总部等级 (1-35)",
    squadPower: "主力战队战力 (M)",
    tankLevel: "坦克等级",
    allianceComm: "联盟表彰 (%)",
    message: "入队表态 / 备注",
    submit: "提交官阶申请",
    loading: "正在联络总部…",
    success: "申请已送达！勇士请耐心等待。",
    error: "信号干扰，提交失败。",
    // Instructions
    hintId: "请输入你的游戏内名称。",
    hintStats: "如实填写，我们会核实战报。",
    back: "返回主城"
  };

  return lang === "zh" ? zh : en;
};
