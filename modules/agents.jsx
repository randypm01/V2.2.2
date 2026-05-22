// 代理账户管理
const { Modal: AM, StatusBadge: AS, RiskBadge: AR, PageHead: APH, SearchInput: ASI, Pagination: APG, Tabs: ATAB, Avatar: AAV, useToast: AUT, Drawer: ADR } = window.UI;

// v3.1.89 单一示例资料源 — 8 个示例代理的「流量来源 / 收款方式 / 备注」
// 在「自行申请代理 → 查看&配置」(_appData._formSnapshot)和
// 「已创建代理 → 查看&配置」(agent._traffic / agent._payment)两处都用同一份,确保数据一致且无未填项
const AGENT_PROFILES = {
  AC100001: {
    trafficUrls: ['https://youtube.com/@apexpromo', 'https://t.me/apexpromo_official'],
    ifsc: 'HDFC0001234', account: '50100123456789', realName: 'Aman Patel',          payEmail: 'apex_promo@gmail.com',
    remark: '通过专业代理后台网址直接注册申请;主推 YouTube + Telegram 渠道',
  },
  AC100002: {
    trafficUrls: ['https://instagram.com/sara_ig_official', 'https://instagram.com/stories/sara_ig'],
    ifsc: 'SBIN0005678', account: '38291746528374', realName: 'Sara Sharma',         payEmail: 'sara_ig@gmail.com',
    remark: 'Instagram 投放主播,30k 粉丝,已合作 Brand Deal 12+',
  },
  AC100003: {
    trafficUrls: ['https://youtube.com/@rohan_tech', 'https://t.me/rohan_tech_group', 'https://discord.gg/rohantech'],
    ifsc: 'ICIC0009876', account: '12345678901234', realName: 'Rohan Kumar',         payEmail: 'rohan@gmail.com',
    remark: '已有完整推广团队和工具栈,YouTube + Telegram + Discord 多渠道分发',
  },
  AC100004: {
    trafficUrls: ['https://t.me/priyamedia_5k', 'https://wa.me/919730044004'],
    ifsc: 'AXIS0004321', account: '91827364554637', realName: 'Priya Mehta',         payEmail: 'priya_media@gmail.com',
    remark: '团队 8 人,主投 Telegram 群 5,000+ 成员 + WhatsApp 一对一咨询',
  },
  AC100005: {
    trafficUrls: ['https://t.me/arjun_aff_super', 'https://arjunaff.affiliate-network.com'],
    ifsc: 'KKBK0001122', account: '64738291046572', realName: 'Arjun Reddy',         payEmail: 'arjun_aff@gmail.com',
    remark: '隔壁平台代理 2 年,月均流水 ₹300 万;主走 Affiliate 网络分发',
  },
  AC100006: {
    trafficUrls: ['https://t.me/rajeshmedia_channel', 'https://youtube.com/@rajeshmedia'],
    ifsc: 'HDFC0002468', account: '70183927465821', realName: 'Rajesh Iyer',         payEmail: 'rajesh_aff@gmail.com',
    remark: '通过代理后台注册申请;主投 Telegram + YouTube,日均新增 30~50 注册',
  },
  AC100007: {
    trafficUrls: ['https://instagram.com/meena_promo', 'https://tiktok.com/@meena_promo_in'],
    ifsc: 'ICIC0003355', account: '83617495028361', realName: 'Meena Joshi',         payEmail: 'meena_promo@gmail.com',
    remark: '团队 6 人;Instagram + TikTok 双线投放,近期因投诉率超标临时冻结',
  },
  AC100008: {
    trafficUrls: ['https://fakeaff-x.affiliate-network.com'],
    ifsc: 'SBIN0007788', account: '20394857162083', realName: 'Vikram Singh',        payEmail: 'fakeaff@gmail.com',
    remark: '已停用 — 查实虚假推广行为,终止合作',
  },
};
// 默认分润 / 权限配置(已创建代理用),保证「查看&配置 → 分润模式 / 权限配置」也有数据
const DEFAULT_COMM = {
  kind: 'weekly',
  weekday: 1, monthday: 1,
  plans: ['revenue:RV-001'],
  minCommission: 200,
  maxCommission: 100000,
};
const DEFAULT_PERMS = {
  myAccount: true,
  codeManage: true,
  codeLimit: 20,
  reportCode: true,
  reportPlayer: true,
  reportRevshare: true,
};

// v2.3.0 自行申请代理 共享 store — 让网站前台提交的数据能流入商户后台
// v2.4.9 代理ID 规则：商户创建代理 = AG1xxxxx；自行申请代理 = AP2xxxxx
// v2.4.35 根据 app 当前 state 生成符合状态机的示例操作日志(若已有 _logs 则不动)
function seedAppLogs(app) {
  // v3.1.17 自动构造 _formSnapshot.contacts(Email + 手机)— 让所有自行申请代理示例都有完整联系方式
  // v3.1.89 同时自动注入 trafficUrls / ifsc / account / realName / payEmail / remark,
  //         让「自行申请代理 → 查看&配置」内每一项都有数据,不再有「未填」
  let next = app;
  const prof = AGENT_PROFILES[app.id];
  const needFill = !app._formSnapshot ||
    !app._formSnapshot.contacts ||
    !app._formSnapshot.trafficUrls ||
    !app._formSnapshot.ifsc ||
    !app._formSnapshot.account ||
    !app._formSnapshot.realName ||
    !app._formSnapshot.payEmail ||
    !app._formSnapshot.remark;
  if (needFill) {
    next = {
      ...app,
      _formSnapshot: {
        ...(app._formSnapshot || {}),
        contacts: app._formSnapshot?.contacts || [
          { type:'Email',  value: app.contact || '' },
          { type:'手机',   value: app.phone   || '', dial:'+91' },
        ].filter(c => c.value),
        trafficUrls: app._formSnapshot?.trafficUrls || prof?.trafficUrls || [],
        ifsc:        app._formSnapshot?.ifsc        || prof?.ifsc        || '',
        account:     app._formSnapshot?.account     || prof?.account     || '',
        realName:    app._formSnapshot?.realName    || prof?.realName    || '',
        payEmail:    app._formSnapshot?.payEmail    || prof?.payEmail    || '',
        remark:      app._formSnapshot?.remark      || prof?.remark      || (app.reason || ''),
      },
    };
  }
  if (next._logs && next._logs.length) return next;
  const baseTime = next.createdAt || '2026-05-11 23:59:59';
  const userBy = `用户:${next.userId || '-'}`;
  const merchantBy = '商户:管理员-randy';
  const logs = [{ at: baseTime, by: userBy, type:'submit' }];
  const update = next.updatedAt || baseTime;
  if (next.state === 'supplement')      logs.push({ at: update, by: merchantBy, type:'supplement',   note: next.failReason || '请补充身份证正面·反面 + 手持证件照' });
  if (next.state === 'supplemented')  { logs.push({ at:'2026-05-12 12:30:00', by:merchantBy, type:'supplement', note:'请补充推广渠道证明截图' }); logs.push({ at: update, by:userBy, type:'supplemented', note:'已补充推广渠道截图与近 30 天数据' }); }
  if (next.state === 'failed')          logs.push({ at: update, by: merchantBy, type:'reject',       note: next.failReason || '与现有代理渠道重叠较多,本次申请不通过' });
  if (next.state === 'passed')          logs.push({ at: update, by: merchantBy, type:'pass',         note: '由管理员手动创建专业代理账户' });
  return { ...next, _logs: logs };
}
const SELF_APPLICATIONS_INITIAL = [
  { id:'AC100001', _channel:'agentportal', name:'AC範例1',    tier:'normal',  userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'apex_promo@gmail.com',phone:'98123 11001',region:'India · Chennai',    reason:'通过专业代理后台网址直接注册申请',                                channels:'YouTube · Telegram',                    loginName:'apexpromo',  password:'Test@1234',  createdAt:'2026-05-13 08:30:00', updatedAt:'2026-05-13 08:30:00', state:'reviewing' },
  { id:'AC100002', _channel:'agentportal', name:'AC範例2',    tier:'normal',  userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'sara_ig@gmail.com',   phone:'98213 22002',region:'India · Mumbai',     reason:'Instagram 投放主播,30k 粉丝',                                    channels:'Instagram · Stories',                   loginName:'saraig',     password:'Test@1234',  createdAt:'2026-05-13 09:15:30', updatedAt:'2026-05-14 10:00:00', state:'supplement',   failReason:'请补充身份证正反面 + 推广渠道近 30 天数据截图' },
  { id:'AC100003', _channel:'agentportal', name:'AC範例3',    tier:'normal',  userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'rohan@gmail.com',     phone:'99100 33003',region:'India · Delhi',      reason:'已有完整推广团队和工具栈',                                        channels:'YouTube · Telegram · Discord',          loginName:'rohan_tech', password:'Test@1234',  createdAt:'2026-05-13 11:20:00', updatedAt:'2026-05-15 14:30:00', state:'supplemented' },
  { id:'AC100004', _channel:'agentportal', name:'AC範例4',    tier:'general', userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'priya_media@gmail.com',phone:'97300 44004',region:'India · Pune',      reason:'团队 8 人,主投 Telegram + WhatsApp',                              channels:'Telegram 群 5,000+ · WhatsApp',         loginName:'priyamedia', password:'Test@1234',  createdAt:'2026-05-12 16:40:00', updatedAt:'2026-05-13 18:00:00', state:'failed',       failReason:'与现有代理 AG100023 渠道高度重叠,本次申请不通过' },
  { id:'AC100005', _channel:'agentportal', name:'AC範例5',    tier:'super',   userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'arjun_aff@gmail.com',phone:'98800 55005', phone:'98800 55005',region:'India · Bangalore',  reason:'隔壁平台代理 2 年,月均流水 ₹300 万',                              channels:'Telegram · Affiliate 网络',             loginName:'arjunaff',   password:'Test@1234',  createdAt:'2026-05-11 14:00:00', updatedAt:'2026-05-13 16:00:00', state:'passed' },
  { id:'AC100006', _channel:'agentportal', name:'AC範例6',    tier:'normal',  userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'rajesh_aff@gmail.com',phone:'90400 66006',phone:'90400 66006',region:'India · Hyderabad',  reason:'通过代理后台注册申请;主投 Telegram + YouTube',                    channels:'Telegram · YouTube',                    loginName:'rajeshmedia', password:'Test@1234', createdAt:'2026-04-20 10:15:00', updatedAt:'2026-04-22 14:00:00', state:'passed' },
  { id:'AC100007', _channel:'agentportal', name:'AC範例7',    tier:'general', userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'meena_promo@gmail.com',phone:'98300 77007',phone:'98300 77007',region:'India · Kolkata',   reason:'团队 6 人;近期投诉较多临时冻结',                                  channels:'Instagram · TikTok',                    loginName:'meena_promo', password:'Test@1234', createdAt:'2026-04-10 08:00:00', updatedAt:'2026-04-12 11:00:00', state:'passed' },
  { id:'AC100008', _channel:'agentportal', name:'AC範例8',    tier:'normal',  userId:'',          parentId:'AG000000', parentName:'本商户',   contact:'fakeaff@gmail.com',phone:'91000 88008',   phone:'91000 88008',region:'India · Jaipur',     reason:'已停用 — 违规推广手法',                                            channels:'Affiliate 网络',                        loginName:'fakeaff_x',   password:'Test@1234', createdAt:'2026-03-15 16:30:00', updatedAt:'2026-03-20 18:00:00', state:'passed' },
];
// 全局共享 store: 网站前台提交 → 商户后台自行申请列表
if (!window.APS_APPS_STORE) {
  window.APS_APPS_STORE = { list: SELF_APPLICATIONS_INITIAL.map(seedAppLogs), listeners: new Set() };
  window.APS_addApplication = function(app) {
    const existing = window.APS_APPS_STORE.list;
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    // v2.3.19 同一 userId 若已有非终态(非 passed/failed)申请,直接 UPSERT 复用,避免多条
    const uid = app.userId;
    if (uid) {
      const idx = existing.findIndex(x => x.userId === uid && x.state !== 'passed' && x.state !== 'failed');
      if (idx >= 0) {
        const old = existing[idx];
        const merged = {
          ...old,
          name: app.name || old.name,
          tier: app.tier || old.tier,
          contact: app.contact || old.contact,
          region: app.region || old.region,
          reason: app.reason || old.reason,
          channels: app.channels || old.channels,
          updatedAt: nowStr,
          state: 'reviewing',
          failReason: null,
        };
        window.APS_APPS_STORE.list = existing.map((x,i)=> i===idx ? merged : x);
        window.APS_APPS_STORE.listeners.forEach(fn => fn());
        return merged;
      }
    }
    // v2.3.15 基于已存在代理ID 中最大编号 +1,避免删除后冲突
    // v2.4.9 用户自行申请 ID 以 AP2xxxxx 开头(最小 AP200001)
    // v3.0.41 申请渠道:
    //   _channel === 'frontend'(默认):用户自行申请 (网站前台) → AP2xxxxx
    //   _channel === 'agentportal':代理后台自行申请 → AC1xxxxx
    const channel = app._channel || 'frontend';
    const prefix = channel === 'agentportal' ? 'AC' : 'AP2';
    const minNum = channel === 'agentportal' ? 100001 : 200001;
    const prefLen = prefix.length; // 'AC'.length = 2 / 'AP2'.length = 3
    const numFromIdStart = (idStr) => {
      const s = String(idStr || '');
      if (!s.startsWith(prefix)) return NaN;
      return parseInt(s.slice(prefLen), 10);
    };
    const fromApps = existing.map(x => numFromIdStart(x.id));
    const fromAgents = (window.APS_MERCHANT_AGENTS_STORE?.list || [])
      .map(x => numFromIdStart(x._displayId || x.id));
    const maxNum = [...fromApps, ...fromAgents]
      .filter(n => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    const nextNum = String(Math.max(maxNum + 1, minNum)).padStart(6, '0');
    const full = {
      id: app.id || (prefix + nextNum), // 拼成 AP200001 / AC100001
      _channel: channel,
      name: app.name || '未填写',
      tier: app.tier || 'normal',
      userId: app.userId || ('P' + Math.floor(10000000 + Math.random()*90000000)),
      parentId: app.parentId || 'AG000000',
      parentName: app.parentName || '本商户',
      contact: app.contact || '',
      region: app.region || '',
      reason: app.reason || '',
      channels: app.channels || '',
      // v3.0.39 注册时填的登录账号 / 密码;审核通过后直接用,不再让管理员手动填
      loginName: app.loginName || null,
      password: app.password || null,
      _formSnapshot: app._formSnapshot || null,
      createdAt: app.createdAt || nowStr,
      updatedAt: app.updatedAt || nowStr,
      state: 'reviewing',
      // v3.0.59 提交时即生成第一条 submit 日志,通过审核后会继承到「已创建代理」操作记录
      _logs: [{ at: app.createdAt || nowStr, by: (app._channel === 'agentportal' ? ('用户:' + (app.loginName || app.name || '-')) : ('用户:' + (app.userId || '-'))), type:'submit' }],
    };
    window.APS_APPS_STORE.list = [full, ...existing];
    window.APS_APPS_STORE.listeners.forEach(fn => fn());
    return full;
  };
}
function useApsApps() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    window.APS_APPS_STORE.listeners.add(force);
    return () => window.APS_APPS_STORE.listeners.delete(force);
  }, []);
  const setApps = (updater) => {
    const cur = window.APS_APPS_STORE.list;
    window.APS_APPS_STORE.list = typeof updater === 'function' ? updater(cur) : updater;
    window.APS_APPS_STORE.listeners.forEach(fn => fn());
  };
  return [window.APS_APPS_STORE.list, setApps];
}
const TIER_LABEL = { normal:'个人代理', general:'团队代理', super:'总代理' };
const APP_STATE_META = {
  reviewing:    { label:'待审核',       fg:'#d97706', bg:'#fffbeb' },
  supplement:   { label:'要求补件',     fg:'#7c3aed', bg:'#faf5ff' },
  supplemented: { label:'已补件待审核', fg:'#ea580c', bg:'#fff7ed' },
  failed:       { label:'拒绝',         fg:'#dc2626', bg:'#fef2f2' },
  passed:       { label:'通过',         fg:'#16a34a', bg:'#f0fdf4' },
};

