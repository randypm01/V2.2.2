// 代理账户管理
const { Modal: AM, StatusBadge: AS, RiskBadge: AR, PageHead: APH, SearchInput: ASI, Pagination: APG, Tabs: ATAB, Avatar: AAV, useToast: AUT, Drawer: ADR } = window.UI;

function AgentsModule({ initialDetail = null }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = AUT();
  const [agents, setAgents] = React.useState(D.agents);
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const [tier, setTier] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const [selected, setSelected] = React.useState(new Set());

  const filtered = React.useMemo(() => {
    return agents.filter(a => {
      if (tab !== 'all' && a.status !== tab) return false;
      if (q && !(a.id+a.name).toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== 'all' && a.type !== type) return false;
      if (tier !== 'all' && a.tier !== tier) return false;
      return true;
    });
  }, [agents, tab, q, type, tier]);
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

  return (
    <div className="page">
      <APH title="代理账户管理" subtitle="管理所有专业代理账户与权限配置">
        <button className="btn"><Icon name="upload" size={13}/>批量导入</button>
        <button className="btn"><Icon name="download" size={13}/>导出</button>
        <button className="btn primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={13}/>创建专业代理</button>
      </APH>

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
          <select className="filter-select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="all">全部类型</option>
            {D.AGENT_TYPES.map(t => <option key={t} value={t}>{D.LABELS.types[t] || t}</option>)}
          </select>
          <select className="filter-select" value={tier} onChange={e=>setTier(e.target.value)}>
            <option value="all">全部等级</option>
            {D.AGENT_LEVELS.map(t => <option key={t} value={t}>{D.LABELS.tiers[t] || t}</option>)}
          </select>
          <select className="filter-select"><option>全部国家</option>{D.COUNTRIES.map(c=><option key={c} value={c}>{D.LABELS.countries[c] || c}</option>)}</select>
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
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:36}}><CheckBox on={selected.size===paged.length && paged.length>0} onChange={()=>{
                  setSelected(selected.size===paged.length ? new Set() : new Set(paged.map(p=>p.id)));
                }}/></th>
                <th>代理</th>
                <th>类型 / 等级</th>
                <th>层级</th>
                <th>上级代理</th>
                <th>市场 / 国家</th>
                <th className="right">玩家数</th>
                <th className="right">有效CPA</th>
                <th className="right">累计佣金</th>
                <th>状态</th>
                <th>风险等级</th>
                <th>注册时间</th>
                <th style={{width:60}}></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(a => (
                <tr key={a.id} className={selected.has(a.id)?'selected':''}>
                  <td onClick={e=>e.stopPropagation()}><CheckBox on={selected.has(a.id)} onChange={()=>toggleSel(a.id)}/></td>
                  <td onClick={()=>setDetail(a)} style={{cursor:'pointer'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="stack">
                        <span style={{color:'var(--text-0)',fontWeight:500}}>{a.name}</span>
                        <span className="id">{a.id}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge b-neutral">{D.LABELS.types[a.type] || a.type}</span> <span className="badge b-brand">{D.LABELS.tiers[a.tier] || a.tier}</span></td>
                  <td className="text-mono center">L{a.level}</td>
                  <td className="id">{a.parent || <span className="text-mute">—</span>}</td>
                  <td>{D.LABELS.markets[a.market] || a.market} · <span className="text-mute">{D.LABELS.countries[a.country] || a.country}</span></td>
                  <td className="right">{F.fmtNum(a.players)}</td>
                  <td className="right">{F.fmtNum(a.activeCpa)}</td>
                  <td className="right" style={{color:'var(--text-0)',fontWeight:500}}>${F.money(a.commission)}</td>
                  <td><AS status={a.status}/></td>
                  <td><AR level={a.risk}/></td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(a.created).toLocaleDateString('zh-CN')}</td>
                  <td><button className="btn sm ghost icon-only"><Icon name="more" size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <APG page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>

      <CreateAgentModal open={showCreate} onClose={()=>setShowCreate(false)} onSubmit={(a)=>{
        setAgents([{...a, id: 'AG' + String(100000 + agents.length).padStart(6,'0')}, ...agents]);
        toast('代理 ' + a.name + ' 创建成功');
        setShowCreate(false);
      }}/>

      <ADR open={!!detail} onClose={()=>setDetail(null)} title={detail?.name} subtitle={detail?.id + ' · ' + (detail?.tier) + ' · L' + detail?.level}
        footer={<>
          <button className="btn">编辑资料</button>
          <button className="btn">权限配置</button>
          <button className="btn danger">冻结代理</button>
        </>}>
        {detail && <AgentDetail agent={detail}/>}
      </ADR>
    </div>
  );
}

function CreateAgentModal({ open, onClose, onSubmit }) {
  const [form, setForm] = React.useState({
    name: '', loginName: '', password: '', type: 'Direct', tier: 'Bronze',
    parent: '', country: 'BR', currency: 'USDT', market: 'LATAM',
    contact: '', status: 'active', commission: 'CPA',
    allowSubAgent: true, level: 1,
  });
  const [errors, setErrors] = React.useState({});
  const [step, setStep] = React.useState(1);
  const D = window.APS_DATA;

  const validate = () => {
    const e = {};
    if (!form.name) e.name = '代理名称必填';
    if (!form.loginName) e.loginName = '登录账号必填';
    if (form.loginName && form.loginName.length < 4) e.loginName = '至少 4 个字符';
    if (!form.password) e.password = '密码必填';
    if (form.password && form.password.length < 8) e.password = '至少 8 位';
    if (!form.contact) e.contact = '联系方式必填';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  if (!open) return null;
  return (
    <AM open={open} onClose={onClose} size="lg"
      title="创建专业代理账户"
      subtitle="为合作伙伴创建独立代理账号，配置层级、分润与权限"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        {step === 1 ? (
          <button className="btn primary" onClick={()=>setStep(2)}>下一步：权限配置 <Icon name="chevronRight" size={12}/></button>
        ) : (
          <>
            <button className="btn" onClick={()=>setStep(1)}><Icon name="chevronLeft" size={12}/> 上一步</button>
            <button className="btn primary" onClick={submit}><Icon name="check" size={13}/> 创建代理</button>
          </>
        )}
      </>}>

      <div style={{display:'flex',gap:0,marginBottom:18}}>
        {[
          {n:1,l:'基本资料'},{n:2,l:'权限与分润'},
        ].map((s,i,a) => (
          <div key={s.n} style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
            <div style={{
              width:24,height:24,borderRadius:'50%',
              background: step>=s.n?'var(--brand)':'var(--bg-3)',
              color: step>=s.n?'#fff':'var(--text-3)',
              display:'grid',placeItems:'center',fontSize:11,fontWeight:600
            }}>{step>s.n ? '✓' : s.n}</div>
            <span style={{fontSize:12.5,color: step>=s.n?'var(--text-0)':'var(--text-3)',fontWeight:500}}>{s.l}</span>
            {i < a.length - 1 && <div style={{flex:1,height:1,background: step>s.n?'var(--brand)':'var(--line)',marginRight:10}}/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="form-grid">
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理名称 <span style={{color:'var(--danger)'}}>*</span></label>
            <input className={'input ' + (errors.name?'error':'')} placeholder="如: TopMedia LATAM" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>登录账号 <span style={{color:'var(--danger)'}}>*</span></label>
            <input className={'input ' + (errors.loginName?'error':'')} placeholder="agent_login" value={form.loginName} onChange={e=>setForm({...form,loginName:e.target.value})}/>
            {errors.loginName && <div className="field-error">{errors.loginName}</div>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>初始密码 <span style={{color:'var(--danger)'}}>*</span></label>
            <input className={'input ' + (errors.password?'error':'')} type="password" placeholder="至少 8 位" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理类型</label>
            <select className="select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {D.AGENT_TYPES.map(t => <option key={t} value={t}>{D.LABELS.types[t] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理等级</label>
            <select className="select" value={form.tier} onChange={e=>setForm({...form,tier:e.target.value})}>
              {D.AGENT_LEVELS.map(t => <option key={t} value={t}>{D.LABELS.tiers[t] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>上级代理</label>
            <select className="select" value={form.parent} onChange={e=>setForm({...form,parent:e.target.value})}>
              <option value="">无（直属总代）</option>
              {D.agents.slice(0,12).map(a => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>市场</label>
            <select className="select" value={form.market} onChange={e=>setForm({...form,market:e.target.value})}>
              {D.MARKETS.map(t => <option key={t} value={t}>{D.LABELS.markets[t] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>国家</label>
            <select className="select" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}>
              {D.COUNTRIES.map(t => <option key={t} value={t}>{D.LABELS.countries[t] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>结算币种</label>
            <select className="select" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
              {D.CURRENCIES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>联系方式 <span style={{color:'var(--danger)'}}>*</span></label>
            <input className={'input ' + (errors.contact?'error':'')} placeholder="telegram:@username" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/>
            {errors.contact && <div className="field-error">{errors.contact}</div>}
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>备注（选填）</label>
            <textarea className="textarea" placeholder="代理来源、对接人等..."/>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-section-title">分潤模式</div>
          <div className="grid-3 mt-3">
            {[
              {v:'CPA',l:'CPA',d:'每个有效CPA固定佣金'},
              {v:'RevShare',l:'RevShare',d:'按NGR分成比例'},
              {v:'Hybrid',l:'Hybrid',d:'CPA + RevShare 混合'},
            ].map(o => (
              <div key={o.v} onClick={()=>setForm({...form,commission:o.v})} style={{
                padding:14,border:'1px solid '+(form.commission===o.v?'var(--brand)':'var(--line-strong)'),
                borderRadius:8,cursor:'pointer',background:form.commission===o.v?'var(--brand-soft)':'var(--bg-2)',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:14,height:14,borderRadius:'50%',border:'1.5px solid '+(form.commission===o.v?'var(--brand)':'var(--text-3)'),
                    display:'grid',placeItems:'center'}}>
                    {form.commission===o.v && <div style={{width:6,height:6,background:'var(--brand)',borderRadius:'50%'}}/>}
                  </div>
                  <b style={{color:'var(--text-0)'}}>{o.l}</b>
                </div>
                <div style={{fontSize:11,color:'var(--text-3)',marginTop:6,paddingLeft:22}}>{o.d}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title mt-4">权限配置</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
            {[
              ['可查看玩家列表',true],['可查看下级代理',true],
              ['可创建下级代理',form.allowSubAgent],['可创建分享Code',true],
              ['可查看佣金',true],['可申请提款',true],
              ['可使用 API',false],['可查看风控名单',false],
              ['可下载素材',true],['可查看跨层数据',false],
            ].map(([label,defaultOn], i) => (
              <div key={i} style={{display:'flex',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>
                <span style={{flex:1,fontSize:12.5}}>{label}</span>
                <Switch on={defaultOn} onChange={()=>{}}/>
              </div>
            ))}
          </div>

          <div className="form-section-title mt-4">下级管理</div>
          <div className="form-row">
            <label>最大下钻层级</label>
            <select className="select" style={{width:200}} defaultValue="3"><option>1</option><option>2</option><option>3</option><option>5</option><option>无限制</option></select>
          </div>
          <div className="form-row">
            <label>启用动态压缩</label>
            <Switch on={true}/>
          </div>
          <div className="form-row">
            <label>无效上级跳过</label>
            <Switch on={true}/>
          </div>
        </div>
      )}
    </AM>
  );
}

function AgentDetail({ agent }) {
  const [tab, setTab] = React.useState('overview');
  const F = window.APS_FMT;
  return (
    <div>
      <div style={{padding:'16px 20px',background:'var(--bg-2)',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',gap:14,alignItems:'center'}}>
          <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'grid',placeItems:'center',color:'#fff',fontSize:18,fontWeight:600}}>
            {agent.name[0]}
          </div>
          <div className="stack" style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:15,color:'var(--text-0)',fontWeight:600}}>{agent.name}</span>
              <span className="badge b-brand">{agent.tier}</span>
              <span className="badge b-neutral">{agent.type}</span>
              <AS status={agent.status}/>
            </div>
            <span className="id" style={{fontSize:11.5}}>{agent.id} · L{agent.level} · {agent.market} / {agent.country} · {agent.currency}</span>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'var(--line)',marginTop:16,border:'1px solid var(--line)',borderRadius:6,overflow:'hidden'}}>
          {[
            ['玩家总数', F.fmtNum(agent.players)],
            ['有效CPA', F.fmtNum(agent.activeCpa)],
            ['累计NGR', '$'+F.money(agent.ngr)],
            ['累计佣金', '$'+F.money(agent.commission)],
          ].map(([l,v]) => (
            <div key={l} style={{background:'var(--bg-1)',padding:'10px 12px'}}>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{l}</div>
              <div className="text-mono" style={{fontSize:16,color:'var(--text-0)',fontWeight:600,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <window.UI.Tabs value={tab} onChange={setTab} tabs={[
        {key:'overview',label:'概览'},
        {key:'players',label:'玩家',count:agent.players},
        {key:'commission',label:'佣金'},
        {key:'subs',label:'下级代理'},
        {key:'risk',label:'风控记录'},
        {key:'logs',label:'操作记录'},
      ]}/>
      <div style={{padding:20}}>
        {tab === 'overview' && (
          <div>
            <div className="form-section-title" style={{marginTop:0}}>基本资料</div>
            <dl className="dl">
              <dt>代理ID</dt><dd className="text-mono">{agent.id}</dd>
              <dt>代理名称</dt><dd>{agent.name}</dd>
              <dt>代理类型</dt><dd>{agent.type}</dd>
              <dt>代理等级</dt><dd>{agent.tier}</dd>
              <dt>层级</dt><dd>L{agent.level}</dd>
              <dt>上级代理</dt><dd className="text-mono">{agent.parent || '—'}</dd>
              <dt>结算币种</dt><dd>{agent.currency}</dd>
              <dt>市场 / 国家</dt><dd>{agent.market} / {agent.country}</dd>
              <dt>联系方式</dt><dd>{agent.contact}</dd>
              <dt>注册时间</dt><dd>{new Date(agent.created).toLocaleString('zh-CN')}</dd>
              <dt>最后登录</dt><dd>{new Date(agent.lastLogin).toLocaleString('zh-CN')}</dd>
              <dt>风险等级</dt><dd><AR level={agent.risk}/></dd>
            </dl>
            <div className="form-section-title mt-4">权限</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 24px'}}>
              {['可查看玩家','可创建下级','可创建Code','可查看佣金','可申请提款','可使用API','可下载素材','可查看风控'].map(p => (
                <div key={p} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'6px 0',borderBottom:'1px solid var(--line-soft)'}}>
                  <Icon name="check" size={12} style={{color:'var(--success)'}}/>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab !== 'overview' && (
          <div className="empty">
            <div className="ico"><Icon name="file" size={20}/></div>
            该模块详细记录共 {Math.floor(Math.random()*200)} 条 · 演示中默认折叠
          </div>
        )}
      </div>
    </div>
  );
}

window.AgentsModule = AgentsModule;
