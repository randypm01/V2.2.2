// 版本历史 — PRD 规划 → 版本
// 用户告知做事情时会带上版本号(如 v222 = v2.2.2),完成后在此追加更新项
const VERSIONS = [
  {
    ver: 'v3.0.15',
    date: '2026-05-15',
    current: true,
    changes: [
      { type: 'add', text: '商户后台 → 已创建代理 → 查看&配置 详情抽屉新增两个 Tab(权限配置 后面):「流量来源」「收款方式」,商户创建代理 + 自行申请代理 都生效' },
      { type: 'add', text: '流量来源 Tab:列表展示代理推广所使用的频道/平台账号/落地页 URL;无数据时显示「(未填写流量来源)」;编辑模式下可改输入框、移除单条、新增多条' },
      { type: 'add', text: '收款方式 Tab:付款方式锁定 UPI(蓝色 chip);UPI ID + 收款人姓名 两个字段(编辑模式下可改);底部黄色提示「当前阶段仅支持 UPI,后续会开放其他渠道」' },
      { type: 'add', text: '示例数据:agent._traffic / agent._payment 没有时自动生成默认 2 条 URL(youtube/telegram) + UPI 默认值(loginName@paytm + 代理名作收款人),与 AgentDetail 保持一致体验' },
      { type: 'modify', text: 'saveEdit 操作日志映射 + cancelEdit 重置逻辑 扩展支持 traffic / payment;切换代理时 useEffect 同步重置;编辑按钮在两个新 tab 下也显示' },
    ],
  },
  {
    ver: 'v3.0.14',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '注册弹窗 第 3 页 密码校验规则调整:① 请填写此栏位 ② 最少 8 个字元 ③ 密码必须包含 8-50 个字元,并包含字母大小写、数字' },
      { type: 'remove', text: '注册弹窗 第 3 页 删除「强密码」校验项(原长度 >=12 视为强密码)' },
      { type: 'modify', text: 'passChecks.pattern 规则从 /^[a-zA-Z0-9#_.\\/&!@]+$/ 改为强制要求 [A-Z] + [a-z] + [0-9],并限定长度 8-50' },
    ],
  },
  {
    ver: 'v3.0.13',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '注册弹窗 第 2 页:「Youtube、Tiktok、Telegram、Facebook...」从输入框 placeholder 移到 标签「流量来源链接(选填)」后方,作为浅色 hint 文字内联显示;placeholder 改回「https://domain.com」' },
      { type: 'add', text: '注册弹窗 第 2 页:流量来源链接 改为多条 — 输入框下方新增「+ 新增流量来源链接」按钮(复用 .contact-add-btn 蓝色虚线胶囊),可添加多个 URL;第 2 条起每行尾带 − 移除按钮' },
      { type: 'modify', text: 'form 模型 trafficUrl(string)→ trafficUrls(array of string),默认 [\'\'];新增 updateTraffic/addTraffic/removeTraffic 三个 handler' },
    ],
  },
  {
    ver: 'v3.0.12',
    date: '2026-05-15',
    changes: [
      { type: 'remove', text: '注册弹窗 第 1 页 基本资料:删除「联系方式 *」外标签 + 「· 至少填写 2 项」hint;删除 .contact-list 外层边框/灰底,行直接平铺,行间距 8px' },
      { type: 'remove', text: '注册弹窗 第 1 页:删除「联系类型/联系资料」表头行' },
      { type: 'modify', text: '注册弹窗 第 1 页:手机国际码改为固定显示 +91(印度) — 移除国码下拉,只保留输入框前的 +91 prefix' },
      { type: 'modify', text: '注册弹窗 第 2 页 流量来源与收款:「偏好付款方式」改名「收款方式」,值锁定为 UPI(只读灰底标签,不可选)' },
      { type: 'remove', text: '注册弹窗 第 2 页:删除「电子邮件」付款邮箱字段(payEmail)' },
      { type: 'modify', text: '注册弹窗 第 2 页:「流量来源链接」标签后加「(选填)」,placeholder 改为「Youtube、Tiktok、Telegram、Facebook ...」;step2 校验改为始终通过(下一页按钮始终亮起)' },
      { type: 'modify', text: '布局调整:第 2 页从 2 列网格改为单列(流量来源链接占满 + 收款方式独行)' },
    ],
  },
  {
    ver: 'v3.0.11',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '注册弹窗 副标题(欢迎加入文案 / step 2 流量介绍 / step 3 用户名问候)位置从 步骤指示器下方 移到 标题「注册」下方;步骤指示器始终显示在底部' },
      { type: 'add', text: '步骤指示器 3 个圆下方新增中文名称:基本资料 / 流量来源与收款 / 创建账户(EN: Basic Info / Traffic & Payment / Create Account)' },
      { type: 'add', text: '步骤名称根据当前 step 联动配色:已完成步骤蓝色 / 当前步骤深黑加粗 / 未来步骤灰色' },
    ],
  },
  {
    ver: 'v3.0.10',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '招募营销页 顶栏布局优化:.aglp-nav-inner 取消 max-width:1200px 居中限制,改为全宽 + grid 三栏布局(auto 1fr auto)— logo 靠左、actions 靠右、中间导航(费用/工具/仪表板/如何运作)真正居中' },
      { type: 'modify', text: '导航链接 .aglp-nav-links 改 justify-content:center,gap 加大到 32px' },
      { type: 'modify', text: '「成为合作伙伴」按钮配色更显眼:从 白底蓝字 改为 金橙渐变(#fbbf24 → #f59e0b)+ 深灰字 + 阴影;hover 上抬+加深阴影。在浅蓝 Hero 与白色顶栏上都很跳' },
      { type: 'modify', text: '小屏(<980px)顶栏 padding 调小到 12px 20px' },
    ],
  },
  {
    ver: 'v3.0.9',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '语言切换从两段胶囊(EN | 中文)改为下拉按钮:Globe 图标 + 当前语言短码(中 / EN) + Chevron;点击展开下拉,选项为 English / 繁體中文,带 active 高亮 + ✓ 勾选' },
      { type: 'add', text: '下拉支持深色变体(dark) — 招募营销页深蓝顶栏可传入 variant=\"dark\" 启用半透明白底玻璃态;登入后顶栏(白底)使用默认白色样式' },
      { type: 'modify', text: '招募营销页 顶栏「登入」左侧的胶囊改用通用 AgentLangSwitch(与登入后顶栏统一组件)' },
      { type: 'modify', text: '下拉点击 mask 自动关闭,Esc 不再单独绑(用 mask 即可)' },
    ],
  },
  {
    ver: 'v3.0.8',
    date: '2026-05-15',
    changes: [
      { type: 'add', text: '招募营销页 + 登入弹窗 + 注册弹窗 + 登入后页面(顶栏 / 侧栏 / 仪表盘 / 各模块 PageHead)全部接入中英文 i18n' },
      { type: 'add', text: '新增全局语言状态 window.APS_LANG_STORE(localStorage 持久化 + subscribe/publish);新增 React hook window.useAgentLang;新增 window.t(key, fallback) 翻译辅助函数;字典挂载在 window.APS_I18N.zh / en' },
      { type: 'add', text: '新增 window.AgentLangSwitch 通用胶囊组件(EN | 中文 圆角分段);在登入后 顶栏「用户胶囊」左侧固定显示,选择后整个登入后界面立即切换' },
      { type: 'add', text: '后台 i18n 字典 80+ 个 key 覆盖:top.* / nav.* / home.* / hero.* / page.* / login.* / reg.*' },
      { type: 'modify', text: '登入弹窗(LoginModal):标题 / 副标题 / 快速选择账户 / 输入框 placeholder / 显示密码 title / 记住账号 / 登入按钮 / 错误提示 / 底部「立即申请」全部 i18n' },
      { type: 'modify', text: '注册弹窗(RegisterModal):标题 / 4 步骤所有文案 / 申请人姓名 / 联系方式表头 / 流量来源 / 付款方式 / 用户名 / 密码 / 密码校验 4 项 / 条款 + 联盟讯息 / Complete / 成功页 4 行 / 订阅按钮 全部 i18n' },
      { type: 'modify', text: 'app.jsx 顶栏:专业代理后台品牌名 / 登出 文字 i18n;侧栏 AGENT_NAV(我的账户 / 推广&收益 + 4 个子项 + PRD首页)全部 i18n;App 顶部订阅 useAgentLang 触发整树重渲染' },
      { type: 'modify', text: 'AgentDashboardModule:你好 / 欢迎回来 / 通知中心 / 创建 Code / 4 张 KPI 卡(本月佣金 / 有效 CPA / 累计 NGR / 我的玩家)/ 近 30 天佣金趋势图标题 + 副标 i18n;日期 toLocaleString 在 EN 下用 en-US locale' },
      { type: 'modify', text: 'AgentHero:正常状态徽章 / 4 项 KPI(玩家 / 有效 CPA / 累计 NGR / 本月佣金)i18n' },
      { type: 'modify', text: 'my_profile / my_codes / my_players / my_revshare 4 个模块 PageHead title + subtitle i18n;模块内部表格列名 / 详情字段暂保持中文(后续逐步翻译)' },
      { type: 'modify', text: '原 LANDING_I18N 在 agent_login.jsx 内继续保留,语言状态从本地 useState 迁移到全局 useAgentLang,与登入后页面共享一个 lang 状态' },
    ],
  },
  {
    ver: 'v3.0.7',
    date: '2026-05-15',
    changes: [
      { type: 'add', text: '招募营销页 顶栏「登入」按钮左侧新增 EN / 中文 语言切换胶囊(参考网站前台 FeLangSwitch 样式),白底蓝字 active 态;选择后写入 localStorage(APS_LANDING_LANG)持久化' },
      { type: 'add', text: '新增 LANDING_I18N 中英文 i18n 表,覆盖整页:顶栏 / Hero(含标题/副标/4 项 KPI/3 张浮层卡)/ 福利 5 卡 / 费用 3 卡(badge + 列表) / 工具 5 卡 / 仪表板预览(KPI 标签 + 3 项特性) / 4 步骤 / 深色 CTA / Footer 版权 + 链接;切换 EN 后整页英文渲染,中文回切立刻生效' },
      { type: 'modify', text: '原硬编码的中文文案全部替换为 t.xxx 取值;Hero 大标题拆为 title_a / title_b / em / title_c 四段,适应中英文不同语序(英文「Earn Cash Without Any Hassle」,中文「赢取现金 一点也不麻烦哟」)' },
      { type: 'remove', text: '登入弹窗 / 注册弹窗内文案暂保持简体中文(后续如需也可加入 i18n)' },
    ],
  },
  {
    ver: 'v3.0.6',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '招募营销页 注册弹窗 第 1 页字段重构 — 按用户要求精简' },
      { type: 'remove', text: '删除字段:名字 / 姓氏 / 电子邮件 / 语言 / Messenger(选填) / Messenger 用户名 / 电话号码 / 国家' },
      { type: 'add', text: '新增字段「申请人姓名」(单字段,placeholder:真实姓名(与证件一致))' },
      { type: 'modify', text: '联系方式 改用商户后台「自行申请代理」弹窗同款动态列表:Email + Mobile 锁定为前两行必填,可「+ 新增联系方式」加 Telegram / WhatsApp;手机/WhatsApp 行自带国码下拉(13 国,默认 +86 中国);复用全局 .contact-list / .contact-row / .contact-type-locked / .contact-phone-input / .contact-add-btn 样式' },
      { type: 'modify', text: 'step1Valid 校验改为:申请人姓名非空 + 前两项联系方式 value 非空' },
      { type: 'modify', text: 'step3 副标题 form.firstName 引用改为 form.applyName(避免引用已删除的字段)' },
    ],
  },
  {
    ver: 'v3.0.5',
    date: '2026-05-15',
    changes: [
      { type: 'fix', text: '修复 招募营销页 顶栏在滚动时不固定的问题:.aglp 容器原本有 `overflow-y:auto` 会形成第二层滚动容器,使内部 sticky 失效;移除后页面滚动归还给外层 `.content`(app 主滚动容器),`.aglp-nav { position:sticky; top:0 }` 现在能正确钉在顶部' },
    ],
  },
  {
    ver: 'v3.0.4',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '招募营销页 配色优化 — 颜色太重的问题:Hero / CTA 区背景从深海军藍渐变(#0f172a → #1e3a8a)改为更亮的品牌蓝渐变(#2563eb → #3b82f6 → #60a5fa),并新增放射状装饰条纹层(repeating-conic-gradient + radial mask),呼应 1xBet 风格' },
      { type: 'modify', text: 'featured 卡片(RevShare)从深蓝渐变改为亮品牌蓝(#3b82f6 → #2563eb);徽章「最受欢迎」从金底棕字改为白底蓝字 + 阴影;CTA 按钮从金色改为白底蓝字' },
      { type: 'modify', text: 'gold 按钮(成为合作伙伴/CTA)从金橙渐变改为白底蓝字,与浅蓝 Hero 背景对比更柔和' },
      { type: 'modify', text: 'Hero 大标题强调字「麻烦」从亮金 #fbbf24 改为浅金 #fef3c7 + 柔光阴影,降低饱和度' },
      { type: 'modify', text: 'Hero KPI 大数字从金色改为白色,小字 + 标签调整透明度;eyebrow 胶囊从金色描边改为白色玻璃态(backdrop-filter blur)' },
      { type: 'modify', text: 'Footer 背景从纯黑 #0f172a 改为深灰蓝 #1e293b,层级更柔和' },
    ],
  },
  {
    ver: 'v3.0.3',
    date: '2026-05-15',
    changes: [
      { type: 'add', text: '招募营销页 新增「成为合作伙伴」注册流程(3 步骤弹窗 + 成功页),参考 1xBet 联盟注册流程' },
      { type: 'add', text: '步骤 1 「欢迎加入」:名字 / 姓氏 / 电子邮件 / 语言(8 种) / Messenger(选填,7 种) / Messenger 用户名 / 电话号码(国码下拉,13 国) / 国家;必填字段非空时下一页按钮才亮起' },
      { type: 'add', text: '步骤 2 「流量介绍」:流量来源链接 / 偏好付款方式(10 种,Skrill/Neteller/USDT/银行/支付宝等) / 付款电子邮箱' },
      { type: 'add', text: '步骤 3 「帐户资讯」:用户名 / 密码 / 重新输入密码;实时密码校验列表(请填写 / 最少 8 字元 / 字母+数字+特殊字符 / 强密码) + 重复密码校验;条款&条件 + 联盟讯息 两个 checkbox(前者必勾才能 Complete)' },
      { type: 'add', text: '步骤 4 「成功页」:绿色勾选大图标 + 「很高兴你加入我们!」+ 24 小时审查提示 + Telegram 订阅按钮' },
      { type: 'add', text: '步骤指示器:1 → 2 → 3 圆点 + 连接线,已完成步骤填蓝色 + ✓,当前步骤白底蓝圈,未来步骤灰色' },
      { type: 'add', text: '弹窗右上角 X 关闭 / Esc 键关闭 / 点击遮罩关闭;步骤 2/3 顶部左侧「< 上一步」箭头;登入弹窗底部「立即申请」与注册弹窗底部「立即登入」可互相切换' },
      { type: 'modify', text: '所有「成为合作伙伴 / 联系我们 / 加入我们 / 申请方案」按钮(顶栏 + Hero + 3 张费用卡 + CTA 区)统一指向注册弹窗;「登入」按钮单独指向登入弹窗' },
      { type: 'remove', text: '注册资料 暂时不同步到「商户后台 → 代理账户管理 → 自行申请代理」(按用户要求);后续如需打通,只需在 Complete 时调用 APS_addApplication' },
    ],
  },
  {
    ver: 'v3.0.2',
    date: '2026-05-15',
    current: true,
    changes: [
      { type: 'fix', text: '修复 招募营销页 Hero 右侧三张浮层数据卡片在中等视口宽度下被挤成「一字一行」竖排:加 min-width:180px + white-space:nowrap;容器 .aglp-hero-viz 加 min-width:340px;Hero 栏栅格比例 1.2fr/1fr → 1.1fr/1fr;新增 max-width:1180px 媒体查询,卡片缩小但不压扁' },
    ],
  },
  {
    ver: 'v3.0.1',
    date: '2026-05-15',
    changes: [
      { type: 'modify', text: '专业代理后台 登入页 重做为「招募营销 Landing Page」(参考 1x.partners/tw 结构):整页改为单页营销页,包含 顶栏 / Hero / 福利 / 费用 / 工具 / 联盟仪表板预览 / 4 步骤 / CTA / Footer 9 个区块' },
      { type: 'modify', text: '原登入表单 完整搬到「登入弹窗」中:顶栏右上「登入」按钮 + Hero 的「成为合作伙伴」按钮 + 各 CTA 按钮 均触发弹窗;表单字段(账号 / 密码 / 显示密码切换 / 快速选择已创建账户 / 记住账号 / 错误提示)与登入逻辑完全保留,Esc / 点击遮罩 / 关闭按钮 均可关闭' },
      { type: 'add', text: 'Hero 区块:大标题「赢取现金 · 一点也不麻烦哟」+ 4 项 KPI 横条(15 年市场 / 300万+ 每日玩家 / 62 国 / 40% 营收分享上限)+ 3 张浮层数据卡可视化(本月佣金 / 推介玩家 + 柱图 / 营收分享当前等级进度条)' },
      { type: 'add', text: '费用区块:3 张方案卡片(CPA 单付费 / RevShare 营收分享 40% — 标记「最受欢迎」/ Hybrid 混合型),含特性列表 + CTA' },
      { type: 'add', text: '工具区块:5 张推广工具卡(横幅&落地页 / Smart Link / JSON Push / 促销代码 / S2S 整合)' },
      { type: 'add', text: '联盟仪表板预览:左侧 3 项特性(我的账户 / 实时统计 / 详细报告)+ 右侧模拟仪表板截图(3 KPI + SVG 折线图)' },
      { type: 'add', text: '4 步骤区块:注册 → 发布广告 → 推介新顾客 → 提款,顶部带数字徽章 + 大图标' },
      { type: 'add', text: '深色 CTA 区块 + 简洁 Footer(© 2026 Partners-MM v3.0.0)' },
      { type: 'add', text: 'ui.jsx 新增 7 个图标:star / layout / send / code / plug / zap / userPlus(供营销页使用)' },
      { type: 'modify', text: '原 .al2-* 旧登入页样式不再使用(保留 styles.css,可后续清理)' },
    ],
  },
  {
    ver: 'v3.0.0',
    date: '2026-05-15',
    changes: [
      { type: 'baseline', text: '版本号基线升级至 v3.0.0(用户指示) — 后续小版本从 v3.0.1 起递增;之前的 v2.x 历史记录全部保留作为参考' },
    ],
  },
  {
    ver: 'v2.5.14',
    date: '2026-05-14',
    changes: [
      { type: 'modify', text: '专业代理后台 侧栏整合:推广 + 收益 合并为「推广&收益」,内含 分享 Code 与链接 / 玩家损益 / 分润报表 三个子项(分润报表从原「收益」section 移入)' },
      { type: 'remove', text: '隐藏「收益」section 及子项「CPA 报表」(my_cpa.jsx 模块文件与路由分发保留,仅 NAV 不展示)' },
    ],
  },
  {
    ver: 'v2.5.13',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '专业代理后台 → 推广 → 分享 Code 与链接 表格重构(全中文):Code / 名称 / 短链 / 备注 / 注册 / 充值 / 提款 / 充值转化率 / ARPPU / 佣金 / 状态 / 操作 — 删除「点击数 Clicks / 渠道 / Campaign / FTD / CPA / CR%」' },
      { type: 'modify', text: 'KPI 同步精简:Code 数量 / 累计注册 / 累计充值 / 累计提款 / 累计佣金(去掉 累计 Clicks 与 累计 FTD)' },
      { type: 'modify', text: '5 条示例数据补上 短链 / 备注 / 充值 / 提款 字段(去掉 channel / campaign / landing / ftds / cpaCount / clicks)' },
      { type: 'modify', text: '创建 / 编辑 Code 弹窗精简表单:Code 后缀 / 名称 / 短链(选填,留空自动生成)/ 备注;移除 渠道 / Campaign / 落地页 三个字段' },
      { type: 'modify', text: '渠道对比 tab 改为「各 Code 充值对比 / 各 Code 佣金对比」(不再按渠道分组)' },
      { type: 'modify', text: '工具栏去掉「全部渠道」筛选;短链列加复制按钮' },
      { type: 'add', text: '充值转化率 = 充值玩家数 / 注册玩家数(38% 示例转化估算);ARPPU = 充值金额 / 充值玩家数' },
    ],
  },
  {
    ver: 'v2.5.12',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '修复:专业代理已登入后,「我的账户 → 帐户状态」仍显示「未启用」 — 原 flip 逻辑只在「商户后台 / 代理账户管理」模块挂载时触发,代理直接登入后没访问商户后台则状态不会翻;新增 app.jsx onLogin 直接写商户 store status pending → active + useCurrentAgent 增加防御性 override(已 mark 过登入的代理强制 active),双保险' },
    ],
  },
  {
    ver: 'v2.5.11',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '网站前台 专业代理申请弹窗 隐藏右侧「审核员视角(后台 Demo)」面板(.apply-admin-rail { display:none }) — 上线时用户不应看到 Demo 控件;代码与 i18n 保留,后续如需调试再开 CSS' },
    ],
  },
  {
    ver: 'v2.5.10',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '专业代理后台 侧栏「我的玩家」改名「玩家损益」;my_players.jsx PageHead 标题同步;副标题改成「我推广而来的玩家清单与盈亏分析」' },
      { type: 'add', text: '玩家损益:加入 5 条固定示例玩家(P88001001~005),覆盖 已首存 / 有效CPA / VIP / 风控中 / 已拒 五种典型场景,所有 KPI / Tabs / 筛选 / 详情抽屉 都基于真实+示例数据合并展示' },
      { type: 'modify', text: '分享 Code 与链接 功能完善:codes 改为 useState,创建后立即入列;新增 编辑弹窗(改名称/渠道/Campaign/落地页;Code 后缀创建后锁定);新增 启用 ⇄ 暂停 切换(单按钮);新增 删除(二次确认弹窗);操作列扩到 6 个图标按钮(链接/QR/复制/编辑/启停/删除)' },
      { type: 'add', text: '分享 Code 与链接:加入 5 条固定示例 Code(MAIN/IG2026/TG/WC2026/VIP),覆盖 YouTube / Instagram / Telegram / TikTok 四个渠道与 启用/暂停 两种状态;KPI、Code 列表、渠道对比 都基于完整数据展示' },
    ],
  },
  {
    ver: 'v2.5.9',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'remove', text: '专业代理后台 → 我的账户 → 安全设置 删除:登录 IP 白名单 / 登录通知 / 登录设备记录(表格) — 只保留 登录密码 + 二步验证 2FA 两项' },
      { type: 'remove', text: '专业代理后台 侧栏删除 3 个入口:通知中心 / 结算单 / 我的钱包·提款 — 模块文件 my_notify.jsx / my_settlement.jsx / my_wallet.jsx 与路由分发保留(便于后续恢复)' },
    ],
  },
  {
    ver: 'v2.5.8',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '专业代理后台 → 我的账户 → 基本资料 完全按商户后台「代理账户管理 → 查看&配置 → 基本资料」字段同步:代理创建方式 / 用户ID或创建代理人 / 代理ID / 创建时间 / 代理名称 / 登入帐号 / 登入密码 / 代理类型 / 上级代理 / 帐户状态 / 联系方式表(Email/手机/Telegram)/ 申请理由(仅自行申请)/ 备注' },
      { type: 'remove', text: '专业代理后台 → 基本资料 删除商户后台没有的字段:代理等级 / 层级L1 / 市场国家 / 结算币种 / 注册时间(原 toLocaleDateString)。统一改用「创建时间」精确到秒,与商户后台一致' },
      { type: 'remove', text: '清理 agent_profile.jsx 中残留的旧 form-grid 字段 + payout(结算账户)tab JSX 块' },
      { type: 'modify', text: '布局改成与商户后台一致的两列只读卡片(灰底 + 分隔线 + label-value),联系方式用 .tbl 表格;顶部蓝色提示「该页信息与商户后台同步」' },
    ],
  },
  {
    ver: 'v2.5.7',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '修复 v2.5.6 登入专业代理后台崩溃:`useCurrentAgent` 调用了不存在的 `store.getList()` 方法(store 实际暴露的是 `store.list` 数组),改为直接读 `store.list`;同步修复 agent_revenue.jsx 中同样的误用' },
    ],
  },
  {
    ver: 'v2.5.6',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'remove', text: '专业代理后台 → 我的账户 删除「结算账户」tab' },
      { type: 'modify', text: '专业代理后台 → 我的账户 tab 顺序调整:基本资料 / 合作方案 / 安全设置(原 基本资料 / 安全设置 / 合作方案 / 结算账户)' },
      { type: 'modify', text: '专业代理后台 → 我的账户 → 基本资料 与 商户后台「代理账户管理」该代理记录同步:useCurrentAgent 优先从 APS_MERCHANT_AGENTS_STORE 取,商户编辑代理基本资料后,代理本人后台立刻看到同一份数据;联系方式优先从 _appData.contacts 取(自行申请代理填写的真实值);所有字段改只读 + 顶部蓝色提示「该页信息与商户后台同步,如需修改请联系商户运营」' },
    ],
  },
  {
    ver: 'v2.5.5',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'remove', text: '商户后台侧栏 隐藏「收益」整个 section + 子项「CPA 管理」 — 简化版当前阶段不需要;modules/cpa.jsx 与路由分发保留,后续如需恢复仅需把 NAV 项加回即可' },
    ],
  },
  {
    ver: 'v2.5.4',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '侧栏「报表」section 顺序调整:玩家损益 与 代理推广链接 互换位置 — 现在顺序为 代理收益 / 代理推广链接 / 玩家损益' },
    ],
  },
  {
    ver: 'v2.5.3',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '侧栏调整:「分享 Code 与链接」从「运营」section 移到「报表」section,并重命名为「代理推广链接」(NAV label + codes.jsx PageHead 标题同步;路由 key 保持 codes 不变)' },
      { type: 'modify', text: '「报表」section 现在 3 个子项:代理收益 / 玩家损益 / 代理推广链接' },
    ],
  },
  {
    ver: 'v2.5.2',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '侧栏调整:风控与配置 → 风控管理 重命名为「玩家风控管理」(NAV label + risk.jsx PageHead 标题同步)' },
      { type: 'modify', text: '侧栏调整:玩家管理 从「运营」section 移到「报表」section,并重命名为「玩家损益」(NAV label + players.jsx PageHead 标题同步;路由 key 保持 players 不变,旧链接仍有效)' },
      { type: 'modify', text: '「报表」section 现在包含:代理收益 / 玩家损益 两个子项' },
    ],
  },
  {
    ver: 'v2.5.1',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'remove', text: '商户后台 收益 section 删除「结算管理」模块入口;删除 modules/settlement.jsx;index.html 移除引用;app.jsx 路由分发移除 settlement case' },
      { type: 'modify', text: 'PRD P0-8 结算单生成审核 mapping 去掉 merchant settlement,仅剩代理后台 my_settlement' },
      { type: 'add', text: '代理后台「收益 → 结算单」(my_settlement)保留 — 代理本人仍可查看结算单' },
    ],
  },
  {
    ver: 'v2.5.0',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '修复 v2.4.49 侧栏「报表 → 代理收益」未出现的问题:NAV 数组未真正写入,这次显式插入到「收益」与「风控与配置」之间;openSections 默认展开补上「报表」+ 保留「收益」' },
      { type: 'modify', text: '版本号按用户要求从 v2.5.0 起步' },
    ],
  },
  {
    ver: 'v2.4.49',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'add', text: '商户后台侧栏 风控与配置 上方新增大项「报表」,内含子项「代理收益」' },
      { type: 'add', text: '新增 modules/agent_revenue.jsx 模块:KPI 4 个(总收益 / 总 NGR / 本期未结算 / 活跃代理)+ 工具栏(搜索 + 代理类型筛选 + 日期范围)+ 表格 10 列(代理ID / 名称 / 类型 / 玩家数 / NGR / 單付費分潤 / 收益分潤 / 本期未結算 / 總收益 / 操作),所有数值列可点击表头排序,分页 12 条/页' },
      { type: 'add', text: '数据源:从 window.APS_MERCHANT_AGENTS_STORE 实时取代理列表;CPA/分润按 commission 拆分(40~69% CPA + 余下分润,基于 ID 末三位稳定分配)' },
      { type: 'modify', text: 'app.jsx 侧栏分组默认展开补上「报表」;NAV 新增大项 + 路由分发 + fallback whitelist;index.html 引用 agent_revenue.jsx' },
    ],
  },
  {
    ver: 'v2.4.48',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'remove', text: '商户后台侧栏删除 3 个模块入口:代理钱包(收益)、通知管理(风控与配置)、操作日志(风控与配置) — 简化版只保留代理网络核心审计/结算链路' },
      { type: 'remove', text: '删除 modules/wallet.jsx / modules/notifications.jsx / modules/logs.jsx 三个文件;index.html 同步移除 3 个 script 引用' },
      { type: 'remove', text: 'app.jsx 路由分发移除 wallet / notifications / logs 三个 case' },
      { type: 'modify', text: 'PRD 数据同步:P0-9 代理钱包 mapping 去掉 merchant wallet(仅剩代理后台 my_wallet);P0-14 通知中心 mapping 去掉 merchant notifications(仅剩代理后台 my_notify);P0-12 操作日志 标记为 removed,mapping 清空' },
      { type: 'modify', text: '代理后台 my_wallet / my_notify 模块保留 — 代理本人仍可使用钱包与通知' },
    ],
  },
  {
    ver: 'v2.4.47',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '修复:商户创建代理 / 自行申请通过创建代理 时,弹窗里配置的「分润模式 + 权限配置」未持久化到新代理对象,导致「查看&配置 → 分润模式」打开是空状态 — 两个 onSubmit 路径都补上 `_comm: a.commission` 与 `_perms: a.perms`' },
    ],
  },
  {
    ver: 'v2.4.46',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '创建代理 分润模式 下拉框 收益分潤方案 选项格式优化:补上中间的「方案類型」 — 改成「收益分潤方案 · 用戶損失基數分潤 · 方案名稱」 / 「收益分潤方案 · 週期資產變動分潤 · 方案名稱」三段式;單付費分潤方案无子类型仍保持两段(單付費分潤方案 · 方案名稱)' },
    ],
  },
  {
    ver: 'v2.4.45',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '下拉框颜色与外层容器太接近看不清:.input / .select / .textarea 背景改纯白 #fff(原 #f8fafc 与 bg-2 几乎一致),增加 hover 边框反馈;创建代理 結算/分潤時間 radio 容器底色加深到 #f1f5f9,让内嵌白色下拉框对比更清晰' },
    ],
  },
  {
    ver: 'v2.4.44',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'fix', text: '修复 `.select` 下拉框文字看不清 + 原生下拉箭头位置偏移:给 .input/.select 固定 height:32px;.select 改用 appearance:none + 自定义 SVG 箭头(右内边距 30px,箭头固定在右 10px),所有下拉(创建代理 分润模式 / 表格筛选 等)样式一致' },
    ],
  },
  {
    ver: 'v2.4.43',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '创建专业代理账户 弹窗 第 2 步「分润模式」重做:删除旧的 CPA / RevShare / Hybrid 3 卡片选择,改成「結算/分潤時間(2 選 1)+ 分潤方案類型(多選下拉)」 — 同时适用于「商户创建代理」和「自行申请代理通过」两个入口' },
      { type: 'add', text: '結算/分潤時間 radio 2 选 1:每周固定(子下拉 每周一~每周日)/ 每月固定(子下拉 每月1號~每月31號)' },
      { type: 'add', text: '分潤方案類型 多選下拉:options 读取分润管理 SEED_SINGLE + SEED_REVENUE,显示格式「分潤模式 · 方案名稱」(如「單付費分潤方案 · 方案1_有效首次存款」/「收益分潤方案 · 用戶損失基數分潤」);可 + 新增分潤方案 / − 删除单行;最少保留 1 项' },
      { type: 'add', text: '弹窗右上角「分潤管理」链接:点击关闭弹窗并跳转到分润管理页(window.goRoute 存在时)' },
      { type: 'add', text: '查看&配置弹窗 分润模式 tab 同步切换为新组件(window.CommissionModeForm);旧字符串数据 \'RevShare\' 自动迁移为默认对象' },
      { type: 'add', text: 'revshare.jsx 暴露 window.RV_PLANS / window.CommissionModeForm / window.resolvePlanLabels,供 agents.jsx 复用' },
    ],
  },
  {
    ver: 'v2.4.42',
    date: '2026-05-14',
    current: true,
    changes: [
      { type: 'modify', text: '收益分潤 新增弹窗 简化:删除「先选类型 → 再填表」两步流程,改成单一弹窗 — 顶部「方案類型」下拉框,选择后自动带出对应的 計算口徑流程(只读,不可编辑)' },
      { type: 'modify', text: '計算口徑流程框 改为只读 pre:未选类型时灰底占位「選擇方案類型後,此處會帶出對應的計算公式」;选了类型立刻渲染对应公式;编辑模式下方案類型锁定不可改' },
    ],
  },
  {
    ver: 'v2.4.41',
    date: '2026-05-14',
    changes: [
      { type: 'modify', text: '分润管理 内容页按 PRD 重做:删除旧的 4 个 tab(CPA / RevShare / Hybrid / 下级),改成「單付費分潤 / 收益分潤」两个 tab' },
      { type: 'add', text: '單付費分潤 tab:9 列表格(方案名稱 / 最低首存 / 流水倍數 / 最低 NGR / 有效天數 / 活躍留存 toggle / 留存天數 / 排除提款過玩家 toggle / 備註)+ 新增/編輯 弹窗,含两个 toggle 联动(活躍留存 关闭时活躍留存天數 禁用)' },
      { type: 'add', text: '收益分潤 tab:7 列表格(方案類型 / 方案名稱 / 代理分成比例 / 計算口徑 查看 / 封頂金額 / 備註)+ 两步新增(先选类型 用戶損失基數分潤 / 週期資產變動分潤,再填详细参数)' },
      { type: 'add', text: '計算口徑流程 完整展示 STEP-1~5 公式(用戶損失基數分潤)和 STEP-1~3 公式(週期資產變動分潤),编辑表单内 + 列表「查看」按钮共用同一段公式' },
      { type: 'add', text: '所有方案支持 编辑 / 刪除(刪除二次确认弹窗,提示「正在使用此方案的代理需重新指派」)' },
    ],
  },
  {
    ver: 'v2.4.40',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '代理等级管理页面崩溃修复:`window.UI.Icon` 在 ui.jsx 中未导出(取自 window.Icon),改为直接用 window.Icon;APH 由 window.UI.PageHead 取得' },
    ],
  },
  {
    ver: 'v2.4.39',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '商户后台侧栏:分润管理 从「收益」分组移到「运营」分组,紧跟「代理账户管理」之后' },
      { type: 'add', text: '商户后台新增 代理等级管理 模块(modules/agent_levels.jsx),位于「运营 → 分润管理」下方;含 5 个示例等级(入门/进阶/高级/金牌/钻石)、最低玩家数 + 最低 NGR + CPA / RevShare 加成 + 代理数,带晋级规则说明' },
      { type: 'add', text: 'app.jsx 路由分发新增 agent_levels case;index.html 引入 agent_levels.jsx' },
    ],
  },
  {
    ver: 'v2.4.38',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '说明弹窗 已创建代理 操作记录 chip 列表实际加入 编辑(v2.4.37 因 edit 失败漏掉,这次补上)' },
    ],
  },
  {
    ver: 'v2.4.37',
    date: '2026-05-13',
    changes: [
      { type: 'feat', text: '完善已创建代理详情(查看&配置)编辑功能:点击 编辑 → 进入编辑模式,显示 取消/保存 按钮' },
      { type: 'feat', text: '基本资料 tab 可编辑:代理名称、登入帐号、备注(textarea 在只读时灰底)' },
      { type: 'feat', text: '分润模式 / 权限配置 tab 在非编辑模式 pointer-events:none + 半透明,只读;编辑模式下可改' },
      { type: 'feat', text: '保存时:写回全局 store(name/note/_appData.loginName/_comm/_perms),并在操作记录追加「编辑:基本资料 / 分润模式 / 权限配置」类型 edit 日志(灰色 chip)' },
      { type: 'feat', text: '取消:回滚 draft 到 agent 当前值' },
      { type: 'add', text: '说明弹窗 已创建代理 操作记录 chip 列表加入 编辑;规则段落补充编辑日志说明' },
    ],
  },
  {
    ver: 'v2.4.36',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '说明弹窗(两个 tab 都加)新增「操作记录 · 规则」段落:展示该 tab 下可能出现的日志类型 chip + 规则说明(成对/终态/继承等)' },
    ],
  },
  {
    ver: 'v2.4.35',
    date: '2026-05-13',
    changes: [
      { type: 'feat', text: '完善操作记录功能 — 自行申请代理(查看&审核)与已创建代理(查看&配置)详情页的操作记录改为基于真实状态变更的动态记录' },
      { type: 'feat', text: '新增 LogTimeline 时间线组件:左侧彩色点 + 右侧 chip(类型) + 时间 + 操作人 + 备注气泡;支持 11 种操作类型(申请/补件/已补件/拒绝/通过/创建/编辑/冻结/再启用/停用/首次登入)' },
      { type: 'feat', text: '5 笔自行申请示例数据按 state 自动注入对应历史日志(reviewing/supplement/supplemented/failed/passed)' },
      { type: 'feat', text: '5 笔示例代理按 status 注入对应日志(创建+登入/冻结/停用)' },
      { type: 'feat', text: '商户审核操作(要求补件/拒绝/通过)与代理状态变更(冻结/再启用/停用)自动追加日志' },
      { type: 'feat', text: '自行申请审核通过创建代理时,继承申请单的 _logs 历史 + 追加 创建 日志,形成完整链路' },
    ],
  },
  {
    ver: 'v2.4.34',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '状态确认弹窗 代理名称+ID 文字颜色与确认按钮颜色对齐:冻结=蓝 #2563eb、再次启用=绿 #16a34a、停用=红 #dc2626' },
      { type: 'modify', text: '冻结/再次启用 确认按钮也改为实心(原 primary 默认 brand 蓝),三个按钮风格统一' },
    ],
  },
  {
    ver: 'v2.4.33',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '状态操作确认弹窗(冻结/再次启用/停用):正文改为三行居中排版,代理名称(AG範例1) + 代理ID(AG100001) 同一行,字体放大到 20px、蓝色 brand 色' },
    ],
  },
  {
    ver: 'v2.4.32',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '状态操作确认弹窗:正文加上代理ID(text-mono)显示;停用帐户确认按钮改为实心红色 #dc2626 + 白字(原 btn.danger 是浅红色不显眼)' },
    ],
  },
  {
    ver: 'v2.4.31',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '「冻结帐户 / 再次启用 / 停用帐户」二次确认从浏览器原生 window.confirm 改为 AM 弹窗(样式同「要求补件」弹窗:标题 + 副标题 + 取消/确认按钮)' },
      { type: 'modify', text: '停用帐户确认按钮使用 danger 红色样式,其他两个用 primary 蓝色' },
    ],
  },
  {
    ver: 'v2.4.30',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '表格内「账户状态」(已创建代理表)与「申请进度」(自行申请代理表)的标签都改为 chip 样式:圆角边框 + 浅色底,与说明弹窗一致' },
      { type: 'modify', text: 'styles.css .status-pill 加上 padding/border/border-radius/min-width,各状态加 background' },
      { type: 'modify', text: 'APP_STATE_META 各状态新增 bg 浅色底字段,表格渲染从纯文本改为 chip span' },
    ],
  },
  {
    ver: 'v2.4.29',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '说明弹窗 帐户状态列表 与 申请进度列表 的标签也改为 chip 样式(圆角边框 + 浅色底),与下方流程图风格统一' },
    ],
  },
  {
    ver: 'v2.4.28',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '已创建代理 说明弹窗 流程关系样式对齐 自行申请代理:状态用 chip(圆角边框 + 浅色底)显示;移除所有 fontStyle:italic' },
    ],
  },
  {
    ver: 'v2.4.27',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '已创建代理 说明弹窗 新增「专业代理账户 · 创建流程」(商户直接创建 / 自行申请审核通过 → 均落到 未启用)与「账户状态 · 流转关系」(未启用→已启用、已启用↔已冻结、任意状态→已停用 终态)' },
    ],
  },
  {
    ver: 'v2.4.26',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '自行申请代理 说明弹窗 新增「申请进度 · 流程关系」段落:可视化各进度间的流转(用户提交→待审核→通过/拒绝/要求补件→已补件待审核→ 循环)' },
    ],
  },
  {
    ver: 'v2.4.25',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '说明弹窗新增「代理ID 编号规则」段落:商户创建 AG1xxxxx(蓝)、自行申请 AP2xxxxx(绿);自行申请页只显示 AP 规则' },
    ],
  },
  {
    ver: 'v2.4.24',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '「冻结帐户」与「再次启用」按钮也加入二次确认弹窗(此前只有「停用帐户」有)' },
    ],
  },
  {
    ver: 'v2.4.23',
    date: '2026-05-13',
    changes: [
      { type: 'feat', text: '代理详情页 帐户状态操作按钮接入功能:点击「冻结帐户」→ 状态变为 已冻结、点击「停用帐户」→ 状态变为 已停用(带二次确认)' },
      { type: 'feat', text: '当帐户状态为 已冻结 时,显示「再次启用」按钮(绿色边框),点击后状态变为 已启用' },
      { type: 'modify', text: '帐户状态为 已停用 时不再显示任何状态操作按钮(状态不可撤销)' },
      { type: 'modify', text: '状态变更同时写回 window.APS_MERCHANT_AGENTS_STORE,列表与详情同步' },
    ],
  },
  {
    ver: 'v2.4.22',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '自行申请代理新建申请的 AP ID 计算:同时纳入「已创建代理」store 中已存在的 AP _displayId(如 AP範例6=AP200006),避免冲突' },
      { type: 'modify', text: '审核不一定按代理ID顺序,新申请 ID = max(所有已存在 AP 编号,包括已审核通过且落到已创建代理列表的) + 1' },
    ],
  },
  {
    ver: 'v2.4.21',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '商户新建代理 ID 计算改为「max(现有 AG 编号) + 1」(AP 行不计入),修复初始第一笔新建出现 AG100006 而非 AG100005 的问题' },
    ],
  },
  {
    ver: 'v2.4.20',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '修复:商户新建代理后,原 5 笔代理的「代理类型 / 创建方式 / 代理ID」错位 — 原本这些值由 index 计算,新增 prepend 后所有 index 偏移导致错位' },
      { type: 'fix', text: '把 _aType / _createWay / _displayId 烘焙(bake)为每个 agent 对象的属性,渲染与筛选都用属性而非 index;新建代理时同步在对象上设置这 3 个字段' },
    ],
  },
  {
    ver: 'v2.4.19',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '商户新建代理切换分页后不见 — agents 状态由 React local state 提升为 window.APS_MERCHANT_AGENTS_STORE 全局 store(切换页面/重新挂载后保留)' },
      { type: 'fix', text: '专业代理后台 登入页快速选择账户卡片 头像/ID 显示:根据 agentId 前缀区分 AG(蓝色,商户创建)与 AP(绿色,自行申请),并将原本显示的 userId 改为 agentId' },
      { type: 'fix', text: '专业代理后台 顶栏用户胶囊 头像:同样根据 agentId 前缀显示 AG/AP 与对应底色' },
    ],
  },
  {
    ver: 'v2.4.18',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '说明弹窗(已创建代理):账户状态顺序 已启用↔未启用 互换(未启用 在前);已冻结 文案补充可用功能范围' },
      { type: 'modify', text: '说明弹窗(自行申请代理):移除 风险等级 / 账户状态 两个段落,只保留 申请进度' },
      { type: 'modify', text: '申请进度「通过」文案改为「由管理员手动创建专业代理账户」(原为「系统自动创建」)' },
    ],
  },
  {
    ver: 'v2.4.17',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '代理账户管理:已创建代理 / 自行申请代理 两个 tab 都新增「说明」按钮(顶部按钮行右侧,ghost 样式),点击弹出说明弹窗' },
      { type: 'add', text: '说明弹窗内容:风险等级(低/中/高)与 账户状态(已启用/未启用/已冻结/已停用)含义;在 自行申请代理 tab 下额外显示 申请进度 5 段说明' },
      { type: 'add', text: 'ui.jsx ICONS 新增 info 图标' },
    ],
  },
  {
    ver: 'v2.4.16',
    date: '2026-05-13',
    changes: [
      { type: 'feat', text: '新创建专业代理(商户创建 / 自行申请审核通过)账户状态默认为「未启用」(原 active)' },
      { type: 'feat', text: '新增 window.APS_LOGGED_IN_AGENTS 全局集合(localStorage 持久化):代理首次登入专业代理后台成功时自动登记 agentId' },
      { type: 'feat', text: 'AgentsModule 订阅登入事件,代理 ID 命中后状态自动从「未启用」翻为「已启用」' },
    ],
  },
  {
    ver: 'v2.4.15',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '修复:已创建代理页「创建专业代理」最后一步点击「创建代理帐户」后整页白屏崩溃 — 新建代理对象未填 status/created/players/risk/tier 等字段,导致渲染时 new Date(undefined).toISOString() 抛出 RangeError' },
      { type: 'fix', text: '新建代理 ID 起点同步 v2.4.13:AG + (100001 + agents.length)' },
    ],
  },
  {
    ver: 'v2.4.14',
    date: '2026-05-13',
    changes: [
      { type: 'fix', text: '已创建代理列表中 AP範例6(自行申请代理)的「查看&配置」详情页:注入 _displayId/_createWay/_appData,让详情页正确显示为自行申请代理的内容(此前误显示为商户创建代理)' },
    ],
  },
  {
    ver: 'v2.4.13',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '商户创建代理 ID 起点 AG100000 → AG100001:前 4 行依序显示 AG100001~AG100004(AP範例6 仍为 AP200006)' },
      { type: 'modify', text: 'data.js 同步调整 parent 引用起点 100001+srand' },
    ],
  },
  {
    ver: 'v2.4.12',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '已创建代理列表行顺序调整:AP範例6(自行申请)从首行移到最后一行,前 4 行依序为 AG範例1~4' },
      { type: 'modify', text: '同步更新 data.js 前 5 笔代理 name/status/risk/players 与 agents.jsx 的 isApplied/FIXED_TYPES/displayId 公式' },
    ],
  },
  {
    ver: 'v2.4.11',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '自行申请代理示例 5 笔:代理名称改为 AP範例1~5、代理类型改为 个人/个人/个人/团队/总(对应 tier normal/normal/normal/general/super)' },
      { type: 'modify', text: '已创建代理列表第一行(AP200006)代理名称改为 AP範例6(避开 AP範例1)' },
    ],
  },
  {
    ver: 'v2.4.10',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '已创建代理列表中自行申请行的 ID 起点改为 AP200006(第一行),避开 自行申请代理 tab 中已使用的 AP200001~5' },
    ],
  },
  {
    ver: 'v2.4.9',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理ID 编号规则统一:商户创建代理 = AG1xxxxx,自行申请代理 = AP2xxxxx' },
      { type: 'modify', text: 'SELF_APPLICATIONS_INITIAL 5 条示例 ID 从 AP000001~5 改为 AP200001~5' },
      { type: 'modify', text: '已创建代理表格中自行申请行的 displayId 公式改为 AP + (200001 + i)' },
      { type: 'modify', text: '新申请单生成 AP 编号最小值底线 = 200001' },
    ],
  },
  {
    ver: 'v2.4.8',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理账户管理示例数据:第一行代理ID AP100000 → AP200001' },
    ],
  },
  {
    ver: 'v2.4.7',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理账户管理示例数据:前 5 笔代理名称改为 AP範例1 / AG範例1~4,代理类型改为 个人/个人/个人/团队/总' },
    ],
  },
  {
    ver: 'v2.4.6',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '自行申请代理:「导出申请记录」从 tabs 卡片内 toolbar 移到顶部按钮行,文案改为「导出」、图标/大小同已创建代理页的导出按钮' },
      { type: 'modify', text: '「全局配置」按钮样式改为 btn primary(蓝色,同创建专业代理按钮)' },
    ],
  },
  {
    ver: 'v2.4.5',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '「全局配置」按钮位置移到「自行申请代理」tab 内、tabs 卡片上方独立一行(白色 btn 样式)' },
      { type: 'modify', text: '模板状态由 SelfApplicationsList 提升到父级 AgentsModule,通过 props 传入' },
    ],
  },
  {
    ver: 'v2.4.4',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '自行申请代理 tab 列新增「全局配置」按钮(右上角),点击弹窗可配置「要求补件」与「拒绝」的模板1/模板2 内容' },
      { type: 'add', text: '模板内容 localStorage 持久化,可恢复默认' },
    ],
  },
  {
    ver: 'v2.4.3',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理账户管理:Tab「全部代理」→「全部状态」' },
      { type: 'modify', text: '示例数据前两行创建方式互换:第一行改为「自行申请代理」、第二行改为「商户创建代理」' },
    ],
  },
  {
    ver: 'v2.4.2',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理账户管理示例数据:未启用(pending)代理的玩家数固定为 0' },
    ],
  },
  {
    ver: 'v2.4.1',
    date: '2026-05-13',
    changes: [
      { type: 'modify', text: '代理账户管理示例数据:前 5 笔固定风险等级 低/低/低/中/高、账户状态 未启用/未启用/已启用/已冻结/已停用' },
    ],
  },
  {
    ver: 'v2.4.0',
    date: '2026-05-13',
    changes: [
      { type: 'add', text: '代理账户管理:新增「未啟用」分页(status=pending),位于「已启用」和「已冻结」之间' },
      { type: 'fix', text: '原「待审核」分页标签更正为「未啟用」—— 筛选条件本来就是 status===pending,只是标签对齐了 statusMap' },
      { type: 'modify', text: '版本号从 v2.4.0 起步(用户指示)' },
    ],
  },
  {
    ver: 'v2.3.39',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '代理后台顶栏用户胶囊垂直居中(agent-user-wrap 加 align-self:center)' },
    ],
  },
  {
    ver: 'v2.3.38',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '登入按钮文案恢复(此前被改成 fontSize:2px 不可见)' },
      { type: 'fix', text: '代理后台顶栏隐藏:搜索框 / 铃铛 / 设置 / admin 运营总监(原仅 PRD 隐藏,改为只在商户后台显示)' },
    ],
  },
  {
    ver: 'v2.3.37',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '登入页「记住账号」文案恢复(此前被直接编辑改成 fontSize:1px 不可见)' },
    ],
  },
  {
    ver: 'v2.3.36',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '快速选择账户卡片优化:左侧绿色 AP 头像 / 中名+UID 堆叠 / 右账号密码堆叠 / 填入按钮蓝边框胶囊' },
      { type: 'fix', text: '账户行有外圈圆角边框 + 间距,hover 高亮 + 填入按钮变实心蓝' },
    ],
  },
  {
    ver: 'v2.3.35',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: 'tagline 放入 .al2-illu,紧贴底座' },
    ],
  },
  {
    ver: 'v2.3.34',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '登入页对齐竟品比例 1.5:1 + 输入框/文字加大' },
    ],
  },
  {
    ver: 'v2.3.33',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '删左上角品牌、右侧加回圆 Logo、左图说明紧贴' },
    ],
  },
  {
    ver: 'v2.3.32',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '左 LOGO 文案放大 + 移除欢迎回来标题 + 字号整体放大' },
    ],
  },
  {
    ver: 'v2.3.31',
    date: '2026-05-12',
    changes: [
      { type: 'feat', text: '登入页参考竟品重设计:左渐变品牌区 + 右登入面板' },
    ],
  },
  {
    ver: 'v2.3.30',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '登入页三栏式 + 自定义语言下拉' },
    ],
  },
  {
    ver: 'v2.3.29',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '登入页改全屏 + 移除繁体中文选项' },
    ],
  },
  {
    ver: 'v2.3.28',
    date: '2026-05-12',
    changes: [
      { type: 'add', text: '专业代理后台 新增登入页:左侧品牌插图 + 已创建账户列表(用户ID/账号/密码 + 填入按钮);右侧 Logo + 帐号密码输入 + 记住帐号 + 登入按钮;支持显示/隐藏密码、Enter 提交' },
      { type: 'add', text: '全局账户存储 window.APS_AGENT_ACCOUNTS:商户通过申请代理或创建专业代理时自动 push;登入页订阅其变更实时更新列表' },
      { type: 'add', text: 'app.jsx 新增 loggedInAgent 登入态:专业代理 tab 在未登入时显示 AgentLoginModule,登入后渲染原有侧栏/内容并将 CURRENT_AGENT_ID 设为该代理' },
      { type: 'add', text: '代理后台顶栏 用户胶囊改为绿色 AP 头像 + 登录名 + 代理ID,点击弹出悬浮窗,内含「登出」选项;登出后清空 loggedInAgent 与 CURRENT_AGENT_ID 并回到登入页' },
      { type: 'add', text: 'ui.jsx 新增 lock / eyeOff / logOut 三个图标 path' },
    ],
  },
  {
    ver: 'v2.3.27',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '已创建代理 详情面板「备注」字段:之前用 defaultValue 硬编码了占位示例文本,现改为 value={agent.note}(创建代理时写入的备注),无内容时显示「(未填写备注)」占位' },
    ],
  },
  {
    ver: 'v2.3.26',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '商户后台「创建专业代理账户」弹窗 联系方式锁定行(Email/手机)颜色异常:styles-frontend.css 里 .contact-list / .contact-type-locked / .contact-phone-prefix / .contact-add-btn / .contact-row.contact-head 几个规则忘加 .apply-mobile-modal 前缀,深色琥珀样式泄漏到商户后台浅色弹窗;现已统一加前缀作用域隔离' },
    ],
  },
  {
    ver: 'v2.3.25',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '补件重提核心 bug:提交时改用 store 实时状态判断分支(liveSt),不再依赖可能滞后的 React applyState;补件重提的 setApplyState 改成 patchUserState 写入正确 userId 槽,避免再次提交后弹窗仍显示「申请成功/审核中」而非「补件成功/已补件待审核」' },
    ],
  },
  {
    ver: 'v2.3.24',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: 'ZH locale 补 s_supd: \'已补件待审核\'(此前缺失导致补件成功弹窗的进度 pill 显示 undefined)' },
    ],
  },
  {
    ver: 'v2.3.23',
    date: '2026-05-12',
    changes: [
      { type: 'add', text: '申请进度弹窗「前往补件」按钮:打开申请表单时自动从 APS_APPS_STORE 回填用户上次提交的表单数据(姓名/联系方式/类型/申请理由)' },
      { type: 'add', text: 'APS_APPS_STORE 记录新增 _formSnapshot 字段,首次提交 + 补件重提都写入,作为补件回填的 source of truth;无 snapshot 时 fallback 用 name/contact/channels/reason 重建 contacts 列表' },
      { type: 'fix', text: '补件重提覆盖原记录:channels + _formSnapshot 也同步更新,确保商户后台看到的是最新数据' },
    ],
  },
  {
    ver: 'v2.3.22',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '修复 frontend.jsx 多余逗号导致页面白屏的语法错误(contact_value_ph 行)' },
      { type: 'fix', text: '申请代理表单 手机字段接入 i18n:默认 contacts type 改 \'Mobile\'(英语 key),ZH contact_types/contact_value_ph 同步,failed cfg reset form 也改 \'Mobile\'' },
      { type: 'remove', text: '申请进度结果弹窗 底部灰色提示行删除(↑ 点击弹出申请弹窗 …),仅保留按钮交互' },
    ],
  },
  {
    ver: 'v2.3.21',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '申请进度弹窗:渲染时直接从 APS_APPS_STORE 实时读最新 rec(优先 submittedAppId,兜底 userId),不再依赖 userStates 缓存,商户后台改完前台必同步' },
      { type: 'fix', text: 'sync listener:三个 patch 合并成单次 patchUserState 调用,避免连续 setState 在 18 之外环境只保留最后一次' },
    ],
  },
  {
    ver: 'v2.3.20',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '网站前台 Apply Now 按钮:每次点击都从 store 重拉最新状态,避免本地缓存(reviewing)覆盖商户后台已改的 supplement/failed/passed' },
    ],
  },
  {
    ver: 'v2.3.19',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: 'APS_addApplication 改为 UPSERT:同 userId 已有非终态(非 passed/failed)申请直接复用更新,不再插入多条 → 解决 store 出现同用户多条申请、前台 sync 找错记录的问题' },
      { type: 'add', text: '前台 sync listener 加 userId 兜底:submittedAppId 命中不到时按 currentUserId 找最新一条' },
    ],
  },
  {
    ver: 'v2.3.18',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '商户后台 自行申请代理 详情抽屉:申请理由 textarea 不再自动附加「推广渠道:Email · 手机」,只显示用户原文,避免出现用户未输入的文案' },
      { type: 'fix', text: 'CreateAgentModal prefill remark 同步去除推广渠道自动拼接' },
    ],
  },
  {
    ver: 'v2.3.17',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '网站前台:申请提交时携带 currentUserId 写入商户后台 store,使「自行申请代理」记录与登入用户绑定;避免再次点 Apply Now 因 userId 错位 fallback 失败而误开申请表单' },
      { type: 'add', text: 'Apply Now 按钮点击:applyState 为 idle 时,先从 store 反查当前用户 userId 是否已有申请记录,命中则回填 userStates 并弹「申请进度」弹窗' },
    ],
  },
  {
    ver: 'v2.3.16',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '申请成功弹窗:申请进度行接入 i18n 标签(t.s_review / s_sup / s_supd / s_fail / s_pass),EN/中文 自动切换' },
      { type: 'fix', text: '申请成功弹窗摘要区:apply-success-summary 加 width:100% 修正在 modal 居中布局下被压窄、与 desc 不对齐的问题' },
    ],
  },
  {
    ver: 'v2.3.15',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '申请成功弹窗:申请进度行改用 state 标签(审核中 / 要求补件 / 已补件待审核 / 已拒绝 / 审核通过),不再误用弹窗标题' },
      { type: 'fix', text: '申请成功弹窗:submittedAppId 增加 fallback 兜底,从商户后台 store 最新一条取代理ID,确保 AP-ID 卡片始终展示' },
      { type: 'fix', text: '商户后台 APS_addApplication:AP-ID 生成改为扫描已有最大编号 +1,避免列表删除后编号冲突' },
    ],
  },
  {
    ver: 'v2.3.14',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '网站前台:不同用户 ID 登入后,专业代理申请状态(applyState / failReason / submittedAppId)独立维护,不再共用 — 用 userStates map 按 currentUserId 分槽存储' },
    ],
  },
  {
    ver: 'v2.3.13',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '网站前台:刷新页面后初始画面回到注册页(移除 currentUserId 的 localStorage 持久化,避免上次登入态被记住)' },
    ],
  },
  {
    ver: 'v2.3.12',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '申请进度弹窗(申请成功 / 要求补件 / 补件成功 / 已拒绝 / 审核通过)所有文案接入 EN/中文 i18n,跟随卡片右下角语言切换;新增 11 个 key:ok2_*_t/d、cta_confirm/goSupp/reapply、hint_supp/reapply、live_support、sum_progress/time/appid' },
      { type: 'modify', text: '审核通过弹窗 Live Support 按钮文案接入 i18n(EN: Live Support / 中文: 在线客服)' },
      { type: 'modify', text: '摘要卡片标签接入 i18n:申请进度 / 更新时间 / 申请代理ID 跟随语言切换' },
    ],
  },
  {
    ver: 'v2.3.11',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '注册页「生成新的用户 ID」按钮:改 Apply Now 同款金橙渐变 + 内嵌高光 + hover 提升,宽度撑满与下方列表卡同宽' },
      { type: 'modify', text: '卡片下方「登出」按钮:改 Apply Now 同款金橙渐变胶囊,hover 提升' },
      { type: 'modify', text: '申请成功弹窗摘要简化:移除「申请人姓名 / 联系方式 / 申请理由」,只保留「申请进度 + 更新时间」与「申请代理 ID」两张独立卡' },
      { type: 'modify', text: '申请成功弹窗摘要卡风格统一到印度暖色暗卡片风(深棕半透底 + 金黄色描边 + 内嵌高光),与申请代理弹窗一致' },
      { type: 'modify', text: '申请成功弹窗摘要间距优化:卡内行距 12px,卡片 padding 14×18px,卡间 12px,字号 13px / 行高 1.5,左右两段 gap 24px 防止文字挤在一起' },
    ],
  },
  {
    ver: 'v2.3.10',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '注册页风格统一到印度暖色暗卡片风:生成按钮 / 列表卡 / 列表项 / 空态文字 全部改深底 + 金色边框 + 暖白文字 + 主操作金渐变 hover' },
      { type: 'modify', text: '卡片下方「用户ID + 登出」胶囊改深底金边,登出按钮 hover 切金渐变' },
    ],
  },
  {
    ver: 'v2.3.9',
    date: '2026-05-12',
    changes: [
      { type: 'add', text: '网站前台 新增注册页:未登入时显示「生成新的用户 ID」按钮 + 「使用已创建用户 ID 自动登入」列表,空态显示「请生成新的用户 ID」' },
      { type: 'add', text: '「生成新的用户 ID」点击 → 列表自增追加 P001 / P002…(localStorage 持久化)' },
      { type: 'add', text: '点击列表中的用户 ID → 自动登入跳转至专业代理招募卡片' },
      { type: 'add', text: '招募卡片下方新增「用户ID:Pxxx · 登出」胶囊条;点击登出 → 清空 currentUserId → 返回注册页' },
    ],
  },
  {
    ver: 'v2.3.8',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '状态命名前后端统一:商户后台 resubmitted → supplemented、rejected → failed,与网站前台 applyState 对齐,审核结果可正确回写到前台卡片' },
      { type: 'fix', text: '申请弹窗 locked 逻辑修复:仅 reviewing / supplemented / passed 锁定表单,supplement(要求补件) / failed(已拒绝) 解锁字段与提交按钮' },
      { type: 'add', text: '区分「首次提交」与「补件重提」:supplement 态下点「前往补件」重开表单(原资料预填)→ 改完提交时更新原记录 state=supplemented,而非新增记录' },
      { type: 'add', text: '网站前台监听 APS_APPS_STORE:商户后台审核动作(要求补件 / 拒绝 / 通过)→ 前台 applyState + failReason 自动同步' },
      { type: 'modify', text: '商户后台审核动作(supplement / failed / passed)写回 store 时同步更新 updatedAt 时间戳' },
    ],
  },
  {
    ver: 'v2.3.7',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '申请弹窗副标题文案改为「提交申请后我们会立即安排人员与您联系」' },
      { type: 'add', text: '新增申请进度状态「已补件审核中」(supplemented),admin 审核员加按钮 + 4 状态列表扩展为 5 状态 + FeStatePill 增 supplemented 配色(浅橙)' },
      { type: 'modify', text: '提交成功弹窗改为根据 applyState 渲染 5 种变体:审核中(绿√/确认) / 要求补件(黄!/前往补件,保留资料) / 已补件审核中(橙↑/确认) / 已拒绝(红×/重新申请,清除资料) / 已通过(蓝人/Live Support+确认),并展示申请进度+更新时间+代理ID+姓名+联系方式+申请理由汇总' },
      { type: 'modify', text: '招募卡片「申请代理」按钮:applyState !== idle 时改为打开对应状态成功弹窗,而非申请表' },
    ],
  },
  {
    ver: 'v2.3.6',
    date: '2026-05-12',
    changes: [
      { type: 'remove', text: '申请弹窗 删除「所在地区」字段(下拉 select)' },
    ],
  },
  {
    ver: 'v2.3.5',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: 'FeStatePill 增加 theme prop,dark 模式下 4 种状态(reviewing/supplement/passed/failed)文字色改为浅色变体(青/金/绿/红),背景透明度提升,在暗底显眼' },
    ],
  },
  {
    ver: 'v2.3.4',
    date: '2026-05-12',
    changes: [
      { type: 'fix', text: '申请弹窗 暗色:.apply-alert 描述文字 inline `color:var(--text-2)` 在 dark 下不显眼 → 加 !important 选择器提亮(warning 金色 / danger 浅红 / success 浅绿 / info 浅蓝)' },
    ],
  },
  {
    ver: 'v2.3.3',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '申请弹窗 暗色主题:主体内 .apply-alert(info/warning/danger/success) 副标题与正文文字提亮至浅色变体,边框加强;顶部「申请进度」pill 状态条 + 标签 提升对比度' },
    ],
  },
  {
    ver: 'v2.3.2',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '申请弹窗 「审核员视角(后台 Demo)」面板从置顶移到弹窗右侧侧栏(>900px 视口),小屏自动回落顶部' },
      { type: 'add', text: '审核员视角侧栏底部新增「申请进度 · 4 种状态」展示:审核中 / 要求补件 / 已通过 / 已拒绝,当前状态高亮' },
    ],
  },
  {
    ver: 'v2.3.1',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '网站前台 招募卡片下方:语言切换 + 主题切换 改为左对齐并排 pill 分段控件(主题切换 = 太阳/月亮 两段)' },
      { type: 'modify', text: '申请弹窗 文案「当前进度」→「申请进度」(state_label + m_current)' },
      { type: 'modify', text: '申请弹窗 暗色主题:手机号 +91 前缀 + 后方输入框 + 整个 .contact-phone-input 外框 改为深底 + 暖白文字,聚焦光晕换金色,与 Email 行视觉统一' },
      { type: 'modify', text: '申请弹窗 暗色主题:代理类型选中点 ::after 蓝色内圈遮成深棕,呈金色实心点' },
    ],
  },
  {
    ver: 'v2.3.0',
    date: '2026-05-12',
    changes: [
      { type: 'add', text: '网站前台 → 申请弹窗 提交后,数据直推商户后台「代理账户管理 → 自行申请代理」列表(状态:审核中),共享 store 全局打通' },
      { type: 'add', text: '网站前台 招募卡片:申请弹窗主题切换 + 提交成功弹窗(印度暖色暗卡片风)+ 提交后表单 locked 态' },
    ],
  },
  {
    ver: 'v2.2.31',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '自行申请代理 → 通过 → 创建专业代理账户:登录账号 / 初始密码 / 代理类型 / 上级代理 改回可编辑;联系方式恢复为可编辑列表(预填申请数据);新增独立「备注(选填)」textarea,与只读的「申请理由/推广渠道说明」分开' },
    ],
  },
  {
    ver: 'v2.2.30',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '自行申请代理 → 查看&审核 → 通过:改为打开「创建专业代理账户」三步向导(代理创建方式标记为「自行申请代理」),代理名称 / 类型 / 上级 / 代理ID / 用户ID / 联系方式 / 申请理由 自动填入并置灰只读,登录账号 + 初始密码 + 分润模式 + 权限保持可编辑;创建成功后申请进度改为通过' },
    ],
  },
  {
    ver: 'v2.2.29',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 商户创建代理:筛选区新增「全部代理创建方式」下拉(全部 / 商户创建代理 / 自行申请代理),与表格首列「代理创建方式」联动' },
    ],
  },
  {
    ver: 'v2.2.28',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '商户后台 → 自行申请代理 → 查看&审核:操作记录 Tab 实装(时间 / 操作人 / 操作 三列时间线,显示审核进度)' },
      { type: 'modify', text: '要求补件 / 拒绝申请 弹窗:新增「模板1 / 模板2 / 自订义」单选,选模板自动填充文案,改自由编辑后切回自订义' },
      { type: 'modify', text: '拒绝申请 弹窗副标题改为「拒绝后,用户再次申请专业代理需重新创建代理ID」,要求补件副标题改为「用户可在专业代理申请弹窗查看补件说明」' },
    ],
  },
  {
    ver: 'v2.2.27',
    date: '2026-05-12',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 已创建代理:范例数据精简至 5 条' },
    ],
  },
  {
    ver: 'v2.2.26',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 自行申请代理 → 查看&审核 抽屉重做:头部 AP 绿色头像 + 名称 + ID 与商户后台代理详情统一;Tab 拆 申请资料 / 操作记录;基本资料以双列只读卡片展示(代理创建方式/ID/名称/类型/上级 + 用户ID/创建时间);联系方式改为表格;申请理由/推广渠道说明合并只读 textarea;底部展示申请进度并固定 要求补件 / 拒绝 / 通过 操作按钮' },
    ],
  },
  {
    ver: 'v2.2.25',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 自行申请代理:操作列 4 个按钮合并为单一「查看&审核」文字链接,点击进入详情抽屉做审核处置' },
    ],
  },
  {
    ver: 'v2.2.24',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 自行申请代理:列表重构,与「商户创建代理」字段口径对齐(代理ID/代理名称/代理类型/用户ID/上级代理ID-名称/申请进度/更新时间/创建时间)' },
      { type: 'modify', text: '申请进度新增「已补件待审核」状态,Tab 顺序调整为 全部进度 / 待审核 / 要求补件 / 已补件待审核 / 拒绝 / 通过' },
      { type: 'modify', text: '工具栏新增「全部代理类型」筛选下拉(个人/团队/总代理)' },
      { type: 'modify', text: '操作列改为 4 个描边小按钮:查看资料(蓝)/ 要求补件(紫)/ 拒绝(红)/ 通过(绿),终态行的处置按钮自动置灰' },
    ],
  },
  {
    ver: 'v2.2.23',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '代理详情抽屉头部:头像标识根据创建方式区分(商户创建代理→AG 蓝色 / 自行申请代理→AP 绿色),头像尺寸放大至 52×52' },
      { type: 'modify', text: '代理详情抽屉头部:第一行代理名称放大至 20px,第二行代理ID 放大至 14px(等宽字体)' },
      { type: 'modify', text: '基本资料 Tab 内代理ID 字段同步使用真实展示 ID(AG/AP 前缀)' },
    ],
  },
  {
    ver: 'v2.2.22',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 代理详情抽屉:重做为 4 个 Tab(基本资料 / 分润模式 / 权限配置 / 操作记录),移除冗余的 4 项 KPI 与多标签页' },
      { type: 'modify', text: '基本资料 Tab:卡片化展示「代理创建方式 / 代理ID / 代理名称 / 登入帐号 / 登入密码 / 代理类型 / 上级代理 / 创建代理人 / 创建时间」,独立帐户状态行带「冻结帐户 / 停用帐户」按钮,联系方式改为表格,备注 textarea' },
      { type: 'modify', text: '分润模式 Tab:CPA / RevShare / Hybrid 三选一卡片,与创建弹窗一致' },
      { type: 'modify', text: '权限配置 Tab:2 列 5 行开关网格,与创建弹窗一致' },
      { type: 'modify', text: '操作记录 Tab:时间 / 操作人 / 操作 三列表格,操作列含「编辑:xxx」蓝色链接' },
      { type: 'modify', text: '底部统一「编辑」按钮(操作记录页隐藏);Drawer 组件新增 hideHeader 支持,详情头自带头像+ID' },
    ],
  },
  {
    ver: 'v2.2.21',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 已创建代理列表 → 操作列:5 个文字链接合并为单一「查看&配置」入口' },
    ],
  },
  {
    ver: 'v2.2.20',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 已创建代理列表:操作列表头由「操作」改为「查看&配置」' },
    ],
  },
  {
    ver: 'v2.2.19',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 已创建代理 → 账户状态:文案「未审核」改为「未启用」,颜色由橙改为紫色(#8b5cf6),保留四态:已启用(绿) / 未启用(紫) / 已冻结(蓝) / 已停用(红)' },
    ],
  },
  {
    ver: 'v2.2.18',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 代理列表表格:重做列结构,新列序为「代理创建方式 / 代理ID / 代理名称 / 代理类型 / 上级代理ID-名称 / 代理等级 / 玩家数 / 风险等级 / 账户状态 / 更新时间 / 创建时间 / 操作」' },
      { type: 'modify', text: '移除「类型/等级」「层级」「市场/国家」「有效CPA」「累计佣金」「注册时间」六列,简化表格信息密度' },
      { type: 'modify', text: '账户状态文案改为中文:已启用 / 未审核 / 已冻结 / 已停用,改为纯彩色文字(绿/橙/蓝/红)' },
      { type: 'modify', text: '代理等级显示由 L1 改为 LV-1 格式;上级代理列改为「ID-名称」组合' },
      { type: 'modify', text: '操作列由「⋯ 更多」按钮改为 5 个文字链接:基本资料 / 分润模式 / 权限配置 / 风险等级&账户状态 / 操作日志' },
    ],
  },
  {
    ver: 'v2.2.17',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 列表筛选:「全部类型」改为「全部代理类型」,下拉选项调整为 个人代理 / 团队代理 / 总代理' },
      { type: 'modify', text: '商户后台 → 代理账户管理 → 列表筛选:移除「全部国家」筛选下拉' },
    ],
  },
  {
    ver: 'v2.2.16',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '创建专业代理弹窗 → 代理类型:选项更新为 个人代理 / 团队代理 / 总代理' },
      { type: 'modify', text: '创建专业代理弹窗 → 上级代理:标签改为「上级代理ID-名称」,默认显示「无 (默认AG000000-本商户)」,选项格式 AG100002-Anna_Group' },
      { type: 'modify', text: '创建专业代理弹窗 → 联系方式:手机/WhatsApp 国码改为可下拉选择(印度+91 默认 + 孟加拉/尼泊尔/巴基斯坦/印尼/泰国/中国/美国/巴西/墨西哥等 16 个常用国码)' },
    ],
  },
  {
    ver: 'v2.2.15',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 创建专业代理账户弹窗:重做为 3 步流程(基本资料 / 分润模式 / 权限配置),配带圆点 + 连接线步骤指示器' },
      { type: 'modify', text: '基本资料:新增「代理创建方式」只读字段(固定显示「商户创建代理」);精简字段为「代理名称 / 登录账号 / 初始密码 / 代理类型 / 上级代理」;移除代理等级 / 市场 / 国家 / 结算币种' },
      { type: 'modify', text: '基本资料 → 联系方式:复用前台动态列表(Email + 手机 锁定为必填,可新增第三项,手机/WhatsApp 自带 +91 国码前缀)' },
      { type: 'modify', text: '基本资料 → 备注:textarea 加多行 placeholder(代理来源 / 推广渠道说明 …)' },
      { type: 'modify', text: '分润模式:独立成一步,CPA / RevShare / Hybrid 三选一卡片' },
      { type: 'modify', text: '权限配置:独立成一步,2 列 5 行开关网格(创建分享Code / 查看风控名单 / 查看玩家列表 / 申请提款 / 查看佣金 / 创建下级代理 / API / 查看下级代理 / 下载素材 / 跨层数据),移除「下级管理」整段' },
    ],
  },
  {
    ver: 'v2.2.14',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理:「商户创建代理」分页名称改为「已创建代理」' },
      { type: 'modify', text: '商户后台 → 代理账户管理:两个顶层分页移除数量徽章,仅「自行申请代理」保留红色「N待处理」提醒徽章' },
    ],
  },
  {
    ver: 'v2.2.13',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理 → 商户创建代理:三个操作按钮(创建专业代理 / 批量导入 / 导出)从右上调整到左对齐' },
    ],
  },
  {
    ver: 'v2.2.12',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '商户后台 → 代理账户管理:三个操作按钮(创建专业代理 / 批量导入 / 导出)从页头移到「商户创建代理」分页下方右上,顺序改为「创建专业代理 → 批量导入 → 导出」;切换到「自行申请代理」分页时不显示这三个按钮' },
    ],
  },
  {
    ver: 'v2.2.11',
    date: '2026-05-11',
    changes: [
      { type: 'fix', text: '网站前台 → 申请弹窗:修正「申请理由 / 推广渠道说明」hint 仍与主标签同行的问题 — 改用 hintInline 显式控制,仅联系方式启用,其余字段 hint 回到主标签下方第二行' },
    ],
  },
  {
    ver: 'v2.2.10',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '网站前台 → 申请弹窗 → 字段副标题(hint)显示规则:仅 stack 模式(联系方式)的 hint 与主标签同行右侧显示;其余字段(如「申请理由 / 推广渠道说明」)的 hint 回到主标签下方第二行,避免长副标题挤占主标签空间' },
    ],
  },
  {
    ver: 'v2.2.9',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '网站前台 → 申请弹窗:字段标签的副标题(hint)改为与主标签同行右侧显示,例如「联系方式 * ⋯⋯ 至少填写 2 项」' },
    ],
  },
  {
    ver: 'v2.2.8',
    date: '2026-05-11',
    changes: [
      { type: 'fix', text: '网站前台 → 申请弹窗 → 联系方式:前两项(Email / 手机)改为只读锁定显示,移除下拉箭头与点击展开行为,真正锁定不可切换类型' },
    ],
  },
  {
    ver: 'v2.2.7',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '网站前台 → 申请弹窗 → 联系方式:前两项默认为 Email + 手机(必填),仍可切换联系类型,仅不可删除' },
      { type: 'modify', text: '网站前台 → 申请弹窗 → 联系方式:手机 / WhatsApp 类型固定显示 +91 国码前缀(印度)' },
      { type: 'fix', text: '前两项联系方式恢复下拉箭头与切换功能(此前误锁定为 disabled)' },
    ],
  },
  {
    ver: 'v2.2.6',
    date: '2026-05-11',
    changes: [
      { type: 'modify', text: '网站前台 → 专业代理申请弹窗:「联系方式」与「所在地区」位置调换,所在地区上移到姓名下方' },
      { type: 'modify', text: '网站前台 → 专业代理申请弹窗:「联系方式」改为动态列表,每项含「联系类型」(Email / 手机 / Telegram / WhatsApp)+「联系资料」,至少 2 项,可新增 / 移除' },
    ],
  },
  {
    ver: 'v2.2.5',
    date: '2026-05-11',
    changes: [
      { type: 'add', text: '商户后台 → 代理账户管理:新增顶层分页「商户创建代理」与「自行申请代理」' },
      { type: 'add', text: '「自行申请代理」分页:展示来自网站前台的申请单,支持查看详情、通过 / 拒绝 / 要求补件,带状态筛选(审核中 / 需要补件 / 已通过 / 已拒绝)' },
      { type: 'modify', text: '当前代理列表移入「商户创建代理」子页,功能保持不变' },
    ],
  },
  {
    ver: 'v2.2.4',
    date: '2026-05-09',
    changes: [
      { type: 'modify', text: '网站前台 → 专业代理申请弹窗:「申请等级」改为「申请代理类型」(hint 同步调整)' },
    ],
  },
  {
    ver: 'v2.2.3',
    date: '2026-05-09',
    changes: [
      { type: 'remove', text: '网站前台 → 专业代理申请弹窗:移除「推荐人(上级代理 ID)」输入项,改由系统自动分配' },
      { type: 'remove', text: '网站前台 → 专业代理申请弹窗:移除「KYC 证件」上传区(证件正面 / 反面 / 手持证件照)' },
    ],
  },
  {
    ver: 'v2.2.2',
    date: '2026-05-09',
    changes: [
      { type: 'add', text: '新增「版本」分页 — 在 PRD 规划侧栏首页下方,记录每版本新增/修改/删除内容' },
    ],
  },
  {
    ver: 'v2.2.1',
    date: '2026-05-08',
    changes: [
      { type: 'baseline', text: '版本基线 — 此前迭代未单独记录,以本版本为版本管理起点' },
    ],
  },
];

