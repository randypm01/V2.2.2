# 博彩平台_專業代理後台系統 v1.0(P0 精簡版)— 项目记忆

> 用于在新对话中无缝接续。新 chat 开始时,Claude 会先读这份文件。

---

## ⚠️ 这是 P0 精简版

- 只保留 **P0-1 ~ P0-14** 共 14 个 feat
- **P1 / P2 / P3 全部已移除** — 不要扩展、不要恢复
- 顶部 PRD tab 只显示 P0 阶段
- 商户后台 / 代理后台 侧栏只剩 P0 模块
- 如果用户后续要做 P1+,请明确建议「另开新专案」,不要在本专案恢复

---

## 一、项目目标

为博彩平台「专业代理推广分润系统」做高保真原型(P0 部分),覆盖代理招募 → 拉玩家 → 算佣金 → 出结算的完整链路。

**主入口**:`index.html`(纯前端 HTML + React + Babel,无构建)

**部署**:全新 GitHub repo + 全新 Netlify(待用户建立)

---

## 二、三个后台的关系(顶部 tab 切换)

| Tab | 视角 | P0 范围 |
|---|---|---|
| **PRD 规划** | 产品路线图 | 仅 P0 阶段 14 个 feat |
| **商户后台_專業代理** | 商户运营管理代理网络 | P0-1 / -3 / -4 / -5 / -7 / -8 / -9 / -10 / -11 / -12 / -14 |
| **專業代理後台** | 代理本人自助门户 | P0-3 / -4 / -6 / -7 / -8 / -9 / -13 / -14 |

三者**共享底层数据**(代理 / 玩家 / Code / CPA / 分润 / 结算)。

---

## 三、文件结构

```
index.html          # 主入口 + script 引入顺序
app.jsx             # 主 App + 路由 + 顶栏 + 侧栏(已精简到只显示 P0)
ui.jsx              # 共享 UI 原语
data.js             # 假数据生成 + 中文标签
styles.css          # 全局样式
tweaks-panel.jsx    # Tweaks 面板
modules/   # 共 22 个 jsx 文件,index.html 全部引用,不可少
  # —— 商户后台(P0)11 个 ——
  dashboard.jsx       # P0-11 仪表盘
  agents.jsx          # P0-1  代理账户管理
  codes.jsx           # P0-3  分享 Code(商户视角)
  players.jsx         # P0-4  玩家管理(商户视角)
  cpa.jsx             # P0-5/P0-6 CPA 管理 + 审核
  revshare.jsx        # P0-7  分润合作模式
  settlement.jsx      # P0-8  结算单生成与审核
  wallet.jsx          # P0-9  代理钱包(商户视角)
  risk.jsx            # P0-10 风控玩家名单
  logs.jsx            # P0-12 操作日志
  notifications.jsx   # P0-14 通知管理(商户配置)
  # —— 代理后台(P0)10 个 ——
  agent_common.jsx    # 代理后台共用组件
  agent_dashboard.jsx # 代理仪表盘(window.AgentDashboardModule)
  agent_profile.jsx   # P0-13 我的账户(window.AgentProfileModule)
  agent_notify.jsx    # P0-14 通知中心(window.AgentNotifyModule)
  my_codes.jsx        # P0-3  我的分享 Code
  my_players.jsx      # P0-4  我的玩家
  my_cpa.jsx          # P0-6  CPA 报表
  my_revshare.jsx     # P0-7  分润报表
  my_settlement.jsx   # P0-8  结算单
  my_wallet.jsx       # P0-9  我的钱包 / 提款
  # —— PRD 数据 1 个 ——
  prd.jsx             # PRD_FEATURES + PHASES(只剩 P0)
uploads/
  商戶後台_專業代理後台.txt   # 原始 PRD 文档
  專業代理後台.docx            # 原始 PRD 文档
```

⚠️ **重要**:不要用记忆 / 摘要回答模块数量或清单 — 永远 `ls modules/` + 读 `index.html` 的 `<script>` 引用清单核对。

---

## 四、PRD 数据结构(modules/prd.jsx)

只剩 P0 一个阶段。每个 feat:
```js
{ id:'P0-8', name:'结算单生成审核', week:'W4', dev:8, status:'done',
  side:'共用',
  mapping:[
    { backend:'merchant', mod:'settlement', path:'商户后台 → 收益 → 结算管理' },
    { backend:'agent',    mod:'my_settlement', path:'代理后台 → 收益 → 结算单' }
  ],
  why:'...', scope:[...], deps:[...]
}
```

---

## 五、设计系统约定

- **配色**:白底(`--bg-1: #ffffff`)+ 浅灰侧栏 + 蓝色主色 `--brand: #3b82f6`
- **字体**:Inter / Noto Sans SC / JetBrains Mono(等宽用于 ID / 数字)
- **侧栏**:固定宽度,大项可折叠
- **PRD 阶段色**:P0 绿(`#22c55e`)— 这是 P0 版,只有这一个色
- **优先级 pill**:固定 42px 宽,色块底,白字
- **路由**:`home` / `section:运营` / `mod:agents` / `prd_overview` / `phase:P0` / `feat:P0-1`

---

## 六、关键交互

1. **首页** = 大项卡片网格,内嵌完整子项列表(每行带 PRD pill + alert 红点)
2. **大项页** = 该大项下所有子项卡片
3. **PRD 阶段页** = P0 全部 14 个 feat
4. **feat 详情页** = why / scope / deps + 「实现位置」区块
5. **顶栏 logo 三态**:PRD = folder + "PRD 规划";商户 = building + "商戶後台_專業代理";代理 = users + "專業代理後台",均 v1.0
6. **返回按钮** = 按层级返回(parseRoute 决定 parent)

---

## 七、用户偏好

- **PM 用户,非工程师** — 部署走 GitHub 网页上传 + Netlify
- **简体中文** UI(代码注释中文)
- **白底** 浅色风格
- **不要装饰性图标 / emoji**,务实风
- **回答尽量简短**,先给结果再给理由

---

## 八、新 chat 接续指引

1. 先 `read_file CLAUDE.md`(就是这份)
2. **务必 `ls modules/`** 看真实文件清单,不要照念本文档第三章
3. **务必读 `index.html` 的 `<script>` 段**,核对所有 jsx 都被引用了
4. 读 `app.jsx` 顶部 NAV / `modules/prd.jsx` 顶部 PRD_FEATURES
5. 改东西优先 `str_replace_edit`,大改才 `write_file`
6. **不要改路由格式**(home / section: / mod: / phase: / feat: / prd_overview)— 一改全断
7. **优先级 pill 在三处渲染**(首页 hc-row / 大项页 fc-child / PRD 卡片),改样式记得三处同步

---

### 历史教训(避免重蹈)

- 用户问「modules 有几个」时不要凭记忆答 — 必须先 `ls modules/`
- CLAUDE.md 的文件清单可能滞后于实际文件,以 `ls` + `index.html` script 引用为准
- 拆分 / 精简项目时,先读 `index.html` 列出所有引用,才能算出真实依赖

---

## 九、Token / 上下文管理

- 用 `str_replace_edit` 改局部,避免整文件 rewrite
- 不要重复读同一份大文件;读过就记住
- 完成阶段性任务后,主动用 snip 清理已结束的探索过程
- 关键决策落到这份 CLAUDE.md
