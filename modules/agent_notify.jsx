// 代理后台 - 通知中心 P0-14
const ANUI = window.UI;

function AgentNotifyModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const [filter, setFilter] = React.useState('all');
  const [readFilter, setReadFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(null);

  const TYPES = {
    settle:   { l:'结算', c:'#1e40af', bg:'#dbeafe', icon:'wallet' },
    risk:     { l:'风控', c:'#b91c1c', bg:'#fee2e2', icon:'shield' },
    campaign: { l:'活动', c:'#92400e', bg:'#fef3c7', icon:'flag' },
    cpa:      { l:'CPA',  c:'#166534', bg:'#dcfce7', icon:'check' },
    system:   { l:'系统', c:'#64748b', bg:'#f1f5f9', icon:'settings' },
  };

  // 我收到的通知
  const items = React.useMemo(() => {
    const samples = [
      { t:'settle', title:'本周结算单已生成', body:'结算编号 STL-2026W19-AC100006 · 应付金额 $2,847.50 · 请在 7 天内确认' },
      { t:'cpa',    title:'CPA 已通过审核', body:'玩家 PL2024xxx 的 CPA $50 已通过,计入本月收益' },
      { t:'risk',   title:'玩家行为异常告警', body:'玩家 PL2024582 触发风控:首存后 12 小时内提款,该 CPA 暂扣' },
      { t:'campaign', title:'BR 世界杯活动上线', body:'5/20-6/15,玩家 NGR ≥ $200 额外奖励 $20,详见活动详情' },
      { t:'cpa',    title:'CPA 拒绝通知', body:'玩家 PL2024617 CPA 因「流水未达 ×5」被拒绝,可申请人工复核' },
      { t:'settle', title:'提款已成功打款', body:'WD-20260512-0007 · USDT-TRC20 · 金额 $1,500 · 区块已确认' },
      { t:'system', title:'后台 v2.6 升级公告', body:'5/15 02:00-04:00 维护,期间无法登录,新版本新增 Hybrid 配置' },
      { t:'cpa',    title:'CPA 已通过审核', body:'玩家 PL2024xxx 的 CPA $50 已通过,计入本月收益' },
      { t:'risk',   title:'登录异常提醒', body:'账户在「葡萄牙 里斯本」异常登录,如非本人请立即修改密码' },
      { t:'settle', title:'本月负盈利结转', body:'4 月 NGR -$348.20 已结转至 5 月,请在分润详情查看' },
      { t:'campaign', title:'VIP CashBack 活动延期', body:'原定本周结束的 VIP 活动延长至月底,无需重新报名' },
      { t:'system', title:'素材中心 5 月新素材', body:'新增世界杯主题 Banner 28 张 / 视频 6 支,请前往素材中心下载' },
      { t:'cpa',    title:'CPA 已通过审核', body:'玩家 PL2024xxx 的 CPA $50 已通过' },
      { t:'settle', title:'上周结算单已审核通过', body:'STL-2026W18-AC100006 · 金额 $2,415.80 · 等待付款排期' },
      { t:'risk',   title:'多账户共用 IP 提醒', body:'玩家 PL2024301、PL2024319 共用 IP,可能为同人,已介入复核' },
    ];
    return samples.map((s, i) => ({
      id: 'NT' + String(70000 + i).padStart(5,'0'),
      ...s,
      time: Date.now() - (i * 5 + 1) * 3600 * 1000,
      read: i > 4,
    }));
  }, []);

  const counts = {
    all: items.length,
    unread: items.filter(i => !i.read).length,
    settle: items.filter(i => i.t === 'settle').length,
    cpa: items.filter(i => i.t === 'cpa').length,
    risk: items.filter(i => i.t === 'risk').length,
    campaign: items.filter(i => i.t === 'campaign').length,
    system: items.filter(i => i.t === 'system').length,
  };

  let list = items;
  if (filter !== 'all') list = list.filter(i => i.t === filter);
  if (readFilter === 'unread') list = list.filter(i => !i.read);
  if (readFilter === 'read') list = list.filter(i => i.read);

  return (
    <div className="page">
      <ANUI.PageHead title="通知中心" subtitle={`${counts.unread} 条未读 · 来自商户运营 / 系统的实时通知`}>
        <button className="btn"><Icon name="check" size={13}/>全部标为已读</button>
        <button className="btn ghost"><Icon name="settings" size={13}/>通知设置</button>
      </ANUI.PageHead>

      <div className="card" style={{padding:0}}>
        <div style={{display:'grid',gridTemplateColumns:'320px 1fr',minHeight:560}}>
          {/* 左:筛选 + 通知列表 */}
          <div style={{borderRight:'1px solid var(--line)',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'12px 14px',borderBottom:'1px solid var(--line)',display:'flex',gap:6,flexWrap:'wrap'}}>
              {[
                {v:'all', l:'全部', c: counts.all},
                {v:'unread', l:'未读', c: counts.unread},
                {v:'read', l:'已读', c: counts.all - counts.unread},
              ].map(s => (
                <button key={s.v}
                  className={'btn sm ' + (readFilter===s.v?'primary':'ghost')}
                  onClick={()=>setReadFilter(s.v)}
                  style={{flex:1}}>
                  {s.l} <span style={{opacity:.7,marginLeft:2}}>({s.c})</span>
                </button>
              ))}
            </div>
            <div style={{padding:'10px 14px',borderBottom:'1px solid var(--line)',display:'flex',gap:6,flexWrap:'wrap'}}>
              {[
                {v:'all', l:'全部'},
                {v:'settle', l:'结算', c: counts.settle},
                {v:'cpa', l:'CPA', c: counts.cpa},
                {v:'risk', l:'风控', c: counts.risk},
                {v:'campaign', l:'活动', c: counts.campaign},
                {v:'system', l:'系统', c: counts.system},
              ].map(s => (
                <button key={s.v}
                  onClick={()=>setFilter(s.v)}
                  style={{
                    padding:'4px 10px',
                    fontSize:11.5,
                    borderRadius:14,
                    border:'1px solid '+(filter===s.v?'var(--brand)':'var(--line)'),
                    background: filter===s.v?'var(--brand-soft)':'var(--bg-1)',
                    color: filter===s.v?'var(--brand)':'var(--text-2)',
                    cursor:'pointer',
                  }}>
                  {s.l}{s.c !== undefined && <span style={{opacity:.6,marginLeft:2}}>({s.c})</span>}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflowY:'auto',maxHeight:520}}>
              {list.map(it => {
                const t = TYPES[it.t];
                const active = selected === it.id;
                return (
                  <div key={it.id}
                    onClick={()=>setSelected(it.id)}
                    style={{
                      padding:'12px 14px',
                      borderBottom:'1px solid var(--line-soft)',
                      cursor:'pointer',
                      background: active?'var(--brand-soft)':(it.read?'transparent':'var(--bg-2)'),
                      borderLeft:'3px solid '+(active?'var(--brand)':(it.read?'transparent':t.c)),
                    }}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{fontSize:10.5,padding:'1px 7px',borderRadius:3,background:t.bg,color:t.c,fontWeight:600}}>{t.l}</span>
                      {!it.read && <span style={{width:7,height:7,borderRadius:'50%',background:'var(--danger)'}}/>}
                      <span className="text-mute text-mono" style={{fontSize:10.5,marginLeft:'auto'}}>
                        {F.timeAgo(it.time)}
                      </span>
                    </div>
                    <div style={{
                      fontSize:13,fontWeight: it.read?500:600,
                      color: it.read?'var(--text-1)':'var(--text-0)',
                      marginBottom:3,
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'
                    }}>{it.title}</div>
                    <div className="text-mute" style={{fontSize:11.5,lineHeight:1.5,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{it.body}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右:详情 */}
          <div style={{padding:'24px 28px',background:'var(--bg-1)'}}>
            {(() => {
              const it = items.find(x => x.id === selected) || items[0];
              const t = TYPES[it.t];
              return (
                <>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <span style={{fontSize:12,padding:'3px 10px',borderRadius:4,background:t.bg,color:t.c,fontWeight:600}}>{t.l}通知</span>
                    <span className="text-mute text-mono" style={{fontSize:11.5}}>{it.id}</span>
                    <span className="text-mute" style={{fontSize:11.5}}>· {new Date(it.time).toLocaleString('zh-CN')}</span>
                  </div>
                  <h2 style={{fontSize:20,color:'var(--text-0)',marginBottom:6,fontWeight:600}}>{it.title}</h2>
                  <div className="text-mute" style={{fontSize:12,marginBottom:18}}>来源:{it.t==='system'?'系统自动':'商户运营 ops.lily'}</div>

                  <div style={{padding:18,background:'var(--bg-2)',borderRadius:8,fontSize:13,lineHeight:1.8,color:'var(--text-1)'}}>
                    {it.body}
                  </div>

                  {it.t === 'settle' && (
                    <div className="mt-3" style={{padding:14,border:'1px solid var(--brand-line)',borderRadius:8,background:'var(--brand-soft)'}}>
                      <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:'var(--text-0)'}}>结算详情</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,fontSize:12}}>
                        <div><div className="text-mute">CPA</div><div className="text-mono">$1,200.00</div></div>
                        <div><div className="text-mute">RevShare</div><div className="text-mono">$1,847.50</div></div>
                        <div><div className="text-mute">扣减</div><div className="text-mono">-$200.00</div></div>
                        <div><div className="text-mute">合计</div><div className="text-mono" style={{color:'var(--brand)',fontWeight:600}}>$2,847.50</div></div>
                      </div>
                    </div>
                  )}

                  <div style={{marginTop:20,display:'flex',gap:10}}>
                    {it.t === 'settle' && <button className="btn primary"><Icon name="eye" size={13}/>查看结算单</button>}
                    {it.t === 'cpa' && <button className="btn primary"><Icon name="eye" size={13}/>查看 CPA 详情</button>}
                    {it.t === 'campaign' && <button className="btn primary"><Icon name="eye" size={13}/>查看活动</button>}
                    {it.t === 'risk' && <button className="btn"><Icon name="eye" size={13}/>查看玩家</button>}
                    <button className="btn ghost"><Icon name="copy" size={13}/>复制链接</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

window.AgentNotifyModule = AgentNotifyModule;
