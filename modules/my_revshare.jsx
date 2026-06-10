// 代理后台 - 分润报表 P0-7
// v3.1.3 按截图重做(用户提供 uploads/123456.png):
//   - 顶部扁平化 3 个 tab:本期预估分润 / 已结算分润 / 分润规则(取消 v3.1.2 的 segmented + 子 tab 双层结构)
//   - 本期预估分润:信息条「期號:W3 · 結算狀態:未結算預估分潤 · 週期:6/1 00:00:00 - 6/7 23:59:59」
//   - 已结算分润:期号下拉选择器(W2 / W1 历史期切换),信息条显示「期號 · 週期」
//   - 两种期 KPI 都是 9 个(2 行 × 5 + 1,跟玩家损益样式一致)
//   - 表格 13 列:玩家UID / 来源Code / VIP / 充值 / 提款 / 充提差 / [当前余额|结算余额] / 投注 / 派彩 / GGR / 分润比例 / [预估佣金|结算佣金] / 用户状态
//   - 用户状态 pill:盈利(绿) / 亏损(红)
//   - 工具栏:玩家UID/邀请Code 搜索 + 全部 VIP 下拉 + 全部用户状态 下拉
//   - 货币用 ₹(印度卢比,跟玩家损益对齐)

const MRUI = window.UI;
const MR_T = (k, fb) => window.t(k, fb);

// —— v3.7.37 已结算分润「總佣金」与「佣金结算单」逐期对齐 ——
//   每个已结算期号 → 该期结算单的佣金(settlement total)。
//   报表佣金 = round(settleBase × 5%),故 settleBase 须 = 目标佣金 × 20。
//   下表按「seed」映射(seed 即该期在 RICH_PERIODS / 列表里的标识),与商户/代理两端报表共用。
window.REVSHARE_PERIOD_TARGET = {
  31: 4880, 30: 680, 29: 5400, 28: 3100,   // W26064 / W26063 / W26062 / W26061
  2: 7250,  1: 2900, 5: 4600,  8: 8100,    // W26054 / W26053 / W26052 / W26051
  11: 3700, 7: 5950, 6: 4350,  4: 6800,    // W26044 / W26043 / W26042 / W26041
};
// 给定目标佣金 T,生成 5 笔玩家财务,聚合 settleBase 精确 = T×20(prevU/prevB 取 0)
window.buildTargetFinancials = function (T) {
  const S = T * 20;
  const weights = [0.34, 0.26, 0.20, 0.12, 0.08];
  let acc = 0;
  return weights.map((w, i) => {
    const net = (i === weights.length - 1) ? (S - acc) : Math.round(S * w);
    acc += net;
    const bal = Math.max(0, Math.round(net * 0.30));
    const wd  = Math.max(0, Math.round(net * 0.65));
    const dep = net + wd + bal;                 // dep - wd - bal = net
    const wager  = dep * 3;
    const payout = Math.round(wager * 0.9);
    return { dep, wd, bal, wager, payout, isLoss: net <= 0, prevU: 0, prevB: 0 };
  });
};

