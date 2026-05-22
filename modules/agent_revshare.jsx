// 商户后台 → 报表 → 代理分润报表  v3.1.32
// 商户视角分润报表（多代理维度），与代理后台 my_revshare 对应
// 结构：
//   - 顶部 3 个 tab：本期预估分润 / 已结算分润 / 分润规则
//   - 预估期信息条：期號 W3 · 結算狀態 · 週期
//   - 已结算期：期号下拉（W2 / W1）切换
//   - KPI 10 张（5+5）：代理总数 / 玩家总数 / 总充值金额 / 总提款金额 / 充提差 /
//                       总投注 / 总派彩 / GGR / 预估佣金合计 / 结算佣金合计
//   - 表格 13/14 列（代理 × 玩家 维度）：
//       代理ID / 代理名称 / 邀请Code / 玩家UID /
//       充值金额 / 提款金额 / 充提差 / [当前余额|结算余额] /
//       投注 / 派彩 / GGR / [分润基数(仅已结算)] / 分润比例 / [预估佣金|结算佣金] /
//       用户状态
//   - 货币 ₹，盈利绿 / 亏损红
const ARV_UI = window.UI;

// —— 稳定哈希 + 种子函数（与 players.jsx 同款）
function _ARV_hashSeed(str) {
  return String(str || 'x').split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
}
function _ARV_seedFn(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297) * 10000;
  return x - Math.floor(x);
}
function _ARV_seedInt(seed, offset, lo, hi) {
  return Math.floor(lo + _ARV_seedFn(seed, offset) * (hi - lo + 1));
}

// —— 全局 Code 池（与 codes.jsx / players.jsx 对齐）
const ARV_CODE_POOL = ['RANDY01', 'RANDY02', 'JACK01', 'JACK02', 'LISA01', 'KEVIN01'];

// —— 期号规则：每周 W + YY + MM + 周序（如 W26051 = 2026 年 5 月第 1 周）;每月 M + YY + MM（如 M2605 = 2026 年 5 月）
const ARV_SETTLED_LIST_WEEKLY = [
  { key: 'W26054', label: 'W26054', start: '2026/5/25 00:00:00', end: '2026/5/31 23:59:59', seed: 2 },
  { key: 'W26053', label: 'W26053', start: '2026/5/18 00:00:00', end: '2026/5/24 23:59:59', seed: 1 },
];
const ARV_SETTLED_LIST_MONTHLY = [
  { key: 'M2605', label: 'M2605', start: '2026/5/1 00:00:00', end: '2026/5/31 23:59:59', seed: 5 },
  { key: 'M2604', label: 'M2604', start: '2026/4/1 00:00:00', end: '2026/4/30 23:59:59', seed: 4 },
];
// —— 预估期信息条 by 结算周期
const ARV_ESTIMATE_INFO = {
  weekly:  { week: 'W26061', period: '2026/6/1 00:00:00 - 2026/6/7 23:59:59',  seed: 3 },
  monthly: { week: 'M2606',  period: '2026/6/1 00:00:00 - 2026/6/30 23:59:59', seed: 6 },
};

// —— 单玩家分润行（与 my_revshare 计算口径对齐）
function _ARV_makeRow(agent, code, periodSeed, idxInPool) {
  const seed = _ARV_hashSeed((agent._displayId || agent.id) + ':' + code + ':P' + periodSeed);
  const factor = 0.7 + (((periodSeed * 31) % 7) / 10);
  const dep = Math.round(_ARV_seedInt(seed, 21, 800, 28000) * factor);
  const wd  = Math.round(dep * (0.28 + _ARV_seedFn(seed, 22) * 0.62));
  const wager  = _ARV_seedInt(seed, 23, dep * 3, dep * 9);
  const payout = Math.round(wager * (0.86 + _ARV_seedFn(seed, 24) * 0.10));
  const isLoss = _ARV_seedFn(seed, 25) < 0.4; // 约 40% 亏损户
  const ggrSign = isLoss ? -1 : 1;
  const ggr = (wager - payout) * ggrSign;
  // v3.1.56 期末余额 偏偏偏低于 (dep - wd)，让 baseRaw 偏正 → 5 行样本中会出现明显盈利行
  const balance = Math.max(0, dep - wd + _ARV_seedInt(seed, 26, -2400, 600));
  const rate = 5;
  // v3.1.52 上期期末余额 不会有负数;上期佣金基数 只会有负数或 0
  const prevUnsettled = Math.max(0, _ARV_seedInt(seed, 27, -800, 1200));
  const prevBase      = Math.min(0, _ARV_seedInt(seed, 28, -1200, 300));
  const baseRaw = prevUnsettled + prevBase + (dep - wd - balance);
  const base    = Math.max(0, baseRaw);
  const estCom    = Math.max(0, dep - wd - balance);
  const settledCom = Math.round(base * rate / 100);
  const uid = 'P' + String(12354000 + _ARV_seedInt(seed, 29, 100, 999));
  // v3.1.43 注册时间：近 1~90 天内随机派生（稳定）
  const daysAgo = _ARV_seedInt(seed, 30, 1, 90);
  const regDate = new Date();
  regDate.setDate(regDate.getDate() - daysAgo);
  regDate.setHours(_ARV_seedInt(seed, 31, 0, 23), _ARV_seedInt(seed, 32, 0, 59), _ARV_seedInt(seed, 33, 0, 59), 0);
  return {
    key: (agent._displayId || agent.id) + '_' + code + '_' + uid,
    agentId: agent._displayId || agent.id,
    agentName: agent.name,
    code,
    uid,
    registered: regDate,
    deposit: dep, withdraw: wd, wager, payout, ggr, balance, rate,
    prevUnsettled, prevBase,
    base, estCom, settledCom, isLoss,
    gap: dep - wd,
  };
}

