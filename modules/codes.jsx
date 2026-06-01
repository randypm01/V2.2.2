// 商户后台 → 报表 → 代理推广链接  v3.1.22
// 整页重做,匹配截图:
//   - 标题 / 副标题:代理推广链接 · 查看所有代理生成 code 链接的收益数据
//   - KPI 8 张(2 行 × 4):Code 总数量 / 总注册人数 / 总充值人数 / 总充值金额 /
//                         总提款人数 / 总提款金额 / 充值转化率 / 充提差
//   - 工具栏:搜索(代理ID/代理名称/邀请Code) + TimeRange(双月历)+ 近7/14/30日
//   - 表格 11 列(代理 × Code 维度):
//     代理ID / 代理名称 / 代理创建时间 / 邀请Code /
//     注册人数 / 充值人数 / 充值金额 / 提款人数 / 提款金额 /
//     充值转化率 / 充提差
//   - 货币 ₹,充提差 +绿 / -红,转化率阈值着色
const CDUI = window.UI;

// —— 稳定哈希(同 agent_revenue 一致风格)
function _hashSeed(str) {
  return String(str || 'x').split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
}
function _seedFn(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297) * 10000;
  return x - Math.floor(x);
}
function _seedInt(seed, offset, lo, hi) {
  return Math.floor(lo + _seedFn(seed, offset) * (hi - lo + 1));
}

// —— 全局 Code 池 — 保证各代理 Code 不重复(邀请 Code 是全局唯一的)
const CD_GLOBAL_POOL = [
  'RANDY01', 'RANDY02',
  'JACK01', 'JACK02',
  'LISA01',
  'KEVIN01',
  'TINA01', 'TINA02',
  'MIKE01',
  'EVA01',
];

// —— 从 STORE.list 按顺序取前 N 个代理(不过滤 ID 前缀,保证范例资料可见)
function _pickMixedAgents(list, n) {
  return (list || []).slice(0, n);
}

// —— 从稳定 seed 派生 Code 创建日期(近 1～90 天内)
function _codeCreatedAt(seed) {
  const daysAgo = _seedInt(seed, 7, 1, 90);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(_seedInt(seed, 8, 0, 23), _seedInt(seed, 9, 0, 59), 0, 0);
  return d;
}

// —— 给定 (代理, code) 派生 stats
function _statsForRow(agent, code) {
  const seed = _hashSeed((agent._displayId || agent.id) + ':' + code);
  const reg = _seedInt(seed, 1, 20, 1800);
  const cvr = 0.20 + _seedFn(seed, 2) * 0.40;
  const dep = Math.max(0, Math.round(reg * cvr));
  const wd = Math.round(dep * (0.28 + _seedFn(seed, 3) * 0.48));
  const arppu = _seedInt(seed, 4, 40, 480);
  const depAmt = dep * arppu;
  const wdAmt = Math.round(depAmt * (0.40 + _seedFn(seed, 5) * 0.95));
  return { reg, dep, wd, depAmt, wdAmt, cvr };
}