// —— 构造一期玩家数据 v3.1.56 改为 5 笔示例;v3.7.37 有目标期则按目标佣金反推
function buildPeriodPlayers(agentId, seed) {
  const fixedReg = [
    '2026/5/12 10:24:31',
    '2026/5/05 16:08:54',
    '2026/4/18 22:41:09',
    '2026/5/14 09:15:42',
    '2026/4/28 13:07:18',
  ];
  const codes = ['RANDY01', 'RANDY02', 'RANDY03', 'RANDY04', 'RANDY05'];
  const ids   = ['P12354531', 'P12354532', 'P12354533', 'P12354534', 'P12354535'];
  const rate = 5;
  const target = (window.REVSHARE_PERIOD_TARGET || {})[seed];

  let fin;
  if (target != null) {
    // 有结算单对应期 → 反推玩家财务,聚合佣金 = 该期结算单佣金
    fin = window.buildTargetFinancials(target);
  } else {
    // 无对应期(如本期预估)→ 沿用 5 笔模板 + seed 轻微缩放
    const k = 0.85 + (((Math.abs(seed) * 37) % 31) / 100);
    const r = (n) => Math.round(n * k);
    const tpl = [
      { dep:12000, wd:4000, bal:1500, wager:35000, payout:28500, isLoss:false, prevU:500, prevB:-300 },
      { dep:8000,  wd:3000, bal:3500, wager:10000, payout:8500,  isLoss:false, prevU:200, prevB:0    },
      { dep:5000,  wd:7000, bal:3000, wager:15000, payout:20000, isLoss:true,  prevU:0,   prevB:-500 },
      { dep:6000,  wd:6000, bal:800,  wager:8000,  payout:8800,  isLoss:true,  prevU:600, prevB:-200 },
      { dep:4000,  wd:4000, bal:0,    wager:5000,  payout:5000,  isLoss:false, prevU:0,   prevB:0    },
    ];
    fin = tpl.map(t => ({ dep:r(t.dep), wd:r(t.wd), bal:r(t.bal), wager:r(t.wager), payout:r(t.payout), isLoss:t.isLoss, prevU:r(t.prevU), prevB:r(t.prevB) }));
  }

  return fin.map((f, i) => {
    const deposit = f.dep, withdraw = f.wd, balanceV = f.bal, wagerV = f.wager, payout = f.payout;
    const ggr = (wagerV - payout) * (f.isLoss ? -1 : 1);
    const prevUnsettled = f.prevU || 0;
    const prevBase = f.prevB || 0;
    const baseRaw = prevUnsettled + prevBase + (deposit - withdraw - balanceV);
    const base = Math.max(0, baseRaw);
    const estCom = Math.max(0, deposit - withdraw - balanceV);
    const settledCom = Math.round(base * rate / 100);
    return {
      id: ids[i], agentId, code: codes[i], vip: 1,
      registered: fixedReg[i] || fixedReg[0],
      deposit, withdraw, wager: wagerV, payout, ggr,
      balance: balanceV, rate, estCom, base, baseRaw,
      prevUnsettled, prevBase, settledCom, commission: settledCom,
      isLoss: f.isLoss,
    };
  });
}

// —— 聚合佣金计算 v3.2.64 严格按 CLAUDE.md 4-step 公式:
//   先汇总「本期所有玩家」总合行为,再整体校验平台盈亏,而非「逐户 clamp 后求和」。
//   亏损玩家的负基数会冲抵盈利玩家 → 平台净额视角。
//   STEP-1-1 总本期变动佣金基数 = (总上期期末余额) + (总本期充值 − 总本期提现 − 总本期期末余额)
//   STEP-1-2 总本期结算佣金基数 = 总本期变动佣金基数 + (总上期结算佣金基数)
//   STEP-2   结算佣金基数 ≤ 0 → 平台亏损/持平,佣金 = 0
//   STEP-3   结算佣金基数 > 0 → 佣金 = 结算佣金基数 × 分润比例
function aggregateCommission(players) {
  const rate = (players[0] && players[0].rate) || 5;
  const s = (k) => players.reduce((a, p) => a + (p[k] || 0), 0);
  const changeBase = s('prevUnsettled') + (s('deposit') - s('withdraw') - s('balance')); // STEP-1-1
  const settleBase = changeBase + s('prevBase');                                          // STEP-1-2
  const commission = settleBase > 0 ? Math.round(settleBase * rate / 100) : 0;            // STEP-2/3
  return { rate, changeBase, settleBase, commission };
}

