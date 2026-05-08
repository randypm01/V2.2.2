// 代理后台 - 首页 / Dashboard
const ADUI = window.UI;

function AgentDashboardModule({ onNav }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const myPlayers = D.players.filter(p => p.agentId === me.id);
  const myCodes = D.codes.filter(c => c.agent === me.id);
  const myCpa = D.cpaRecords.filter(c => c.agentId === me.id);
  const mySettle = D.settlements.filter(s => s.agentId === me.id);
  const validCpa = myCpa.filter(c=>c.status==='approved').length;
  const ngr = myPlayers.reduce((a,p)=>a+p.ngr,0);
  const revShare = ngr > 0 ? ngr * 0.35 : 0;
  const monthCommission = mySettle.slice(0,4).reduce((a,s)=>a+s.total,0);
  const ftd = myPlayers.filter(p=>p.ftd).length;

  // 近 30 天数据
  const days = React.useMemo(() => Array.from({length:30}).map((_,i)=>({
    clicks: 80 + Math.floor(Math.random()*120),
    ftd: 1 + Math.floor(Math.random()*6),
    commission: 50 + Math.floor(Math.random()*180),
  })), []);
  const maxC = Math.max(...days.map(d=>d.commission));

  const go = (mod) => onNav && onNav('mod:'+mod);

  return (
    <div className="page">
      <ADUI.PageHead title={'你好,' + me.name} subtitle={'欢迎回来 · 上次登录 ' + new Date(Date.now()-2*3600*1000).toLocaleString('zh-CN')}>
        <button className="btn"><Icon name="bell" size={13}/>通知中心 <span style={{marginLeft:6,padding:'1px 6px',background:'var(--danger)',color:'#fff',borderRadius:8,fontSize:10}}>5</span></button>
        <button className="btn primary" onClick={()=>go('my_codes')}><Icon name="plus" size={13}/>创建 Code</button>
      </ADUI.PageHead>

      <window.AgentHero tone="#3b82f6"/>

      {/* 重点 KPI 4 张大卡 */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
        {[
          { l:'本月佣金 (USD)', v:'$'+F.money(monthCommission), d:'+18.4% MoM', ic:'wallet', tone:'#0891b2', sub:'已结算 3 张 · 待付款 $2,847', mod:'my_settlement' },
          { l:'有效 CPA 数', v:F.fmtNum(validCpa), d:'+12 本月', ic:'check', tone:'#16a34a', sub:'通过率 ' + (myCpa.length?(validCpa/myCpa.length*100).toFixed(0):0) + '%', mod:'my_cpa' },
          { l:'累计 NGR', v:'$'+F.money(ngr), d: ngr>0?'盈利':'负盈利', ic:'pie', tone:'#22c55e', sub:'分润预估 $'+F.money(revShare), mod:'my_revshare' },
          { l:'我的玩家', v:F.fmtNum(myPlayers.length), d:'+'+ftd+' 已首存', ic:'users', tone:'#a855f7', sub: myPlayers.filter(p=>p.vip>=4).length + ' VIP', mod:'my_players' },
        ].map((k, i) => (
          <div key={i} onClick={()=>go(k.mod)} style={{
            padding:18,
            background:'var(--bg-1)',
            border:'1px solid var(--line)',
            borderRadius:8,
            cursor:'pointer',
            transition:'all 0.15s',
            position:'relative',overflow:'hidden'
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=k.tone;e.currentTarget.style.transform='translateY(-1px)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)';e.currentTarget.style.transform='';}}>
            <div style={{position:'absolute',right:-20,top:-20,width:80,height:80,borderRadius:'50%',background:k.tone,opacity:0.08}}/>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:6,background:k.tone+'20',display:'grid',placeItems:'center'}}>
                <Icon name={k.ic} size={16} style={{color:k.tone}}/>
              </div>
              <span className="text-mute" style={{fontSize:11.5}}>{k.l}</span>
            </div>
            <div style={{fontSize:24,fontWeight:600,fontFamily:'var(--font-mono)',color:'var(--text-0)',letterSpacing:-0.3}}>{k.v}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,fontSize:11.5}}>
              <span style={{color:k.tone,fontWeight:600}}>{k.d}</span>
              <span className="text-mute">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 近 30 天佣金趋势 + 待办 */}
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:14,marginBottom:14}}>
        <div className="card">
          <div style={{padding:'14px 18px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>近 30 天佣金趋势</div>
              <div className="text-mute" style={{fontSize:11.5,marginTop:2}}>每日佣金累计 (CPA + RevShare)</div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button className="btn sm">7 天</button>
              <button className="btn sm primary">30 天</button>
              <button className="btn sm">90 天</button>
            </div>
          </div>
          <div style={{padding:'14px 18px'}}>
            <svg viewBox="0 0 720 200" style={{width:'100%',height:200}}>
              {[0,1,2,3].map(i => <line key={i} x1="40" y1={20 + i*45} x2="710" y2={20 + i*45} stroke="#e2e8f0" strokeDasharray="2 2"/>)}
              {[0,1,2,3].map(i => <text key={i} x="32" y={24 + i*45} textAnchor="end" fontSize="10" fill="#94a3b8">${Math.round(maxC*(1-i/3))}</text>)}
              {/* 区域 */}
              {(() => {
                const w = 670, h = 160;
                const xStep = w / (days.length - 1);
                const points = days.map((d, i) => `${50 + i*xStep},${180 - d.commission/maxC*h}`).join(' ');
                const area = `M50,180 L${points.replace(/ /g,' L')} L${50 + (days.length-1)*xStep},180 Z`;
                return (
                  <>
                    <defs>
                      <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#dashGrad)"/>
                    <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2"/>
                    {days.map((d, i) => i % 5 === 0 && (
                      <text key={i} x={50 + i*xStep} y="195" textAnchor="middle" fontSize="10" fill="#94a3b8">D{i+1}</text>
                    ))}
                  </>
                );
              })()}
            </svg>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:14,paddingTop:14,borderTop:'1px solid var(--line-soft)'}}>
              {[
                ['总佣金 (30天)', '$' + F.money(days.reduce((a,d)=>a+d.commission,0))],
                ['日均佣金', '$' + F.money(days.reduce((a,d)=>a+d.commission,0)/30)],
                ['最高单日', '$' + F.money(maxC)],
              ].map(([l,v]) => (
                <div key={l}>
                  <div className="text-mute" style={{fontSize:11}}>{l}</div>
                  <div className="text-mono" style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>待办与提醒</div>
            <button className="btn sm ghost">全部 →</button>
          </div>
          <div style={{display:'grid',gap:8}}>
            {[
              { ic:'wallet', t:'结算单待确认', d:'STL-2026W19 · $2,847.50', tone:'#3b82f6', mod:'my_settlement' },
              { ic:'alert', t:'2 笔 CPA 申诉待复核', d:'拒绝原因:流水未达 ×5', tone:'#f59e0b', mod:'my_cpa' },
              { ic:'shield', t:'2FA 未启用', d:'强烈建议启用以保护账户', tone:'#ef4444', mod:'my_profile' },
              { ic:'flag', t:'BR 世界杯活动上线', d:'5/20 - 6/15 · 额外 $20 奖励', tone:'#22c55e', mod:'my_notify' },
              { ic:'bell', t:'3 条未读通知', d:'结算 / 风控 / 系统', tone:'#a855f7', mod:'my_notify' },
            ].map((it, i) => (
              <div key={i} onClick={()=>go(it.mod)} style={{
                padding:'10px 12px',
                background:'var(--bg-2)',
                borderRadius:6,
                cursor:'pointer',
                display:'flex',gap:10,alignItems:'flex-start',
                borderLeft:'3px solid '+it.tone,
              }}>
                <Icon name={it.ic} size={14} style={{color:it.tone,marginTop:2}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,color:'var(--text-0)',fontWeight:500}}>{it.t}</div>
                  <div className="text-mute" style={{fontSize:11,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{it.d}</div>
                </div>
                <Icon name="chevronRight" size={12} style={{color:'var(--text-3)'}}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 我的 Code TopN + 玩家分布 */}
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:14,marginBottom:14}}>
        <div className="card" style={{padding:'14px 18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>我的 Code · 表现 Top 5</div>
              <div className="text-mute" style={{fontSize:11.5,marginTop:2}}>近 30 天数据</div>
            </div>
            <button className="btn sm ghost" onClick={()=>go('my_codes')}>全部 Code →</button>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Code</th><th>渠道</th>
              <th className="right">Clicks</th>
              <th className="right">FTD</th>
              <th className="right">CR%</th>
              <th className="right">佣金</th>
            </tr></thead>
            <tbody>
              {[...myCodes].sort((a,b)=>b.commission-a.commission).slice(0,5).map(c => {
                const cr = c.clicks ? (c.regs/c.clicks*100).toFixed(1) : '0.0';
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,background:'var(--bg-3)',padding:'1px 6px',borderRadius:3,fontSize:11.5}}>{c.code}</span>
                      <span className="text-mute" style={{fontSize:11,marginLeft:8}}>{c.name}</span>
                    </td>
                    <td><span className="badge b-neutral">{c.channel}</span></td>
                    <td className="right text-mono">{F.fmtNum(c.clicks)}</td>
                    <td className="right text-mono">{F.fmtNum(c.ftds)}</td>
                    <td className="right text-mono" style={{color:'var(--success)'}}>{cr}%</td>
                    <td className="right text-mono" style={{color:'var(--brand)',fontWeight:600}}>${F.money(c.commission)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card" style={{padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>玩家国家分布</div>
          {(() => {
            const byC = {};
            myPlayers.forEach(p => { byC[p.country] = (byC[p.country]||0) + 1; });
            const sorted = Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,6);
            const max = sorted[0]?.[1] || 1;
            return sorted.map(([k, v]) => (
              <div key={k} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{color:'var(--text-1)'}}>{D.LABELS.countries[k] || k}</span>
                  <span className="text-mono">{v} 人</span>
                </div>
                <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:(v/max*100)+'%',height:'100%',background:'var(--brand)',borderRadius:4}}/>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="card" style={{padding:'14px 18px'}}>
        <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginBottom:14}}>快捷入口</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>
          {[
            { l:'我的 Code', ic:'link', mod:'my_codes' },
            { l:'我的玩家', ic:'users', mod:'my_players' },
            { l:'CPA 报表', ic:'check', mod:'my_cpa' },
            { l:'分润报表', ic:'pie', mod:'my_revshare' },
            { l:'结算单', ic:'file', mod:'my_settlement' },
            { l:'我的钱包', ic:'wallet', mod:'my_wallet' },
          ].map(q => (
            <div key={q.mod} onClick={()=>go(q.mod)} style={{
              padding:14, textAlign:'center',
              background:'var(--bg-2)', borderRadius:8, cursor:'pointer',
              transition:'all 0.15s'
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--brand-soft)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-2)';}}>
              <Icon name={q.ic} size={20} style={{color:'var(--brand)',marginBottom:6}}/>
              <div style={{fontSize:12,color:'var(--text-1)'}}>{q.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.AgentDashboardModule = AgentDashboardModule;
