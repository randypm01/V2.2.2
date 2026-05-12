// 代理账户管理
const { Modal: AM, StatusBadge: AS, RiskBadge: AR, PageHead: APH, SearchInput: ASI, Pagination: APG, Tabs: ATAB, Avatar: AAV, useToast: AUT, Drawer: ADR } = window.UI;

// v2.3.0 自行申请代理 共享 store — 让网站前台提交的数据能流入商户后台
const SELF_APPLICATIONS_INITIAL = [
  { id:'AP000001', name:'Anna_Group',    tier:'normal',  userId:'P34157319', parentId:'AG000000', parentName:'本商户',   contact:'+91 98123 45678',     region:'India · Mumbai',     reason:'个人 YouTube 频道 50k 订阅，主做 Cricket 内容',  channels:'YouTube · Instagram · WhatsApp Group', createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-11 23:59:59', state:'reviewing' },
  { id:'AP000002', name:'Noah_Group',    tier:'general', userId:'P34157320', parentId:'AG100001', parentName:'Anna_Group',  contact:'@noah_promo',         region:'India · Delhi',      reason:'团队 5 人，主播 + 推广运营',                                    channels:'Telegram 群 12,000+ · Discord',         createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-12 23:59:59', state:'supplement' },
  { id:'AP000003', name:'Noah_Group',    tier:'general', userId:'P34157321', parentId:'AG000000', parentName:'本商户',   contact:'+91 90876 54321',     region:'India · Bangalore',  reason:'已有完整推广团队和工具栈，3 个国家市场',                       channels:'Affiliate 网络 · App push',         createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-13 23:59:59', state:'supplemented' },
  { id:'AP000004', name:'Noah_Group',    tier:'general', userId:'P34157322', parentId:'AG000000', parentName:'本商户',   contact:'+91 87654 32109',     region:'India · Pune',       reason:'Instagram 网红 80k 粉丝',                                                channels:'Instagram · TikTok',                       createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-14 23:59:59', state:'failed',   failReason:'与现有代理 AG10042 渠道重叠较多，本次申请不通过' },
  { id:'AP000005', name:'Noah_Group',    tier:'general', userId:'P34157323', parentId:'AG000000', parentName:'本商户',   contact:'@vikram_aff',         region:'India · Ahmedabad',  reason:'隔壁平台代理 3 年，月均流水 ₹500 万',                                      channels:'Telegram · 群组',                   createdAt:'2026-05-11 23:59:59', updatedAt:'2026-05-14 23:59:59', state:'passed' },
];
// 全局共享 store: 网站前台提交 → 商户后台自行申请列表
if (!window.APS_APPS_STORE) {
  window.APS_APPS_STORE = { list: [...SELF_APPLICATIONS_INITIAL], listeners: new Set() };
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
    const maxNum = existing.reduce((m, x) => {
      const n = parseInt(String(x.id || '').replace(/^AP/, ''), 10);
      return Math.max(m, isNaN(n) ? 0 : n);
    }, 0);
    const nextNum = String(maxNum + 1).padStart(6, '0');
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
  reviewing:    { label:'待审核',       fg:'#d97706' },
  supplement:   { label:'要求补件',     fg:'#7c3aed' },
  supplemented: { label:'已补件待审核', fg:'#d97706' },
  failed:       { label:'拒绝',         fg:'#dc2626' },
  passed:       { label:'通过',         fg:'#16a34a' },
};

function AgentsModule({ initialDetail = null }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = AUT();
  const [agents, setAgents] = React.useState(D.agents.slice(0, 5));
  // v2.2.5 顶层来源分页:商户创建 / 自行申请
  const [source, setSource] = React.useState('merchant');
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const [createWay, setCreateWay] = React.useState('all');
  const [tier, setTier] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const [selected, setSelected] = React.useState(new Set());

  const filtered = React.useMemo(() => {
    return agents.filter((a, i) => {
      if (tab !== 'all' && a.status !== tab) return false;
      if (q && !(a.id+a.name).toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== 'all' && a.type !== type) return false;
      if (tier !== 'all' && a.tier !== tier) return false;
      const isApplied = i % 4 === 1;
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
        </div>
      )}

      {source === 'applied' && <SelfApplicationsList toast={toast} onCreateAgent={(app, form) => {
        const newAgent = {
          id: app.id,
          name: app.name,
          parent: form.parent || null,
          status: 'active',
          tier: form.type === 'individual' ? 'normal' : form.type === 'team' ? 'general' : 'super',
          level: 1,
          players: 0,
          created: new Date().toISOString(),
          risk: 'low',
          _displayId: app.id,
          _createWay: '自行申请代理',
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
          { key:'all', label:'全部代理', count: counts.all },
          { key:'active', label:'已启用', count: counts.active },
          { key:'frozen', label:'已冻结', count: counts.frozen },
          { key:'suspended', label:'已停用', count: counts.suspended },
          { key:'pending', label:'待审核', count: counts.pending },
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
                const AGENT_TYPE_LABELS = ['个人代理','团队代理','总代理'];
                const aType = AGENT_TYPE_LABELS[i % 3];
                const parentLabel = a.parent ? a.parent + '-' + (D.agents.find(x=>x.id===a.parent)?.name || 'Agent') : 'AG000000-本商户';
                const isApplied = i % 4 === 1; // mock: every 4th is 自行申请代理
                const createWay = isApplied ? '自行申请代理' : '商户创建代理';
                const displayId = isApplied ? 'AP' + String(100000 + i).padStart(6,'0') : a.id;
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
        const newId = 'AG' + String(100000 + agents.length).padStart(6,'0');
        setAgents([{...a, id: newId}, ...agents]);
        // v2.3.28 商户创建专业代理 也推送到登录账户
        if (window.APS_AGENT_ACCOUNTS && a.loginName && a.password) {
          window.APS_AGENT_ACCOUNTS.add({
            agentId: newId,
            userId: a.userId || ('P' + Math.floor(10000000 + Math.random()*90000000)),
            name: a.name,
            loginName: a.loginName,
            password: a.password,
            tier: a.tier || 'normal',
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          });
        }
        toast('代理 ' + a.name + ' 创建成功');
        setShowCreate(false);
      }}/>

      <ADR open={!!detail} onClose={()=>setDetail(null)} hideHeader={true}>
        {detail && <AgentDetail agent={detail} onClose={()=>setDetail(null)}/>}
      </ADR>
    </div>
  );
}

function CreateAgentModal({ open, onClose, onSubmit, prefill }) {
  const isApplied = !!prefill;
  const [form, setForm] = React.useState({
    name: '', loginName: '', password: '', type: 'Direct',
    parent: '', commission: 'RevShare', remark: '',
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
        <div style={{padding:'10px 4px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            {[
              {v:'CPA',l:'CPA',d:'每个有效CPA固定佣金'},
              {v:'RevShare',l:'RevShare',d:'按NGR分成比例'},
              {v:'Hybrid',l:'Hybrid',d:'CPA + RevShare 混合'},
            ].map(o => (
              <div key={o.v} onClick={()=>setForm({...form,commission:o.v})} style={{
                padding:18,border:'1.5px solid '+(form.commission===o.v?'var(--brand)':'var(--line)'),
                borderRadius:8,cursor:'pointer',
                background:form.commission===o.v?'#eff6ff':'#fff',
                transition:'all .15s ease',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:16,height:16,borderRadius:'50%',border:'1.5px solid '+(form.commission===o.v?'var(--brand)':'#cbd5e1'),
                    display:'grid',placeItems:'center',flexShrink:0}}>
                    {form.commission===o.v && <div style={{width:8,height:8,background:'var(--brand)',borderRadius:'50%'}}/>}
                  </div>
                  <b style={{color:'var(--text-0)',fontSize:15}}>{o.l}</b>
                </div>
                <div style={{fontSize:12,color:'var(--text-3)',marginTop:8,paddingLeft:26}}>{o.d}</div>
              </div>
            ))}
          </div>
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
  const [comm, setComm] = React.useState('RevShare');
  const [perms, setPerms] = React.useState({
    shareCode:true, viewPlayers:true, viewCommission:true, useApi:true, downloadMaterial:true,
    viewRisk:true, applyWithdraw:true, createSubAgent:false, viewSubAgent:false, viewCrossLayer:false,
  });
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
                <div><span className="ad-k">代理名称:</span><span className="ad-v">{agent.name}</span></div>
                <div></div>
                <div><span className="ad-k">登入帐号:</span><span className="ad-v text-mono">{agent._appData?.loginName || (agent.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent'}{isApplied ? '' : '001'}</span></div>
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
              <div><span className="ad-k">帐户状态:</span><span className={'status-pill ' + (statusCls[agent.status]||'')} style={{marginLeft:4}}>{statusMap[agent.status]||agent.status}</span></div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn sm" style={{borderColor:'#2563eb',color:'#2563eb'}}>冻结帐户</button>
                <button className="btn sm" style={{borderColor:'#dc2626',color:'#dc2626'}}>停用帐户</button>
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
            <textarea className="textarea" rows={4} readOnly value={agent.note || ''} placeholder="(未填写备注)"/>
          </div>
        )}

        {tab === 'commission' && (
          <div style={{padding:'4px 0'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[
                {v:'CPA',l:'CPA',d:'每个有效CPA固定佣金'},
                {v:'RevShare',l:'RevShare',d:'按NGR分成比例'},
                {v:'Hybrid',l:'Hybrid',d:'CPA + RevShare 混合'},
              ].map(o => (
                <div key={o.v} onClick={()=>setComm(o.v)} style={{
                  padding:16,border:'1.5px solid '+(comm===o.v?'var(--brand)':'var(--line)'),
                  borderRadius:8,cursor:'pointer',
                  background:comm===o.v?'#eff6ff':'#fff',
                  transition:'all .15s ease',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:14,height:14,borderRadius:'50%',border:'1.5px solid '+(comm===o.v?'var(--brand)':'#cbd5e1'),
                      display:'grid',placeItems:'center',flexShrink:0}}>
                      {comm===o.v && <div style={{width:7,height:7,background:'var(--brand)',borderRadius:'50%'}}/>}
                    </div>
                    <b style={{color:'var(--text-0)',fontSize:14}}>{o.l}</b>
                  </div>
                  <div style={{fontSize:11.5,color:'var(--text-3)',marginTop:6,paddingLeft:22}}>{o.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'perms' && (
          <div style={{padding:'4px 0'}}>
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

        {tab === 'logs' && (
          <div>
            <table className="ad-log-tbl">
              <thead>
                <tr><th>时间</th><th>操作人</th><th>操作</th></tr>
              </thead>
              <tbody>
                {isApplied ? (<>
                  <tr><td className="text-mono">2026-5-11 23:59:59</td><td>用户:{agent._appData?.userId || 'P34157319'}</td><td>申请专业代理</td></tr>
                  <tr><td className="text-mono">2026-5-12 23:59:59</td><td>商户:管理员-randy</td><td>要求补件:补件说明…</td></tr>
                  <tr><td className="text-mono">2026-5-13 23:59:59</td><td>用户:{agent._appData?.userId || 'P34157319'}</td><td>已补件</td></tr>
                  <tr><td className="text-mono">2026-5-14 23:59:59</td><td>商户:管理员-randy</td><td>拒绝:拒绝原因</td></tr>
                  <tr><td className="text-mono">2026-5-15 23:59:59</td><td>商户:管理员-randy</td><td>通过:创建专业代理帐户</td></tr>
                </>) : (<>
                  <tr>
                    <td className="text-mono">{fmtDT(agent.created)}</td>
                    <td>商户:管理员-randy</td>
                    <td>创建专业代理帐户</td>
                  </tr>
                  <tr>
                    <td className="text-mono">2026-05-11 14:23:08</td>
                    <td>商户:管理员-randy</td>
                    <td><a style={{color:'var(--brand)',cursor:'pointer'}}>编辑</a>:基本资料</td>
                  </tr>
                  <tr>
                    <td className="text-mono">2026-05-11 16:55:42</td>
                    <td>商户:管理员-randy</td>
                    <td><a style={{color:'var(--brand)',cursor:'pointer'}}>编辑</a>:帐户状态</td>
                  </tr>
                </>)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 底部 - 仅基本/分润/权限 有编辑按钮 */}
      {tab !== 'logs' && (
        <div className="agent-detail-foot">
          <button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}}>
            <Icon name="edit" size={12}/> 编辑
          </button>
        </div>
      )}
    </div>
  );
}

window.AgentsModule = AgentsModule;

// v2.2.5 自行申请代理列表组件 (v2.2.24 重构)
function SelfApplicationsList({ toast, onCreateAgent }) {
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
  const SUPPLEMENT_TPL = {
    tpl1: '请补充身份证正面·反面 + 手持证件照。',
    tpl2: '请补充推广渠道证明截图以及近 30 天粉丝及内容数据。',
  };
  const REJECT_TPL = {
    tpl1: '推广渠道与现有代理重叠较多,本次申请不通过。',
    tpl2: '提交资料不完整或不符合要求,本次申请不通过。',
  };
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
    setApps(apps.map(a => a.id === app.id ? {...a, state:newState, failReason: type==='pass' ? null : reason, updatedAt: nowStr} : a));
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
      <div style={{display:'flex',gap:0,padding:'0 16px',borderBottom:'1px solid var(--line)'}}>
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
        <button className="btn sm"><Icon name="download" size={12}/>导出申请记录</button>
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
                  <td><span style={{color:s.fg,fontWeight:500,fontSize:13}}>{s.label}</span></td>
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
                  <table className="ad-contact-tbl">
                    <thead><tr><th style={{width:160}}>时间</th><th style={{width:180}}>操作人</th><th>操作</th></tr></thead>
                    <tbody>
                      <tr><td className="text-mono">2026-5-11 23:59:59</td><td>用户:P34157319</td><td>申请专业代理</td></tr>
                      <tr><td className="text-mono">2026-5-12 23:59:59</td><td>商户:管理员-randy</td><td>要求补件:<span style={{color:'var(--brand)'}}>补件说明…</span></td></tr>
                      <tr><td className="text-mono">2026-5-13 23:59:59</td><td>用户:P34157319</td><td>已补件</td></tr>
                      <tr><td className="text-mono">2026-5-14 23:59:59</td><td>商户:管理员-randy</td><td>拒绝:<span style={{color:'var(--brand)'}}>拒绝原因…</span></td></tr>
                      <tr><td className="text-mono">2026-5-15 23:59:59</td><td>商户:管理员-randy</td><td>通过</td></tr>
                    </tbody>
                  </table>
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
