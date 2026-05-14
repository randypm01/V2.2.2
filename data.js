// Fake data generators for APS-WS

const FIRST_NAMES = ['Alex','Mike','Sara','Lily','David','Tom','Anna','Chris','Emma','James','Liam','Noah','Olivia','Sophia','Ethan','Mia','Lucas','Ava','Mason','Zoe'];
const COUNTRIES = ['BR','MX','PH','VN','TH','ID','IN','JP','KR','CO','AR','PE','CL','MY','SG'];
const CURRENCIES = ['USDT','BRL','MXN','PHP','VND','THB','INR','USD','EUR'];
const CHANNELS = ['Telegram','WhatsApp','Facebook','Instagram','TikTok','YouTube','Twitter','Reddit','Email','SMS','Affiliate Network','Direct'];
const AGENT_LEVELS = ['Diamond','Platinum','Gold','Silver','Bronze'];
const AGENT_TYPES = ['Master','Direct','Sub-Affiliate','Influencer','Network'];
const MARKETS = ['LATAM','APAC','SEA','EU','Global'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return [...arr].sort(() => Math.random()-.5).slice(0,n); }
function id(prefix, n) { return prefix + String(n).padStart(6, '0'); }
function money(n) {
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}
function fmtNum(n) { return n == null ? '-' : new Intl.NumberFormat('en-US').format(Math.round(n)); }
function fmtMoney(n, cur='$') { return cur + new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }
function fmtPct(n, dp=1) { return (n*100).toFixed(dp) + '%'; }

// Seed for reproducibility
let _seed = 42;
function seedRand() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }
function srand(min, max) { return Math.floor(seedRand() * (max - min + 1)) + min; }
function spick(arr) { return arr[Math.floor(seedRand() * arr.length)]; }

// ---------- Agents ----------
function genAgents(n=80) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const created = Date.now() - srand(1, 720) * 86400000;
    const lastLogin = Date.now() - srand(0, 90) * 86400000;
    // 前 5 笔示例 status 固定(见下方);未启用(pending)的玩家数固定为 0
    // v2.4.12 顺序调整:AG×4 在前、AP 在最后(原本 AP 在首行)
    const fixedStatus = i < 5 ? ['pending','active','frozen','suspended','pending'][i] : null;
    const players = fixedStatus === 'pending' ? 0 : srand(0, 4500);
    const commission = srand(0, 250000);
    list.push({
      // v2.4.13 AG ID 起点改为 AG100001(原 AG100000),让首行(AG範例1)显示为 AG100001
      id: id('AG', 100001 + i),
      // 前 5 笔示例代理名称:AG範例1~4 在前、AP範例6 在最后
      name: i < 5
        ? (i === 4 ? 'AP範例6' : `AG範例${i + 1}`)
        : spick(FIRST_NAMES) + '_' + spick(['VIP','Pro','Elite','Network','Media','Group','Team','Studio']),
      type: spick(AGENT_TYPES),
      level: srand(1, 5),
      tier: spick(AGENT_LEVELS),
      parent: i > 5 ? id('AG', 100001 + srand(0, Math.min(i-1, 8))) : null,
      // 前 5 笔示例数据固定:依序 未启用/未启用/已启用/已冻结/已停用
      status: fixedStatus || spick(['active','active','active','active','frozen','suspended','pending']),
      country: spick(COUNTRIES),
      market: spick(MARKETS),
      currency: spick(CURRENCIES),
      created,
      lastLogin,
      players,
      activeCpa: Math.floor(players * (0.1 + seedRand() * 0.4)),
      commission,
      pendingCommission: srand(0, 50000),
      ngr: srand(5000, 800000),
      // 前 5 笔示例数据固定风险等级:依序 低/低/中/高/低 (AG×4 + AP範例6)
      risk: i < 5
        ? ['low','low','medium','high','low'][i]
        : spick(['low','low','low','medium','medium','high']),
      contact: spick(['telegram','whatsapp','email']) + ':@' + spick(FIRST_NAMES).toLowerCase() + srand(100,999),
    });
  }
  return list;
}