// —— 期次列表(已结算) v3.1.46 按结算周期拆分为 周 / 月 两套
// v3.2.26 weekly 扩充到 5 期,并为每期附「结算单」元数据(cpa/adj/提款状态),
//         供「我的结算单」生成与本报表一一对应的结算单(同期号 / 同分润金额)
function buildSettledPeriodList(cycleType) {
  if (cycleType === 'monthly') {
    return [
      { week:'M2605', start:'2026/5/1 00:00:00',  end:'2026/5/31 23:59:59', seed: 25, cpa: 14000, adj: 0,    wdStatus:'withdrawable', planKey:'revenue:RV-002' },
      { week:'M2604', start:'2026/4/1 00:00:00',  end:'2026/4/30 23:59:59', seed: 24, cpa: 12500, adj: -800, wdStatus:'paid', planKey:'revenue:RV-003' },
    ];
  }
  // v3.7.33 已结算分润 期数与「佣金结算单」(data-billing.js RICH_PERIODS)完全对齐 — 同 12 期、同期号、同周期、同提款状态
  return [
    { week:'W26064', start:'2026/6/22 00:00:00', end:'2026/6/28 23:59:59', seed: 31, cpa: 2100, adj: 0,    wdStatus:'withdrawable', planKey:'revenue:RV-001' },
    { week:'W26063', start:'2026/6/15 00:00:00', end:'2026/6/21 23:59:59', seed: 30, cpa: 0,    adj: 0,    wdStatus:'carried',      planKey:'revenue:RV-001' },
    { week:'W26062', start:'2026/6/8 00:00:00',  end:'2026/6/14 23:59:59', seed: 29, cpa: 2700, adj: 0,    wdStatus:'reviewing',    planKey:'revenue:RV-002' },
    { week:'W26061', start:'2026/6/1 00:00:00',  end:'2026/6/7 23:59:59',  seed: 28, cpa: 1550, adj: 0,    wdStatus:'rejected',     planKey:'revenue:RV-002' },
    { week:'W26054', start:'2026/5/25 00:00:00', end:'2026/5/31 23:59:59', seed: 2,  cpa: 3600, adj: 0,    wdStatus:'auditing',     planKey:'revenue:RV-001' },
    { week:'W26053', start:'2026/5/18 00:00:00', end:'2026/5/24 23:59:59', seed: 1,  cpa: 1450, adj: -150, wdStatus:'fsRejected',   planKey:'revenue:RV-002' },
    { week:'W26052', start:'2026/5/11 00:00:00', end:'2026/5/17 23:59:59', seed: 5,  cpa: 2300, adj: 200,  wdStatus:'fsCarried',    planKey:'revenue:RV-003' },
    { week:'W26051', start:'2026/5/4 00:00:00',  end:'2026/5/10 23:59:59', seed: 8,  cpa: 4050, adj: 0,    wdStatus:'paying',       planKey:'revenue:RV-002' },
    { week:'W26044', start:'2026/4/27 00:00:00', end:'2026/5/3 23:59:59',  seed: 11, cpa: 1850, adj: 0,    wdStatus:'payFailed',    planKey:'revenue:RV-001' },
    { week:'W26043', start:'2026/4/20 00:00:00', end:'2026/4/26 23:59:59', seed: 7,  cpa: 2975, adj: 0,    wdStatus:'paid',         planKey:'revenue:RV-002' },
    { week:'W26042', start:'2026/4/13 00:00:00', end:'2026/4/19 23:59:59', seed: 6,  cpa: 2175, adj: 0,    wdStatus:'paid',         planKey:'revenue:RV-002' },
    { week:'W26041', start:'2026/4/6 00:00:00',  end:'2026/4/12 23:59:59', seed: 4,  cpa: 3400, adj: 0,    wdStatus:'paid',         planKey:'revenue:RV-003' },
  ];
}

// v3.2.26 共享:返回每个「已结算」期次 + 该期结算后的分润佣金合计 + 结算单元数据。
//   「我的结算单」据此生成与本报表完全对应的结算单(同期号、RevShare = 本报表该期总佣金)。
window.getSettledRevsharePeriods = function (agentId, cycleType = 'weekly') {
  return buildSettledPeriodList(cycleType).map(p => {
    const players = buildPeriodPlayers(agentId, p.seed);
    // v3.2.64 该期「总佣金」改为 4-step 聚合公式(先汇总再整体 clamp×rate),与分润报表上方总计一致
    const commission = aggregateCommission(players).commission;
    return {
      ...p,
      commission,                 // 本报表该期「总佣金」(已结算分润)
      playerCount: players.length,
      endTs: new Date(String(p.end).replace(/-/g, '/')).getTime(),
    };
  });
};
// v3.1.92 隐藏日期后面的时间 — '2026/6/1 00:00:00' → '2026/6/1'
const _stripTime = (s) => String(s || '').replace(/\s+\d{1,2}:\d{2}(:\d{2})?\s*$/, '');