// —— 构造一期所有行（传入代理子集）
function _ARV_buildPeriodRows(agentList, periodSeed) {
  const out = [];
  let poolIdx = 0;
  (agentList || []).forEach(a => {
    // v3.1.56 每个代理展示 5 个玩家示例（之前是 2）
    for (let i = 0; i < 5; i++) {
      if (poolIdx >= ARV_CODE_POOL.length) break;
      const code = ARV_CODE_POOL[poolIdx++];
      out.push(_ARV_makeRow(a, code, periodSeed, poolIdx));
    }
  });
  return out;
}

// v3.1.88 去掉时间部分(`HH:mm:ss` / `H:mm:ss`),只保留日期
function _arvStripTime(s) {
  return String(s || '').replace(/\s*\d{1,2}:\d{2}:\d{2}/g, '').trim();
}

function AgentRevshareModule() {
  const F = window.APS_FMT;
  const [cycleType, setCycleType] = React.useState('weekly'); // weekly | monthly
  const [tab, setTab] = React.useState('estimate'); // estimate | settled | rule
  const [q, setQ] = React.useState('');
  const [statusF, setStatusF] = React.useState('all');
  const [sort, setSort] = React.useState({ k: 'estCom', dir: 'desc' });
  const [page, setPage] = React.useState(1);
  const pageSize = 12;
  // v3.1.44 说明弹窗
  const [helpOpen, setHelpOpen] = React.useState(false);
  // v3.1.57 已结算记录查询 弹窗
  const [historyRow, setHistoryRow] = React.useState(null);

  // 期次列表随结算周期切换
  const SETTLED_LIST = cycleType === 'weekly' ? ARV_SETTLED_LIST_WEEKLY : ARV_SETTLED_LIST_MONTHLY;
  const ESTIMATE_INFO = ARV_ESTIMATE_INFO[cycleType];

  // v3.1.42 代理选择器：不再允许「全部代理」，默认选中列表首项
  const [agentF, setAgentF] = React.useState(null);
  const [agentPickerOpen, setAgentPickerOpen] = React.useState(false);
  const agentPickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!agentPickerOpen) return;
    const h = (e) => { if (agentPickerRef.current && !agentPickerRef.current.contains(e.target)) setAgentPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [agentPickerOpen]);
  // v3.1.38 只从「代理账户管理 store」(依赖 agents.jsx 允序) 拉；如未初始化则强制初始化一下
  React.useEffect(() => {
    if (!window.APS_MERCHANT_AGENTS_STORE && typeof window.APS_ensureMerchantAgentsStore === 'function') {
      window.APS_ensureMerchantAgentsStore();
    }
  }, []);
  const allMerchantAgents = (window.APS_MERCHANT_AGENTS_STORE && window.APS_MERCHANT_AGENTS_STORE.list) || [];
  // v3.1.41 每个代理「当前结算周期 + 可选切换时间」—— 切换下个月 1 号才生效，不会出现重叠期
  //   AC100005 — 一直每周 → 所有 weekly 期出现
  //   AC100006 — 一直每月 → 所有 monthly 期出现
  //   AC100007 — 5/1 起切到每月 （之前是每周）→ monthly 出现在 M2605/M2606；weekly 不出现 在 W26053/W26054（5 月已是月结算）
  //   AC100008 — 6/1 起切到每周 （之前是每月）→ weekly W26061 (6/1起) 出现；monthly M2604/M2605 出现（6 月之前仍是月结算）
  const AGENT_CYCLE_META = [
    { current: 'weekly',  switchAt: null },
    { current: 'monthly', switchAt: null },
    { current: 'monthly', switchAt: new Date('2026-05-01T00:00:00').getTime() },
    { current: 'weekly',  switchAt: new Date('2026-06-01T00:00:00').getTime() },
  ];
  const _agentInPeriod = (i, cycle, periodEndStr) => {
    const meta = AGENT_CYCLE_META[i];
    if (!meta) return false;
    const endTime = new Date(periodEndStr).getTime();
    if (!meta.switchAt) return meta.current === cycle;
    if (endTime < meta.switchAt) {
      const prev = meta.current === 'weekly' ? 'monthly' : 'weekly';
      return prev === cycle;
    }
    return meta.current === cycle;
  };
  const _agentCurrentCycleLabel = (i) => {
    const meta = AGENT_CYCLE_META[i];
    return !meta || meta.current === 'weekly' ? '每周结算' : '每月结算';
  };
  const agentOptions = allMerchantAgents.map((a, i) => ({
    id: a._displayId || a.id,
    name: a.name,
    status: a.status,
    cycleLabel: _agentCurrentCycleLabel(i),
    _index: i,
  }));
  // v3.1.42 默认选中首位代理;若原选中代理不存在重置为首位
  React.useEffect(() => {
    if (agentOptions.length === 0) return;
    if (!agentF || !agentOptions.find(a => a.id === agentF)) {
      setAgentF(agentOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentOptions.length]);

  // 已结算期选中哪一期
  const [selectedWeek, setSelectedWeek] = React.useState(SETTLED_LIST[0].key);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const selectedPeriod = SETTLED_LIST.find(p => p.key === selectedWeek) || SETTLED_LIST[0];
  // 切换 周/月 时重置选中期为列表首项
  React.useEffect(() => {
    setSelectedWeek(SETTLED_LIST[0].key);
    setPage(1);
  }, [cycleType]);

  // 外部点击关闭下拉
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // 构造当前期的所有行：只取「该期 × 该 cycle × 且在该期生效」的代理
  const _buildAgentSubset = (periodEnd) => allMerchantAgents.filter((_, i) => _agentInPeriod(i, cycleType, periodEnd))
    .filter(a => agentF === 'all' || (a._displayId || a.id) === agentF);
  const estimateRows = React.useMemo(() => {
    const periodEnd = ESTIMATE_INFO.period.split(' - ')[1];
    return _ARV_buildPeriodRows(_buildAgentSubset(periodEnd), ESTIMATE_INFO.seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleType, agentF, ESTIMATE_INFO.seed, allMerchantAgents.length]);
  const settledRows  = React.useMemo(() => _ARV_buildPeriodRows(_buildAgentSubset(selectedPeriod.end), selectedPeriod.seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cycleType, agentF, selectedPeriod.seed, selectedPeriod.end, allMerchantAgents.length]);
  const rows = tab === 'estimate' ? estimateRows : settledRows;

  // 搜索 + 状态筛选 + 代理筛选
  const filtered = rows.filter(r => {
    if (agentF !== 'all' && r.agentId !== agentF) return false;
    if (q) {
      const t = q.toLowerCase();
      if (!(r.agentId.toLowerCase().includes(t)
        || (r.agentName || '').toLowerCase().includes(t)
        || r.code.toLowerCase().includes(t)
        || r.uid.toLowerCase().includes(t))) return false;
    }
    if (statusF === 'profit' && r.isLoss) return false;
    if (statusF === 'loss' && !r.isLoss) return false;
    return true;
  });

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k] ?? 0, bv = b[sort.k] ?? 0;
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // KPI 合计
  const sum = (k) => sorted.reduce((s, r) => s + (r[k] || 0), 0);
  const totalAgents = new Set(sorted.map(r => r.agentId)).size;
  const totalPlayers = sorted.length;
  const totalDep = sum('deposit');
  const totalWd  = sum('withdraw');
  const totalGap = totalDep - totalWd;
  const totalWager = sum('wager');
  const totalPayout = sum('payout');
  const totalGgr = sum('ggr');
  const totalEstCom = sum('estCom');
  const totalSetCom = sum('settledCom');

  const money = (n) => (n < 0 ? '-₹' : '₹') + F.fmtNum(Math.abs(n || 0));
  const moneyDec = (n) => (n < 0 ? '-₹' : '₹') + F.money(Math.abs(n || 0));
  const fmtGap = (n) => (n >= 0 ? '+' : '-') + '₹' + F.fmtNum(Math.abs(n || 0));

  // 排序工具
  const setSortKey = (k) => {
    setSort(s => s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'desc' });
    setPage(1);
  };
  const Th = ({ k, children, right, highlight }) => (
    <th className={right ? 'right' : ''}
        style={{ cursor: 'pointer', userSelect: 'none', color: highlight ? 'var(--brand)' : undefined }}
        onClick={() => setSortKey(k)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        <span style={{ fontSize: 9, color: sort.k === k ? 'var(--brand)' : 'var(--text-3)', lineHeight: 1 }}>
          {sort.k === k ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </span>
    </th>
  );

  const switchTab = (k) => { setTab(k); setPage(1); };

  return (
    <div className="page">
      <ARV_UI.PageHead title="代理分润报表" subtitle="按代理 × 玩家维度查看本期预估分润与历史结算">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </ARV_UI.PageHead>

      {/* —— 代理选择器 —— */}
      <div ref={agentPickerRef} style={{ position: 'relative', marginBottom: 14, maxWidth: 480 }}>
        <div
          onClick={() => setAgentPickerOpen(!agentPickerOpen)}
          style={{
            padding: '10px 14px',
            border: '1px solid var(--line)', borderRadius: 6,
            background: agentPickerOpen ? 'var(--bg-2)' : '#fff',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', userSelect: 'none', fontSize: 13,
          }}>
          <Icon name="users" size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }}/>
          {(() => {
            const sel = agentOptions.find(a => a.id === agentF);
            return sel ? (
              <span style={{ flex: 1, color: 'var(--text-0)', display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="text-mono" style={{ color: 'var(--brand)', fontWeight: 600 }}>{sel.id}</span>
                <span style={{ color: 'var(--text-3)' }}>·</span>
                <span style={{ fontWeight: 500 }}>{sel.name}</span>
                {/* v3.1.42 选中代理右侧同步显示「当前结算周期」 pill */}
                <span style={{
                  padding: '1px 8px', borderRadius: 3, fontSize: 11,
                  background: sel.cycleLabel === '每周结算' ? '#eff6ff' : '#f0fdf4',
                  color: sel.cycleLabel === '每周结算' ? '#1d4ed8' : '#15803d',
                  border: '1px solid ' + (sel.cycleLabel === '每周结算' ? '#bfdbfe' : '#bbf7d0'),
                  fontWeight: 500,
                }}>{sel.cycleLabel}</span>
              </span>
            ) : (
              <span style={{ color: 'var(--text-3)', flex: 1 }}>选择查询的代理ID / 代理名称</span>
            );
          })()}
          <Icon name="chevronDown" size={14} style={{ color: 'var(--text-2)', flexShrink: 0, transform: agentPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
        </div>
        {agentPickerOpen && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            background: '#fff', border: '1px solid var(--line)', borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 30,
            marginTop: 4, maxHeight: 320, overflowY: 'auto',
          }}>
            {agentOptions.length === 0 && (
              <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)' }}>
                暂无代理 — 请先在「代理账户管理」创建
              </div>
            )}
            {agentOptions.map(a => (
              <ARV_AgentRow
                key={a.id}
                active={a.id === agentF}
                onClick={() => { setAgentF(a.id); setAgentPickerOpen(false); setPage(1); }}>
                <span className="text-mono" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 12, minWidth: 96 }}>{a.id}</span>
                <span style={{ color: 'var(--text-0)', fontWeight: 500, minWidth: 110 }}>{a.name}</span>
                <span style={{
                  padding: '1px 8px', borderRadius: 3, fontSize: 11,
                  background: a.cycleLabel === '每周结算' ? '#eff6ff' : '#f0fdf4',
                  color: a.cycleLabel === '每周结算' ? '#1d4ed8' : '#15803d',
                  border: '1px solid ' + (a.cycleLabel === '每周结算' ? '#bfdbfe' : '#bbf7d0'),
                  fontWeight: 500,
                }}>{a.cycleLabel}</span>
                {/* v3.1.42 状态 pill — 含 active，全部 4 状态都显示 */}
                {a.status && (() => {
                  const meta = a.status === 'active'    ? { bg:'#f0fdf4', fg:'#15803d', t:'已启用' }
                             : a.status === 'frozen'    ? { bg:'#fef3c7', fg:'#92400e', t:'已冻结' }
                             : a.status === 'suspended' ? { bg:'#fee2e2', fg:'#991b1b', t:'已停用' }
                             : a.status === 'pending'   ? { bg:'#e5e7eb', fg:'#374151', t:'未启用' }
                             : { bg:'#e5e7eb', fg:'#374151', t:a.status };
                  return (
                    <span style={{
                      marginLeft: 'auto', padding: '1px 7px', borderRadius: 3, fontSize: 10.5,
                      background: meta.bg, color: meta.fg, fontWeight: 500,
                    }}>{meta.t}</span>
                  );
                })()}
              </ARV_AgentRow>
            ))}
          </div>
        )}
      </div>

      {/* —— 结算周期分页 segmented（代理选择器下方） + 右侧说明按钮 —— */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 12 }}>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: 'var(--bg-2)' }}>
          {[
            { k: 'weekly',  l: '每周结算' },
            { k: 'monthly', l: '每月结算' },
          ].map(c => (
            <div key={c.k}
              onClick={() => { setCycleType(c.k); setPage(1); }}
              style={{
                padding: '8px 22px', fontSize: 13.5, cursor: 'pointer', userSelect: 'none',
                borderRadius: 6, fontWeight: cycleType === c.k ? 600 : 500,
                background: cycleType === c.k ? '#fff' : 'transparent',
                color: cycleType === c.k ? 'var(--brand)' : 'var(--text-2)',
                boxShadow: cycleType === c.k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                border: cycleType === c.k ? '1px solid var(--brand)' : '1px solid transparent',
                transition: 'all .15s',
              }}>
              {c.l}
            </div>
          ))}
        </div>
        <span style={{ flex: 1 }}/>
        {/* v3.1.44 说明按钮 */}
        <button className="btn sm ghost" onClick={() => setHelpOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="info" size={13}/>说明
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        <ARV_UI.Tabs value={tab} onChange={switchTab} tabs={[
          { key: 'estimate', label: '本期预估分润' },
          { key: 'settled',  label: '已结算分润' },
        ]}/>

        {/* —— 信息条（v3.1.88 改两行布局 + 隐藏时间部分） —— */}
        {tab === 'estimate' && (
          <div style={{
            padding: '14px 18px',
            background: 'var(--bg-2)',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}>
            <div style={{
              padding: '14px 18px',
              background: '#fff',
              border: '1px solid var(--line)', borderRadius: 8,
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:32}}>
                <ARV_InfoCell l="期號" v={ESTIMATE_INFO.week}/>
                <ARV_InfoCell l="結算狀態" v={<span style={{color:'#f59e0b',fontWeight:600}}>未結算預估分潤</span>}/>
              </div>
              <ARV_InfoCell l="週期" v={<span className="text-mono">{_arvStripTime(ESTIMATE_INFO.period)}</span>}/>
            </div>
          </div>
        )}

        {tab === 'settled' && (
          <div style={{
            padding: '14px 18px',
            background: 'var(--bg-2)',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            position: 'relative',
          }} ref={pickerRef}>
            <div
              onClick={() => setPickerOpen(!pickerOpen)}
              style={{
                padding: '14px 18px',
                background: pickerOpen ? '#eff6ff' : '#fff',
                border: '1.5px solid ' + (pickerOpen ? 'var(--brand)' : '#93c5fd'),
                borderRadius: 8,
                boxShadow: pickerOpen ? '0 0 0 3px rgba(59,130,246,0.12)' : '0 1px 3px rgba(59,130,246,0.08)',
                display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5,
                cursor: 'pointer', userSelect: 'none', transition: 'all .15s',
              }}>
              <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
                <ARV_InfoCell l="期號" v={selectedPeriod.label}/>
                <ARV_InfoCell l="週期" v={<span className="text-mono">{_arvStripTime(selectedPeriod.start)} - {_arvStripTime(selectedPeriod.end)}</span>}/>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 6,
                background: 'var(--brand)', color: '#fff',
                fontSize: 12, fontWeight: 600,
              }}>
                切換期號
                <Icon name="chevronDown" size={14} style={{ transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
              </span>
            </div>
            {pickerOpen && (
              <div style={{
                position: 'absolute', left: 18, right: 18, top: 'calc(100% - 2px)',
                background: '#fff', border: '1px solid var(--line)', borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 20,
                marginTop: 4, overflow: 'hidden',
              }}>
                {SETTLED_LIST.map(p => (
                  <div key={p.key}
                    onClick={() => { setSelectedWeek(p.key); setPickerOpen(false); setPage(1); }}
                    style={{
                      padding: '10px 16px', cursor: 'pointer', fontSize: 12.5,
                      display: 'flex', flexDirection:'column', gap: 6,
                      background: p.key === selectedWeek ? 'var(--bg-2)' : '#fff',
                      borderBottom: '1px solid var(--line-soft)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = p.key === selectedWeek ? 'var(--bg-2)' : '#fff'}>
                    <ARV_InfoCell l="期號" v={p.label}/>
                    <ARV_InfoCell l="週期" v={<span className="text-mono">{_arvStripTime(p.start)} - {_arvStripTime(p.end)}</span>}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* —— Tab 内容 —— */}
        {tab !== 'rule' && (
          <div style={{ padding: '14px 18px 18px' }}>
            {/* KPI 10 张：5 列网格 */}
            {/* v3.1.86 KPI 5 张 — 删除「总投注 / 总派彩 / GGR」 */}
            <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
              {[
                { l: '玩家总数',  v: F.fmtNum(totalPlayers) },
                { l: '总充值金额', v: money(totalDep) },
                { l: '总提款金额', v: money(totalWd) },
                { l: '充提差',    v: fmtGap(totalGap),
                  valColor: totalGap >= 0 ? 'var(--success)' : 'var(--danger)',
                  highlight: true },
                { l: tab === 'estimate' ? '预估佣金合计' : '结算佣金合计',
                  v: money(tab === 'estimate' ? totalEstCom : totalSetCom),
                  valColor: 'var(--brand)' },
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

            {/* v3.1.47 工具栏 + 表格 + 分页 用一层 card 包起来 */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, background: '#fff', padding: '14px 16px' }}>
              <div className="toolbar" style={{ padding: '0 0 12px' }}>
                <ARV_UI.SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }}
                  placeholder="邀请Code / 玩家UID" width={260}/>
                <select className="filter-select" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
                  <option value="all">全部用户状态</option>
                  <option value="profit">盈利</option>
                  <option value="loss">亏损</option>
                </select>
                <span style={{ flex: 1 }}/>
              </div>

            {/* 表格 */}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <Th k="uid">玩家UID</Th>
                    <Th k="code">邀请Code</Th>
                    <Th k="registered">注册时间</Th>
                    <Th k="deposit" right>充值金额</Th>
                    <Th k="withdraw" right>提款金额</Th>
                    <Th k="gap" right>充提差</Th>
                    <Th k="balance" right highlight>
                      {tab === 'estimate' ? '当前余额' : '期末余额'}
                    </Th>
                    {tab === 'settled' && <Th k="prevBalance" right>上期期末余额</Th>}
                    {/* v3.1.86 删除 投注 / 派彩 / GGR 三列 */}
                    {tab === 'settled' && <Th k="prevBase" right>上期佣金基数</Th>}
                    {tab === 'settled' && <Th k="base" right>佣金基数</Th>}
                    <Th k="rate" right>分润比例</Th>
                    <Th k={tab === 'estimate' ? 'estCom' : 'settledCom'} right highlight>
                      {tab === 'estimate' ? '预估佣金' : '结算佣金'}
                    </Th>
                    <th>用户状态</th>
                    {tab === 'settled' && <th>结算记录</th>}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(r => (
                    <tr key={r.key}>
                      <td className="text-mono" style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12 }}>{r.uid}</td>
                      <td className="text-mono" style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12 }}>{r.code}</td>
                      <td className="text-mono" style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{(() => {
                        const d = r.registered;
                        const pad = (n) => String(n).padStart(2, '0');
                        return d.getFullYear() + '/' + pad(d.getMonth()+1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
                      })()}</td>
                      <td className="right text-mono">{money(r.deposit)}</td>
                      <td className="right text-mono">{money(r.withdraw)}</td>
                      <td className="right text-mono"
                          style={{ color: r.gap >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {fmtGap(r.gap)}
                      </td>
                      <td className="right text-mono">{moneyDec(r.balance)}</td>
                      {tab === 'settled' && (
                        <td className="right text-mono" style={{color:'var(--text-2)'}}>{moneyDec(r.prevUnsettled || 0)}</td>
                      )}
                      {/* v3.1.86 删除 投注 / 派彩 / GGR 三列 */}
                        {tab === 'settled' && (
                          <td className="right text-mono" style={{color: (r.prevBase||0) < 0 ? 'var(--danger)' : 'var(--text-2)'}}>{moneyDec(r.prevBase || 0)}</td>
                        )}
                      {tab === 'settled' && (
                        <td className="right text-mono">{moneyDec(r.base)}</td>
                      )}
                      <td className="right text-mono">{r.rate}%</td>
                      <td className="right text-mono" style={{ color: 'var(--brand)', fontWeight: 600 }}>
                        {moneyDec(tab === 'estimate' ? r.estCom : r.settledCom)}
                      </td>
                      <td>
                        {r.isLoss
                          ? <span className="badge b-danger">亏损</span>
                          : <span className="badge b-success">盈利</span>}
                      </td>
                      {tab === 'settled' && (
                        <td>
                          <button
                            className="btn-link"
                            onClick={() => setHistoryRow(r)}
                            style={{
                              background:'none', border:'none', cursor:'pointer',
                              color:'var(--brand)', fontSize:12.5, fontWeight:500,
                              padding:0,
                            }}
                          >查询</button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={tab === 'settled' ? 14 : 10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>无匹配数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <ARV_UI.Pagination page={safePage} pageSize={pageSize} total={sorted.length} onPage={setPage}/>
            </div>
          </div>
        )}

        {/* v3.1.86 删除「分润规则」tab — 实际规则在「运营 → 分润管理」配置 */}
      </div>

      {/* v3.1.44 说明弹窗 */}
      {helpOpen && <ARV_HelpModal onClose={() => setHelpOpen(false)}/>}

      {/* v3.1.57 已结算记录查询 */}
      <SettlementHistoryModal
        open={!!historyRow}
        onClose={() => setHistoryRow(null)}
        agentId={historyRow?.agentId}
        agentName={historyRow?.agentName}
        code={historyRow?.code}
        uid={historyRow?.uid}
      />
    </div>
  );
}

// —— 代理选择器下拉行
function ARV_AgentRow({ active, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '9px 14px', cursor: 'pointer', fontSize: 12.5,
        display: 'flex', alignItems: 'center', gap: 10,
        background: active ? '#eff6ff' : (hover ? 'var(--bg-2)' : '#fff'),
        borderBottom: '1px solid var(--line-soft)',
      }}>
      {children}
    </div>
  );
}

// —— 信息条单元
function ARV_InfoCell({ l, v }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--text-2)' }}>{l}:</span>
      <span style={{ color: 'var(--text-0)', fontWeight: 500 }}>{v}</span>
    </span>
  );
}

function ARV_RuleRow({ l, v }) {
  return (
    <tr>
      <td style={{ padding: '8px 0', color: 'var(--text-3)', width: 160, borderBottom: '1px solid var(--line-soft)' }}>{l}</td>
      <td style={{ padding: '8px 0', color: 'var(--text-1)', borderBottom: '1px solid var(--line-soft)' }}>{v}</td>
    </tr>
  );
}

window.AgentRevshareModule = AgentRevshareModule;

// ============ v3.1.44 说明弹窗 ============
const ARV_THSTY = { textAlign: 'left', padding: '8px 10px', color: 'var(--text-2)', fontSize: 12, fontWeight: 500 };
const ARV_TDSTY = { padding: '10px', color: 'var(--text-1)', fontSize: 13 };
const ARV_PILL = (bg, fg, bd) => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 3, fontSize: 11,
  background: bg, color: fg, border: '1px solid ' + bd, fontWeight: 500,
});
const ARV_RULE_BOX = {
  padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff',
};
const ARV_RULE_TITLE = { fontWeight: 500, color: 'var(--text-0)', fontSize: 13, marginBottom: 8 };
const ARV_RULE_TEXT  = { fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 };

function ARV_HelpSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 14, fontWeight: 600, color: 'var(--text-0)',
        marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--brand)',
        display: 'inline-block',
      }}>{title}</div>
      {children}
    </div>
  );
}