// ---------- Players ----------
function genPlayers(n=200) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const reg = Date.now() - srand(1, 365) * 86400000;
    const ftd = seedRand() > 0.3 ? reg + srand(0, 7) * 86400000 : null;
    const deposit = ftd ? srand(20, 5000) : 0;
    const wager = deposit * (1 + seedRand() * 8);
    const ngr = wager * (0.03 + seedRand() * 0.07);
    list.push({
      id: id('P', 800000 + i),
      agentId: id('AG', 100000 + srand(0, 79)),
      codeId: id('C', 7000 + srand(0, 49)),
      country: spick(COUNTRIES),
      currency: spick(CURRENCIES),
      registered: reg,
      ftd,
      ftdAmount: deposit,
      lastLogin: Date.now() - srand(0, 30) * 86400000,
      vip: srand(0, 7),
      deposit: deposit + (ftd ? srand(0, 8) * srand(50, 1500) : 0),
      withdraw: ftd ? srand(0, 3000) : 0,
      wager,
      ggr: ngr * 1.15,
      ngr,
      cpaStatus: spick(['approved','approved','pending','rejected','risk_hold']),
      risk: spick(['none','none','none','none','flagged','frozen']),
      status: spick(['active','active','active','active','frozen','blocked']),
    });
  }
  return list;
}

// ---------- Codes ----------
function genCodes(n=50) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const clicks = srand(50, 25000);
    const regs = Math.floor(clicks * (0.05 + seedRand() * 0.25));
    const ftds = Math.floor(regs * (0.2 + seedRand() * 0.5));
    const cpas = Math.floor(ftds * (0.5 + seedRand() * 0.4));
    list.push({
      id: id('C', 7000 + i),
      code: 'PROMO' + String(srand(1000,9999)),
      name: spick(['Summer Push','LATAM Q3','Telegram VIP','TikTok Influence','BR World Cup','PIX Boost','VN Newbie','TH Masters','PH Streamer','Retargeting Burst']),
      agent: id('AG', 100000 + srand(0, 79)),
      channel: spick(CHANNELS),
      campaign: 'CMP-' + srand(1000, 9999),
      market: spick(MARKETS),
      status: spick(['active','active','active','paused','expired']),
      created: Date.now() - srand(1, 180) * 86400000,
      expires: Date.now() + srand(-30, 180) * 86400000,
      clicks,
      regs,
      ftds,
      cpas,
      deposit: ftds * srand(80, 600),
      ngr: ftds * srand(40, 280),
      commission: cpas * srand(20, 80),
    });
  }
  return list;
}

// ---------- CPA records ----------
function genCpaRecords(n=120) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const status = spick(['approved','approved','approved','pending','pending','rejected','risk_hold']);
    list.push({
      id: id('CPA', 50000 + i),
      agentId: id('AG', 100000 + srand(0, 79)),
      playerId: id('P', 800000 + srand(0, 199)),
      ftdAmount: srand(20, 800),
      ftdAt: Date.now() - srand(1, 60) * 86400000,
      wager: srand(200, 8000),
      ngr: srand(50, 1500),
      cpaAmount: spick([20, 30, 40, 50, 75, 100, 150]),
      status,
      reason: status === 'rejected' ? spick(['同IP','同设备','低于最低首存','未达流水','NGR不足','提款过快','疑似套利']) : null,
      reviewedBy: status !== 'pending' ? spick(['admin','risk_team','auto']) : null,
      reviewedAt: status !== 'pending' ? Date.now() - srand(0, 30) * 86400000 : null,
      settled: status === 'approved' && seedRand() > 0.4,
    });
  }
  return list;
}

