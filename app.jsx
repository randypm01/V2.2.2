// Main App — 层级路由 + 顶栏 + 侧边栏
const { useState, useEffect } = React;

function App() {
  const [t, setTweak] = window.useTweaks ? window.useTweaks(/*EDITMODE-BEGIN*/{
    "density": "dense",
    "accent": "#3b82f6"
  }/*EDITMODE-END*/) : [{density:'dense',accent:'#3b82f6'}, ()=>{}];

  // 三个 tab 各自独立路由
  const [merchantRoute, setMerchantRoute] = useState('home');
  const [agentRoute, setAgentRoute] = useState('home');
  const [prdRoute, setPrdRoute] = useState('home');
  const [frontendRoute, setFrontendRoute] = useState('home');

  const [backend, setBackend] = useState('merchant'); // 'merchant' | 'agent' | 'prd' | 'frontend'
  const route = backend === 'prd' ? prdRoute
              : backend === 'agent' ? agentRoute
              : backend === 'frontend' ? frontendRoute
              : merchantRoute;
  const setRoute = (r) => {
    if (backend === 'prd') setPrdRoute(r);
    else if (backend === 'agent') setAgentRoute(r);
    else if (backend === 'frontend') setFrontendRoute(r);
    else setMerchantRoute(r);
  };

  const [openSections, setOpenSections] = useState({
    '运营': true, '收益': true, '风控与配置': true,
  });
  const [openPhases, setOpenPhases] = useState({ P0:true });

  useEffect(() => {
    document.documentElement.setAttribute('data-density', t.density || 'dense');
    if (t.accent) document.documentElement.style.setProperty('--brand', t.accent);
  }, [t.density, t.accent]);

  const PHASES = window.PRD_PHASES || [];
  const PRD_FEATURES = window.PRD_FEATURES || {};

  // 商户后台 NAV — 每项标注对应 PRD 阶段(P0-N / P1-N / P2-N)
  const NAV = [
    { section: '运营', icon:'pulse', items: [
      { k:'dashboard', l:'仪表盘', icon:'dashboard', prd:'P0-11' },
      { k:'agents', l:'代理账户管理', icon:'users', prd:'P0-1' },
      { k:'codes', l:'分享 Code 与链接', icon:'link', prd:'P0-3' },
      { k:'players', l:'玩家管理', icon:'user', prd:'P0-4' },
    ]},
    { section: '收益', icon:'wallet', items: [
      { k:'cpa', l:'CPA 管理', icon:'target', prd:'P0-5' },
      { k:'revshare', l:'分润管理', icon:'pie', prd:'P0-7' },
      { k:'settlement', l:'结算管理', icon:'file', alert: 17, prd:'P0-8' },
      { k:'wallet', l:'代理钱包', icon:'wallet', prd:'P0-9' },
    ]},
    { section: '风控与配置', icon:'shield', items: [
      { k:'risk', l:'风控管理', icon:'shield', alert: 6, prd:'P0-10' },
      { k:'notifications', l:'通知管理', icon:'bell', prd:'P0-14' },
      { k:'logs', l:'操作日志', icon:'history', prd:'P0-12' },
    ]},
  ];

  // 专业代理后台 NAV
  const AGENT_NAV = [
    { section: '我的账户', icon:'user', items: [
      { k:'my_profile', l:'我的账户', icon:'user', prd:'P0-13' },
      { k:'my_notify', l:'通知中心', icon:'bell', prd:'P0-14' },
    ]},
    { section: '推广', icon:'link', items: [
      { k:'my_codes', l:'分享 Code 与链接', icon:'link', prd:'P0-3' },
      { k:'my_players', l:'我的玩家', icon:'user', prd:'P0-4' },
    ]},
    { section: '收益', icon:'wallet', items: [
      { k:'my_cpa', l:'CPA 报表', icon:'target', prd:'P0-6' },
      { k:'my_revshare', l:'分润报表', icon:'pie', prd:'P0-7' },
      { k:'my_settlement', l:'结算单', icon:'file', prd:'P0-8' },
      { k:'my_wallet', l:'我的钱包 / 提款', icon:'wallet', prd:'P0-9' },
    ]},
  ];

  // 当前 backend 对应的 NAV
  const CUR_NAV = backend === 'agent' ? AGENT_NAV : NAV;

  // ============ 解析路由 → { kind, payload, parent } ============
  const parseRoute = (r) => {
    if (r === 'home') return { kind:'home' };
    if (r === 'prd_home') return { kind:'prd_home', parent:'home' };
    if (r === 'prd_overview') return { kind:'prd_overview', parent: backend === 'prd' ? 'home' : 'home' };
    if (r.startsWith('section:')) return { kind:'section', name: r.slice(8), parent:'home' };
    if (r.startsWith('mod:')) {
      const k = r.slice(4);
      const sec = CUR_NAV.find(s => s.items.some(i => i.k === k));
      return { kind:'mod', k, parent: sec ? 'section:'+sec.section : 'home' };
    }
    if (r.startsWith('phase:')) return { kind:'phase', key: r.slice(6), parent:'prd_overview' };
    if (r.startsWith('feat:')) {
      const fid = r.slice(5);
      const ph = fid.split('-')[0];
      return { kind:'feat', fid, ph, parent:'phase:'+ph };
    }
    return { kind:'home' };
  };

  const goBack = () => {
    const p = parseRoute(route).parent;
    if (p) setRoute(p);
  };
  const r = parseRoute(route);

  // ============ 面包屑 ============
  const buildCrumbs = () => {
    const chain = [];
    let cur = route;
    while (cur) {
      chain.unshift(cur);
      const pr = parseRoute(cur);
      cur = pr.parent || null;
    }
    return chain;
  };
  const crumbLabel = (rt) => {
    const pr = parseRoute(rt);
    if (pr.kind === 'home') return '首页';
    if (pr.kind === 'prd_home') return 'PRD首页';
    if (pr.kind === 'section') return pr.name;
    if (pr.kind === 'mod') {
      const sec = CUR_NAV.find(s => s.items.some(i => i.k === pr.k));
      return sec?.items.find(i => i.k === pr.k)?.l || pr.k;
    }
    if (pr.kind === 'prd_overview') return '规划优先级';
    if (pr.kind === 'phase') {
      const ph = PHASES.find(x => x.key === pr.key);
      return ph ? `${ph.key}_${ph.label}` : pr.key;
    }
    if (pr.kind === 'feat') {
      const f = (PRD_FEATURES[pr.ph] || []).find(x => x.id === pr.fid);
      return f ? `${f.id}_${f.name}` : pr.fid;
    }
    return rt;
  };

  // ============ 侧边栏渲染 ============
  const toggleSection = (name) => setOpenSections(s => ({...s, [name]: !s[name]}));
  const togglePhase = (key) => setOpenPhases(s => ({...s, [key]: !s[key]}));

  const isActiveRoute = (rt) => route === rt;

  // 阶段色映射
  const phaseColor = (prdId) => {
    if (!prdId) return null;
    const ph = PHASES.find(p => p.key === prdId.split('-')[0]);
    return ph?.color || null;
  };

  const renderSidebarItem = (it, sectionName) => {
    const target = it.k === 'prd_overview' ? 'prd_overview' : 'mod:'+it.k;
    return (
    <div key={it.k}
      className={'sb-item ' + (isActiveRoute(target) ? 'active' : '')}
      onClick={()=>setRoute(target)} title={`${it.l}${it.prd?' · '+it.prd:''}`}>
      <Icon name={it.icon} size={15} className="sb-icon"/>
      <span>{it.l}</span>
      {it.alert && <span className="sb-badge alert">{it.alert}</span>}
    </div>
    );
  };

  return (
    <div className="app">
      {/* ========= 第一行:后台分页 ========= */}
      <div className="backend-row">
        <div className={'backend-tab ' + (backend==='prd'?'active':'')} onClick={()=>setBackend('prd')}>
          <Icon name="flag" size={14}/>
          <span>PRD 规划</span>
        </div>
        <div className={'backend-tab ' + (backend==='merchant'?'active':'')} onClick={()=>setBackend('merchant')}>
          <Icon name="building" size={14}/>
          <span>商户后台_专业代理</span>
        </div>
        <div className={'backend-tab ' + (backend==='agent'?'active':'')} onClick={()=>setBackend('agent')}>
          <Icon name="users" size={14}/>
          <span>专业代理后台</span>
        </div>
        <div className={'backend-tab ' + (backend==='frontend'?'active':'')} onClick={()=>setBackend('frontend')}>
          <Icon name="globe" size={14}/>
          <span>网站前台</span>
        </div>
        <div style={{flex:1}}/>
        <div className="backend-meta">v2.6.0 · {
          backend==='merchant'?'商户视角 · 管理专业代理':
          backend==='agent'?'代理视角 · 代理自助':
          backend==='frontend'?'玩家视角 · 申请成为代理':
          '产品规划 · 阶段路线图'
        }</div>
      </div>

      {/* ========= 网站前台:全宽渲染,跳过侧栏与商户 chrome ========= */}
      {backend === 'frontend' && <window.FrontendModule/>}

      {/* ========= 第二行:品牌 + 搜索 + 用户 ========= */}
      {backend !== 'frontend' && (
      <header className="topbar-v2">
        {backend === 'prd' ? (
          <div className="tbv-brand" style={{cursor:'pointer'}} onClick={()=>setRoute('home')} title="返回首页">
            <div className="logo" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="folder" size={20}/>
            </div>
            <div className="name">PRD 规划</div>
            <span className="ver-inline">v1.0</span>
          </div>
        ) : backend === 'merchant' ? (
          <div className="tbv-brand" style={{cursor:'pointer'}} onClick={()=>setRoute('home')} title="返回首页">
            <div className="logo" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="building" size={18}/>
            </div>
            <div className="name">商戶後台_專業代理</div>
            <span className="ver-inline">v1.0</span>
          </div>
        ) : (
          <div className="tbv-brand" style={{cursor:'pointer'}} onClick={()=>setRoute('home')} title="返回首页">
            <div className="logo" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="users" size={18}/>
            </div>
            <div className="name">專業代理後台</div>
            <span className="ver-inline">v1.0</span>
          </div>
        )}
        <div style={{flex:1}}/>
        {backend !== 'prd' && (<>
          <div className="top-search">
            <Icon name="search" size={13}/>
            <input placeholder="搜索代理、玩家、Code、结算单..."/>
            <kbd>⌘K</kbd>
          </div>
          <div className="top-icon-btn"><Icon name="bell" size={15}/><span className="dot"/></div>
          <div className="top-icon-btn"><Icon name="settings" size={15}/></div>
          <div className="top-user">
            <div className="av">A</div>
            <div className="who"><b>admin</b><small>运营总监</small></div>
            <Icon name="chevronDown" size={12} className="text-mute"/>
          </div>
        </>)}
      </header>
      )}

      {backend === 'agent' && (
        <div className="app-body">
          <aside className="sidebar">
            <div className="sb-nav">
              <div className={'sb-item ' + (isActiveRoute('home')?'active':'')}
                onClick={()=>setRoute('home')} title="首页" style={{marginBottom:6}}>
                <Icon name="dashboard" size={15} className="sb-icon"/>
                <span>首页</span>
              </div>
              <div className={'sb-item ' + (isActiveRoute('prd_home')?'active':'')}
                onClick={()=>setRoute('prd_home')} title="PRD首页" style={{marginBottom:6}}>
                <Icon name="folder" size={15} className="sb-icon"/>
                <span>PRD首页</span>
              </div>
              {AGENT_NAV.map(sec => {
                const isOpen = openSections[sec.section] !== false;
                return (
                <div key={sec.section}>
                  <div className={'sb-section sb-section-toggle ' + (isActiveRoute('section:'+sec.section)?'active':'')}>
                    <span onClick={(e)=>{e.stopPropagation();setRoute('section:'+sec.section);}} style={{flex:1,cursor:'pointer'}}>{sec.section}</span>
                    <button type="button" className="caret-btn"
                      onClick={(e)=>{e.preventDefault();e.stopPropagation();toggleSection(sec.section);}}
                      title={isOpen?'收起':'展开'}>
                      <Icon name={isOpen?'chevronDown':'chevronRight'} size={11}/>
                    </button>
                  </div>
                  {isOpen && sec.items.map(it => renderSidebarItem(it, sec.section))}
                </div>
                );
              })}
            </div>
          </aside>
          <main className="main">
            <div className="content-crumbs">
              {r.kind !== 'home' && (
                <button className="btn ghost icon-only sm" onClick={goBack} title="返回上一层">
                  <Icon name="chevronLeft" size={14}/>
                </button>
              )}
              <div className="crumbs">
                {buildCrumbs().map((rt, i, arr) => {
                  const isLast = i === arr.length-1;
                  return (
                    <React.Fragment key={rt}>
                      {isLast ? <span className="now">{crumbLabel(rt)}</span>
                       : <span style={{cursor:'pointer'}} onClick={()=>setRoute(rt)}>{crumbLabel(rt)}</span>}
                      {!isLast && <Icon name="chevronRight" size={11} className="sep"/>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="content">
              {r.kind === 'home' && <window.AgentDashboardModule onNav={setRoute}/>}
              {r.kind === 'prd_home' && <HomePage NAV={AGENT_NAV} onPick={setRoute} title="PRD首页" subtitle="按 PRD 模块分组的功能入口总览"/>}
              {r.kind === 'section' && <SectionPage section={AGENT_NAV.find(s => s.section === r.name)} onPick={setRoute} PHASES={PHASES} PRD_FEATURES={PRD_FEATURES}/>}
              {r.kind === 'mod' && r.k === 'my_profile' && <window.AgentProfileModule/>}
              {r.kind === 'mod' && r.k === 'my_notify' && <window.AgentNotifyModule/>}
              {r.kind === 'mod' && r.k === 'my_codes' && <window.MyCodesModule/>}
              {r.kind === 'mod' && r.k === 'my_players' && <window.MyPlayersModule/>}
              {r.kind === 'mod' && r.k === 'my_cpa' && <window.MyCpaModule/>}
              {r.kind === 'mod' && r.k === 'my_revshare' && <window.MyRevshareModule/>}
              {r.kind === 'mod' && r.k === 'my_settlement' && <window.MySettlementModule/>}
              {r.kind === 'mod' && r.k === 'my_wallet' && <window.MyWalletModule/>}
              {r.kind === 'mod' && r.k === 'my_traffic' && <window.MyTrafficModule/>}
              {r.kind === 'mod' && r.k === 'my_materials' && <window.MyMaterialsModule/>}
              {r.kind === 'mod' && r.k === 'my_campaigns' && <window.MyCampaignsModule/>}
              {r.kind === 'mod' && r.k === 'my_quality' && <window.MyQualityModule/>}
              {r.kind === 'mod' && r.k === 'my_api' && <window.MyApiModule/>}
              {r.kind === 'mod' && r.k === 'my_subs' && <window.MySubsModule/>}
              {r.kind === 'mod' && r.k === 'my_app' && <window.MyAppModule/>}
              {r.kind === 'mod' && r.k === 'my_currency' && <window.MyCurrencyModule/>}
              {r.kind === 'mod' && r.k === 'my_ad' && <window.MyAdNetworkModule/>}
              {r.kind === 'mod' && !['my_profile','my_notify','my_codes','my_players','my_cpa','my_revshare','my_settlement','my_wallet','my_traffic','my_materials','my_campaigns','my_quality','my_api','my_subs','my_app','my_currency','my_ad'].includes(r.k) && (() => {
                const sec = AGENT_NAV.find(s => s.items.some(i => i.k === r.k));
                const it = sec?.items.find(i => i.k === r.k);
                if (!it) return null;
                const ph = PHASES.find(p => p.key === (it.prd||'').split('-')[0]);
                return (
                  <div className="page">
                    <window.UI.PageHead title={it.l} subtitle={`代理自助 · ${it.prd ? it.prd+' · ' : ''}${ph ? ph.label : ''}`}>
                      {it.prd && <span style={{
                        padding:'2px 8px',borderRadius:3,background:ph?.color,color:'#fff',
                        fontSize:11,fontWeight:700,fontFamily:'JetBrains Mono'
                      }}>{it.prd}</span>}
                    </window.UI.PageHead>
                    <div className="card">
                      <div className="empty">
                        <div className="ico"><Icon name={it.icon} size={22}/></div>
                        <div style={{fontSize:14,color:'var(--text-1)',fontWeight:500,marginBottom:6}}>{it.l}</div>
                        <div style={{maxWidth:480,margin:'0 auto'}}>
                          代理后台模块 — 详细原型在 {it.prd} 阶段交付。
                        </div>
                        <div style={{marginTop:18,display:'flex',gap:8,justifyContent:'center'}}>
                          <button className="btn" onClick={()=>{ setBackend('prd'); setPrdRoute('feat:'+it.prd); }}>查看 PRD 详情</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </main>
        </div>
      )}

      {backend !== 'agent' && backend !== 'frontend' && (
      <div className="app-body">
        <aside className="sidebar">
          {backend === 'merchant' && (
          <div className="sb-nav">
            <div className={'sb-item ' + (isActiveRoute('home')?'active':'')}
              onClick={()=>setRoute('home')} title="首页" style={{marginBottom:6}}>
              <Icon name="dashboard" size={15} className="sb-icon"/>
              <span>首页</span>
            </div>
            {NAV.map(sec => {
              const isOpen = openSections[sec.section] !== false;
              return (
              <div key={sec.section}>
                <div className={'sb-section sb-section-toggle ' + (isActiveRoute('section:'+sec.section)?'active':'')}>
                  <span onClick={(e)=>{e.stopPropagation();setRoute('section:'+sec.section);}} style={{flex:1,cursor:'pointer'}}>{sec.section}</span>
                  <button type="button" className="caret-btn"
                    onClick={(e)=>{e.preventDefault();e.stopPropagation();toggleSection(sec.section);}}
                    title={isOpen?'收起':'展开'}>
                    <Icon name={isOpen?'chevronDown':'chevronRight'} size={11}/>
                  </button>
                </div>
                {isOpen && sec.items.map(it => renderSidebarItem(it, sec.section))}
              </div>
              );
            })}
          </div>
          )}

          {backend === 'prd' && (
          <div className="sb-nav">
            <div className={'sb-item ' + (isActiveRoute('home')?'active':'')}
              onClick={()=>setRoute('home')} title="首页">
              <Icon name="dashboard" size={15} className="sb-icon"/>
              <span>首页</span>
            </div>
            <div className={'sb-item ' + (isActiveRoute('prd_overview')?'active':'')}
              onClick={()=>setRoute('prd_overview')} title="规划优先级">
              <Icon name="flag" size={15} className="sb-icon"/>
              <span>规划优先级</span>
            </div>
            {PHASES.map(p => {
              const phaseOpen = openPhases[p.key];
              const feats = PRD_FEATURES[p.key] || [];
              return (
                <React.Fragment key={p.key}>
                  <div className={'sb-item sb-folder ' + (isActiveRoute('phase:'+p.key)?'active':'')} title={`${p.key} ${p.label}`}>
                    <button type="button" className="caret-btn caret-btn-sm"
                      onClick={(e)=>{e.preventDefault();e.stopPropagation();togglePhase(p.key);}}
                      title={phaseOpen?'收起':'展开'}>
                      <Icon name={phaseOpen?'chevronDown':'chevronRight'} size={11}/>
                    </button>
                    <span className="phase-pill" style={{
                      padding:'3px 10px',borderRadius:4,
                      background:p.color,color:'#fff',fontSize:12,fontWeight:600,
                      letterSpacing:0.2,flex:1,minWidth:0,cursor:'pointer',
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                      textAlign:'left'
                    }} onClick={()=>setRoute('phase:'+p.key)}>
                      <span style={{fontFamily:'JetBrains Mono',fontWeight:700,marginRight:6,fontSize:11}}>{p.key}</span>
                      {p.label}
                    </span>
                    <span className="sb-badge">{feats.length}</span>
                  </div>
                  {phaseOpen && feats.map(f => (
                    <div key={f.id}
                      className={'sb-item sb-leaf sb-feat-row ' + (isActiveRoute('feat:'+f.id) ? 'active' : '')}
                      onClick={()=>setRoute('feat:'+f.id)}
                      title={`${f.id}_${f.name}`}>
                      <span className="sb-feat-pill" style={{background:p.color}}>{f.id}</span>
                      <span className="sb-feat-name">{f.name}</span>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
          )}
        </aside>

        <main className="main">
          {/* 面包屑 + 返回:首页不显示返回按钮 */}
          <div className="content-crumbs">
            {r.kind !== 'home' && (
              <button className="btn ghost icon-only sm" onClick={goBack} title="返回上一层">
                <Icon name="chevronLeft" size={14}/>
              </button>
            )}
            <div className="crumbs">
              {buildCrumbs().map((rt, i, arr) => {
                const isLast = i === arr.length-1;
                return (
                  <React.Fragment key={rt}>
                    {isLast ? (
                      <span className="now">{crumbLabel(rt)}</span>
                    ) : (
                      <span style={{cursor:'pointer'}} onClick={()=>setRoute(rt)}>{crumbLabel(rt)}</span>
                    )}
                    {!isLast && <Icon name="chevronRight" size={11} className="sep"/>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="content">
            {/* 首页 */}
            {r.kind === 'home' && backend === 'merchant' && (
              <HomePage NAV={NAV} onPick={(rt)=>setRoute(rt)}/>
            )}
            {r.kind === 'home' && backend === 'prd' && (
              <PRDHomePage PHASES={PHASES} PRD_FEATURES={PRD_FEATURES} onPick={setRoute}/>
            )}

            {/* 大项总览 */}
            {r.kind === 'section' && (
              <SectionPage section={NAV.find(s => s.section === r.name)} onPick={setRoute} PHASES={PHASES} PRD_FEATURES={PRD_FEATURES}/>
            )}

            {/* PRD 阶段(分类)总览 */}
            {r.kind === 'phase' && (
              <PhasePage phaseKey={r.key} PHASES={PHASES} PRD_FEATURES={PRD_FEATURES} onPick={setRoute}/>
            )}

            {/* 模块详情(P0 实做模块) */}
            {r.kind === 'mod' && r.k === 'dashboard' && <Dashboard/>}
            {r.kind === 'mod' && r.k === 'agents' && <AgentsModule/>}
            {r.kind === 'mod' && r.k === 'codes' && <CodesModule/>}
            {r.kind === 'mod' && r.k === 'players' && <PlayersModule/>}
            {r.kind === 'mod' && r.k === 'cpa' && <CpaModule/>}
            {r.kind === 'mod' && r.k === 'revshare' && <RevShareModule/>}
            {r.kind === 'mod' && r.k === 'settlement' && <SettlementModule/>}
            {r.kind === 'mod' && r.k === 'wallet' && <WalletModule/>}
            {r.kind === 'mod' && r.k === 'risk' && <RiskModule/>}
            {r.kind === 'mod' && r.k === 'logs' && <LogsModule/>}
            {r.kind === 'mod' && r.k === 'notifications' && <NotificationsModule/>}
            {r.kind === 'mod' && r.k === 'subs' && <window.SubsModule/>}
            {r.kind === 'mod' && r.k === 'revshare_detail' && <window.RevShareDetailModule/>}
            {r.kind === 'mod' && r.k === 'hybrid' && <window.HybridModule/>}
            {r.kind === 'mod' && r.k === 'subs_revshare' && <window.SubsRevShareModule/>}
            {r.kind === 'mod' && r.k === 'traffic' && <window.TrafficModule/>}
            {r.kind === 'mod' && r.k === 'materials' && <window.MaterialsModule/>}
            {r.kind === 'mod' && r.k === 'campaigns' && <window.CampaignsModule/>}
            {r.kind === 'mod' && r.k === 'players_quality' && <window.PlayersQualityModule/>}
            {r.kind === 'mod' && r.k === 'api' && <window.ApiModule/>}
            {r.kind === 'mod' && r.k === 'risk_score' && <window.RiskScoreModule/>}
            {r.kind === 'mod' && r.k === 'healthy_score' && <window.HealthyScoreModule/>}
            {r.kind === 'mod' && r.k === 'dynamic_cpa' && <window.DynamicCpaModule/>}
            {r.kind === 'mod' && r.k === 'auto_risk' && <window.AutoRiskModule/>}
            {r.kind === 'mod' && r.k === 'roi_predict' && <window.RoiPredictModule/>}
            {r.kind === 'mod' && r.k === 'sub_accounts' && <window.SubAccountsModule/>}
            {r.kind === 'mod' && r.k === 'ai_score' && <window.AiScoreModule/>}
            {r.kind === 'mod' && r.k === 'fraud_graph' && <window.FraudGraphModule/>}
            {r.kind === 'mod' && r.k === 'multi_currency' && <window.MultiCurrencyModule/>}
            {r.kind === 'mod' && r.k === 'ad_network' && <window.AdNetworkModule/>}
            {r.kind === 'mod' && r.k === 'bi' && <window.BiModule/>}
            {r.kind === 'mod' && !['dashboard','agents','codes','players','cpa','revshare','settlement','wallet','risk','logs','notifications','subs','revshare_detail','hybrid','subs_revshare','traffic','materials','campaigns','players_quality','api','risk_score','healthy_score','dynamic_cpa','auto_risk','roi_predict','sub_accounts','ai_score','fraud_graph','multi_currency','ad_network','bi'].includes(r.k) && (() => {
              const sec = NAV.find(s => s.items.some(i => i.k === r.k));
              const it = sec?.items.find(i => i.k === r.k);
              if (!it) return null;
              const ph = PHASES.find(p => p.key === (it.prd||'').split('-')[0]);
              return (
                <div className="page">
                  <window.UI.PageHead title={it.l} subtitle={`${it.prd ? it.prd+' · ' : ''}${ph ? ph.label+' · '+ph.timeline : '规划中'}`}>
                    {it.prd && <span style={{
                      padding:'2px 8px',borderRadius:3,background:ph?.color,color:'#fff',
                      fontSize:11,fontWeight:700,fontFamily:'JetBrains Mono'
                    }}>{it.prd}</span>}
                  </window.UI.PageHead>
                  <div className="card">
                    <div className="empty">
                      <div className="ico"><Icon name={it.icon} size={22}/></div>
                      <div style={{fontSize:14,color:'var(--text-1)',fontWeight:500,marginBottom:6}}>{it.l}</div>
                      <div style={{maxWidth:420,margin:'0 auto'}}>该模块归属 {ph ? ph.key+' '+ph.label : 'P1+'} 阶段,将在 P0 上线后按依赖顺序交付。</div>
                      <div style={{marginTop:18,display:'flex',gap:8,justifyContent:'center'}}>
                        <button className="btn" onClick={()=>{ setBackend('prd'); setPrdRoute('feat:'+it.prd); }}>查看 PRD 详情</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* PRD 规划优先级总览 */}
            {r.kind === 'prd_overview' && <window.PRDOverview onSelect={(k)=>{
              if (k === 'prd_overview') setRoute('prd_overview');
              else if (k.startsWith('prd_')) setRoute('feat:'+k.replace('prd_',''));
            }}/>}

            {/* 单个 PRD 子项详情 */}
            {r.kind === 'feat' && (() => {
              const phase = PHASES.find(x => x.key === r.ph);
              const f = (PRD_FEATURES[r.ph] || []).find(x => x.id === r.fid);
              return f && phase ? <window.PRDFeatureDetail feature={f} phase={phase} onJump={(b, route)=>{
                if (b === 'merchant') { setMerchantRoute(route); setBackend('merchant'); }
                else if (b === 'agent') { setAgentRoute(route); setBackend('agent'); }
              }}/> : null;
            })()}
          </div>
        </main>
      </div>
      )}

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="界面">
            <window.TweakRadio label="数据密度" value={t.density} onChange={v=>setTweak('density',v)} options={[
              {value:'dense',label:'紧凑'},{value:'comfortable',label:'宽松'},
            ]}/>
          </window.TweakSection>
          <window.TweakSection title="主色">
            <window.TweakColor label="品牌色" value={t.accent} onChange={v=>setTweak('accent',v)}
              options={['#3b82f6','#06b6d4','#22c55e','#a855f7','#f59e0b','#ef4444']}/>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

// ============ PRD 首页:阶段卡片 + 内嵌 feature 子项 ============
function PRDHomePage({ PHASES, PRD_FEATURES, onPick }) {
  return (
    <div className="page">
      <div className="home-section-title" style={{marginTop:0}}>PRD 阶段路线图</div>
      <div className="home-grid">
        {PHASES.map(p => {
          const feats = PRD_FEATURES[p.key] || [];
          return (
            <div key={p.key} className="home-card">
              <div className="hc-head" onClick={()=>onPick('phase:'+p.key)} style={{cursor:'pointer'}}>
                <div className="hc-ico" style={{background:p.color+'22',color:p.color}}>
                  <Icon name="flag" size={20}/>
                </div>
                <div className="hc-title">
                  <span style={{
                    padding:'2px 8px',borderRadius:3,marginRight:8,
                    background:p.color,color:'#fff',
                    fontSize:11,fontWeight:700,fontFamily:'JetBrains Mono'
                  }}>{p.key}</span>
                  {p.label}
                </div>
                <Icon name="chevronRight" size={14} className="hc-arrow"/>
              </div>
              <div className="hc-meta">{p.timeline} · {feats.length} 个子项</div>
              <div className="hc-rows">
                {feats.map(f => (
                  <div key={f.id} className="hc-row" onClick={(e)=>{e.stopPropagation();onPick('feat:'+f.id);}}>
                    <Icon name="file" size={14} className="hc-row-ico"/>
                    <span className="hc-row-name">{f.name}</span>
                    <span style={{
                      marginLeft:'auto',padding:'1px 6px',borderRadius:3,
                      background:p.color,color:'#fff',
                      fontSize:10,fontWeight:700,fontFamily:'JetBrains Mono'
                    }}>{f.id}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 首页:功能入口总览 ============
function HomePage({ NAV, onPick, title, subtitle }) {
  // 根据 prd id 推断阶段色
  const phaseColor = (prd) => {
    if (!prd) return null;
    const map = { P0:'#22c55e', P1:'#3b82f6', P2:'#a855f7', P3:'#f59e0b' };
    return map[prd.split('-')[0]] || null;
  };
  return (
    <div className="page">
      <div className="home-section-title" style={{marginTop:0}}>功能入口总览</div>
      <div className="home-grid">
        {NAV.map(sec => (
          <div key={sec.section} className="home-card">
            <div className="hc-head" onClick={()=>onPick('section:'+sec.section)} style={{cursor:'pointer'}}>
              <div className="hc-ico"><Icon name={sec.icon} size={20}/></div>
              <div className="hc-title">{sec.section}</div>
              <Icon name="chevronRight" size={14} className="hc-arrow"/>
            </div>
            <div className="hc-meta">{sec.items.length} 个子项</div>
            <div className="hc-rows">
              {sec.items.map(it => (
                <div key={it.k} className="hc-row" onClick={(e)=>{e.stopPropagation();onPick('mod:'+it.k);}}>
                  <Icon name={it.icon} size={14} className="hc-row-ico"/>
                  <span className="hc-row-name">{it.l}</span>
                  <div style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:6}}>
                    {it.alert && <span className="badge b-danger" style={{fontSize:10}}>{it.alert}</span>}
                    {it.prd && (
                      <span style={{
                        padding:'1px 6px',borderRadius:3,
                        background:phaseColor(it.prd),color:'#fff',
                        fontSize:10,fontWeight:700,fontFamily:'JetBrains Mono'
                      }}>{it.prd}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ 大项页 ============
function SectionPage({ section, onPick, PHASES, PRD_FEATURES }) {
  if (!section) return null;
  const isPRD = section.kind === 'prd';

  return (
    <div className="page">
      <window.UI.PageHead title={section.section} subtitle={`共 ${section.items.length + (isPRD ? PHASES.length : 0)} 个子项 · 点击进入对应模块`}>
        <Icon name={section.icon} size={18} className="text-mute"/>
      </window.UI.PageHead>

      <div className="folder-grid">
        {/* 普通子项 */}
        {section.items.map(it => {
          const ph = PHASES.find(p => p.key === (it.prd||'').split('-')[0]);
          return (
          <div key={it.k} className="folder-card leaf" onClick={()=>onPick(it.k === 'prd_overview' ? 'prd_overview' : 'mod:'+it.k)}>
            <div className="fc-head">
              <Icon name={it.icon} size={16} className="fc-ico"/>
              <span className="fc-title">{it.l}</span>
              <div style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:6}}>
                {it.alert && <span className="badge b-danger">{it.alert}</span>}
                {it.prd && <span style={{
                  padding:'1px 6px',borderRadius:3,
                  background:ph?.color,color:'#fff',
                  fontSize:10,fontWeight:700,fontFamily:'JetBrains Mono'
                }}>{it.prd}</span>}
              </div>
            </div>
          </div>
          );
        })}

        {/* PRD 阶段文件夹 */}
        {isPRD && PHASES.map(p => {
          const feats = PRD_FEATURES[p.key] || [];
          return (
            <div key={p.key} className="folder-card folder" onClick={()=>onPick('phase:'+p.key)}>
              <div className="fc-head">
                <Icon name="folder" size={16} className="fc-ico" style={{color:p.color}}/>
                <span style={{
                  display:'inline-block',padding:'1px 6px',borderRadius:3,
                  background:p.color,color:'#fff',fontSize:10,fontWeight:700,
                  letterSpacing:0.4,fontFamily:'JetBrains Mono'
                }}>{p.key}</span>
                <span className="fc-title">{p.label}</span>
                <span className="badge" style={{marginLeft:'auto'}}>{feats.length}</span>
              </div>
              <div className="fc-children">
                {feats.slice(0, 4).map(f => (
                  <div key={f.id} className="fc-child" onClick={(e)=>{e.stopPropagation();onPick('feat:'+f.id);}}>
                    <Icon name="file" size={11}/><span>{f.id}_{f.name}</span>
                  </div>
                ))}
                {feats.length > 4 && (
                  <div className="fc-child more">+ 还有 {feats.length-4} 项</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 分类页(PRD 阶段)============
function PhasePage({ phaseKey, PHASES, PRD_FEATURES, onPick }) {
  const phase = PHASES.find(x => x.key === phaseKey);
  const feats = PRD_FEATURES[phaseKey] || [];
  if (!phase) return null;

  const statusToneMap = { done:'b-success', next:'b-info', planning:'b-info' };
  const statusLabelMap = { done:'已完成', next:'即将启动', planning:'规划中' };

  return (
    <div className="page">
      <window.UI.PageHead title={`${phase.key} ${phase.label}`} subtitle={`${phase.timeline} · ${phase.goal}`}>
        <span className={'badge ' + phase.tone}>{phase.status}</span>
        <span className="badge">{feats.length} 个子项</span>
      </window.UI.PageHead>

      <div className="folder-grid">
        {feats.map(f => {
          const backends = (f.mapping||[]).reduce((acc,m)=>{ if(!acc.includes(m.backend)) acc.push(m.backend); return acc; }, []);
          const sideMap = { merchant:{label:'商户后台',bg:'#dbeafe',fg:'#1e40af'}, agent:{label:'代理后台',bg:'#fef3c7',fg:'#92400e'} };
          return (
          <div key={f.id} className="folder-card leaf" onClick={()=>onPick('feat:'+f.id)} style={{borderLeft:`3px solid ${phase.color}`}}>
            <div className="fc-head">
              <Icon name="file" size={15} className="fc-ico" style={{color:phase.color}}/>
              <span className="text-mono" style={{fontSize:11,color:phase.color,fontWeight:700}}>{f.id}</span>
              <span className="fc-title">{f.name}</span>
              {backends.map(b => {
                const st = sideMap[b];
                return (
                  <span key={b} style={{
                    fontSize:10,padding:'1px 6px',borderRadius:3,
                    background:st.bg,color:st.fg,fontWeight:600
                  }}>{st.label}</span>
                );
              })}
              <span className={'badge ' + (statusToneMap[f.status]||'b-info')} style={{marginLeft:'auto'}}>
                {statusLabelMap[f.status] || f.status}
              </span>
            </div>
            <div style={{padding:'8px 14px 14px',color:'var(--text-2)',fontSize:12,lineHeight:1.6}}>
              {f.scope[0]}{f.scope.length>1?` · 等 ${f.scope.length} 项`:''}
            </div>
            <div style={{padding:'0 14px 12px',display:'flex',gap:8,fontSize:11,color:'var(--text-3)'}}>
              <span><Icon name="history" size={10}/> {f.week}</span>
              <span>· {f.dev} 人日</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <window.UI.ToastProvider>
    <App/>
  </window.UI.ToastProvider>
);
