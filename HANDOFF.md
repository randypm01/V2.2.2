# 接续摘要 — 新 chat 开局先读这份(再读 CLAUDE.md)

> 本文件是「当前真实快照」。CLAUDE.md 描述的是早期 P0 精简版,已与现状不符 —— 以本文件 + `ls modules/` + `index.html` 为准。

## ⚡ 开局只做两件轻事,然后停下等任务(别全量预读)

1. 读本文件 `HANDOFF.md`(规则 + 现状)
2. `ls modules/` 核对真实文件
3. **停**,等用户给具体任务 —— **不要**开局就全量读 `index.html` / `app.jsx` / `prd.jsx` / `version.jsx`,那是新 chat 慢几十秒的元凶。
4. 拿到任务后**按需读**:改哪个模块 → `grep`/`read` 那一个模块 + 它在 `index.html` 的那行引用即可。
5. CLAUDE.md 只取「规则/偏好」(第七章、七·A、八·A、八·B);它的文件清单已过时,忽略。

---

## 0. 一句话项目

博彩平台「专业代理推广分润系统」高保真原型。纯前端 **HTML + React 18 + Babel standalone,无构建**。入口 `index.html`(按顺序引入 30 个 jsx/js)。

⚠️ 项目早已超出 CLAUDE.md 写的「P0 14 feat 精简版」:现已有 **4 个顶部 tab**、社媒分享、客服管理、提款审核、网站前台等。不要再被 CLAUDE.md 的「不要扩展 / 只剩 P0」字样限制 —— 按用户当下要求做。

---

## 1. 当前版本

- **最新**:`v3.7.21`(2026-06-10)
- 版本历史全保存在 `modules/version.jsx`(顶部最新一条 `current:true`)
- 用户报需求时常带版本号简写(如 v222 = v2.2.2);**每次改代码都要往 version.jsx 顶部加一条新记录**(见第 4·A 节,强制,别等用户提醒)

---

## 2. 接续顺序(精简,别预读大文件)

开局只:① 读本文件 ② `ls modules/` ③ 停,等任务。其余**全部按需**,拿到任务才读:

- 要核对引入顺序 → 读 `index.html` 的 `<script>` 段
- 要知道最近改了什么 → 读 `modules/version.jsx` 前 ~30 行
- 要动导航/路由 → 读 `app.jsx` 的 `NAV`/`AGENT_NAV`
- 要动 PRD → 读 `modules/prd.jsx` 的 `PRD_FEATURES`
- 改某模块 → 只读该模块 + 它那行 `<script>` 引用
- 改东西优先 `str_replace_edit`;大改才 `write_file`

---

## 3. 现状快照

### 4 个顶部 tab(`backend` 状态:`prd | merchant | agent | frontend`)

| tab | logo + 标题 | 渲染 |
|---|---|---|
| PRD 规划 | folder | 路线图 / 版本 |
| 商户后台 | building「商戶後台_專業代理」 | 商户 NAV + 侧栏 |
| 专业代理后台 | users「專業代理後台」 | AGENT_NAV(需登入,agent_login) |
| 网站前台 | globe「网站前台」 | `<FrontendModule/>` 全宽,跳过侧栏 |

每个 tab 各自独立路由 state(merchantRoute / agentRoute / prdRoute / frontendRoute)。

### 当前侧栏(以 app.jsx 为准)

**商户后台 NAV**
- 运营:仪表盘 / 代理账户管理 / 分润管理 / 代理等级管理 / 社媒分享管理 / 客服管理
- 报表:代理收益 / 代理推广链接 / 代理玩家损益 / 代理分润报表
- 财务:代理佣金结算单 / 提款审核

**专业代理后台 AGENT_NAV**(支持中英 i18n,`window.t`)
- 运营:我的账户 / Code 与链接管理
- 报表:邀请Code与链接 / 玩家损益 / 分润报表
- 财务:佣金结算单 / 提款审核进度

### modules/ 真实清单(30 个,2026-06-09)

商户后台:`dashboard / agents / agent_levels / codes / players / cpa / revshare / agent_revenue / agent_revshare / agent_settlement / withdraw_review / social_share / customer_service`
代理后台:`agent_common / agent_login / agent_dashboard / agent_profile / agent_notify / agent_live_chat / my_codes / my_codes_mgmt / my_players / my_cpa / my_revshare / my_settlement / my_withdraw_progress / my_wallet`
前台:`frontend`
PRD/版本:`prd / version`
> 根目录还有:`app.jsx ui.jsx data.js data-billing.js styles.css styles-frontend.css tweaks-panel.jsx ios-frame.jsx`
> ⚠️ 仍以 `ls modules/` 为准,别照念。

---

## 4. 强制规则(易忽略)

### A. 版本记录(强制,别等提醒)
每次改代码 → `modules/version.jsx` 顶部加一条:
- 新条 `current:true`,把上一条改 `current:false`(永远只有一条 current)
- `ver` 看顶部最新 +0.0.1
- `changes:[{ type:'fix'|'add'|'modify'|'remove'|'feat', text:'...' }]`
- 小改动(bug / 文案 / 样式)也要记,写清改了什么 + 为什么

### B. 导出代码(强制排除)
排除 `uploads/`、任何 `舊備份*/old*/backup*/_bak*`、`screenshots/`。
做法:`run_script` copy 需要的档案到临时 `_export/` → `present_fs_item_for_download` 打包 zip → 完成后删 `_export/`。**不要**直接打包整个根目录(会带出 uploads)。

