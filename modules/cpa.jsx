// CPA管理
const CUI = window.UI;

function CpaModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = CUI.useToast();
  const [tab, setTab] = React.useState('records');
  const [records, setRecords] = React.useState(D.cpaRecords);
  const [schemes, setSchemes] = React.useState(D.cpaSchemes);
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showScheme, setShowScheme] = React.useState(null);
  const [selected, setSelected] = React.useState(new Set());

  const filtered = records.filter(r => filter === 'all' || r.status === filter);
  const pageSize = 14;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const counts = {
    all: records.length,
    pending: records.filter(r=>r.status==='pending').length,
    approved: records.filter(r=>r.status==='approved').length,
    rejected: records.filter(r=>r.status==='rejected').length,
    risk_hold: records.filter(r=>r.status==='risk_hold').length,
  };

  const approve = (ids) => {
    setRecords(records.map(r => ids.includes(r.id) ? {...r, status:'approved', reviewedBy:'admin', reviewedAt: Date.now()} : r));
    toast(`已通过 ${ids.length} 条 CPA 记录`);
    setSelected(new Set());
  };
  const reject = (ids) => {
    setRecords(records.map(r => ids.includes(r.id) ? {...r, status:'rejected', reviewedBy:'admin', reviewedAt: Date.now(), reason:'人工拒绝'} : r));
    toast(`已拒绝 ${ids.length} 条 CPA 记录`, 'error');
    setSelected(new Set());
  };

  return (
    <div className="page">
      <CUI.PageHead title="CPA 管理" subtitle="CPA 方案配置与有效 CPA 审核">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
        <button className="btn primary" onClick={()=>setShowScheme({})}><Icon name="plus" size={13}/>新建 CPA 方案</button>
      </CUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['今日有效CPA', '243', '+8.2%', 'up'],
          ['本月有效CPA', F.fmtNum(counts.approved), '+12.4%', 'up'],
          ['待审核', counts.pending, '-3', 'down'],
          ['拒绝率', '14.3%', '-1.2pp', 'up'],
          ['CPA成本/玩家', '$42.18', '+$1.20', 'flat'],
        ].map(([l,v,d,dir]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div><div className="val">{v}</div>
            <div className={'delta '+dir}>{d}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <CUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'records',label:'CPA 审核记录',count:counts.all},
          {key:'schemes',label:'CPA 方案',count:schemes.length},
          {key:'reasons',label:'拒绝原因报表'},
        ]}/>

        {tab === 'records' && (
          <>
            <div className="toolbar">
              <div className="seg">
                {[
                  {v:'all',l:'全部'},
                  {v:'pending',l:'待审核', c:counts.pending},
                  {v:'approved',l:'已通过', c:counts.approved},
                  {v:'rejected',l:'已拒绝', c:counts.rejected},
                  {v:'risk_hold',l:'风控暂扣', c:counts.risk_hold},
                ].map(s => (
                  <button key={s.v} className={filter===s.v?'active':''} onClick={()=>{setFilter(s.v);setPage(1);}}>
                    {s.l}{s.c != null && <span className="text-mono text-mute" style={{marginLeft:4}}>({s.c})</span>}
                  </button>
                ))}
              </div>
              <CUI.DateRange value="7d" onChange={()=>{}}/>
              <select className="filter-select"><option>全部代理</option></select>
              <select className="filter-select"><option>全部方案</option>{schemes.map(s=><option key={s.id}>{s.name}</option>)}</select>
              <span style={{flex:1}}/>
              {selected.size > 0 && (
                <>
                  <span style={{fontSize:12,color:'var(--text-2)'}}>已选 {selected.size}</span>
                  <button className="btn sm" onClick={()=>approve([...selected])}><Icon name="check" size={12}/>批量通过</button>
                  <button className="btn sm danger" onClick={()=>reject([...selected])}><Icon name="x" size={12}/>批量拒绝</button>
                </>
              )}
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th style={{width:36}}><CheckBox on={selected.size>0&&selected.size===paged.length} onChange={()=>setSelected(selected.size===paged.length?new Set():new Set(paged.map(r=>r.id)))}/></th>
                  <th>CPA ID</th><th>代理</th><th>玩家</th>
                  <th className="right">首存</th><th className="right">流水</th>
                  <th className="right">NGR</th><th className="right">CPA金额</th>
                  <th>状态</th><th>拒绝原因</th><th>审核人</th><th>FTD时间</th><th style={{width:120}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(r => (
                    <tr key={r.id} className={selected.has(r.id)?'selected':''}>
                      <td><CheckBox on={selected.has(r.id)} onChange={()=>{const s=new Set(selected);s.has(r.id)?s.delete(r.id):s.add(r.id);setSelected(s);}}/></td>
                      <td className="id">{r.id}</td>
                      <td className="id">{r.agentId}</td>
                      <td className="id">{r.playerId}</td>
                      <td className="right">${r.ftdAmount}</td>
                      <td className="right">${F.fmtNum(r.wager)}</td>
                      <td className="right" style={{color: r.ngr>0?'#6ee7a8':'#fca5a5'}}>${r.ngr}</td>
                      <td className="right" style={{color:'var(--text-0)',fontWeight:500}}>${r.cpaAmount}</td>
                      <td><CUI.StatusBadge status={r.status}/></td>
                      <td className="text-mute" style={{fontSize:11}}>{r.reason || '—'}</td>
                      <td className="text-mute" style={{fontSize:11}}>{r.reviewedBy || '—'}</td>
                      <td className="text-mute" style={{fontSize:11}}>{new Date(r.ftdAt).toLocaleDateString('zh-CN')}</td>
                      <td>
                        {r.status === 'pending' ? (
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn sm" onClick={()=>approve([r.id])}><Icon name="check" size={11}/></button>
                            <button className="btn sm danger" onClick={()=>reject([r.id])}><Icon name="x" size={11}/></button>
                          </div>
                        ) : <button className="btn sm ghost icon-only"><Icon name="eye" size={13}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
          </>
        )}

        {tab === 'schemes' && (
          <div style={{padding:14}}>
            <div className="grid-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'}}>
              {schemes.map(s => (
                <div key={s.id} style={{background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:8,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)'}}>{s.name}</div>
                      <div className="id" style={{fontSize:11,marginTop:2}}>{s.id}</div>
                    </div>
                    <CUI.StatusBadge status={s.status === 'active' ? 'active' : s.status === 'paused' ? 'paused' : 'pending'}/>
                  </div>
                  <div style={{display:'flex',alignItems:'baseline',gap:6,padding:'8px 0'}}>
                    <span style={{fontSize:24,fontWeight:600,color:'var(--brand)',fontFamily:'var(--font-mono)'}}>${s.amount}</span>
                    <span className="text-mute" style={{fontSize:11}}>per CPA · {s.currency}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 12px',fontSize:11.5,padding:'8px 0',borderTop:'1px solid var(--line-soft)'}}>
                    <div className="text-mute">最低首存</div><div className="text-mono">${s.minFtd}</div>
                    <div className="text-mute">流水倍数</div><div className="text-mono">×{s.minWager}</div>
                    <div className="text-mute">NGR要求</div><div className="text-mono">${s.minNgr}</div>
                    <div className="text-mute">市场</div><div>{s.market}</div>
                    <div className="text-mute">适用代理</div><div className="text-mono">{s.applicableAgents}</div>
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:12}}>
                    <button className="btn sm" style={{flex:1}} onClick={()=>setShowScheme(s)}>编辑</button>
                    <button className="btn sm ghost icon-only"><Icon name="copy" size={13}/></button>
                    <button className="btn sm ghost icon-only"><Icon name="more" size={13}/></button>
                  </div>
                </div>
              ))}
              <div onClick={()=>setShowScheme({})} style={{background:'var(--bg-2)',border:'1px dashed var(--line-strong)',borderRadius:8,padding:30,display:'grid',placeItems:'center',cursor:'pointer',color:'var(--text-3)'}}>
                <div style={{textAlign:'center'}}>
                  <Icon name="plus" size={20}/>
                  <div style={{fontSize:12,marginTop:6}}>新建 CPA 方案</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'reasons' && (
          <div style={{padding:18}}>
            <div className="grid-2">
              {[
                ['同IP', 142, '#ef4444', 28.4],
                ['同设备', 96, '#f59e0b', 19.2],
                ['多账号', 84, '#a855f7', 16.8],
                ['低于最低首存', 67, '#06b6d4', 13.4],
                ['未达流水', 52, '#22c55e', 10.4],
                ['NGR不足', 31, '#3b82f6', 6.2],
                ['提款过快', 18, '#ec4899', 3.6],
                ['疑似套利', 10, '#14b8a6', 2.0],
              ].map(([l,v,c,p]) => (
                <div key={l} style={{display:'grid',gridTemplateColumns:'140px 1fr 60px 60px',gap:10,alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--line-soft)'}}>
                  <div style={{fontSize:12.5}}>{l}</div>
                  <div className="funnel-bar"><div style={{width:p*3+'%',background:c}}>{v}</div></div>
                  <div className="text-mono right" style={{textAlign:'right',fontSize:11}}>{v} 条</div>
                  <div className="text-mono right" style={{textAlign:'right',fontSize:11,color:c}}>{p}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CUI.Modal open={!!showScheme} onClose={()=>setShowScheme(null)} size="lg" title={showScheme?.id ? '编辑 CPA 方案' : '新建 CPA 方案'}
        footer={<><button className="btn ghost" onClick={()=>setShowScheme(null)}>取消</button><button className="btn primary" onClick={()=>{toast('CPA 方案已保存');setShowScheme(null);}}>保存</button></>}>
        {showScheme && <CpaSchemeForm scheme={showScheme}/>}
      </CUI.Modal>
    </div>
  );
}

function CpaSchemeForm({ scheme }) {
  return (
    <div>
      <div className="form-section-title" style={{marginTop:0}}>基本信息</div>
      <div className="form-grid">
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>方案名称</label><input className="input" defaultValue={scheme.name}/></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>CPA 金额</label><input className="input" defaultValue={scheme.amount} type="number"/></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>币种</label><select className="select" defaultValue={scheme.currency || 'USD'}><option>USD</option><option>USDT</option><option>BRL</option><option>INR</option></select></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>市场</label><select className="select" defaultValue={scheme.market || 'LATAM'}><option>LATAM</option><option>APAC</option><option>SEA</option><option>EU</option><option>Global</option></select></div>
      </div>
      <div className="form-section-title mt-4">有效条件</div>
      <div className="form-grid">
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>最低首存金额</label><input className="input" defaultValue={scheme.minFtd}/></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>最低流水倍数</label><input className="input" defaultValue={scheme.minWager}/></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>最低 NGR</label><input className="input" defaultValue={scheme.minNgr}/></div>
        <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>有效天数</label><input className="input" defaultValue="7"/></div>
      </div>
      <div className="form-section-title mt-4">风控规则</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
        {[
          ['需要 D1 留存', false],
          ['需要 D3 留存', true],
          ['排除同IP玩家', true],
          ['排除同设备玩家', true],
          ['排除提款过快玩家', true],
          ['排除风控玩家', true],
          ['共享支付方式黑名单', true],
          ['人工复核高额CPA', false],
        ].map(([l,d]) => (
          <div key={l} style={{display:'flex',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>
            <span style={{flex:1,fontSize:12.5}}>{l}</span>
            <Switch on={d}/>
          </div>
        ))}
      </div>
    </div>
  );
}

window.CpaModule = CpaModule;
