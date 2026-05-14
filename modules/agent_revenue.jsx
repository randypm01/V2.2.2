// 报表 → 代理收益 v2.4.49
// 商户视角:每个代理一行,按当前筛选条件展示收益汇总
const ARUI = window.UI;

function AgentRevenueModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const [q, setQ] = React.useState('');
  const [tier, setTier] = React.useState('all');
  const [range, setRange] = React.useState('30d');
  const [sort, setSort] = React.useState({ k: 'total', dir: 'desc' });
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  // —— 为每个代理构造收益维度(从 agents 数据派生,假设拆分 CPA / 分润) ——
  const rows = React.useMemo(() => {
    const list = (window.APS_MERCHANT_AGENTS_STORE
      ? window.APS_MERCHANT_AGENTS_STORE.list
      : D.agents).filter(a => a.status !== 'pending' || a.commission);
    return list.map(a => {
      const total = a.commission || 0;
      // 简单 6/4 拆 CPA / 分润,小数固定避免抖动
      const seed = (a.id || '').slice(-3);
      const ratio = 0.4 + ((parseInt(seed, 10) || 0) % 30) / 100;  // 0.40 ~ 0.69
      const cpaRev = Math.round(total * ratio);
      const revShare = total - cpaRev;
      const pending = a.pendingCommission || 0;
      return {
        id: a._displayId || a.id,
        name: a.name,
        tier: a.tier,
        aType: a._aType || (a.tier === 'normal' ? '个人代理' : a.tier === 'general' ? '团队代理' : '总代理'),
        players: a.players || 0,
        ngr: a.ngr || 0,
        cpaRev,
        revShare,
        pending,
        total,
      };
    });
  }, [D.agents]);

  const filtered = rows
    .filter(r => tier === 'all' || r.tier === tier)
    .filter(r => !q || r.id.toLowerCase().includes(q.toLowerCase()) || r.name.toLowerCase().includes(q.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k], bv = b[sort.k];
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalAll = sorted.reduce((s, r) => s + r.total, 0);
  const ngrAll = sorted.reduce((s, r) => s + r.ngr, 0);
  const pendingAll = sorted.reduce((s, r) => s + r.pending, 0);
  const activeCount = sorted.filter(r => r.total > 0).length;

  const setSortKey = (k) => {
    setSort(s => s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'desc' });
    setPage(1);
  };

  const Th = ({ k, children, right }) => (
    <th className={right ? 'right' : ''} style={{cursor:'pointer',userSelect:'none'}} onClick={()=>setSortKey(k)}>
      <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
        {children}
        <span style={{fontSize:9,color: sort.k===k?'var(--brand)':'var(--text-3)',lineHeight:1}}>
          {sort.k === k ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </span>
    </th>
  );

  return (
    <div className="page">
      <ARUI.PageHead title="代理收益" subtitle="按代理维度查看 CPA / 分润 / 总收益,支持时间范围与代理类型筛选">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </ARUI.PageHead>

      {/* —— KPI —— */}
      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          { l: '总收益(代理佣金)', v: '$' + F.fmtNum(totalAll), d: '+18.2%', dir: 'up' },
          { l: '总 NGR(本期玩家)', v: '$' + F.fmtNum(ngrAll), d: '+12.4%', dir: 'up' },
          { l: '本期未结算', v: '$' + F.fmtNum(pendingAll), d: pendingAll > 0 ? '待结算' : '—', dir: 'flat' },
          { l: '活跃代理', v: activeCount + ' / ' + sorted.length, d: ((activeCount/Math.max(1,sorted.length))*100).toFixed(0) + '%', dir: 'flat' },
        ].map(k => (
          <div key={k.l} className="kpi">
            <div className="label">{k.l}</div>
            <div className="val">{k.v}</div>
            <div className={'delta ' + k.dir}>{k.d}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>代理收益明细</h3>
        </div>

        {/* —— 工具栏 —— */}
        <div className="toolbar">
          <ARUI.SearchInput value={q} onChange={(v)=>{setQ(v);setPage(1);}} placeholder="代理ID / 名称" width={260}/>
          <select className="filter-select" value={tier} onChange={e=>{setTier(e.target.value);setPage(1);}}>
            <option value="all">全部代理类型</option>
            <option value="normal">个人代理</option>
            <option value="general">团队代理</option>
            <option value="super">总代理</option>
          </select>
          <ARUI.DateRange value={range} onChange={setRange}/>
          <span style={{flex:1}}/>
          <span style={{fontSize:12,color:'var(--text-3)'}}>共 <b style={{color:'var(--text-0)'}}>{sorted.length}</b> 个代理</span>
        </div>

        {/* —— 表格 —— */}
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <Th k="id">代理ID</Th>
                <Th k="name">代理名称</Th>
                <th>类型</th>
                <Th k="players" right>玩家数</Th>
                <Th k="ngr" right>NGR</Th>
                <Th k="cpaRev" right>單付費分潤</Th>
                <Th k="revShare" right>收益分潤</Th>
                <Th k="pending" right>本期未結算</Th>
                <Th k="total" right>總收益</Th>
                <th style={{width:60}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id}>
                  <td className="id">{r.id}</td>
                  <td style={{color:'var(--text-0)',fontWeight:500}}>{r.name}</td>
                  <td>
                    <span style={{
                      padding:'2px 8px',borderRadius:10,fontSize:10.5,fontWeight:500,
                      background: r.tier==='normal' ? '#dbeafe' : r.tier==='general' ? '#fef3c7' : '#fce7f3',
                      color:      r.tier==='normal' ? '#1e40af' : r.tier==='general' ? '#92400e' : '#9d174d',
                    }}>{r.aType}</span>
                  </td>
                  <td className="right">{F.fmtNum(r.players)}</td>
                  <td className="right">${F.fmtNum(r.ngr)}</td>
                  <td className="right">${F.fmtNum(r.cpaRev)}</td>
                  <td className="right">${F.fmtNum(r.revShare)}</td>
                  <td className="right" style={{color: r.pending > 0 ? 'var(--brand)' : 'var(--text-3)'}}>
                    {r.pending > 0 ? '$' + F.fmtNum(r.pending) : '—'}
                  </td>
                  <td className="right" style={{color:'var(--text-0)',fontWeight:600,fontSize:13}}>
                    ${F.fmtNum(r.total)}
                  </td>
                  <td>
                    <button className="btn sm ghost icon-only" title="查看明细"><Icon name="eye" size={13}/></button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={10} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>无匹配数据</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <ARUI.Pagination page={page} pageSize={pageSize} total={sorted.length} onPage={setPage}/>
      </div>
    </div>
  );
}

window.AgentRevenueModule = AgentRevenueModule;