// v2.4.35 操作日志类型 → 颜色 / 浅色底 / 中文标签
const OP_LOG_META = {
  submit:       { color:'#0284c7', bg:'#f0f9ff', label:'申请专业代理' },
  supplement:   { color:'#7c3aed', bg:'#faf5ff', label:'要求补件' },
  supplemented: { color:'#ea580c', bg:'#fff7ed', label:'已补件' },
  reject:       { color:'#dc2626', bg:'#fef2f2', label:'拒绝' },
  pass:         { color:'#16a34a', bg:'#f0fdf4', label:'通过' },
  create:       { color:'#2563eb', bg:'#eff6ff', label:'创建专业代理帐户' },
  edit:         { color:'#475569', bg:'#f1f5f9', label:'编辑' },
  freeze:       { color:'#2563eb', bg:'#eff6ff', label:'冻结帐户' },
  unfreeze:     { color:'#16a34a', bg:'#f0fdf4', label:'再次启用' },
  suspend:      { color:'#dc2626', bg:'#fef2f2', label:'停用帐户' },
  login:        { color:'#16a34a', bg:'#f0fdf4', label:'首次登入(账户启用)' },
};

// v2.4.35 通用日志时间线组件
function LogTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{padding:'40px 0',textAlign:'center',color:'var(--text-3)',fontSize:13}}>暂无操作记录</div>
    );
  }
  return (
    <div className="op-timeline">
      {logs.map((l, i) => {
        const meta = OP_LOG_META[l.type] || { color:'#64748b', bg:'#f1f5f9', label:l.type };
        const isLast = i === logs.length - 1;
        return (
          <div key={i} className="op-tl-row" style={{display:'flex',alignItems:'flex-start',gap:14,position:'relative',paddingBottom:isLast?0:14}}>
            <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,paddingTop:6}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:meta.color,boxShadow:`0 0 0 3px ${meta.bg}`}}/>
              {!isLast && <div style={{position:'absolute',top:18,bottom:-14,width:1,background:'var(--line)'}}/>}
            </div>
            <div style={{flex:1,minWidth:0,paddingBottom:isLast?0:4}}>
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <span style={{padding:'2px 10px',borderRadius:12,border:`1px solid ${meta.color}`,color:meta.color,background:meta.bg,fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{l.label || meta.label}</span>
                <span className="text-mono" style={{fontSize:12,color:'var(--text-2)'}}>{l.at}</span>
                <span style={{fontSize:12,color:'var(--text-2)'}}>· {l.by}</span>
              </div>
              {l.note && (
                <div style={{marginTop:6,padding:'8px 12px',background:meta.bg,border:`1px solid ${meta.color}33`,borderRadius:6,fontSize:13,lineHeight:1.6,color:'var(--text-1)',whiteSpace:'pre-wrap'}}>{l.note}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// v2.4.19 商户已创建代理 全局 store(切换页面后 state 不丢)
function ensureMerchantAgentsStore() {
  // v3.0.78 每次都清除 AC100005 在 localStorage 的「已登入」标记,确保示例数据始终展示「未启用」
  try {
    const LS_KEY = 'aps_logged_in_agents';
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    const cleaned = arr.filter(id => id !== 'AC100005');
    if (cleaned.length !== arr.length) {
      localStorage.setItem(LS_KEY, JSON.stringify(cleaned));
    }
    if (window.APS_LOGGED_IN_AGENTS && window.APS_LOGGED_IN_AGENTS.set) {
      window.APS_LOGGED_IN_AGENTS.set.delete('AC100005');
    }
  } catch (e) {}
  if (window.APS_MERCHANT_AGENTS_STORE) return window.APS_MERCHANT_AGENTS_STORE;
  const D = window.APS_DATA;
  // v2.4.20 把「代理类型 / 创建方式 / displayId」固化为每个 agent 的属性,避免 index 移位后错位
  const FIXED_TYPES = ['个人代理','个人代理','团队代理','总代理','个人代理'];
  const FIXED_DISPLAY_IDS = [null, null, null, null, 'AP200006'];
  const FIXED_CREATE_WAYS = ['商户创建代理','商户创建代理','商户创建代理','商户创建代理','用户自行申请'];
  const FIXED_CHANNELS = [null, null, null, null, 'frontend']; // v3.0.41 给已创建代理打 _channel,详情头像区分 AP/AC
  const initial = D.agents.slice(0, 0).map((a, i) => {
    const baked = {
      ...a,
      _aType: FIXED_TYPES[i],
      _createWay: FIXED_CREATE_WAYS[i],
      _channel: FIXED_CHANNELS[i],
      _displayId: FIXED_DISPLAY_IDS[i] || a.id,
    };
    // v2.4.35 注入初始操作日志(基于代理 status + createWay)
    const createdStr = new Date(a.created).toISOString().slice(0,19).replace('T',' ');
    const createBy = '商户:管理员-randy';
    const logs = [{ at: createdStr, by: createBy, type:'create' }];
    if (a.status === 'active')    logs.push({ at:'2026-05-12 08:30:00', by:`代理:${baked._displayId}`, type:'login' });
    if (a.status === 'frozen')    logs.push({ at:'2026-05-12 14:20:00', by:createBy, type:'freeze',  note:'账户出现异常,临时冻结' });
    if (a.status === 'suspended') logs.push({ at:'2026-05-12 16:45:00', by:createBy, type:'suspend', note:'违规终止合作' });
    baked._logs = logs;
    if (i !== 4) return baked;
    return {
      ...baked,
      // AP範例6 替换日志为完整申请历史(供「自行申请代理」详情页与已创建代理详情页一致显示)
      _logs: [
        { at:'2026-05-10 10:00:00', by:'用户:P34157319', type:'submit' },
        { at:'2026-05-10 14:30:00', by:'商户:管理员-randy', type:'supplement',  note:'请补充推广渠道证明截图' },
        { at:'2026-05-11 09:15:00', by:'用户:P34157319', type:'supplemented', note:'已补充推广渠道截图与近 30 天数据' },
        { at:'2026-05-11 16:00:00', by:'商户:管理员-randy', type:'pass',        note:'由管理员手动创建专业代理账户' },
        { at:'2026-05-11 16:00:01', by:'商户:管理员-randy', type:'create' },
      ],
      _appData: {
        userId: 'P34157319',
        reason: '个人 YouTube 频道 50k 订阅,主做 Cricket 内容',
        channels: 'YouTube · Instagram · WhatsApp Group',
        note: '',
        loginName: 'apexample6',
        // v3.1.17 改为数组结构 — Email + 手机,与 ACSamples 一致
        contacts: [
          { type:'Email', value:'apexample6@gmail.com' },
          { type:'手机',  value:'98123 45678', dial:'+91' },
        ],
        appliedAt: '2026-05-11 23:59:59',
        history: [
          { at: '2026-05-11 23:59:59', by: '用户:P34157319', what: '申请专业代理' },
          { at: '2026-05-12 23:59:59', by: '商户:管理员-randy', what: '通过:创建专业代理帐户' },
        ],
      },
    };
  });
  window.APS_MERCHANT_AGENTS_STORE = {
    list: initial,
    listeners: new Set(),
    setList(next) {
      this.list = typeof next === 'function' ? next(this.list) : next;
      this.listeners.forEach(fn => fn());
    },
    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    },
  };
  // v3.0.75 → v3.0.78 已上移到函数顶部、每次都执行(原 onelane init 内的清理已废弃,改放函数 top)
  const ACSamples = [
    { id:'AC100005', name:'AC範例5', tier:'super',   status:'pending',   loginName:'arjunaff',     password:'Test@1234', createdAt:'2026-05-11 14:00:00', updatedAt:'2026-05-13 16:00:00', activatedAt:null,                  region:'India · Bangalore', contact:'arjun_aff@gmail.com',  phone:'98800 55005', reason:'隔壁平台代理 2 年,月均流水 ₹300 万',  channels:'Telegram · Affiliate 网络',     players: 0,   commission: 0 },
    { id:'AC100006', name:'AC範例6', tier:'normal',  status:'active',    loginName:'rajeshmedia', password:'Test@1234', createdAt:'2026-04-20 10:15:00', updatedAt:'2026-04-22 14:00:00', activatedAt:'2026-04-23 09:30:00', region:'India · Hyderabad',  contact:'rajesh_aff@gmail.com', phone:'90400 66006', reason:'通过代理后台注册申请;主投 Telegram + YouTube',  channels:'Telegram · YouTube',     players: 142, commission: 18500 },
    { id:'AC100007', name:'AC範例7', tier:'general', status:'frozen',    loginName:'meena_promo', password:'Test@1234', createdAt:'2026-04-10 08:00:00', updatedAt:'2026-04-12 11:00:00', activatedAt:'2026-04-13 09:00:00', region:'India · Kolkata',    contact:'meena_promo@gmail.com',phone:'98300 77007', reason:'团队 6 人;近期投诉较多临时冻结',                channels:'Instagram · TikTok',     players: 87,  commission: 12200, frozenReason:'近期玩家投诉率超阈值,临时冻结排查' },
    { id:'AC100008', name:'AC範例8', tier:'normal',  status:'suspended', loginName:'fakeaff_x',   password:'Test@1234', createdAt:'2026-03-15 16:30:00', updatedAt:'2026-03-20 18:00:00', activatedAt:'2026-03-21 10:00:00', region:'India · Jaipur',     contact:'fakeaff@gmail.com',    phone:'91000 88008', reason:'已停用 — 违规推广手法',                          channels:'Affiliate 网络',         players: 0,   commission: 0,     suspendReason:'查实存在虚假推广行为,终止合作' },
  ];
  ACSamples.forEach(s => {
    const tierLabel = s.tier === 'general' ? '团队代理' : s.tier === 'super' ? '总代理' : '个人代理';
    const logs = [
      { at: s.createdAt, by: '用户:' + s.loginName, type: 'submit' },
      { at: s.updatedAt, by: '商户:管理员-randy', type: 'pass', note: '由管理员手动创建专业代理账户' },
      { at: s.updatedAt, by: '商户:管理员-randy', type: 'create' },
    ];
    if (s.activatedAt) logs.push({ at: s.activatedAt, by: '代理:' + s.id, type: 'login' });
    if (s.status === 'frozen' && s.frozenReason) logs.push({ at: '2026-05-10 14:00:00', by: '商户:管理员-randy', type: 'freeze', note: s.frozenReason });
    if (s.status === 'suspended' && s.suspendReason) logs.push({ at: '2026-05-08 16:00:00', by: '商户:管理员-randy', type: 'suspend', note: s.suspendReason });
    // v3.1.89 取该代理的示例资料(流量/收款/备注),把 _traffic / _payment / _comm / _perms / _formSnapshot 全部烘入
    const prof = AGENT_PROFILES[s.id] || {};
    window.APS_MERCHANT_AGENTS_STORE.list.push({
      id: s.id,
      name: s.name,
      parent: null,
      parentName: '本商户',
      status: s.status,
      tier: s.tier,
      _aType: tierLabel,
      _createWay: '代理后台自行申请',
      _channel: 'agentportal',
      _displayId: s.id,
      _logs: logs,
      // v3.1.89 烘入「查看&配置」各 tab 用到的资料
      _traffic: prof.trafficUrls ? [...prof.trafficUrls] : [],
      _payment: {
        method: 'UPI',
        ifsc: prof.ifsc || '',
        account: prof.account || '',
        realName: prof.realName || '',
        email: prof.payEmail || '',
      },
      _comm: { ...DEFAULT_COMM },
      _perms: { ...DEFAULT_PERMS },
      level: 1,
      players: s.players || 0,
      commission: s.commission || 0,
      pendingCommission: 0,
      ngr: (s.commission || 0) * 4,
      activeCpa: Math.floor((s.players || 0) * 0.3),
      created: new Date(s.activatedAt || s.updatedAt || s.createdAt).getTime(),
      lastLogin: s.activatedAt ? new Date(s.activatedAt).getTime() : null,
      country: 'IN',
      risk: 'low',
      _appData: {
        userId: '',
        reason: s.reason,
        channels: s.channels,
        loginName: s.loginName,
        appliedAt: s.createdAt,
        // v3.1.17 已创建代理 联系方式 — Email + 手机(从 ACSamples 的 contact + phone 构造)
        contacts: [
          { type:'Email', value: s.contact || '' },
          { type:'手机',  value: s.phone   || '', dial:'+91' },
        ].filter(c => c.value),
        // v3.1.89 _formSnapshot 用同一份 AGENT_PROFILES,确保「自行申请代理」与「已创建代理」detail 字段一致
        _formSnapshot: {
          contacts: [
            { type:'Email', value: s.contact || '' },
            { type:'手机',  value: s.phone   || '', dial:'+91' },
          ].filter(c => c.value),
          trafficUrls: prof.trafficUrls || [],
          ifsc: prof.ifsc || '',
          account: prof.account || '',
          realName: prof.realName || '',
          payEmail: prof.payEmail || '',
          remark: prof.remark || s.reason || '',
        },
      },
    });
    if (window.APS_AGENT_ACCOUNTS && window.APS_AGENT_ACCOUNTS.add) {
      const exist = (window.APS_AGENT_ACCOUNTS.list || []).find(x => x.loginName === s.loginName);
      if (!exist) {
        window.APS_AGENT_ACCOUNTS.add({
          agentId: s.id, name: s.name,
          loginName: s.loginName, password: s.password,
          tier: s.tier, createdAt: s.createdAt,
        });
      }
    }
  });
  // v3.0.65 自动同步:state=passed 的代理后台自行申请(AC) → 推入「已创建代理」store + 登录账户
  try {
    const apps = (window.APS_APPS_STORE && window.APS_APPS_STORE.list) || [];
    apps.filter(a => a.state === 'passed' && a._channel === 'agentportal').forEach(app => {
      if (window.APS_MERCHANT_AGENTS_STORE.list.find(x => x.id === app.id)) return;
      const tier = app.tier || 'normal';
      const aType = tier === 'normal' ? '个人代理' : tier === 'general' ? '团队代理' : '总代理';
      const ts = app.updatedAt || app.createdAt || '2026-05-13 16:00:00';
      window.APS_MERCHANT_AGENTS_STORE.list = [
        {
          id: app.id,
          name: app.name,
          parent: null,
          status: 'pending',
          tier,
          _aType: aType,
          _createWay: '代理后台自行申请',
          _channel: 'agentportal',
          _displayId: app.id,
          _logs: [...(app._logs || []), { at: ts, by: '商户:管理员-randy', type: 'create' }],
          level: 1,
          players: 0,
          created: new Date(ts.replace(' ', 'T')).toISOString(),
          risk: 'low',
          _appData: {
            userId: app.userId || '',
            reason: app.reason || '',
            channels: app.channels || '',
            loginName: app.loginName,
            appliedAt: app.createdAt,
            _formSnapshot: app._formSnapshot || null,
          },
        },
        ...window.APS_MERCHANT_AGENTS_STORE.list,
      ];
      // 推入登录账户
      if (window.APS_AGENT_ACCOUNTS && window.APS_AGENT_ACCOUNTS.add) {
        const existing = (window.APS_AGENT_ACCOUNTS.list || []).find(x => x.loginName === app.loginName);
        if (!existing) {
          window.APS_AGENT_ACCOUNTS.add({
            agentId: app.id,
            name: app.name,
            loginName: app.loginName,
            password: app.password,
            tier,
            createdAt: app.createdAt,
          });
        }
      }
    });
  } catch (e) { /* noop */ }
  return window.APS_MERCHANT_AGENTS_STORE;
}
// v3.1.38 expose 给其他模块（如 agent_revshare）首次访问时主动初始化 store
window.APS_ensureMerchantAgentsStore = ensureMerchantAgentsStore;
function useMerchantAgents() {
  const store = ensureMerchantAgentsStore();
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => store.subscribe(force), [store]);
  const setAgents = React.useCallback((next) => store.setList(next), [store]);
  return [store.list, setAgents];
}

function AgentsModule({ initialDetail = null }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = AUT();
  const [agents, setAgents] = useMerchantAgents();
  // v2.4.16 订阅「代理首次登入」事件 → 自动把对应代理状态从 pending 翻为 active
  React.useEffect(() => {
    const flip = () => {
      const loggedSet = window.APS_LOGGED_IN_AGENTS && window.APS_LOGGED_IN_AGENTS.set;
      if (!loggedSet || loggedSet.size === 0) return;
      setAgents(prev => prev.map(a => {
        if (a.status !== 'pending') return a;
        const matchId = a._displayId || a.id;
        if (loggedSet.has(matchId) || loggedSet.has(a.id)) {
          return { ...a, status: 'active' };
        }
        return a;
      }));
    };
    flip(); // initial sweep on mount
    if (window.APS_LOGGED_IN_AGENTS) {
      return window.APS_LOGGED_IN_AGENTS.subscribe(flip);
    }
  }, []);
  // v2.2.5 顶层来源分页:商户创建 / 自行申请
  const [source, setSource] = React.useState('merchant');
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const [createWay, setCreateWay] = React.useState('all');
  const [tier, setTier] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showTplConfig, setShowTplConfig] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  // v2.4.5 全局模板状态提升至 AgentsModule(供已创建代理页的「全局配置」按钮使用)
  const TPL_LS_KEY = 'aps_app_tpls';
  const DEFAULT_TPLS = {
    supplement: {
      tpl1: '请补充身份证正面·反面 + 手持证件照。',
      tpl2: '请补充推广渠道证明截图以及近 30 天粉丝及内容数据。',
    },
    reject: {
      tpl1: '推广渠道与现有代理重叠较多,本次申请不通过。',
      tpl2: '提交资料不完整或不符合要求,本次申请不通过。',
    },
  };
  const [tpls, setTpls] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TPL_LS_KEY) || 'null');
      if (saved && saved.supplement && saved.reject) return saved;
    } catch(e){}
    return DEFAULT_TPLS;
  });
  React.useEffect(() => {
    try { localStorage.setItem(TPL_LS_KEY, JSON.stringify(tpls)); } catch(e){}
  }, [tpls]);
  const [detail, setDetail] = React.useState(null);
  const [selected, setSelected] = React.useState(new Set());

  const filtered = React.useMemo(() => {
    return agents.filter((a, i) => {
      if (tab !== 'all' && a.status !== tab) return false;
      if (q && !(a.id+a.name).toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== 'all' && a.type !== type) return false;
      if (tier !== 'all' && a.tier !== tier) return false;
      // v2.4.20 使用 a._createWay(烘在 agent 上的属性),不再依赖 index
      const isApplied = a._createWay !== '商户创建代理';
      if (createWay === 'merchant' && isApplied) return false;
      if (createWay === 'applied' && !isApplied) return false;
      return true;
    });
  }, [agents, tab, q, type, tier, createWay]);
  const pageSize = 12;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const counts = {
    all: agents.length,
    active: agents.filter(a=>a.status==='active').length,
    frozen: agents.filter(a=>a.status==='frozen').length,
    suspended: agents.filter(a=>a.status==='suspended').length,
    pending: agents.filter(a=>a.status==='pending').length,
  };

  const toggleSel = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const [apsApps] = useApsApps();
  const reviewingCount = apsApps.filter(a=>a.state==='reviewing').length;
  const supplementCount = apsApps.filter(a=>a.state==='supplement').length;
  const pendingAppCount = reviewingCount + supplementCount;

  return (
    <div className="page">
      <APH title="代理账户管理" subtitle="管理所有专业代理账户与权限配置">
      </APH>

      {/* v2.2.5 来源分页：商户创建 / 自行申请 */}
      <div style={{display:'flex',gap:0,marginBottom:12,borderBottom:'1px solid var(--line)'}}>
        {[
          { k:'merchant', l:'已创建代理', icon:'building' },
          { k:'applied',  l:'自行申请代理', icon:'user', alert: pendingAppCount },
        ].map(s => (
          <div key={s.k} onClick={()=>setSource(s.k)} style={{
            padding:'10px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,
            borderBottom: source===s.k ? '2px solid var(--brand)' : '2px solid transparent',
            color: source===s.k ? 'var(--brand)' : 'var(--text-2)',
            fontWeight: source===s.k ? 600 : 500, fontSize:13, marginBottom:-1,
          }}>
            <Icon name={s.icon} size={14}/>
            <span>{s.l}</span>
            {s.alert > 0 && <span style={{
              padding:'1px 6px',borderRadius:10,background:'#ef4444',color:'#fff',
              fontSize:10,fontWeight:600
            }}>{s.alert}待处理</span>}
          </div>
        ))}
      </div>

      {source === 'merchant' && (
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <span style={{flex:1}}/>
          <button className="btn ghost" onClick={()=>setShowHelp(true)}><Icon name="info" size={13}/>说明</button>
        </div>
      )}

      {source === 'applied' && (
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <button className="btn primary" onClick={()=>setShowTplConfig(true)}><Icon name="settings" size={13}/>全局配置</button>
          <span style={{flex:1}}/>
          <button className="btn ghost" onClick={()=>setShowHelp(true)}><Icon name="info" size={13}/>说明</button>
        </div>
      )}
      {source === 'applied' && <SelfApplicationsList toast={toast} tpls={tpls} onCreateAgent={(app, form) => {
        const aType = form.type === 'individual' ? '个人代理' : form.type === 'team' ? '团队代理' : '总代理';
        const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
        // v3.0.41 根据申请渠道区分创建方式
        const ch = app._channel || 'frontend';
        const createWayLabel = ch === 'agentportal' ? '代理后台自行申请' : '用户自行申请';
        // v2.4.35 将申请单上的 _logs 继承到新代理,后接上「创建账户」日志
        const inheritedLogs = (app._logs || []).slice();
        inheritedLogs.push({ at: nowStr, by: '商户:管理员-randy', type: 'create' });
        const newAgent = {
          id: app.id,
          name: app.name,
          parent: form.parent || null,
          // v2.4.16 新创建代理默认为未启用,待首次登入成功后自动改为已启用
          status: 'pending',
          tier: form.type === 'individual' ? 'normal' : form.type === 'team' ? 'general' : 'super',
          // v2.4.20 烘入创建方式 / 代理类型标签 / displayId
          _aType: aType,
          _createWay: createWayLabel,
          _channel: ch,
          _displayId: app.id,
          _logs: inheritedLogs,
          level: 1,
          players: 0,
          created: new Date().toISOString(),
          risk: 'low',
          _displayId: app.id,
          _createWay: createWayLabel,
          // v2.4.47 烘入分润模式 + 权限,使「查看&配置 → 分润模式 / 权限配置」能正确显示
          _comm: form.commission || { kind:'weekly', weekday:1, monthday:1, plans:[''] },
          _perms: form.perms,
          // v3.1.62 流量来源 / 收款方式 — 按图1 5 字段持久化
          // v3.1.84 优先用 form 里(管理员补填的),空时回落到 app._formSnapshot(用户注册时填的)
          _traffic: (() => {
            const fromForm = (form.trafficUrls || []).filter(Boolean);
            if (fromForm.length) return fromForm;
            return (app._formSnapshot?.trafficUrls || []).filter(Boolean);
          })(),
          _payment: (() => {
            const f = form.payment || {};
            const snap = app._formSnapshot || {};
            return {
              method:   'UPI',
              ifsc:     f.ifsc     || snap.ifsc     || '',
              account:  f.account  || snap.account  || snap.upiId  || '',
              realName: f.realName || snap.realName || snap.holder || '',
              email:    f.email    || snap.payEmail || '',
            };
          })(),
          _appData: {
            userId: app.userId || 'P34157319',
            reason: app.reason || '',
            channels: app.channels || '',
            note: form.note || '',
            loginName: form.loginName,
            contacts: form.contacts,
            // v3.1.84 trafficUrls 也存进 _formSnapshot,后续 AgentDetail 的 fallback 能读到
            appliedAt: app.createdAt || '2026-05-11 23:59:59',
            history: app.history || [],
            // v3.0.59 把申请时的 _formSnapshot 也带过来,供 AgentDetail 的 联系方式 / 流量来源 / 收款方式 读取
            _formSnapshot: {
              ...(app._formSnapshot || {}),
              trafficUrls: (form.trafficUrls || []).filter(Boolean).length
                ? form.trafficUrls.filter(Boolean)
                : (app._formSnapshot?.trafficUrls || []),
              ifsc:     form.payment?.ifsc     || app._formSnapshot?.ifsc     || '',
              account:  form.payment?.account  || app._formSnapshot?.account  || '',
              realName: form.payment?.realName || app._formSnapshot?.realName || '',
              payEmail: form.payment?.email    || app._formSnapshot?.payEmail || '',
            },
          },
        };
        setAgents([newAgent, ...agents]);
        // v2.3.28 推送到专业代理后台登录账户存储
        if (window.APS_AGENT_ACCOUNTS && form.loginName && form.password) {
          window.APS_AGENT_ACCOUNTS.add({
            agentId: app.id,
            userId: app.userId || 'P34157319',
            name: app.name,
            loginName: form.loginName,
            password: form.password,
            tier: newAgent.tier,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          });
        }
      }}/>}

      {source === 'merchant' && (
      <div className="card">
        <ATAB value={tab} onChange={setTab} tabs={[
          { key:'all', label:'全部状态', count: counts.all },
          { key:'active', label:'已启用', count: counts.active },
          { key:'pending', label:'未启用', count: counts.pending },
          { key:'frozen', label:'已冻结', count: counts.frozen },
          { key:'suspended', label:'已停用', count: counts.suspended },
        ]}/>
        <div className="toolbar">
          <ASI value={q} onChange={setQ} placeholder="代理ID / 名称 / 联系方式" width={260}/>
          <select className="filter-select" value={createWay} onChange={e=>setCreateWay(e.target.value)}>
            <option value="all">全部代理创建方式</option>
            <option value="merchant">商户创建代理</option>
            <option value="applied">用户 / 代理后台自行申请</option>
          </select>
          <select className="filter-select" value={tier} onChange={e=>setTier(e.target.value)}>
            <option value="all">全部等级</option>
            {D.AGENT_LEVELS.map(t => <option key={t} value={t}>{D.LABELS.tiers[t] || t}</option>)}
          </select>
          <span style={{flex:1}}/>
          {selected.size > 0 && (
            <>
              <span style={{fontSize:12,color:'var(--text-2)'}}>已选 {selected.size} 项</span>
              <button className="btn sm">批量启用</button>
              <button className="btn sm">批量冻结</button>
              <button className="btn sm danger">批量停用</button>
            </>
          )}
          <button className="btn sm ghost icon-only"><Icon name="settings" size={14}/></button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl agents-tbl">
            <thead>
              <tr>
                <th style={{width:36}}><CheckBox on={selected.size===paged.length && paged.length>0} onChange={()=>{
                  setSelected(selected.size===paged.length ? new Set() : new Set(paged.map(p=>p.id)));
                }}/></th>
                <th>代理创建方式</th>
                <th>代理ID</th>
                <th>代理名称</th>
                <th>上级代理ID-名称</th>
                <th>代理等级</th>
                <th className="right">玩家数</th>
                <th>账户状态</th>
                <th>更新时间</th>
                <th>创建时间</th>
                <th style={{minWidth:120}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a,i) => {
                // v2.4.20 使用烘在 agent 上的属性,不再依赖 index(防止新增代理后错位)
                const isApplied = a._createWay !== '商户创建代理';
                const createWay = a._createWay || '商户创建代理';
                const aType = a._aType || (a.tier === 'normal' ? '个人代理' : a.tier === 'general' ? '团队代理' : a.tier === 'super' ? '总代理' : '个人代理');
                const displayId = a._displayId || a.id;
                const parentLabel = a.parent ? a.parent + '-' + (D.agents.find(x=>x.id===a.parent)?.name || 'Agent') : 'AG000000-本商户';
                const statusMap = { active:'已启用', pending:'未启用', frozen:'已冻结', suspended:'已停用' };
                const statusLabel = statusMap[a.status] || a.status;
                const statusCls = { active:'st-active', pending:'st-pending', frozen:'st-frozen', suspended:'st-suspended' }[a.status] || '';
                const updated = new Date(a.created); updated.setDate(updated.getDate() + 7);
                const fmtDT = (d) => d.toISOString().slice(0,10).replace(/-/g,'-') + ' ' + d.toTimeString().slice(0,8);
                return (
                  <tr key={a.id} className={selected.has(a.id)?'selected':''}>
                    <td onClick={e=>e.stopPropagation()}><CheckBox on={selected.has(a.id)} onChange={()=>toggleSel(a.id)}/></td>
                    <td>{createWay}</td>
                    <td className="text-mono" style={{color:'var(--text-0)'}}>{displayId}</td>
                    <td onClick={()=>setDetail(a)} style={{cursor:'pointer',color:'var(--text-0)',fontWeight:500}}>{a.name}</td>
                    <td className="text-mono" style={{fontSize:12}}>{parentLabel}</td>
                    <td className="text-mono center">LV-{a.level}</td>
                    <td className="right">{F.fmtNum(a.players)}</td>
                    <td><span className={'status-pill ' + statusCls}>{statusLabel}</span></td>
                    <td className="text-mute" style={{fontSize:11,fontFamily:'JetBrains Mono'}}>{fmtDT(updated)}</td>
                    <td className="text-mute" style={{fontSize:11,fontFamily:'JetBrains Mono'}}>{fmtDT(new Date(a.created))}</td>
                    <td>
                      <div className="op-links">
                        <a onClick={()=>setDetail(a)}>查看&配置</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <APG page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>
      )}

      {/* v3.0.71 删除商户主动创建专业代理 CreateAgentModal — 仅保留自行申请审核通过流程触发的 CreateAgentModal */}

      <ADR open={!!detail} onClose={()=>setDetail(null)} hideHeader={true}>
        {detail && <AgentDetail agent={detail} onClose={()=>setDetail(null)}/>}
      </ADR>

      <TplConfigModal
        open={showTplConfig}
        tpls={tpls}
        onClose={()=>setShowTplConfig(false)}
        onSave={(next)=>{ setTpls(next); setShowTplConfig(false); toast('模板已更新'); }}
        onReset={()=>{ setTpls(DEFAULT_TPLS); toast('已恢复默认模板'); }}
      />

      <HelpModal open={showHelp} onClose={()=>setShowHelp(false)} source={source}/>
    </div>
  );
}

function CreateAgentModal({ open, onClose, onSubmit, prefill }) {
  const isApplied = !!prefill;
  const [form, setForm] = React.useState({
    name: '', loginName: '', password: '', type: 'Direct',
    parent: '', remark: '',
    // v2.4.43 分潤模式 重做:結算/分潤時間 + 分潤方案類型(多选)
    // v3.1.79 init 时带入 minCommission/maxCommission 默认值,与 CommissionModeForm 显示一致,避免误报「必填」
    commission: { kind:'weekly', weekday:1, monthday:1, plans:[''], minCommission: 200, maxCommission: 1000000 },
    contacts: [{type:'Email',value:''},{type:'手机',value:'',dial:'+91'}],
    // v3.1.62 第 4 步 流量/收款 — 按图1 字段重做
    trafficUrls: [''],
    payment: { method: 'UPI', ifsc: '', account: '', realName: '', email: '' },
    // v3.1.60 权限重做(图1):运营 + 报表 两组开关 + 可创建邀请Code上限数量
    perms: {
      myAccount: true,
      codeManage: true,
      codeLimit: '',
      reportCode: true,
      reportPlayer: true,
      reportRevshare: true,
    },
  });
  // 自行申请代理:打开时用申请资料预填
  React.useEffect(() => {
    if (open && prefill) {
      setForm(f => ({
        ...f,
        name: prefill.name || '',
        type: prefill.tier === 'normal' ? 'individual' : prefill.tier === 'general' ? 'team' : prefill.tier === 'super' ? 'super' : 'individual',
        parent: prefill.parentId || '',
        remark: prefill.reason || '',
        // v3.0.40 专业代理后台注册时已填的 loginName / password 预填进表单(管理员可改可直接通过)
        loginName: prefill.loginName || f.loginName || '',
        password: prefill.password || f.password || '',
        // v3.0.57 联系方式优先用注册时的 _formSnapshot.contacts;否则用 contact 字段重建;再否则用默认占位
        contacts: (() => {
          const snap = prefill._formSnapshot?.contacts;
          if (snap && snap.length) return snap.map(c => ({
            type: c.type === 'Mobile' ? '手机' : c.type,
            value: c.value || '',
            ...(c.dial ? { dial: c.dial } : {}),
          }));
          const contact = String(prefill.contact || '');
          if (contact) {
            const isEmail = /@/.test(contact);
            return isEmail
              ? [{type:'Email', value:contact}, {type:'手机', value:'', dial:'+91'}]
              : [{type:'Email', value:''}, {type:'手机', value:contact.replace(/^\+?\d{1,3}\s*/, ''), dial:'+91'}];
          }
          return [
            {type:'Email', value:''},
            {type:'手机', value:'', dial:'+91'},
          ];
        })(),
        // v3.1.78 流量/收款 — 用户在专业代理后台注册时未填,审核时显示空(让管理员填)
        // v3.1.80 收款方式的 Email 是用户银行账户的 email,与 联系方式的 Email 不同,不再 fallback 到 contacts.Email
        trafficUrls: (() => {
          const t = prefill._formSnapshot?.trafficUrls;
          if (t && t.length) return [...t];
          return [''];
        })(),
        payment: {
          method: 'UPI',
          ifsc:     prefill._formSnapshot?.ifsc     || '',
          account:  prefill._formSnapshot?.account  || prefill._formSnapshot?.upiId  || '',
          realName: prefill._formSnapshot?.realName || prefill._formSnapshot?.holder || '',
          email:    prefill._formSnapshot?.payEmail || '',
        },
      }));
      setStep(1);
    }
  }, [open, prefill]);
  const [errors, setErrors] = React.useState({});
  const [step, setStep] = React.useState(1);
  const D = window.APS_DATA;
  const CONTACT_TYPES = ['Email','手机','Telegram','WhatsApp'];
  const CONTACT_PH = { 'Email':'如:123@gmail.com', '手机':'98xxx xxxxx', 'Telegram':'@telegram_id', 'WhatsApp':'98xxx xxxxx' };
  const COUNTRY_CODES = [
    {code:'+91',  name:'印度'},
    {code:'+880', name:'孟加拉'},
    {code:'+977', name:'尼泊尔'},
    {code:'+94',  name:'斯里兰卡'},
    {code:'+92',  name:'巴基斯坦'},
    {code:'+62',  name:'印尼'},
    {code:'+63',  name:'菲律宾'},
    {code:'+66',  name:'泰国'},
    {code:'+84',  name:'越南'},
    {code:'+86',  name:'中国'},
    {code:'+852', name:'香港'},
    {code:'+886', name:'台湾'},
    {code:'+1',   name:'美加'},
    {code:'+44',  name:'英国'},
    {code:'+55',  name:'巴西'},
    {code:'+52',  name:'墨西哥'},
  ];

  // v3.1.78 每步必填校验  v3.1.79 报错 inline 渲染,不再用顶部 banner
  // v3.1.82 Step 2 分润方案 / Step 3 codeLimit / Step 4 流量收款 全部改为非必填
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name) e.name = '代理名称必填';
      if (!form.loginName) e.loginName = '登录账号必填';
      if (form.loginName && form.loginName.length < 4) e.loginName = '至少 4 个字符';
      if (!form.password) e.password = '密码必填';
      if (form.password && form.password.length < 8) e.password = '至少 8 位';
      if (!form.contacts[0]?.value || !form.contacts[1]?.value) e.contacts = '至少填写前两项联系方式';
    } else if (s === 2) {
      const minComm = form.commission?.minCommission;
      if (minComm === '' || minComm == null) e.minCommission = '最低結算佣金金額必填';
      const maxComm = form.commission?.maxCommission;
      if (maxComm === '' || maxComm == null) e.maxCommission = '最高結算佣金上限必填';
      const plan = form.commission?.plans?.[0];
      if (!plan) e.plan = '請選擇分潤方案';
    } else if (s === 3) {
      if (form.perms?.codeManage) {
        const limit = form.perms?.codeLimit;
        if (limit === '' || limit == null || Number(limit) < 1) e.codeLimit = '可創建邀請Code上限數量必填';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  // 兼容旧调用名(本文件其他地方仍可能调用 validate())
  const validate = () => validateStep(1);

  // v3.1.82 表单数据变化时,自动重新校验当前 step,清除已修正字段的错误
  React.useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    // 静默校验:只更新当前 step 的错误,不显示新错误(只清除)
    const next = { ...errors };
    let changed = false;
    const check = (key, isInvalid) => {
      if (key in next && !isInvalid) { delete next[key]; changed = true; }
    };
    if (step === 1) {
      check('name', !form.name);
      check('loginName', !form.loginName || (form.loginName && form.loginName.length < 4));
      check('password', !form.password || (form.password && form.password.length < 8));
      check('contacts', !form.contacts[0]?.value || !form.contacts[1]?.value);
    } else if (step === 2) {
      const plan = form.commission?.plans?.[0];
      check('plan', !plan);
      const mn = form.commission?.minCommission;
      check('minCommission', mn === '' || mn == null);
      const mx = form.commission?.maxCommission;
      check('maxCommission', mx === '' || mx == null);
    } else if (step === 3) {
      if (form.perms?.codeManage) {
        const limit = form.perms?.codeLimit;
        check('codeLimit', limit === '' || limit == null || Number(limit) < 1);
      } else {
        check('codeLimit', false);
      }
    } else if (step === 4) {
      const traf = (form.trafficUrls || []).filter(Boolean);
      check('trafficUrls', traf.length === 0);
      check('pay_account', !form.payment?.account);
      check('pay_ifsc', !form.payment?.ifsc);
      check('pay_email', !form.payment?.email);
      check('pay_realName', !form.payment?.realName);
    }
    if (changed) setErrors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, step]);

  const next = () => {
    if (!validateStep(step)) return;
    setStep(step + 1);
  };
  const submit = () => {
    if (!validateStep(4)) return;
    onSubmit(form);
  };

  const updateContact = (idx, key, val) => {
    const next = [...form.contacts];
    const isPhoneNew = val === '手机' || val === 'WhatsApp';
    next[idx] = {
      ...next[idx],
      [key]: val,
      ...(key==='type' ? {value:'', dial: isPhoneNew ? (next[idx].dial || '+91') : undefined} : {})
    };
    setForm({...form, contacts: next});
  };
  const addContact = () => setForm({...form, contacts: [...form.contacts, {type:'',value:''}]});
  const removeContact = (idx) => setForm({...form, contacts: form.contacts.filter((_,i)=>i!==idx)});
  const togglePerm = (k) => setForm({...form, perms: {...form.perms, [k]: !form.perms[k]}});

  if (!open) return null;
  return (
    <AM open={open} onClose={onClose} size="lg"
      title="创建专业代理账户"
      subtitle="为合作伙伴创建独立代理账号，配置层级、分润与权限"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        {step > 1 && <button className="btn" onClick={()=>setStep(step-1)}><Icon name="chevronLeft" size={12}/> 上一步</button>}
        {step < 4 && <button className="btn primary" onClick={next}>下一步：{step===1?'分润模式':step===2?'权限配置':'流量/收款'} <Icon name="chevronRight" size={12}/></button>}
        {step === 4 && <button className="btn primary" onClick={submit}><Icon name="check" size={13}/> 创建代理账户</button>}
      </>}>

      {/* 步骤指示器 4 步 */}
      <div style={{display:'flex',alignItems:'center',marginBottom:22,padding:'0 10px'}}>
        {[
          {n:1,l:'基本资料'},{n:2,l:'分润模式'},{n:3,l:'权限配置'},{n:4,l:'流量/收款'},
        ].map((s,i,a) => (
          <React.Fragment key={s.n}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,minWidth:80}}>
              <div style={{
                width:30,height:30,borderRadius:'50%',
                background: step>=s.n?'var(--brand)':'#e5e7eb',
                color: step>=s.n?'#fff':'#94a3b8',
                display:'grid',placeItems:'center',fontSize:13,fontWeight:600
              }}>{step>s.n ? '✓' : s.n}</div>
              <span style={{fontSize:12.5,color: step>=s.n?'var(--brand)':'var(--text-3)',fontWeight:500}}>{s.l}</span>
            </div>
            {i < a.length - 1 && <div style={{flex:1,height:2,background: step>s.n?'var(--brand)':'#e5e7eb',marginTop:-22}}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="form-grid">
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理创建方式 <span style={{color:'var(--danger)'}}>*</span></label>
            <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center'}}>{isApplied ? '代理自行创建' : '商户创建代理'}</div>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理名称 <span style={{color:'var(--danger)'}}>*</span></label>
            {isApplied ? (
              <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center'}}>{form.name}</div>
            ) : <>
              <input className={'input ' + (errors.name?'error':'')} placeholder="如: TopMedia LATAM" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              {errors.name && <div className="field-error">{errors.name}</div>}
            </>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>登录账号 <span style={{color:'var(--danger)'}}>*</span></label>
            {isApplied ? (
              <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center',fontFamily:'JetBrains Mono'}}>{form.loginName || '—'}</div>
            ) : <>
              <input className={'input ' + (errors.loginName?'error':'')} placeholder="如: AGlatam" value={form.loginName} onChange={e=>setForm({...form,loginName:e.target.value})}/>
              {errors.loginName && <div className="field-error">{errors.loginName}</div>}
            </>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>初始密码 <span style={{color:'var(--danger)'}}>*</span></label>
            {isApplied ? (
              <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center',fontFamily:'JetBrains Mono',letterSpacing:'0.1em'}}>{form.password ? '••••••••' : '—'}</div>
            ) : <>
              <input className={'input ' + (errors.password?'error':'')} type="password" placeholder="至少 8 位" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </>}
          </div>
          {!isApplied && <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理类型 <span style={{color:'var(--danger)'}}>*</span></label>
            <select className="select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="">请选择 …</option>
              <option value="individual">个人代理</option>
              <option value="team">团队代理</option>
              <option value="super">总代理</option>
            </select>
          </div>}
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{isApplied?'上级代理':'上级代理ID-名称'} <span style={{color:'var(--danger)'}}>*</span></label>
            <select className="select" value={form.parent} onChange={e=>setForm({...form,parent:e.target.value})}>
              <option value="">无 (默认AG000000-本商户)</option>
              {D.agents.slice(0,12).map(a => <option key={a.id} value={a.id}>{a.id}-{a.name}</option>)}
            </select>
          </div>
          {isApplied && <>
            <div>
              <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理ID</label>
              <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center',fontFamily:'JetBrains Mono'}}>{prefill.id}</div>
            </div>
          </>}

          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>联系方式 <span style={{color:'var(--danger)'}}>*</span></label>
            <div className="contact-list">
              <div className="contact-row contact-head">
                <div className="contact-cell-type">联系类型<span style={{color:'var(--danger)'}}>*</span></div>
                <div className="contact-cell-val">联系资料<span style={{color:'var(--danger)'}}>*</span></div>
                <div className="contact-cell-act"/>
              </div>
              {form.contacts.map((c,idx) => {
                const locked = idx < 2;
                const isPhone = c.type === '手机' || c.type === 'WhatsApp';
                return (
                  <div key={idx} className="contact-row">
                    <div className="contact-cell-type">
                      {locked ? (
                        <div className="contact-type-locked">{c.type}</div>
                      ) : (
                        <select className="select" value={c.type} onChange={e=>updateContact(idx,'type',e.target.value)}>
                          <option value="">请选择 …</option>
                          {CONTACT_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="contact-cell-val">
                      {isPhone ? (
                        <div className="contact-phone-input" style={{display:'flex',alignItems:'stretch',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',background:'#fff'}}>
                          <span className="contact-phone-dial" style={{display:'inline-flex',alignItems:'center',padding:'0 12px',background:'#f8fafc',borderRight:'1px solid var(--line)',color:'var(--text-1)',fontFamily:'JetBrains Mono',fontSize:13,flexShrink:0}}>+91</span>
                          <input className="input" placeholder={CONTACT_PH[c.type]||''} value={c.value} onChange={e=>updateContact(idx,'value',e.target.value)} style={{flex:1,border:'none',borderRadius:0,minWidth:0}}/>
                        </div>
                      ) : (
                        <input className="input" placeholder={CONTACT_PH[c.type]||'请输入'} value={c.value} onChange={e=>updateContact(idx,'value',e.target.value)}/>
                      )}
                    </div>
                    <div className="contact-cell-act">
                      {!locked && <button type="button" className="contact-remove" title="移除" onClick={()=>removeContact(idx)}>−</button>}
                    </div>
                  </div>
                );
              })}
              <button type="button" className="contact-add-btn" onClick={addContact}>+ 新增联系方式</button>
            </div>
            {errors.contacts && <div className="field-error">{errors.contacts}</div>}
          </div>

          {/* v3.0.51 删除「申请理由 / 推广渠道说明」section — 用户已要求从复核弹窗里移除 */}

          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>备注(选填)</label>
            <textarea className="textarea" rows={3} placeholder={isApplied ? '填写备注讯息' : '· 代理来源、对接人 …\n· 例:Telegram 5w 粉丝群、Youtube、Tiktok 5w 关注、本地板球论坛 …\n· 描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式 …'} value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})}/>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{padding:'4px 4px 10px'}}>
          <window.CommissionModeForm
            value={form.commission}
            onChange={c=>setForm({...form, commission:c})}
            errors={errors}
            onJumpPlanMgr={() => {
              if (typeof window.goRoute === 'function') { onClose(); window.goRoute('mod:revshare'); }
            }}/>
        </div>
      )}

      {step === 3 && (
        <div style={{padding:'4px 4px 10px'}}>
          <window.AgentPermsForm
            value={form.perms}
            onChange={p => {
              setForm({...form, perms: p});
              // v3.1.82 清除已满足的错误
              setErrors(prev => {
                if (!prev) return prev;
                const next = {...prev};
                if (!p.codeManage || (p.codeLimit !== '' && p.codeLimit != null && Number(p.codeLimit) >= 1)) {
                  delete next.codeLimit;
                }
                return next;
              });
            }}
            errors={errors}/>
        </div>
      )}

      {step === 4 && (
        <div style={{padding:'4px 4px 10px'}}>
          {/* —— 流量来源链接 —— */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13, color:'var(--text-0)', fontWeight:500, marginBottom:8}}>流量來源鏈接<span style={{color:'var(--text-3)',fontWeight:400,marginLeft:6,fontSize:12}}>(選填)</span></div>
            {(form.trafficUrls || ['']).map((u, i) => (
              <div key={i} style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                <input
                  className="input"
                  style={{flex:1, fontFamily:'JetBrains Mono'}}
                  placeholder="https://agentp0.netlify.app/"
                  value={u}
                  onChange={e => {
                    const next = [...form.trafficUrls];
                    next[i] = e.target.value;
                    setForm({...form, trafficUrls: next});
                  }}
                />
                {form.trafficUrls.length > 1 && (
                  <button type="button" className="contact-remove" onClick={() => {
                    setForm({...form, trafficUrls: form.trafficUrls.filter((_,j) => j !== i)});
                  }}>−</button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm({...form, trafficUrls: [...(form.trafficUrls || []), '']})}
              style={{
                width:'100%', padding:'10px', marginTop:4,
                background:'#f0f7ff', border:'1px dashed #93c5fd',
                borderRadius:6, color:'#2563eb', fontSize:12.5, fontWeight:500,
                cursor:'pointer',
              }}
            >+新增流量來源鏈接</button>
          </div>

          {/* —— 收款方式 2x3 grid —— */}
          <div className="form-grid">
            <div>
              <label className="text-soft" style={{fontSize:12, display:'block', marginBottom:6}}>收款方式</label>
              <div style={{
                padding:'8px 12px', background:'#f8fafc',
                border:'1px solid var(--line)', borderRadius:6,
                fontSize:13, color:'var(--text-1)',
                height:36, display:'flex', alignItems:'center',
              }}>UPI</div>
            </div>
            <div></div>
            <div>
              <label className="text-soft" style={{fontSize:12, display:'block', marginBottom:6}}>Account</label>
              <input
                className="input"
                placeholder="請輸入"
                value={form.payment.account || ''}
                onChange={e => setForm({...form, payment: {...form.payment, account: e.target.value}})}
                style={{fontFamily:'JetBrains Mono'}}
              />
            </div>
            <div>
              <label className="text-soft" style={{fontSize:12, display:'block', marginBottom:6}}>IFSC</label>
              <input
                className="input"
                placeholder="請輸入"
                value={form.payment.ifsc || ''}
                onChange={e => setForm({...form, payment: {...form.payment, ifsc: e.target.value}})}
                style={{fontFamily:'JetBrains Mono'}}
              />
            </div>
            <div>
              <label className="text-soft" style={{fontSize:12, display:'block', marginBottom:6}}>Email</label>
              <input
                className="input"
                placeholder="請輸入"
                value={form.payment.email || ''}
                onChange={e => setForm({...form, payment: {...form.payment, email: e.target.value}})}
                style={{fontFamily:'JetBrains Mono'}}
              />
            </div>
            <div>
              <label className="text-soft" style={{fontSize:12, display:'block', marginBottom:6}}>Real Name</label>
              <input
                className="input"
                placeholder="請輸入"
                value={form.payment.realName || ''}
                onChange={e => setForm({...form, payment: {...form.payment, realName: e.target.value}})}
              />
            </div>
          </div>
        </div>
      )}
    </AM>
  );
}

function AgentDetail({ agent, onClose }) {
  const [tab, setTab] = React.useState('basic');
  // v2.4.37 编辑模式 + 表单 draft(覆盖三个 tab 的可编辑字段)
  const [editing, setEditing] = React.useState(false);
  // v2.4.43 commission 存为对象 {kind, weekday, monthday, plans} — 旧字符串数据迁移为默认对象
  const _defaultComm = { kind:'weekly', weekday:1, monthday:1, plans:[''] };
  const _normComm = (c) => (c && typeof c === 'object') ? { ..._defaultComm, ...c, plans: c.plans && c.plans.length ? c.plans : [''] } : _defaultComm;
  const [comm, setComm] = React.useState(_normComm(agent._comm));
  const [perms, setPerms] = React.useState(agent._perms || {
    myAccount: true, codeManage: true, codeLimit: '',
    reportCode: true, reportPlayer: true, reportRevshare: true,
  });
  const [name, setName] = React.useState(agent.name);
  const [loginName, setLoginName] = React.useState(agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent');
  const [note, setNote] = React.useState(agent.note || '');
  // v3.0.15 流量来源 + 收款方式
  // v3.1.84 移除默认 youtube/t.me 假数据 — 没数据时返回 [''] 一行空 input
  const _defaultTraffic = () => {
    if (agent._traffic && agent._traffic.length) return [...agent._traffic];
    const snapTraffic = agent._appData?._formSnapshot?.trafficUrls;
    if (snapTraffic && snapTraffic.length) {
      const cleaned = snapTraffic.filter(Boolean);
      if (cleaned.length) return cleaned;
    }
    return [''];
  };
  // v3.1.67 收款方式 5 字段(method/ifsc/account/realName/email);兼容旧 _payment.upiId/holder
  // v3.1.80 email 仅用支付邮箱(payEmail),不再 fallback 到联系方式的 Email
  const _defaultPayment = () => {
    const old = agent._payment || {};
    const snap = agent._appData?._formSnapshot || {};
    return {
      method:   old.method   || 'UPI',
      ifsc:     old.ifsc     || snap.ifsc     || '',
      account:  old.account  || snap.account  || old.upiId  || snap.upiId  || '',
      realName: old.realName || snap.realName || old.holder || snap.holder || '',
      email:    old.email    || snap.payEmail || '',
    };
  };
  const [traffic, setTraffic] = React.useState(_defaultTraffic());
  const [payment, setPayment] = React.useState(_defaultPayment());
  React.useEffect(() => {
    setName(agent.name);
    setLoginName(agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent');
    setNote(agent.note || '');
    setComm(_normComm(agent._comm));
    setPerms(agent._perms || {
      myAccount: true, codeManage: true, codeLimit: '',
      reportCode: true, reportPlayer: true, reportRevshare: true,
    });
    setEditing(false);
  }, [agent.id]);
  // v2.4.23 帐户状态本地副本(用于按钮即时反馈),同时写回全局 store
  const [status, setStatus] = React.useState(agent.status);
  React.useEffect(() => setStatus(agent.status), [agent.id, agent.status]);
  const toast = AUT();
  const updateStatus = (next, msg) => {
    setStatus(next);
    // v2.4.35 计算 op type 用于日志
    const opTypeMap = { frozen:'freeze', active: status==='frozen' ? 'unfreeze' : 'login', suspended:'suspend' };
    const opType = opTypeMap[next] || 'edit';
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    const newLog = { at: nowStr, by: '商户:管理员-randy', type: opType };
    if (window.APS_MERCHANT_AGENTS_STORE) {
      window.APS_MERCHANT_AGENTS_STORE.setList(list =>
        list.map(x => x.id === agent.id ? { ...x, status: next, _logs: [...(x._logs || []), newLog] } : x)
      );
    }
    if (msg) toast(msg);
  };
  // v2.4.31 状态操作确认弹窗(替换 window.confirm)
  const [confirmAction, setConfirmAction] = React.useState(null);
  const ACTION_META = {
    freeze:   { title:'冻结帐户', subtitle:'冻结后该代理登入与佣金提款将被暂时冻结,可解冻恢复',         cta:'确认 冻结帐户', btnStyle:{background:'#2563eb',borderColor:'#2563eb',color:'#fff'}, accent:'#2563eb', to:'frozen',    toastMsg:'已冻结' },
    unfreeze: { title:'再次启用', subtitle:'启用后该代理可重新登入与产生新佣金',                          cta:'确认 再次启用', btnStyle:{background:'#16a34a',borderColor:'#16a34a',color:'#fff'}, accent:'#16a34a', to:'active',    toastMsg:'已再次启用' },
    suspend:  { title:'停用帐户', subtitle:'停用后账户不可登入与产生新佣金,该操作不可撤销',              cta:'确认 停用帐户', btnStyle:{background:'#dc2626',borderColor:'#dc2626',color:'#fff'}, accent:'#dc2626', to:'suspended', toastMsg:'已停用' },
  };
  const [perms_unused, setPerms_unused] = React.useState({});
  // v2.4.37 保存编辑 + 取消
  const saveEdit = () => {
    const labels = { basic:'基本资料', commission:'分润模式', perms:'权限配置', traffic:'流量来源', payment:'收款方式' };
    const sectionLabel = labels[tab] || tab;
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    const log = { at: nowStr, by: '商户:管理员-randy', type: 'edit', note: '编辑:' + sectionLabel };
    if (window.APS_MERCHANT_AGENTS_STORE) {
      window.APS_MERCHANT_AGENTS_STORE.setList(list =>
        list.map(x => {
          if (x.id !== agent.id) return x;
          const next = { ...x, _logs: [...(x._logs || []), log] };
          if (tab === 'basic') {
            next.name = name;
            next.note = note;
            next._appData = { ...(x._appData || {}), loginName };
          } else if (tab === 'commission') {
            next._comm = comm;
          } else if (tab === 'perms') {
            next._perms = { ...perms };
          } else if (tab === 'traffic') {
            next._traffic = [...traffic];
          } else if (tab === 'payment') {
            next._payment = { ...payment };
          }
          return next;
        })
      );
    }
    toast(`${name} · ${sectionLabel} 已更新`);
    setEditing(false);
  };
  const cancelEdit = () => {
    setName(agent.name);
    setLoginName(agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent');
    setNote(agent.note || '');
    setComm(_normComm(agent._comm));
    setPerms(agent._perms || {
      myAccount: true, codeManage: true, codeLimit: '',
      reportCode: true, reportPlayer: true, reportRevshare: true,
    });
    setTraffic(_defaultTraffic());
    setPayment(_defaultPayment());
    setEditing(false);
  };
  const D = window.APS_DATA;
  const statusMap = { active:'已启用', pending:'未启用', frozen:'已冻结', suspended:'已停用' };
  const statusCls = { active:'st-active', pending:'st-pending', frozen:'st-frozen', suspended:'st-suspended' };
  const parentLabel = agent.parent ? agent.parent + '-' + (D.agents.find(x=>x.id===agent.parent)?.name || 'Agent') : 'AG000000-本商户';
  const displayId = agent._displayId || agent.id;
  // v3.1.35 P0 简化版:整個系統只剩 AC,头像统一显示 AC + 黄色
  const createWay = agent._createWay || '代理后台自行申请';
  const isApplied = true;
  const avatarText = 'AC';
  const avatarBg = '#f59e0b';
  const fmtDT = (d) => {
    const x = new Date(d);
    return x.toISOString().slice(0,10) + ' ' + x.toTimeString().slice(0,8);
  };

  return (
    <div className="agent-detail">
      {/* 顶部头部 */}
      <div className="agent-detail-head">
        <div style={{display:'flex',gap:14,alignItems:'center',flex:1}}>
          <div className="agent-detail-avatar" style={{background:avatarBg}}>{avatarText}</div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <span style={{fontSize:20,color:'var(--text-0)',fontWeight:600,lineHeight:1.2}}>{agent.name}</span>
            <span style={{fontSize:14,color:'var(--text-2)',fontFamily:'JetBrains Mono',lineHeight:1.2}}>{displayId}</span>
          </div>
        </div>
        <button className="close" onClick={onClose}><Icon name="x" size={16}/></button>
      </div>

      {/* Tabs */}
      <div className="agent-detail-tabs">
        {[
          {k:'basic',l:'基本资料'},
          {k:'commission',l:'分润模式'},
          {k:'perms',l:'权限配置'},
          {k:'traffic',l:'流量来源'},
          {k:'payment',l:'收款方式'},
          {k:'logs',l:'操作记录'},
        ].map(t => (
          <div key={t.k} className={'ad-tab ' + (tab===t.k?'active':'')} onClick={()=>setTab(t.k)}>{t.l}</div>
        ))}
      </div>

      {/* Body */}
      <div className="agent-detail-body">
        {tab === 'basic' && (
          <div>
            <div className="ad-section-title">基本资料</div>
            <div className="ad-info-card">
              <div className="ad-info-grid" style={{gridTemplateColumns:'1fr'}}>
                <div><span className="ad-k">代理创建方式:</span><span className="ad-v">{createWay}</span></div>
                <div><span className="ad-k">代理ID:</span><span className="ad-v text-mono">{displayId}</span></div>
                <div><span className="ad-k">代理名称:</span>
                  {editing
                    ? <input className="input sm" value={name} onChange={e=>setName(e.target.value)} style={{height:24,fontSize:13,padding:'2px 8px',width:'70%'}}/>
                    : <span className="ad-v">{name}</span>}</div>
                <div><span className="ad-k">登入帐号:</span>
                  {editing
                    ? <input className="input sm" value={loginName} onChange={e=>setLoginName(e.target.value)} style={{height:24,fontSize:13,padding:'2px 8px',width:'70%',fontFamily:'JetBrains Mono'}}/>
                    : <span className="ad-v text-mono">{loginName}</span>}</div>
                <div><span className="ad-k">登入密码:</span><span className="ad-v text-mono">********</span></div>
                <div><span className="ad-k">上级代理:</span><span className="ad-v text-mono">{parentLabel}</span></div>
                <div><span className="ad-k">创建时间:</span><span className="ad-v text-mono">{isApplied ? (agent._appData?.appliedAt || '2026-5-11 23:59:59') : fmtDT(agent.created)}</span></div>
              </div>
            </div>

            <div className="ad-status-row">
              <div><span className="ad-k">帐户状态:</span><span className={'status-pill ' + (statusCls[status]||'')} style={{marginLeft:4}}>{statusMap[status]||status}</span></div>
              <div style={{display:'flex',gap:8}}>
                {status === 'frozen' && (
                  <button className="btn sm" style={{borderColor:'#16a34a',color:'#16a34a'}}
                    onClick={()=>setConfirmAction('unfreeze')}>再次启用</button>
                )}
                {status !== 'frozen' && status !== 'suspended' && (
                  <button className="btn sm" style={{borderColor:'#2563eb',color:'#2563eb'}}
                    onClick={()=>setConfirmAction('freeze')}>冻结帐户</button>
                )}
                {status !== 'suspended' && (
                  <button className="btn sm" style={{borderColor:'#dc2626',color:'#dc2626'}}
                    onClick={()=>setConfirmAction('suspend')}>停用帐户</button>
                )}
              </div>
            </div>

            <div className="ad-section-title">联系方式</div>
            <div className="ad-contact-card">
              <table className="ad-contact-tbl">
                <thead>
                  <tr><th>联系类型</th><th>联系资料</th></tr>
                </thead>
                <tbody>
                  {(() => {
                    // v3.0.59 优先用申请时 _formSnapshot.contacts;否则用 _appData.contacts;再否则空占位
                    const snap = agent._appData?._formSnapshot?.contacts || agent._appData?.contacts;
                    if (snap && snap.length) {
                      return snap.filter(c => c.value).map((c, i) => (
                        <tr key={i}>
                          <td>{c.type === 'Mobile' ? '手机' : c.type}</td>
                          <td className="text-mono">{(c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp') ? `${c.dial || '+91'} ${c.value}` : c.value}</td>
                        </tr>
                      ));
                    }
                    return <tr><td colSpan={2} style={{color:'var(--text-3)',textAlign:'center',padding:'16px'}}>—</td></tr>;
                  })()}
                </tbody>
              </table>
            </div>

            {/* v3.0.85 已删除「申请理由 / 推广渠道说明」 */}

            <div className="ad-section-title">备注</div>
            <textarea className="textarea" rows={4} readOnly={!editing} value={note} onChange={e=>setNote(e.target.value)} placeholder="(未填写备注)" style={{background: editing ? '#fff' : '#f8fafc'}}/>
          </div>
        )}

        {tab === 'commission' && (
          <div style={{padding:'4px 0'}}>
            {editing ? (
              <window.CommissionModeForm
                value={comm}
                onChange={setComm}
              />
            ) : (
              <window.CommissionReadOnly value={comm}/>
            )}
          </div>
        )}

        {tab === 'perms' && (
          <div style={{padding:'4px 0',opacity: editing ? 1 : 0.85, pointerEvents: editing ? 'auto' : 'none'}}>
            <window.AgentPermsForm value={perms} onChange={setPerms}/>
          </div>
        )}

        {tab === 'traffic' && (
          <div style={{padding:'4px 0'}}>
            <div className="ad-section-title">流量来源链接</div>
            <div style={{fontSize:12.5,color:'var(--text-3)',marginBottom:12}}>代理推广所使用的频道、平台账号或落地页(Youtube / Tiktok / Telegram / Facebook ...)</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {traffic.length === 0 && (
                <div style={{padding:'14px',background:'#f8fafc',border:'1px dashed var(--line)',borderRadius:8,fontSize:13,color:'var(--text-3)',textAlign:'center'}}>(未填写流量来源)</div>
              )}
              {traffic.map((u, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,color:'var(--text-3)',width:24,textAlign:'right'}}>{i+1}.</span>
                  <input
                    className="input"
                    value={u}
                    readOnly={!editing}
                    onChange={e=>{ const t=[...traffic]; t[i]=e.target.value; setTraffic(t); }}
                    placeholder="https://..."
                    style={{flex:1,background: editing ? '#fff' : '#f8fafc',fontFamily:'JetBrains Mono'}}
                  />
                  {editing && traffic.length > 0 && (
                    <button type="button" className="contact-remove" title="移除" onClick={()=>setTraffic(traffic.filter((_,k)=>k!==i))}>−</button>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" className="contact-add-btn" onClick={()=>setTraffic([...traffic,''])} style={{marginTop:4}}>+ 新增流量来源链接</button>
              )}
            </div>
          </div>
        )}

        {tab === 'payment' && (
          <div style={{padding:'4px 0'}}>
            <window.PaymentInfoView
              editing={editing}
              value={payment}
              onChange={setPayment}
            />
          </div>
        )}

        {tab === 'logs' && (
          <div>
            <LogTimeline logs={agent._logs || []}/>
          </div>
        )}
      </div>

      {/* 底部 - 仅基本/分润/权限 有编辑按钮 */}
      {tab !== 'logs' && (
        <div className="agent-detail-foot" style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          {!editing && (
            <button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}} onClick={()=>setEditing(true)}>
              <Icon name="edit" size={12}/> 编辑
            </button>
          )}
          {editing && (<>
            <button className="btn sm ghost" onClick={cancelEdit}>取消</button>
            <button className="btn sm primary" onClick={saveEdit}>保存</button>
          </>)}
        </div>
      )}

      {/* v2.4.31 状态操作确认弹窗 — 替换 window.confirm,样式同要求补件弹窗 */}
      {confirmAction && (() => {
        const meta = ACTION_META[confirmAction];
        return (
          <AM open={true} onClose={()=>setConfirmAction(null)} size="sm"
            title={meta.title}
            subtitle={meta.subtitle}
            footer={<>
              <button className="btn ghost" onClick={()=>setConfirmAction(null)}>取消</button>
              <button className="btn primary" style={meta.btnStyle || undefined} onClick={()=>{
                updateStatus(meta.to, `${agent.name} · ${meta.toastMsg}`);
                setConfirmAction(null);
              }}>{meta.cta}</button>
            </>}>
            <div style={{fontSize:14,lineHeight:1.8,color:'var(--text-1)',textAlign:'center',padding:'8px 0'}}>
              <div>确认对代理</div>
              <div style={{fontSize:20,fontWeight:600,color:meta.accent,margin:'8px 0',lineHeight:1.4}}>
                {agent.name} <span className="text-mono" style={{fontSize:18}}>({displayId})</span>
              </div>
              <div>执行<b style={{color:'var(--text-0)'}}>{meta.title}</b>?</div>
            </div>
          </AM>
        );
      })()}
    </div>
  );
}

window.AgentsModule = AgentsModule;

// v2.2.5 自行申请代理列表组件 (v2.2.24 重构)
function SelfApplicationsList({ toast, onCreateAgent, tpls }) {
  const [apps, setApps] = useApsApps();
  const [stateFilter, setStateFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [channelFilter, setChannelFilter] = React.useState('all'); // v3.0.39 申请渠道 frontend/agentportal/all
  const [q, setQ] = React.useState('');
  const [detail, setDetail] = React.useState(null);
  const [detailTab, setDetailTab] = React.useState('basic');
  // v3.0.82 编辑态:editing 为 true 时 申请资料 / 流量来源 / 收款方式 可编辑
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(null);
  React.useEffect(() => {
    if (detail) {
      const snap = detail._formSnapshot || {};
      setDraft({
        name: detail.name || '',
        loginName: detail.loginName || '',
        password: detail.password || '',
        contacts: snap.contacts ? snap.contacts.map(c => ({ ...c })) : [
          {type:'Email', value:''},
          {type:'Mobile', value:'', dial:'+91'},
        ],
        trafficUrls: (snap.trafficUrls && snap.trafficUrls.length) ? [...snap.trafficUrls] : [''],
        upiId: snap.upiId || '',
        holder: snap.holder || '',
        // v3.1.64 收款方式 5 字段
        ifsc:     snap.ifsc     || '',
        account:  snap.account  || snap.upiId  || '',
        realName: snap.realName || snap.holder || '',
        // v3.1.80 仅用 payEmail，不再 fallback 到联系方式 Email
        email:    snap.payEmail || '',
        remark: snap.remark || '',
      });
      setEditing(false);
    } else {
      setDraft(null);
      setEditing(false);
    }
  }, [detail?.id]);
  const saveDraft = () => {
    if (!detail || !draft) return;
    const primaryContact = (draft.contacts.find(c => c.value)?.value) || '';
    const contactList = draft.contacts.filter(c => c.value).map(c => c.type).join(' · ');
    const trafficList = (draft.trafficUrls || []).filter(Boolean).join(' · ');
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    setApps(window.APS_APPS_STORE.list.map(a =>
      a.id === detail.id
        ? {
            ...a,
            name: draft.name || a.name,
            // v3.0.83 登入帐号 / 登入密码 不可编辑,保持原值
            contact: primaryContact || a.contact,
            channels: trafficList || contactList || a.channels,
            _formSnapshot: { ...(a._formSnapshot || {}), contacts: draft.contacts, trafficUrls: draft.trafficUrls, upiId: draft.upiId, holder: draft.holder, ifsc: draft.ifsc, account: draft.account, realName: draft.realName, payEmail: draft.email, remark: draft.remark },
            updatedAt: nowStr,
            _logs: [...(a._logs || []), { at: nowStr, by: '商户:管理员-randy', type:'edit', note:'编辑申请资料 / 流量来源 / 收款方式' }],
          }
        : a
    ));
    setDetail(window.APS_APPS_STORE.list.find(a => a.id === detail.id));
    setEditing(false);
    toast('已保存修改');
  };
  const cancelEdit = () => {
    if (!detail) return;
    const snap = detail._formSnapshot || {};
    setDraft({
      name: detail.name || '',
      loginName: detail.loginName || '',
      password: detail.password || '',
      contacts: snap.contacts ? snap.contacts.map(c => ({ ...c })) : [
        {type:'Email', value:''},
        {type:'Mobile', value:'', dial:'+91'},
      ],
      trafficUrls: (snap.trafficUrls && snap.trafficUrls.length) ? [...snap.trafficUrls] : [''],
      upiId: snap.upiId || '',
      holder: snap.holder || '',
      // v3.1.64 收款方式 5 字段
      ifsc:     snap.ifsc     || '',
      account:  snap.account  || snap.upiId  || '',
      realName: snap.realName || snap.holder || '',
      // v3.1.80 仅用 payEmail，不再 fallback 到联系方式 Email
      email:    snap.payEmail || '',
      remark: snap.remark || '',
    });
    setEditing(false);
  };
  const canEdit = detail && (detail.state === 'reviewing' || detail.state === 'supplement' || detail.state === 'supplemented');
  const [actionModal, setActionModal] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [reasonTpl, setReasonTpl] = React.useState('custom');
  const [passApp, setPassApp] = React.useState(null);
  // v2.4.5 模板从 props 传入(由父级 AgentsModule 管理)
  const SUPPLEMENT_TPL = tpls.supplement;
  const REJECT_TPL = tpls.reject;
  const openAction = (type, app) => { setActionModal({type,app}); setReason(''); setReasonTpl('custom'); };
  const closeAction = () => { setActionModal(null); setReason(''); setReasonTpl('custom'); };
  const pickTpl = (k) => {
    setReasonTpl(k);
    if (!actionModal) return;
    const tpls = actionModal.type==='reject' ? REJECT_TPL : SUPPLEMENT_TPL;
    setReason(k==='custom' ? '' : (tpls[k]||''));
  };

  const filtered = apps.filter(a => {
    if (stateFilter !== 'all' && a.state !== stateFilter) return false;
    if (typeFilter !== 'all' && a.tier !== typeFilter) return false;
    if (channelFilter !== 'all' && (a._channel || 'frontend') !== channelFilter) return false;
    if (q && !(a.id+a.name+a.contact+a.userId).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const counts = {
    all: apps.length,
    reviewing: apps.filter(a=>a.state==='reviewing').length,
    supplement: apps.filter(a=>a.state==='supplement').length,
    supplemented: apps.filter(a=>a.state==='supplemented').length,
    failed: apps.filter(a=>a.state==='failed').length,
    passed: apps.filter(a=>a.state==='passed').length,
  };

  const applyAction = () => {
    if (!actionModal) return;
    const { type, app } = actionModal;
    const newState = type === 'pass' ? 'passed' : type === 'reject' ? 'failed' : 'supplement';
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    // v2.4.35 在 _logs 上追加操作日志
    const newLog = { at: nowStr, by: '商户:管理员-randy', type, note: type==='pass' ? '由管理员手动创建专业代理账户' : reason };
    setApps(apps.map(a => a.id === app.id
      ? { ...a, state:newState, failReason: type==='pass' ? null : reason, updatedAt: nowStr, _logs: [...(a._logs || []), newLog] }
      : a));
    toast(`${app.name} · ${type==='pass'?'已通过':type==='reject'?'已拒绝':'已发出补件通知'}`);
    setActionModal(null); setReason(''); setReasonTpl('custom');
    if (detail && detail.id === app.id) setDetail(null);
  };

  const tabs = [
    {k:'all',l:'全部进度',c:counts.all},
    {k:'reviewing',l:'待审核',c:counts.reviewing},
    {k:'supplement',l:'要求补件',c:counts.supplement},
    {k:'supplemented',l:'已补件待审核',c:counts.supplemented},
    {k:'failed',l:'拒绝',c:counts.failed},
    {k:'passed',l:'通过',c:counts.passed},
  ];

  return (
    <div className="card">
      <div className="self-app-tabs" style={{display:'flex',gap:0,padding:'0 16px',borderBottom:'1px solid var(--line)',alignItems:'center'}}>
        {tabs.map(t => (
          <div key={t.k} onClick={()=>setStateFilter(t.k)} style={{
            padding:'10px 14px',cursor:'pointer',fontSize:13,
            borderBottom: stateFilter===t.k?'2px solid var(--brand)':'2px solid transparent',
            color: stateFilter===t.k?'var(--brand)':'var(--text-2)',
            fontWeight: stateFilter===t.k?600:500, marginBottom:-1,
          }}>
            {t.l} <span style={{
              padding:'0 6px',borderRadius:8,background:'var(--bg-3)',color:'var(--text-3)',
              fontSize:11,marginLeft:4,fontFamily:'JetBrains Mono',fontWeight:600
            }}>{t.c}</span>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <ASI value={q} onChange={setQ} placeholder="代理ID / 代理名称 / 联系方式" width={260}/>
        <select className="filter-select" value={channelFilter} onChange={e=>setChannelFilter(e.target.value)}>
          <option value="all">全部申请渠道</option>
          <option value="frontend">网站前台</option>
          <option value="agentportal">专业代理后台</option>
        </select>
        <span style={{flex:1}}/>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>代理ID</th>
              <th>代理名称</th>
              <th>申请渠道</th>
              <th>上级代理ID-名称</th>
              <th>申请进度</th>
              <th>更新时间</th>
              <th>创建时间</th>
              <th style={{width:120}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const s = APP_STATE_META[a.state];
              const canAction = a.state==='reviewing' || a.state==='supplement' || a.state==='supplemented';
              return (
                <tr key={a.id}>
                  <td className="text-mono" style={{color:'var(--text-0)'}}>{a.id}</td>
                  <td onClick={()=>setDetail(a)} style={{cursor:'pointer',color:'var(--text-0)',fontWeight:500}}>{a.name}</td>
                  <td>{(() => {
                    const ch = a._channel || 'frontend';
                    const meta = ch === 'agentportal'
                      ? { label:'专业后台', bg:'#fef3c7', fg:'#92400e' }
                      : { label:'网站前台', bg:'#dbeafe', fg:'#1e40af' };
                    return <span style={{fontSize:11.5, padding:'2px 8px', borderRadius:4, background:meta.bg, color:meta.fg, fontWeight:600, whiteSpace:'nowrap'}}>{meta.label}</span>;
                  })()}</td>
                  <td className="text-mono" style={{fontSize:12}}>{a.parentId}-{a.parentName}</td>
                  <td><span style={{
                    display:'inline-block',padding:'2px 10px',borderRadius:12,
                    border:'1px solid '+s.fg,color:s.fg,background:s.bg,
                    fontWeight:600,fontSize:12,whiteSpace:'nowrap',minWidth:96,textAlign:'center'
                  }}>{s.label}</span></td>
                  <td className="text-mute" style={{fontSize:12,fontFamily:'JetBrains Mono'}}>{a.updatedAt}</td>
                  <td className="text-mute" style={{fontSize:12,fontFamily:'JetBrains Mono'}}>{a.createdAt}</td>
                  <td>
                    <a style={{color:'var(--brand)',cursor:'pointer',fontSize:13}} onClick={()=>setDetail(a)}>查看&审核</a>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--text-3)'}}>暂无申请记录</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="self-app-detail-mask" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.32)',zIndex:120}} onClick={()=>setDetail(null)}>
          <div className="agent-detail self-app-detail-panel" style={{position:'absolute',right:0,top:0,height:'100vh',width:680,boxShadow:'-8px 0 32px rgba(0,0,0,.12)'}} onClick={e=>e.stopPropagation()}>
            <div className="agent-detail-head">
              <div style={{display:'flex',gap:14,alignItems:'center',flex:1}}>
                {(() => {
                  const isAC = detail._channel === 'agentportal';
                  return <div className="agent-detail-avatar" style={{background: isAC ? '#f59e0b' : '#10b981'}}>{isAC ? 'AC' : 'AP'}</div>;
                })()}
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <span style={{fontSize:20,color:'var(--text-0)',fontWeight:600,lineHeight:1.2}}>{detail.name}</span>
                  <span style={{fontSize:14,color:'var(--text-2)',fontFamily:'JetBrains Mono',lineHeight:1.2}}>{detail.id}</span>
                </div>
              </div>
              <button className="close" onClick={()=>setDetail(null)}><Icon name="x" size={16}/></button>
            </div>
            <div className="agent-detail-tabs">
              <div className={'ad-tab '+(detailTab==='basic'?'active':'')} onClick={()=>setDetailTab('basic')}>申请资料</div>
              <div className={'ad-tab '+(detailTab==='traffic'?'active':'')} onClick={()=>setDetailTab('traffic')}>流量来源</div>
              <div className={'ad-tab '+(detailTab==='payment'?'active':'')} onClick={()=>setDetailTab('payment')}>收款方式</div>
              <div className={'ad-tab '+(detailTab==='logs'?'active':'')} onClick={()=>setDetailTab('logs')}>操作记录</div>
            </div>
            <div className="agent-detail-body">
              {detailTab==='logs' ? (
                <>
                  <div className="ad-section-title">审核进度</div>
                  <LogTimeline logs={detail._logs || []}/>
                </>
              ) : detailTab==='traffic' ? (
                <div style={{padding:'4px 0'}}>
                  <div className="ad-section-title">流量来源链接</div>
                  {editing ? (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {(draft?.trafficUrls || ['']).map((u, i) => (
                        <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
                          <input className="input" style={{flex:1}} value={u} placeholder="https://domain.com" onChange={e=>{
                            const next = [...draft.trafficUrls];
                            next[i] = e.target.value;
                            setDraft({...draft, trafficUrls: next});
                          }}/>
                          {draft.trafficUrls.length > 1 && (
                            <button type="button" className="contact-remove" onClick={()=>{
                              setDraft({...draft, trafficUrls: draft.trafficUrls.filter((_,j)=>j!==i)});
                            }}>−</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="contact-add-btn" onClick={()=>{
                        setDraft({...draft, trafficUrls: [...(draft.trafficUrls||[]), '']});
                      }}>+ 新增流量来源链接</button>
                    </div>
                  ) : (() => {
                    const urls = (detail._formSnapshot?.trafficUrls || []).filter(Boolean);
                    if (!urls.length) {
                      return <div style={{padding:'12px 14px',background:'#f8fafc',border:'1px dashed var(--line)',borderRadius:6,fontSize:13,color:'var(--text-3)'}}>(未填写流量来源)</div>;
                    }
                    return (
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {urls.map((u,i) => (
                          <div key={i} style={{padding:'10px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',fontFamily:'JetBrains Mono',wordBreak:'break-all'}}>{u}</div>
                        ))}
                      </div>
                    );
                  })()}
                  <div style={{marginTop:12,fontSize:12,color:'var(--text-3)',lineHeight:1.6}}>代理在申请时提交的推广所使用的频道、平台账号、落地页 URL</div>
                </div>
              ) : detailTab==='payment' ? (
                <div style={{padding:'4px 0'}}>
                  <window.PaymentInfoView
                    editing={editing}
                    value={{
                      method:   'UPI',
                      ifsc:     draft?.ifsc     || '',
                      account:  draft?.account  || '',
                      realName: draft?.realName || '',
                      email:    draft?.email    || '',
                    }}
                    onChange={(next) => setDraft({...draft, ...next})}
                  />
                </div>
              ) : <>
              <div className="ad-section-title">基本资料</div>
              <div className="ad-info-card">
                <div className="ad-info-grid" style={{gridTemplateColumns:'1fr'}}>
                  <div><span className="ad-k">代理创建方式:</span><span className="ad-v">{detail._channel === 'agentportal' ? '代理后台自行申请' : '用户自行申请'}</span></div>
                  <div><span className="ad-k">代理ID:</span><span className="ad-v text-mono">{detail.id}</span></div>
                  <div>
                    <span className="ad-k">代理名称:</span>
                    {editing
                      ? <input className="input sm" style={{height:24,fontSize:13,padding:'2px 8px',width:'70%',marginLeft:4}} value={draft?.name||''} onChange={e=>setDraft({...draft,name:e.target.value})}/>
                      : <span className="ad-v">{detail.name}</span>}
                  </div>
                  <div>
                    <span className="ad-k">登入帐号:</span>
                    <span className="ad-v text-mono">{detail.loginName || '—'}</span>
                  </div>
                  <div>
                    <span className="ad-k">登入密码:</span>
                    <span className="ad-v text-mono">{detail.password ? '••••••••' : '—'}</span>
                  </div>
                  <div><span className="ad-k">上级代理:</span><span className="ad-v text-mono">{detail.parentId}-{detail.parentName}</span></div>
                  <div><span className="ad-k">创建时间:</span><span className="ad-v text-mono">{detail.createdAt}</span></div>
                </div>
              </div>

              <div className="ad-section-title mt-4">联系方式</div>
              {editing ? (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {(draft?.contacts || []).map((c, i) => {
                    const isPhone = c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp';
                    return (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr 32px',gap:8,alignItems:'center'}}>
                        <div style={{padding:'6px 10px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:12.5,fontWeight:600}}>{c.type === 'Mobile' ? '手机' : c.type}</div>
                        {isPhone ? (
                          <div style={{display:'flex',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden'}}>
                            <span style={{padding:'0 10px',background:'#f8fafc',borderRight:'1px solid var(--line)',display:'inline-flex',alignItems:'center',fontFamily:'JetBrains Mono',fontSize:12.5}}>+91</span>
                            <input className="input" style={{flex:1,border:'none',borderRadius:0,height:32}} value={c.value} onChange={e=>{
                              const next = [...draft.contacts];
                              next[i] = {...c, value: e.target.value};
                              setDraft({...draft, contacts: next});
                            }}/>
                          </div>
                        ) : (
                          <input className="input" style={{height:32}} value={c.value} onChange={e=>{
                            const next = [...draft.contacts];
                            next[i] = {...c, value: e.target.value};
                            setDraft({...draft, contacts: next});
                          }}/>
                        )}
                        {i >= 2 && (
                          <button type="button" className="contact-remove" onClick={()=>{
                            setDraft({...draft, contacts: draft.contacts.filter((_,j)=>j!==i)});
                          }}>−</button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" className="contact-add-btn" style={{marginTop:4}} onClick={()=>{
                    setDraft({...draft, contacts: [...draft.contacts, {type:'Telegram', value:''}]});
                  }}>+ 新增联系方式</button>
                </div>
              ) : (
                <table className="ad-contact-tbl">
                  <thead><tr><th style={{width:140}}>联系类型</th><th>联系资料</th></tr></thead>
                  <tbody>
                    {(() => {
                      const snap = detail._formSnapshot?.contacts;
                      if (snap && snap.length) {
                        return snap.filter(c => c.value).map((c, i) => (
                          <tr key={i}>
                            <td>{c.type === 'Mobile' ? '手机' : c.type}</td>
                            <td className="text-mono">{(c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp') ? `${c.dial || '+91'} ${c.value}` : c.value}</td>
                          </tr>
                        ));
                      }
                      return <tr><td colSpan={2} style={{color:'var(--text-3)',textAlign:'center',padding:'16px'}}>—</td></tr>;
                    })()}
                  </tbody>
                </table>
              )}

              {/* v3.0.85 备注 — 自行申请代理详情新增字段(只读 / 可编辑) */}
              <div className="ad-section-title mt-4">备注</div>
              {editing ? (
                <textarea className="textarea" rows={3} placeholder="(未填写备注)" style={{width:'100%'}} value={draft?.remark || ''} onChange={e=>setDraft({...draft, remark: e.target.value})}/>
              ) : (
                <div style={{padding:'10px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color: detail._formSnapshot?.remark ? 'var(--text-1)' : 'var(--text-3)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                  {detail._formSnapshot?.remark || '(未填写备注)'}
                </div>
              )}

              {detail.failReason && <>
                <div className="ad-section-title mt-4">{detail.state==='failed'?'拒绝原因':'补件说明'}</div>
                <div style={{padding:'10px 12px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,fontSize:13,lineHeight:1.6,color:'#991b1b'}}>{detail.failReason}</div>
              </>}
              </>}
            </div>
            {/* v3.0.82 编辑/保存 按钮:仅当 detailTab !== 'logs' 且 canEdit 时显示 */}
            {detailTab !== 'logs' && canEdit && (
              <div className="agent-detail-foot" style={{justifyContent:'flex-end',alignItems:'center',gap:8}}>
                {!editing ? (
                  <button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}} onClick={()=>setEditing(true)}>
                    <Icon name="edit" size={12}/> 编辑
                  </button>
                ) : (<>
                  <button className="btn sm ghost" onClick={cancelEdit}>取消</button>
                  <button className="btn sm primary" onClick={saveDraft}>保存</button>
                </>)}
              </div>
            )}
            {/* v3.1.65 申请审核行 — 所有 tab 都显示(原仅 basic) */}
            {!editing && (
              <div className="agent-detail-foot" style={{justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:13,color:'var(--text-1)'}}>申请进度: <span style={{color:APP_STATE_META[detail.state].fg,fontWeight:600}}>{APP_STATE_META[detail.state].label}</span></div>
                {(detail.state==='reviewing'||detail.state==='supplement'||detail.state==='supplemented') && (
                  <div style={{display:'flex',gap:8}}>
                    <button className="app-act-btn" style={{color:'#7c3aed',borderColor:'#ddd6fe',padding:'5px 12px'}} onClick={()=>openAction('supplement',detail)}>要求补件</button>
                    <button className="app-act-btn" style={{color:'#dc2626',borderColor:'#fecaca',padding:'5px 12px'}} onClick={()=>openAction('reject',detail)}>拒绝</button>
                    <button className="app-act-btn" style={{color:'#16a34a',borderColor:'#bbf7d0',padding:'5px 12px'}} onClick={()=>{
                      // v3.0.40 审核通过统一弹 CreateAgentModal 复核(专业后台来源会预填 loginName/password)
                      setPassApp(detail); setDetail(null);
                    }}>通过</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <AM open={!!actionModal} onClose={closeAction} size="sm"
        title={actionModal?.type==='pass'?'通过申请':actionModal?.type==='reject'?'拒绝申请':'要求补件'}
        subtitle={
          actionModal?.type==='reject' ? '拒绝后,用户再次申请专业代理需重新创建代理ID'
          : actionModal?.type==='supplement' ? '用户可在专业代理申请弹窗查看补件说明'
          : ''
        }
        footer={<>
          <button className="btn ghost" onClick={closeAction}>取消</button>
          <button className={'btn ' + (actionModal?.type==='reject'?'danger':'primary')} onClick={applyAction}>
            确认 {actionModal?.type==='pass'?'通过申请':actionModal?.type==='reject'?'拒绝申请':'发送补件通知'}
          </button>
        </>}>
        {actionModal?.type==='pass' && (
          <div style={{fontSize:13,lineHeight:1.7,color:'var(--text-1)'}}>
            通过后将自动为申请人创建专业代理账户,登录信息会通过短信发送给申请人。
          </div>
        )}
        {(actionModal?.type==='reject' || actionModal?.type==='supplement') && (
          <div>
            <label style={{fontSize:13,display:'block',marginBottom:10,color:'var(--text-0)',fontWeight:500}}>
              {actionModal?.type==='reject'?'拒绝原因':'需要补充的材料 / 说明'} <span style={{color:'var(--danger)'}}>*</span>
            </label>
            <div style={{display:'flex',gap:24,marginBottom:12}}>
              {['tpl1','tpl2','custom'].map(k => (
                <label key={k} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13}}>
                  <input type="radio" checked={reasonTpl===k} onChange={()=>pickTpl(k)} style={{accentColor:'var(--brand)'}}/>
                  {k==='tpl1'?'模板1':k==='tpl2'?'模板2':'自订义'}
                </label>
              ))}
            </div>
            <textarea className="textarea" rows={5} value={reason} onChange={e=>{setReason(e.target.value); if(reasonTpl!=='custom') setReasonTpl('custom');}}
              placeholder={actionModal?.type==='reject'?'请填写本次拒绝的具体原因,会以通知方式发送给申请人':'请说明需要申请人补充哪些材料或信息'} style={{width:'100%'}}/>
          </div>
        )}
      </AM>

      <CreateAgentModal open={!!passApp} prefill={passApp} onClose={()=>setPassApp(null)} onSubmit={(a)=>{
        setApps(apps.map(x => x.id === passApp.id ? {...x, state:'passed'} : x));
        if (onCreateAgent) onCreateAgent(passApp, a);
        toast(`${passApp.name} 已通过审核,代理账户创建成功`);
        setPassApp(null);
      }}/>
    </div>
  );
}

// v2.4.17 说明弹窗 — 介绍 风险等级 / 账户状态 / 申请进度 含义
function HelpModal({ open, onClose, source }) {
  if (!open) return null;
  const RISK_ITEMS = [
    { k:'low',    label:'低', cls:'risk-low',    text:'代理近期数据正常,无可疑行为或异常波动' },
    { k:'medium', label:'中', cls:'risk-medium', text:'存在少量可疑指标,需关注(如个别玩家行为异常)' },
    { k:'high',   label:'高', cls:'risk-high',   text:'明显异常或多项风控告警,建议立即介入复核' },
  ];
  const STATUS_ITEMS = [
    { k:'pending',   label:'未启用', color:'#8b5cf6', bg:'#f5f3ff', text:'账户已创建,等待代理首次登入后自动启用' },
    { k:'active',    label:'已启用', color:'#16a34a', bg:'#f0fdf4', text:'代理已首次登入专业代理后台,可正常使用所有功能' },
    { k:'frozen',    label:'已冻结', color:'#2563eb', bg:'#eff6ff', text:'账户登入与佣金提款被暂时冻结;仍可查看报表、玩家、Code 与历史数据,但不能创建新 Code、修改资料或发起提款,可解冻恢复' },
    { k:'suspended', label:'已停用', color:'#dc2626', bg:'#fef2f2', text:'账户被永久停用,不可登入与产生新佣金' },
  ];
  const APP_ITEMS = [
    { color:'#f59e0b', bg:'#fffbeb', label:'待审核',         text:'用户已提交申请资料,等待商户审核' },
    { color:'#7c3aed', bg:'#faf5ff', label:'要求补件',       text:'商户要求用户补充材料或说明,等待用户补充' },
    { color:'#ea580c', bg:'#fff7ed', label:'已补件待审核',   text:'用户已补件,等待商户复核' },
    { color:'#dc2626', bg:'#fef2f2', label:'拒绝',           text:'申请被拒绝,用户可重新提交申请创建新代理ID' },
    { color:'#16a34a', bg:'#f0fdf4', label:'通过',           text:'申请通过,由管理员手动创建专业代理账户' },
  ];

  return (
    <AM open={open} onClose={onClose} size="lg"
      title="说明"
      subtitle="代理账户管理 · 字段含义说明"
      footer={<button className="btn primary" onClick={onClose}>我知道了</button>}>
      <div style={{display:'flex',flexDirection:'column',gap:18,fontSize:13,color:'var(--text-1)'}}>
        {/* v2.4.25 代理ID 编号规则说明 */}
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>代理ID 编号规则</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <span className="mono" style={{flexShrink:0,minWidth:96,padding:'2px 8px',background:'#fef3c7',color:'#92400e',borderRadius:4,fontWeight:600,fontSize:12}}>AC1xxxxx</span>
              <div style={{flex:1,lineHeight:1.6}}><b style={{color:'var(--text-0)'}}>代理后台自行申请</b> — ID 以 <code className="mono">AC1</code> 开头(如 AC100001、AC100002 …),由用户在「专业代理后台」未登录页「Become a Partner」提交注册时自动分配</div>
            </div>
          </div>
        </div>

        {source !== 'applied' && (
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>风险等级</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {RISK_ITEMS.map(r => (
              <div key={r.k} style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <span style={{flexShrink:0,marginTop:1}}><AR level={r.k}/></span>
                <div style={{flex:1,lineHeight:1.6}}><b style={{color:'var(--text-0)'}}>{r.label}</b> — {r.text}</div>
              </div>
            ))}
          </div>
        </div>
        )}

        {source !== 'applied' && (
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>账户状态</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {STATUS_ITEMS.map(s => (
              <div key={s.k} style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <span style={{flexShrink:0,marginTop:1,padding:'2px 10px',borderRadius:12,border:`1px solid ${s.color}`,color:s.color,background:s.bg,fontWeight:600,fontSize:12,whiteSpace:'nowrap',minWidth:60,textAlign:'center'}}>{s.label}</span>
                <div style={{flex:1,lineHeight:1.6}}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* v2.4.27 已创建代理 — 专业代理账户创建流程 & 账户状态流转 */}
        {source !== 'applied' && (() => {
          const Chip = ({ color, bg, children }) => (
            <span style={{padding:'2px 10px',borderRadius:12,border:`1px solid ${color}`,color,background:bg||'#fff',fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{children}</span>
          );
          // v2.4.28 状态 chip 颜色与 status-pill 对齐(active/pending/frozen/suspended)
          const STATUS_CHIP = {
            pending:   { color:'#8b5cf6', bg:'#f5f3ff' },
            active:    { color:'#16a34a', bg:'#f0fdf4' },
            frozen:    { color:'#2563eb', bg:'#eff6ff' },
            suspended: { color:'#dc2626', bg:'#fef2f2' },
          };
          const StatusChip = ({ k, children }) => <Chip color={STATUS_CHIP[k].color} bg={STATUS_CHIP[k].bg}>{children}</Chip>;
          const Arrow = ({ label }) => (
            <span style={{display:'inline-flex',alignItems:'center',gap:4,color:'var(--text-3)',fontSize:12}}>
              {label && <span>{label}</span>}
              <span style={{fontWeight:600}}>→</span>
            </span>
          );
          return (
            <>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>专业代理账户 · 创建流程</div>
                <div style={{padding:'16px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:8,display:'flex',flexDirection:'column',gap:14,fontSize:12,lineHeight:1.8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <Chip color="#92400e" bg="#fef3c7">代理后台自行申请</Chip>
                    <Arrow label="商户审核 · 通过"/>
                    <span style={{color:'var(--text-2)'}}>自动创建账户(用注册账号密码)</span>
                    <Arrow/>
                    <StatusChip k="pending">未启用</StatusChip>
                  </div>
                </div>
              </div>

              <div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>账户状态 · 流转关系</div>
                <div style={{padding:'16px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:8,display:'flex',flexDirection:'column',gap:14,fontSize:12,lineHeight:1.8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <StatusChip k="pending">未启用</StatusChip>
                    <Arrow label="代理首次登入成功"/>
                    <StatusChip k="active">已启用</StatusChip>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <StatusChip k="active">已启用</StatusChip>
                    <Arrow label="商户点击「冻结帐户」"/>
                    <StatusChip k="frozen">已冻结</StatusChip>
                    <Arrow label="商户点击「再次启用」"/>
                    <StatusChip k="active">已启用</StatusChip>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <StatusChip k="pending">未启用</StatusChip>
                    <span style={{color:'var(--text-3)'}}>/</span>
                    <StatusChip k="active">已启用</StatusChip>
                    <span style={{color:'var(--text-3)'}}>/</span>
                    <StatusChip k="frozen">已冻结</StatusChip>
                    <Arrow label="商户点击「停用帐户」"/>
                    <StatusChip k="suspended">已停用</StatusChip>
                    <span style={{color:'var(--text-3)'}}>(终态,不可撤销)</span>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {source === 'applied' && (
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>申请进度</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {APP_ITEMS.map(a => (
                <div key={a.label} style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <span style={{flexShrink:0,marginTop:1,padding:'2px 10px',borderRadius:12,border:`1px solid ${a.color}`,color:a.color,background:a.bg,fontWeight:600,fontSize:12,whiteSpace:'nowrap',minWidth:96,textAlign:'center'}}>{a.label}</span>
                  <div style={{flex:1,lineHeight:1.6}}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* v2.4.26 自行申请代理 申请进度流程关系图 */}
        {source === 'applied' && (() => {
          const Chip = ({ color, bg, children }) => (
            <span style={{padding:'2px 10px',borderRadius:12,border:`1px solid ${color}`,color,background:bg||'#fff',fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{children}</span>
          );
          const Arrow = () => <span style={{color:'var(--text-3)',fontWeight:600}}>→</span>;
          return (
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>申请进度 · 流程关系</div>
              <div style={{padding:'16px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:8,display:'flex',flexDirection:'column',gap:14,fontSize:12,lineHeight:1.8}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{color:'var(--text-3)',minWidth:60}}>申请提交</span>
                  <Arrow/>
                  <span style={{padding:'2px 8px',background:'#fef3c7',color:'#92400e',borderRadius:3,fontSize:11,fontWeight:600}}>代理后台</span>
                  <Arrow/>
                  <Chip color="#f59e0b" bg="#fffbeb">待审核</Chip>
                  <Arrow/>
                  <span style={{color:'var(--text-2)'}}>商户审核</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',paddingLeft:68}}>
                  <Arrow/>
                  <Chip color="#16a34a" bg="#f0fdf4">通过</Chip>
                  <span style={{color:'var(--text-2)'}}>由管理员手动创建专业代理账户(终态)</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',paddingLeft:68}}>
                  <Arrow/>
                  <Chip color="#dc2626" bg="#fef2f2">拒绝</Chip>
                  <span style={{color:'var(--text-2)'}}>申请失败(终态,用户可重新提交创建新代理ID)</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',paddingLeft:68}}>
                  <Arrow/>
                  <Chip color="#7c3aed" bg="#faf5ff">要求补件</Chip>
                  <Arrow/>
                  <span style={{color:'var(--text-2)'}}>用户补充材料</span>
                  <Arrow/>
                  <Chip color="#ea580c" bg="#fff7ed">已补件待审核</Chip>
                  <Arrow/>
                  <span style={{color:'var(--text-2)'}}>商户复核</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',paddingLeft:144}}>
                  <Arrow/>
                  <Chip color="#16a34a" bg="#f0fdf4">通过</Chip>
                  <span style={{color:'var(--text-3)'}}>/</span>
                  <Chip color="#dc2626" bg="#fef2f2">拒绝</Chip>
                  <span style={{color:'var(--text-3)'}}>/</span>
                  <Chip color="#7c3aed" bg="#faf5ff">要求补件</Chip>
                  <span style={{color:'var(--text-3)'}}>(循环,可多次补件)</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* v2.4.36 操作记录规则 — 两个 tab 都展示 */}
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>操作记录 · 规则</div>
          <div style={{padding:'12px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:8,fontSize:13,lineHeight:1.8,color:'var(--text-1)'}}>
            <div style={{marginBottom:8}}>每条记录包含 <b style={{color:'var(--text-0)'}}>类型 chip · 时间 · 操作人 · 备注</b>,按时间顺序由上至下追加。</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
              {(source === 'applied'
                ? ['submit','supplement','supplemented','reject','pass']
                : ['create','login','edit','freeze','unfreeze','suspend']
              ).map(k => {
                const m = OP_LOG_META[k];
                return (
                  <span key={k} style={{padding:'2px 10px',borderRadius:12,border:`1px solid ${m.color}`,color:m.color,background:m.bg,fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{m.label}</span>
                );
              })}
            </div>
            <ul style={{margin:'12px 0 0 0',paddingLeft:18,color:'var(--text-2)',fontSize:12.5,lineHeight:1.8}}>
              {source === 'applied' ? (<>
                <li><b style={{color:'var(--text-0)'}}>申请专业代理</b>:用户在<b>专业代理后台 Become a Partner</b>(AC1xxxxx) 首次提交申请时生成</li>
                <li><b style={{color:'var(--text-0)'}}>要求补件 / 已补件</b>:成对出现;可多次循环</li>
                <li><b style={{color:'var(--text-0)'}}>代理后台申请的用户</b>可用注册账号密码登录专业代理后台查看申请状态;被要求补件时点「立即补件」可重开注册表单重提</li>
                <li><b style={{color:'var(--text-0)'}}>通过 / 拒绝</b>:终态,记录后不再追加新事件</li>
                <li>申请通过后,该申请单的完整历史会<b>继承</b>到已创建代理的操作记录,后续在已创建代理页继续追加</li>
              </>) : (<>
                <li><b style={{color:'var(--text-0)'}}>创建专业代理帐户</b>:<b>代理后台自行申请</b>(AC1xxxxx)审核通过后自动创建(用注册时填的账号密码)</li>
                <li><b style={{color:'var(--text-0)'}}>首次登入(账户启用)</b>:代理后台申请的代理可直接用注册账号密码登入,首次登入即激活</li>
                <li><b style={{color:'var(--text-0)'}}>编辑</b>:商户在「查看&配置」中编辑「基本资料 / 分润模式 / 权限配置」并保存时追加(备注会标明 tab 名称)</li>
                <li><b style={{color:'var(--text-0)'}}>冻结帐户 / 再次启用 / 停用帐户</b>:商户在帐户状态行操作时追加</li>
                <li>代理后台申请通过的代理,会继承<b>申请审核期间</b>的所有操作日志(申请/补件/通过 等)</li>
              </>)}
            </ul>
          </div>
        </div>
      </div>
    </AM>
  );
}

// v2.4.4 全局模板配置弹窗 — 配置「要求补件」与「拒绝」模板内容
function TplConfigModal({ open, tpls, onClose, onSave, onReset }) {
  const [draft, setDraft] = React.useState(tpls);
  React.useEffect(() => { if (open) setDraft(tpls); }, [open, tpls]);
  if (!open) return null;
  const update = (cat, key, val) => setDraft({...draft, [cat]:{...draft[cat], [key]: val}});
  const Section = ({ catKey, label }) => (
    <div style={{marginBottom:18}}>
      <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--line)'}}>
        {label}
      </div>
      {['tpl1','tpl2'].map((k, idx) => (
        <div key={k} style={{marginBottom:10}}>
          <label style={{fontSize:12,color:'var(--text-2)',display:'block',marginBottom:4}}>模板{idx+1}</label>
          <textarea
            className="textarea"
            rows={2}
            value={draft[catKey][k]}
            onChange={e=>update(catKey, k, e.target.value)}
            style={{width:'100%'}}
          />
        </div>
      ))}
    </div>
  );
  return (
    <AM open={open} onClose={onClose} size="md"
      title="全局配置 · 审核模板"
      subtitle="配置「要求补件」和「拒绝」的快捷模板内容,审核时可直接套用"
      footer={<>
        <button className="btn ghost" onClick={onReset}>恢复默认</button>
        <span style={{flex:1}}/>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" onClick={()=>onSave(draft)}>保存</button>
      </>}>
      <Section catKey="supplement" label="要求补件 · 模板"/>
      <Section catKey="reject" label="拒绝 · 模板"/>
    </AM>
  );
}

// =============================================================
// v3.1.67 收款方式 视图(自行申请代理 + 已创建代理 共用)
// 布局:收款方式(整宽,锁定 UPI) → Account/IFSC → Email/Real Name
// props: { editing, value:{method,ifsc,account,realName,email}, onChange }
// =============================================================
window.PaymentInfoView = function PaymentInfoView({ editing, value, onChange }) {
  const v = value || { method:'UPI', ifsc:'', account:'', realName:'', email:'' };
  const set = (patch) => onChange && onChange({ ...v, ...patch });
  const monoFont = 'JetBrains Mono';

  const lockedBox = (
    <div style={{
      padding:'8px 12px', background:'#f8fafc',
      border:'1px solid var(--line)', borderRadius:6,
      fontSize:13, color:'var(--text-1)',
      height:36, display:'flex', alignItems:'center',
    }}>UPI</div>
  );

  const roStyle = {
    width:'100%', padding:'8px 12px', fontSize:13, height:36,
    border:'1px solid var(--line)', borderRadius:6,
    background:'var(--bg-2)', color:'var(--text-1)',
    outline:'none', cursor:'not-allowed', boxSizing:'border-box',
  };

  const Field = ({ label, children }) => (
    <div>
      <label style={{fontSize:12, color:'var(--text-2)', display:'block', marginBottom:6}}>{label}</label>
      {children}
    </div>
  );

  // v3.1.78 placeholder 改为「請輸入」;只读态没值时显示空白(不再带 fallback 示例值)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Field label="收款方式">{lockedBox}</Field>

      <div className="payment-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Account">
          {editing
            ? <input className="input" value={v.account || ''} placeholder="請輸入"
                onChange={e=>set({account:e.target.value})} style={{fontFamily:monoFont}}/>
            : <input readOnly value={v.account || ''} placeholder="請輸入" style={{...roStyle, fontFamily:monoFont}}/>}
        </Field>
        <Field label="IFSC">
          {editing
            ? <input className="input" value={v.ifsc || ''} placeholder="請輸入"
                onChange={e=>set({ifsc:e.target.value})} style={{fontFamily:monoFont}}/>
            : <input readOnly value={v.ifsc || ''} placeholder="請輸入" style={{...roStyle, fontFamily:monoFont}}/>}
        </Field>
      </div>

      <div className="payment-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Email">
          {editing
            ? <input className="input" value={v.email || ''} placeholder="請輸入"
                onChange={e=>set({email:e.target.value})} style={{fontFamily:monoFont}}/>
            : <input readOnly value={v.email || ''} placeholder="請輸入" style={{...roStyle, fontFamily:monoFont}}/>}
        </Field>
        <Field label="Real Name">
          {editing
            ? <input className="input" value={v.realName || ''} placeholder="請輸入"
                onChange={e=>set({realName:e.target.value})}/>
            : <input readOnly value={v.realName || ''} placeholder="請輸入" style={roStyle}/>}
        </Field>
      </div>
    </div>
  );
};

// v3.1.82 PermRow / PermSectionCard 提取到组件外,避免每次 render 重建组件类型导致 input 失焦
function _AgentPermRow({ label, on, onToggle }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', padding:'10px 0',
    }}>
      <span style={{flex:1, fontSize:13.5, color:'var(--text-0)'}}>{label}</span>
      <Switch on={!!on} onChange={onToggle}/>
    </div>
  );
}
function _AgentPermSectionCard({ title, children }) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{fontSize:13, color:'var(--text-1)', fontWeight:500, marginBottom:8}}>{title}</div>
      <div style={{
        border:'1px solid var(--line)', borderRadius:8,
        padding:'4px 14px', background:'#fff',
      }}>
        {children}
      </div>
    </div>
  );
}

window.AgentPermsForm = function AgentPermsForm({ value, onChange, errors }) {
  const E = errors || {};
  const v = value || {
    myAccount: true, codeManage: true, codeLimit: '',
    reportCode: true, reportPlayer: true, reportRevshare: true,
  };
  const set = (patch) => onChange({ ...v, ...patch });

  return (
    <div>
      {/* —— 运营 —— */}
      <_AgentPermSectionCard title="運營">
        <_AgentPermRow
          label="我的帳戶 (查看)"
          on={v.myAccount}
          onToggle={() => set({ myAccount: !v.myAccount })}
        />
        <div style={{borderTop:'1px solid var(--line-soft)'}}/>
        <_AgentPermRow
          label="Code與鏈接管理 (查看/編輯)"
          on={v.codeManage}
          onToggle={() => set({ codeManage: !v.codeManage })}
        />
        {v.codeManage && (
          <div style={{padding:'4px 0 14px'}}>
            <div style={{fontSize:12.5, color:'var(--text-1)', marginBottom:6}}>
              可創建邀請Code上限數量<span style={{color:'var(--danger)'}}>*</span>
            </div>
            <input
              type="number"
              min="1"
              value={v.codeLimit ?? ''}
              onChange={e => set({ codeLimit: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder="最少輸入 1"
              style={{
                width:'100%', padding:'8px 12px', fontSize:13, height:36,
                border:'1px solid ' + (E.codeLimit ? 'var(--danger)' : 'var(--line)'), borderRadius:6,
                background:'#fff', color:'var(--text-0)',
                outline:'none', boxSizing:'border-box',
              }}
            />
            {E.codeLimit && <div className="field-error" style={{marginTop:4}}>{E.codeLimit}</div>}
          </div>
        )}
      </_AgentPermSectionCard>

      {/* —— 报表 —— */}
      <_AgentPermSectionCard title="報表">
        <_AgentPermRow
          label="邀請Code與鏈接管理 (查看)"
          on={v.reportCode}
          onToggle={() => set({ reportCode: !v.reportCode })}
        />
        <div style={{borderTop:'1px solid var(--line-soft)'}}/>
        <_AgentPermRow
          label="玩家損益 (查看)"
          on={v.reportPlayer}
          onToggle={() => set({ reportPlayer: !v.reportPlayer })}
        />
        <div style={{borderTop:'1px solid var(--line-soft)'}}/>
        <_AgentPermRow
          label="分潤報表 (查看)"
          on={v.reportRevshare}
          onToggle={() => set({ reportRevshare: !v.reportRevshare })}
        />
      </_AgentPermSectionCard>
    </div>
  );
};
