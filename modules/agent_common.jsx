// 专业代理后台 - 共用工具与组件
// 当前登录代理身份(模拟)
window.CURRENT_AGENT_ID = 'AG100007';

// 拿到当前代理对象 / 玩家 / Code / CPA / 结算等
window.useCurrentAgent = function() {
  const D = window.APS_DATA;
  // v2.5.6 优先从商户后台 store 拿同一条代理记录,确保「专业代理后台 / 我的账户」与「商户后台 / 代理账户管理」基本资料同步
  const store = window.APS_MERCHANT_AGENTS_STORE;
  const id = window.CURRENT_AGENT_ID;
  if (store) {
    const list = store.list || [];
    const hit = list.find(a => a.id === id || a._displayId === id);
    if (hit) {
      const base = D.agents.find(a => a.id === id) || D.agents[0];
      // v2.5.12 防御:已登入的代理 status 强制 active(即便 store 还未及时更新)
      const loggedSet = window.APS_LOGGED_IN_AGENTS && window.APS_LOGGED_IN_AGENTS.set;
      const merged = { ...base, ...hit };
      if (loggedSet && hit.status === 'pending') {
        const mid = hit._displayId || hit.id;
        if (loggedSet.has(mid) || loggedSet.has(hit.id)) merged.status = 'active';
      }
      return merged;
    }
  }
  return D.agents.find(a => a.id === id) || D.agents[0];
};

// 代理后台:页面顶部代理身份卡(常驻在每个模块顶部)
window.AgentHero = function AgentHero({ icon='dashboard', tone='#3b82f6' }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();

  // 我的玩家 / Code / 结算 数量
  const myPlayers = D.players.filter(p => p.agentId === me.id);
  const myCodes = D.codes.filter(c => c.agent === me.id);
  const myCpa = D.cpaRecords.filter(c => c.agentId === me.id);
  const mySettle = D.settlements.filter(s => s.agentId === me.id);
  const validCpa = myCpa.filter(c => c.status === 'approved').length;
  const pendingCpa = myCpa.filter(c => c.status === 'pending').length;
  const ngr = myPlayers.reduce((a, p) => a + (p.ngr || 0), 0);
  const commissionThisMonth = mySettle.filter(s => s.period.includes('2026-W')).reduce((a, s) => a + (s.total || 0), 0);

  return (
    <div className="agent-hero" style={{
      background:'linear-gradient(135deg,'+tone+'12, transparent 60%), var(--bg-1)',
      border:'1px solid var(--line)',
      borderRadius:8,
      padding:'16px 20px',
      marginBottom:14,
      display:'flex',
      alignItems:'center',
      gap:18,
    }}>
      <div style={{
        width:48,height:48,borderRadius:12,
        background:'linear-gradient(135deg,'+tone+','+tone+'aa)',
        display:'grid',placeItems:'center',color:'#fff',fontSize:20,fontWeight:600,flexShrink:0
      }}>
        {me.name[0]}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4}}>
          <span style={{fontSize:15,fontWeight:600,color:'var(--text-0)'}}>{me.name}</span>
          <span className="badge b-brand">{D.LABELS.tiers[me.tier] || me.tier}</span>
          <span className="badge b-neutral">{D.LABELS.types[me.type] || me.type}</span>
          <span className="badge b-success"><span className="dot"/>正常</span>
        </div>
        <div style={{fontSize:11.5,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>
          {me.id} · L{me.level} · {D.LABELS.markets[me.market]} / {D.LABELS.countries[me.country]} · {me.currency}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,auto)',gap:24,flexShrink:0}}>
        {[
          ['玩家', F.fmtNum(myPlayers.length)],
          ['有效 CPA', F.fmtNum(validCpa) + (pendingCpa ? ' / +' + pendingCpa : '')],
          ['累计 NGR', '$' + F.money(ngr)],
          ['本月佣金', '$' + F.money(commissionThisMonth)],
        ].map(([l, v]) => (
          <div key={l} style={{textAlign:'right'}}>
            <div className="text-mute" style={{fontSize:11}}>{l}</div>
            <div className="text-mono" style={{fontSize:16,color:'var(--text-0)',fontWeight:600,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