function ARV_HelpModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        zIndex: 200, display: 'grid', placeItems: 'center', padding: 24,
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: 'min(720px, 100%)',
          maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        }}>
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <Icon name="info" size={16} style={{ color: 'var(--brand)' }}/>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-0)', margin: 0, flex: 1 }}>代理分润报表 · 说明</h3>
          <button className="btn sm ghost icon-only" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ padding: '18px 22px', fontSize: 13.5, lineHeight: 1.85, color: 'var(--text-1)' }}>

          <ARV_HelpSection title="一、结算周期 / 结算时间">
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ ...ARV_THSTY, width: 110 }}>结算周期</th>
                  <th style={ARV_THSTY}>结算时间</th>
                  <th style={{ ...ARV_THSTY, width: 240 }}>结算的周期范围</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px dashed var(--line-soft)' }}>
                  <td style={ARV_TDSTY}><span style={ARV_PILL('#eff6ff', '#1d4ed8', '#bfdbfe')}>每周结算</span></td>
                  <td style={ARV_TDSTY}>每週一 00:00:00</td>
                  <td style={ARV_TDSTY}>上週一 00:00:00 ~ 週日 23:59:59</td>
                </tr>
                <tr>
                  <td style={ARV_TDSTY}><span style={ARV_PILL('#f0fdf4', '#15803d', '#bbf7d0')}>每月结算</span></td>
                  <td style={ARV_TDSTY}>每月 1 號 00:00:00</td>
                  <td style={ARV_TDSTY}>上月 1 號 00:00:00 ~ 月底 23:59:59</td>
                </tr>
              </tbody>
            </table>
          </ARV_HelpSection>

          <ARV_HelpSection title="二、期编号规则">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 500, color: 'var(--text-0)', marginBottom: 6 }}>每周结算 — W + YY + MM + 周序</div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                W26051 = 2026 年 5 月 第 1 周
              </div>
              <ul style={{ margin: '8px 0 0 18px', color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.7 }}>
                <li><b style={{ color: 'var(--text-1)' }}>26</b> — 2026 年</li>
                <li><b style={{ color: 'var(--text-1)' }}>05</b> — 5 月</li>
                <li><b style={{ color: 'var(--text-1)' }}>1</b>  — 当月第 1 周</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-0)', marginBottom: 6 }}>每月结算 — M + YY + MM</div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                M2605 = 2026 年 5 月
              </div>
              <ul style={{ margin: '8px 0 0 18px', color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.7 }}>
                <li><b style={{ color: 'var(--text-1)' }}>26</b> — 2026 年</li>
                <li><b style={{ color: 'var(--text-1)' }}>05</b> — 5 月</li>
              </ul>
            </div>
          </ARV_HelpSection>

          <ARV_HelpSection title="三、结算周期切换规则">
            <div style={{
              padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 6, marginBottom: 12, fontSize: 13, lineHeight: 1.75, color: 'var(--text-0)',
            }}>
              <b style={{ color: '#92400e' }}>代理结算周期从 每周 ⇄ 每月 互切时，到「下个月 1 号」才生效。</b>
              <div style={{ marginTop: 6, color: 'var(--text-2)' }}>
                不会出现重叠期 — 同一代理某历史期只属于一种结算方式。
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={ARV_RULE_BOX}>
                <div style={ARV_RULE_TITLE}>
                  <span style={ARV_PILL('#eff6ff', '#1d4ed8', '#bfdbfe')}>每周</span>
                  {' → '}
                  <span style={ARV_PILL('#f0fdf4', '#15803d', '#bbf7d0')}>每月</span>
                </div>
                <div style={ARV_RULE_TEXT}>于当月内提交切换 → 仍按每周结算本月，下月 1 号起按每月结算。</div>
              </div>
              <div style={ARV_RULE_BOX}>
                <div style={ARV_RULE_TITLE}>
                  <span style={ARV_PILL('#f0fdf4', '#15803d', '#bbf7d0')}>每月</span>
                  {' → '}
                  <span style={ARV_PILL('#eff6ff', '#1d4ed8', '#bfdbfe')}>每周</span>
                </div>
                <div style={ARV_RULE_TEXT}>于当月内提交切换 → 仍按每月结算本月，下月 1 号起按每周结算。</div>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75 }}>
              <b style={{ color: 'var(--text-1)' }}>例子：</b>AC100007 原为「每周结算」，在 4 月中申请改为「每月结算」：
              <ul style={{ margin: '6px 0 0 18px' }}>
                <li>4 月：仍出现在每周结算报表 (W2604x)</li>
                <li>5 月起：出现在每月结算报表 (M2605)，不再出现在每周报表</li>
              </ul>
            </div>
          </ARV_HelpSection>

        </div>

        <div style={{
          padding: '12px 22px', borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'flex-end',
          position: 'sticky', bottom: 0, background: '#fff',
        }}>
          <button className="btn primary" onClick={onClose}>我知道了</button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// v3.1.57 已结算记录查询弹窗(商户后台 / 专业代理后台 共用)
