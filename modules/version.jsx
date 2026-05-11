// 版本历史 — PRD 规划 → 版本
// 用户告知做事情时会带上版本号(如 v222 = v2.2.2),完成后在此追加更新项
const VERSIONS = [
  {
    ver: 'v2.2.31',
    date: '2026-05-12',
    current: true,
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
