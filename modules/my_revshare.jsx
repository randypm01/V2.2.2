// 代理后台 - 我的分润 P0-7
const ARSUI = window.UI;

function MyRevshareModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const [tab, setTab] = React.useState('overview');

  const myPlayers = D.players.filter(p => p.agentId === me.id);
  const ngr = myPlayers.reduce((a,p)=>a+p.ngr,0);
  const positiveNgr = myPlayers.filter(p=>p.ngr>0).reduce((a,p)=>a+p.ngr,0);
  const negativeNgr = myPlayers.filter(p=>p.ngr<0).reduce((a,p)=>a+p.ngr,0);
  const revShareRate = 35;
  const revShareAmt = ngr > 0 ? ngr * revShareRate / 100 : 0;

  // 模拟近 12 周 NGR
  const weeklyNgr = React.useMemo(() => Array.from({length:12}).map((_,i)=>{
    const base = ngr / 12;
    return Math.round(base * (0.6 + Math.random() * 0.8));
  }), [ngr]);

  // 玩家明细 by NGR 排序
  const playerRows = [...myPlayers].sort((a,b)=>b.ngr-a.ngr).slice(0, 30);

  return (
    <div className="page">
      <ARSUI.PageHead title="我的分润 (RevShare)" subtitle="基于玩家 NGR 的长期分润收益">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </ARSUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['本月 NGR', '$' + F.money(ngr), ngr>0?'盈利':'负盈利', ngr>0?'up':'down'],
          ['本月分润', '$' + F.money(revShareAmt), revShareRate + '% × NGR', 'flat'],
          ['正盈利玩家', myPlayers.filter(p=>p.ngr>0).length + ' / ' + myPlayers.length, '$' + F.money(positiveNgr), 'up'],
          ['负盈利玩家', myPlayers.filter(p=>p.ngr<0).length + ' / ' + myPlayers.length, '$' + F.money(Math.abs(negativeNgr)), 'down'],
          ['累计分润', '$' + F.money(revShareAmt * 6), '近 6 个月', 'flat'],
        ].map(([l,v,d,dir]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            {d && <div className={'delta '+(dir==='up'?'up':dir==='down'?'down':'')} style={{color:dir==='flat'?'var(--text-3)':undefined}}>{d}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <ARSUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'overview', label:'分润总览'},
          {key:'players', label:'玩家明细', count: myPlayers.length},
          {key:'history', label:'历史趋势'},
          {key:'rule', label:'分润规则'},
        ]}/>

        {tab === 'overview' && (
          <div style={{padding:18}}>
            <div className="grid-2" style={{gap:14,marginBottom:14}}>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>NGR 计算口径</div>
                <table style={{width:'100%',fontSize:12.5,borderCollapse:'collapse'}}>
                  <tbody>
                    <CalcRow l="GGR (Gross Gaming Revenue)" v={'$' + F.money(myPlayers.reduce((a,p)=>a+p.deposit-p.withdraw,0))}/>
                    <CalcRow l="− 玩家奖金" v={'-$' + F.money(myPlayers.reduce((a,p)=>a+p.wager*0.02,0))}/>
                    <CalcRow l="− 返水 / Rakeback" v={'-$' + F.money(myPlayers.reduce((a,p)=>a+p.wager*0.005,0))}/>
                    <CalcRow l="− 支付通道费" v={'-$' + F.money(myPlayers.reduce((a,p)=>a+p.deposit*0.01,0))}/>
                    <CalcRow l="NGR" v={'$' + F.money(ngr)} highlight/>
                    <CalcRow l={'× 分润比例 (' + revShareRate + '%)'} v={revShareRate + '%'}/>
                    <CalcRow l="分润金额" v={'$' + F.money(revShareAmt)} primary/>
                  </tbody>
                </table>
              </div>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>盈亏玩家结构</div>
                <div style={{display:'flex',height:24,borderRadius:4,overflow:'hidden',marginBottom:18}}>
                  <div style={{width: (myPlayers.filter(p=>p.ngr>0).length/myPlayers.length*100)+'%',background:'#22c55e',display:'grid',placeItems:'center',color:'#fff',fontSize:11,fontWeight:600}}>
                    {myPlayers.filter(p=>p.ngr>0).length}
                  </div>
                  <div style={{width: (myPlayers.filter(p=>p.ngr===0).length/myPlayers.length*100)+'%',background:'#94a3b8'}}/>
                  <div style={{width: (myPlayers.filter(p=>p.ngr<0).length/myPlayers.length*100)+'%',background:'#ef4444',display:'grid',placeItems:'center',color:'#fff',fontSize:11,fontWeight:600}}>
                    {myPlayers.filter(p=>p.ngr<0).length}
                  </div>
                </div>
                <div style={{display:'grid',gap:8,fontSize:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>
                    <span><span style={{display:'inline-block',width:8,height:8,background:'#22c55e',borderRadius:2,marginRight:6}}/>正盈利玩家</span>
                    <span className="text-mono">{myPlayers.filter(p=>p.ngr>0).length} 人 / +${F.money(positiveNgr)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>
                    <span><span style={{display:'inline-block',width:8,height:8,background:'#ef4444',borderRadius:2,marginRight:6}}/>负盈利玩家</span>
                    <span className="text-mono" style={{color:'var(--danger)'}}>{myPlayers.filter(p=>p.ngr<0).length} 人 / ${F.money(negativeNgr)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0'}}>
                    <span>本月净 NGR</span>
                    <span className="text-mono" style={{color:'var(--brand)',fontWeight:600}}>${F.money(ngr)}</span>
                  </div>
                  <div style={{padding:10,background:'#fef3c7',borderRadius:4,fontSize:11.5,color:'#92400e',marginTop:8}}>
                    <Icon name="alert" size={12} style={{marginRight:4}}/>
                    若本月 NGR 为负,负数将<strong>结转至下月</strong>抵扣,直至全部抵扣完毕
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'players' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th>玩家</th><th>VIP</th>
                <th className="right">充值</th><th className="right">投注</th>
                <th className="right">GGR</th><th className="right">奖金/返水</th>
                <th className="right">NGR</th>
                <th className="right">分润 (35%)</th>
                <th>状态</th>
              </tr></thead>
              <tbody>
                {playerRows.map(p => {
                  const ggr = p.deposit - p.withdraw;
                  const bonus = p.wager * 0.025;
                  const share = p.ngr > 0 ? p.ngr * 0.35 : 0;
                  return (
                    <tr key={p.id}>
                      <td className="text-mono" style={{fontSize:11.5}}>{p.id}</td>
                      <td>{p.vip > 0 ? <span className="badge b-warning">VIP {p.vip}</span> : '-'}</td>
                      <td className="right text-mono">${F.money(p.deposit)}</td>
                      <td className="right text-mono">${F.money(p.wager)}</td>
                      <td className="right text-mono">${F.money(ggr)}</td>
                      <td className="right text-mono">${F.money(bonus)}</td>
                      <td className="right text-mono" style={{color: p.ngr<0?'var(--danger)':'var(--text-0)',fontWeight:p.ngr!==0?600:400}}>
                        ${F.money(p.ngr)}
                      </td>
                      <td className="right text-mono" style={{color:'var(--brand)'}}>${F.money(share)}</td>
                      <td>{p.ngr>0?<span className="badge b-success">正盈利</span>:p.ngr<0?<span className="badge b-danger">负盈利</span>:<span className="text-mute">-</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div style={{padding:18}}>
            <div className="card-inner">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600}}>近 12 周 NGR 与分润趋势</div>
                <div style={{display:'flex',gap:14,fontSize:11.5}}>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#3b82f6',borderRadius:2,marginRight:4,verticalAlign:'middle'}}/>NGR</span>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#22c55e',borderRadius:2,marginRight:4,verticalAlign:'middle'}}/>分润</span>
                </div>
              </div>
              <svg viewBox="0 0 720 220" style={{width:'100%',height:220}}>
                {[0,1,2,3,4].map(i => <line key={i} x1="40" y1={20 + i*40} x2="710" y2={20 + i*40} stroke="#e2e8f0" strokeDasharray="2 2"/>)}
                {(() => {
                  const max = Math.max(...weeklyNgr, 1);
                  const w = 56, gap = 4;
                  return weeklyNgr.map((v, i) => {
                    const h = Math.abs(v) / max * 160;
                    const x = 50 + i * (w + gap);
                    return (
                      <g key={i}>
                        <rect x={x} y={180 - h} width={w-12} height={h} fill="#3b82f6" opacity="0.85"/>
                        <rect x={x+w/2} y={180 - h*0.35} width={w-12} height={h*0.35} fill="#22c55e" opacity="0.85"/>
                        <text x={x + (w-12)/2} y="200" textAnchor="middle" fontSize="10" fill="#64748b">W{i+19}</text>
                        <text x={x + (w-12)/2} y={172 - h} textAnchor="middle" fontSize="10" fill="#1e293b" fontWeight="600">${F.money(v)}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>
        )}

        {tab === 'rule' && (
          <div style={{padding:18}}>
            <div className="card-inner" style={{maxWidth:720,margin:'0 auto'}}>
              <div className="form-section-title" style={{marginTop:0}}>RevShare 方案</div>
              <table style={{width:'100%',fontSize:12.5}}>
                <tbody>
                  <RuleRow l="分润比例" v="35% × NGR"/>
                  <RuleRow l="NGR 公式" v="GGR − 玩家奖金 − 返水 − 支付费"/>
                  <RuleRow l="结算周期" v="每周一结算上一周"/>
                  <RuleRow l="负盈利结转" v="是 · 上月负数计入下月,直至清偿"/>
                  <RuleRow l="结算币种" v={me.currency}/>
                  <RuleRow l="最低结算金额" v="$200 (低于该金额顺延至下期)"/>
                  <RuleRow l="持有期" v="结算后 7 天可申请提款"/>
                </tbody>
              </table>
              <div className="form-section-title mt-3">阶梯奖励 (达成额外奖励)</div>
              <div style={{display:'grid',gap:6,fontSize:12.5}}>
                {[
                  ['月 NGR ≥ $5,000', '+2%', '本月分润比例 → 37%'],
                  ['月 NGR ≥ $20,000', '+5%', '本月分润比例 → 40%'],
                  ['月 NGR ≥ $50,000', '+8% + 升级', '分润 → 43%,等级升白金'],
                  ['月 NGR ≥ $100,000', '一对一专属经理', '议价空间 + 加速结算'],
                ].map(([t, b, d], i) => (
                  <div key={i} style={{display:'flex',padding:'10px 14px',background:'var(--bg-2)',borderRadius:6,gap:12,alignItems:'center'}}>
                    <span style={{width:140,color:'var(--text-1)'}}>{t}</span>
                    <span className="badge b-success" style={{minWidth:80,textAlign:'center'}}>{b}</span>
                    <span className="text-mute" style={{fontSize:11.5,flex:1}}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalcRow({l,v,highlight,primary}) {
  return (
    <tr>
      <td style={{padding:'8px 0',color: primary?'var(--text-0)':'var(--text-1)',fontWeight:primary?600:400,borderBottom:highlight||primary?'1px solid var(--line)':'1px solid var(--line-soft)'}}>{l}</td>
      <td style={{padding:'8px 0',textAlign:'right',fontFamily:'var(--font-mono)',color: primary?'var(--brand)':highlight?'var(--text-0)':'var(--text-1)',fontWeight:highlight||primary?600:400,fontSize:primary?14:12.5,borderBottom:highlight||primary?'1px solid var(--line)':'1px solid var(--line-soft)'}}>{v}</td>
    </tr>
  );
}

function RuleRow({l,v}) {
  return (
    <tr>
      <td style={{padding:'8px 0',color:'var(--text-3)',width:160,borderBottom:'1px solid var(--line-soft)'}}>{l}</td>
      <td style={{padding:'8px 0',color:'var(--text-1)',borderBottom:'1px solid var(--line-soft)'}}>{v}</td>
    </tr>
  );
}

window.MyRevshareModule = MyRevshareModule;