// 通过 window.SettlementHistoryModal 暴露,my_revshare.jsx 直接复用
// Props: { open, onClose, agentId, agentName, code, uid }
// =============================================================
function SettlementHistoryModal({ open, onClose, agentId, agentName, code, uid }) {
  const F = window.APS_FMT;
  const [cycleType, setCycleType] = React.useState('weekly');
  const [q, setQ] = React.useState(uid || '');
  React.useEffect(() => { if (open) setQ(uid || ''); }, [open, uid]);

  if (!open) return null;

  // —— 手算 5 期链式数据,严格满足公式:
  //   本期佣金基数 = (上期期末余额 + 上期佣金基数) + (本期充值 - 本期提现 - 本期期末余额)
  //   本期佣金     = max(0, 本期佣金基数) × 分润比例
  //   下期上期期末余额 = 本期期末余额
  //   下期上期佣金基数 = 本期佣金基数 < 0 ? 本期佣金基数 : 0
  // 显示顺序:最新期在前
  const WEEKLY = [
    // 最新 → 最旧
    { period:'W26061', dep:0,    wd:0,   bal:0,   prevBal:500, prevBase:-300 }, // base=200,  com=10  盈利
    { period:'W26054', dep:600,  wd:700, bal:500, prevBal:300, prevBase:0    }, // base=-300, com=0   亏损
    { period:'W26053', dep:1100, wd:0,   bal:300, prevBal:400, prevBase:-500 }, // base=700,  com=35  盈利
    { period:'W26052', dep:200,  wd:100, bal:400, prevBal:500, prevBase:-700 }, // base=-500, com=0   亏损
    { period:'W26051', dep:100,  wd:300, bal:500, prevBal:0,   prevBase:0    }, // base=-700, com=0   亏损
  ];
  const MONTHLY = [
    { period:'M2606', dep:200,  wd:100, bal:150, prevBal:600, prevBase:-400 }, // base=150,  com=8   盈利
    { period:'M2605', dep:1800, wd:300, bal:600, prevBal:500, prevBase:-200 }, // base=1200, com=60  盈利
    { period:'M2604', dep:400,  wd:900, bal:500, prevBal:300, prevBase:0    }, // base=-700, com=0   亏损
    { period:'M2603', dep:600,  wd:200, bal:300, prevBal:200, prevBase:-500 }, // base=-200, com=0   亏损
    { period:'M2602', dep:250,  wd:500, bal:200, prevBal:0,   prevBase:0    }, // base=-450, com=0   亏损
  ];
  const rows = (cycleType === 'weekly' ? WEEKLY : MONTHLY).map(r => {
    const rate = 5;
    const base = (r.prevBal + r.prevBase) + (r.dep - r.wd - r.bal);
    const com = Math.max(0, base) * rate / 100;
    return { ...r, rate, base, com, isLoss: base <= 0 };
  });

  const money = (n) => '₹' + F.money(n || 0);
  const moneySigned = (n) => {
    if (n === 0) return '₹0';
    return (n > 0 ? '' : '-') + '₹' + F.money(Math.abs(n));
  };

  return (
    <div className="modal-mask" onClick={onClose} style={{zIndex:200}}>
      <div className="modal" style={{ width: 1080, maxHeight:'90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h3>已结算记录查询</h3>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>查询用户每一期已结算流程</div>
          </div>
          <button className="close" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'18px 22px'}}>
          {/* 搜索条 */}
          <div style={{display:'flex', gap:8, marginBottom:14}}>
            <input
              className="filter-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="玩家 UID"
              style={{
                flex:1, padding:'8px 12px', fontSize:13, height:36,
                border:'1px solid var(--line)', borderRadius:6, background:'#fff', outline:'none',
              }}
            />
            <button className="btn primary" style={{height:36, padding:'0 18px'}}>
              <Icon name="search" size={13}/> 查询
            </button>
          </div>

          {/* 代理信息条 — 只读 */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14,
          }}>
            {[
              { l:'代理ID',    v: agentId || '—' },
              { l:'代理名称',  v: agentName || '—' },
              { l:'邀请Code',  v: code || '—' },
            ].map(c => (
              <div key={c.l}>
                <div style={{fontSize:11.5, color:'var(--text-2)', marginBottom:4}}>{c.l}</div>
                <div style={{
                  padding:'8px 12px', fontSize:13, height:36, lineHeight:'20px',
                  border:'1px solid var(--line)', borderRadius:6,
                  background:'var(--bg-2)', color:'var(--text-0)', fontWeight:500,
                  fontFamily:'var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                }}>{c.v}</div>
              </div>
            ))}
          </div>

          {/* 周期切换 */}
          <div style={{
            display:'flex', gap:0, marginBottom:14,
            border:'1px solid var(--line)', borderRadius:8, padding:4,
            background:'var(--bg-2)', width:'fit-content',
          }}>
            {[
              { k:'weekly',  l:'每周结算' },
              { k:'monthly', l:'每月结算' },
            ].map(c => (
              <div key={c.k}
                onClick={() => setCycleType(c.k)}
                style={{
                  padding:'7px 22px', fontSize:13, cursor:'pointer', userSelect:'none',
                  borderRadius:6, fontWeight: cycleType === c.k ? 600 : 500,
                  background: cycleType === c.k ? '#fff' : 'transparent',
                  color: cycleType === c.k ? 'var(--brand)' : 'var(--text-2)',
                  boxShadow: cycleType === c.k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  border: cycleType === c.k ? '1px solid var(--brand)' : '1px solid transparent',
                  transition:'all .15s',
                }}>{c.l}</div>
            ))}
          </div>

          {/* 表格 */}
          <div className="tbl-wrap" style={{border:'1px solid var(--line)', borderRadius:8}}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>期数</th>
                  <th className="right">充值</th>
                  <th className="right">提款</th>
                  <th className="right">期末余额</th>
                  <th className="right">上期期末余额</th>
                  <th className="right">佣金基数</th>
                  <th className="right">上期佣金基数</th>
                  <th className="right">分润比例</th>
                  <th className="right">结算佣金</th>
                  <th>用户状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.period}>
                    <td className="text-mono" style={{fontWeight:600, color:'var(--text-0)'}}>{r.period}</td>
                    <td className="right text-mono">{money(r.dep)}</td>
                    <td className="right text-mono">{money(r.wd)}</td>
                    <td className="right text-mono">{money(r.bal)}</td>
                    <td className="right text-mono" style={{color:'var(--text-2)'}}>{money(r.prevBal)}</td>
                    <td className="right text-mono" style={{
                      color: r.base > 0 ? 'var(--success)' : r.base < 0 ? 'var(--danger)' : 'var(--text-1)',
                      fontWeight: 600,
                    }}>{moneySigned(r.base)}</td>
                    <td className="right text-mono" style={{
                      color: r.prevBase < 0 ? 'var(--danger)' : 'var(--text-2)',
                    }}>{moneySigned(r.prevBase)}</td>
                    <td className="right text-mono">{r.rate}%</td>
                    <td className="right text-mono" style={{
                      color: r.com > 0 ? 'var(--brand)' : 'var(--text-2)',
                      fontWeight: r.com > 0 ? 600 : 400,
                    }}>{money(r.com)}</td>
                    <td>
                      {r.isLoss
                        ? <span className="badge b-danger">亏损</span>
                        : <span className="badge b-success">盈利</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{marginTop:10, fontSize:11.5, color:'var(--text-3)'}}>
            * 公式:本期佣金基数 = (上期期末余额 + 上期佣金基数) + (本期充值 - 本期提现 - 本期期末余额);
            本期佣金 = max(0, 本期佣金基数) × 分润比例。
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn primary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

// 暴露到 window 供 my_revshare.jsx 复用
window.SettlementHistoryModal = SettlementHistoryModal;
