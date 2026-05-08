// 代理后台 - 我的玩家 P0-4
const APUI = window.UI;

function MyPlayersModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);

  const my = D.players.filter(p => p.agentId === me.id);

  const filtered = React.useMemo(() => my.filter(p => {
    if (tab === 'ftd' && !p.ftd) return false;
    if (tab === 'cpa' && p.cpaStatus !== 'approved') return false;
    if (tab === 'risk' && p.risk === 'none') return false;
    if (tab === 'vip' && p.vip < 4) return false;
    if (q && !p.id.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [my, tab, q]);
  const pageSize = 14;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const counts = {
    all: my.length,
    ftd: my.filter(p=>p.ftd).length,
    cpa: my.filter(p=>p.cpaStatus==='approved').length,
    vip: my.filter(p=>p.vip>=4).length,
    risk: my.filter(p=>p.risk!=='none').length,
  };

  const totalDeposit = my.reduce((a,p)=>a+p.deposit,0);
  const totalNgr = my.reduce((a,p)=>a+p.ngr,0);

  return (
    <div className="page">
      <APUI.PageHead title="我的玩家" subtitle="我推广而来的玩家清单与质量分析">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </APUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          ['玩家总数', F.fmtNum(my.length)],
          ['首存玩家', F.fmtNum(counts.ftd)],
          ['有效 CPA', F.fmtNum(counts.cpa)],
          ['VIP 玩家', F.fmtNum(counts.vip)],
          ['累计充值', '$' + F.money(totalDeposit)],
          ['累计 NGR', '$' + F.money(totalNgr)],
        ].map(([l,v]) => (
          <div key={l} className="kpi"><div className="label">{l}</div><div className="val">{v}</div></div>
        ))}
      </div>

      <div className="card">
        <APUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'all', label:'全部', count: counts.all},
          {key:'ftd', label:'已首存', count: counts.ftd},
          {key:'cpa', label:'有效 CPA', count: counts.cpa},
          {key:'vip', label:'VIP 玩家', count: counts.vip},
          {key:'risk', label:'风控中', count: counts.risk},
        ]}/>
        <div className="toolbar">
          <APUI.SearchInput value={q} onChange={setQ} placeholder="玩家 ID" width={200}/>
          <select className="filter-select"><option>全部 Code</option>{D.codes.filter(c=>c.agent===me.id).map(c=><option key={c.id}>{c.code}</option>)}</select>
          <select className="filter-select"><option>全部 VIP</option>{[0,1,2,3,4,5,6,7].map(v=><option key={v}>VIP {v}</option>)}</select>
          <APUI.DateRange value="30d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>玩家</th><th>Code</th><th>VIP</th>
              <th className="right">充值</th><th className="right">提款</th>
              <th className="right">投注</th><th className="right">NGR</th>
              <th>CPA</th><th>风控</th><th>注册</th><th>首存</th>
            </tr></thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} onClick={()=>setDetail(p)} style={{cursor:'pointer'}}>
                  <td>
                    <span className="id" style={{color:'var(--text-0)'}}>{p.id}</span>
                    <span className="text-mute" style={{fontSize:10,marginLeft:6}}>{D.LABELS.countries[p.country]||p.country}</span>
                  </td>
                  <td className="text-mono" style={{fontSize:11}}>{p.code}</td>
                  <td>{p.vip > 0 ? <span className="badge b-warning">VIP {p.vip}</span> : <span className="text-mute" style={{fontSize:11}}>-</span>}</td>
                  <td className="right text-mono">${F.money(p.deposit)}</td>
                  <td className="right text-mono">${F.money(p.withdraw)}</td>
                  <td className="right text-mono">${F.money(p.wager)}</td>
                  <td className="right text-mono" style={{color: p.ngr<0?'var(--danger)':'var(--text-0)'}}>${F.money(p.ngr)}</td>
                  <td>
                    {p.cpaStatus === 'approved' && <span className="badge b-success"><span className="dot"/>已通过</span>}
                    {p.cpaStatus === 'pending' && <span className="badge b-warning"><span className="dot"/>待审</span>}
                    {p.cpaStatus === 'rejected' && <span className="badge b-danger"><span className="dot"/>已拒</span>}
                    {p.cpaStatus === 'none' && <span className="text-mute" style={{fontSize:11}}>-</span>}
                  </td>
                  <td>
                    {p.risk === 'high' && <span className="badge b-danger">高风险</span>}
                    {p.risk === 'medium' && <span className="badge b-warning">中风险</span>}
                    {p.risk === 'low' && <span className="badge b-neutral">低</span>}
                    {p.risk === 'none' && <span className="text-mute" style={{fontSize:11}}>-</span>}
                  </td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(p.regAt).toLocaleDateString('zh-CN')}</td>
                  <td className="text-mute" style={{fontSize:11}}>{p.ftd ? new Date(p.ftdAt).toLocaleDateString('zh-CN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <APUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>

      <APUI.Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?'玩家详情 · '+detail.id:''} width={520}>
        {detail && (
          <div style={{padding:'18px 22px'}}>
            <div className="form-section-title" style={{marginTop:0}}>基本信息</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 16px',fontSize:12.5}}>
              <KV l="玩家 ID" v={detail.id}/>
              <KV l="国家 / 货币" v={(D.LABELS.countries[detail.country]||detail.country)+' / '+detail.currency}/>
              <KV l="推广 Code" v={detail.code}/>
              <KV l="VIP 等级" v={'VIP ' + detail.vip}/>
              <KV l="注册时间" v={new Date(detail.regAt).toLocaleString('zh-CN')}/>
              <KV l="首存时间" v={detail.ftd?new Date(detail.ftdAt).toLocaleString('zh-CN'):'未首存'}/>
            </div>

            <div className="form-section-title mt-3">财务概览</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              {[
                ['累计充值', '$' + F.money(detail.deposit)],
                ['累计提款', '$' + F.money(detail.withdraw)],
                ['累计投注', '$' + F.money(detail.wager)],
                ['NGR', '$' + F.money(detail.ngr)],
              ].map(([l,v]) => (
                <div key={l} style={{padding:10,background:'var(--bg-2)',borderRadius:6}}>
                  <div className="text-mute" style={{fontSize:11}}>{l}</div>
                  <div className="text-mono" style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>

            <div className="form-section-title mt-3">CPA / 风控</div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              {detail.cpaStatus === 'approved' && <span className="badge b-success">CPA 已通过 · $50</span>}
              {detail.cpaStatus === 'pending' && <span className="badge b-warning">CPA 审核中</span>}
              {detail.cpaStatus === 'rejected' && <span className="badge b-danger">CPA 已拒绝</span>}
              {detail.risk !== 'none' && <span className="badge b-warning">风控:{detail.risk}</span>}
            </div>
            <div className="text-mute" style={{fontSize:11.5}}>
              代理仅可见聚合数据,无法看到玩家敏感信息(姓名 / 手机 / 银行卡 / IP 等)
            </div>
          </div>
        )}
      </APUI.Drawer>
    </div>
  );
}

function KV({l,v}) {
  return <div><div className="text-mute" style={{fontSize:11}}>{l}</div><div style={{color:'var(--text-0)',marginTop:2}}>{v}</div></div>;
}

window.MyPlayersModule = MyPlayersModule;
