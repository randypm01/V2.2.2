// 商户后台 → 报表 → 代理玩家损益  v3.1.28
// 按截图重做：
//   - 标题/副标题：代理玩家损益 · 查看代理邀请的玩家收益
//   - KPI 11 张：玩家总数 / 总首存人数 / 总首存金额 / 总充值金额 / 累计提款金额 / 充提差 / 总玩家余额 / 总投注 / 总派彩 / GGR / 总佣金
//   - 工具栏：搜索（代理ID/代理名称/邀请Code/玩家UID）+ TimeRange + 近 7/14/30 日
//   - 表格 13 列：
//     代理ID / 代理名称 / 邀请Code / Code 创建时间 / 玩家UID /
//     首次存款金额 / 充值金额 / 提款金额 / 充提差 / 玩家余额 / 投注 / 派彩 / GGR
//   - 数据维度从「玩家」扁平改为「代理 × Code × 玩家」(每个 Code 1 名示例玩家)
const PUI = window.UI;

// —— 稳定哈希 + 种子函数（与 codes.jsx 同款）
function _PL_hashSeed(str) {
  return String(str || 'x').split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
}
function _PL_seedFn(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297) * 10000;
  return x - Math.floor(x);
}
function _PL_seedInt(seed, offset, lo, hi) {
  return Math.floor(lo + _PL_seedFn(seed, offset) * (hi - lo + 1));
}

// —— 全局 Code 池（与 codes.jsx 保持一致 / 不冲突）
const PL_GLOBAL_POOL = [
  'RANDY01', 'RANDY02',
  'JACK01', 'JACK02',
  'LISA01', 'KEVIN01',
];

// —— Code 创建日期（近 1~90 天内稳定派生）
function _PL_codeCreatedAt(seed) {
  const daysAgo = _PL_seedInt(seed, 7, 1, 90);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(_PL_seedInt(seed, 8, 0, 23), _PL_seedInt(seed, 9, 0, 59), 0, 0);
  return d;
}

// —— 玩家 UID（基于 (agent + code) 稳定生成）
function _PL_uidFor(seed) {
  return 'P' + String(12354000 + _PL_seedInt(seed, 11, 100, 999));
}

// —— 玩家注册时间（近 1~180 天内稳定派生，晚于 Code 创建时间）
function _PL_registeredAt(seed) {
  const daysAgo = _PL_seedInt(seed, 12, 1, 60);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(_PL_seedInt(seed, 13, 0, 23), _PL_seedInt(seed, 14, 0, 59), _PL_seedInt(seed, 15, 0, 59), 0);
  return d;
}

// —— 单行损益数据
function _PL_statsFor(seed) {
  const dep    = _PL_seedInt(seed, 21, 800, 28000);
  const ftd    = _PL_seedInt(seed, 22, 100, Math.min(2500, dep));
  const wd     = Math.round(dep * (0.28 + _PL_seedFn(seed, 23) * 0.62));
  const wager  = _PL_seedInt(seed, 24, dep * 3, dep * 9);
  const payout = Math.round(wager * (0.86 + _PL_seedFn(seed, 25) * 0.10));
  const ggr    = wager - payout;
  const gap    = dep - wd;
  return { dep, ftd, wd, wager, payout, ggr, gap };
}

function PlayersModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;

  const [q, setQ] = React.useState('');
  const [timeRange, setTimeRange] = React.useState(() => {
    const end = new Date(); end.setHours(23, 59, 59, 0);
    const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0, 0, 0, 0);
    return { preset: '7d', start, end };
  });
  const [sort, setSort] = React.useState({ k: 'gap', dir: 'desc' });
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  // —— 取代理（与 codes.jsx 同源），前 2 个代理 × 2 个 Code = 约 4 行（贴近截图）
  const agentSource = (window.APS_MERCHANT_AGENTS_STORE
    ? window.APS_MERCHANT_AGENTS_STORE.list
    : D.agents) || [];
  const rawList = agentSource.slice(0, 2);

  // —— 扁平化为 (代理 × Code × 玩家) 行
  const rows = React.useMemo(() => {
    const out = [];
    let poolIdx = 0;
    rawList.forEach(a => {
      const aSeed = _PL_hashSeed(a._displayId || a.id);
      const codeCount = 2; // 每个代理固定 2 个 Code（贴近截图）
      for (let i = 0; i < codeCount; i++) {
        if (poolIdx >= PL_GLOBAL_POOL.length) break;
        const code = PL_GLOBAL_POOL[poolIdx++];
        const seed = _PL_hashSeed((a._displayId || a.id) + ':' + code);
        const stats = _PL_statsFor(seed);
        const commission = Math.round(stats.ggr * 0.30);
        out.push({
          key: (a._displayId || a.id) + '_' + code,
          agentId: a._displayId || a.id,
          agentName: a.name,
          code,
          codeCreated: _PL_codeCreatedAt(seed),
          uid: _PL_uidFor(seed),
          registered: _PL_registeredAt(seed),
          ...stats,
        });
      }
    });
    return out;
  }, [agentSource]);

  // —— 搜索 + 排序
  const filtered = rows.filter(r => {
    if (!q) return true;
    const t = q.toLowerCase();
    return r.agentId.toLowerCase().includes(t)
      || (r.agentName || '').toLowerCase().includes(t)
      || r.code.toLowerCase().includes(t)
      || r.uid.toLowerCase().includes(t);
  });
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k] ?? 0, bv = b[sort.k] ?? 0;
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // —— KPI 合计（基于当前筛选）
  const sum = (k) => sorted.reduce((s, r) => s + (r[k] || 0), 0);
  const totalPlayers = sorted.length; // 每行 = 1 个玩家
  const totalFtdUsers = sorted.filter(r => r.ftd > 0).length;
  const totalFtdAmt   = sum('ftd');
  const totalDep      = sum('dep');
  const totalWd       = sum('wd');
  const totalGap      = totalDep - totalWd;
  const totalWager    = sum('wager');
  const totalPayout   = sum('payout');
  const totalGgr      = sum('ggr');

  const money = (n) => '₹' + F.fmtNum(n || 0);
  const moneyDec = (n) => '₹' + F.money(n || 0);
  const fmtGap = (n) => (n >= 0 ? '+' : '-') + '₹' + F.fmtNum(Math.abs(n || 0));

  // —— 排序工具
  const setSortKey = (k) => {
    setSort(s => s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'desc' });
    setPage(1);
  };
  const Th = ({ k, children, right }) => (
    <th className={right ? 'right' : ''}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setSortKey(k)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        <span style={{ fontSize: 9, color: sort.k === k ? 'var(--brand)' : 'var(--text-3)', lineHeight: 1 }}>
          {sort.k === k ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </span>
    </th>
  );

  const fmtDate = (raw) => {
    if (!raw) return '—';
    const d = raw instanceof Date ? raw : new Date(raw);
    if (isNaN(d.getTime())) return String(raw).slice(0, 10).replace(/-/g, '/');
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };

  return (
    <div className="page">
      <PUI.PageHead title="代理玩家损益" subtitle="查看代理邀请的玩家收益">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </PUI.PageHead>

      {/* KPI 9 张：5 列网格，5+4 自动换行 */}
      <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {[
          { l: '玩家总数',    v: F.fmtNum(totalPlayers) },
          { l: '总首存人数',  v: F.fmtNum(totalFtdUsers) },
          { l: '总首存金额',  v: money(totalFtdAmt) },
          { l: '总充值金额',  v: money(totalDep) },
          { l: '累计提款金额', v: money(totalWd) },
          { l: '充提差',      v: fmtGap(totalGap),
            valColor: totalGap >= 0 ? 'var(--success)' : 'var(--danger)',
            highlight: true },
          { l: '总投注',      v: money(totalWager) },
          { l: '总派彩',      v: money(totalPayout) },
          { l: 'GGR',         v: money(totalGgr),
            valColor: totalGgr >= 0 ? 'var(--success)' : 'var(--danger)' },
        ].map(k => (
          <div key={k.l} className="kpi" style={k.highlight ? {
            borderColor: totalGap >= 0 ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)',
            background: totalGap >= 0 ? 'rgba(34,197,94,.04)' : 'rgba(239,68,68,.04)',
          } : undefined}>
            <div className="label">{k.l}</div>
            <div className="val" style={k.valColor ? { color: k.valColor } : undefined}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <PUI.SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }}
            placeholder="代理ID / 代理名称 / 邀请Code / 玩家UID" width={280}/>
          {window.TimeRange ? (
            <window.TimeRange value={timeRange} onChange={(v) => { setTimeRange(v); setPage(1); }} />
          ) : (
            <PUI.DateRange value="7d" onChange={() => {}} />
          )}
          <span style={{ flex: 1 }}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <Th k="agentId">代理ID</Th>
                <Th k="agentName">代理名称</Th>
                <Th k="code">邀请Code</Th>
                <Th k="codeCreated">Code 创建时间</Th>
                <Th k="uid">玩家UID</Th>
                <Th k="registered">注册时间</Th>
                <Th k="ftd" right>首次存款金额</Th>
                <Th k="dep" right>充值金额</Th>
                <Th k="wd" right>提款金额</Th>
                <Th k="gap" right>充提差</Th>
                <Th k="wager" right>投注</Th>
                <Th k="payout" right>派彩</Th>
                <Th k="ggr" right>GGR</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.key}>
                  <td className="id" style={{ color: 'var(--text-0)' }}>{r.agentId}</td>
                  <td style={{ color: 'var(--text-0)', fontWeight: 500 }}>{r.agentName}</td>
                  <td>
                    <span className="text-mono" style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12 }}>{r.code}</span>
                  </td>
                  <td className="text-mono" style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{fmtDate(r.codeCreated)}</td>
                  <td className="text-mono" style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12 }}>{r.uid}</td>
                  <td className="text-mono" style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{fmtDate(r.registered)}</td>
                  <td className="right text-mono">{money(r.ftd)}</td>
                  <td className="right text-mono">{money(r.dep)}</td>
                  <td className="right text-mono">{money(r.wd)}</td>
                  <td className="right text-mono"
                      style={{ color: r.gap >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {fmtGap(r.gap)}
                  </td>
                  <td className="right text-mono">{moneyDec(r.wager)}</td>
                  <td className="right text-mono">{moneyDec(r.payout)}</td>
                  <td className="right text-mono"
                      style={{ color: r.ggr >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {moneyDec(r.ggr)}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>无匹配数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PUI.Pagination page={safePage} pageSize={pageSize} total={sorted.length} onPage={setPage}/>
      </div>
    </div>
  );
}

window.PlayersModule = PlayersModule;
