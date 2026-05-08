// 风控管理
const KUI = window.UI;

function RiskModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = KUI.useToast();
  const [tab, setTab] = React.useState('players');
  const [risk, setRisk] = React.useState(D.riskPlayers);
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('all');

  const filtered = risk.filter(r => filter === 'all' || r.level === filter);
  const pageSize = 14;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const release = (id) => {
    setRisk(risk.map(r => r.id === id ? {...r, status:'released', frozen:false} : r));
    toast('已释放 ' + id);
  };
  const confirm = (id) => {
    setRisk(risk.map(r => r.id === id ? {...r, status:'confirmed'} : r));
    toast('已确认风险 ' + id, 'error');
  };

  return (
    <div className="page">
      <KUI.PageHead title="风控管理" subtitle="代理与玩家风控、佣金风控处理">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
        <button className="btn primary"><Icon name="settings" size={13}/>风控规则</button>
      </KUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          ['风控玩家总数', risk.length, 'danger'],
          ['高风险', risk.filter(r=>r.level==='high'||r.level==='critical').length, 'danger'],
          ['冻结佣金额', '$' + F.money(28400), 'warning'],
          ['同IP告警', 47, 'warning'],
          ['套利疑似', 12, 'danger'],
          ['今日处理', 23, 'info'],
        ].map(([l,v,t]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val" style={{color: t==='danger'?'#fca5a5':t==='warning'?'#fcd34d':'var(--text-0)'}}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <KUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'players',label:'风控玩家名单',count:risk.length},
          {key:'agents',label:'风险代理',count:8},
          {key:'cpa',label:'CPA 风控审核',count:42},
          {key:'actions',label:'风控动作'},
        ]}/>

        {tab === 'players' && (
          <>
            <div className="toolbar">
              <KUI.SearchInput value="" onChange={()=>{}} placeholder="玩家ID / 代理ID"/>
              <div className="seg">
                {[{v:'all',l:'全部'},{v:'low',l:'低'},{v:'medium',l:'中'},{v:'high',l:'高'},{v:'critical',l:'紧急'}].map(s => (
                  <button key={s.v} className={filter===s.v?'active':''} onClick={()=>setFilter(s.v)}>{s.l}</button>
                ))}
              </div>
              <select className="filter-select"><option>全部原因</option><option>同IP多账号</option><option>同设备</option><option>套利</option><option>Bot</option></select>
              <span style={{flex:1}}/>
              <button className="btn sm danger">批量冻结佣金</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>玩家</th><th>所属代理</th><th>所属Code</th>
                  <th>风控原因</th><th>风险等级</th>
                  <th>计入CPA</th><th>计入分润</th><th>佣金</th>
                  <th>处理状态</th><th>标记时间</th>
                  <th style={{width:160}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(r => (
                    <tr key={r.id + Math.random()}>
                      <td className="id" style={{color:'var(--text-0)'}}>{r.id}</td>
                      <td className="id">{r.agentId}</td>
                      <td className="id">{r.codeId}</td>
                      <td><span className="badge b-warning">{r.reason}</span></td>
                      <td><KUI.RiskBadge level={r.level}/></td>
                      <td>{r.cpaCounted ? <Icon name="check" size={13} style={{color:'#6ee7a8'}}/> : <Icon name="x" size={13} style={{color:'#fca5a5'}}/>}</td>
                      <td>{r.revShareCounted ? <Icon name="check" size={13} style={{color:'#6ee7a8'}}/> : <Icon name="x" size={13} style={{color:'#fca5a5'}}/>}</td>
                      <td><span className={'badge ' + (r.frozen?'b-warning':'b-success')}><span className="dot"/>{r.frozen?'已冻结':'正常'}</span></td>
                      <td><KUI.StatusBadge status={r.status}/></td>
                      <td className="text-mute" style={{fontSize:11}}>{new Date(r.flaggedAt).toLocaleDateString('zh-CN')}</td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn sm" onClick={()=>release(r.id)}>释放</button>
                          <button className="btn sm danger" onClick={()=>confirm(r.id)}>确认风险</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <KUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
          </>
        )}

        {tab === 'agents' && (
          <div style={{padding:14}}>
            <div className="grid-2">
              {[
                {id:'AG100023',name:'TopMedia LATAM',risk:'critical',issues:['CPA拒绝率92%','3名玩家同IP段','本月异常提款 $4,820'],loss: 12400},
                {id:'AG100007',name:'GoldStream Network',risk:'high',issues:['12名玩家共享IP段','7名玩家FTD后24h提款','平均流水仅 1.2x'],loss: 8200},
                {id:'AG100015',name:'PIX_Booster_BR',risk:'high',issues:['提款行为异常','低质量流量比例 38%','3次拒绝CPA申诉'],loss: 5400},
                {id:'AG100034',name:'TG_VIP_Channel',risk:'medium',issues:['新增玩家D7留存仅 8%','疑似激励流量'],loss: 1200},
              ].map(a => (
                <div key={a.id} style={{background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:8,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>{a.name}</div>
                      <div className="id" style={{fontSize:11,marginTop:2}}>{a.id}</div>
                    </div>
                    <KUI.RiskBadge level={a.risk}/>
                  </div>
                  <div style={{padding:10,background:'var(--bg-3)',borderRadius:6,marginBottom:10}}>
                    <div className="text-mute" style={{fontSize:11,marginBottom:4}}>预估佣金损失</div>
                    <div className="text-mono" style={{fontSize:18,color:'#fca5a5',fontWeight:600}}>-${F.fmtNum(a.loss)}</div>
                  </div>
                  <div style={{fontSize:11.5}}>
                    {a.issues.map((iss,i) => (
                      <div key={i} style={{display:'flex',gap:8,padding:'5px 0',color:'var(--text-1)'}}>
                        <Icon name="alert" size={12} style={{color:'var(--warning)',flexShrink:0,marginTop:2}}/>
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:12}}>
                    <button className="btn sm" style={{flex:1}}>详情</button>
                    <button className="btn sm">冻结佣金</button>
                    <button className="btn sm danger">封禁代理</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'cpa' && (
          <div style={{padding:18}}>
            <div className="form-section-title" style={{marginTop:0}}>风控规则状态</div>
            <div className="grid-3">
              {[
                ['同IP检查', true, '触发 142 次'],
                ['同设备检查', true, '触发 96 次'],
                ['同支付检查', true, '触发 64 次'],
                ['多账号检查', true, '触发 84 次'],
                ['投注行为检查', true, '触发 27 次'],
                ['提款行为检查', true, '触发 18 次'],
                ['NGR 检查', true, '触发 31 次'],
                ['留存检查', false, '未启用'],
                ['人工审核', true, '待审 42 笔'],
              ].map(([l,on,m]) => (
                <div key={l} style={{padding:14,background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500}}>{l}</span>
                    <Switch on={on}/>
                  </div>
                  <div className="text-mute" style={{fontSize:11}}>{m}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'actions' && (
          <div style={{padding:14}}>
            <table className="tbl">
              <thead><tr><th>动作类型</th><th>触发次数</th><th>影响代理</th><th>影响佣金</th><th>启用</th></tr></thead>
              <tbody>
                {[
                  ['冻结佣金', 47, 12, 28400, true],
                  ['解除冻结', 14, 6, 12200, true],
                  ['拒绝 CPA', 142, 28, 7100, true],
                  ['扣除佣金', 18, 8, 4800, true],
                  ['延迟结算', 9, 4, 18600, true],
                  ['封禁代理', 3, 3, 0, true],
                  ['限制登录', 2, 2, 0, true],
                  ['限制提款', 6, 4, 9200, true],
                  ['加入黑名单', 4, 4, 0, true],
                ].map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="right text-mono">{r[1]}</td>
                    <td className="right text-mono">{r[2]}</td>
                    <td className="right text-mono">${F.fmtNum(r[3])}</td>
                    <td><Switch on={r[4]}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

window.RiskModule = RiskModule;
