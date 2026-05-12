// 版本历史 — PRD 规划 → 版本
// 用户告知做事情时会带上版本号(如 v222 = v2.2.2),完成后在此追加更新项
const VERSIONS = [
  {
    ver: 'v2.3.39',
    date: '2026-05-12',
    current: true,
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
