// 结算管理
const SUI = window.UI;

function SettlementModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = SUI.useToast();
  const [items, setItems] = React.useState(D.settlements);
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);

  const filtered = items.filter(s => filter === 'all' || s.status === filter);
  const pageSize = 12;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const counts = {
    all: items.length,
    pending_audit: items.filter(s=>s.status==='pending_audit').length,
    approved: items.filter(s=>s.status==='approved').length,
    paid: items.filter(s=>s.status==='paid').length,
    rejected: items.filter(s=>s.status==='rejected').length,
  };

  const approve = (id) => {
    setItems(items.map(s => s.id === id ? {...s, status:'approved'} : s));
    toast('结算单 ' + id + ' 已通过');
  };

  return (
    <div className="page">
      <SUI.PageHead title="结算管理" subtitle="代理周期结算单的审核与付款">
        <button className="btn"><Icon name="download" size={13}/>导出对账</button>
        <button className="btn primary"><Icon name="refresh" size={13}/>生成本周结算单</button>
      </SUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['本周结算总额', '$' + F.money(items.reduce((a,s)=>a+s.total,0))],
          ['待审核', counts.pending_audit + ' 张'],
          ['已通过待付款', counts.approved + ' 张'],
          ['已付款', counts.paid + ' 张'],
          ['平均处理时长', '4.2 小时'],
        ].map(([l,v]) => (
          <div key={l} className="kpi"><div className="label">{l}</div><div className="val">{v}</div></div>
        ))}
      </div>

      <div className="card">
        <SUI.Tabs value={filter} onChange={(k)=>{setFilter(k);setPage(1);}} tabs={[
          {key:'all',label:'全部',count:counts.all},
          {key:'pending_audit',label:'待审核',count:counts.pending_audit},
          {key:'approved',label:'已通过',count:counts.approved},
          {key:'paid',label:'已付款',count:counts.paid},
          {key:'rejected',label:'已拒绝',count:counts.rejected},
        ]}/>
        <div className="toolbar">
          <SUI.SearchInput placeholder="结算单号 / 代理ID" value="" onChange={()=>{}}/>
          <select className="filter-select"><option>全部周期</option><option>2026-W19</option><option>2026-W18</option><option>2026-W17</option></select>
          <select className="filter-select"><option>全部币种</option>{D.CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
          <span style={{flex:1}}/>
          <button className="btn sm"><Icon name="check" size={12}/>批量审核</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>结算单号</th><th>代理</th><th>周期</th>
              <th className="right">CPA</th><th className="right">RevShare</th>
              <th className="right">下级分润</th><th className="right">调整</th>
              <th className="right">扣款</th><th className="right">税费</th>
              <th className="right">最终金额</th>
              <th>状态</th><th>生成时间</th><th style={{width:120}}>操作</th>
            </tr></thead>
            <tbody>
              {paged.map(s => (
                <tr key={s.id}>
                  <td><a onClick={()=>setDetail(s)} style={{color:'var(--brand)',cursor:'pointer',textDecoration:'none',fontFamily:'var(--font-mono)',fontSize:11.5}}>{s.id}</a></td>
                  <td className="id">{s.agentId}</td>
                  <td className="text-mono text-mute">{s.period}</td>
                  <td className="right">${F.fmtNum(s.cpa)}</td>
                  <td className="right">${F.fmtNum(s.rev)}</td>
                  <td className="right">${F.fmtNum(s.sub)}</td>
                  <td className="right" style={{color: s.adj>=0?'#6ee7a8':'#fca5a5'}}>{s.adj>=0?'+':''}${F.fmtNum(s.adj)}</td>
                  <td className="right num-down">-${F.fmtNum(s.risk)}</td>
                  <td className="right text-mute">-${F.fmtNum(s.tax)}</td>
                  <td className="right" style={{color:'var(--text-0)',fontWeight:600,fontSize:13}}>${F.fmtNum(s.total)}</td>
                  <td><SUI.StatusBadge status={s.status}/></td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(s.generated).toLocaleDateString('zh-CN')}</td>
                  <td>
                    {s.status === 'pending_audit' ? (
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn sm" onClick={()=>approve(s.id)}><Icon name="check" size={11}/>通过</button>
                        <button className="btn sm danger icon-only"><Icon name="x" size={11}/></button>
                      </div>
                    ) : <button className="btn sm ghost" onClick={()=>setDetail(s)}><Icon name="eye" size={12}/>查看</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>

      <SUI.Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?.id} subtitle={detail ? '代理 ' + detail.agentId + ' · 周期 ' + detail.period : ''}
        footer={<>
          <button className="btn">下载明细</button>
          {detail?.status === 'pending_audit' && <button className="btn danger">拒绝</button>}
          {detail?.status === 'pending_audit' && <button className="btn primary" onClick={()=>{approve(detail.id);setDetail(null);}}>通过结算</button>}
          {detail?.status === 'approved' && <button className="btn primary">发起付款</button>}
        </>}>
        {detail && <SettlementDetail item={detail}/>}
      </SUI.Drawer>
    </div>
  );
}

function SettlementDetail({ item }) {
  const F = window.APS_FMT;
  return (
    <div style={{padding:'20px 24px'}}>
      <div style={{padding:18,background:'linear-gradient(135deg,rgba(59,130,246,.1),transparent)',border:'1px solid var(--brand-line)',borderRadius:8,marginBottom:18}}>
        <div className="text-mute" style={{fontSize:11}}>最终结算金额</div>
        <div style={{fontSize:32,fontWeight:600,color:'var(--text-0)',fontFamily:'var(--font-mono)',marginTop:4}}>${F.fmtNum(item.total)}</div>
        <div style={{display:'flex',gap:14,marginTop:6,fontSize:11.5}}>
          <span className="text-mute">USDT 等值 ≈ {(item.total).toFixed(2)} USDT</span>
          <SUI.StatusBadge status={item.status}/>
        </div>
      </div>

      <div className="form-section-title" style={{marginTop:0}}>佣金明细</div>
      <table className="tbl" style={{fontSize:12}}>
        <tbody>
          {[
            ['CPA 收益', item.cpa, '+'],
            ['RevShare 收益', item.rev, '+'],
            ['下级代理分润', item.sub, '+'],
            ['活动奖励', 0, '+'],
            ['人工调整', item.adj, item.adj>=0?'+':'-'],
            ['风控扣除', -item.risk, '-'],
            ['平台税费', -item.tax, '-'],
          ].map((r,i) => (
            <tr key={i}>
              <td style={{padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>{r[0]}</td>
              <td className="right text-mono" style={{padding:'8px 0',borderBottom:'1px solid var(--line-soft)',color: r[1]>=0?'#6ee7a8':'#fca5a5'}}>{r[1]>=0?'+':''}${F.fmtNum(r[1])}</td>
            </tr>
          ))}
          <tr>
            <td style={{padding:'10px 0',fontWeight:600,fontSize:13}}>最终结算金额</td>
            <td className="right text-mono" style={{padding:'10px 0',color:'var(--text-0)',fontWeight:600,fontSize:14}}>${F.fmtNum(item.total)}</td>
          </tr>
        </tbody>
      </table>

      <div className="form-section-title mt-4">审核流程</div>
      <div style={{position:'relative',paddingLeft:20}}>
        {[
          {l:'系统生成',d:new Date(item.generated).toLocaleString('zh-CN'),s:'done'},
          {l:'风控审核',d:'已通过 · risk_team',s:'done'},
          {l:'财务审核',d:item.status==='pending_audit'?'待处理':'已通过 · finance.amy',s:item.status==='pending_audit'?'wait':'done'},
          {l:'商户确认',d:item.status==='paid'?'已确认':'未开始',s:item.status==='paid'?'done':'todo'},
          {l:'付款',d:item.status==='paid'?'已完成':'未开始',s:item.status==='paid'?'done':'todo'},
        ].map((s,i,a) => (
          <div key={i} style={{display:'flex',gap:14,paddingBottom:14,position:'relative'}}>
            <div style={{position:'absolute',left:-13,top:2,width:14,height:14,borderRadius:'50%',
              background: s.s==='done'?'var(--success)':s.s==='wait'?'var(--warning)':'var(--bg-3)',
              border:'2px solid var(--bg-1)', zIndex:1}}/>
            {i < a.length-1 && <div style={{position:'absolute',left:-7,top:12,width:1,height:'100%',background:'var(--line)'}}/>}
            <div>
              <div style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500}}>{s.l}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.SettlementModule = SettlementModule;