function CodesModule() {
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

  // —— 取 mixed AC + AG 前 3 个代理 × 1~2 个 Code,以全局 CD_GLOBAL_POOL 依序分配唯一 Code
  const rawList = _pickMixedAgents(
    (window.APS_MERCHANT_AGENTS_STORE
      ? window.APS_MERCHANT_AGENTS_STORE.list
      : D.agents) || [],
    3
  );

  const rows = React.useMemo(() => {
    const out = [];
    let poolIdx = 0;
    rawList.forEach(a => {
      const seed = _hashSeed(a._displayId || a.id);
      const n = _seedInt(seed, 0, 1, 2); // 1~2 个 Code
      for (let i = 0; i < n; i++) {
        if (poolIdx >= CD_GLOBAL_POOL.length) break;
        const code = CD_GLOBAL_POOL[poolIdx++];
        const s = _statsForRow(a, code);
        const gap = s.depAmt - s.wdAmt;
        const codeSeed = _hashSeed((a._displayId || a.id) + ':' + code);
        out.push({
          key: (a._displayId || a.id) + '_' + code,
          agentId: a._displayId || a.id,
          agentName: a.name,
          codeCreated: _codeCreatedAt(codeSeed),
          code,
          reg: s.reg, dep: s.dep, wd: s.wd,
          depAmt: s.depAmt, wdAmt: s.wdAmt,
          cvr: s.cvr, gap,
        });
      }
    });
    return out;
  }, [rawList]);

  // —— 搜索 + 排序
  const filtered = rows.filter(r => {
    if (!q) return true;
    const t = q.toLowerCase();
    return r.agentId.toLowerCase().includes(t)
      || (r.agentName || '').toLowerCase().includes(t)
      || r.code.toLowerCase().includes(t);
  });
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k] ?? 0, bv = b[sort.k] ?? 0;
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // —— KPI 8 张
  // 注:本报表以「代理 × Code」为主维度,上方总计 = 当前搜索(代理ID/代理名称/邀请Code)+ 筛选后结果总计,
  //     故对 sorted(已含 q 搜索)汇总 — 搜索时总计随之变化(与 revshare 报表相反)
  const sum = (k) => sorted.reduce((s, r) => s + (r[k] || 0), 0);
  const totalReg = sum('reg');
  const totalDep = sum('dep');
  const totalWd = sum('wd');
  const totalDepAmt = sum('depAmt');
  const totalWdAmt = sum('wdAmt');
  const totalGap = totalDepAmt - totalWdAmt;
  const totalCvr = totalReg ? totalDep / totalReg : 0;
  const codeCount = new Set(sorted.map(r => r.code)).size;

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
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };
  const moneyCell = (n) => '₹' + F.fmtNum(n || 0);

  return (
    <div className="page">
      <CDUI.PageHead title="代理推广链接" subtitle="查看所有代理生成 code 链接的收益数据">
        <CDUI.FormulaHelp
          title="代理推广链接 · 字段计算说明"
          subtitle="搜索范围与上方总计各字段口径"
          sections={[
            { heading: '搜索范围', desc: '本报表以「代理 × Code」为主维度,搜索时上方总计与下方列表同步,只统计命中的 Code 行。', items: [
              { name: '代理ID / 名称 / 邀请Code', note: '模糊匹配三者任一;命中后上方总计随之变化' },
            ] },
            { heading: '上方总计字段公式', desc: '以下各项均对「当前搜索命中的 Code 行」汇总。', items: [
              { name: 'Code 总数量', formula: '= 命中结果中不重复的邀请Code 数' },
              { name: '总注册人数', formula: '= Σ 各 Code 注册人数' },
              { name: '总充值人数', formula: '= Σ 各 Code 充值人数' },
              { name: '总充值金额', formula: '= Σ 各 Code 充值金额' },
              { name: '总提款人数', formula: '= Σ 各 Code 提款人数' },
              { name: '总提款金额', formula: '= Σ 各 Code 提款金额' },
              { name: '充值转化率', formula: '= 总充值人数 ÷ 总注册人数 × 100%' },
              { name: '充提差', formula: '= 总充值金额 − 总提款金额' },
            ] },
          ]} />
      </CDUI.PageHead>

      {/* —— KPI 8 张 · 2 行 × 4 —— */}
      <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { l: 'Code 总数量', v: F.fmtNum(codeCount) },
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
          <CDUI.SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="代理ID / 代理名称 / 邀请Code" width={260} />
          {window.TimeRange ? (
            <window.TimeRange value={timeRange} onChange={(v) => { setTimeRange(v); setPage(1); }} />
          ) : (
            <CDUI.DateRange value="7d" onChange={() => {}} />
          )}
          <span style={{ flex: 1 }} />
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <Th k="agentId">代理ID</Th>
                <Th k="agentName">代理名称</Th>
                <Th k="code">邀请Code</Th>
                <Th k="codeCreated">Code 创建时间</Th>
                <Th k="reg" right>注册人数</Th>
                <Th k="dep" right>充值人数</Th>
                <Th k="depAmt" right>充值金额</Th>
                <Th k="wd" right>提款人数</Th>
                <Th k="wdAmt" right>提款金额</Th>
                <Th k="cvr" right>充值转化率</Th>
                <Th k="gap" right>充提差</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => {
                const cvr100 = r.cvr * 100;
                const cvrColor = cvr100 >= 40 ? 'var(--success)' : cvr100 >= 28 ? 'var(--text-0)' : 'var(--text-2)';
                return (
                  <tr key={r.key}>
                    <td className="id" style={{ color: 'var(--text-0)' }}>{r.agentId}</td>
                    <td style={{ color: 'var(--text-0)', fontWeight: 500 }}>{r.agentName}</td>
                    <td>
                      <span className="text-mono" style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12 }}>{r.code}</span>
                    </td>
                    <td className="text-mono" style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{fmtDate(r.codeCreated)}</td>
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
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>无匹配数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <CDUI.Pagination page={safePage} pageSize={pageSize} total={sorted.length} onPage={setPage} />
      </div>
    </div>
  );
}

window.CodesModule = CodesModule;
