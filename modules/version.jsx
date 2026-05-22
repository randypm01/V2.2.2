// 版本历史 — PRD 规划 → 版本
// 用户告知做事情时会带上版本号(如 v222 = v2.2.2),完成后在此追加更新项
const VERSIONS = [
  {
    ver: 'v3.1.95',
    date: '2026-05-22',
    current: true,
    changes: [
      { type: 'fix', text: '專業代理後台 → 我的账户 → RevShare Mode:EN 模式下「分潤方案」(週期資產變動分潤)与「計算口徑流程」(整段中文 STEP-1~STEP-4 公式)未翻译。原因:plan label 与 formula 直接来自 revshare.jsx 的中文常量 FORMULA_PERIOD_ASSET / REV_TYPES,没经过 i18n' },
      { type: 'add', text: 'agent_common.jsx 新增 rv.plan.period + rv.formula.period 两个 i18n key,EN 文案:Periodic Asset Change RevShare + 完整翻译 STEP-1 ~ STEP-4 公式(含 Commission Base / Ending Balance / Deposits / Withdrawals 等术语)' },
      { type: 'modify', text: 'agent_profile.jsx commission tab 在解析到 type==="period" 方案时用 T() 包裹 label 与 formula,中文模式保持原中文不变;其他方案类型保持原样' },
    ],
  },
  {
    ver: 'v3.1.94',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '專業代理後台 登入弹窗 Quick-pick 不会主动读取商户后台已创建代理 — 必须先手动去点「代理帐户管理」让 ensureMerchantAgentsStore() 执行,Quick-pick 才会从 8 个(4 申请中 + 4 已创建?)增到 12 个。原因:agent_login.jsx 只 subscribe APS_AGENT_ACCOUNTS,而 ACSamples(AC100005~AC100008)是在 ensureMerchantAgentsStore() 里 push 进 APS_AGENT_ACCOUNTS,如果用户没进过 agents.jsx 这段代码不会执行' },
      { type: 'modify', text: 'agent_login.jsx mount useEffect 顶部强制调用 window.APS_ensureMerchantAgentsStore(),让 store 在首次显示登入弹窗时就完成初始化,8 个 AC 账户(4 申请中 + 4 已创建)+ 4 商户创建 全部立即可见' },
    ],
  },
  {
    ver: 'v3.1.93',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '專業代理後台 → 我的账户 EN 翻译补全 — agent_profile.jsx 全页硬编码中文换成 T(),agent_common.jsx 新增 70+ 翻译键(mp_prof.*):6 个 tab 标签 / 基本资料 8 字段 / 联系方式表头 / 帐户状态 pill / 分润模式 7 行(结算周期/币种/最低最高金额/分润方案/比例/计算口径)/ 权限配置 2 section(运营 + 报表)+ 5 项 + Code 上限 / 流量来源标题副标题 + 空态 / 收款方式联系商户提示 / 安全设置 + 修改密码弹窗' },
      { type: 'modify', text: '代理创建方式 显示文案改用 i18n key 而非直接读 me._createWay(原本中文字段在 EN 下也会硬显中文)' },
    ],
  },
  {
    ver: 'v3.1.92',
    date: '2026-05-22',
    changes: [
      { type: 'modify', text: '专业代理后台 → 分润报表 信息条按图调整 — ① 隐藏「周期」后面的时间(00:00:00 / 23:59:59),只显示日期 2026/6/1 - 2026/6/7;② 期号 / 周期 拆为两行(原一行三段)' },
      { type: 'modify', text: '预估期信息条:第 1 行 期号 + 结算状态,第 2 行 周期;已结算期信息条:第 1 行 期号,第 2 行 周期 + 右侧「切换期号」按钮;期号下拉列表项 同样拆两行' },
      { type: 'add', text: '新增 _stripTime 工具函数 用正则剥离 "YYYY/M/D HH:MM:SS" 尾部时间,只保留日期' },
    ],
  },
  {
    ver: 'v3.1.91',
    date: '2026-05-22',
    changes: [
      { type: 'modify', text: 'agent_profile.jsx 流量来源 tab 优先读 me._traffic(商户后台 已创建代理 → 查看&配置 烘入的字段),其次 _appData._formSnapshot.trafficUrls,最后才生成默认 — 让 4 个 tab(基本资料 / 分润模式 / 流量来源 / 收款方式)的字段优先级与权限配置一致,都从 agents store 取真实数据' },
      { type: 'fix', text: '验证数据流:AC100006 store hit 已含 _comm(每周 · revenue:RV-001 · ₹200~₹100,000)/ _traffic(2 条 URL)/ _payment(IFSC HDFC0002468 + 账号 + 真实姓名 + Email)/ _appData.loginName(rajeshmedia)/ _appData.contacts(Email + 手机)/ _appData._formSnapshot 完整快照 — 全部数据已正确写入,4 个 tab 渲染时会读到真实值' },
    ],
  },
  {
    ver: 'v3.1.90',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '專業代理後台 → 我的账户 → 權限配置 全部显示 ❌ (红 X) — 原因:agent_profile.jsx 用旧 perms 键(shareCode/viewPlayers/viewCommission/...),但 agents.jsx 已改为新 schema(myAccount/codeManage/codeLimit/reportCode/reportPlayer/reportRevshare);v3.1.89 烘入的 DEFAULT_PERMS 用新 schema 但代理后台读不到 → 全部 undefined → 全显示 ❌' },
      { type: 'modify', text: 'agent_profile.jsx perms tab 改读新 schema:运营 section → myAccount(我的帐户)/ codeManage(Code 与链接管理)/ codeLimit(可创建上限,实际数字而不再硬编码 20);报表 section → reportCode(邀请 Code 与链接管理)/ reportPlayer(玩家损益)/ reportRevshare(分润报表)。默认 perms fallback 同步更新' },
      { type: 'fix', text: '收款方式同样修复:优先读 me._payment(商户后台烘入的 IFSC/Account/RealName/Email),其次读 _formSnapshot 新键 ifsc/account/realName/payEmail,移除旧的 holder/payMethod 占位与「123123」假数据' },
    ],
  },
  {
    ver: 'v3.1.89',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '商户后台 → 已创建代理 + 自行申请代理 「查看&配置」内 8 个示例代理(AC100001~AC100008)资料补全,不再有「未填写」项 — 新增 AGENT_PROFILES 单一数据源,每个代理预填:流量来源链接(2~3 条匹配渠道的真实风格 URL)/ 收款方式(IFSC + 银行卡号 + 真实姓名 + 收款 Email)/ 备注(合作背景说明)' },
      { type: 'add', text: 'seedAppLogs 自动注入 _formSnapshot.trafficUrls / ifsc / account / realName / payEmail / remark,自行申请代理 detail 各 tab 全部有数据;ACSamples(已创建代理 AC100005~AC100008)同步烘入 _traffic / _payment / _comm(每周结算 · RV-001 方案 · ₹200~₹100,000)/ _perms(全开 + Code 上限 20)/ _formSnapshot' },
      { type: 'modify', text: '同一 ID 在「自行申请代理」与「已创建代理」两个列表中显示的资料完全一致,避免审核通过前后字段不对齐' },
    ],
  },
  {
    ver: 'v3.1.88',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '专业代理后台 EN 语言切换:补齐多处缺失的英文翻译 — ① my_revshare 整页(每周/每月结算、本期预估分润/已结算分润、期号/结算状态/未结算预估分润/周期/切换期号、6 个 KPI、表头 16 列含「注册时间/当前余额/期末余额/上期期末余额/上期佣金基数/佣金基数/分润比例/预估佣金/结算佣金/用户状态/结算记录」、盈利/亏损 pill、查询 action、空态)' },
      { type: 'fix', text: '② my_players 表头「注册时间」(mp.col.registered → Registered At)' },
      { type: 'fix', text: '③ my_codes_mgmt 工具栏「已创建 N / 20」counter(mcm.limit.counter_a → Created) 与上限弹窗 title/sub/body/tip 全部翻译' },
      { type: 'modify', text: 'my_revshare 分页统计「共 N 条 · 第 1/1 页」改用全局 pg.summary 模板,避免「Total N · Page 1/1」拼接散文' },
    ],
  },
  {
    ver: 'v3.1.87',
    date: '2026-05-22',
    changes: [
      { type: 'remove', text: '代理玩家损益(商戶後台 players.jsx) + 玩家损益(代理後台 my_players.jsx):删除「投注 / 派彩 / GGR」3 列与对应 3 个 KPI(总投注 / 总派彩 / GGR);与 v3.1.86 分潤報表的精简口径同步' },
      { type: 'modify', text: 'players.jsx KPI 9 → 6(玩家总数 / 总首存人数 / 总首存金额 / 总充值 / 累计提款 / 充提差),网格 5 列 → 6 列;表格 13 列 → 10 列,colSpan 12 → 9' },
      { type: 'modify', text: 'my_players.jsx KPI 9 → 6,网格 5 → 6;表格 10 列 → 7 列,colSpan 10 → 7' },
    ],
  },
  {
    ver: 'v3.1.86',
    date: '2026-05-22',
    changes: [
      { type: 'remove', text: '代理分潤報表(商戶後台) + 分潤報表(代理後台):删除「投注 / 派彩 / GGR」3 列与对应 KPI(总投注 / 总派彩 / GGR);分潤口徑改用 充值 - 提款 - 期末餘額 一條線,不再展示投注/派彩明細' },
      { type: 'remove', text: '同时删除「分润规则」tab — 规则实际由「商戶後台 → 運營 → 分潤管理」与「代理账户管理 → 查看&配置 → 分潤模式」配置,报表页不重复展示' },
      { type: 'modify', text: 'agent_revshare KPI 4 列 → 5 列网格(玩家总数 / 总充值 / 总提款 / 充提差 / 佣金合计);my_revshare KPI 5 列 → 6 列网格(玩家总数 / 充值 / 提款 / 充提差 / 总余额 / 总佣金);表格 colSpan 同步更新 estimate 13→10、settled 17→14' },
    ],
  },
  {
    ver: 'v3.1.85',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '分潤管理 → 收益分潤 / 單付費分潤:新增方案後,切走頁面再回來,新增的那條消失 — 原因 useState(SEED_*) 在組件卸載時重置回種子。修復:把 rows 提升到 window.RV_SINGLE_ROWS / window.RV_REVENUE_ROWS 模塊級持久化,setRows 同時寫回 window 並 rebuildPlans() 重建下拉選項,切頁回來從 window 取最新值' },
      { type: 'fix', text: '順帶修復新 ID 撞車 — 原 id 用 rows.length+1,刪除某條後再新增會產生重複 ID。改成 max(現有 ID 數字部分) + 1,單付費分潤 / 收益分潤 兩個 tab 同步修復' },
    ],
  },
  {
    ver: 'v3.1.84',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '自行申請代理 審核通過後 已創建代理 查看&配置 流量來源 / 收款方式 數據沒關聯過去 — 修复 3 处:① 通过弹窗 onCreateAgent 时 _traffic 优先用 form 里(管理员补填),为空时回落到 app._formSnapshot.trafficUrls(用户注册时填的);_payment 各字段同样回落到 _formSnapshot.ifsc/account/realName/payEmail' },
      { type: 'fix', text: '② 新代理 _appData._formSnapshot 写入时把 form 里的 trafficUrls / payment 字段合并进去(原来只浅拷贝 app._formSnapshot,丢失管理员在弹窗里补的内容)' },
      { type: 'fix', text: '③ AgentDetail _defaultTraffic 移除默认假数据(原来没数据时会显示 https://youtube.com/@xxx + https://t.me/xxx_channel,让用户以为关联了但其实是假的),改为返回 [\'\'] 一行空 input' },
    ],
  },
  {
    ver: 'v3.1.82',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '创建专业代理账户弹窗 Step 2/3/4 错误提示 stale 问题 — 用户已选/已填后,inline 错误提示仍显示。修复:在 onChange 里检测当前值是否满足必填,满足则从 errors 里删除对应 key,实时清除错误' },
      { type: 'modify', text: 'Step 2:分润方案选了即清 errors.plan / 最低佣金有值清 errors.minCommission / 最高佣金有值清 errors.maxCommission;Step 3:codeManage 关闭或 codeLimit ≥ 1 清 errors.codeLimit;Step 4:流量来源任一行有值清 errors.trafficUrls,Account/IFSC/Email/Real Name 各自有值清对应 errors' },
    ],
  },
  {
    ver: 'v3.1.82',
    date: '2026-05-22',
    current: true,
    changes: [
      { type: 'fix', text: '修复 创建专业代理账户弹窗 Step 3「可創建邀請Code上限數量」输入框每次输入一个数字后必须重新点击才能继续输入的 BUG — 原因:AgentPermsForm 内部把 PermRow / SectionCard 定义在函数体里,每次 render 都创建新的组件类型,React 把 input 当作新组件挂载导致失焦。修复:把两个子组件提取到 AgentPermsForm 外面,重命名为 _AgentPermRow / _AgentPermSectionCard,只创建一次' },
      { type: 'fix', text: '修复 创建专业代理账户弹窗 选择分潤方案 / 填入合法值后 错误提示不消失的 BUG — 新增 useEffect 监听 form + step,每次表单变化时自动清除已修正字段的 errors(不引入新错误,只删除);分潤方案 / 最低結算佣金 / 最高結算佣金 / 可創建邀請Code上限 / Account/IFSC/Email/Real Name / 流量来源链接 等全部字段实时响应' },
    ],
  },
  {
    ver: 'v3.1.82',
    date: '2026-05-22',
    current: true,
    changes: [
      { type: 'modify', text: '创建专业代理账户弹窗 全部非必填字段调整 — Step 4 流量/收款 整页非必填(流量來源鏈接 + 收款方式 4 字段);Step 2 分潤方案類型 非必填(代理分潤比例 由方案带出,方案没选时为空也不报错);只保留 最低結算佣金金額 / 最高結算佣金上限 必填' },
      { type: 'remove', text: 'validateStep 删除 Step 2 plan 校验、Step 3 codeLimit 校验、Step 4 全部校验;Step 4 各 input 移除红 *、移除 errors.pay_xxx inline 报错、移除 onChange 内清错代码,流量來源鏈接 label 加灰色「(選填)」hint' },
    ],
  },
  {
    ver: 'v3.1.81',
    date: '2026-05-22',
    changes: [
      { type: 'modify', text: '分润模式表单(CommissionModeForm)最低結算佣金金額 输入框 placeholder 从「200」改为「請輸入」(原以 200 作示例值容易和实际值混淆);最高結算佣金上限 已是「請輸入」不变。影响:创建专业代理弹窗 Step 2 + 已创建代理「查看&配置」分润模式编辑态' },
    ],
  },
  {
    ver: 'v3.1.80',
    date: '2026-05-22',
    changes: [
      { type: 'fix', text: '聯繫方式的 Email 与 收款方式的 Email 不再混淆 — 收款方式 Email 是用户银行账户的 email(用于打款),与联系方式 Email 不是同一个。修复 3 处 fallback 链:① 创建专业代理账户弹窗 prefill payment.email 仅取 _formSnapshot.payEmail,不再 fallback 到 contacts.Email / prefill.contact;② AgentDetail _defaultPayment.email 仅取 _payment.email / _formSnapshot.payEmail;③ 代理后台「我的账户 → 收款方式」payment.email 仅取 _formSnapshot.payEmail / me._payment.email,删除 contacts.Email / me.email 兜底' },
    ],
  },
  {
    ver: 'v3.1.79',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '创建专业代理账户弹窗 Step 2 误报「最低結算佣金金額必填」— form.commission 初始化时未带 minCommission/maxCommission,只在 CommissionModeForm 内部 fallback 显示了默认值 200,但状态里仍为 null。修复:form.commission 初始化时直接带入 { minCommission: 200, maxCommission: 1000000 }' },
      { type: 'modify', text: '所有步骤的错误提示从顶部红色 banner 改为 inline field-error 显示在对应输入框下方:CommissionModeForm 接受 errors prop,在 分潤方案 / 最低結算佣金 / 最高結算佣金 输入框下渲染错误文本 + 红色边框;AgentPermsForm 同样接受 errors,在 codeLimit 输入框下渲染;Step 4 流量来源链接 / Account / IFSC / Email / Real Name 各自渲染 inline 错误' },
      { type: 'modify', text: 'Step 4 流量來源鏈接 label 加红 *(必填);Account/IFSC/Email/Real Name 同样加红 *;布局改为 收款方式独占 + 4 字段 2x2(原 收款方式|IFSC,Account|Real Name,Email|空)' },
    ],
  },
  {
    ver: 'v3.1.78',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: 'PaymentInfoView Account / IFSC / Email / Real Name 4 个输入框 placeholder 改为「請輸入」(原 123123 / Nick An / 123@gmail.com);只读态没有值时显示 placeholder「請輸入」灰色(原 fallback 默认示例值)— 反映用户在注册时这几项确实未填写' },
      { type: 'modify', text: '创建专业代理账户弹窗 自行申请走的场景(isApplied=true)— Step 1「登录账号 / 初始密码」改为只读灰底显示(登录账号 mono 字体,密码显示 ••••••••);商户主动创建场景仍可编辑 input' },
      { type: 'modify', text: '自行申请审核场景 Step 4 流量/收款 prefill 默认值改空 — trafficUrls 默认 [\'\']、payment 4 字段 fallback 全空,让管理员补填' },
      { type: 'feat', text: '创建专业代理账户弹窗 每步必填校验:validateStep(s) 按 step 1/2/3/4 分别校验 — Step 1 代理名称/登录账号/初始密码/联系方式;Step 2 分润方案/最低/最高佣金;Step 3 codeManage 开启时 codeLimit;Step 4 trafficUrls ≥ 1 + Account/IFSC/Email/Real Name 必填' },
      { type: 'add', text: 'Step 2/3/4 顶部红色错误提示条(fef2f2 底 + fecaca 边),把当步所有错误一起展示;只有当前步骤全部通过才允许进入下一步(next),Step 4 校验通过才允许提交' },
    ],
  },
  {
    ver: 'v3.1.77',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 注册弹窗 Step 2 流量来源链接输入框 placeholder 改为「如 https://www.youtube.com/beans....」(原「https://domain.com」)— 同步改 agent_common.jsx + agent_login.jsx 内联 ZH/EN 字典(英文 e.g. https://...)' },
      { type: 'modify', text: '专业代理后台 注册弹窗 Step 3 密码 / 重新输入密码 输入框 placeholder 默认改为「請輸入」(RegPasswordInput 接受 placeholder prop,默认值 "請輸入")— 原无 placeholder 显示空白' },
    ],
  },
  {
    ver: 'v3.1.76',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 → 分润管理 → 收益分润 新增/编辑弹窗 删除「封頂金額」字段(原代理分潤比例 + 封頂金額 2 列网格,改回单列只剩 代理分潤比例);canSubmit 校验同步移除 cap 必填条件;handleSave 不再传 cap' },
      { type: 'modify', text: '備註 textarea placeholder 从「此方案為與 XXX 談過的合作內容,經上級批准配置的」改为「請輸入」' },
      { type: 'remove', text: 'SEED_REVENUE 删除 RV-002「團隊代理適用」示例,只保留 RV-001「建議個人代理適用」一条;两条 seed 的 cap:100000 字段一并删除' },
    ],
  },
  {
    ver: 'v3.1.75',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: 'app.jsx 顶栏代理胶囊 改为显示「代理名称(name) / 代理ID(agentId)」,原显示「loginName / agentId」(loggedInAgent.name 取不到时降级到 loginName)' },
      { type: 'modify', text: '专业代理后台 → 首页 按图重做(modules/agent_dashboard.jsx):垂直居中 60px 顶 padding 布局 — ① 大标题「你好,代理名称」36px;② 168×168 大圆头像(琥珀色 #f59e0b 实心边框 + 18% 透明底,56px AC 文字,mono 字体);③ 代理ID 28px mono + 旁边复制按钮(成功时变绿色 check icon,1.6s 后还原);④ 副标题「欢迎回来 · 上次登录 时间」15px,时间用 mono' },
    ],
  },
  {
    ver: 'v3.1.74',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 首页 欢迎页改用登入账号(loginName)显示,与顶栏右上角的代理名称一致 — 原显示 me.name(如 Sara_Network),改为 me._appData?.loginName || me.loginName || me.name 优先级(如 rajeshmedia)' },
      { type: 'modify', text: '欢迎页字号放大:标题「你好,xxx」从 PageHead 默认 19px → 32px;副标题「欢迎回来 · 上次登录」从 12px → 15px;时间用 JetBrains Mono 强调;改为自定义 div + h1 排版,不再用 PageHead 通用组件' },
    ],
  },
  {
    ver: 'v3.1.73',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '专业代理后台 → 我的账户 PageHead 右上角「下载合作协议」按钮删除' },
      { type: 'remove', text: '专业代理后台 侧栏顶部「首页」「PRD首页」两个大项删除 — 代理登入后侧栏直接从「运营」section 开始,「首页」仪表盘仍可通过顶栏 logo 返回访问' },
      { type: 'modify', text: '专业代理后台 → 首页 重做(modules/agent_dashboard.jsx)— 按图精简为纯欢迎页:只显示 PageHead「你好,Randy」+ 副标题「欢迎回来 · 上次登录 2026/5/21 HH:MM:SS」' },
      { type: 'remove', text: '删除原首页全部内容:通知中心 + 创建 Code 按钮、AgentHero、4 张 KPI 大卡(总玩家/有效CPA/月佣金/FTD)、近30天趋势图、快速入口、最近结算单、风险提醒等;modules/agent_dashboard.jsx 从 254 行 → 27 行' },
    ],
  },
  {
    ver: 'v3.1.72',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 我的账户 → 分润模式 tab 按图重做(不再复用 CommissionReadOnly)— 改为简洁的 label-value 列表:結算周期 / 結算幣種 / 最低結算佣金金額 (含「低于该金额顺延至下期」灰色注) / 最高結算佣金上限 / [分隔线] / 分潤方案 / 分潤比例 (蓝色 mono) / 計算口徑流程 (pre 文本块,无边框)' },
      { type: 'remove', text: '删除原 ad-section-title「分润规则」标题 + CommissionReadOnly 调用(form 风格的灰底输入框列表),改为更接近「合约条款」的呈现形式,代理后台只读视图独立于商户后台编辑表单' },
    ],
  },
  {
    ver: 'v3.1.71',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 我的账户 副标题改为「查看您的个人资料、合作方案、安全设置」(原「管理您的个人资料、安全设置与合作方案」)— 文案更平易、动词改为「查看」、顺序调整为 个人资料 → 合作方案 → 安全设置' },
      { type: 'modify', text: '专业代理后台 → 我的账户 → 收款方式 tab 改用 window.PaymentInfoView 共享组件(editing=false 只读)— 与商户后台「查看&配置」/「自行申请代理 查看&审核」视觉完全一致:收款方式 整宽 UPI / Account + IFSC / Email + Real Name;下方保留黄色提示「如需修改收款方式,请联系商户运营」' },
      { type: 'remove', text: '删除原 ad-section-title「收款方式」标题 + ad-info-card 单列 5 行键值对结构(已统一到 PaymentInfoView)' },
    ],
  },
  {
    ver: 'v3.1.70',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '分润模式表单 分潤方案類型 下拉占位文案改为「請選擇分潤方案」(原「收益分潤方案 · 週期資產變動分潤 · 方案名稱」太具体易误解);占位文字 var(--text-3) 灰色,选中方案后变为 text-0 正常色' },
      { type: 'modify', text: '計算口徑流程 未选方案时显示灰色提示「請先選擇分潤方案」(原即使未选也带出默认 STEP-1~4 公式),避免给出和当前未选状态不一致的信息;选了方案再带出对应公式' },
    ],
  },
  {
    ver: 'v3.1.69',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '分润模式 表单(CommissionModeForm + CommissionReadOnly)代理分潤比例 下方新增「計算口徑流程」只读公式块:无 * 号必填、灰底 pre 文本框,显示选中方案对应类型的公式(FORMULA_PERIOD_ASSET — 即上次更新的 STEP-1~4 流程);未选方案时显示默认公式' },
      { type: 'modify', text: '影响:创建专业代理弹窗 Step 2 / 已创建代理 → 查看&配置 → 分润模式(编辑+只读)/ 代理后台 → 我的帐户 → 分润模式,3 处同步' },
    ],
  },
  {
    ver: 'v3.1.68',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '分润模式 表单(CommissionModeForm + CommissionReadOnly)分潤方案類型 下拉下方新增「代理分潤比例」必填只读字段:disabled 灰底 input,根据当前选中的方案 ratio 自动带出(例 5%);未选方案时显示「請先選擇分潤方案」灰字占位' },
      { type: 'modify', text: '影响位置:创建专业代理账户弹窗 Step 2 / 已创建代理 → 查看&配置 → 分润模式 tab(编辑+只读)/ 代理后台 → 我的帐户 → 分润模式 tab — 同一组件,3 处同步' },
    ],
  },
  {
    ver: 'v3.1.67',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '抽取 window.PaymentInfoView 共享组件(modules/agents.jsx)— editing/value/onChange props,统一布局:收款方式 整宽锁定 UPI / Account / IFSC(同一行 2 列)/ Email / Real Name(同一行 2 列)' },
      { type: 'modify', text: '已创建代理 → 查看&配置 → 收款方式 tab 改用 PaymentInfoView:删除原 UPI pill + 黄色 hint 提示;_defaultPayment 扩展为 5 字段(method/ifsc/account/realName/email),兼容旧 upiId/holder 字段迁移到 account/realName' },
      { type: 'modify', text: '自行申请代理 → 查看&审核 → 收款方式 tab 改用 PaymentInfoView:替换原编辑模式的 2x3 网格 + 只读模式的 5 行卡片,与已创建代理视觉完全一致' },
      { type: 'modify', text: '收款方式视图列顺序按图调整:Account/IFSC → Email/Real Name(原 IFSC/Account → Real Name/Email);所有字段加 mono 字体一致化' },
    ],
  },
  {
    ver: 'v3.1.66',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '已创建代理 → 查看&配置 → 分润模式 只读视图(window.CommissionReadOnly)重做 — 布局完全镜像编辑态(CommissionModeForm),所有控件 disabled 形态:結算時間 只显示已选中那一行 radio(不显示另一选项也不显示「2选1」hint);結算幣種 / 最低結算佣金金額 / 最高結算佣金上限 改为 disabled input(灰底);分潤方案類型 改为 disabled input 显示已选方案 label + 右侧「分潤管理」链接(onJumpPlanMgr 存在时可点)' },
      { type: 'remove', text: '删除原 CommissionReadOnly 的 PlanCard 卡片 + Row 字段-值列表(最低首存/最低流水/最低 NGR/有效天數/活躍留存/排除提款過玩家/負盈利結轉/分潤計算公式流程/備註 等 10+ 行)— 改为与编辑态完全一致的简洁表单视觉' },
      { type: 'modify', text: '代理后台 → 我的帐户 → 分润模式 tab 同步受益(同一组件)' },
    ],
  },
  {
    ver: 'v3.1.65',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '自行申请代理 → 查看&审核 抽屉 申请审核行(申请进度 + 要求补件/拒绝/通过 按钮)从仅在「申请资料」tab 显示扩展到所有 tab(申请资料/流量来源/收款方式/操作记录),让审核人在任意 tab 都能直接处理申请;编辑模式下仍隐藏审核行,避免操作冲突' },
    ],
  },
  {
    ver: 'v3.1.64',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '自行申请代理 → 查看&审核 抽屉 收款方式 tab 重做 — 只读模式:卡片单列 5 行(收款方式 UPI / IFSC / Account / Real Name / Email),130px label + 值列,删除原 UPI pill 设计 + 黄色 hint 提示;编辑模式:2 列网格输入框(收款方式 UPI 灰底锁定 / IFSC / Account / Real Name / Email),与创建专业代理弹窗 Step 4 视觉一致' },
      { type: 'modify', text: 'SelfApplicationsList draft state 增加 ifsc / account / realName / email 4 字段,init 从 _formSnapshot 读;saveDraft 时把 4 字段写回 _formSnapshot(payEmail key)' },
    ],
  },
  {
    ver: 'v3.1.63',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '创建专业代理账户弹窗 Step 4 流量/收款 — 把 IFSC(123123)/ Account(123123)/ Real Name(Nick An)/ Email(123@gmail.com)/ 流量链接(https://agentp0.netlify.app/)从 placeholder 改为申请审核场景的预填值,代表代理在申请时填写的真实资料,不再是空输入提示' },
    ],
  },
  {
    ver: 'v3.1.62',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '创建专业代理账户弹窗 Step 4「流量/收款」按图1 重做 — 删除上版灰底只读区,改为 2×3 网格全输入框:收款方式(锁定 UPI 灰底)/ IFSC / Account / Real Name / Email,前 4 字段可编辑,标签样式与 Step 1 基本资料统一' },
      { type: 'modify', text: 'form.payment 数据结构从 { upiId, holder } 改为 { method, ifsc, account, realName, email };prefill 时从 _formSnapshot 读取 ifsc / account(兼容旧 upiId)/ realName(兼容旧 holder)/ payEmail(兼容 contacts.Email)' },
      { type: 'modify', text: '流量來源鏈接 label 颜色从 text-1 → text-0(更深),提交时把新的 5 字段 _payment 写入新代理对象' },
    ],
  },
  {
    ver: 'v3.1.61',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '创建专业代理账户弹窗 步骤指示器 3 → 4 步:新增第 4 步「流量/收款」,步骤圆点 + 连接线同步扩展;step 1/2/3 下一步按钮文案分别为「下一步:分润模式 / 权限配置 / 流量/收款」,只有 step 4 才显示「创建代理账户」按钮' },
      { type: 'add', text: 'Step 4 内容(按图):流量來源鏈接 — 输入框列表(placeholder https://agentp0.netlify.app/)+ 蓝色虚线「+新增流量來源鏈接」按钮;收款方式 — 灰底只读 5 行(收款方式 UPI / IFSC / Account / Real Name / Email)从 prefill._formSnapshot 读取,底部 hint「* 收款方式由代理在申请时填写,不可在此修改」' },
      { type: 'modify', text: 'CreateAgentModal form state 增加 trafficUrls + payment;prefill 时从 _formSnapshot 预填 trafficUrls / upiId / holder' },
      { type: 'modify', text: '提交时把 trafficUrls(过滤空值)+ payment 写入新代理对象的 _traffic / _payment,使「查看&配置 → 流量来源 / 收款方式」tab 能正确显示' },
    ],
  },
  {
    ver: 'v3.1.60',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '创建专业代理账户弹窗 步骤 3「权限配置」按图1 重做(window.AgentPermsForm):删除原 2×5 开关矩阵,改为两个 section 卡片 —「運營」(我的帳戶 查看 / Code與鏈接管理 查看·編輯 + 展开后可配置「可創建邀請Code上限數量」必填数字框) +「報表」(邀請Code與鏈接管理 查看 / 玩家損益 查看 / 分潤報表 查看)' },
      { type: 'modify', text: 'form.perms 数据结构改为 { myAccount, codeManage, codeLimit, reportCode, reportPlayer, reportRevshare };AgentDetail 查看&配置 perms tab 复用同组件,默认值 + 持久化同步' },
    ],
  },
  {
    ver: 'v3.1.59',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '创建专业代理账户弹窗 步骤2 分润模式表单(window.CommissionModeForm)按图1 重做:「結算/分潤時間」→「結算時間」;每周/每月两个 radio 各自只剩一行,移除内部星期/日期下拉(每周固定周一,每月固定 1 号)' },
      { type: 'add', text: '新增 3 个字段:結算幣種(只读 INR (₹))/ 最低結算佣金金額(默认 ₹200,带「低于该金额顺延至下期」hint)/ 最高結算佣金上限(空,placeholder「請輸入」);value 对象新增 minCommission / maxCommission 字段' },
      { type: 'modify', text: '分潤方案類型:hint「(最少配置 1 種方案類型)」→「(僅能配置 1 種方案類型)」;只渲染 1 个下拉,移除 − 删除按钮 + 移除「+ 新增分潤方案」整段;plans 数组仍保留(长度 1)以兼容已有数据' },
    ],
  },
  {
    ver: 'v3.1.58',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '分润报表 负数金额显示修正 — 商户后台 agent_revshare.jsx + 专业代理后台 my_revshare.jsx 中 money / moneyDec helper 改为 (n<0?\'-₹\':\'₹\') + F.money(Math.abs(n)),负号显示在币种符号前面(原来是 ₹-485 → 改为 -₹485);影响列:期末余额 / 上期期末余额 / 佣金基数 / 上期佣金基数 / GGR / 投注 / 派彩 等' },
    ],
  },
  {
    ver: 'v3.1.57',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '商户后台 分润报表 + 专业代理后台 分润报表 已结算分润 表格 用户状态 右侧新增「结算记录」列,该列单元格显示「查询」蓝色链接按钮' },
      { type: 'add', text: '点击「查询」弹出「已结算记录查询」弹窗:顶部 玩家UID 搜索框 + 查询按钮;下方 代理ID / 代理名称 / 邀请Code 三个只读字段;每周结算 / 每月结算 segmented 切换;10 列表格(期数 / 充值 / 提款 / 期末余额 / 上期期末余额 / 佣金基数 / 上期佣金基数 / 分润比例 / 结算佣金 / 用户状态)' },
      { type: 'add', text: '弹窗示例数据 5 期(每周 W26051~W26061 + 每月 M2602~M2606)按公式严格手算自洽:本期佣金基数 = (上期期末余额 + 上期佣金基数) + (本期充值 - 本期提现 - 本期期末余额);链式连接 — N+1 期的上期期末余额 = N 期的期末余额,N+1 期的上期佣金基数 = min(0, N 期佣金基数)' },
      { type: 'add', text: 'SettlementHistoryModal 定义于 agent_revshare.jsx 末尾并通过 window.SettlementHistoryModal 暴露,my_revshare.jsx 直接复用同一组件;colSpan(空状态)更新:已结算 16 → 17' },
    ],
  },
  {
    ver: 'v3.1.56',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 分润报表 玩家示例 4 笔 → 5 笔(my_revshare.jsx buildPeriodPlayers):重写为手算 5 笔,严格按公式 (上期期末余额 + 上期佣金基数) + (本期充值 - 本期提现 - 本期期末余额) = 本期佣金基数 自洽,覆盖 5 种结算场景 — #1 大盈利(base 6700, 佣金 335)/ #2 小盈利(base 1700, 佣金 85)/ #3 大亏损(base -5500 不计佣金)/ #4 小亏损(base -400 不计佣金)/ #5 持平(base 0 不计佣金)' },
      { type: 'modify', text: '商户后台 → 分润报表 每个代理玩家示例 2 笔 → 5 笔(agent_revshare.jsx _ARV_buildPeriodRows 循环 i<5);_ARV_makeRow 期末余额 seed 范围下调到 [-2400, +600] 让 baseRaw 偏正,5 行样本中能稳定出现明显盈利与亏损两种情况;上期佣金基数 seed 范围 [-1200, +300] 经 Math.min(0,...) 后保持 ≤ 0' },
    ],
  },
  {
    ver: 'v3.1.55',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '已结算分润 表格列名统一术语:「上期结算余额」→「上期期末余额」,「上期负佣金基数」→「上期佣金基数」(商户后台 agent_revshare.jsx + 专业代理后台 my_revshare.jsx 两处)' },
    ],
  },
  {
    ver: 'v3.1.54',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '分润管理 → 收益分润 新增/编辑弹窗 计算口径流程文案改版(FORMULA_PERIOD_ASSET):STEP-1 公式术语改为「上期期末余额 / 本期期末余额」,删除原「上期结算余额 ≥ 0」与「上期佣金基数为 0 < 0」两条注;STEP-2 改为「校验本期平台是盈利或亏损/持平」,2-1 / 2-2 末尾改成接 STEP-4 / STEP-3 + 4;新增独立 STEP-3「计算本期佣金 = 本期佣金基数 × 佣金分润比例」;新增 STEP-4「本期带入下期值:期末余额 + 佣金基数(负值带入,正值带 0)」' },
    ],
  },
  {
    ver: 'v3.1.53',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '分润管理 → 收益分润 删除「用户损失基数分润」方案类型(REV_TYPES);SEED_REVENUE 中 RV-001 type 改为 period(原 loss),与 RV-002 一致都是「周期资产变动分润」' },
    ],
  },
  {
    ver: 'v3.1.52',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '商户后台 + 专业代理后台 已结算分润 数据规范: (1) 上期结算余额 不会有负数 — 商户后台 prevUnsettled = Math.max(0, seed) 范围调整为 [0, 1000];代理后台 4 笔示例的 prevUnsettled 全部改为正数或 0 + 字段 setter 加 Math.max(0, ...) 兜底 (2) 上期负佣金基数 只会有负数或 0 — 商户后台 prevBase = Math.min(0, seed) 范围 [-800, 0];代理后台 4 笔示例 prevBase 改为负数或 0 + Math.min(0, ...) 兜底' },
    ],
  },
  {
    ver: 'v3.1.51',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 + 专业代理后台 已结算分润分页 表格列调整 — 「结算余额」→「期末余额」;「分润基数」→「佣金基数」' },
      { type: 'add', text: '已结算分润 表格新增 2 列:期末余额 右侧 +「上期结算余额」(灰色 text-2);佣金基数 左侧 +「上期负佣金基数」(负数红色,正数/0 灰色)' },
      { type: 'add', text: '商户后台 agent_revshare.jsx _ARV_makeRow 行数据补 prevUnsettled / prevBase 字段(原已计算用于 base 公式,这次暴露到列);专业代理后台 my_revshare.jsx prevUnsettled / prevBase 字段已存在,直接消费' },
      { type: 'modify', text: 'colSpan(空状态)更新:已结算 14 → 16' },
    ],
  },
  {
    ver: 'v3.1.50',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 分润报表 期号信息条样式与商户后台代理分润报表统一 — estimate tab 改为灰色外层 + 白底内层卡片(border + radius 8 + 阴影);settled tab 加同样灰色外层包裹,内层保留 v3.1.49 的浅蓝边框 + 切换期号蓝色按钮' },
    ],
  },
  {
    ver: 'v3.1.49',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 + 专业代理后台 已结算分润 期号选择框样式升级 — 边框由灰 → 浅蓝(#93c5fd 1.5px),hover/open 时 brand 蓝 + 3px brand 半透明光环;右侧 chevron 升级为「切换期号」蓝底白字按钮,下拉指引更明显' },
    ],
  },
  {
    ver: 'v3.1.48',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 4 个报表页(代理收益 / 代理推广链接 / 代理玩家损益 / 代理分润报表)工具栏右上角「共 N 条」/「共 N 个代理」counter 删除 — 左下角分页已显示总条数,避免重复' },
    ],
  },
  {
    ver: 'v3.1.47',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理分润报表 信息条改为独立卡片样式:外层灰色背景条 + 内层白底卡片(border + radius 8 + 阴影),与「图2」参考效果一致;estimate / settled tab 共用同一样式' },
    ],
  },
  {
    ver: 'v3.1.46',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '🐛 专业代理后台 → 分润报表「每周/每月结算」切换器没真正切换数据 — 原因:settledList 只构造一次 + estimate info 写死 W26061;改为 settledList useMemo 依赖 cycleType + estimateInfo 由 MR_ESTIMATE_INFO[cycleType] 动态取' },
      { type: 'add', text: '每周结算:本期预估 W26061 / 已结算 W26054、W26053;每月结算:本期预估 M2606 / 已结算 M2605、M2604;切换后 KPI + 表格用不同 seed 派生(每月数据 ≈ 每周 × 约 6 倍)' },
      { type: 'modify', text: '切换 cycle 时若选中已结算期不在新列表中,自动重置为新列表首期' },
    ],
  },
  {
    ver: 'v3.1.45',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 分润报表 副标题:「查看分润结算数据」→「查看本期预估分润与历史结算」(中英 i18n 字典 page.my_revshare.sub 同步)' },
      { type: 'add', text: '专业代理后台 → 分润报表 副标题下方新增「每周结算 / 每月结算」segmented 切换器(样式同商户后台代理分润报表);默认每周结算' },
      { type: 'fix', text: 'agent_common.jsx i18n 字典清理:page.my_revshare 两条 add() 之前被合并在同一行尾部还残留「tails」错字,拆成 2 行并修正英文翻译' },
    ],
  },
  {
    ver: 'v3.1.44',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '商户后台 → 代理分润报表 「每周/每月结算」segmented 右侧新增「说明」按钮(右上 ghost btn);点击弹出说明弹窗' },
      { type: 'add', text: '说明弹窗 3 个章节：(1)结算周期/结算时间(表格 — 每周一 00:00:00 / 每月 1 号 00:00:00) (2)期编号规则(W26051 / M2605 拆解) (3)结算周期切换规则(到下个月 1 号才生效 + 周→月 / 月→周 双栏说明 + AC100007 例子)' },
    ],
  },
  {
    ver: 'v3.1.43',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '商户后台 → 代理分润报表 表格「邀请Code」右侧新增「注册时间」列 — 基于 (代理+Code+期+UID) seed 派生近 1~90 天随机时间(稳定不抖动),格式 YYYY/MM/DD HH:mm:ss,可排序;空状态 colSpan 同步 +1' },
    ],
  },
  {
    ver: 'v3.1.42',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 → 代理分润报表 删除「全部代理」选项 — 默认选中代理列表首项(AC100005);头部胶囊不再支持「✕」清除回全部' },
      { type: 'remove', text: 'KPI 删除「代理总数」(因为已经选中具体代理) + 「盈利户数」(冗余于表格用户状态列);KPI 由 10 张 → 8 张,网格由 5 列 → 4 列布局' },
      { type: 'add', text: '选中代理头部胶囊 ID·名称 后面新增「当前结算周期」pill — 每周结算(蓝)/ 每月结算(绿),与下拉项的 cycle pill 同步样式' },
      { type: 'modify', text: '代理选择器下拉每行 状态 pill 范围:从只显示非 active 状态扩展为全部 4 状态都显示(已启用绿/已冻结黄/已停用红/未启用灰)' },
    ],
  },
  {
    ver: 'v3.1.41',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理分润报表 结算周期切换生效规则 — 周→月或月→周切换都要等「下个月 1 号」才生效。每个代理某一历史期只属于一种结算方式，不会重叠（例如：5 月已是月结算的代理不会同时出现在 W26053/W26054 周结算里）' },
      { type: 'add', text: '示例数据体现切换：AC100005 一直每周;AC100006 一直每月;AC100007 5/1 起切到每月(之前周;故 weekly W26053/W26054 不出现,只在 monthly M2605/M2606 出现);AC100008 6/1 起切到每周(之前月;故 monthly M2604/M2605 仍出现,M2606 不出现,weekly W26061 出现)' },
      { type: 'modify', text: '行过滤逻辑:对每期(预估/已结算)按该期 end 时间 + 代理 switchAt 判断该代理是否在该期、该 cycle 下出现;代理选择器下拉始终显示全部 4 个代理(不论 cycle),pill 显示「当前结算周期方案」' },
    ],
  },
  {
    ver: 'v3.1.40',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理分润报表 「每周结算 / 每月结算」segmented 切换器 位置:从 PageHead 下方 → 移到代理选择器下方(整体顺序:PageHead → 代理选择器 → 每周/每月切换 → Tabs)' },
      { type: 'modify', text: '规则调整:每个代理同时拥有「每周结算报表 + 每月结算报表」(因为代理可能中途从每周改为每月,两套报表都要保留);两个 cycle 下拉都显示全部 4 个代理' },
      { type: 'add', text: '代理选择器下拉每项「代理名称」右侧新增 cycle pill — 标注该代理「当前结算周期方案」:每周结算(蓝色 chip)/ 每月结算(绿色 chip);依据 index 派生(偶数 = 每周,奇数 = 每月)' },
    ],
  },
  {
    ver: 'v3.1.39',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '期号规则统一 — 每周:W + YY + MM + 周序(如 W26051 = 2026 年 5 月第 1 周);每月:M + YY + MM(如 M2605 = 2026 年 5 月)' },
      { type: 'modify', text: '商户后台 → 代理分润报表 期号:每周 W3/W2/W1 → W26061/W26054/W26053;每月 M6/M5/M4 → M2606/M2605/M2604' },
      { type: 'modify', text: '代理后台 → 分润报表 期号:本期预估 W3 → W26061;已结算 W2/W1 → W26054/W26053(代理后台暂无每月结算 tab,仅做每周对齐)' },
    ],
  },
  {
    ver: 'v3.1.38',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理分润报表 表格列顺序调整:「玩家UID」与「邀请Code」位置调换(玩家UID 在前、邀请Code 在后)— 与代理后台 my_revshare 对齐' },
      { type: 'fix', text: '🐛 代理选择器显示 80 人 — 原因:用户未进入「代理账户管理」时 APS_MERCHANT_AGENTS_STORE 未初始化,fallback 落到 D.agents(假数据 80 条);改为:(1) agents.jsx 把 ensureMerchantAgentsStore 挂到 window.APS_ensureMerchantAgentsStore (2) agent_revshare.jsx mount 时主动调用,确保只读 store 的 4 个真实已创建代理' },
      { type: 'add', text: '商户后台 → 代理分润报表 「每周结算 / 每月结算」分流代理:偶数 index 代理(AC100005 / AC100007)归每周结算;奇数 index 代理(AC100006 / AC100008)归每月结算 — 反映「每个代理只能选一种结算方式」;切换 cycle 时若原选中代理不在新 cycle 下,自动重置为「全部代理」' },
      { type: 'modify', text: '每月结算 期号格式:「2026/05 / 2026/04」改为「M5 / M4」;预估期号 「2026/06」改为「M6」 — 与每周结算 Wn 格式对齐' },
      { type: 'modify', text: '每月结算 周期保持:每月 1 号 00:00:00 ~ 月底 23:59:59(已结算 M5 = 2026/5/1~5/31;M4 = 2026/4/1~4/30;预估 M6 = 2026/6/1~6/30)' },
    ],
  },
  {
    ver: 'v3.1.37',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '🐛 商户后台 → 代理分润报表 页面底部出现重复的「代理分润报表 P0-7 MVP 上线」占位卡片 — 原因:app.jsx 第 637 行 fallback whitelist 漏掉 agent_revshare,导致主路由分发渲染了正常模块的同时，fallback 又渲染了一个占位卡片。把 agent_revshare 加入 whitelist 解决' },
      { type: 'add', text: '商户后台 → 代理分润报表 PageHead 下方新增「每周结算 / 每月结算」segmented 切换器 — 切换后预估期信息条 + 已结算期下拉同步更新:每周=W3/W2/W1;每月=2026/06/2026/05/2026/04' },
      { type: 'remove', text: '商户后台 → 代理分润报表 表格 删除「代理ID」+「代理名称」列(15 列 → 13 列;14 列 → 12 列)— 顶部已有代理选择器，列再展示就重复了;搜索框 placeholder 同步精简为「邀请Code / 玩家UID」' },
    ],
  },
  {
    ver: 'v3.1.36',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '回退 v3.1.35 对「AG000000-本商户」标签的删改 — AG000000 是平台根节点标记(不是 AG 代理范例),保留:agents.jsx 列表 parentLabel + AgentDetail parentLabel + CreateAgentModal 下拉「默认AG000000-本商户」+ agent_profile.jsx parentLabel 4 处全部还原' },
    ],
  },
  {
    ver: 'v3.1.35',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: 'P0 简化版彻底清理:整個系統只剩 AC(代理後台自行申請),把所有 AG / AP 範例資料 + 引用清掉' },
      { type: 'modify', text: 'data.js genAgents 80 个范例代理 ID 由 AG100001+ → AC100001+;前 5 笔示例名称由 AG範例1~4 + AP範例6 → AC範例1~5;players/codes/cpa/settlements/risk/logs/alerts 中所有 AG100xxx 引用同步改为 AC100xxx' },
      { type: 'modify', text: 'modules/agent_common.jsx 当前登录代理 CURRENT_AGENT_ID:AG100007 → AC100006' },
      { type: 'modify', text: 'modules/my_wallet.jsx 6 条结算交易记录:STL-...-AG100007 → STL-...-AC100006' },
      { type: 'modify', text: 'modules/agent_notify.jsx 通知中心 2 条结算通知:STL-...-AG100007 → STL-...-AC100006' },
      { type: 'modify', text: 'modules/frontend.jsx referrer placeholder「如 AG10042」→「如 AC10042」(中英两版)' },
      { type: 'modify', text: 'app.jsx 顶栏代理胶囊 avatar:删除 isAp 分支(AG=蓝/AP=绿),统一显示 AC + 黄色 (#f59e0b)' },
      { type: 'modify', text: 'modules/agents.jsx 列表 + 详情 parent label fallback「AG000000-本商户」→「本商户」' },
      { type: 'modify', text: 'modules/agent_profile.jsx parent label fallback「AG000000-本商户」→「本商户」' },
      { type: 'modify', text: 'modules/agents.jsx AgentDetail 头像逻辑简化:删除 AG/AP/AC 三态分支,统一为 AC + 黄色' },
    ],
  },
  {
    ver: 'v3.1.34',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '商户后台 → 代理分润报表 顶部新增「代理选择器」(自定义下拉,在 PageHead 与 Tabs 之间) — placeholder「选择查询的代理ID·代理名称」,选项实时从 APS_MERCHANT_AGENTS_STORE 拉取(代理账户管理已创建代理同步出现)' },
      { type: 'add', text: '下拉首项「全部代理」+ 显示总人数；每项展示代理ID(蓝色 mono)+ 名称 + 状态 pill(冻结/停用/未启用着色)；空 store 时提示「请先在代理账户管理创建」' },
      { type: 'add', text: '选中后头部胶囊展示「ID · 名称」+ 「✕」一键清除回「全部代理」；选择后立即筛选 estimate/settled 两期表格 + KPI 同步重算 + 翻页归 1' },
    ],
  },
  {
    ver: 'v3.1.33',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '专业代理后台 → 分润报表 表格「邀请 Code」右侧新增「注册时间」列 — 4 笔示例玩家固定注册时间(5/12 10:24:31 / 5/05 16:08:54 / 4/18 22:41:09 / 5/14 09:15:42)；本期预估与已结算两期共用；colSpan(空状态)对应 +1' },
    ],
  },
  {
    ver: 'v3.1.32',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '商户后台 → 报表 → 代理玩家损益 下方新增「代理分润报表」(modules/agent_revshare.jsx) — 商户视角分润报表,与代理后台 my_revshare 对应' },
      { type: 'add', text: '页面结构 3 tab：本期预估分润 / 已结算分润 / 分润规则；预估期信息条「期號 W3 · 結算狀態 · 週期」；已结算期下拉切换 W2/W1' },
      { type: 'add', text: 'KPI 10 张：代理总数 / 玩家总数 / 总充值 / 总提款 / 充提差 / 总投注 / 总派彩 / GGR / 预估或结算佣金合计 / 盈利户数比' },
      { type: 'add', text: '表格 14~15 列(代理 × 玩家 维度)：代理ID / 代理名称 / 邀请Code / 玩家UID / 充值 / 提款 / 充提差 / [当前余额 or 结算余额] / 投注 / 派彩 / GGR / [分润基数(仅已结算)] / 分润比例 / [预估佣金 or 结算佣金] / 用户状态；所有数字列可点击表头排序' },
      { type: 'add', text: '搜索框 placeholder「代理ID / 代理名称 / 邀请Code / 玩家UID」+ 用户状态筛选(全部/盈利/亏损)+ 共 N 条 counter' },
      { type: 'add', text: '与既有计算口径对齐：预估佣金 = max(0, 充值 - 提款 - 余额)；结算佣金 = max(0, 上期未结算余额 + 上期佣金基数 + (本期充值 - 提款 - 结算余额)) × 5%' },
      { type: 'modify', text: 'app.jsx NAV 商户后台「报表」section 新增子项；app.jsx 主路由分发新增 agent_revshare → window.AgentRevshareModule；index.html script 引用 agent_revshare.jsx；prd.jsx P0-7 mapping 新增 merchant/agent_revshare 路径' },
    ],
  },
  {
    ver: 'v3.1.31',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '专业代理后台 → 玩家损益 / 分润报表 表格列「来源 Code」改为「邀请 Code」— my_players.jsx + my_revshare.jsx fallback 文案 + agent_common.jsx i18n 字典 mp.col.source_code 三处同步(中:邀请 Code;英:Invite Code)' },
    ],
  },
  {
    ver: 'v3.1.30',
    date: '2026-05-21',
    changes: [
      { type: 'add', text: '专业代理后台 → 玩家损益 表格「来源 Code」右侧新增「注册时间」列 — 5 笔示例玩家分别派生不同 days-ago(3/12/45/1/28 天前),格式 YYYY/MM/DD HH:mm:ss;表格 9 列 → 10 列' },
    ],
  },
  {
    ver: 'v3.1.29',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 → 代理玩家损益 删除「总玩家余额」KPI、表格「玩家余额」列、「总佣金」KPI（KPI 11 张 → 9 张；表格 13 列 → 12 列）— 该报表聚焦损益/GGR，余额与佣金归并到「代理钱包 / 分润管理」专门页查' },
      { type: 'add', text: '表格「玩家UID」右侧新增「注册时间」列 — 基于行 seed 派生近 1~60 天内随机时间（稳定不抖动），格式 YYYY/MM/DD HH:mm:ss，可点击表头排序' },
    ],
  },
  {
    ver: 'v3.1.28',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 报表 → 玩家损益 重命名「代理玩家损益」 — 侧栏 NAV label + players.jsx PageHead 标题 + prd.jsx P0-4 mapping 路径同步;路由 key 仍为 players' },
      { type: 'feat', text: '代理玩家损益 整页重做按截图：副标题「查看代理邀请的玩家收益」' },
      { type: 'feat', text: 'KPI 由 6 张换成 11 张（5+5+1）：玩家总数 / 总首存人数 / 总首存金额 / 总充值金额 / 累计提款金额 / 充提差(±着色) / 总玩家余额 / 总投注 / 总派彩 / GGR(±着色) / 总佣金' },
      { type: 'feat', text: '表格列由 13 列(全部玩家视角)改为 13 列「代理 × Code × 玩家」维度：代理ID / 代理名称 / 邀请Code / Code 创建时间 / 玩家UID / 首次存款金额 / 充值金额 / 提款金额 / 充提差 / 玩家余额 / 投注 / 派彩 / GGR' },
      { type: 'add', text: '数据维度扁平化：取代理 store 前 2 个代理 × 每代理 2 个 Code × 每个 Code 1 个示例玩家 = 4 行，与截图一致；货币统一 ₹；所有数字列可点击表头排序(默认充提差 ↓)' },
      { type: 'add', text: '工具栏：搜索框 placeholder「代理ID / 代理名称 / 邀请Code / 玩家UID」+ 复用 window.TimeRange(近 7/14/30 日 + 双月历自定义)+ 右侧「共 N 条」counter' },
      { type: 'remove', text: '移除 Tabs(全部/已首存/有效CPA/风控中/已冻结) — 该报表只关注损益，状态/风控/CPA 在「玩家管理 / CPA 管理 / 风控管理」专门页查' },
      { type: 'remove', text: '移除 VIP/国家/CPA状态/导出筛选下拉 + 详情 Drawer — 同上' },
    ],
  },
  {
    ver: 'v3.1.27',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 → 代理推广链接 删除表格「代理创建时间」列 — 该报表关注 Code 本身的资料，代理创建时间可在「代理账户管理」查' },
      { type: 'add', text: '表格「邀请Code」右侧新增「Code 创建时间」列 — 基于 (代理+Code) seed 派生近 1～90 天内随机时间（稳定不拖动），格式 YYYY/MM/DD HH:mm，可点击表头排序' },
      { type: 'fix', text: '范例资料消失 bug — 上版 v3.1.25 把 _pickMixedAgents() 限制为「只挑 AC 开头」误用了不存在的前缀（实际代理 ID 是 AG于商户创建 / AP于自行申请，无 AC）导致表格「共 0 条」；改回取 list 前 3 个代理（不过滤 ID 前缀），范例资料恢复' },
    ],
  },
  {
    ver: 'v3.1.26',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '代理后台 → 玩家损益 移除「VIP 等级」筛选下拉(全部 VIP)与表格「VIP 等级」列 — 代理视角下 VIP 等级非关键决策字段,精简后工具栏剩搜索 + 时间维度,表格 10 列 → 9 列' },
    ],
  },
  {
    ver: 'v3.1.25',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理推广链接 表格代理 ID/名称 由「AG + AC 混合」改为「只显示 AC」— _pickMixedAgents() 简化为 .filter(startsWith AC).slice(0, n);AG (商户创建代理)的范例数据不再出现在该报表(报表仅展示「代理后台自行申请」的 AC 代理)' },
    ],
  },
  {
    ver: 'v3.1.24',
    date: '2026-05-21',
    changes: [
      { type: 'fix', text: '商户后台 → 代理推广链接 邀请 Code 重复问题:原 _codesFor 用代理名前缀生成(AC範例1→AC01,AC範例2→AC01 — 撞码),改为全局 Code 池(CD_GLOBAL_POOL: RANDY01/RANDY02/JACK01/JACK02/LISA01/KEVIN01/TINA01/TINA02/MIKE01/EVA01)按代理顺序依序分配,保证全局唯一' },
      { type: 'fix', text: '商户后台 → 代理推广链接 代理ID 只有 AC 没有 AG 问题:原 .slice(0,3) 取连续 3 个(都是 AC 自申请的)→ 新增 _pickMixedAgents() 把 list 拆成 AC + AG 两组交替挑选,确保表格能同时看到 AC 与 AG 两种代理 ID' },
    ],
  },
  {
    ver: 'v3.1.23',
    date: '2026-05-21',
    changes: [
      { type: 'modify', text: '商户后台 → 代理推广链接 范例资料精简 — 代理由 12 个 → 3 个,每个代理 Code 数从 1~3 → 1~2 个,总行数约 3~6 行(与截图 4 行接近)' },
    ],
  },
  {
    ver: 'v3.1.22',
    date: '2026-05-21',
    changes: [
      { type: 'feat', text: '商户后台 → 报表 → 代理推广链接 整页重做,匹配新截图:标题副标题改「代理推广链接 · 查看所有代理生成 code 链接的收益数据」' },
      { type: 'feat', text: 'KPI 由 4 张换成 8 张(2 行 × 4):Code 总数量 / 总注册人数 / 总充值人数 / 总充值金额 / 总提款人数 / 总提款金额 / 充值转化率 / 充提差 — 充提差 hero 着色(+绿/-红 + 卡片底色边框)' },
      { type: 'feat', text: '表格列由 13 列改为 11 列「代理 × Code」维度:代理ID / 代理名称 / 代理创建时间 / 邀请Code / 注册人数 / 充值人数 / 充值金额 / 提款人数 / 提款金额 / 充值转化率 / 充提差 — 移除原 渠道/Campaign/Clicks/FTD/CPA/转化率/佣金/状态/有效期/操作 列' },
      { type: 'add', text: '数据维度从「单个 Code」改为「代理 × Code」扁平化:每个代理 1~3 个 Code(基于 _displayId 哈希稳定生成),共约 12~24 行;货币统一 ₹' },
      { type: 'add', text: '工具栏 升级:搜索 placeholder「代理ID / 代理名称 / 邀请Code」+ 复用 window.TimeRange(近 7/14/30 日 + 双月历自定义)+ 右侧「共 N 条」counter — 移除 全部渠道/全部状态/Tabs(Code 列表/数据报表/Tracking Link)/创建 Code 按钮' },
      { type: 'add', text: '所有 9 个数字列可点击表头排序(↕▲▼),默认按 充提差 ↓;充值转化率阈值色 ≥40% 绿 / ≥28% 默认 / <28% 灰;充提差 ± 前缀 +绿/-红' },
      { type: 'remove', text: '删除原 QR Code 弹窗 / 创建 Code 弹窗 / CodeReport (TOP 15 ROI) / TrackingLinks 模板 4 块代码 — 报表页不需要创建/编辑/QR 这些功能(归 代理后台 → Code 与链接管理)' },
    ],
  },
  {
    ver: 'v3.1.21',
    date: '2026-05-21',
    current: true,
    changes: [
      { type: 'modify', text: '商户后台 → 代理收益 范例资料从全部 80 条精简到前 12 条(.slice(0,12))— 报表演示用,避免列表过长;KPI / 合计仍按筛选后的 12 条聚合' },
    ],
  },
  {
    ver: 'v3.1.20',
    date: '2026-05-21',
    changes: [
      { type: 'remove', text: '商户后台 → 代理收益 表格 删除「代理名称」旁边的 tier pill(总代理/个人代理/团队代理徽章)' },
      { type: 'remove', text: '商户后台 → 代理收益 表格 删除「充值金额 / 提款金额」单元格下的 mini bar 进度条' },
      { type: 'remove', text: '商户后台 → 代理收益 表格 删除「合计(当前筛选)」tfoot 合计行' },
    ],
  },
  {
    ver: 'v3.1.19',
    date: '2026-05-21',
    changes: [
      { type: 'feat', text: '商户后台 → 报表 → 代理收益 整页重做:KPI 由 4 张换成 9 张(代理总数 / 总注册人数 / 总充值人数 / 总充值金额 / 总提款人数 / 总提款金额 / 充值转化率 / 充提差 / ARPPU),5 + 4 排版 — 与「代理推广链接 / 玩家损益」KPI 词表对齐,货币统一 ₹' },
      { type: 'feat', text: '表格列由 10 列改为 12 列:代理ID / 代理名称 / 代理创建时间 / Code数量 / 注册人数 / 充值人数 / 充值金额 / 提款人数 / 提款金额 / 充值转化率 / 充提差 / ARPPU — 移除「CPA / 分润 / 本期未结算 / 总收益 / NGR / 玩家数」等旧指标' },
      { type: 'add', text: '充提差 KPI hero 着色 — 正值绿、负值红 + 卡片细边框+底色 4% 透明度' },
      { type: 'add', text: '表格视觉强化:充值金额 / 提款金额 各加 2px mini bar(brand 蓝 / warning 黄,相对本页最大值);充值转化率 ≥40% 绿 / ≥28% 默认 / <28% 灰;充提差 +绿/-红 带 ± 前缀;代理名称行内 inline tier pill(个人 / 团队 / 总代理 三色)' },
      { type: 'add', text: '所有 9 个数字列可点击表头排序(↕ ▲ ▼ 指示器)默认按 充提差 降序;新增 tfoot 合计(当前筛选)行 — 12 列均显示加总' },
      { type: 'add', text: '工具栏 升级:搜索 placeholder「代理ID / 名称」+ 全部代理类型 下拉(个人/团队/总代理)+ 复用 window.TimeRange(近 7 / 14 / 30 日 + 双月历自定义)+ 右侧「共 N 个代理」counter' },
      { type: 'add', text: '种子化稳定假数据:基于 agent._displayId 哈希派生 codes / reg / dep / wd / depAmt / wdAmt / arppu,确保每个代理数据稳定不抖动且各代理之间有差异(允许少数代理出现负充提差)' },
    ],
  },
  {
    ver: 'v3.1.18',
    date: '2026-05-20',
    changes: [
      { type: 'fix', text: '代理后台 → 我的帐户 → 流量来源 tab 显示「未填写流量来源」与商户后台「查看&配置」对不上:复用商户弹窗同款 fallback 逻辑 — 当代理对象无 _formSnapshot.trafficUrls 时,基于 me.name 生成 2 个默认链接(https://youtube.com/@xxx + https://t.me/xxx_channel)' },
    ],
  },
  {
    ver: 'v3.1.17',
    date: '2026-05-20',
    changes: [
      { type: 'add', text: '商户后台 已创建代理 + 自行申请代理 所有范例数据 补上「联系方式」Email + 手机 — 让「查看&配置 / 查看&审核 → 基本资料 → 联系方式」表格不再为空' },
      { type: 'add', text: 'SELF_APPLICATIONS_INITIAL 8 条 AC 范例新增 phone 字段(98123 11001 ~ 91000 88008)' },
      { type: 'add', text: 'seedAppLogs() 自动构造 _formSnapshot.contacts:[{type:Email,value:contact},{type:手机,value:phone,dial:+91}],已有 snapshot 则不覆盖 — 网站前台真实提交的数据不受影响' },
      { type: 'add', text: 'ACSamples (AC100005~AC100008) 新增 phone 字段 + push 到 MERCHANT_AGENTS_STORE 时构造 _appData.contacts 数组结构(过滤空值)' },
      { type: 'modify', text: 'AP範例6 (_appData.contacts) 从字符串「+91 98123 45678」改为数组结构:[{type:Email,value:apexample6@gmail.com},{type:手机,value:98123 45678,dial:+91}] — 与 ACSamples 数据结构对齐' },
    ],
  },
  {
    ver: 'v3.1.16',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 我的帐户 → 基本资料 tab 删除「备注」section(备注 title + 灰底卡片)— 代理用户无需看到/编辑商户对该代理的内部备注' },
    ],
  },
  {
    ver: 'v3.1.15',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 我的帐户 → 基本资料 tab 删除「冻结帐户 / 停用帐户」按钮 — 代理用户不应看到这两个操作(权限属于商户运营)' },
      { type: 'fix', text: '代理后台 → 我的帐户 → 基本资料 「已启用」帐户状态 pill 改绿色:背景 #dcfce7 / 字色 #15803d / 边框 #86efac(原 status-pill p-success class 在代理后台未生效)' },
    ],
  },
  {
    ver: 'v3.1.14',
    date: '2026-05-20',
    changes: [
      { type: 'add', text: '代理后台 → 我的帐户 → 分润模式 tab 默认数据:未配置 _comm 时给默认示例「revenue:RV-002 (週期資產變動分潤 · 團隊代理適用)」,与商户后台分润管理 SEED_REVENUE 对齐 — 让页面默认就能看到完整分润规则卡片(后续与商户后台关联)' },
      { type: 'add', text: 'window.CommissionReadOnly 新增 hideHeader prop:为 true 时不渲染内部「分润规则 + badge」标题;PlanCard 同步加 hideHeader 支持 — 代理后台「我的帐户」用外层 ad-section-title 统一,避免双重 title' },
      { type: 'modify', text: 'agent_profile.jsx 分润模式 tab 调用 CommissionReadOnly 时传 hideHeader=true' },
    ],
  },
  {
    ver: 'v3.1.13',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 我的帐户 → 权限配置 tab 删除「其他」section(下级代理 / 申请提款 / 素材下载 / API / 跨层数据 / 创建下级代理)— 只保留「运营 / 报表」两个 section,与目标截图一致' },
    ],
  },
  {
    ver: 'v3.1.12',
    date: '2026-05-20',
    changes: [
      { type: 'modify', text: '代理后台 → 我的帐户 → 收款方式 tab 字段扩展:从原「付款方式(UPI pill)/ UPI ID / 收款人姓名」3 个字段,改为按截图加上 5 个字段:收款方式 / IFSC / Account / Real Name / Email' },
      { type: 'add', text: 'payment 对象新增 ifsc / account / email 字段,从 _appData._formSnapshot.ifsc/account/email 读;未配置时给默认值(123123 / 123123 / Email 联系方式 / 123@gmail.com)— 后续与商户后台「收款方式 tab」补充对应字段关联' },
      { type: 'remove', text: '收款方式 tab 去掉 UPI pill 蓝色徽章,改为纯文字「UPI」 — 与截图视觉一致' },
    ],
  },
  {
    ver: 'v3.1.11',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '代理后台 → 我的帐户 整页重做:tabs 从 3 个(基本资料 / 合作方案 / 安全设置)扩展为 6 个,与商户后台「查看&配置」弹窗对齐:基本资料 / 分润模式 / 权限配置 / 流量来源 / 收款方式 / 安全设置' },
      { type: 'add', text: '基本资料 tab 在「基本资料 / 联系方式」之间新增「帐户状态」行:显示「已启用」pill + 「冻结帐户 / 停用帐户」按钮 — 点击 toast 提示「需联系商户运营」(代理无权限自行操作)' },
      { type: 'add', text: '分润模式 tab:复用 window.CommissionReadOnly 组件,从 me._comm 读取代理的分润模式配置(商户创建时烘入);未配置时显示「尚未配置分润方案」占位' },
      { type: 'add', text: '权限配置 tab:按「运营 / 报表 / 其他」3 个 section 渲染,从 me._perms 读;运营 section 在「Code 与链接管理」开启时附带「可创建邀请 Code 上限数量 20」字段' },
      { type: 'add', text: '流量来源 tab:从 me._appData._formSnapshot.trafficUrls 读取代理申请时填写的流量来源链接,只读 input 列表展示;未填写时显示占位' },
      { type: 'add', text: '收款方式 tab:UPI 卡片显示 付款方式(UPI pill)/ UPI ID / 收款人姓名;底部黄色提示「如需修改请联系商户运营」' },
      { type: 'remove', text: '安全设置 tab 删除「二步验证(2FA)」整段(SecurityRow + 2FA Modal),只保留「登入密码」一行 — 与截图目标设计一致' },
      { type: 'remove', text: '删除 plan tab 整段内容(原 CPA/RevShare 卡片 + 合作方案 hero + 权限范围 grid)+ 相关 plan 对象、devices mock 数据、PlanRow 子组件、show2FA state' },
      { type: 'add', text: '新增 PermRow 子组件:✓/✗ + 权限名称 + (查看/编辑) 灰色后缀,用于权限配置 tab 渲染' },
    ],
  },
  {
    ver: 'v3.1.10',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '商户后台 → 已创建代理「查看&配置」弹窗 → 分润模式 tab 非编辑态改造为清晰的「分润规则」字段-值卡片(替换原 form 半透明展示)' },
      { type: 'add', text: '新增 window.CommissionReadOnly 组件 (revshare.jsx),按 plan 模式分别渲染:收益分润 显示 分润方案/结算周期/结算币种/最低结算金额/分润比例/结算佣金上限/负盈利结转/分润计算公式流程/备注;单付费分润 显示 最低首存/流水倍数/NGR/有效天数/活跃留存/排除提款过玩家/备注' },
      { type: 'add', text: '新增 window.resolvePlan(key) helper:按 single:/revenue: key 前缀解析出完整 plan 详情(含 modeLabel/typeLabel/formula),供只读视图使用' },
      { type: 'add', text: '新增 window.RV_PLATFORM_DEFAULTS 平台级结算默认值:币种 INR(₹)/最低结算金额 ₹200/负盈利结转 是 — 后续可改成读取商户设定' },
      { type: 'add', text: '多 plan 时分别渲染多张「分润规则」卡片,卡片头部带方案模式 badge(收益分润 蓝 / 单付费分润 绿);plan 已被删除时显示「方案不存在」占位' },
      { type: 'modify', text: '编辑态仍使用 window.CommissionModeForm(form 表单);非编辑态切换为只读视图,移除原 opacity:.85 + pointerEvents:none 的半透明处理' },
    ],
  },
  {
    ver: 'v3.1.9',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '商户后台 → 代理账户管理 → 已创建代理「查看&配置」弹窗 → 基本资料 删除「用户ID / 创建代理人」字段(三元判断整段去掉)和「代理类型」字段' },
      { type: 'modify', text: '商户后台 → 已创建代理「查看&配置」弹窗 → 基本资料 改单列布局(左对齐),不再 2 列 grid,所有字段统一在左边' },
      { type: 'modify', text: '商户后台 → 已创建代理「查看&配置」弹窗 → 基本资料 字段顺序调整:代理创建方式 / 代理ID / 代理名称 / 登入帐号 / 登入密码 / 上级代理 / 创建时间(原创建时间在代理ID下面,现移到上级代理下面)' },
      { type: 'modify', text: '商户后台 → 自行申请代理详情「查看&审核」弹窗 → 基本资料 同步改单列布局,与「查看&配置」视觉一致' },
      { type: 'modify', text: '代理后台 → 我的账户 → 基本资料 同步改单列布局 + 字段顺序与商户两个弹窗完全对齐(7 个字段同顺序)' },
    ],
  },
  {
    ver: 'v3.1.8',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 我的账户 → 基本资料 删除顶部「该页信息与商户后台代理账户管理同步 — 如需修改请联系商户运营」蓝色提示条' },
      { type: 'modify', text: '代理后台 → 我的账户 → 基本资料 字段与商户后台「代理账户管理 → 查看&审核」弹窗的「基本资料」完全一致(9 个字段同顺序):代理创建方式 / 代理ID / 代理名称 / 登入帐号 / 登入密码 / 上级代理 / 创建时间 / 联系方式 / 备注' },
      { type: 'remove', text: '基本资料 删除「代理类型」「帐户状态(已启用 pill)」「申请理由 / 推广渠道说明」3 个商户弹窗没有的字段;删除「用户ID / 创建代理人」(商户弹窗的「代理创建方式」一栏即可表达)' },
      { type: 'modify', text: '改用商户弹窗同款 .ad-info-card / .ad-info-grid / .ad-section-title / .ad-contact-tbl 样式,视觉与商户弹窗对齐;联系方式从固定 Email/手机/Telegram 三行改为「逐项渲染 _appData.contacts」(filter value);备注从只读 textarea 改为商户同款灰底卡片' },
    ],
  },
  {
    ver: 'v3.1.7',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '代理后台 → 分润报表 重新定义佣金/分润基数计算公式' },
      { type: 'modify', text: '【本期预估分润】预估佣金 = max(0, 充值 - 提款 - 余额) — 若结果小于 0 显示 0(防止代理拿玩家提款行为反向倒贴)' },
      { type: 'add', text: '【已结算分润】重新加回「分润基数」列(放在「分润比例」左边),预估期不显示该列;表格列数预估期 12 / 已结算期 13;空状态 colSpan 动态' },
      { type: 'modify', text: '【已结算分润】分润基数 = max(0, (上期未结算余额 + 上期佣金基数) + (本期充值 - 本期提款 - 本期结算余额)) — 携带上期结转;结算佣金 = 分润基数 × 分润比例' },
      { type: 'add', text: '示例玩家增加 prevUnsettled / prevBase 字段,模拟上期结转数据;buildPeriodPlayers make() 一并计算 estCom / base / settledCom 三个字段供两期使用' },
    ],
  },
  {
    ver: 'v3.1.6',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 分润报表 表格删除「VIP 等级」列 + 「分润基数」列;表格列数从 14 → 12;空状态 colSpan 同步;工具栏 VIP 下拉筛选移除;vipF state 与 filter 逻辑移除' },
    ],
  },
  {
    ver: 'v3.1.5',
    date: '2026-05-20',
    changes: [
      { type: 'remove', text: '代理后台 → 报表 → 邀请Code与链接(my_codes.jsx)删除「玩家余额」KPI + 「总佣金」KPI + 表格「玩家余额」列 + 表格「佣金」列;KPI 由 10 个 → 8 个;表格列 11 → 9;空状态 colSpan 同步' },
      { type: 'remove', text: '代理后台 → 报表 → 玩家损益(my_players.jsx)删除「总玩家余额」KPI + 「总佣金」KPI + 表格「玩家余额」列 + 表格「佣金」列;KPI 由 11 个 → 9 个;表格列 12 → 10;空状态 colSpan 同步' },
    ],
  },
  {
    ver: 'v3.1.4',
    date: '2026-05-20',
    changes: [
      { type: 'add', text: '代理后台 → 分润报表 表格在「GGR」与「分润比例」之间加新列「分润基数」(显示 |GGR| 绝对值);两期(预估 / 已结算)共用该列;表格列数从 13 → 14;空状态 colSpan 同步' },
    ],
  },
  {
    ver: 'v3.1.3',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '🎯 代理后台 → 分润报表 按截图重做(uploads/123456.png)— 取消 v3.1.2 的 segmented + 子 tab 双层结构,扁平化成 3 个顶层 tab' },
      { type: 'add', text: '3 个 tab:本期预估分润 / 已结算分润 / 分润规则' },
      { type: 'add', text: '本期预估分润:信息条「期號:W3 · 結算狀態:未結算預估分潤(橙) · 週期:2026/6/1 00:00:00 - 2026/6/7 23:59:59」' },
      { type: 'add', text: '已结算分润:期号下拉选择器 — 可切换 W2 / W1 历史期;下拉项含期号 + 周期日期范围;点击信息条本身展开,选中项 hover 高亮' },
      { type: 'add', text: '两期共用 9 个 KPI(5 列网格,5+4 排):玩家总数 / 总充值 / 总提款 / 充提差(+/- 着色)/ 总玩家余额 / 总投注 / 总派彩 / GGR(着色)/ 总佣金' },
      { type: 'add', text: '工具栏 3 项:玩家UID/邀请Code 搜索 + 全部 VIP 下拉(VIP 0~7)+ 全部用户状态 下拉(盈利/亏损)' },
      { type: 'add', text: '表格 13 列:玩家UID / 来源Code / VIP等级 / 充值金额 / 提款金额 / 充提差(着色)/ [预估期=当前余额/已结算期=结算余额](蓝色表头突出)/ 投注 / 派彩 / GGR(着色)/ 分润比例 / [预估期=预估佣金/已结算期=结算佣金](蓝色表头突出)/ 用户状态(盈利绿 pill / 亏损红 pill)' },
      { type: 'modify', text: '货币统一用 ₹(INR),跟玩家损益对齐;阶梯奖励文案也改 ₹' },
      { type: 'remove', text: '移除 v3.1.2 加的实时横幅 / 趋势图 / 玩家明细 Drawer / NGR 计算口径表 — 按图简化为列表式视图' },
    ],
  },
  {
    ver: 'v3.1.2',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '🎯 代理后台 → 报表 → 分润报表 重构:顶部加「分润期类型」segmented 切换 — 预估分润期(未结算) / 已结算分润期,两种期数据字段差异化呈现' },
      { type: 'add', text: '【预估分润期】KPI 5 项:本期周次 / 本期 NGR (实时·黄色 ● 闪烁) / 预估分润 (蓝) / 本期活跃玩家(+/-)/ 距本期结算 X 天' },
      { type: 'add', text: '【预估分润期】顶部黄色横幅:本期数据实时更新中,玩家投注/充值/风控调整持续影响 NGR,最终金额以结算单为准' },
      { type: 'add', text: '【预估分润期】子 tab:本期总览 / 玩家明细(预估分润列 35%)/ 分润规则;NGR 计算口径表带「实时」badge' },
      { type: 'add', text: '【已结算分润期】KPI 5 项:累计已结算分润(蓝)/ 最近一期分润 / 平均期分润 / 已付款期数 / 最近付款日' },
      { type: 'add', text: '【已结算分润期】表格 10 列:期号 / 周期 / NGR(已锁定·✓)/ 分润比例(>35%加阶梯 badge)/ 分润金额 / 结算单号 / 结算日 / 付款状态(已付款·待付款·审核中)/ 付款时间 / 操作' },
      { type: 'add', text: '【已结算分润期】子 tab:结算期列表 / 分润趋势(近 12 期 NGR + 分润对比 SVG 柱状)/ 分润规则' },
      { type: 'add', text: '【已结算分润期】点击行打开 Drawer:本期金额大字 + 状态 + 分润计算 3 行 + 本期玩家(活跃/正/负)+ 付款信息(结算单号/结算日/付款方式/付款时间)+ 下载发票/复制单号' },
      { type: 'add', text: '生成模拟数据 buildSettledPeriods:近 12 期,每期 1 周,NGR/比例(35/37/40 阶梯)/分润金额/付款状态(80% paid · 10% pending_pay · 10% reviewing)/付款时间' },
      { type: 'modify', text: '顶部期次切换条右侧动态信息:预估期显示「当前周期 W22 | 距本期结算 N 天」;已结算期显示「最近结算 W21 | 已付款 N / 12」' },
    ],
  },
  {
    ver: 'v3.1.1',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '代理后台 → 运营 → Code 与链接管理:Code 创建数量上限 20 条 — 达到上限后点击「创建 邀请 Code」按钮弹出提示弹窗(已创建 N / 20,请联系管理员申请提高上限或先删除/停用闲置 Code);PageHead 右侧加计数 N / 20,达到上限时数字标红' },
      { type: 'add', text: 'submitCreate 防御性检查:即使绕过按钮进入创建弹窗,提交时若已达上限也会拒绝并弹出上限提示' },
    ],
  },
  {
    ver: 'v3.1.0',
    date: '2026-05-20',
    changes: [
      { type: 'feat', text: '🎯 版本号体系重启 — 用户指示从 v3.1.0 开启新的小版本周期(原 v3.0.x 系列封板)' },
      { type: 'add', text: 'CLAUDE.md 新增第八·A 节「导出代码规则」— 导出/下载代码时强制排除 uploads/ / 舊備份*/ / screenshots/,不再询问;做法用 _export/ 临时资料夹 + present_fs_item_for_download 打包' },
    ],
  },
  {
    ver: 'v3.0.105',
    date: '2026-05-20',
    changes: [
      { type: 'modify', text: '代理后台侧栏:删除空的「报表」大项(原先是占位,无子项);原「推广&收益」大项重命名为「报表」— 保留 3 个子项(邀请Code与链接 / 玩家损益 / 分润报表)' },
    ],
  },
  {
    ver: 'v3.0.104',
    date: '2026-05-19',
    changes: [
      { type: 'modify', text: '玩家损益 KPI「累计提款金额」改为「总提款金额」— 与其他 KPI 前缀「总」对齐' },
      { type: 'modify', text: '玩家损益 表格列「累计投注 / 累计派彩」去掉「累计」前缀 — 与其他列(充值金额 / 提款金额 / 玩家余额 / GGR / 佣金)对齐' },
      { type: 'fix', text: '🐛 玩家损益 副标题 i18n 字典未同步:agent_common.jsx page.my_players.sub 仍是「我推广而来的玩家清单与盈亏分析」(v3.0.102 时该改没改);现统一为「查看邀请玩家的清单」/「View list of invited players」' },
    ],
  },
  {
    ver: 'v3.0.103',
    changes: [
      { type: 'modify', text: '玩家损益 GGR 金额改用 +绿 / -红 显色(同 充提差)— KPI 卡片「GGR」+ 表格列「GGR」两处都同步;正数 var(--success) 绿色 + 前缀「+」,负数 var(--danger) 红色 + 前缀「-」' },
    ],
  },
  {
    ver: 'v3.0.102',
    changes: [
      { type: 'modify', text: '玩家损益 页按截图重做(my_players.jsx)— 副标题改「查看邀请玩家的清单」' },
      { type: 'modify', text: 'KPI 由 6 个扩到 11 个 — 玩家总数 / 总首存人数 / 总首存金额 / 总充值金额 / 累计提款金额 / 充提差 / 总玩家余额 / 总投注 / 总派彩 / GGR / 总佣金' },
      { type: 'modify', text: '工具栏:玩家 UID / 邀请 Code 搜索框 + 全部 VIP 下拉 + 时间维度选择器(复用 my_codes.jsx 的 TimeRange / RangeCalendar 组件,now exposed as window.TimeRange)' },
      { type: 'modify', text: '表格 12 列:UID / 来源 Code / VIP 等级 / 首次存款金额 / 充值金额 / 提款金额 / 充提差 / 玩家余额 / 累计投注 / 累计派彩 / GGR / 佣金' },
      { type: 'remove', text: '移除原 Tabs(全部 / 已首存 / 有效 CPA / VIP 玩家 / 风控中)+ CPA 列 + 风控列 + 注册列 + 首存列 + 国家列 + 玩家详情 Drawer' },
      { type: 'add', text: '示例 5 条玩家数据补齐新字段:ftdAmt / playerBalance / payout / ggr / commission(payout ≈ 投注 × 92%,佣金 ≈ GGR × 30%)' },
      { type: 'add', text: 'agent_common.jsx 加 30+ 个 i18n 键(mp.kpi.* / mp.col.* / mp.filter.* / mp.empty),中英文都接好' },
      { type: 'add', text: 'my_codes.jsx 底部 export window.TimeRange / window.RangeCalendar,让 my_players.jsx 等其他模块可以复用同一个时间范围选择器' },
    ],
  },
  {
    ver: 'v3.0.101',
    changes: [
      { type: 'add', text: 'RangeCalendar 头部加 « 和 » 两个年份导航按钮 — 现在 4 个按钮:« 上一年 / ‹ 上个月 / › 下个月 / » 下一年;tooltip 中英文都接入;原先只能逐月翻,跨年范围要点 10+ 次,现在 1 次点 « 跳一年' },
    ],
  },
  {
    ver: 'v3.0.100',
    changes: [
      { type: 'fix', text: '🐛 RangeCalendar 点完结束日期 自动关弹窗(在用户点 Confirm 之前就生效)— 移除 pickDate 在 end 分支里的 onClose() 调用,只允许「Confirm」/「外部点击」/「Today」3 种方式关闭' },
    ],
  },
  {
    ver: 'v3.0.99',
    changes: [
      { type: 'fix', text: '🐛 TimeRange 双月历弹窗 被 .card { overflow:hidden } 截掉底部(Today / Confirm 按钮看不见)— 改用 ReactDOM.createPortal 挂到 document.body,position:fixed + 实时 getBoundingClientRect 算坐标,完全脱离 .card 包围' },
      { type: 'add', text: 'recomputePos 监听 scroll(capture)+ resize 事件,弹窗位置跟着触发器移动;靠右贴边时左移避免 viewport 溢出' },
      { type: 'modify', text: 'mousedown 关闭逻辑同步迁移到 portal 兼容:popRef + ref 双白名单避免点击日历自身误关' },
    ],
  },
  {
    ver: 'v3.0.98',
    changes: [
      { type: 'fix', text: '🐛 时间范围选择器 自定义弹窗用了原生 <input type="date"> — 浏览器原生日历 UI 用 OS locale,英文模式下仍显示中文,且宽度受浏览器限制;改为自绘 RangeCalendar 组件,完全控制 i18n + 宽度' },
      { type: 'add', text: 'RangeCalendar 自绘双月历:左右两个月份并排显示,周一/周日表头 + 6 行日期网格;点击日期支持范围选择(第 1 次点 = start,第 2 次点 = end,反向自动交换);hover 时显示中间灰底预览;选中端点高亮品牌色;跨月份的日期淡灰色显示' },
      { type: 'add', text: '日历底部:左侧「今天」按钮(回到近 7 日默认)/ 右侧「确定」按钮关闭;顶部带 ‹ › 月份切换 + 中间提示「选择开始日期 / 选择结束日期」' },
      { type: 'add', text: '所有日历文字接 i18n:月份名(1 月~12 月 / January~December)、周名(日一二三四五六 / Sun-Sat)、提示语 / 按钮文字 — 切到 EN 整套换英文' },
      { type: 'modify', text: '时间范围文本框最小宽度 280px → 300px;点击 chevron 后弹出 560px 宽双月历,不再被浏览器原生 picker 卡住' },
    ],
  },
  {
    ver: 'v3.0.97',
    changes: [
      { type: 'add', text: '邀请Code与链接 页 新增「时间维度搜索」— 工具栏加 TimeRange 组件:文本框显示当前范围 "YYYY/M/D HH:MM:SS - YYYY/M/D HH:MM:SS"(可点击展开自定义起止日期);右侧 3 个快选按钮 近 7 日 / 近 14 日 / 近 30 日,active 状态用品牌色高亮' },
      { type: 'add', text: '默认范围 近 7 日 — start = 今天 00:00:00 倒推 6 天 / end = 今天 23:59:59' },
      { type: 'add', text: '点击文本框弹出小 popover,放两个原生 <input type="date"> 让用户选自定义起止;preset 自动切换到 custom 不再高亮快选' },
      { type: 'add', text: 'agent_common.jsx 加 3 个 i18n 键 mc.tr.7d / mc.tr.14d / mc.tr.30d(中/英)' },
    ],
  },
  {
    ver: 'v3.0.96',
    changes: [
      { type: 'fix', text: '🐛 切到 English 时,Code 与链接管理 页面 + 编辑弹窗 + 创建弹窗 + 删除确认弹窗 + 各种 toast 仍硬编码中文 — 接入完整 i18n,新增 60+ 个键(page.my_codes_mgmt.* / mcm.btn.* / mcm.col.* / mcm.action.* / mcm.status.* / mcm.empty / mcm.create.* / mcm.edit.* / mcm.form.* / mcm.del.* / mcm.toast.* / mcm.tip.*),agent_common.jsx 字典 + my_codes_mgmt.jsx 同步' },
      { type: 'fix', text: '🐛 面包屑「首页 / PRD首页 / 规划优先级 / 版本」全部硬编码中文 — app.jsx crumbLabel 改用 T(crumb.home / crumb.prd_home / crumb.prd_overview / crumb.version);代理后台 侧栏「首页」item 也同步接入 T()' },
      { type: 'fix', text: '🐛 分页器「共 N 条 · 第 N / N 页」硬编码中文 — ui.jsx Pagination 加 lang 探测,英文模式渲染「N total · Page X / Y」' },
      { type: 'add', text: 'modules/my_codes_mgmt.jsx 顶部加 const MCM_T = (k, fb) => window.t(k, fb),让 CreateModalMgmt + EditModalMgmt 两个内部函数也能用 i18n(它们不在主组件作用域内)' },
    ],
  },
  {
    ver: 'v3.0.95',
    changes: [
      { type: 'modify', text: '全站表格表头(.tbl thead th)样式改为 Title Case + 常规字重 — 移除 text-transform:uppercase 和 letter-spacing:.5px;font-weight 由 600 降到 500;font-size 由 11px 升到 11.5px。原有所有表头(i18n 字典里的 Title Case 文本如 "Invite Code" / "Total Codes")现在直接展示,不再被强制转大写' },
    ],
  },
  {
    ver: 'v3.0.94',
    changes: [
      { type: 'modify', text: 'Code 与链接管理 创建弹窗 + 邀请Code与链接 CodeForm 校验提示行 与 注册页(reg.s3.pw.*)统一样式 — 去掉自绘的实心圆背景 + ✓/× 字符,改为通用 <Icon name="check|x"/>;颜色 ok=#22c55e / not=#94a3b8(同 reg.s3 passChecks 渲染)' },
    ],
  },
  {
    ver: 'v3.0.93',
    changes: [
      { type: 'remove', text: '邀请Code与链接 页 工具栏「全部状态」下拉删掉 — 状态列既然没了,筛选也跟着撤;同步移除 statusF state + 过滤逻辑' },
      { type: 'modify', text: '表格 5 个列名去掉「累计」前缀:累计注册人数 → 注册人数 / 累计充值人数 → 充值人数 / 累计充值金额 → 充值金额 / 累计提款人数 → 提款人数 / 累计提款金额 → 提款金额(agent_common.jsx i18n 字典同步更新)' },
    ],
  },
  {
    ver: 'v3.0.92',
    changes: [
      { type: 'remove', text: '邀请Code与链接 页 删除「状态」列(纯报表页不需要显示状态)— 表格列从 12 列再精简到 11 列;空态 colSpan 同步 11' },
      { type: 'fix', text: '🐛 语言切换下拉「繁體中文」改为「简体中文」— 项目 UI 一直是简体中文,标签也应该是简体' },
      { type: 'fix', text: '🐛 当语言切换为 English 时,邀请Code与链接 页面 KPI / 表头 / 筛选 / 空态 全部硬编码中文不切换 — 给 my_codes.jsx 所有可见 Chinese 字符串接入 i18n,新增 28 个键(mc.kpi.* / mc.col.* / mc.filter.* / mc.status.* / mc.empty)+ 英文翻译;agent_common.jsx 字典同步' },
    ],
  },
  {
    ver: 'v3.0.91',
    date: '2026-05-19',
    changes: [
      { type: 'modify', text: '专业代理后台「邀请 Code 与链接」页改造为纯报表查看页 — 标题去空格改「邀请Code与链接」,副标题改「查看各 Code 推广链接累计数据」(对应 app.jsx NAV / agent_common.jsx i18n / my_codes.jsx PageHead)' },
      { type: 'remove', text: 'PageHead 移除「导出报表」按钮;移除「创建 邀请 Code」独立按钮行 — 创建/编辑/删除 统一在「运营 → Code 与链接管理」' },
      { type: 'modify', text: '表格列由 14 列精简到 12 列:邀请 Code / 描述 / 状态 / 累计注册人数 / 累计充值人数 / 累计充值金额 / 累计提款人数 / 累计提款金额 / 充值转化率 / 充提差 / 玩家余额 / 佣金' },
      { type: 'remove', text: '表格 删除「备注」列、删除「操作」列 — 报表页不需要;状态列从位置 4 移到位置 3' },
      { type: 'modify', text: '「累计佣金」列名改为「佣金」' },
      { type: 'modify', text: 'StatusBadge 由 .badge pill 改为纯彩色文字(启用绿/冻结青/暂停橙/停用红)— 停用色从 b-muted 灰改为 var(--danger) 红' },
      { type: 'modify', text: '空态文案改「暂无邀请 Code,请去「运营 → Code 与链接管理」创建」' },
    ],
  },
  {
    ver: 'v3.0.90',
    date: '2026-05-19',
    changes: [
      { type: 'modify', text: 'Code 与链接管理 列表页「创建 邀请 Code」按钮 从 toolbar 内 改回 PageHead 右侧(与标题同行右对齐)— 按用户截图位置对齐' },
      { type: 'modify', text: 'Code 与链接管理 状态列「启用 / 停用」改用 .badge pill 样式 — 启用 b-success(绿底)/ 停用 b-danger(红底);去掉前面的小圆点' },
      { type: 'modify', text: '邀请 Code 与链接 页 StatusBadge 同步去掉前面的 <span className="dot"/> — 保留 b-success / b-info / b-warning / b-muted 色底,只有文字' },
    ],
  },
  {
    ver: 'v3.0.89',
    date: '2026-05-19',
    changes: [
      { type: 'fix', text: '🐛 my_codes_mgmt.jsx QR Code 渲染成 3 条横线 — 原伪随机公式 (r*13 + c*7) % 7 的 c*7 mod 7 = 0,导致列没影响,整行同色;改用 FNV-1a hash + xorshift32 让 行/列 都参与,并加 3 个角定位方块让它看起来更像真 QR' },
      { type: 'modify', text: 'Code 与链接管理 列表页「创建 邀请 Code」按钮 由独立浮在顶部右上 改为放进 toolbar 行右对齐 — 减少垂直空白,与筛选条同行' },
      { type: 'modify', text: '列表页状态列「启用 / 停用」加 6px 小圆点(同色)— 增强视觉锚点,不再只是纯文字' },
      { type: 'modify', text: '编辑弹窗 grid 加 alignItems:start — 让右栏 QR Code 卡片对齐顶部,不再被左栏 5 个字段撑高,避免下载 PNG 按钮飘到中间' },
    ],
  },
  {
    ver: 'v3.0.88',
    date: '2026-05-19',
    changes: [
      { type: 'add', text: '专业代理后台「运营 → Code 与链接管理」新建独立模块 modules/my_codes_mgmt.jsx — 比「邀请 Code 与链接」更轻量(无 KPI,只做 Code 管理)' },
      { type: 'add', text: '表格 7 列:邀请 Code(复制)/ 邀请短链接(复制)/ QR Code(下载 PNG 链接)/ 描述 / 备注 / 状态(启用/停用)/ 操作(编辑/删除)' },
      { type: 'add', text: '创建弹窗:Code + 描述 + 备注 + 三条实时校验(必填 / 最少 4 字符 / 4-10 字符仅字母大写数字)+ 重名校验' },
      { type: 'add', text: '编辑弹窗:左栏表单(Code/创建时间/短链 只读;描述/备注 可改)+ 右栏 QR + 下载 PNG;底部「Code 使用状态」红/绿切换按钮(停用 ↔ 再次启用)' },
      { type: 'add', text: '4 条示例 Code(RANDY01~04)覆盖 启用 + 停用 两种状态' },
      { type: 'modify', text: 'index.html 加 my_codes_mgmt.jsx 引用;app.jsx my_codes_mgmt 路由由原先指向 MyCodesModule 改为指向新建 MyCodesMgmtModule' },
    ],
  },
  {
    ver: 'v3.0.87',
    date: '2026-05-19',
    changes: [
      { type: 'modify', text: '专业代理后台 侧栏「我的账户」大项改名为「运营」(app.jsx AGENT_NAV section + agent_common.jsx i18n nav.sec.ops)' },
      { type: 'add', text: '「运营」大项 新增子项「Code 与链接管理」— 暂时路由到 my_codes_mgmt key,渲染同 MyCodesModule(后续如需独立页面再拆)' },
      { type: 'add', text: '新增第 3 个大项「报表」(空)— 占位,后续内容由用户告知再填入' },
      { type: 'add', text: 'app.jsx 路由分发 增加 my_codes_mgmt 分支 + 排除列表同步,避免落入 fallback 渲染' },
      { type: 'add', text: 'agent_common.jsx i18n 新增 nav.sec.ops / nav.sec.reports / nav.item.my_codes_mgmt 三个键' },
    ],
  },
  {
    ver: 'v3.0.86',
    date: '2026-05-19',
    changes: [
      { type: 'modify', text: '专业代理后台 侧栏「分享 Code 与链接」改名为「邀请 Code 与链接」(app.jsx NAV + agent_common.jsx i18n nav.item.my_codes / page.my_codes.title 同步)' },
      { type: 'modify', text: 'my_codes.jsx 按截图重做:KPI 由 5 个扩到 10 个(2 行 × 5)— Code 总数量 / 总注册人数 / 总充值人数 / 总充值金额 / 总提款人数 / 总提款金额 / 充值转化率 / 充提差 / 玩家余额 / 总佣金' },
      { type: 'modify', text: '表格列重构为 14 列:邀请Code / 描述 / 备注 / 状态 / 累计注册人数 / 累计充值人数 / 累计充值金额 / 累计提款人数 / 累计提款金额 / 充值转化率 / 充提差 / 玩家余额 / 累计佣金 / 操作' },
      { type: 'modify', text: '操作列由 6 个图标按钮改成 3 个文字按钮:邀请链接&QR Code(蓝)/ 编辑 / 删除(红)— 紧凑且符合截图样式' },
      { type: 'modify', text: '链接弹窗 与 QR 弹窗合并为单个「邀请链接 & QR Code」弹窗(短链 + QR + 下载 PNG)' },
      { type: 'add', text: '状态扩展为 4 种:启用(绿)/ 冻结(蓝)/ 暂停(橙)/ 停用(灰),并加 StatusBadge 组件统一渲染' },
      { type: 'modify', text: '创建弹窗:Code 必填 + 实时校验提示三条(请填写此栏位 / 最少 4 个字符 / Code 必须 4-10 个字符仅字母大写数字)+ 重名校验;描述必填' },
      { type: 'modify', text: '编辑弹窗:自定义 Code 与 创建时间 都改为只读灰底;只允许改描述 / 备注' },
      { type: 'remove', text: '移除原有 Tabs(Code 列表 / 渠道对比)— 截图只有列表;移除 DateRange 筛选(同截图)' },
      { type: 'modify', text: '示例数据补全新字段:depositUsers / withdrawUsers / playerBalance — 4 条示例 Code(RANDY01~04)对应 4 种状态' },
    ],
  },
  {
    ver: 'v3.0.85',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '自行申请代理「查看&审核」抽屉 申请资料下方 新增「备注」textarea — 只读模式显示「(未填写备注)」灰色占位;编辑模式可输入,保存后写入 _formSnapshot.remark' },
      { type: 'remove', text: '已创建代理「查看&配置」抽屉 删除「申请理由 / 推广渠道说明 *」整段 textarea — 由「自行申请代理」的「备注」字段取代' },
    ],
  },
  {
    ver: 'v3.0.84',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '侧栏「版本」徽标 由硬编码 v2.3.7 改为读 window.VERSIONS[0].ver 动态显示当前版本号' },
      { type: 'add', text: '版本列表 — 已导出代码的版本(目前标记 v3.0.22 / v3.0.36 / v3.0.77)在版本号 chip 旁显示黄色「已导出代码」chip + 下载图标' },
      { type: 'add', text: 'modules/version.jsx 顶部 暴露 window.VERSIONS;新增 EXPORTED_VERSIONS Set 记录所有已导出代码的版本号' },
    ],
  },
  {
    ver: 'v3.0.83',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '自行申请代理「查看&审核」编辑模式 — 登入帐号 / 登入密码 改回只读(用户注册时确定后不允许商户修改);保存时也不再写回这两个字段' },
    ],
  },
  {
    ver: 'v3.0.82',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '自行申请代理 申请进度为 待审核 / 要求补件 / 已补件待审核 时,商户审核「查看&审核」抽屉支持「编辑」' },
      { type: 'add', text: '可编辑字段:代理名称 / 登入帐号 / 登入密码 / 联系方式(支持新增/移除非锁定行)/ 流量来源链接(支持新增/移除)/ UPI ID / 收款人姓名' },
      { type: 'modify', text: '抽屉底部 显示「编辑」按钮(右下);进入编辑后变「取消 / 保存」;保存写回 APS_APPS_STORE 对应记录(同步更新 _formSnapshot/contact/channels/loginName/password)+ 追加 type=edit 操作日志' },
      { type: 'modify', text: '终态(已通过 / 已拒绝)不显示编辑按钮;操作记录 tab 永远只读' },
    ],
  },
  {
    ver: 'v3.0.81',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '补件流程注册弹窗 — 标题由「注册」改为「要求补件」;隐藏 3 步指示器、上一步按钮、第 1 步「基本资料」、第 3 步「创建账户」' },
      { type: 'modify', text: '补件模式打开后 setStep(2) 直接进入「流量来源与收款」;主按钮文案改「提交补件」,点击直接 UPSERT 申请记录(state→supplemented),弹「已补件,等待复核」成功页' },
      { type: 'modify', text: '欢迎语改为「请根据商户审核反馈,补充或修改流量来源与收款资料后重新提交」' },
    ],
  },
  {
    ver: 'v3.0.80',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '注册第 1 步 Email / 手机号码 一打开就显示「× 请填写此栏位」红字 — 改为只在字段有值但格式错或重复时才显示提示;为空时不再显示「请填写」错字(按钮置灰已足够暗示必填)' },
    ],
  },
  {
    ver: 'v3.0.79',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '注册第 3 步 「登入帐号」标题/提示显示成 i18n key — RegisterModal 内部 T = (k) => window.t(k) 没传 fallback,改为 (k, fb) => window.t(k, fb);label/placeholder 同步用硬编码中文兜底' },
      { type: 'add', text: '登入帐号 唯一性校验 — 扫描 APS_APPS_STORE + APS_AGENT_ACCOUNTS 中所有 loginName(小写),命中显示「× 登入帐号已被使用」红字;补件流程会排除当前 prefill.appId' },
      { type: 'add', text: 'Email 必填 + 格式校验(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/) + 唯一性;手机号码 必填 + 8-15 位数字 + 唯一性;无效或重复在行下方显示「× 格式不正确 / 已被使用」' },
      { type: 'modify', text: 'step1Valid 校验改为 应用人姓名 + emailValid + phoneValid + !emailDup + !phoneDup;step3Valid 加 !loginNameDup;不通过则「下一页」/「Complete」按钮置灰' },
    ],
  },
  {
    ver: 'v3.0.78',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: 'AC100005 帐户状态仍显「已启用」根因再修复 — v3.0.75 把 localStorage 清理放在 ensureMerchantAgentsStore 初始化代码块内,只第一次调用时执行;后续 AgentsModule 重新挂载时 flip() 仍会用旧的 set 状态把 pending → active' },
      { type: 'modify', text: '把 AC100005 的 localStorage 清理移到函数顶部、每次调用都执行 — 切换 tab、刷新、重新 mount 都会保证 set 内没有 AC100005,flip() 跳过' },
    ],
  },
  {
    ver: 'v3.0.77',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '自行申请代理列表补 AC100006/AC100007/AC100008 三条 state="passed" 记录,与「已创建代理」AC範例6/7/8 数据一致(同一申请审核通过后衍生);筛选「通过」可看到 AC100005~AC100008 共 4 条' },
    ],
  },
  {
    ver: 'v3.0.76',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '已创建代理列表 删除「代理类型」列 + 「风险等级」列;同时删除工具栏的「全部代理类型」「全部风险等级」筛选下拉' },
      { type: 'remove', text: '自行申请代理列表 删除「代理类型」列 + 「用户ID」列;同时删除工具栏的「全部代理类型」筛选下拉' },
      { type: 'modify', text: '空状态 colSpan 由 9 改为 7;表格头部/正文同步精简' },
    ],
  },
  {
    ver: 'v3.0.75',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: 'AC100005 初始账户状态错显为「已启用」 — 在 ACSamples 列表里显式加入 AC100005 一条 status:"pending"(未启用)的样本;v3.0.65 自动同步逻辑会因 id 重复 dedup 跳过,以 ACSamples 的状态为准' },
    ],
  },
  {
    ver: 'v3.0.74',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '帐户状态为「已停用」的代理 — 登入专业代理后台时弹「帐户已停用」红色提示弹窗 + 显示停用原因 + 代理ID/登录账号,点「我知道了」关闭弹窗,不允许进入后台' },
      { type: 'modify', text: 'LoginModal handleLogin — 匹配到正式账户后,检查 APS_MERCHANT_AGENTS_STORE 中对应 agent 的 status,若 status==="suspended" 则 setSuspendedAcc 弹提示,不再调 onLogin' },
      { type: 'add', text: '停用原因优先读 agent._appData.suspendReason,缺省「账户已被停用」' },
    ],
  },
  {
    ver: 'v3.0.73',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '创建专业代理弹窗 手机国码 +91 显示异常 — 之前 contact-phone-input 没有 CSS class 定义,导致 dial 和 input 各有独立边框;改为 inline flex 容器 + 共用外层 border,内部 input border:0 + radius:0,visual 合并成一个胶囊' },
    ],
  },
  {
    ver: 'v3.0.72',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '已创建代理工具栏 删除「批量导入」「导出」按钮' },
      { type: 'remove', text: '自行申请代理工具栏 删除「导出」按钮(保留「全局配置」和「说明」)' },
    ],
  },
  {
    ver: 'v3.0.71',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '商户后台「已创建代理」工具栏删除「创建专业代理」按钮' },
      { type: 'remove', text: '删除商户主动创建专业代理对应的 CreateAgentModal 调用块(含 AG ID 自动生成 / 登录账户 push 等约 55 行代码);CreateAgentModal 组件代码本身保留,继续为「自行申请代理 → 审核通过 → 复核创建」流程服务' },
      { type: 'modify', text: 'showCreate state 保留(惰性引用),不再有任何入口触发' },
    ],
  },
  {
    ver: 'v3.0.70',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '网站前台「申请代理」按钮删除原流程(用户ID 反查申请状态 / 弹申请进度弹窗 / 弹申请表单)' },
      { type: 'modify', text: '改为直接调用 window.APS_SWITCH_BACKEND("agent") 跳转到「专业代理后台」分页,后续注册流程统一在专业代理后台 Become a Partner 完成' },
      { type: 'add', text: 'app.jsx 暴露 setBackend 到 window.APS_SWITCH_BACKEND 供 frontend.jsx 调用' },
      { type: 'modify', text: '保留 申请弹窗 / 申请进度弹窗 等组件代码不动,但 申请代理 按钮不再触发(仅可能被旧路径调用,实际已无入口)' },
    ],
  },
  {
    ver: 'v3.0.69',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '已创建代理列表删除 AG100001~AG100004 (商户创建代理) + AP200006 (用户自行申请) 共 5 条示例,只保留 AC 系列代理后台自行申请示例' },
      { type: 'modify', text: 'ensureMerchantAgentsStore initial 数组由 D.agents.slice(0,5) 改为 D.agents.slice(0,0)(空数组),不再种入这 5 条初始数据' },
    ],
  },
  {
    ver: 'v3.0.68',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '已创建代理说明弹窗 — 移除商户创建代理(AG1xxxxx)及用户自行申请(AP2xxxxx)相关内容,仅保留代理后台自行申请(AC1xxxxx)' },
      { type: 'modify', text: '代理ID 编号规则:删除 AG1xxxxx 行,只剩 AC1xxxxx;AC1xxxxx 描述末尾去掉「与 AG 不冲突」字样' },
      { type: 'modify', text: '专业代理账户·创建流程:删除「商户直接创建 → 未启用」「用户自行申请 → 管理员手动创建账户 → 未启用」两行,只保留「代理后台自行申请 → 商户审核·通过 → 自动创建账户 → 未启用」' },
      { type: 'modify', text: '操作记录·规则(已创建代理 tab):「创建专业代理帐户」「首次登入」描述只保留代理后台申请路径;「日志继承」条目只提代理后台申请,不再写「商户创建」「AP」' },
      { type: 'modify', text: '风险等级 / 账户状态 / 账户状态·流转关系 这 3 个章节内容本身是通用的,无需修改' },
    ],
  },
  {
    ver: 'v3.0.67',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '已创建代理说明弹窗 — 补充代理后台申请(AC1xxxxx)相关内容' },
      { type: 'add', text: '专业代理账户·创建流程:新增「代理后台自行申请 → 商户审核通过 → 自动创建账户(用注册账号密码)→ 未启用」行;原「自行申请代理」绿色 chip 拆分为「用户自行申请」绿色 + 「代理后台自行申请」黄色两行' },
      { type: 'add', text: '操作记录·规则(已创建代理 tab):创建专业代理帐户/首次登入说明 增加代理后台自行申请的特殊路径(自动创建账户、可直接用注册密码登入激活);最后一条注明继承日志含 AP 和 AC 两种来源' },
      { type: 'modify', text: '代理ID 编号规则 / 风险等级 / 账户状态 / 账户状态·流转关系 — 已存在的章节内容与代理后台申请兼容,无需修改' },
    ],
  },
  {
    ver: 'v3.0.66',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '已创建代理列表新增 AC100006 / AC100007 / AC100008 三条代理后台自行申请已通过示例,分别覆盖 已启用 / 已冻结 / 已停用 三种账户状态' },
      { type: 'add', text: '每条示例自带 _appData(申请资料) + _logs(submit/pass/create/login + freeze/suspend 的完整时间线) + 玩家数 + 佣金等真实业务数据;同时同步到 APS_AGENT_ACCOUNTS 可用对应账号登入' },
      { type: 'modify', text: 'AC範例6 (rajeshmedia / Test@1234) - 已启用 142 玩家 $18.5k 佣金;AC範例7 (meena_promo / Test@1234) - 已冻结 + 冻结原因;AC範例8 (fakeaff_x / Test@1234) - 已停用 + 停用原因' },
    ],
  },
  {
    ver: 'v3.0.65',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '🆕 代理后台自行申请 通过审核后 自动建立专业代理后台登录账户 + 推入「已创建代理」列表;用户可直接用注册的账号密码登入,不再弹「申请已通过」状态弹窗' },
      { type: 'modify', text: 'LoginModal handleLogin — 匹配到 _channel=agentportal & state=passed 的申请时,自动 push 到 APS_AGENT_ACCOUNTS 并 onLogin 进入后台' },
      { type: 'modify', text: 'ensureMerchantAgentsStore 初始化 — 启动时扫描 APS_APPS_STORE 里 state=passed 的 AC 申请,自动 unshift 一条对应代理到「已创建代理」列表(含完整 _logs / _appData / _formSnapshot),同时补到 APS_AGENT_ACCOUNTS' },
      { type: 'add', text: 'AC100005(passed 示例)现在可直接用 arjunaff / Test@1234 登入代理后台,无中间弹窗;同时商户后台「已创建代理」第一条会看到 AC100005' },
    ],
  },
  {
    ver: 'v3.0.64',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '自行申请代理说明弹窗 — 移除所有与网站前台用户自行申请(AP2xxxxx)相关的内容,仅保留代理后台自行申请(AC1xxxxx)' },
      { type: 'modify', text: '代理ID 编号规则:只保留 AG1xxxxx(商户创建)+ AC1xxxxx(代理后台申请)两行' },
      { type: 'modify', text: '申请进度·流程关系:首行只显示「代理后台」chip,不再并列「网站前台/代理后台」' },
      { type: 'modify', text: '操作记录·规则:「申请专业代理」说明只提专业代理后台 Become a Partner 入口' },
    ],
  },
  {
    ver: 'v3.0.63',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '自行申请代理 → 说明弹窗 4 个章节补充「专业代理后台申请(AC1xxxxx)」说明' },
      { type: 'add', text: '代理ID 编号规则 — 新增 AC1xxxxx 行(黄色 chip),来源:专业代理后台 Become a Partner 注册' },
      { type: 'modify', text: '申请进度·流程关系 — 首行「用户提交」改为「申请提交」+ 两个 chip(网站前台/代理后台)并列展示双渠道入口' },
      { type: 'modify', text: '操作记录·规则 — 「申请专业代理」项说明扩展为同时覆盖网站前台 + 代理后台;新增条目说明「代理后台申请的用户可用注册账号密码登入查看进度/立即补件」' },
      { type: 'modify', text: '申请进度 5 种状态(待审核/要求补件/已补件待审核/拒绝/通过)本身不变,两种渠道共用同一状态机' },
    ],
  },
  {
    ver: 'v3.0.62',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '自行申请代理示例数据 — 删除 AP200001~AP200005 共 5 条网站前台来源的示例,仅保留 AC100001~AC100005 五条专业代理后台来源' },
    ],
  },
  {
    ver: 'v3.0.61',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '自行申请代理示例数据 — 新增 AC100002~AC100005 共 4 条专业代理后台申请示例,覆盖 5 种状态:AC100001 reviewing / AC100002 supplement(含补件说明) / AC100003 supplemented / AC100004 failed(含拒绝原因) / AC100005 passed' },
      { type: 'modify', text: '5 条 AC 示例各带 loginName + Test@1234 密码,可直接用对应账号登入测试 5 种状态弹窗' },
      { type: 'modify', text: 'AC 来源不属于既有玩家,userId 留空(后续由商户审核通过后分配)' },
    ],
  },
  {
    ver: 'v3.0.60',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '自行申请代理「查看&审核」基本资料 — 新增「登入帐号」(detail.loginName)和「登入密码」(掩码 ••••••••);未填则显示「—」' },
    ],
  },
  {
    ver: 'v3.0.59',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '已创建代理详情(查看&配置)— 头像 / 联系方式 / 流量来源 / 收款方式 全部用申请时填的真实数据,而不是硬编码示例' },
      { type: 'modify', text: 'AgentDetail 头像 — 代理后台自行申请(_channel=agentportal)显示「AC」+ 黄色 #f59e0b;用户自行申请显示「AP」+ 绿色;商户创建显示「AG」+ 蓝色' },
      { type: 'modify', text: 'AgentDetail 联系方式表 — 删除硬编码 123@gmail.com / +91 1234567890 / @123ksjdla;改为读 agent._appData._formSnapshot.contacts(优先)→ agent._appData.contacts(后备)→ 「—」占位;手机类型自动加 dial 前缀' },
      { type: 'modify', text: '_defaultTraffic — 优先用 agent._appData._formSnapshot.trafficUrls(申请时填的)' },
      { type: 'modify', text: '_defaultPayment — 优先用 _formSnapshot.upiId / holder;没填则为空(不再自动拼 user@paytm)' },
      { type: 'add', text: 'APS_addApplication 创建申请时即生成第一条 submit 日志(by: 用户:loginName / 用户:userId 区分渠道);通过审核后 inheritedLogs 自动包含完整审核历史,「已创建代理」操作记录不再只剩单条「创建专业代理帐户」' },
      { type: 'modify', text: 'onCreateAgent _appData 增加 _formSnapshot 字段(整张申请快照),供 AgentDetail 各 tab 读取' },
    ],
  },
  {
    ver: 'v3.0.58',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '自行申请代理「查看&审核 → 收款方式」 UPI ID / 收款人姓名 — 之前是用 loginName+@paytm / detail.name 自动生成,导致用户没填也显示假数据;改为只读 _formSnapshot.upiId / _formSnapshot.holder,没填则显示「—」' },
    ],
  },
  {
    ver: 'v3.0.57',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 商户后台「自行申请代理 → 查看&审核 / 通过 → 创建代理」联系方式显示硬编码示例(123@gmail.com / +91 1234567890 / @123ksjdla)而不是用户实际填写的内容' },
      { type: 'modify', text: 'CreateAgentModal prefill 联系方式 — 优先用 prefill._formSnapshot.contacts 回填(Mobile → 手机);否则根据 prefill.contact(单字段)判断 email/phone 重建;再否则用空占位行' },
      { type: 'modify', text: 'SelfApplications 查看&审核抽屉 联系方式表 — 改为遍历 detail._formSnapshot.contacts 渲染(手机类型加 dial 前缀);无快照时显示「—」占位' },
    ],
  },
  {
    ver: 'v3.0.56',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '补件重提交成功后 step4 成功页 — 不再显示「很高兴你加入我们/账户正在审查」(那是首次注册文案);改为橙色 chevron 主题「已补件,等待复核」+ 文案描述 + 「我知道了」按钮' },
      { type: 'add', text: '通过 prefill.appId 判断是否补件流程;无则显示原首次注册成功页(完全向后兼容)' },
    ],
  },
  {
    ver: 'v3.0.55',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛「立即补件」按钮打开的注册弹窗 表单空白未回填 — 原因:示例申请数据(AC100001 等)没有 _formSnapshot 完整快照,prefill 拿不到东西。改:onSupplement 时若 _formSnapshot 不存在,用 app 字段(name/contact/channels/password)重建 fallback formSnapshot(自动判断 Email/手机、按「·」拆 trafficUrls、回填密码、勾选同意条款)' },
    ],
  },
  {
    ver: 'v3.0.54',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '申请进度弹窗 — 补件状态(supplement)下移除 tip 文案「请根据下方说明补充材料,然后通过原注册入口重新提交。」' },
      { type: 'modify', text: '申请进度弹窗 — 补件状态(supplement)按钮文案 由「我知道了」改为「立即补件」,点击后关闭进度弹窗 + 登入弹窗,直接打开注册弹窗并回填原表单数据' },
      { type: 'add', text: 'ApplicationProgressModal 增加 onSupplement 回调,LoginModal 转传到 AgentLoginModule,触发 setRegisterPrefill({appId, formSnapshot}) 打开 RegisterModal' },
      { type: 'modify', text: 'RegisterModal 接受 prefill prop;若提供 formSnapshot,useEffect 中回填整个 form;若提供 appId,step3 提交按钮走 UPSERT 流程(直接更新 APS_APPS_STORE.list 原记录,state→supplemented + clear failReason + 新增「用户已补件」日志条目)而非创建新申请' },
      { type: 'add', text: 'AgentLoginModule 新增 registerPrefill state,onClose 时同步清空 prefill;其他入口(Become a Partner / Hero / CTA 按钮)依旧 setRegisterPrefill(null) 走全新注册' },
    ],
  },
  {
    ver: 'v3.0.53',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '🆕 登入弹窗「快速选择已创建账户」列表 — 同时合并 APS_AGENT_ACCOUNTS(已审核通过)+ APS_APPS_STORE(代理后台自行申请未通过)两个来源。注册提交后立刻就能在快速选择里看到自己的申请条目,点击直接填入账号密码,登入时会弹出对应申请进度弹窗' },
      { type: 'modify', text: '快速选择条目 — 头像 AC 黄色(agentportal)/ AP 绿色(网站前台已通过)/ AG 蓝色(商户创建);右侧 chip 显示申请状态标签(审核中 / 待补件 / 待复核 / 已拒绝 / 已通过),已通过的账户不显示标签' },
      { type: 'modify', text: '右上角数字徽标 由 accounts.length 改为 quickList.length(包含申请记录)' },
    ],
  },
  {
    ver: 'v3.0.52',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 专业代理后台「分享 Code 与链接」页白屏报错 — data.js 的 D.codes 没有 withdraw 字段,my_codes.jsx 列表中 F.money(c.withdraw) 在 undefined 上调 .toFixed 崩溃。给 c.deposit / c.withdraw / c.commission / arppu 全部加 ||0 兜底' },
      { type: 'fix', text: '🐛 商户后台「已创建代理」列表 React 警告「Encountered two children with the same key, AG100005」— 旧创建代理 ID 生成逻辑过滤掉了「_createWay 不等于商户创建」的行(包括第 5 条 AP範例6 _id=AG100005 / _displayId=AP200006),导致新建代理 ID 又生成到 AG100005,与原 5 条第 5 行 a.id 冲突' },
      { type: 'modify', text: '新 ID 生成改为:遍历所有 agents 的 id + _displayId,凡是以 AG 开头的取数字部分,取最大值 +1,彻底覆盖既存编号' },
    ],
  },
  {
    ver: 'v3.0.51',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '创建专业代理弹窗(CreateAgentModal)— 删除「申请理由 / 推广渠道说明」textarea(原仅当 isApplied=true 自行申请复核时显示) — 该字段在弹窗里只读且重复' },
    ],
  },
  {
    ver: 'v3.0.50',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '自行申请代理「查看&审核」抽屉 基本资料 删除「代理类型」字段(注册时已默认 normal,审核时不再展示);最终顺序:代理创建方式 / 代理ID / 代理名称 / 上级代理 / 创建时间' },
    ],
  },
  {
    ver: 'v3.0.49',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 代理后台注册生成的代理ID 编号位数多了一位(AC1100001) — prefix 写成 AC1 + min 100001 = AC1 + 100001 = 7 位编号。改 prefix=AC + min=100001 → AC100001 正确 6 位编号' },
      { type: 'add', text: '🆕 注册弹窗第 3 步 密码 / 重新输入密码 两个输入框右侧加眼睛图标(eye/eyeOff)— 点击切换显示/隐藏密码;新增 RegPasswordInput 组件复用' },
    ],
  },
  {
    ver: 'v3.0.48',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '商户后台 → 自行申请代理 → 查看&审核 抽屉 头像:agentportal 来源 改成「AC」字 + 黄色背景(#f59e0b);frontend 来源 保持「AP」字 + 绿色(#10b981)' },
      { type: 'add', text: '查看&审核 抽屉 在「申请资料 / 操作记录」之间新增 2 个 tab:「流量来源」「收款方式」与已创建代理详情页一致' },
      { type: 'add', text: '流量来源 tab — 读 detail._formSnapshot.trafficUrls,逐条 mono 字体长方块展示;空时显示「(未填写流量来源)」灰色虚线占位' },
      { type: 'add', text: '收款方式 tab — 固定显示 UPI badge + UPI ID(loginName@paytm)+ 收款人姓名(name)+ 黄色提示「当前阶段仅支持 UPI」' },
      { type: 'modify', text: '4 个 tab 顺序:申请资料 → 流量来源 → 收款方式 → 操作记录' },
    ],
  },
  {
    ver: 'v3.0.47',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '注册弹窗第 3 步「创建账户」— 删除「用户名」输入框,与第 1 步「申请人姓名」(applyName) 重复;提交时直接用 applyName 作为 loginName,登入 LoginModal 也用 applyName 匹配' },
      { type: 'remove', text: '注册弹窗第 3 步 — 删除「我同意收到 Partners-MM 联盟计画的新讯息」营销订阅勾选项(agreeNews);保留「我同意条款 + 隐私政策」单条必勾' },
      { type: 'modify', text: 'step3Valid 校验从 form.username 改为 form.applyName;同意条款 grid 从两栏 1fr 1fr 改为单栏(只剩一条)' },
    ],
  },
  {
    ver: 'v3.0.46',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '🆕 专业代理后台注册的用户 提交申请后,即可用注册账号密码登入代理后台,系统会根据当前申请状态弹出对应的进度状态弹窗' },
      { type: 'add', text: 'modules/agent_login.jsx 新增 ApplicationProgressModal 组件 — 5 种 state 各自有 icon / 标题 / 描述 / 提示(reviewing/supplement/supplemented/failed/passed)' },
      { type: 'add', text: '弹窗内容:大圆形状态图标 + 标题 + 描述 + 拒绝原因/补件说明(如有)+ 提示 + 申请编号/名称/提交时间/更新时间 表格 + 「我知道了」按钮(主题色随 state)' },
      { type: 'modify', text: 'LoginModal handleLogin 校验逻辑 — ①先匹配 APS_AGENT_ACCOUNTS(正式账户) → 直接 onLogin;②再匹配 APS_APPS_STORE 中 _channel=agentportal + loginName + password → 弹 ApplicationProgressModal;③都没匹配到 → 显示「账号或密码错误」' },
      { type: 'add', text: '使用方式 — 用户注册成功后(state=reviewing),拿同样的账号密码到登入页登入 → 弹「申请审核中」状态;管理员在商户后台改 state 为 supplement/failed/passed → 用户登入时分别弹对应状态' },
    ],
  },
  {
    ver: 'v3.0.45',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: 'CreateAgentModal 当来源为「自行申请」(isApplied=true)时,隐藏「代理类型」字段 — 用户在注册时已经选过(默认 normal),无需管理员复核;商户主动创建代理时仍正常显示需要选择' },
      { type: 'modify', text: '提交逻辑不受影响 — form.type 在 prefill 时已根据 prefill.tier 自动设置(normal/general/super → individual/team/super)' },
    ],
  },
  {
    ver: 'v3.0.44',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '🐛 CreateAgentModal(创建/复核代理弹窗) — 代理创建方式 字段当来源为「自行申请」时显示文案 由「自行申请代理」改为「代理自行创建」' },
      { type: 'remove', text: '🐛 CreateAgentModal 删除「用户ID」block — 与「代理ID」紧挨着,信息冗余' },
      { type: 'modify', text: '🐛 联系方式 手机国码改为固定 +91(印度) — 移除可选择的国码下拉(原 +1 美加 / +44 英国 / +55 巴西 / +52 墨西哥 / +91 印度),改为 inline span 显示 +91,与注册弹窗一致' },
    ],
  },
  {
    ver: 'v3.0.43',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '自行申请代理「查看&审核」抽屉 基本资料 — 全部字段单列左对齐(代理类型不再与代理ID同行),阅读顺序:代理创建方式 / 代理ID / 代理名称 / 代理类型 / 上级代理 / 创建时间' },
    ],
  },
  {
    ver: 'v3.0.42',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '自行申请代理「查看&审核」抽屉 基本资料 字段顺序微调:代理名称从「代理ID」右边移到「代理ID」下面;代理类型从单独一行升到「代理ID」右边,节省空间' },
      { type: 'modify', text: '最终顺序:代理创建方式 / 代理ID + 代理类型 / 代理名称 / 上级代理 / 创建时间' },
    ],
  },
  {
    ver: 'v3.0.41',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '代理 ID 前缀调整 — 专业代理后台注册:AG2xxxxx → AC1xxxxx(最小 AC100001) — A=Agent,C=Console;网站前台保持 AP2xxxxx;商户创建保持 AG1xxxxx' },
      { type: 'modify', text: '代理创建方式文案:旧「自行申请代理」→ 网站前台 改成「用户自行申请」+ 新增「代理后台自行申请」(专业后台注册来源)' },
      { type: 'modify', text: 'AGENTS_INITIAL 第 5 条示例(AP範例6) _createWay 同步改为「用户自行申请」+ 增加 _channel=frontend 标记;新增 FIXED_CHANNELS 数组烘焙 _channel' },
      { type: 'modify', text: 'isApplied 判断逻辑由 === "自行申请代理" 改为 !== "商户创建代理" — 兼容两种自行申请来源' },
      { type: 'modify', text: 'AgentDetail 头像 AP/AC 二字根据 _channel 区分(agentportal=AC,frontend=AP)' },
      { type: 'modify', text: '已创建代理列表筛选下拉「自行申请代理」改为「用户 / 代理后台自行申请」(覆盖两种来源)' },
      { type: 'modify', text: '示例数据 AC100001(原 AG200001)同步更新 ID' },
    ],
  },
  {
    ver: 'v3.0.40',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '🔄 撤销 v3.0.39 第 4 条:专业后台来源审核「通过」不再跳 CreateAgentModal,改回弹出复核弹窗 — 让管理员有机会复核分润模式 / 权限配置等关键项' },
      { type: 'modify', text: 'CreateAgentModal 的 prefill 逻辑 — 增加 loginName / password 预填(从申请记录里带过去),管理员看见就是注册时填的账号 / 密码,可改也可直接通过' },
      { type: 'remove', text: '自行申请代理「查看&审核」抽屉 — 删除「用户ID」字段(整行)' },
      { type: 'remove', text: '自行申请代理「查看&审核」抽屉 — 删除「申请理由 / 推广渠道说明」整个 section + textarea' },
      { type: 'modify', text: '自行申请代理「查看&审核」抽屉 — 「创建时间」从基本资料第 2 行移到上级代理下面(最后一行)' },
      { type: 'modify', text: 'ad-info-grid 字段顺序重排为:代理创建方式 / 代理ID|代理名称 / 代理类型 / 上级代理 / 创建时间' },
    ],
  },
  {
    ver: 'v3.0.39',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '🆕 专业代理后台未登录着陆页 → 注册流程闭环 — 用户在 BEANS 着陆页填 Become a Partner 提交后,数据流入商户后台「自行申请代理」列表,与网站前台并存但区分来源' },
      { type: 'add', text: '代理 ID 编号规则:_channel=agentportal → AG2xxxxx(专业后台注册);_channel=frontend → AP2xxxxx(网站前台申请);两套独立计数,商户创建仍是 AG1xxxxx' },
      { type: 'modify', text: 'modules/agents.jsx APS_addApplication 函数 — 支持 _channel 字段;ID 生成根据 prefix(AG2/AP2)各自计算下一个编号;申请记录额外携带 loginName/password(用于审核通过后免填)' },
      { type: 'modify', text: 'SELF_APPLICATIONS_INITIAL 示例数据 — 给原有 5 条标记 _channel=frontend;新增 1 条 AG200001 _channel=agentportal 示例(loginName: apexpromo,演示自动创建账户流程)' },
      { type: 'modify', text: 'modules/agent_login.jsx RegisterModal step3 提交按钮 — 调用 window.APS_addApplication({ _channel:agentportal, ...form }) 把表单写入 store;同时把 { loginName, appId } 写 localStorage.APS_AGENTPORTAL_LAST_REG 供后续查询申请进度' },
      { type: 'add', text: '商户后台 → 自行申请代理 列表 新增「申请渠道」列 + 顶部筛选条「全部 / 网站前台 / 专业后台」;列内以蓝 / 黄 chip 区分(网站前台 / 专业后台)' },
      { type: 'modify', text: '审核通过流程 — 检测 _channel=agentportal 且已带 loginName/password 时,跳过 CreateAgentModal,直接 onCreateAgent + 自动 form(用注册时的 type/loginName/password/contacts/默认 commission/perms);弹 toast 提示「账户已用注册时填的账号 / 密码自动创建」' },
      { type: 'add', text: '兼容性:网站前台老申请(无 loginName)继续走 PassModal 让管理员手动填账号 / 密码' },
      { type: 'add', text: '⏭️ 下一轮待做:专业后台登录页加「查申请进度」入口 + 进度弹窗(读 LS 中的 loginName 反查 store 申请状态)' },
    ],
  },
  {
    ver: 'v3.0.38',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 自行申请代理 → 查看&审核 弹窗手机模式 底部「要求补件 / 拒绝 / 通过」审核栏无法滚到 — 原因:.self-app-detail-panel 没设 display:flex,head/tabs/body 都按默认流式堆叠把 foot 顶出屏幕外,iframe 内整体内容超 viewport 也无法用 mask 滚动到底' },
      { type: 'modify', text: '<768px:.self-app-detail-panel 强制 display:flex + flex-direction:column;head/tabs flex-shrink:0(固定高);body flex:1 + min-height:0 + overflow-y:auto + -webkit-overflow-scrolling:touch(中间区域自身可滚);foot flex-shrink:0 + 顶部 border 区分 → foot 永远钉在底部可见可点' },
    ],
  },
  {
    ver: 'v3.0.37',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 iOS Safari 点击输入框时画面自动放大且键盘收起后不复原 — 经典 input 字号 <16px 触发的自动 zoom。viewport meta 加 maximum-scale=1 + user-scalable=no 关掉自动放大' },
      { type: 'modify', text: 'index.html viewport meta 同步更新;app.jsx viewMode auto/mobile 分支的 viewport 也同步加 maximum-scale=1' },
      { type: 'fix', text: '🐛 注册弹窗手机模式关闭 X 按钮没反应 — 之前 X 是 position:absolute 相对于 modal,但 v3.0.36 改 mask 滚动后 modal overflow:visible,absolute 仍生效;问题是 modal 自身可能高度超 viewport,X 跟着内容滚出可视范围,且被键盘 / 其他元素挡住' },
      { type: 'modify', text: '<768px:.aglp-modal-close 改 position:fixed + top:12 + right:12 + z-index:10 + 半透明白底 + 浅阴影,始终钉在屏幕右上角不随内容滚动,任意时刻都可点' },
    ],
  },
  {
    ver: 'v3.0.36',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 注册弹窗手机模式 内容超出屏幕高度后无法滑动 / 看不到「下一步」「提交」按钮 — 原因:.aglp-modal 设置了 min-height:100vh + overflow-y:auto 让 modal 内部滚动,但 iframe 内的手指滑动事件被父层 mobile-preview-overlay 截走,导致 modal 内部无法响应 touch scroll' },
      { type: 'modify', text: '改为「整个 mask 滚动」方案 — .aglp-mask 加 overflow-y:auto + -webkit-overflow-scrolling:touch;.aglp-modal min-height:auto + height:auto + overflow:visible,让内容自然撑高 mask 容器,滚动条在 mask 而非 modal 内' },
      { type: 'add', text: '.aglp-modal 底部 padding 增加到 80px,为底部按钮留出充足空间,避免被遮挡' },
    ],
  },
  {
    ver: 'v3.0.35',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 注册弹窗手机模式 输入框宽度异常右侧空一截 — 修法:① mask 改 align-items:flex-start + place-items:stretch 让 modal 顶到边;② .aglp-modal * { box-sizing:border-box } 兜底;③ .aglp-modal input/select/textarea 强制 width:100% !important + max-width:100% + min-width:0 — 不管 React 渲染时给了什么 inline width 都被压住' },
      { type: 'fix', text: '🐛 同意条款复选框被全局 input 样式吃掉显示成细圆环 — 复选框强制 width/height:16px + appearance:auto + accent-color:#3b82f6,标准方框样式' },
      { type: 'fix', text: '🐛 第 3 步「我同意条款 / 接收营销信息」两栏并排 — 加 [style*="grid-template-columns: 1fr 1fr"] 属性选择器强制 grid-template-columns:1fr 改成单栏堆叠(同步覆盖 React render 后的横线版本 grid-template-columns 和驼峰 gridTemplateColumns 两种写法)' },
      { type: 'modify', text: 'contact-row grid 90/1fr/28 → 86/1fr/26 再省 6px;modal padding 18/16 → 16/14 让出更多内容空间' },
    ],
  },
  {
    ver: 'v3.0.34',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 注册弹窗手机模式仍然右侧被裁切 — 之前用 .aglp-modal[style*="maxWidth"] 选择器没匹配上,因为浏览器把 React 的 maxWidth 转成 style="max-width:680px"(连字符版本)' },
      { type: 'modify', text: '改用 .aglp-modal[style] 通用属性选择器,任何带内联 style 的实例都强制 max-width:100vw + width:100% + box-sizing:border-box,彻底消除溢出' },
      { type: 'add', text: '所有 input/select 加 box-sizing:border-box 防 padding 撑出容器' },
    ],
  },
  {
    ver: 'v3.0.33',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 着陆页手机模式 navbar — 按钮+汉堡未贴右,中间空了一大块。原因:.aglp-nav-inner 用 grid auto/1fr/auto,1fr 空列吃掉中间空间。改为 display:flex + justify-content:space-between + nav-actions margin-left:auto,真正贴右' },
      { type: 'fix', text: '🐛 注册弹窗手机模式无响应式适配 — 用户名 / 联系方式 / 流量来源等输入框右侧溢出。原因:.aglp-modal 内联 maxWidth:680px + padding:32px + 联系方式 grid 130|1fr|32 这些固定值在 390px 视口下挤爆' },
      { type: 'modify', text: '<768px:.aglp-mask padding 20 → 0;.aglp-modal 强制 max-width:100vw + width:100% + min-height:100vh + border-radius:0 + padding 18/16 → 弹窗变全屏 sheet(包含内联 maxWidth 的也覆盖)' },
      { type: 'modify', text: '<768px:.contact-row grid 130|1fr|32 → 90|1fr|28;input min-width:0 防溢出;步骤指示器圆圈移除 minWidth' },
    ],
  },
  {
    ver: 'v3.0.32',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '专业代理后台 着陆页 navbar 手机模式调整 — ① 隐藏 BEANS 字标(只保留豆子图标);② Log In + Become a Partner 按钮从下拉菜单移回顶栏右侧(在汉堡左边可见,缩小到 padding 6/10、font 12px);③ 汉堡按钮自然在最右边' },
      { type: 'modify', text: '下拉菜单内容精简为:4 个滚动锚点 + 语言切换(Log In / Become a Partner 移除,避免重复)' },
      { type: 'modify', text: '.aglp-nav-inner 手机 padding 14/10 → 10/14;gap 32 → 8;.aglp-nav-actions gap 10 → 6' },
    ],
  },
  {
    ver: 'v3.0.31',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 商户后台 → 代理账户管理 → 自行申请代理 状态 tab 条(全部进度 / 待审核 / 要求补件 / 已补件待审核 / 拒绝 / 通过)手机模式下中文逐字换行成竖排 — 原因:tab 是 inline style 写的 flex 容器没声明 white-space,小屏宽度不够时浏览器允许中文字符级换行' },
      { type: 'modify', text: 'modules/agents.jsx tab 外层加 className=self-app-tabs;styles.css 加 .self-app-tabs > div { white-space:nowrap; flex-shrink:0 } 强制单行;<768px 整条横向滚动 + 隐藏滚动条 + padding 收紧到 10×10' },
    ],
  },
  {
    ver: 'v3.0.30',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 商户后台 → 创建专业代理弹窗 手机模式输入框右侧显示不全 — Modal 内的 padding 太大(22px) + 步骤指示器固定宽度 80×3 + 输入框未强制 100% 宽,共同导致内容被裁切' },
      { type: 'modify', text: '<768px:.modal 内层 padding 22 → 14;输入框 / select / textarea 强制 width:100% + min-width:0;.form-grid 子项 min-width:0(允许收缩);步骤指示器圆圈 minWidth 80 → 强制 0 + flex:0 1 auto;drawer-foot 加 flex-wrap' },
      { type: 'modify', text: '专业代理后台着陆页 navbar 手机模式 — 恢复显示 beans 图标(原 display:none 改回 display:grid)+ 缩小到 34×34;BEANS wordmark 高度 22px' },
      { type: 'modify', text: '专业代理后台着陆页 navbar 手机模式 — 隐藏顶部语言切换按钮(.aps-lang-wrap),把语言切换移到汉堡菜单底部(新增 .aglp-mobile-menu-lang 分组,与登录/注册按钮通过 divider 分割)' },
      { type: 'add', text: 'assets/beans-logo.png 替换为用户最新提供的图(同名覆盖)' },
    ],
  },
  {
    ver: 'v3.0.29',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 PC 上的「📱手机预览模式」实际没显示响应式 — 之前只是把 body width 缩成 390px,但 @media (max-width: 767px) 是基于 viewport 宽度 而非 body 宽度,viewport 还是 1920,所有响应式规则不触发,显示出来仍是桌面布局' },
      { type: 'feat', text: '🆕 改用 iframe 实现 — 真正给 viewport 一个 390px 的尺寸,所有 @media 查询正常触发,展示出与 iPhone 完全一致的响应式版面' },
      { type: 'add', text: 'app.jsx App 顶部读 URL 参数 ?embed=mobile,若有则给 <html> 加 embed-mobile 类(隐藏顶部 PC/手机切换按钮避免递归)' },
      { type: 'add', text: '当 viewMode==="mobile" 且非 embed 态:渲染 .mobile-preview-overlay → 中央 390×844 iPhone 外观框(深色背景 + 大圆角 + 顶部刘海 + 阴影)+ iframe src=同一页面&embed=mobile + 顶部胶囊提示 + 右上「退出预览」按钮' },
      { type: 'remove', text: '废弃 force-mobile-view 旧实现(CSS 仍保留但不再使用,可后续清理)' },
    ],
  },
  {
    ver: 'v3.0.28',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '🆕 PC 上点📱可预览手机模式 — 在屏幕中央显示一个 390×844 的 iPhone 14 Pro 外观手机框,深色背景烘托,黑色边框 + 大圆角 + 阴影 + 顶部胶囊提示「📱 手机预览模式 · 390×844」' },
      { type: 'modify', text: 'viewMode 增加第 3 个状态:auto / pc / mobile;按钮 📱 → mobile 模式;按钮 🖥️ → pc / auto(两者都高亮)' },
      { type: 'modify', text: 'CSS html.force-mobile-view → 给 body 套 width:390px + margin:0 auto + box-shadow + border-radius + 黑色外框;html 改深灰背景 #1f2937' },
      { type: 'fix', text: '修正按钮 active class 判断 JS 错误(三元链优先级问题)' },
      { type: 'add', text: '说明:iPhone 实机切到 PC 模式 → 1440 宽横向滚动;PC 浏览器切到 📱 模式 → 中央 390 px 框预览手机版面' },
    ],
  },
  {
    ver: 'v3.0.27',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: 'PC / 手机 浏览模式切换按钮 从顶栏最右侧 移到 最左侧(在「PRD 规划」tab 左边)' },
      { type: 'add', text: '🆕 后台 4 个 tab(PRD规划 / 商户后台 / 专业代理 / 网站前台)在小屏可横向滑动 — 新增 .backend-tabs-scroll 包装层,overflow-x:auto + 隐藏滚动条,iPhone 横屏不再挤' },
      { type: 'fix', text: '🐛 PC 模式切换不生效 — 仅改 viewport meta 在 iOS Safari 上不可靠,且 iframe 预览环境完全无效。改成双重保险:① viewport meta 改成 width=1440,initial-scale=0.3 ② 给 <html> 加 force-pc-view 类,强制 html / body min-width:1440px + overflow-x:auto。iPhone 切到 PC 模式后会缩放显示桌面布局并允许横向滚动' },
    ],
  },
  {
    ver: 'v3.0.26',
    date: '2026-05-18',
    changes: [
      { type: 'add', text: '🆕 着陆页(网站前台 / 代理后台未登录)navbar 加汉堡菜单 — <980px 隐藏中间「Commissions / Tools / Dashboard / How it Works」+ 右侧 Log In / Become a Partner;改为右侧汉堡按钮,点击弹下拉菜单包含所有 6 个入口' },
      { type: 'add', text: '.aglp-burger(36×36 圆角方块,activated 蓝色描边)+ .aglp-mobile-menu(右上角浮层,12px 圆角,带分割线分组)+ aglpMenuFade 动画' },
      { type: 'modify', text: 'scrollTo 函数追加 setMobileMenu(false),点击菜单项自动收起;遮罩点击外部也关闭' },
      { type: 'add', text: '🆕 顶部 backend-row 右侧加 PC / 手机 浏览模式切换 — 一对 26×22px 圆角按钮(手机 icon 默认 / PC icon 切换)' },
      { type: 'add', text: '切换原理:动态改 <meta name=viewport> content — auto:width=device-width 响应式(默认);pc:width=1440 强制桌面布局,手机用户横向滚动查看' },
      { type: 'add', text: '状态持久化到 localStorage.APS_VIEW_MODE,刷新后保留' },
      { type: 'add', text: 'ui.jsx 新增 monitor / smartphone 两个图标' },
    ],
  },
  {
    ver: 'v3.0.25',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 代理后台顶栏「语言切换按钮」内的「中」字 + globe icon 不居中 — line-height 默认值导致 CJK 文字基线偏移' },
      { type: 'modify', text: '.aps-lang-btn 加 line-height:1;内部 svg display:block + flex-shrink:0;span 加 line-height:1 + display:inline-block,让 icon / 文字 / chev 三者在同一基线' },
      { type: 'remove', text: '关于「我的分享 Code 与链接」页手机白屏 — 当前代码看不出明显抛错点。请提供:① iPhone 上具体白屏的截图;② 如能在 Safari 上长按「页面 → 检查器」看到 console 错误请截图给我。我会针对性修复' },
    ],
  },
  {
    ver: 'v3.0.24',
    date: '2026-05-18',
    changes: [
      { type: 'modify', text: '专业代理后台「网站前台」着陆页 navbar 品牌区改造 — 蓝色「MM」方块 logo → 黄色 beans 图标(assets/beans-logo.png);文字「Partners-MM」→ BEANS wordmark 图片(assets/beans-wordmark.png)' },
      { type: 'add', text: 'assets/ 新增 beans-logo.png + beans-wordmark.png(从 uploads 复制)' },
      { type: 'modify', text: '.aglp-brand-mark 从渐变蓝方块 + 文字 改为 38×38 图片容器(透明背景);.aglp-brand-wordmark 新增,高度 24px 自适应宽度' },
      { type: 'add', text: '<768px 手机模式 隐藏 logo 图标(.aglp-brand-mark display:none),只保留 BEANS wordmark 文字图(高度压到 22px)' },
      { type: 'fix', text: '编辑过程中遗留的 -spacing:0.5px; 垃圾代码已清除' },
    ],
  },
  {
    ver: 'v3.0.23',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '顶栏右上角文案「v2.6.0 · xxx视角」整段删除(app.jsx 第 192-198 行 backend-meta div 移除) — 与左侧后台版本号「v1.0」冲突,且 v2.6.0 也已过期' },
      { type: 'fix', text: '🐛 「自行申请代理 → 查看&审核」抽屉响应式失效 — 该抽屉是手写 inline style(width:680px),没走 .drawer 类,Phase 5 的样式覆盖不到导致 iPhone 上左半部分被截掉只剩右半' },
      { type: 'fix', text: 'modules/agents.jsx 第 1362-1364 行给外层加 className=self-app-detail-mask,内层加 self-app-detail-panel(原 className 仍保留 agent-detail)' },
      { type: 'add', text: 'styles.css 新增 .self-app-detail-panel 响应式 — <1024px 收到 560px;<768px 强制 100% 全屏 + 底部按钮换行 + .app-act-btn flex:1 等宽' },
      { type: 'add', text: '用 !important 提权,因为内联 width:680 优先级高于普通 CSS' },
    ],
  },
  {
    ver: 'v3.0.22',
    date: '2026-05-18',
    changes: [
      { type: 'fix', text: '🐛 关键修复 — index.html 的 viewport meta 由 width=1440 改为 width=device-width, initial-scale=1。此前 Phase 1-5 写的所有 @media (max-width: …) 全部失效,因为浏览器被强制按 1440 渲染再缩小到屏宽,媒体查询永远不触发' },
      { type: 'fix', text: '现象:netlify 部署后 iPhone 打开是「缩小到屏宽的桌面版」而非响应式版面(用户上传截图确认)' },
      { type: 'add', text: 'viewport-fit=cover 配合 iPhone 安全区域(刘海屏 / 灵动岛),避免顶栏被遮挡' },
    ],
  },
  {
    ver: 'v3.0.21',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '响应式 Phase 5 / 5 完结 — 抽屉 / 弹窗 / 详情 tabs / Tweaks 面板小屏适配,仅改 styles.css(~60 行)' },
      { type: 'add', text: '<1024px:.drawer 宽 640→560,.drawer.wide 920→720,max-width 92vw 兜底' },
      { type: 'add', text: '<768px:.drawer / .drawer.wide 强制 100% 全屏(去掉左侧 border);head/foot padding 收紧到 12-14px;drawer-foot 按钮 flex 50% 两两换行;弹窗 .modal 升到 96vw/92vh' },
      { type: 'add', text: '<768px:.agent-detail-tabs(代理详情 9 个 tab)启用横向滚动 + 隐藏滚动条;抽屉内 .ad-contact-tbl / .ad-log-tbl 也加 overflow-x:auto' },
      { type: 'add', text: '<480px:Tweaks 面板从右下 280px 改为 left:8/right:8/bottom:8 全宽贴底,max-height 60vh,避免小屏遮挡内容' },
      { type: 'add', text: '<480px:.drawer-head / .drawer-foot padding 进一步收到 12px' },
      { type: 'modify', text: '至此 5 个 Phase 全部完成,商户后台 + 代理后台 完整支持 ≥375px 屏宽 — 桌面端零回归(全部 max-width media query)' },
    ],
  },
  {
    ver: 'v3.0.20',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '响应式 Phase 4 / 5(登录页) — 仅改 styles.css,新增 ~70 行;覆盖代理后台 al2-* 2 栏式登录 + 旧 al-* 三栏兼容样式(商户后台无登录页,跳过)' },
      { type: 'add', text: '<1024px:左右两栏由 1.5:1 改为 1:1;.al2-left padding 36/60 → 28/36;.al2-illu SVG 限制最大宽 280px 避免溢出' },
      { type: 'add', text: '<768px:.al2-page 由 grid 改 flex column;左侧品牌区压缩成顶部 banner(隐藏 illustration,tagline 左对齐缩小);右侧表单区 max-width 100%,padding 18px,从居中改成顶部对齐' },
      { type: 'add', text: '<768px:logo ring 84→64px;welcome-sub 字号 15→12.5px;quick-btn / quick-row padding 整体收紧;头像 44→38px' },
      { type: 'add', text: '<768px:旧 al-* 三栏式也同步降级(.al-page 单列,.al-brand-art 隐藏,.al-accounts-list max-height 200px)' },
      { type: 'add', text: '<480px:tagline 字号再压一档(16px);quick-cred 内长字符串 mono 字段 word-break:break-all,避免 UPI ID / Email 撑破布局' },
    ],
  },
  {
    ver: 'v3.0.19',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '响应式 Phase 3 / 5(数据列表) — 仅改 styles.css,新增 ~80 行;通用 .toolbar / .tabs / .tbl-wrap / .pg 全部受益,所有列表页(agents / players / cpa / revshare / settlement / wallet / logs / my_*)一次性适配' },
      { type: 'add', text: '<768px 工具栏改为多行流式:搜索框占满 100%,筛选 select 每个占 50%;原本撑开间距的 span[style*="flex:1"] 转成强制换行;批量操作按钮跑到第二行' },
      { type: 'add', text: '<768px Tabs(全部/已启用/待激活...)允许横向滚动,不换行不挤压,移动端可滑动切换' },
      { type: 'add', text: '<768px 表格保持横向滚动(用户要求),给 .tbl-wrap 加左右渐变阴影 + radial 提示线,告诉用户「右侧还有内容可滑」;表头字号 12→10.5px,行字号 12→11.5px,信息密度更友好' },
      { type: 'add', text: '<768px 分页栏 .pg / .pagination 允许换行,小屏居中显示;页码按钮也允许换行' },
      { type: 'add', text: '<480px 筛选 select 改为占满 100%(2 列在超窄屏太挤);表头表体 padding 进一步收紧' },
      { type: 'add', text: '<1024px .filter-select 移除 max-width:150 限制,允许占据可用空间' },
    ],
  },
  {
    ver: 'v3.0.18',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '响应式 Phase 2 / 5(首页 + Dashboard + 通用网格) — 仅改 styles.css,新增 ~60 行' },
      { type: 'add', text: '<1024px:.kpi-grid 4→3 列;.grid-3 / .grid-4 → 2 列;首页 home-grid / folder-grid minmax 由 280 改 240,排得下更多列' },
      { type: 'add', text: '<768px:.kpi-grid → 2 列(数字字号 → 18px);.grid-2 / .grid-3 / .grid-4 全部 → 单列(用属性选择器 [style*="grid-template-columns"] 覆盖 Dashboard 内联 style);.home-grid / .folder-grid → 单列;.card-head 允许 flex-wrap;.page-head 标题与按钮纵向堆叠' },
      { type: 'add', text: '<768px:.funnel-row(转化漏斗)用 grid-template-areas 重排为「名称占满一行,bar + 比例 + 等级 第二行」;.form-row / .form-grid / .ad-info-grid 强制单列' },
      { type: 'add', text: '<480px:.kpi-grid 保持 2 列(避免单列过高);funnel-row 隐藏第 4 列「健康/中等/偏低」等级标签,只剩名称 + bar + 百分比' },
      { type: 'modify', text: '.page padding 桌面 18/22 → 平板 16/16 → 手机 12/12,小屏可视面积明显加大' },
    ],
  },
  {
    ver: 'v3.0.17',
    date: '2026-05-18',
    changes: [
      { type: 'feat', text: '响应式 Phase 1 / 5(基础架构) — 商户后台 + 代理后台 加入桌面 / 平板 / 手机三段式适配,首批落地侧栏 + 顶栏 + 面包屑' },
      { type: 'add', text: '路径栏左侧新增「汉堡」按钮(menu icon),位置在返回按钮左侧;<1024px 时可见,点击切换侧栏抽屉开合' },
      { type: 'add', text: '<1024px 侧栏改为 fixed 左侧抽屉(translateX 滑入),配半透明 backdrop 遮罩,点击遮罩或菜单项后自动收起(setRoute 内 window.innerWidth<1024 时关闭)' },
      { type: 'add', text: '<768px 顶栏精简 — 隐藏搜索框、铃铛、设置 icon、用户名文字,仅保留 logo + 用户头像;backend 三 tab 改为可横向滚动,padding 收紧' },
      { type: 'add', text: 'ui.jsx 新增 menu icon(三横线)' },
      { type: 'add', text: '断点:1023px(侧栏抽屉化) / 767px(顶栏精简) / 479px(超窄屏再压一档)' },
      { type: 'modify', text: 'app.jsx 新增 sidebarOpen state;根 div 增加 sidebar-open class;两处 content-crumbs(PRD + 商户/代理)同步插入汉堡按钮 + backdrop 元素' },
      { type: 'modify', text: 'styles.css 末尾新增 ~90 行响应式区块,只用 max-width media query,桌面默认形态完全不受影响' },
    ],
  },
  {
    ver: 'v3.0.16',
    date: '2026-05-18',
    changes: [
      { type: 'remove', text: '商户后台侧栏删除「风控与配置」整个大项(原仅 1 个子项「玩家风控管理」P0-10) — 简化版不再承载风控模块' },
      { type: 'remove', text: '删除 modules/risk.jsx 文件;app.jsx NAV 移除 风控与配置 section;路由分发删除 risk 分支;exclude 名单移除 risk;openSections 默认值同步移除 风控与配置' },
      { type: 'remove', text: 'index.html 移除 <script src="modules/risk.jsx">' },
      { type: 'modify', text: 'PRD P0-10「风控玩家名单」状态 done → removed,side 改「已移除」,mapping 清空,why 改为简化版移除说明(参照 P0-12 的处理方式);PRD 视图、首页 alert 红点(原 6 条)同步消失' },
      { type: 'modify', text: '保留 modules/dashboard.jsx「风控提醒」卡片不动 — 该卡片是仪表盘的静态展示组件,未指向 risk 模块路由,后续如需移除请单独提出' },
    ],
  },
  {
    ver: 'v3.0.15',
    date: '2026-05-15',
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

// v3.0.84 暴露给 app.jsx 侧栏使用,显示当前版本号
if (typeof window !== 'undefined') {
  window.VERSIONS = VERSIONS;
}

// v3.0.84 标记哪些版本已经导出代码(快照下载)— 列表中显示「已导出」绿色 chip
const EXPORTED_VERSIONS = new Set(['v3.0.22', 'v3.0.36', 'v3.0.77']);

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
              {EXPORTED_VERSIONS.has(v.ver) && (
                <span style={{
                  padding:'2px 8px',borderRadius:3,
                  background:'#fef3c7',color:'#92400e',
                  fontSize:11,fontWeight:600,display:'inline-flex',alignItems:'center',gap:4,
                }}>
                  <window.Icon name="download" size={11}/> 已导出代码
                </span>
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