### C. 不要改路由格式
`home` / `section:<名>` / `mod:<navKey>` / `prd_overview` / `prd_home` / `version` / `phase:P0` / `feat:P0-1`。一改全断。parseRoute(app.jsx ~138 行)决定每个路由的 parent(返回按钮按层级回退)。

### D. 优先级 pill 三处渲染
首页 hc-row / 大项页 fc-child / PRD 卡片 —— 改样式三处同步。

### E. ⚠️ 各 jsx 模块「共享全局作用域」(易踩坑)
所有 `<script type=text/babel>` 模块的**顶层声明会泄漏到全局**(Babel 把 `const`→`var`、`function` 挂 window),按 index.html 的 `<script>` 顺序**后载入覆盖先载入**(last-wins)。
- 后果:两个文件若有同名顶层 helper(`WRCard`/`DocRow`/`T`/`fmtDT`...),后载入的会覆盖先载入的。
- 现状:`modules/withdraw_review.jsx`(line 31,商户「代理提款审核」)是 `modules/my_withdraw_progress.jsx`(line 50,代理端,**更晚载入**)的副本。两边相同的 helper 没事;但 withdraw_review 里**任何被改动 / 与代理端分歧的顶层函数,必须改唯一名**,否则被代理端旧版覆盖、改动失效。
- 已处理:withdraw_review.jsx 的 doc 卡片 helper 已改 `WRCard/FSCard/POCard/DocRow → WRV_WRCard/WRV_FSCard/WRV_POCard/WRV_DocRow`;翻译函数 `T → WRV_T`(且强制读中文字典,见下条)。后续再改直接编辑 `WRV_*`。
- ⚠️ **语言泄漏**:withdraw_review 是商户后台,必须**永远中文**。它曾用 `const T = window.t` 跟随代理端 `useAgentLang`,代理后台切英文时商户这页也变英文。已修:`WRV_T` 强制读 `window.APS_I18N.zh`,并移除组件内 `useAgentLang()` 订阅。任何商户后台模块复制自代理端的,都要确认不跟随 useAgentLang。
- 通则:复制别的模块来改时,**先把要改的顶层标识符加唯一前缀**再动手。

---

## 5. 用户偏好

- PM 用户、非工程师;部署走 GitHub 网页上传 + Netlify(publish dir = `/`,入口 index.html,无 package.json / 无 build)
- **简体中文** UI(代码注释中文)
- 白底浅色 + 蓝色主色 `--brand:#3b82f6`;字体 Inter / Noto Sans SC / JetBrains Mono(等宽用于 ID/数字)
- **不要装饰性图标 / emoji**,务实风
- 回答尽量简短,先结果后理由
- 不要凭记忆答模块数 / 清单 —— 永远先 `ls`

---

## 6. 最近在做什么(v3.6.x 主线 = 提款 / 财务核算)

最近十几个版本都围绕 **代理后台「提款审核进度」→ 单据明细弹窗** 在打磨:
- 提款申请单弹窗、财务核算单(FS)、付款单(PO)三种单据弹窗的排版重构(对齐佣金结算单详情:标题 18/700、宽 400、蓝色竖条分区标题 `drawer-sec`、单列 label 左/值 右)
- 订单状态文字化(审核中橙 / 已通过绿 / 已拒绝红;核算中 / 已驳回 / 已转结 / 核算完成)
- 收款资料统一读代理 `_payment`;「提款申请来源」区块;底部「联络线上客服」(`window.APS_OPEN_CONTACT`)
- 涉及文件:`modules/my_withdraw_progress.jsx`、`modules/withdraw_review.jsx`、`data-billing.js`

无已知待修 bug。

---

## 7. 几个有用的 window 全局钩子

- `window.goRoute(r)` 跳路由 · `window.APS_SWITCH_BACKEND(tab)` 切 tab
- `window.APS_AGENT_LOGOUT()` 代理登出 · `window.CURRENT_AGENT_ID` 当前登入代理
- `window.APS_OPEN_CONTACT()` 开「联系我们」弹窗
- `window.t(k, fallback)` / `window.useAgentLang()` 代理后台 i18n
- `window.useTweaks(defaults)` Tweaks(density / accent)
- 各模块挂在 window 上(如 `window.FrontendModule`、`window.AgentDashboardModule`),app.jsx 用 `<window.XxxModule/>` 渲染

### ⚡ 验证代理后台 — 最快登入(别手填账号!)
登入弹窗有「快速选择已创建账户」列表,每条有「填入」按钮,点了自动填账号+密码。标准脚本:
1. 切 tab:点顶部「专业代理后台」(或 `window.APS_SWITCH_BACKEND`)
2. 点「登入」开弹窗
3. 在快速选择列表找 **AC範例6**(`AC100006 · rajeshmedia / Test@1234`)→ 点它那条的「填入」按钮(账号+密码一次填好)— **不要手动 setVal 一个个填**
4. 点弹窗内「登入」
5. `window.CURRENT_AGENT_ID === 'AC100006'` 即成功 → `window.goRoute('mod:xxx')`
- 一次脚本跑完(切 tab→填入→登入→跳页),别分多次 eval 试探。
- 商户后台不用登入,直接 `goRoute('mod:xxx')` 更快。

---

**完。** 读完本文件 + CLAUDE.md(只取其规则/偏好,忽略其过时清单)即可完整接续。