// ---------- Settlements ----------
function genSettlements(n=40) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const cpa = srand(500, 30000);
    const rev = srand(0, 50000);
    const sub = srand(0, 8000);
    const adj = srand(-2000, 1500);
    const risk = srand(0, 3000);
    const total = cpa + rev + sub + adj - risk;
    list.push({
      id: 'STM-2026-' + String(srand(10000, 99999)),
      agentId: id('AG', 100000 + srand(0, 79)),
      period: spick(['2026-W17','2026-W18','2026-W19','2026-04','2026-03']),
      cpa, rev, sub, adj, risk,
      tax: Math.floor(total * 0.05),
      total: total - Math.floor(total * 0.05),
      status: spick(['pending_audit','pending_audit','approved','paid','paid','rejected','recalculating']),
      generated: Date.now() - srand(0, 30) * 86400000,
    });
  }
  return list;
}

// ---------- CPA Schemes ----------
function genCpaSchemes() {
  return [
    { id: 'CPA-LATAM-V2', name: 'LATAM CPA $50', amount: 50, minFtd: 20, minWager: 5, minNgr: 30, status: 'active', applicableAgents: 24, market: 'LATAM', currency: 'USD' },
    { id: 'CPA-APAC-V3', name: 'APAC CPA $40', amount: 40, minFtd: 15, minWager: 6, minNgr: 25, status: 'active', applicableAgents: 18, market: 'APAC', currency: 'USD' },
    { id: 'CPA-VIP-V1', name: 'VIP CPA $150', amount: 150, minFtd: 200, minWager: 10, minNgr: 100, status: 'active', applicableAgents: 6, market: 'Global', currency: 'USD' },
    { id: 'CPA-BR-V4', name: 'BR PIX CPA R$200', amount: 40, minFtd: 50, minWager: 5, minNgr: 30, status: 'active', applicableAgents: 12, market: 'LATAM', currency: 'BRL' },
    { id: 'CPA-IN-V2', name: 'India UPI CPA ₹1500', amount: 18, minFtd: 10, minWager: 4, minNgr: 15, status: 'paused', applicableAgents: 8, market: 'APAC', currency: 'INR' },
    { id: 'CPA-PH-V1', name: 'PH Streamer Special', amount: 30, minFtd: 20, minWager: 5, minNgr: 25, status: 'draft', applicableAgents: 0, market: 'SEA', currency: 'PHP' },
  ];
}

// ---------- Risk players ----------
function genRiskPlayers(n=40) {
  const reasons = ['同IP多账号','同设备登录','支付方式异常','Bot行为','套利模式','异常流水','提款过快','FTD时段集中','人工标记'];
  const list = [];
  for (let i = 0; i < n; i++) {
    list.push({
      id: id('P', 800000 + srand(0, 199)),
      agentId: id('AG', 100000 + srand(0, 79)),
      codeId: id('C', 7000 + srand(0, 49)),
      reason: spick(reasons),
      level: spick(['low','medium','high','critical']),
      cpaCounted: seedRand() > 0.5,
      revShareCounted: seedRand() > 0.4,
      frozen: seedRand() > 0.5,
      status: spick(['pending','reviewing','confirmed','released']),
      flaggedAt: Date.now() - srand(0, 30) * 86400000,
    });
  }
  return list;
}

// ---------- Logs ----------
function genLogs(n=50) {
  const actions = [
    { t: 'create_agent', label: '创建代理', target: id('AG', 100000 + srand(0,79)) },
    { t: 'modify_commission', label: '修改分润方案', target: id('AG', 100000 + srand(0,79)) },
    { t: 'approve_cpa', label: '审核CPA', target: id('CPA', 50000 + srand(0,99)) },
    { t: 'approve_settlement', label: '审核结算单', target: 'STM-2026-' + srand(10000,99999) },
    { t: 'freeze_commission', label: '冻结佣金', target: id('AG', 100000 + srand(0,79)) },
    { t: 'approve_withdrawal', label: '审核提款', target: 'WD-' + srand(100000,999999) },
    { t: 'risk_action', label: '风控处理', target: id('P', 800000 + srand(0,199)) },
    { t: 'modify_agent', label: '修改代理资料', target: id('AG', 100000 + srand(0,79)) },
  ];
  const operators = ['admin','finance.amy','risk.tom','ops.lily','superadmin','audit.chris'];
  const list = [];
  for (let i = 0; i < n; i++) {
    const a = spick(actions);
    list.push({
      id: 'LOG-' + String(srand(100000, 999999)),
      action: a.t,
      label: a.label,
      target: a.target,
      operator: spick(operators),
      ip: `${srand(10,250)}.${srand(0,255)}.${srand(0,255)}.${srand(0,255)}`,
      device: spick(['MacOS · Chrome','Windows · Edge','iPad · Safari','iPhone · Safari']),
      at: Date.now() - srand(0, 30) * 86400000 - srand(0, 86400) * 1000,
      result: spick(['success','success','success','success','failed']),
    });
  }
  return list.sort((a,b)=>b.at-a.at);
}

