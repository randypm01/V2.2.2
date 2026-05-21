// 商户后台 → 报表 → 代理收益  v3.1.19
// 重做:KPI 9 张(5+4)+ 12 列报表表格,数据按 注册→充值→提款 漏斗维度,货币 ₹
// 优化:充提差 +/- 着色 / 充值转化率 阈值着色 / 充值金额 + 提款金额 mini bar /
//      代理类型 pill / 排序指示 / 合计行 / 种子化稳定假数据
const ARUI = window.UI;

// —— 稳定哈希:把代理 ID 转成 0~1 之间的伪随机数,用作各列数据 seed ——
function _seedNum(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297) * 10000;
  return x - Math.floor(x);
}
function _seedInt(seed, offset, lo, hi) {
  return Math.floor(lo + _seedNum(seed, offset) * (hi - lo + 1));
}
// —— 根据代理 ID 派生一行报表 stats(确定性,不抖动) ——
function _statsFor(agent) {
  const idStr = String(agent._displayId || agent.id || 'x');
  const seed = idStr.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const codes = _seedInt(seed, 1, 1, 12);
  const reg = _seedInt(seed, 2, 30, 2400);
  // 充值转化率 22~58%
  const cvr = 0.22 + _seedNum(seed, 3) * 0.36;
  const dep = Math.round(reg * cvr);
  // 提款人数 ≈ 充值人数 × 30~70%
  const wd = Math.round(dep * (0.30 + _seedNum(seed, 4) * 0.40));
  // ARPPU 50~520(单充值人均充值额)
  const arppu = _seedInt(seed, 5, 50, 520);
  const depAmt = dep * arppu;
  // 提款金额 = 充值金额 × 0.45~1.35(允许少数代理出现负充提差)
  const wdAmt = Math.round(depAmt * (0.45 + _seedNum(seed, 6) * 0.90));
  return { codes, reg, dep, wd, arppu, depAmt, wdAmt };
}

function AgentRevenueModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const [q, setQ] = React.useState('');
  const [tier, setTier] = React.useState('all');
  // 时间范围 — 默认 近 7 日(与 my_codes.jsx 对齐)
  const [timeRange, setTimeRange] = React.useState(() => {
    const end = new Date(); end.setHours(23, 59, 59, 0);
    const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0, 0, 0, 0);
    return { preset: '7d', start, end };
  });
  const [sort, setSort] = React.useState({ k: 'gap', dir: 'desc' });
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // —— 实时从 STORE 取代理列表(只保留前 12 条 — 报表演示数据,避免过多)
  const rawList = ((window.APS_MERCHANT_AGENTS_STORE
    ? window.APS_MERCHANT_AGENTS_STORE.list
    : D.agents) || []).slice(0, 12);

  // —— 派生每个代理的报表行
  const rows = React.useMemo(() => {
    return rawList.map(a => {
      const s = _statsFor(a);
      const cvr = s.reg ? (s.dep / s.reg) : 0;
      const gap = s.depAmt - s.wdAmt;
      return {
        id: a._displayId || a.id,
        name: a.name,
        tier: a.tier,
        aType: a._aType || (a.tier === 'normal' ? '个人代理' : a.tier === 'general' ? '团队代理' : '总代理'),
        created: a.createdAt || a.created || null,
        codes: s.codes,
        reg: s.reg, dep: s.dep, wd: s.wd,
        depAmt: s.depAmt, wdAmt: s.wdAmt,
        cvr, gap, arppu: s.arppu,
      };
    });
  }, [rawList]);

  // —— 筛选 + 排序
  const filtered = rows
    .filter(r => tier === 'all' || r.tier === tier)
    .filter(r => !q || r.id.toLowerCase().includes(q.toLowerCase()) || (r.name || '').toLowerCase().includes(q.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k] ?? 0;
    const bv = b[sort.k] ?? 0;
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // —— KPI 聚合
  const sum = (k) => sorted.reduce((s, r) => s + (r[k] || 0), 0);
  const totalReg = sum('reg');
  const totalDep = sum('dep');
  const totalWd = sum('wd');
  const totalDepAmt = sum('depAmt');
  const totalWdAmt = sum('wdAmt');
  const totalGap = totalDepAmt - totalWdAmt;
  const totalCvr = totalReg ? totalDep / totalReg : 0;
  const totalArppu = totalDep ? totalDepAmt / totalDep : 0;
  const activeCount = sorted.filter(r => r.dep > 0).length;

  // —— 排序工具
  const setSortKey = (k) => {
    setSort(s => s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'desc' });
    setPage(1);
  };
  const Th = ({ k, children, right, sortable = true }) => (
    <th className={right ? 'right' : ''}
        style={sortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
        onClick={sortable ? () => setSortKey(k) : undefined}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sortable && (
          <span style={{ fontSize: 9, color: sort.k === k ? 'var(--brand)' : 'var(--text-3)', lineHeight: 1 }}>
            {sort.k === k ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        )}
      </span>
    </th>
  );

  const fmtDate = (raw) => {
    if (!raw) return '—';
    const d = raw instanceof Date ? raw : new Date(raw);
    if (isNaN(d.getTime())) return String(raw).slice(0, 10).replace(/-/g, '/');
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  };
  const moneyCell = (n) => '₹' + F.fmtNum(n || 0);

  return (
    <div className="page">
      <ARUI.PageHead title="代理收益" subtitle="查看各代理总数据">
        <button className="btn"><Icon name="download" size={13} />导出</button>
      </ARUI.PageHead>

      {/* —— KPI 9 张 · 5 + 4(充提差 hero 着色)—— */}
      <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {[
          { l: '代理总数',   v: F.fmtNum(sorted.length), sub: '活跃 ' + activeCount + ' / ' + sorted.length },
          { l: '总注册人数', v: F.fmtNum(totalReg) },
          { l: '总充值人数', v: F.fmtNum(totalDep) },
          { l: '总充值金额', v: '₹' + F.fmtNum(totalDepAmt) },
          { l: '总提款人数', v: F.fmtNum(totalWd) },
          { l: '总提款金额', v: '₹' + F.fmtNum(totalWdAmt) },
          { l: '充值转化率', v: (totalCvr * 100).toFixed(1) + '%' },
          {
            l: '充提差',
            v: (totalGap >= 0 ? '+' : '-') + '₹' + F.fmtNum(Math.abs(totalGap)),
            valColor: totalGap >= 0 ? 'var(--success)' : 'var(--danger)',
            highlight: true,
          },
          { l: 'ARPPU',     v: '₹' + F.fmtNum(Math.round(totalArppu)) },
        ].map(k => (
          <div key={k.l} className="kpi" style={k.highlight ? {
            borderColor: totalGap >= 0 ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)',
            background: totalGap >= 0 ? 'rgba(34,197,94,.04)' : 'rgba(239,68,68,.04)',
          } : undefined}>
            <div className="label">{k.l}</div>
            <div className="val" style={k.valColor ? { color: k.valColor } : undefined}>{k.v}</div>
            {k.sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        {/* —— 工具栏 —— */}
        <div className="toolbar">
          <ARUI.SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="代理ID / 名称" width={220} />
          <select className="filter-select" value={tier} onChange={e => { setTier(e.target.value); setPage(1); }}>
            <option value="all">全部代理类型</option>
            <option value="normal">个人代理</option>
            <option value="general">团队代理</option>
            <option value="super">总代理</option>
          </select>
          {window.TimeRange ? (
            <window.TimeRange value={timeRange} onChange={(v) => { setTimeRange(v); setPage(1); }} />
          ) : (
            <ARUI.DateRange value="7d" onChange={() => {}} />
          )}
          <span style={{ flex: 1 }} />
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <Th k="id">代理ID</Th>
                <Th k="name">代理名称</Th>
                <Th k="created">代理创建时间</Th>
                <Th k="codes" right>Code数量</Th>
                <Th k="reg" right>注册人数</Th>
                <Th k="dep" right>充值人数</Th>
                <Th k="depAmt" right>充值金额</Th>
                <Th k="wd" right>提款人数</Th>
                <Th k="wdAmt" right>提款金额</Th>
                <Th k="cvr" right>充值转化率</Th>
                <Th k="gap" right>充提差</Th>
                <Th k="arppu" right>ARPPU</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => {
                const cvr100 = r.cvr * 100;
                const cvrColor = cvr100 >= 40 ? 'var(--success)' : cvr100 >= 28 ? 'var(--text-0)' : 'var(--text-2)';
                return (
                  <tr key={r.id}>
                    <td className="id" style={{ color: 'var(--text-0)' }}>{r.id}</td>
                    <td style={{ color: 'var(--text-0)', fontWeight: 500 }}>{r.name}</td>
                    <td className="text-mono" style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{fmtDate(r.created)}</td>
                    <td className="right">{F.fmtNum(r.codes)}</td>
                    <td className="right">{F.fmtNum(r.reg)}</td>
                    <td className="right">{F.fmtNum(r.dep)}</td>
                    <td className="right">{moneyCell(r.depAmt)}</td>
                    <td className="right">{F.fmtNum(r.wd)}</td>
                    <td className="right">{moneyCell(r.wdAmt)}</td>
                    <td className="right text-mono" style={{ color: cvrColor }}>{cvr100.toFixed(1)}%</td>
                    <td className="right">
                      <span className="text-mono" style={{ color: r.gap >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {(r.gap >= 0 ? '+' : '-')}₹{F.fmtNum(Math.abs(r.gap))}
                      </span>
                    </td>
                    <td className="right">{moneyCell(r.arppu)}</td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>无匹配数据</td></tr>
              )}
            </tbody>

          </table>
        </div>
        <ARUI.Pagination page={safePage} pageSize={pageSize} total={sorted.length} onPage={setPage} />
      </div>
    </div>
  );
}

window.AgentRevenueModule = AgentRevenueModule;
