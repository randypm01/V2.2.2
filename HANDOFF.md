# 接续文档 — 新专案开始时贴这份给 Claude

> **用法**:在新专案的 composer 中,把整份文档贴进去,或上传后说「先读 HANDOFF.md 再读 CLAUDE.md」。

---

## 0. 一句话项目

博彩平台「专业代理推广分润系统」P0 精简版高保真原型,**14 个 feat**,3 个后台视角(PRD 规划 / 商户后台 / 代理后台),纯前端 HTML + React + Babel,无构建。

---

## 1. 当前版本

- **最新版本**:`v3.1.2`(2026-05-20)
- **版本号体系**:从 v3.1.0 重启的新小版本周期,原 v3.0.x 已封板
- **版本历史完整保存在** `modules/version.jsx` — 最新一条 `current: true`,接续后改东西继续往上加 v3.1.3、v3.1.4…

---

## 2. 接续必读顺序(新 chat 第一件事)

1. **先读 `CLAUDE.md`** — 项目记忆全文,含设计系统 / 用户偏好 / 强制规则
2. **`ls modules/`** — 看真实文件清单(CLAUDE.md 第三章可能滞后)
3. **读 `index.html` 的 `<script>` 段** — 核对所有 jsx 都被引用
4. **读 `modules/version.jsx` 前 50 行** — 知道最近改了什么
5. **读 `app.jsx` 顶部 NAV** + `modules/prd.jsx` PRD_FEATURES — 路由 & PRD 数据结构
6. 改东西优先 `str_replace_edit`,大改才 `write_file`

---

## 3. 现状快照(导出时)

### modules/ 实际清单(23 个文件)

商户后台:`dashboard / agents / codes / cpa / players / revshare / agent_levels / agent_revenue / settlement(已删,见 v3.0.xx)/ wallet(已删)/ logs(已删)/ notifications(已删)/ risk(已删)`
※ 实际现有:`dashboard.jsx / agents.jsx / codes.jsx / cpa.jsx / players.jsx / revshare.jsx / agent_levels.jsx / agent_revenue.jsx`

代理后台:`agent_common / agent_dashboard / agent_login / agent_profile / agent_notify / my_codes / my_codes_mgmt / my_cpa / my_players / my_revshare / my_settlement / my_wallet / frontend`

PRD / 版本:`prd.jsx / version.jsx`

⚠️ **以 `ls modules/` 为准**,不要照念这份清单。

### 三个后台 tab 顶部切换

| Tab | logo + 标题 |
|---|---|
| PRD 规划 | folder + "PRD 规划 v1.0" |
| 商户后台 | building + "商戶後台_專業代理 v1.0" |
| 专业代理后台 | users + "專業代理後台 v1.0" |

### 当前侧栏(P0 精简后)

**商户后台**:运营(仪表盘 / 代理账户 / 分润管理 / 代理等级)/ 玩家(玩家管理 / CPA / 风控)/ 收益(分润 / 代理收益)/ 系统(日志 / 通知)

**代理后台**:首页 / 我的账户 / 运营(我的账户 · Code 与链接管理)/ 报表(邀请Code与链接 · 玩家损益 · 分润报表)

---

## 4. 强制规则(摘自 CLAUDE.md,新 chat 易忽略)

### A. 版本记录(强制)
每次代码更新 → 同步加 `modules/version.jsx` 一条,**不要等用户提醒**:
- 新条目 `current: true`,旧的 `current: false`
- ver 自增小数(看顶部最新一条 +0.0.1)
- changes 用 `{ type: 'fix'|'add'|'modify'|'remove'|'feat', text: '...' }`
- 小改动也要记(bug 修复 / 文案微调 / 样式调整都算)

### B. 导出代码(强制排除)
1. `uploads/` — 原始 PRD 文档
2. 任何 `舊備份*` / `old*` / `backup*` / `_bak*` 资料夹
3. `screenshots/` — 截图

做法:`run_script` copy 到临时 `_export/` → `present_fs_item_for_download` 打包成 zip → 完成后删 `_export/`。

### C. P0 精简版 — 不要扩展
- 只保留 P0-1 ~ P0-14 共 14 个 feat
- P1/P2/P3 已全部移除,**不要恢复**
- 用户后续要做 P1+ → 建议「另开新专案」

### D. 不要改路由格式
`home` / `section:运营` / `mod:agents` / `prd_overview` / `phase:P0` / `feat:P0-1` — 一改全断

### E. 优先级 pill 三处渲染
首页 hc-row / 大项页 fc-child / PRD 卡片 — 改样式记得三处同步

---

## 5. 用户偏好

- PM 用户,非工程师 — 部署走 GitHub 网页上传 + Netlify
- **简体中文** UI(代码注释中文)
- **白底** 浅色风格 + 蓝色主色 `--brand: #3b82f6`
- **不要装饰性图标 / emoji**,务实风
- **回答尽量简短**,先给结果再给理由
- **不要凭记忆答模块数 / 清单** — 永远先 `ls`

---

## 6. 最近 3 个版本改了什么(快速跟进)

### v3.1.2(2026-05-20)分润报表重构
- 顶部加「分润期类型」segmented:**预估分润期(未结算)** ↔ **已结算分润期**
- 两种期 KPI / 字段差异化,预估期无结算单号/付款字段;已结算期 10 列含付款状态
- 点已结算期行 → Drawer 看完整付款信息

### v3.1.1(2026-05-20)Code 创建上限
- 代理后台 → 运营 → Code 与链接管理:**上限 20 条**
- 达上限点「创建」→ 弹窗提示联系管理员,PageHead 加计数 N/20(红字)

### v3.1.0(2026-05-20)版本号重启
- 原 v3.0.x 系列封板,从 v3.1.0 开新小版本周期
- CLAUDE.md 新增第八·A 节「导出代码规则」

---

## 7. 已知待办 / 用户最近聊到但未做完

- 用户提到「分润结算页优化」给了截图,但截图没传上来(对话里只有文字)— 新 chat 可以问用户「你之前提到的分润结算页设计图能再传一次吗」
- 没有待修 bug 记录

---

## 8. 部署

- 不是 npm 项目,**无 package.json / 无 build**
- 直接把所有档案上传 GitHub repo,Netlify 设 publish directory = `/`,入口 `index.html`
- 字体走 Google Fonts CDN,所有 React / Babel 走 unpkg CDN

---

**完。** 新 chat 读完这份 + CLAUDE.md 就能完整接续。