// ---------- Risk alerts (dashboard) ----------
function genAlerts() {
  return [
    { type: 'danger', title: '代理 AG100023 异常CPA率 92%', meta: '近24小时CPA拒绝率超过阈值 · 23 条待复核', icon: 'warn' },
    { type: 'warning', title: '同IP风险：12 名玩家共享同一IP段', meta: '关联代理 AG100007 · 涉及佣金 $4,820', icon: 'warn' },
    { type: 'warning', title: '代理 AG100015 提款行为异常', meta: '7 名玩家FTD后24h内提款占比 86%', icon: 'warn' },
    { type: 'info', title: '佣金待审核累计 $128,400', meta: '17 张结算单待财务审核', icon: 'info' },
    { type: 'danger', title: '套利团队疑似命中', meta: '5 名玩家投注模式高度相似 · 已暂扣佣金 $2,150', icon: 'warn' },
    { type: 'info', title: '风控规则触发：低质量流量比例 18.3%', meta: '建议复查 Telegram 渠道近7日数据', icon: 'info' },
  ];
}

// ---------- Trend data ----------
function genTrend(days=30, base=10000, vol=0.3) {
  const data = [];
  let v = base;
  for (let i = 0; i < days; i++) {
    v = v * (1 + (seedRand() - 0.45) * vol);
    data.push({ x: i, y: Math.max(100, v) });
  }
  return data;
}

window.APS_DATA = {
  agents: genAgents(80),
  players: genPlayers(200),
  codes: genCodes(50),
  cpaRecords: genCpaRecords(120),
  cpaSchemes: genCpaSchemes(),
  settlements: genSettlements(40),
  riskPlayers: genRiskPlayers(40),
  logs: genLogs(80),
  alerts: genAlerts(),
  trend: {
    cpa: genTrend(30, 8000, 0.25),
    rev: genTrend(30, 12000, 0.2),
    hybrid: genTrend(30, 5000, 0.3),
    ngr: genTrend(30, 80000, 0.18),
  },
  CHANNELS, COUNTRIES, CURRENCIES, AGENT_TYPES, AGENT_LEVELS, MARKETS,
  LABELS: {
    types: { 'Master':'总代','Direct':'直营','Sub-Affiliate':'下级代理','Influencer':'网红','Network':'渠道联盟' },
    tiers: { 'Diamond':'钻石','Platinum':'白金','Gold':'金牌','Silver':'银牌','Bronze':'铜牌' },
    markets: { 'LATAM':'拉美','APAC':'亚太','SEA':'东南亚','EU':'欧洲','Global':'全球' },
    countries: { 'BR':'巴西','MX':'墨西哥','AR':'阿根廷','CO':'哥伦比亚','PE':'秘鲁','CL':'智利','IN':'印度','VN':'越南','TH':'泰国','PH':'菲律宾','ID':'印尼','MY':'马来西亚','JP':'日本','KR':'韩国','TR':'土耳其','EG':'埃及','NG':'尼日利亚','ZA':'南非' },
  },
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return m + ' 分钟前';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' 小时前';
  const d = Math.floor(h / 24);
  if (d < 30) return d + ' 天前';
  return new Date(ts).toLocaleDateString('zh-CN');
}

window.APS_FMT = { fmtNum, fmtMoney, fmtPct, money, timeAgo };
