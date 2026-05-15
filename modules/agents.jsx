// 代理账户管理
const { Modal: AM, StatusBadge: AS, RiskBadge: AR, PageHead: APH, SearchInput: ASI, Pagination: APG, Tabs: ATAB, Avatar: AAV, useToast: AUT, Drawer: ADR } = window.UI;

// v2.3.0 自行申请代理 共享 store — 让网站前台提交的数据能流入商户后台
// v2.4.9 代理ID 规则：商户创建代理 = AG1xxxxx；自行申请代理 = AP2xxxxx
// v2.4.35 根据 app 当前 state 生成符合状态机的示例操作日志(若已有 _logs 则不动)
function seedAppLogs(app) {
  if (app._logs && app._logs.length) return app;
  const baseTime = app.createdAt || '2026-05-11 23:59:59';
  const userBy = `用户:${app.userId || '-'}`;
  const merchantBy = '商户:管理员-randy';
  const logs = [{ at: baseTime, by: userBy, type:'submit' }];
  const update = app.updatedAt || baseTime;
  if (app.state === 'supplement')      logs.push({ at: update, by: merchantBy, type:'supplement',   note: app.failReason || '请补充身份证正面·反面 + 手持证件照' });
  if (app.state === 'supplemented')  { logs.push({ at:'2026-05-12 12:30:00', by:merchantBy, type:'supplement', note:'请补充推广渠道证明截图' }); logs.push({ at: update, by:userBy, type:'supplemented', note:'已补充推广渠道截图与近 30 天数据' }); }
  if (app.state === 'failed')          logs.push({ at: update, by: merchantBy, type:'reject',       note: app.failReason || '与现有代理渠道重叠较多,本次申请不通过' });
  if (app.state === 'passed')          logs.push({ at: update, by: merchantBy, type:'pass',         note: '由管理员手动创建专业代理账户' });
  return { ...app, _logs: logs };
}
const SELF_APPLICATIONS_INITIAL = [
  { id:'AP200001', name:'AP範例1',    tier:'normal',  userId:'P34157319', parentId:'AG000000', parentName:'本商户',   contact:'+91 98123 45678',     region:'India · Mumbai',     reason:'个人 YouTube 频道 50k 订阅，主做 Cricket 内容',  channels:'YouTube · Instagram · WhatsApp Group', createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-11 23:59:59', state:'reviewing' },
  { id:'AP200002', name:'AP範例2',    tier:'normal',  userId:'P34157320', parentId:'AG100001', parentName:'Anna_Group',  contact:'@noah_promo',         region:'India · Delhi',      reason:'团队 5 人，主播 + 推广运营',                                    channels:'Telegram 群 12,000+ · Discord',         createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-12 23:59:59', state:'supplement' },
  { id:'AP200003', name:'AP範例3',    tier:'normal',  userId:'P34157321', parentId:'AG000000', parentName:'本商户',   contact:'+91 90876 54321',     region:'India · Bangalore',  reason:'已有完整推广团队和工具栈，3 个国家市场',                       channels:'Affiliate 网络 · App push',         createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-13 23:59:59', state:'supplemented' },
  { id:'AP200004', name:'AP範例4',    tier:'general', userId:'P34157322', parentId:'AG000000', parentName:'本商户',   contact:'+91 87654 32109',     region:'India · Pune',       reason:'Instagram 网红 80k 粉丝',                                                channels:'Instagram · TikTok',                       createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-14 23:59:59', state:'failed',   failReason:'与现有代理 AG10042 渠道重叠较多，本次申请不通过' },
  { id:'AP200005', name:'AP範例5',    tier:'super',   userId:'P34157323', parentId:'AG000000', parentName:'本商户',   contact:'@vikram_aff',         region:'India · Ahmedabad',  reason:'隔壁平台代理 3 年，月均流水 ₹500 万',                                      channels:'Telegram · 群组',                   createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-14 23:59:59', state:'passed' },
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
    // v2.3.15 基于已存在代理ID 中最大 AP 编号 +1,避免删除后冲突
    // v2.4.9 自行申请代理 ID 以 AP2xxxxx 开头(最小 AP200001)
    // v2.4.22 同时把已审核通过、已落到「已创建代理」store 中的 AP 也纳入计算,避免与已存在 AP 冲突(如 AP範例6 = AP200006)
    const apFromApps = existing.map(x => parseInt(String(x.id || '').replace(/^AP/, ''), 10));
    const apFromAgents = (window.APS_MERCHANT_AGENTS_STORE?.list || [])
      .map(x => parseInt(String(x._displayId || x.id || '').replace(/^AP/, ''), 10));
    const maxNum = [...apFromApps, ...apFromAgents]
      .filter(n => !isNaN(n))
      .reduce((m, n) => Math.max(m, n), 0);
    const nextNum = String(Math.max(maxNum + 1, 200001)).padStart(6, '0');
    const full = {
      id: app.id || ('AP' + nextNum),
      name: app.name || '未填写',
      tier: app.tier || 'normal',
      userId: app.userId || ('P' + Math.floor(10000000 + Math.random()*90000000)),
      parentId: app.parentId || 'AG000000',
      parentName: app.parentName || '本商户',
      contact: app.contact || '',
      region: app.region || '',
      reason: app.reason || '',
      channels: app.channels || '',
      _formSnapshot: app._formSnapshot || null,
      createdAt: app.createdAt || nowStr,
      updatedAt: app.updatedAt || nowStr,
      state: 'reviewing',
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
  if (window.APS_MERCHANT_AGENTS_STORE) return window.APS_MERCHANT_AGENTS_STORE;
  const D = window.APS_DATA;
  // v2.4.20 把「代理类型 / 创建方式 / displayId」固化为每个 agent 的属性,避免 index 移位后错位
  const FIXED_TYPES = ['个人代理','个人代理','团队代理','总代理','个人代理'];
  const FIXED_DISPLAY_IDS = [null, null, null, null, 'AP200006'];
  const FIXED_CREATE_WAYS = ['商户创建代理','商户创建代理','商户创建代理','商户创建代理','自行申请代理'];
  const initial = D.agents.slice(0, 5).map((a, i) => {
    const baked = {
      ...a,
      _aType: FIXED_TYPES[i],
      _createWay: FIXED_CREATE_WAYS[i],
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
        contacts: '+91 98123 45678',
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
  return window.APS_MERCHANT_AGENTS_STORE;
}
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
      const isApplied = a._createWay === '自行申请代理';
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
          <button className="btn primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={13}/>创建专业代理</button>
          <button className="btn"><Icon name="upload" size={13}/>批量导入</button>
          <button className="btn"><Icon name="download" size={13}/>导出</button>
          <span style={{flex:1}}/>
          <button className="btn ghost" onClick={()=>setShowHelp(true)}><Icon name="info" size={13}/>说明</button>
        </div>
      )}

      {source === 'applied' && (
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <button className="btn primary" onClick={()=>setShowTplConfig(true)}><Icon name="settings" size={13}/>全局配置</button>
          <button className="btn"><Icon name="download" size={13}/>导出</button>
          <span style={{flex:1}}/>
          <button className="btn ghost" onClick={()=>setShowHelp(true)}><Icon name="info" size={13}/>说明</button>
        </div>
      )}
      {source === 'applied' && <SelfApplicationsList toast={toast} tpls={tpls} onCreateAgent={(app, form) => {
        const aType = form.type === 'individual' ? '个人代理' : form.type === 'team' ? '团队代理' : '总代理';
        const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
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
          _createWay: '自行申请代理',
          _displayId: app.id,
          _logs: inheritedLogs,
          level: 1,
          players: 0,
          created: new Date().toISOString(),
          risk: 'low',
          _displayId: app.id,
          _createWay: '自行申请代理',
          // v2.4.47 烘入分润模式 + 权限,使「查看&配置 → 分润模式 / 权限配置」能正确显示
          _comm: form.commission || { kind:'weekly', weekday:1, monthday:1, plans:[''] },
          _perms: form.perms,
          _appData: {
            userId: app.userId || 'P34157319',
            reason: app.reason || '',
            channels: app.channels || '',
            note: form.note || '',
            loginName: form.loginName,
            contacts: form.contacts,
            appliedAt: app.createdAt || '2026-05-11 23:59:59',
            history: app.history || [],
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
            <option value="applied">自行申请代理</option>
          </select>
          <select className="filter-select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="all">全部代理类型</option>
            <option value="individual">个人代理</option>
            <option value="team">团队代理</option>
            <option value="super">总代理</option>
          </select>
          <select className="filter-select" value={tier} onChange={e=>setTier(e.target.value)}>
            <option value="all">全部等级</option>
            {D.AGENT_LEVELS.map(t => <option key={t} value={t}>{D.LABELS.tiers[t] || t}</option>)}
          </select>
          <select className="filter-select"><option>全部风险等级</option><option>低</option><option>中</option><option>高</option></select>
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
                <th>代理类型</th>
                <th>上级代理ID-名称</th>
                <th>代理等级</th>
                <th className="right">玩家数</th>
                <th>风险等级</th>
                <th>账户状态</th>
                <th>更新时间</th>
                <th>创建时间</th>
                <th style={{minWidth:120}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a,i) => {
                // v2.4.20 使用烘在 agent 上的属性,不再依赖 index(防止新增代理后错位)
                const isApplied = a._createWay === '自行申请代理';
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
                    <td>{aType}</td>
                    <td className="text-mono" style={{fontSize:12}}>{parentLabel}</td>
                    <td className="text-mono center">LV-{a.level}</td>
                    <td className="right">{F.fmtNum(a.players)}</td>
                    <td><AR level={a.risk}/></td>
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

      <CreateAgentModal open={showCreate} onClose={()=>setShowCreate(false)} onSubmit={(a)=>{
        // v2.4.21 新ID = 现有商户创建代理中最大 AG 编号 + 1(AP200xxx 行不参与计算),保证连续
        const maxAg = Math.max(100000, ...agents
          .filter(x => x._createWay !== '自行申请代理')
          .map(x => parseInt(String(x._displayId || x.id).replace(/^AG/, ''), 10))
          .filter(n => !isNaN(n)));
        const newId = 'AG' + String(maxAg + 1).padStart(6, '0');
        // v2.4.15 修复:补全新建代理对象的必要字段(status/created/players/risk/level/tier),避免渲染时 new Date(undefined).toISOString() 崩溃
        const tier = a.tier || (a.type === 'individual' ? 'normal' : a.type === 'team' ? 'general' : a.type === 'super' ? 'super' : 'normal');
        const aType = tier === 'normal' ? '个人代理' : tier === 'general' ? '团队代理' : '总代理';
        const newAgent = {
          ...a,
          id: newId,
          // v2.4.16 新创建代理默认为未启用,待首次登入成功后自动改为已启用
          status: a.status || 'pending',
          tier,
          level: a.level || 1,
          players: a.players || 0,
          activeCpa: 0,
          commission: 0,
          pendingCommission: 0,
          ngr: 0,
          risk: a.risk || 'low',
          parent: a.parent || null,
          created: a.created || Date.now(),
          lastLogin: Date.now(),
          // v2.4.20 烘入创建方式 / 代理类型标签 / displayId
          _aType: aType,
          _createWay: '商户创建代理',
          _displayId: newId,
          // v2.4.35 创建时初始日志
          _logs: [{ at: new Date().toISOString().slice(0,19).replace('T',' '), by: '商户:管理员-randy', type: 'create' }],
          // v2.4.47 烘入分润模式 + 权限,使「查看&配置 → 分润模式 / 权限配置」能正确显示
          _comm: a.commission || { kind:'weekly', weekday:1, monthday:1, plans:[''] },
          _perms: a.perms,
        };
        setAgents([newAgent, ...agents]);
        // v2.3.28 商户创建专业代理 也推送到登录账户
        if (window.APS_AGENT_ACCOUNTS && a.loginName && a.password) {
          window.APS_AGENT_ACCOUNTS.add({
            agentId: newId,
            userId: a.userId || ('P' + Math.floor(10000000 + Math.random()*90000000)),
            name: a.name,
            loginName: a.loginName,
            password: a.password,
            tier,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          });
        }
        toast('代理 ' + a.name + ' 创建成功');
        setShowCreate(false);
      }}/>

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
    commission: { kind:'weekly', weekday:1, monthday:1, plans:[''] },
    contacts: [{type:'Email',value:''},{type:'手机',value:'',dial:'+91'}],
    perms: {
      shareCode:true, viewPlayers:true, viewCommission:true, useApi:true, downloadMaterial:true,
      viewRisk:true, applyWithdraw:true, createSubAgent:false, viewSubAgent:false, viewCrossLayer:false,
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
        contacts: [
          {type:'Email', value:'123@gmail.com'},
          {type:'手机', value:'1234567890', dial:'+91'},
          {type:'Telegram', value:'@123ksjdla'},
        ],
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

  const validate = () => {
    const e = {};
    if (!form.name) e.name = '代理名称必填';
    if (!form.loginName) e.loginName = '登录账号必填';
    if (form.loginName && form.loginName.length < 4) e.loginName = '至少 4 个字符';
    if (!form.password) e.password = '密码必填';
    if (form.password && form.password.length < 8) e.password = '至少 8 位';
    if (!form.contacts[0]?.value || !form.contacts[1]?.value) e.contacts = '至少填写前两项联系方式';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validate()) return;
    setStep(step + 1);
  };
  const submit = () => onSubmit(form);

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
        {step < 3 && <button className="btn primary" onClick={next}>下一步：{step===1?'分润模式':'权限配置'} <Icon name="chevronRight" size={12}/></button>}
        {step === 3 && <button className="btn primary" onClick={submit}><Icon name="check" size={13}/> 创建代理账户</button>}
      </>}>

      {/* 步骤指示器 3 步 */}
      <div style={{display:'flex',alignItems:'center',marginBottom:22,padding:'0 10px'}}>
        {[
          {n:1,l:'基本资料'},{n:2,l:'分润模式'},{n:3,l:'权限配置'},
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
            <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center'}}>{isApplied ? '自行申请代理' : '商户创建代理'}</div>
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
            <input className={'input ' + (errors.loginName?'error':'')} placeholder="如: AGlatam" value={form.loginName} onChange={e=>setForm({...form,loginName:e.target.value})}/>
            {errors.loginName && <div className="field-error">{errors.loginName}</div>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>初始密码 <span style={{color:'var(--danger)'}}>*</span></label>
            <input className={'input ' + (errors.password?'error':'')} type="password" placeholder="至少 8 位" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理类型 <span style={{color:'var(--danger)'}}>*</span></label>
            <select className="select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="">请选择 …</option>
              <option value="individual">个人代理</option>
              <option value="team">团队代理</option>
              <option value="super">总代理</option>
            </select>
          </div>
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
            <div>
              <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>用户ID</label>
              <div style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--text-1)',height:36,display:'flex',alignItems:'center',fontFamily:'JetBrains Mono'}}>{prefill.userId || 'P34157319'}</div>
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
                        <div className="contact-phone-input">
                          <select className="contact-phone-dial" value={c.dial || '+91'} onChange={e=>updateContact(idx,'dial',e.target.value)}>
                            {COUNTRY_CODES.map(o => <option key={o.code} value={o.code}>{o.code} {o.name}</option>)}
                          </select>
                          <input className="input" placeholder={CONTACT_PH[c.type]||''} value={c.value} onChange={e=>updateContact(idx,'value',e.target.value)}/>
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

          {isApplied && <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>申请理由 / 推广渠道说明<span style={{color:'var(--danger)'}}>*</span></label>
            <textarea className="textarea" rows={3} readOnly value={form.remark} placeholder="请描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式…"/>
          </div>}

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
            onJumpPlanMgr={()=>{ /* 在弹窗內,不跳轉 — 如需跳轉可在这里 onClose+路由 */ 
              if (typeof window.goRoute === 'function') { onClose(); window.goRoute('mod:revshare'); }
            }}
          />
        </div>
      )}

      {step === 3 && (
        <div style={{padding:'6px 4px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px 32px'}}>
            {[
              ['shareCode','可创建分享Code'],['viewRisk','可查看风控名单'],
              ['viewPlayers','可查看玩家列表'],['applyWithdraw','可申请提款'],
              ['viewCommission','可查看佣金'],['createSubAgent','可创建下级代理'],
              ['useApi','可使用 API'],['viewSubAgent','可查看下级代理'],
              ['downloadMaterial','可下载素材'],['viewCrossLayer','可查看下级跨层数据'],
            ].map(([k,label]) => (
              <div key={k} style={{display:'flex',alignItems:'center',padding:'4px 0'}}>
                <span style={{flex:1,fontSize:13.5,color:'var(--text-0)'}}>{label}</span>
                <Switch on={form.perms[k]} onChange={()=>togglePerm(k)}/>
              </div>
            ))}
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
    shareCode:true, viewPlayers:true, viewCommission:true, useApi:true, downloadMaterial:true,
    viewRisk:true, applyWithdraw:true, createSubAgent:false, viewSubAgent:false, viewCrossLayer:false,
  });
  const [name, setName] = React.useState(agent.name);
  const [loginName, setLoginName] = React.useState(agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent');
  const [note, setNote] = React.useState(agent.note || '');
  // v3.0.15 流量来源 + 收款方式
  const _defaultTraffic = () => {
    if (agent._traffic && agent._traffic.length) return [...agent._traffic];
    // 默认 3 个示例频道
    return [
      'https://youtube.com/@' + (agent.name || 'agent').toLowerCase().replace(/\s/g,''),
      'https://t.me/' + (agent.name || 'agent').toLowerCase().replace(/\s/g,'') + '_channel',
    ];
  };
  const _defaultPayment = () => agent._payment || { method:'UPI', upiId: (agent._appData?.loginName || 'user') + '@paytm', holder: agent.name || '' };
  const [traffic, setTraffic] = React.useState(_defaultTraffic());
  const [payment, setPayment] = React.useState(_defaultPayment());
  React.useEffect(() => {
    setName(agent.name);
    setLoginName(agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent');
    setNote(agent.note || '');
    setComm(_normComm(agent._comm));
    setPerms(agent._perms || {
      shareCode:true, viewPlayers:true, viewCommission:true, useApi:true, downloadMaterial:true,
      viewRisk:true, applyWithdraw:true, createSubAgent:false, viewSubAgent:false, viewCrossLayer:false,
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
      shareCode:true, viewPlayers:true, viewCommission:true, useApi:true, downloadMaterial:true,
      viewRisk:true, applyWithdraw:true, createSubAgent:false, viewSubAgent:false, viewCrossLayer:false,
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
  const createWay = agent._createWay || '商户创建代理';
  const isApplied = createWay === '自行申请代理';
  const avatarText = isApplied ? 'AP' : 'AG';
  const avatarBg = isApplied ? '#10b981' : 'var(--brand)';
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
              <div className="ad-info-grid">
                <div><span className="ad-k">代理创建方式:</span><span className="ad-v">{createWay}</span></div>
                {isApplied
                  ? <div><span className="ad-k">用户ID:</span><span className="ad-v text-mono">{agent._appData?.userId || 'P34157319'}</span></div>
                  : <div><span className="ad-k">创建代理人:</span><span className="ad-v">randy</span></div>}
                <div><span className="ad-k">代理ID:</span><span className="ad-v text-mono">{displayId}</span></div>
                <div><span className="ad-k">创建时间:</span><span className="ad-v text-mono">{isApplied ? (agent._appData?.appliedAt || '2026-5-11 23:59:59') : fmtDT(agent.created)}</span></div>
                <div><span className="ad-k">代理名称:</span>
                  {editing
                    ? <input className="input sm" value={name} onChange={e=>setName(e.target.value)} style={{height:24,fontSize:13,padding:'2px 8px',width:'70%'}}/>
                    : <span className="ad-v">{name}</span>}</div>
                <div></div>
                <div><span className="ad-k">登入帐号:</span>
                  {editing
                    ? <input className="input sm" value={loginName} onChange={e=>setLoginName(e.target.value)} style={{height:24,fontSize:13,padding:'2px 8px',width:'70%',fontFamily:'JetBrains Mono'}}/>
                    : <span className="ad-v text-mono">{loginName}</span>}</div>
                <div></div>
                <div><span className="ad-k">登入密码:</span><span className="ad-v text-mono">********</span></div>
                <div></div>
                <div><span className="ad-k">代理类型:</span><span className="ad-v">个人代理</span></div>
                <div></div>
                <div><span className="ad-k">上级代理:</span><span className="ad-v text-mono">{parentLabel}</span></div>
                <div></div>
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
                  <tr><td>Email</td><td className="text-mono">123@gmail.com</td></tr>
                  <tr><td>手机</td><td className="text-mono">+91 1234567890</td></tr>
                  <tr><td>Telegram</td><td className="text-mono">@123ksjdla</td></tr>
                </tbody>
              </table>
            </div>

            {isApplied && (<>
              <div className="ad-section-title">申请理由 / 推广渠道说明<span style={{color:'var(--danger)'}}>*</span></div>
              <textarea className="textarea" rows={4} readOnly value={agent._appData?.reason || ''} placeholder="请描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式..."/>
            </>)}

            <div className="ad-section-title">备注</div>
            <textarea className="textarea" rows={4} readOnly={!editing} value={note} onChange={e=>setNote(e.target.value)} placeholder="(未填写备注)" style={{background: editing ? '#fff' : '#f8fafc'}}/>
          </div>
        )}

        {tab === 'commission' && (
          <div style={{padding:'4px 0',opacity: editing ? 1 : 0.85, pointerEvents: editing ? 'auto' : 'none'}}>
            <window.CommissionModeForm
              value={comm}
              onChange={setComm}
            />
          </div>
        )}

        {tab === 'perms' && (
          <div style={{padding:'4px 0',opacity: editing ? 1 : 0.85, pointerEvents: editing ? 'auto' : 'none'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px 28px'}}>
              {[
                ['shareCode','可创建分享Code'],['viewRisk','可查看风控名单'],
                ['viewPlayers','可查看玩家列表'],['applyWithdraw','可申请提款'],
                ['viewCommission','可查看佣金'],['createSubAgent','可创建下级代理'],
                ['useApi','可使用 API'],['viewSubAgent','可查看下级代理'],
                ['downloadMaterial','可下载素材'],['viewCrossLayer','可查看下级跨层数据'],
              ].map(([k,label]) => (
                <div key={k} style={{display:'flex',alignItems:'center',padding:'4px 0'}}>
                  <span style={{flex:1,fontSize:13,color:'var(--text-0)'}}>{label}</span>
                  <Switch on={perms[k]} onChange={()=>setPerms({...perms,[k]:!perms[k]})}/>
                </div>
              ))}
            </div>
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
            <div className="ad-section-title">收款方式</div>
            <div className="ad-info-card">
              <div className="ad-info-grid">
                <div>
                  <span className="ad-k">付款方式:</span>
                  <span className="ad-v">
                    <span style={{padding:'2px 10px',background:'#dbeafe',color:'#1e40af',borderRadius:99,fontSize:12,fontWeight:600}}>UPI</span>
                  </span>
                </div>
                <div></div>
                <div>
                  <span className="ad-k">UPI ID:</span>
                  {editing
                    ? <input className="input sm" value={payment.upiId || ''} onChange={e=>setPayment({...payment,upiId:e.target.value})} placeholder="example@paytm" style={{height:24,fontSize:13,padding:'2px 8px',width:'70%',fontFamily:'JetBrains Mono'}}/>
                    : <span className="ad-v text-mono">{payment.upiId || '-'}</span>}
                </div>
                <div></div>
                <div>
                  <span className="ad-k">收款人姓名:</span>
                  {editing
                    ? <input className="input sm" value={payment.holder || ''} onChange={e=>setPayment({...payment,holder:e.target.value})} placeholder="持卡人姓名" style={{height:24,fontSize:13,padding:'2px 8px',width:'70%'}}/>
                    : <span className="ad-v">{payment.holder || '-'}</span>}
                </div>
                <div></div>
              </div>
            </div>
            <div style={{marginTop:12,padding:'10px 14px',background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:6,fontSize:12.5,color:'#92400e',lineHeight:1.6}}>
              <Icon name="info" size={12}/> 当前阶段仅支持 UPI 付款,后续如开放其他渠道(银行 / USDT / Skrill 等)会在此处增加选项
            </div>
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
  const [q, setQ] = React.useState('');
  const [detail, setDetail] = React.useState(null);
  const [detailTab, setDetailTab] = React.useState('basic');
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
      <div style={{display:'flex',gap:0,padding:'0 16px',borderBottom:'1px solid var(--line)',alignItems:'center'}}>
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
        <select className="filter-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="all">全部代理类型</option>
          <option value="normal">个人代理</option>
          <option value="general">团队代理</option>
          <option value="super">总代理</option>
        </select>
        <span style={{flex:1}}/>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>代理ID</th>
              <th>代理名称</th>
              <th>代理类型</th>
              <th>用户ID</th>
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
                  <td>{TIER_LABEL[a.tier]}</td>
                  <td className="text-mono" style={{fontSize:12}}>{a.userId || <span className="text-mute">—</span>}</td>
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
              <tr><td colSpan={9} style={{textAlign:'center',padding:32,color:'var(--text-3)'}}>暂无申请记录</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.32)',zIndex:120}} onClick={()=>setDetail(null)}>
          <div className="agent-detail" style={{position:'absolute',right:0,top:0,height:'100vh',width:680,boxShadow:'-8px 0 32px rgba(0,0,0,.12)'}} onClick={e=>e.stopPropagation()}>
            <div className="agent-detail-head">
              <div style={{display:'flex',gap:14,alignItems:'center',flex:1}}>
                <div className="agent-detail-avatar" style={{background:'#10b981'}}>AP</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <span style={{fontSize:20,color:'var(--text-0)',fontWeight:600,lineHeight:1.2}}>{detail.name}</span>
                  <span style={{fontSize:14,color:'var(--text-2)',fontFamily:'JetBrains Mono',lineHeight:1.2}}>{detail.id}</span>
                </div>
              </div>
              <button className="close" onClick={()=>setDetail(null)}><Icon name="x" size={16}/></button>
            </div>
            <div className="agent-detail-tabs">
              <div className={'ad-tab '+(detailTab==='basic'?'active':'')} onClick={()=>setDetailTab('basic')}>申请资料</div>
              <div className={'ad-tab '+(detailTab==='logs'?'active':'')} onClick={()=>setDetailTab('logs')}>操作记录</div>
            </div>
            <div className="agent-detail-body">
              {detailTab==='logs' ? (
                <>
                  <div className="ad-section-title">审核进度</div>
                  <LogTimeline logs={detail._logs || []}/>
                </>
              ) : <>
              <div className="ad-section-title">基本资料</div>
              <div className="ad-info-card">
                <div className="ad-info-grid">
                  <div><span className="ad-k">代理创建方式:</span><span className="ad-v">自行申请代理</span></div>
                  <div><span className="ad-k">用户ID:</span><span className="ad-v text-mono">{detail.userId || '—'}</span></div>
                  <div><span className="ad-k">代理ID:</span><span className="ad-v text-mono">{detail.id}</span></div>
                  <div><span className="ad-k">创建时间:</span><span className="ad-v text-mono">{detail.createdAt}</span></div>
                  <div><span className="ad-k">代理名称:</span><span className="ad-v">{detail.name}</span></div>
                  <div></div>
                  <div><span className="ad-k">代理类型:</span><span className="ad-v">{TIER_LABEL[detail.tier]}</span></div>
                  <div></div>
                  <div><span className="ad-k">上级代理:</span><span className="ad-v text-mono">{detail.parentId}-{detail.parentName}</span></div>
                  <div></div>
                </div>
              </div>

              <div className="ad-section-title mt-4">联系方式</div>
              <table className="ad-contact-tbl">
                <thead><tr><th style={{width:140}}>联系类型</th><th>联系资料</th></tr></thead>
                <tbody>
                  <tr><td>Email</td><td className="text-mono">123@gmail.com</td></tr>
                  <tr><td>手机</td><td className="text-mono">+91 1234567890</td></tr>
                  <tr><td>Telegram</td><td className="text-mono">@123ksjdla</td></tr>
                </tbody>
              </table>

              <div className="ad-section-title mt-4">申请理由 / 推广渠道说明<span style={{color:'var(--danger)'}}>*</span></div>
              <textarea className="textarea" rows={4} readOnly value={detail.reason || ''} placeholder="请描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式..." style={{width:'100%'}}/>

              {detail.failReason && <>
                <div className="ad-section-title mt-4">{detail.state==='failed'?'拒绝原因':'补件说明'}</div>
                <div style={{padding:'10px 12px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,fontSize:13,lineHeight:1.6,color:'#991b1b'}}>{detail.failReason}</div>
              </>}
              </>}
            </div>
            {detailTab==='basic' && (
              <div className="agent-detail-foot" style={{justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:13,color:'var(--text-1)'}}>申请进度: <span style={{color:APP_STATE_META[detail.state].fg,fontWeight:600}}>{APP_STATE_META[detail.state].label}</span></div>
                {(detail.state==='reviewing'||detail.state==='supplement'||detail.state==='supplemented') && (
                  <div style={{display:'flex',gap:8}}>
                    <button className="app-act-btn" style={{color:'#7c3aed',borderColor:'#ddd6fe',padding:'5px 12px'}} onClick={()=>openAction('supplement',detail)}>要求补件</button>
                    <button className="app-act-btn" style={{color:'#dc2626',borderColor:'#fecaca',padding:'5px 12px'}} onClick={()=>openAction('reject',detail)}>拒绝</button>
                    <button className="app-act-btn" style={{color:'#16a34a',borderColor:'#bbf7d0',padding:'5px 12px'}} onClick={()=>{setPassApp(detail); setDetail(null);}}>通过</button>
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
            {source !== 'applied' && (
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <span className="mono" style={{flexShrink:0,minWidth:96,padding:'2px 8px',background:'#dbeafe',color:'#1d4ed8',borderRadius:4,fontWeight:600,fontSize:12}}>AG1xxxxx</span>
                <div style={{flex:1,lineHeight:1.6}}><b style={{color:'var(--text-0)'}}>商户创建代理</b> — ID 以 <code className="mono">AG1</code> 开头(如 AG100001、AG100002 …),由商户在「已创建代理」页创建时自动分配,顺序递增</div>
              </div>
            )}
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <span className="mono" style={{flexShrink:0,minWidth:96,padding:'2px 8px',background:'#dcfce7',color:'#15803d',borderRadius:4,fontWeight:600,fontSize:12}}>AP2xxxxx</span>
              <div style={{flex:1,lineHeight:1.6}}><b style={{color:'var(--text-0)'}}>自行申请代理</b> — ID 以 <code className="mono">AP2</code> 开头(如 AP200001、AP200002 …),由用户在网站前台提交申请时自动分配,与 AG 不冲突</div>
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
                    <Chip color="#1d4ed8" bg="#dbeafe">商户直接创建</Chip>
                    <Arrow label="点击「创建专业代理」"/>
                    <StatusChip k="pending">未启用</StatusChip>
                    <span style={{color:'var(--text-3)'}}>(账户已创建,等待首次登入)</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <Chip color="#15803d" bg="#dcfce7">自行申请代理</Chip>
                    <Arrow label="商户审核 · 通过"/>
                    <span style={{color:'var(--text-2)'}}>管理员手动创建账户</span>
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
                  <span style={{color:'var(--text-3)',minWidth:60}}>用户提交</span>
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
                <li><b style={{color:'var(--text-0)'}}>申请专业代理</b>:用户在网站前台首次提交申请时生成</li>
                <li><b style={{color:'var(--text-0)'}}>要求补件 / 已补件</b>:成对出现;可多次循环</li>
                <li><b style={{color:'var(--text-0)'}}>通过 / 拒绝</b>:终态,记录后不再追加新事件</li>
                <li>申请通过后,该申请单的完整历史会<b>继承</b>到已创建代理的操作记录,后续在已创建代理页继续追加</li>
              </>) : (<>
                <li><b style={{color:'var(--text-0)'}}>创建专业代理帐户</b>:商户创建 或 自行申请审核通过 时生成</li>
                <li><b style={{color:'var(--text-0)'}}>首次登入(账户启用)</b>:代理首次成功登入专业代理后台时自动生成</li>
                <li><b style={{color:'var(--text-0)'}}>编辑</b>:商户在「查看&配置」中编辑「基本资料 / 分润模式 / 权限配置」并保存时追加(备注会标明 tab 名称)</li>
                <li><b style={{color:'var(--text-0)'}}>冻结帐户 / 再次启用 / 停用帐户</b>:商户在帐户状态行操作时追加</li>
                <li>自行申请通过的代理,会继承<b>申请审核期间</b>的所有操作日志(申请/补件/通过 等)</li>
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