const MR_ESTIMATE_INFO = {
  weekly:  { week: 'W26071', period: '2026/6/29 00:00:00 - 2026/7/5 23:59:59',  seed: 3  },
  monthly: { week: 'M2606',  period: '2026/6/1 00:00:00 - 2026/6/30 23:59:59', seed: 26 },
};

function MyRevshareModule() {
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const [lang] = window.useAgentLang();   // v3.2.66 说明弹窗双语 — 订阅语言切换触发重渲染
  const EN = lang === 'en';

  // v3.1.45 结算周期 segmented (每周 / 每月)
  const [cycleType, setCycleType] = React.useState('weekly');

  // 3 个 tab
  const [tab, setTab] = React.useState('estimate'); // estimate | settled | rule

  // 工具栏筛选(两期共用) — v3.2.8 移除「全部用户状态」筛选(用户状态列已删)
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  // v3.2.66 「分润方案」弹窗 — 展示该期适用的分润模式内容(只读)
  const [planOpen, setPlanOpen] = React.useState(false);

  // 已结算期 选中哪一期 — 随 cycleType 重算
  const settledList = React.useMemo(() => buildSettledPeriodList(cycleType), [cycleType]);
  const [selectedWeek, setSelectedWeek] = React.useState(settledList[0].week);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  // 切换 周/月 后,如果选中期不在新列表中,重置为新列表首期
  React.useEffect(() => {
    if (!settledList.find(p => p.week === selectedWeek)) {
      setSelectedWeek(settledList[0].week);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleType]);

  const selectedPeriod = settledList.find(p => p.week === selectedWeek) || settledList[0];
  const estimateInfo = MR_ESTIMATE_INFO[cycleType];

  // 关闭下拉:外部点击
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // 当前期数据 — 随 cycleType 重算(不同 seed 产生不同范例)
  const estimatePlayers = React.useMemo(() => buildPeriodPlayers(me.id, estimateInfo.seed), [me.id, estimateInfo.seed]);
  const settledPlayers  = React.useMemo(() => buildPeriodPlayers(me.id, selectedPeriod.seed), [me.id, selectedPeriod.seed]);
  const players = tab === 'estimate' ? estimatePlayers : settledPlayers;

  const filtered = players.filter(p => {
    if (q && !(p.id + p.code).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  // v3.6.3 真分页:切片当前页 + 页码越界自动回退(修正原「第 1/1 页」写死)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // KPI 合计(按当前期所有玩家算)
  const sum = (arr, k) => arr.reduce((a,p)=>a+(p[k]||0),0);
  const totalPlayers   = players.length;
  const totalDep       = sum(players,'deposit');
  const totalWd        = sum(players,'withdraw');
  const totalGap       = totalDep - totalWd;
  const totalBalance   = sum(players,'balance');
  const totalWager     = sum(players,'wager');
  const totalPayout    = sum(players,'payout');
  const totalGgr       = sum(players,'ggr');
  // 上方「總預估佣金 / 總佣金」按 4-step 聚合公式(先汇总全期所有玩家行为,再整体校验盈亏×分润比例),
  // 而非「逐户 clamp 后求和」—亏损玩家会冲抵盈利玩家。不受下方搜索影响。
  const totalCommission = aggregateCommission(players).commission;

  const money = (n) => (n < 0 ? '-₹' : '₹') + F.money(Math.abs(n||0));
  const fmtGap = (n) => (n>=0?'+':'-') + '₹' + F.money(Math.abs(n||0));

  // 重置筛选(切 tab 时)
  const switchTab = (k) => { setTab(k); setPage(1); };

  return (
    <div className="page">
      <MRUI.PageHead
        title={MR_T('page.my_revshare.title','分润报表')}
        subtitle={MR_T('page.my_revshare.sub','查看本期预估分润与历史结算')}
      >
        <MRUI.FormulaHelp
          buttonLabel={EN ? 'Help' : '说明'}
          title={EN ? 'Revenue Share Report' : '分润报表说明'}
          subtitle={EN ? 'Field calc · plan settlement & change rules' : '字段计算 · 分润方案结算与变更规则'}
          tabs={[
            { key: 'fields', label: EN ? 'Fields' : '字段计算', sections: EN ? [
            { heading: 'Search scope', desc: 'Keyed by period + player. Searching "Player UID / Invite Code" only filters the list below — it does NOT affect the top totals, which always reflect the full current period.', items: [
              { name: 'Cycle / period', note: 'Weekly / monthly + period no.; switching period changes both totals and list' },
              { name: 'Player UID / Invite Code', note: 'Filters the list below only; top totals unaffected' },
            ] },
            { heading: 'Top-total field formulas', desc: 'All items below aggregate every player in the current period (unaffected by UID/Code search).', items: [
              { name: 'Total players', formula: '= row count of all players in the period' },
              { name: 'Total deposit', formula: '= Σ each player deposit' },
              { name: 'Total withdrawal', formula: '= Σ each player withdrawal' },
              { name: 'Net deposit', formula: '= total deposit − total withdrawal' },
              { name: 'Est. / Total commission', formula: 'max(0, total settlement base) × share rate', note: 'Key: aggregate ALL players first, then check profit/loss once — NOT per-player then summed. Losing players offset winning ones (platform-net view).' },
            ] },
            { heading: 'Commission steps (4-step aggregate)', desc: 'Both Est. commission (current period) and Total commission (settled) follow these steps; they differ only in whether current or historical data is used.', items: [
              { name: 'STEP 1-1', formula: 'Total change base = total prev ending balance + (total deposit − total withdrawal − total ending balance)' },
              { name: 'STEP 1-2', formula: 'Total settlement base = total change base + total prev settlement base' },
              { name: 'STEP 2', formula: 'settlement base ≤ 0 → platform loss/break-even, commission = 0' },
              { name: 'STEP 3', formula: 'settlement base > 0 → commission = settlement base × share rate' },
              { name: 'STEP 4', note: 'Carry to next period: total ending balance; total settlement base (carry the negative as-is, carry 0 if positive)' },
            ] },
          ] : [
            { heading: '搜索范围', desc: '以「期 + 玩家」为主维度。搜索「玩家UID / 邀请Code」只过滤下方列表,不影响上方总计 — 上方总计始终为当前期全量数据。', items: [
              { name: '结算周期 / 期选择', note: '每周结算 / 每月结算 + 期编号;切换期时上方总计与列表一起变化' },
              { name: '玩家UID / 邀请Code', note: '仅过滤下方列表,上方总计不受影响' },
            ] },
            { heading: '上方总计字段公式', desc: '以下各项均对「当前期」全量玩家汇总(不受玩家UID/Code 搜索影响)。', items: [
              { name: '玩家总数', formula: '= 当前期全量玩家行数' },
              { name: '总充值金额', formula: '= Σ 各玩家充值金额' },
              { name: '总提款金额', formula: '= Σ 各玩家提款金额' },
              { name: '充提差', formula: '= 总充值金额 − 总提款金额' },
              { name: '總預估佣金 / 總佣金', formula: 'max(0, 总结算佣金基数) × 分润比例', note: '关键:先汇总全期所有玩家行为再整体校验盈亏,非逐户计算后求和 —— 亏损玩家的负基数会冲抵盈利玩家(平台净额视角)' },
            ] },
            { heading: '佣金计算步骤(4-step 聚合)', desc: '總預估佣金(本期预估)与 總佣金(已结算)均按此步骤计算,差别只在取「本期」或「历史期」数据。', items: [
              { name: 'STEP 1-1', formula: '总变动佣金基数 = 总上期期末余额 + (总本期充值 − 总本期提现 − 总本期期末余额)' },
              { name: 'STEP 1-2', formula: '总结算佣金基数 = 总变动佣金基数 + 总上期结算佣金基数' },
              { name: 'STEP 2', formula: '总结算佣金基数 ≤ 0 → 平台亏损/持平,佣金 = 0' },
              { name: 'STEP 3', formula: '总结算佣金基数 > 0 → 佣金 = 总结算佣金基数 × 分润比例' },
              { name: 'STEP 4', note: '带入下期:总本期期末余额;总结算佣金基数(负值原样带入、正值带入 0)' },
            ] },
          ] },
            { key: 'plan', label: EN ? 'Plan' : '分润方案', sections: window.buildRevsharePlanRules(EN) },
          ]} />
      </MRUI.PageHead>

      {/* v3.2.63 暂时隐藏「每周/每月结算」切换钮,报表仅显示每周结算(cycleType 固定 weekly);
          需恢复时取消下方注释即可 */}
      {false && (
      <div className="mr-cycle-seg" style={{ display: 'flex', gap: 0, marginBottom: 14, border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: 'var(--bg-2)', width: 'fit-content' }}>
        {[
          { k: 'weekly',  l: MR_T('mr.cycle.weekly','每周结算') },
          { k: 'monthly', l: MR_T('mr.cycle.monthly','每月结算') },
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
      )}

      {/* 3 个 tab */}
      <div className="card" style={{padding:0,overflow:'visible'}}>
        <MRUI.Tabs value={tab} onChange={switchTab} tabs={[
          {key:'estimate', label: MR_T('mr.tab.estimate','本期预估分润')},
          {key:'settled',  label: MR_T('mr.tab.settled','已结算分润')},
        ]}/>

        {/* —— 信息条 v3.1.50 与商户后台样式统一(灰色外层 + 白底内层) —— */}
        {tab === 'estimate' && (
          <div className="mr-info-outer" style={{
            padding:'14px 18px',
            background:'var(--bg-2)',
            borderTop:'1px solid var(--line)',
            borderBottom:'1px solid var(--line)',
          }}>
            <div className="mr-info-inner" style={{
              padding:'14px 18px',
              background:'#fff',
              border:'1px solid var(--line)', borderRadius:8,
              boxShadow:'0 1px 2px rgba(15,23,42,0.04)',
              display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,fontSize:12.5,
            }}>
              {/* v3.1.92 期号 + 状态 一行；周期 另起一行；周期隐藏时间
                  v3.1.97 加 flexWrap 让手机窄屏下「狀態」自动换行,不会被截断 */}
              <div style={{display:'flex',alignItems:'center',gap:32,flexWrap:'wrap',rowGap:8}}>
                <InfoCell l={MR_T('mr.info.week','期號')} v={estimateInfo.week}/>
                <InfoCell l={MR_T('mr.info.status','結算狀態')} v={<span style={{color:'#f59e0b',fontWeight:600}}>{MR_T('mr.info.unsettled','未結算預估分潤')}</span>}/>
              </div>
              <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(estimateInfo.period.split(' - ')[0])} - {_stripTime(estimateInfo.period.split(' - ')[1])}</span>}/>
            </div>
          </div>
        )}

        {tab === 'settled' && (
          <div className="mr-info-outer" style={{
            padding:'14px 18px',
            background:'var(--bg-2)',
            borderTop:'1px solid var(--line)',
            borderBottom:'1px solid var(--line)',
            position:'relative',
          }} ref={pickerRef}>
            <div
              className="mr-settled-bar"
              onClick={()=>setPickerOpen(!pickerOpen)}
              style={{
                padding:'14px 18px',
                background: pickerOpen ? '#eff6ff' : '#fff',
                border:'1.5px solid ' + (pickerOpen ? 'var(--brand)' : '#93c5fd'),
                borderRadius:8,
                boxShadow: pickerOpen ? '0 0 0 3px rgba(59,130,246,0.12)' : '0 1px 3px rgba(59,130,246,0.08)',
                display:'flex',alignItems:'center',gap:18,fontSize:12.5,
                cursor:'pointer', userSelect:'none', transition:'all .15s',
              }}>
              {/* v3.1.92 期號 / 周期 拆为两行，周期隐藏时间 */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,flex:1,minWidth:0}}>
                <InfoCell l={MR_T('mr.info.week','期號')} v={selectedPeriod.week}/>
                <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(selectedPeriod.start)} - {_stripTime(selectedPeriod.end)}</span>}/>
              </div>
              <span className="mr-switch-btn" style={{
                display:'inline-flex',alignItems:'center',gap:6,
                padding:'6px 12px',borderRadius:6,
                background:'var(--brand)',color:'#fff',
                fontSize:12,fontWeight:600,flexShrink:0,
              }}>
                {MR_T('mr.info.switch','切換期號')}
                <Icon name="chevronDown" size={14} style={{transform:pickerOpen?'rotate(180deg)':'none',transition:'transform .15s'}}/>
              </span>
            </div>
            {pickerOpen && (
              <div className="mr-picker-pop" style={{
                position:'absolute', left:18, right:18, top:'calc(100% - 2px)',
                background:'#fff', border:'1px solid var(--line)', borderRadius:8,
                boxShadow:'0 8px 24px rgba(0,0,0,0.10)', zIndex:20,
                marginTop:4, maxHeight:320, overflowX:'hidden', overflowY:'auto'
              }}>
                {settledList.map(p => (
                  <div
                    key={p.week}
                    className="mr-picker-item"
                    onClick={()=>{setSelectedWeek(p.week);setPickerOpen(false);setPage(1);}}
                    style={{
                      padding:'10px 16px', cursor:'pointer', fontSize:12.5,
                      display:'flex',flexDirection:'column',alignItems:'flex-start',gap:6,
                      background:p.week===selectedWeek?'var(--bg-2)':'#fff',
                      borderBottom:'1px solid var(--line-soft)'
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background=p.week===selectedWeek?'var(--bg-2)':'#fff'}>
                    {/* v3.1.92 下拉项 期號 / 周期 也拆两行，周期只显示日期 */}
                    <InfoCell l={MR_T('mr.info.week','期號')} v={p.week}/>
                    <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(p.start)} - {_stripTime(p.end)}</span>}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* —— Tab 内容 —— */}
        {tab !== 'rule' && (
          <div style={{padding:'14px 18px 18px'}}>
            {/* v3.1.86 KPI:6 个 — 移除 总投注 / 总派彩 / GGR */}
            <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
              {[
                [MR_T('mr.kpi.players','玩家總數'),  F.fmtNum(totalPlayers)],
                [MR_T('mr.kpi.deposit','總充值金額'),    money(totalDep)],
                [MR_T('mr.kpi.withdraw','總提款金額'),   money(totalWd)],
                [MR_T('mr.kpi.gap','充提差'),            fmtGap(totalGap), totalGap>=0?'up':'down', 'green'],
                [tab === 'estimate'
                    ? MR_T('mr.kpi.balance_cur','總玩家當前餘額')
                    : MR_T('mr.kpi.balance_end','總玩家期末餘額'),
                  money(totalBalance)],
                [tab === 'estimate'
                    ? MR_T('mr.kpi.commission_est','總預估佣金')
                    : MR_T('mr.kpi.commission','總佣金'),
                  money(totalCommission), null, 'blue'],
              ].map(([l,v,delta,flag]) => (
                <div key={l} className="kpi" style={flag==='blue'?{
                  borderColor:'rgba(59,130,246,.35)', background:'rgba(59,130,246,.07)'
                }:flag==='green'?{
                  borderColor:'rgba(34,197,94,.35)', background:'rgba(34,197,94,.07)'
                }:undefined}>
                  <div className="label">{l}</div>
                  <div className="val" style={delta==='up'?{color:'var(--success)'}:delta==='down'?{color:'var(--danger)'}:flag==='blue'?{color:'var(--brand)'}:undefined}>{v}</div>
                </div>
              ))}
            </div>

            {/* v3.1.47 工具栏 + 表格 + 分页 用一层 card 包起来 */}
            <div style={{ border:'1px solid var(--line)', borderRadius:8, background:'#fff', padding:'14px 16px' }}>
            {/* 工具栏 — v3.2.8 移除「全部用户状态」筛选(列已删) */}
            <div className="toolbar" style={{padding:'0 0 12px'}}>
              <MRUI.SearchInput value={q} onChange={(v)=>{setQ(v);setPage(1);}} placeholder={MR_T('mr.filter.search_ph','玩家UID / 邀请Code')} width={220}/>
              <span style={{flex:1}}/>
              {/* v3.2.66 分潤方案 — 点击查看该期适用的分润模式内容 */}
              <button className="btn sm" onClick={() => setPlanOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="pie" size={13}/>{EN ? 'RevShare Plan' : '分潤方案'}
              </button>
            </div>

            {/* 表格 7 列 — v3.2.8 删除 上期期末余额 / 上期佣金基数 / 佣金基数 / 分润比例 / [预估佣金|结算佣金] / 用户状态 / 结算记录 */}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>{MR_T('mr.col.uid','玩家 UID')}</th>
                  <th>{MR_T('mr.col.source_code','邀请 Code')}</th>
                  <th>{MR_T('mr.col.registered','注册时间')}</th>
                  <th className="right">{MR_T('mr.col.deposit','充值金额')}</th>
                  <th className="right">{MR_T('mr.col.withdraw','提款金额')}</th>
                  <th className="right">{MR_T('mr.col.gap','充提差')}</th>
                  <th className="right" style={{color:'var(--brand)'}}>
                    {tab === 'estimate'
                      ? MR_T('mr.col.cur_balance','当前余额')
                      : MR_T('mr.col.end_balance','期末余额')}
                  </th>
                </tr></thead>
                <tbody>
                  {paged.map(p => {
                    const gap = (p.deposit||0) - (p.withdraw||0);
                    return (
                      <tr key={p.id}>
                        <td className="text-mono" style={{color:'var(--text-0)',fontSize:12,fontWeight:600}}>{p.id}</td>
                        <td className="text-mono" style={{color:'var(--brand)',fontSize:11.5}}>{p.code}</td>
                        <td className="text-mono" style={{color:'var(--text-2)',fontSize:11.5}}>{p.registered}</td>
                        <td className="right text-mono">{money(p.deposit)}</td>
                        <td className="right text-mono">{money(p.withdraw)}</td>
                        <td className="right text-mono" style={{color: gap>=0?'var(--success)':'var(--danger)'}}>{fmtGap(gap)}</td>
                        <td className="right text-mono">{money(p.balance)}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{MR_T('mr.empty','暂无数据')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <MRUI.Pagination page={safePage} pageSize={pageSize} total={filtered.length}
              onPage={setPage} onPageSize={(n)=>{setPageSize(n);setPage(1);}}/>
            </div>
          </div>
        )}

        {/* v3.1.86 删除「分润规则」tab —— 内容由商户后台「分润管理」配置统一展示 */}
      </div>

      {/* v3.2.8 已删除「结算记录」列 — SettlementHistoryModal 不再使用 */}

      {/* v3.2.66 该期分潤方案(只读)—— 读当前代理 _comm，kind 随结算周期 */}
      {(() => {
        const baseComm = (me && me._comm) || { kind: 'weekly', weekday: 1, monthday: 1, plans: ['revenue:RV-001'], minCommission: 200, maxCommission: 100000 };
        // 本期预估 → 用当前分潤方案(跟随商户修改实时更新);
        // 已结算 → 用该期结算时的快照方案(planKey)
        const planComm = (tab === 'settled' && selectedPeriod.planKey)
          ? { ...baseComm, kind: cycleType, plans: [selectedPeriod.planKey] }
          : { ...baseComm, kind: cycleType };
        const periodLabel = tab === 'estimate' ? estimateInfo.week : selectedPeriod.week;
        return (
          <window.RevsharePlanModal
            open={planOpen}
            onClose={() => setPlanOpen(false)}
            comm={planComm}
            periodLabel={periodLabel}
            cycleWeekly={cycleType === 'weekly'}
            EN={EN}
          />
        );
      })()}
    </div>
  );
}

// —— 信息条单元 ——
function InfoCell({l, v}) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
      <span style={{color:'var(--text-2)'}}>{l}:</span>
      <span style={{color:'var(--text-0)',fontWeight:500}}>{v}</span>
    </span>
  );
}

function RuleRow({l,v}) {
  return (
    <tr>
      <td style={{padding:'8px 0',color:'var(--text-3)',width:160,borderBottom:'1px solid var(--line-soft)'}}>{l}</td>
      <td style={{padding:'8px 0',color:'var(--text-1)',borderBottom:'1px solid var(--line-soft)'}}>{v}</td>
    </tr>
  );
}

window.MyRevshareModule = MyRevshareModule;
