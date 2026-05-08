// 玩家管理
const PUI = window.UI;

function PlayersModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const [players] = React.useState(D.players);
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);

  const filtered = React.useMemo(() => players.filter(p => {
    if (tab === 'ftd' && !p.ftd) return false;
    if (tab === 'cpa' && p.cpaStatus !== 'approved') return false;
    if (tab === 'risk' && p.risk === 'none') return false;
    if (tab === 'frozen' && p.status !== 'frozen') return false;
    if (q && !p.id.toLowerCase().includes(q.toLowerCase()) && !p.agentId.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [players, tab, q]);
  const pageSize = 14;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const counts = {
    all: players.length,
    ftd: players.filter(p=>p.ftd).length,
    cpa: players.filter(p=>p.cpaStatus==='approved').length,
    risk: players.filter(p=>p.risk!=='none').length,
    frozen: players.filter(p=>p.status==='frozen').length,
  };

  return (
    <div className="page">
      <PUI.PageHead title="代理玩家管理" subtitle="管理所有代理推广而来的玩家与质量分析">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </PUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          ['玩家总数', F.fmtNum(players.length)],
          ['首存玩家', F.fmtNum(counts.ftd)],
          ['有效CPA玩家', F.fmtNum(counts.cpa)],
          ['VIP玩家', F.fmtNum(players.filter(p=>p.vip>=4).length)],
          ['风控玩家', F.fmtNum(counts.risk)],
          ['总投注金额', '$'+F.money(players.reduce((a,p)=>a+p.wager,0))],
        ].map(([l,v]) => (
          <div key={l} className="kpi"><div className="label">{l}</div><div className="val">{v}</div></div>
        ))}
      </div>

      <div className="card">
        <PUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'all',label:'全部玩家',count:counts.all},
          {key:'ftd',label:'已首存',count:counts.ftd},
          {key:'cpa',label:'有效CPA',count:counts.cpa},
          {key:'risk',label:'风控中',count:counts.risk},
          {key:'frozen',label:'已冻结',count:counts.frozen},
        ]}/>
        <div className="toolbar">
          <PUI.SearchInput value={q} onChange={setQ} placeholder="玩家ID / 代理ID"/>
          <select className="filter-select"><option>全部VIP等级</option>{[0,1,2,3,4,5,6,7].map(v=><option key={v}>VIP {v}</option>)}</select>
          <select className="filter-select"><option>全部国家</option>{D.COUNTRIES.map(c=><option key={c}>{c}</option>)}</select>
          <select className="filter-select"><option>CPA状态</option><option>已通过</option><option>待审核</option><option>已拒绝</option></select>
          <PUI.DateRange value="30d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
          <button className="btn sm ghost icon-only"><Icon name="settings" size={14}/></button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>玩家</th><th>所属代理</th><th>Code</th><th>VIP</th>
              <th className="right">充值</th><th className="right">提款</th>
              <th className="right">投注</th><th className="right">NGR</th>
              <th>CPA</th><th>风控</th><th>状态</th><th>注册</th><th>首存</th>
            </tr></thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} onClick={()=>setDetail(p)} style={{cursor:'pointer'}}>
                  <td><span className="id" style={{color:'var(--text-0)'}}>{p.id}</span> <span className="text-mute" style={{fontSize:10}}>{p.country}</span></td>
                  <td className="id">{p.agentId}</td>
                  <td className="id text-mute">{p.codeId}</td>
                  <td><span className="badge b-purple">VIP {p.vip}</span></td>
                  <td className="right">${F.money(p.deposit)}</td>
                  <td className="right num-down">${F.money(p.withdraw)}</td>
                  <td className="right">${F.money(p.wager)}</td>
                  <td className="right" style={{color: p.ngr>0?'#6ee7a8':'#fca5a5'}}>${F.money(p.ngr)}</td>
                  <td><PUI.StatusBadge status={p.cpaStatus}/></td>
                  <td>{p.risk === 'none' ? <span className="text-mute">—</span> : <PUI.RiskBadge level={p.risk==='flagged'?'medium':'high'}/>}</td>
                  <td><PUI.StatusBadge status={p.status}/></td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(p.registered).toLocaleDateString('zh-CN')}</td>
                  <td className="text-mute" style={{fontSize:11}}>{p.ftd ? new Date(p.ftd).toLocaleDateString('zh-CN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>

      <PUI.Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?.id} subtitle={'所属代理 ' + detail?.agentId}>
        {detail && (
          <div style={{padding:20}}>
            <div className="form-section-title" style={{marginTop:0}}>玩家资料</div>
            <dl className="dl">
              <dt>玩家ID</dt><dd className="text-mono">{detail.id}</dd>
              <dt>所属代理</dt><dd className="text-mono">{detail.agentId}</dd>
              <dt>Code来源</dt><dd className="text-mono">{detail.codeId}</dd>
              <dt>国家</dt><dd>{detail.country}</dd>
              <dt>VIP</dt><dd>VIP {detail.vip}</dd>
              <dt>注册时间</dt><dd>{new Date(detail.registered).toLocaleString('zh-CN')}</dd>
              <dt>首存时间</dt><dd>{detail.ftd ? new Date(detail.ftd).toLocaleString('zh-CN') : '未首存'}</dd>
              <dt>首存金额</dt><dd>${F.money(detail.ftdAmount)}</dd>
              <dt>累计充值</dt><dd>${F.money(detail.deposit)}</dd>
              <dt>累计投注</dt><dd>${F.money(detail.wager)}</dd>
              <dt>累计NGR</dt><dd>${F.money(detail.ngr)}</dd>
              <dt>CPA状态</dt><dd><PUI.StatusBadge status={detail.cpaStatus}/></dd>
              <dt>是否计入分润</dt><dd>{detail.risk === 'none' ? '是' : '否（风控中）'}</dd>
            </dl>
          </div>
        )}
      </PUI.Drawer>
    </div>
  );
}

window.PlayersModule = PlayersModule;