const TYPE_META = {
  add:      { label: '新增', bg: '#dcfce7', fg: '#15803d' },
  modify:   { label: '修改', bg: '#dbeafe', fg: '#1e40af' },
  remove:   { label: '删除', bg: '#fee2e2', fg: '#b91c1c' },
  fix:      { label: '修复', bg: '#fef3c7', fg: '#92400e' },
  baseline: { label: '基线', bg: '#f1f5f9', fg: '#475569' },
};

function VersionModule() {
  return (
    <div className="page">
      <window.UI.PageHead title="版本" subtitle={`版本管理 · 当前版本 ${VERSIONS[0].ver} · 共 ${VERSIONS.length} 个版本`}>
        <span style={{
          padding:'2px 8px',borderRadius:3,background:'#3b82f6',color:'#fff',
          fontSize:11,fontWeight:700,fontFamily:'JetBrains Mono'
        }}>{VERSIONS[0].ver}</span>
      </window.UI.PageHead>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {VERSIONS.map((v, idx) => (
          <div key={v.ver} className="card" style={{
            borderLeft: v.current ? '3px solid #3b82f6' : '3px solid #e5e7eb',
            padding: 0,
          }}>
            <div style={{
              display:'flex',alignItems:'center',gap:12,
              padding:'14px 16px',borderBottom:'1px solid var(--border)',
            }}>
              <span style={{
                padding:'3px 10px',borderRadius:4,
                background: v.current ? '#3b82f6' : '#64748b',
                color:'#fff',fontSize:13,fontWeight:700,
                fontFamily:'JetBrains Mono',letterSpacing:0.3,
              }}>{v.ver}</span>
              {v.current && (
                <span style={{
                  padding:'2px 8px',borderRadius:3,
                  background:'#dcfce7',color:'#15803d',
                  fontSize:11,fontWeight:600,
                }}>当前版本</span>
              )}
              <span style={{fontSize:12,color:'var(--text-3)'}}>
                <window.Icon name="history" size={11}/> {v.date}
              </span>
              <span style={{marginLeft:'auto',fontSize:12,color:'var(--text-3)'}}>
                {v.changes.length} 项变更
              </span>
            </div>
            <div style={{padding:'8px 16px 14px'}}>
              <ol style={{margin:0,paddingLeft:0,listStyle:'none'}}>
                {v.changes.map((c, i) => {
                  const m = TYPE_META[c.type] || TYPE_META.modify;
                  return (
                    <li key={i} style={{
                      display:'flex',alignItems:'flex-start',gap:10,
                      padding:'8px 0',
                      borderBottom: i < v.changes.length-1 ? '1px dashed var(--border)' : 'none',
                    }}>
                      <span style={{
                        flexShrink:0,minWidth:32,textAlign:'center',
                        padding:'2px 8px',borderRadius:3,
                        background:m.bg,color:m.fg,
                        fontSize:11,fontWeight:600,
                        marginTop:1,
                      }}>{m.label}</span>
                      <span style={{
                        fontSize:13,lineHeight:1.6,color:'var(--text-1)',flex:1,
                      }}>
                        <span style={{
                          display:'inline-block',minWidth:20,
                          color:'var(--text-3)',fontFamily:'JetBrains Mono',fontSize:12,
                        }}>{i+1}.</span>
                        {c.text}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop:16,padding:'12px 14px',
        background:'#f8fafc',border:'1px dashed #cbd5e1',borderRadius:6,
        fontSize:12,color:'var(--text-2)',lineHeight:1.7,
      }}>
        <div style={{fontWeight:600,color:'var(--text-1)',marginBottom:4}}>版本管理说明</div>
        每次需求变更前,以版本号(如 <code style={{padding:'1px 4px',background:'#e2e8f0',borderRadius:3,fontFamily:'JetBrains Mono'}}>v222</code>)开头列出本次的新增 / 修改 / 删除项,完成后会自动追加到此版本记录中。
      </div>
    </div>
  );
}

window.VersionModule = VersionModule;
