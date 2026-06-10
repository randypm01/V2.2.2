// 商户后台 - 代理提款审核 P0-9
// v3.7.5 整页复制自「专业代理后台 → 提款审核进度」(my_withdraw_progress.jsx):同列表 / 同 3 阶段主抽屉 / 同 WR·FS·PO 查看弹窗。
//   说明:本文件所有顶层 helper(T / fmtDT / StatTxt / WRV_DocRow / WRV_WRCard ... )均为「本 babel script 文件作用域」私有,
//         与 my_withdraw_progress.jsx 的同名 helper 不冲突(各 script 独立作用域,仅 window.* 导出才共享)。
//   差异:模块函数名 + window 导出名改为 WithdrawReviewModule;其余逻辑暂与代理端一致(数据关联阶段再调整视角)。
const WPUI = window.UI;

// ===== i18n 注册(中 / 英)=====
(function () {
  const I = window.APS_I18N = window.APS_I18N || {};
  const ZH = I.zh = I.zh || {}, EN = I.en = I.en || {};
  const a = (k, zh, en) => { ZH[k] = zh; EN[k] = en; };
  // 状态
  a('wp.st.reviewing', '审核中', 'Reviewing');
  a('wp.st.rejected', '已拒绝', 'Rejected');
  a('wp.st.approved', '已通过', 'Approved');
  a('wp.st.auditing', '核算中', 'Auditing');
  a('wp.st.fsRejected', '已驳回', 'Rejected');
  a('wp.st.carried', '已转结', 'Carried Forward');
  a('wp.st.fsDone', '核算完成', 'Audited');
  a('wp.st.paying', '付款中', 'Paying');
  a('wp.st.payFailed', '付款失败', 'Pay Failed');
  a('wp.st.paid', '付款成功', 'Paid');
  // 页面
  a('wp.page.title', '提款审核进度', 'Withdrawal Progress');
  a('wp.page.sub', '查看提款申请进度', 'Track your withdrawal requests');
  a('wp.btn.guide', '说明', 'Guide');
  // 筛选分组
  a('wp.tab.all', '全部', 'All');
  a('wp.grp.apply', '提款申请状态', 'Application Status');
  a('wp.grp.fs', '财务核算状态', 'Finance Audit Status');
  a('wp.grp.po', '付款状态', 'Payment Status');
  // 表头
  a('wp.col.wrno', '提款单号', 'Withdrawal No.');
  a('wp.col.reqTime', '提款申请时间', 'Request Time');
  a('wp.col.csCount', '结算单数量', 'Settlements');
  a('wp.col.applyAmt', '申请金额', 'Request Amount');
  a('wp.col.applyStat', '申请状态', 'Application');
  a('wp.col.fsStat', '核算状态', 'Audit');
  a('wp.col.poStat', '付款状态', 'Payment');
  a('wp.col.carryAmt', '转结金额', 'Carried Amount');
  a('wp.col.payAmt', '付款金额', 'Paid Amount');
  a('wp.col.action', '操作', 'Action');
  a('wp.empty', '暂无提款申请记录', 'No withdrawal requests yet');
  a('wp.act.view', '查看', 'View');
  // 主抽屉
  a('wp.drawer.title', '提款审核进度', 'Withdrawal Progress');
  a('wp.drawer.sub', '查看本次提款的审核与付款进度', 'Review & payment progress for this withdrawal');
  a('wp.foot.q', '有问题?', 'Need help?');
  a('wp.foot.contact', '联络线上客服', 'Contact Live Support');
  a('wp.sec.progress', '审核进度', 'Progress');
  a('wp.sec.applyAmt', '提款申请金额', 'Request Amount');
  a('wp.sec.linkedCs', '关联佣金结算单', 'Linked Settlements');
  a('wp.view', '查看', 'View');
  a('wp.period', '期号', 'Period');
  // 阶段标题 / 单据名
  a('wp.phase.wr', '提款审核申请', 'Withdrawal Review');
  a('wp.phase.fs', '财务核算', 'Finance Audit');
  a('wp.phase.po', '付款单', 'Payment');
  a('wp.doc.wr', '提款申请单', 'Withdrawal Request');
  a('wp.doc.fs', '财务核算单', 'Finance Settlement');
  a('wp.doc.po', '付款单', 'Payment Order');
  // 阶段细项
  a('wp.sub.submitOk', '提交申请成功', 'Request submitted');
  a('wp.sub.reviewing', '审核中', 'Under review');
  a('wp.sub.rejected', '已拒绝', 'Rejected');
  a('wp.sub.approved', '已通过', 'Approved');
  a('wp.sub.reasonPfx', '原因:', 'Reason: ');
  a('wp.sub.auditing', '核算中', 'Auditing');
  a('wp.sub.fsRejected', '已驳回', 'Rejected');
  a('wp.sub.carried', '已转结', 'Carried forward');
  a('wp.sub.audited', '核算完成', 'Audited');
  a('wp.sub.paying', '付款中', 'Paying');
  a('wp.sub.payFailed', '付款失败', 'Payment failed');
  a('wp.sub.paid', '付款成功', 'Paid');
  // 结束提示
  a('wp.note.end', '本次提款已结束。', 'This withdrawal is closed. ');
  a('wp.note.carried', '本次财务核算金额已转结到下期财务调整。', 'This audited amount has been carried forward to next period’s adjustments.');
  a('wp.note.returned', '相关结算单已退回,可在「佣金结算单」重新申请提款。', 'The related settlements have been returned; you may re-apply from “Commission Settlements”.');
  // 单据副标题
  a('wp.docsub.wr', '查看本次提款申请的状态、收款资料与佣金来源', 'Status, payout details & commission source');
  a('wp.docsub.fs', '查看本次提款的财务核算明细与应付金额', 'Finance audit details & net payable');
  a('wp.docsub.po', '查看本次提款的付款结果与收款资料', 'Payment result & payout details');
  // 说明弹窗
  a('wp.help.title', '提款审核进度说明', 'About Withdrawal Progress');
  a('wp.help.sub', '一次提款的三段流转', 'The three stages of a withdrawal');
  a('wp.help.intro', '每发起一次提款,系统会按以下三个阶段依次流转,本页可实时跟踪每个阶段的状态:', 'Each withdrawal flows through the three stages below. Track each stage in real time on this page:');
  a('wp.help.1t', '提款审核申请(WR)', 'Withdrawal Request (WR)');
  a('wp.help.1d', '提交后由商户运营审核。状态:审核中 → 已通过 / 已拒绝。被拒绝则相关结算单退回「待提款」,可重新发起。', 'Reviewed by merchant operations after submission. Status: Reviewing → Approved / Rejected. If rejected, the related settlements return to “Withdrawable” and can be re-submitted.');
  a('wp.help.2t', '财务核算(FS)', 'Finance Settlement (FS)');
  a('wp.help.2d', '审核通过后进入财务核算,扣除行政费 / 税金 / 风控等后得出应付金额。状态:核算中 → 核算完成 / 已驳回 / 已转结(应付 ≤ 0 转结下期)。', 'After approval, finance audits and computes the net payable after admin fee / tax / risk deductions. Status: Auditing → Audited / Rejected / Carried Forward (net ≤ 0 carries to next period).');
  a('wp.help.3t', '付款单(PO)', 'Payment Order (PO)');
  a('wp.help.3d', '核算完成后出款。状态:付款中 → 付款成功 / 付款失败(失败将重新付款)。', 'Payment is made after audit. Status: Paying → Paid / Pay Failed (failed payments are retried).');
  // 单据字段
  a('wp.f.status', '状态', 'Status');
  a('wp.f.orderStatus', '订单状态', 'Order Status');
  a('wp.f.updateTime', '更新时间', 'Updated');
  a('wp.f.basic', '基本资料', 'Basic Info');
  a('wp.f.agentName', '代理名称', 'Agent Name');
  a('wp.f.agentId', '代理 ID', 'Agent ID');
  a('wp.f.wrNo', '提款申请单号', 'Withdrawal No.');
  a('wp.f.reqTime', '提款申请时间', 'Request Time');
  a('wp.f.reviewer', '提款审核人', 'Reviewed By');
  a('wp.f.payInfo', '收款资料', 'Payout Details');
  a('wp.f.method', '收款方式', 'Method');
  a('wp.f.applySource', '提款申请来源', 'Request Source');
  a('wp.f.totalAmt', '合计金额', 'Total');
  a('wp.f.fsNo', '财务单号', 'Finance No.');
  a('wp.f.fsTime', '财务单生成时间', 'FS Created');
  a('wp.f.auditor', '财务核算人', 'Audited By');
  a('wp.f.fsAdjust', '财务调整', 'Finance Adjustments');
  a('wp.f.adminFee', '行政费', 'Admin Fee');
  a('wp.f.tax', '税金', 'Tax');
  a('wp.f.violation', '违规扣款', 'Violation Deduction');
  a('wp.f.risk', '风控扣款', 'Risk Deduction');
  a('wp.f.manualAdd', '人工补款', 'Manual Credit');
  a('wp.f.manualSub', '人工调整', 'Manual Adjustment');
  a('wp.f.reserve', '保留款', 'Reserve');
  a('wp.f.subtotal', '小计', 'Subtotal');
  a('wp.f.auditResult', '核算结果', 'Audit Result');
  a('wp.f.totalApply', '总申请提款', 'Total Requested');
  a('wp.f.adjust', '财务调整', 'Finance Adjustment');
  a('wp.f.payable', '应付金额', 'Net Payable');
  a('wp.f.carryAmt', '转结金额', 'Carried Amount');
  a('wp.f.poNo', '付款单号', 'Payment No.');
  a('wp.f.poTime', '付款单生成时间', 'PO Created');
  a('wp.f.provider', '支付商', 'Payment Provider');
  a('wp.f.txid', '第三方订单号', 'Provider Txn ID');
  a('wp.f.payAmt', '付款金额', 'Paid Amount');
  // v3.7.41 测试演示用临时状态按钮(商户后台付款单弹窗)
  a('wp.test.hint', '测试演示用状态改变临时按钮', 'Demo-only temporary status toggle (test)');
  a('wp.test.fail', '付款失败', 'Pay Failed');
  a('wp.test.ok', '付款成功', 'Paid');
})();

// 商户后台「代理提款审核」永远中文 — 不跟随代理端语言切换(本文件是 my_withdraw_progress 的副本,
// 共用 window.APS_I18N 字典,但商户后台不应被代理后台的 useAgentLang 影响)。直接读 zh 字典。
const WRV_T = (k, fb) => {
  const zh = (window.APS_I18N && window.APS_I18N.zh) || {};
  return (k in zh) ? zh[k] : (fb != null ? fb : k);
};

const fmtDT = (t) => new Date(t).toLocaleString('zh-CN');
const STAT_TONE = { green: 'b-success', orange: 'b-warning', red: 'b-danger' };
function StatTxt({ meta }) {
  if (!meta) return <span style={{ color: 'var(--text-3)' }}>—</span>;
  return <span className={'badge ' + STAT_TONE[meta[1]]}>{meta[0]}</span>;
}

function WithdrawReviewModule() {
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const B = window.useBilling();
  const CUR = B.CUR;
  const Lwr = window.BILLING_LABELS.wr;
  const Lfs = window.BILLING_LABELS.fs;
  const Lpo = window.BILLING_LABELS.po;

  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');                // v3.7.6 商户端搜索:代理ID/代理名称/提款申请单号
  const [detail, setDetail] = React.useState(null);   // 选中的 WR(主抽屉)
  const [docView, setDocView] = React.useState(null);  // { type:'wr'|'fs'|'po', data }
  const [showHelp, setShowHelp] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // v3.7.9 商户审核动作:通过 / 拒绝 / 备注 + 佣金结算单弹窗
  const toast = WPUI.useToast();
  const ADMIN = 'admin';
  // v3.7.10 审核模板(提款申请单·已拒绝 / 财务核算单·已驳回 / 财务核算单·财务调整项)
  const [tpls, setTpls] = React.useState({
    wrReject: { tpl1: '收款资料与实名信息不一致,请核对后重新提交。', tpl2: '本次提款涉及风控复核,暂不通过,详情请联系运营。' },
    fsReject: { tpl1: '核算资料不齐,请补充后重新提交。', tpl2: '本次核算金额存在争议,暂予驳回。' },
    fsAdjust: ['行政费', '风控扣款'],
  });
  const [showTpl, setShowTpl] = React.useState(false);
  const [tplDraft, setTplDraft] = React.useState(null);
  const [delTpl, setDelTpl] = React.useState(null);
  const openTpl = () => { setTplDraft(JSON.parse(JSON.stringify(tpls))); setShowTpl(true); };
  const saveTpl = () => { setTpls(tplDraft); setShowTpl(false); toast('审核模板已保存'); };
  const [csView, setCsView] = React.useState(null);
  const [approveWR, setApproveWR] = React.useState(null);
  const [rejectWR, setRejectWR] = React.useState(null);
  const [rejectType, setRejectType] = React.useState('custom');
  const [rejectText, setRejectText] = React.useState('');
  const [noteTarget, setNoteTarget] = React.useState(null); // 当前备注的单据 id(WR 或 FS)
  const [noteDraft, setNoteDraft] = React.useState([]);
  // 备注进 store(B.getNote/setNote);首次播种一条示例备注到当前代理最新 WR
  React.useEffect(() => {
    if (B._seededNote) return;
    const ws = (B.wrOf(me.id) || []).slice().sort((a, b) => b.requestAt - a.requestAt);
    const first = ws[0];
    if (first && B.getNote(first.id).length === 0) {
      B.setNote(first.id, [{ by: 'admin', at: '2026/6/15 00:23:42', text: '提款讯息不全外,该代理邀请玩家部分有套利行为' }]);
    }
    B._seededNote = true;
  }, []);
  const nowStr = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); };
  const openNote = (id) => { const ex = (B.getNote(id) || []).map(n => ({ ...n })); setNoteDraft(ex.length ? ex : [{ by: ADMIN, text: '', at: null }]); setNoteTarget(id); };
  const saveNote = () => { if (!noteTarget) return; const clean = noteDraft.filter(n => (n.text || '').trim()).map(n => ({ by: n.by || ADMIN, text: n.text.trim(), at: n.at || nowStr() })); B.setNote(noteTarget, clean); setNoteTarget(null); toast('备注已保存'); };
  // —— 接 store 真流转 ——
  const doApprove = () => { const w = approveWR; B.approveWR(w.id); setApproveWR(null); setDocView(null); toast('已通过提款申请,已生成财务核算单', 'success'); };
  const doReject = () => { const w = rejectWR; B.rejectWR(w.id, rejectText); setRejectWR(null); setDocView(null); toast('已拒绝提款申请', 'success'); };
  // v3.7.14 财务核算单 审核动作
  const [approveFS, setApproveFS] = React.useState(null);
  const [carryFS, setCarryFS] = React.useState(null);
  const [rejectFS, setRejectFS] = React.useState(null);
  const [fsRejType, setFsRejType] = React.useState('custom');
  const [fsRejText, setFsRejText] = React.useState('');
  const [adjustFS, setAdjustFS] = React.useState(null);
  const [adjustDraft, setAdjustDraft] = React.useState([]);
  const deriveAdjustRows = (fs) => {
    const items = [];
    if (fs.adminFee > 0) items.push({ item: '行政费', amount: -fs.adminFee });
    if (fs.tax > 0) items.push({ item: '税金', amount: -fs.tax });
    if (fs.violationDeduct > 0) items.push({ item: '违规扣款', amount: -fs.violationDeduct });
    if (fs.riskDeduct > 0) items.push({ item: '风控扣款', amount: -fs.riskDeduct });
    if (fs.manualAdjust && fs.manualAdjust !== 0) items.push({ item: fs.manualAdjust > 0 ? '人工补款' : '人工调整', amount: fs.manualAdjust });
    if (fs.reserve > 0) items.push({ item: '保留款', amount: -fs.reserve });
    return items;
  };
  const fsPayableOf = (fs) => fs.payable; // store 即真值(财务调整已写回 fs)
  const tryApproveFS = (fs) => { if (fsPayableOf(fs) > 0) setApproveFS(fs); else toast('应付金额小于0,请转结下期', 'error'); };
  const tryCarryFS = (fs) => { if (fsPayableOf(fs) <= 0) setCarryFS(fs); else toast('应付金额大于0,请通过或驳回审核', 'error'); };
  const doApproveFS = () => { const fs = approveFS; B.finishAudit(fs.id); setApproveFS(null); setDocView(null); toast('已通过财务核算,付款中', 'success'); setTimeout(() => { B.pay(fs.id); toast('付款成功', 'success'); }, 4000); };
  const doCarryFS = () => { const fs = carryFS; B.finishAudit(fs.id); setCarryFS(null); setDocView(null); toast('已转结下期', 'success'); };
  const doRejectFS = () => { const fs = rejectFS; B.rejectFS(fs.id, fsRejText); setRejectFS(null); setDocView(null); toast('已驳回财务核算', 'success'); };
  const openAdjust = (fs) => {
    // 项目只能从「审核模板·财务调整项模板」选;预填优先读 store 已存的 _adjustItems,否则从 fs 固定字段派生(过滤非模板项)
    const saved = Array.isArray(fs._adjustItems) ? fs._adjustItems : null;
    const src = saved || deriveAdjustRows(fs).filter(it => tpls.fsAdjust.includes(it.item));
    const rows = src.length ? src.map(it => ({ item: it.item, amount: String(it.amount) })) : [{ item: '', amount: '' }];
    setAdjustDraft(rows); setAdjustFS(fs);
  };
  // 名称 → fs 扣款字段映射(calcPayable 用到的字段)
  const ADJ_FIELD = { '行政费': 'adminFee', '税金': 'tax', '违规扣款': 'violationDeduct', '风控扣款': 'riskDeduct', '保留款': 'reserve' };
  const saveAdjust = () => {
    const parsed = adjustDraft.filter(r => r.item && String(r.amount).trim() !== '' && !isNaN(Number(r.amount))).map(r => ({ item: r.item, amount: Number(r.amount) }));
    // 写回 store:先清零所有扣款字段,再按项累加(负数进扣款字段取绝对值,未知项/正数进人工调整)
    const patch = { adminFee: 0, tax: 0, violationDeduct: 0, riskDeduct: 0, reserve: 0, manualAdjust: 0, _adjustItems: parsed };
    parsed.forEach(({ item, amount }) => {
      const f = ADJ_FIELD[item];
      if (f && amount < 0) patch[f] += Math.abs(amount);
      else patch.manualAdjust += amount; // 正数扣款名 / 未知项 归入人工调整
    });
    B.updateFSDeduction(adjustFS.id, patch);
    setAdjustFS(null); toast('财务调整已保存');
  };

  const mine = B.wrOf(me.id).slice().sort((a, b) => b.requestAt - a.requestAt);

  const chainOf = (wr) => {
    const fs = wr && wr.fsId ? B.fsById(wr.fsId) : null;
    const po = fs && fs.poId ? B.poById(fs.poId) : null;
    return { fs, po };
  };

  // === 派生每条 WR 的三段状态:申请(apply)/ 核算(fsStat)/ 付款(poStat)===
  const derive = (w) => {
    const { fs, po } = chainOf(w);
    let apply;
    if (w.status === 'rejected' && !fs) apply = 'rejected';
    else if (fs || w.status === 'paid' || w.reviewAt) apply = 'approved';
    else apply = 'reviewing';

    let fsStat = null;
    if (apply === 'approved' && fs) {
      if (fs.status === 'pending' || fs.status === 'auditing') fsStat = 'auditing';
      else if (fs.status === 'rejected') fsStat = 'rejected';
      else if (fs.status === 'carried') fsStat = 'carried';
      else fsStat = 'done'; // paying / payFailed / paid
    }

    let poStat = null, payAmt = null;
    if (fsStat === 'done' && fs) {
      if (fs.status === 'paying') { poStat = 'paying'; payAmt = fs.payable; }
      else if (fs.status === 'payFailed') { poStat = 'failed'; payAmt = fs.payable; }
      else if (fs.status === 'paid') { poStat = 'paid'; payAmt = po ? po.amount : fs.payable; }
    }
    // 转结金额:财务核算应付 ≤ 0 转结下期时的金额(fs.carryOut)
    const carryAmt = (fs && fs.status === 'carried' && fs.carryOut > 0) ? fs.carryOut : null;
    return { w, fs, po, apply, fsStat, poStat, payAmt, carryAmt };
  };
  const rows = mine.map(derive);

  const cnt = (pred) => rows.filter(pred).length;
  const counts = {
    'all': rows.length,
    'apply:reviewing': cnt(r => r.apply === 'reviewing'),
    'apply:rejected': cnt(r => r.apply === 'rejected'),
    'apply:approved': cnt(r => r.apply === 'approved'),
    'fs:auditing': cnt(r => r.fsStat === 'auditing'),
    'fs:rejected': cnt(r => r.fsStat === 'rejected'),
    'fs:carried': cnt(r => r.fsStat === 'carried'),
    'fs:done': cnt(r => r.fsStat === 'done'),
    'po:paying': cnt(r => r.poStat === 'paying'),
    'po:failed': cnt(r => r.poStat === 'failed'),
    'po:paid': cnt(r => r.poStat === 'paid'),
  };

  const ALL_TAB = { k: 'all', l: WRV_T('wp.tab.all') };
  const TAB_GROUPS = [
    { label: WRV_T('wp.grp.apply'), tabs: [
      { k: 'apply:reviewing', l: WRV_T('wp.st.reviewing') },
      { k: 'apply:rejected', l: WRV_T('wp.st.rejected') },
      { k: 'apply:approved', l: WRV_T('wp.st.approved') },
    ] },
    { label: WRV_T('wp.grp.fs'), tabs: [
      { k: 'fs:auditing', l: WRV_T('wp.st.auditing') },
      { k: 'fs:rejected', l: WRV_T('wp.st.fsRejected') },
      { k: 'fs:carried', l: WRV_T('wp.st.carried') },
      { k: 'fs:done', l: WRV_T('wp.st.fsDone') },
    ] },
    { label: WRV_T('wp.grp.po'), tabs: [
      { k: 'po:paying', l: WRV_T('wp.st.paying') },
      { k: 'po:failed', l: WRV_T('wp.st.payFailed') },
      { k: 'po:paid', l: WRV_T('wp.st.paid') },
    ] },
  ];

  const match = (r) => {
    if (filter === 'all') return true;
    const [g, v] = filter.split(':');
    if (g === 'apply') return r.apply === v;
    if (g === 'fs') return r.fsStat === v;
    if (g === 'po') return r.poStat === v;
    return true;
  };
  let list = rows.filter(match);
  // v3.7.6 商户端搜索(代理ID / 代理名称 / 提款申请单号)
  if (q.trim()) {
    const k = q.trim().toLowerCase();
    list = list.filter(r => (r.w.agentId || '').toLowerCase().includes(k) || (r.w.agentName || '').toLowerCase().includes(k) || (r.w.id || '').toLowerCase().includes(k));
  }
  // v3.6.35 表头排序:提款申请时间(requestAt)
  const sorter = window.useTableSort();
  const sorted = sorter.apply(list, { reqTime: (r) => r.w.requestAt || 0 });
  // v3.6.3 列表分页 + 显示条数/页大小切换
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pickFilter = (k) => { setFilter(k); setPage(1); };

  const applyMeta = { reviewing: [WRV_T('wp.st.reviewing'), 'orange'], rejected: [WRV_T('wp.st.rejected'), 'red'], approved: [WRV_T('wp.st.approved'), 'green'] };
  const fsMeta = { auditing: [WRV_T('wp.st.auditing'), 'orange'], rejected: [WRV_T('wp.st.fsRejected'), 'red'], carried: [WRV_T('wp.st.carried'), 'red'], done: [WRV_T('wp.st.fsDone'), 'green'] };
  const poMeta = { paying: [WRV_T('wp.st.paying'), 'orange'], failed: [WRV_T('wp.st.payFailed'), 'red'], paid: [WRV_T('wp.st.paid'), 'green'] };

  // === 构建 3 阶段嵌套结构(主抽屉时间轴)===
  const buildPhases = (wr) => {
    const { fs, po } = chainOf(wr);
    const phases = [];

    // 阶段一:提款审核申请(WR)
    const p1 = { key: 'wr', title: WRV_T('wp.phase.wr'), docLabel: WRV_T('wp.doc.wr'), doc: { type: 'wr', data: wr }, subs: [] };
    p1.subs.push({ state: 'done', text: WRV_T('wp.sub.submitOk'), time: wr.requestAt });
    if (wr.status === 'rejected' && !fs) {
      p1.state = 'reject';
      p1.subs.push({ state: 'done', text: WRV_T('wp.sub.reviewing') });
      p1.subs.push({ state: 'reject', text: WRV_T('wp.sub.rejected'), time: wr.reviewAt });
      const rr = wr.rejectReason;
      if (rr) p1.subs.push({ state: 'reason', text: WRV_T('wp.sub.reasonPfx') + rr });
      p1.note = 'returned';
    } else if (fs || wr.reviewAt) {
      p1.state = 'done';
      p1.subs.push({ state: 'done', text: WRV_T('wp.sub.reviewing') });
      p1.subs.push({ state: 'done', text: WRV_T('wp.sub.approved'), time: wr.reviewAt });
    } else {
      p1.state = 'active';
      p1.subs.push({ state: 'active', text: WRV_T('wp.sub.reviewing') });
    }
    phases.push(p1);

    // 阶段二:财务核算(FS)
    const p2 = { key: 'fs', title: WRV_T('wp.phase.fs'), docLabel: WRV_T('wp.doc.fs'), doc: { type: 'fs', data: fs }, subs: [] };
    if (!fs) {
      p2.state = wr.status === 'rejected' ? 'skip' : 'wait';
    } else if (fs.status === 'pending' || fs.status === 'auditing') {
      p2.state = 'active'; p2.subs.push({ state: 'active', text: WRV_T('wp.sub.auditing'), time: fs.auditAt });
    } else if (fs.status === 'rejected') {
      p2.state = 'reject';
      p2.subs.push({ state: 'done', text: WRV_T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'reject', text: WRV_T('wp.sub.fsRejected'), time: fs.statusAt });
      if (fs.rejectReason) p2.subs.push({ state: 'reason', text: WRV_T('wp.sub.reasonPfx') + fs.rejectReason });
      p2.note = 'returned';
    } else if (fs.status === 'carried') {
      p2.state = 'warn';
      p2.subs.push({ state: 'done', text: WRV_T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'warn', text: WRV_T('wp.sub.carried'), time: fs.statusAt });
      p2.note = 'carried';
    } else { // paying / payFailed / paid
      p2.state = 'done';
      p2.subs.push({ state: 'done', text: WRV_T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'done', text: WRV_T('wp.sub.audited'), time: fs.statusAt });
    }
    phases.push(p2);

    // 阶段三:付款单(PO)
    // 付款中 / 付款失败 尚未生成正式 PO,派生一张供查看(财务核算完成后即可看付款单)
    let poDoc = po;
    if (!poDoc && fs && (fs.status === 'paying' || fs.status === 'payFailed')) {
      poDoc = {
        id: fs.id.replace(/^FS/, 'PO'),
        fsId: fs.id, wrId: wr.id,
        agentId: fs.agentId, agentName: fs.agentName,
        amount: fs.payable,
        method: fs.method, account: fs.account,
        txid: 'TX' + fs.id.replace(/\D/g, '').slice(-12),
        paidAt: fs.statusAt,
        status: fs.status === 'payFailed' ? 'failed' : 'paying',
        _synthetic: true,
      };
    }
    const p3 = { key: 'po', title: WRV_T('wp.phase.po'), docLabel: WRV_T('wp.doc.po'), doc: { type: 'po', data: poDoc }, subs: [] };
    if (!fs || fs.status === 'pending' || fs.status === 'auditing') {
      p3.state = 'wait';
    } else if (fs.status === 'rejected' || fs.status === 'carried') {
      p3.state = 'skip';
    } else if (fs.status === 'paying') {
      p3.state = 'active'; p3.subs.push({ state: 'active', text: WRV_T('wp.sub.paying'), time: fs.statusAt });
    } else if (fs.status === 'payFailed') {
      p3.state = 'reject';
      p3.subs.push({ state: 'done', text: WRV_T('wp.sub.paying'), time: fs.statusAt });
      p3.subs.push({ state: 'reject', text: WRV_T('wp.sub.payFailed') });
      p3.note = 'returned';
    } else if (po) {
      p3.state = 'done';
      p3.subs.push({ state: 'done', text: WRV_T('wp.sub.paying'), time: fs.statusAt });
      p3.subs.push({ state: 'done', text: WRV_T('wp.sub.paid'), time: po.paidAt });
    } else {
      p3.state = 'wait';
    }
    phases.push(p3);

    return phases;
  };

  const dash = <span style={{ color: 'var(--text-3)' }}>—</span>;
  const noteText = (note) => WRV_T('wp.note.end') + (note === 'carried' ? WRV_T('wp.note.carried') : WRV_T('wp.note.returned'));

  return (
    <div className="page">
      <WPUI.PageHead title="代理提款审核" subtitle="代理申请提款审核及财务核算出款">
        <button className="btn" onClick={() => setShowHelp(true)}><Icon name="info" size={13} />{WRV_T('wp.btn.guide')}</button>
        <button className="btn primary" onClick={openTpl}><Icon name="file" size={13} />审核模板</button>
      </WPUI.PageHead>

      <div className="card">
        {/* 分组状态筛选:全部 | 提款申请 | 财务核算 | 付款 */}
        <div className="wp-filter">
          <div className="wp-fgroup">
            <span className="wp-flabel">&nbsp;</span>
            <div className="wp-ftabs">
              <button className={'wp-ftab' + (filter === ALL_TAB.k ? ' on' : '')} onClick={() => pickFilter(ALL_TAB.k)}>
                {ALL_TAB.l}<span className="wp-fcount">{counts[ALL_TAB.k]}</span>
              </button>
            </div>
          </div>
          {TAB_GROUPS.map(grp => (
            <div key={grp.label} className="wp-fgroup">
              <span className="wp-flabel">{grp.label}</span>
              <div className="wp-ftabs">
                {grp.tabs.map(t => {
                  const on = filter === t.k;
                  return (
                    <button key={t.k} className={'wp-ftab' + (on ? ' on' : '')} onClick={() => pickFilter(t.k)}>
                      {t.l}<span className="wp-fcount">{counts[t.k]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* v3.7.6 搜索行(商户专属):代理ID / 代理名称 / 提款申请单号 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="top-search" style={{ width: 300 }}>
            <Icon name="search" size={13} />
            <input placeholder="代理ID / 代理名称 / 提款申请单号" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>代理ID</th><th>代理名称</th>
              <th>{WRV_T('wp.col.wrno')}</th><window.SortTh col="reqTime" label={WRV_T('wp.col.reqTime')} sort={sorter.sort} onToggle={sorter.toggle} /><th className="right">{WRV_T('wp.col.csCount')}</th><th className="right">{WRV_T('wp.col.applyAmt')}</th>
              <th>{WRV_T('wp.col.applyStat')}</th><th>{WRV_T('wp.col.fsStat')}</th><th>{WRV_T('wp.col.poStat')}</th><th className="right">{WRV_T('wp.col.carryAmt')}</th><th className="right">{WRV_T('wp.col.payAmt')}</th>
              <th style={{ width: 70 }}>{WRV_T('wp.col.action')}</th>
            </tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="12" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>{WRV_T('wp.empty')}</td></tr>
              ) : paged.map(r => {
                const w = r.w;
                return (
                  <tr key={w.id} onClick={() => setDetail(w)} style={{ cursor: 'pointer' }}>
                    <td className="text-mono" style={{ fontSize: 11.5, color: 'var(--text-1)' }}>{w.agentId}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-0)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.agentName}</td>
                    <td className="id" style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{w.id}</td>
                    <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(w.requestAt)}</td>
                    <td className="right text-mono">{w.csCount}</td>
                    <td className="right text-mono" style={{ color: 'var(--text-0)', fontWeight: 600 }}>{CUR}{F.fmtNum(w.amount)}</td>
                    <td><StatTxt meta={applyMeta[r.apply]} /></td>
                    <td>{r.fsStat ? <StatTxt meta={fsMeta[r.fsStat]} /> : dash}</td>
                    <td>{r.poStat ? <StatTxt meta={poMeta[r.poStat]} /> : dash}</td>
                    <td className="right text-mono" style={{ color: r.carryAmt != null ? 'var(--danger)' : undefined }}>{r.carryAmt != null ? '-' + CUR + F.fmtNum(r.carryAmt) : dash}</td>
                    <td className="right text-mono" style={{ color: 'var(--text-0)' }}>{r.payAmt != null ? CUR + F.fmtNum(r.payAmt) : dash}</td>
                    <td onClick={e => e.stopPropagation()}><button className="link-act" onClick={() => setDetail(w)}>查看&审核</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <WPUI.Pagination page={safePage} pageSize={pageSize} total={list.length}
          onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }}/>
      </div>

      {/* 进度主抽屉:3 阶段嵌套时间轴 */}
      <WPUI.Drawer open={!!detail} onClose={() => setDetail(null)} width={460}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{WRV_T('wp.drawer.title')}</span>} subtitle={WRV_T('wp.drawer.sub')}>
        {detail && (() => {
          const phases = buildPhases(detail);
          return (
            <div style={{ padding: '18px 24px 96px' }}>
              {/* 3 阶段时间轴 */}
              <div className="drawer-sec">{WRV_T('wp.sec.progress')}</div>
              <div style={{ position: 'relative', marginTop: 16 }}>
                {phases.map((ph, i) => {
                  const color = phaseColor(ph.state);
                  const last = i === phases.length - 1;
                  const dim = ph.state === 'wait' || ph.state === 'skip';
                  return (
                    <div key={ph.key} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: last ? 0 : 20 }}>
                      {!last && <div style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 2, background: ph.state === 'done' ? 'var(--success)' : 'var(--line)' }} />}
                      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, zIndex: 1, background: dim ? 'var(--bg-2)' : color, border: dim ? '2px solid var(--text-3)' : 'none', display: 'grid', placeItems: 'center' }}>
                        {ph.state === 'done' && <Icon name="check" size={14} style={{ color: '#fff' }} />}
                        {ph.state === 'active' && <Icon name="refresh" size={13} style={{ color: '#fff' }} />}
                        {ph.state === 'reject' && <Icon name="x" size={14} style={{ color: '#fff' }} />}
                        {ph.state === 'warn' && <Icon name="alert" size={13} style={{ color: '#fff' }} />}
                        {dim && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{i + 1}</span>}
                      </div>
                      <div style={{ flex: 1, paddingTop: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: dim ? 'var(--text-3)' : 'var(--text-0)' }}>{ph.title}</div>
                        {ph.doc && (ph.doc.data ? (
                          <button className="link-act" style={{ marginTop: 3, fontSize: 12, color: 'var(--brand)' }}
                            onClick={() => setDocView(ph.doc)}>
                            查看&审核 {ph.docLabel}
                          </button>
                        ) : (
                          <div style={{ marginTop: 3, fontSize: 12, color: 'var(--text-3)', cursor: 'not-allowed' }}>
                            查看&审核 {ph.docLabel}
                          </div>
                        ))}
                        {ph.subs.length > 0 && (
                        <div style={{ marginTop: 8, display: 'grid', gap: 7 }}>
                          {ph.subs.map((sub, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <SubDot state={sub.state} />
                              <span style={{ fontSize: 12, color: subTextColor(sub.state) }}>{sub.text}</span>
                              {sub.time && <span className="text-mono text-mute" style={{ fontSize: 10.5 }}>{fmtDT(sub.time)}</span>}
                            </div>
                          ))}
                        </div>
                        )}
                        {ph.note && (
                          <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                            {noteText(ph.note)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 提款申请金额 — 单据号 + 合计,行式呈现(与下方结算单同款式) */}
              <div className="drawer-sec" style={{ marginTop: 24 }}>{WRV_T('wp.sec.applyAmt')}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', borderBottom: '1px solid var(--line-soft)', fontSize: 12.5 }}>
                  <span className="text-mono" style={{ color: 'var(--text-1)', fontSize: 12 }}>{detail.id}</span>
                  <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(detail.amount)}</span>
                </div>
              </div>

              {/* 关联佣金结算单 */}
              <div className="drawer-sec" style={{ marginTop: 24 }}>{WRV_T('wp.sec.linkedCs')}</div>
              <div style={{ marginTop: 6 }}>
                {B.csByIds(detail.csIds).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', borderBottom: '1px solid var(--line-soft)', fontSize: 12.5 }}>
                    <span className="text-mono" onClick={() => setCsView(c)} style={{ color: 'var(--brand)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>{c.id}</span>
                    <span className="text-mute" style={{ fontSize: 11.5 }}>· {WRV_T('wp.period')} {c.period}</span>
                    <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(c.totalCommission)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </WPUI.Drawer>

      {/* 单据明细子抽屉:WR / FS / PO */}
      <WPUI.Drawer open={!!docView} onClose={() => setDocView(null)} elevated
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{docView ? (docView.type === 'wr' ? WRV_T('wp.doc.wr') : docView.type === 'fs' ? WRV_T('wp.doc.fs') : WRV_T('wp.doc.po')) : ''}</span>}
        subtitle={docView ? (docView.type === 'wr' ? WRV_T('wp.docsub.wr') : docView.type === 'fs' ? WRV_T('wp.docsub.fs') : WRV_T('wp.docsub.po')) : ''}
        width={400}
        footer={docView && docView.type === 'wr' ? (() => {
          const w = docView.data;
          const decided = w.reviewAt || (w.status && w.status !== 'reviewing');
          return (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn" onClick={() => openNote(docView.data.id)}><Icon name="edit" size={13} />备注</button>
              {!decided && <button className="btn" style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} onClick={() => { setRejectType('custom'); setRejectText(''); setRejectWR(docView.data); }}>拒绝</button>}
              {!decided && <button className="btn" style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }} onClick={() => setApproveWR(docView.data)}>通过</button>}
            </div>
          );
        })() : (docView && docView.type === 'fs' && docView.data) ? (() => {
          const fs = docView.data;
          const decided = fs.status && fs.status !== 'pending' && fs.status !== 'auditing';
          return (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%', flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => openNote(docView.data.id)}><Icon name="edit" size={13} />备注</button>
              {!decided && <button className="btn" style={{ borderColor: '#7c3aed', color: '#7c3aed' }} onClick={() => openAdjust(docView.data)}>财务调整</button>}
              {!decided && <button className="btn" style={{ borderColor: '#c2410c', color: '#c2410c' }} onClick={() => tryCarryFS(docView.data)}>转结下期</button>}
              {!decided && <button className="btn" style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} onClick={() => { setFsRejType('custom'); setFsRejText(''); setRejectFS(docView.data); }}>驳回</button>}
              {!decided && <button className="btn" style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }} onClick={() => tryApproveFS(docView.data)}>通过</button>}
            </div>
          );
        })() : null}>
        {docView && docView.type === 'wr' && <WRV_WRCard wr={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lwr} notes={B.getNote(docView.data.id)} onOpenCs={(c) => setCsView(c)} />}
        {docView && docView.type === 'fs' && <WRV_FSCard fs={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lfs} notes={B.getNote(docView.data.id)} adjust={docView.data._adjustItems} />}
        {docView && docView.type === 'po' && <WRV_POCard po={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lpo} onDone={() => setDocView(null)} />}
      </WPUI.Drawer>

      {/* v3.7.9 通过 确认弹窗 */}
      <WPUI.Modal open={!!approveWR} onClose={() => setApproveWR(null)} title="确认通过提款申请?" width={360}
        footer={<>
          <button className="btn ghost" onClick={() => setApproveWR(null)}>取消</button>
          <button className="btn" style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }} onClick={doApprove}>确认</button>
        </>}>
        {approveWR && (
          <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 13, color: 'var(--text-2)' }}>申请金额
            <span className="text-mono" style={{ color: 'var(--success)', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>{CUR}{F.fmtNum(approveWR.amount)}</span>
          </div>
        )}
      </WPUI.Modal>

      {/* v3.7.9 拒绝 申请弹窗 */}
      <WPUI.Modal open={!!rejectWR} onClose={() => setRejectWR(null)} title="拒绝申请"
        subtitle="拒绝后,用户相关结算单退回,代理可在「佣金结算单」重新申请提款" width={560}
        footer={<>
          <button className="btn ghost" onClick={() => setRejectWR(null)}>取消</button>
          <button className="btn" disabled={!rejectText.trim()} style={!rejectText.trim() ? { background: 'var(--bg-2)', borderColor: 'var(--line)', color: 'var(--text-3)', cursor: 'not-allowed' } : { background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} onClick={doReject}>确认 拒绝申请</button>
        </>}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 10 }}>拒绝原因 <span style={{ color: '#ef4444' }}>*</span></div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            {[['tpl1', '模板1'], ['tpl2', '模板2'], ['custom', '自订义']].map(([k, l]) => (
              <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="rejTpl" checked={rejectType === k} onChange={() => { setRejectType(k); setRejectText(k === 'custom' ? '' : (tpls.wrReject[k] || '')); }} />
                {l}
              </label>
            ))}
          </div>
          <textarea className="textarea" rows={5} placeholder="请填写本次拒绝的具体原因,会以通知方式发送给申请人"
            value={rejectText} onChange={e => { setRejectText(e.target.value); setRejectType('custom'); }}
            style={{ width: '100%', resize: 'vertical' }} />
        </div>
      </WPUI.Modal>

      {/* v3.7.9 备注弹窗 */}
      <WPUI.Modal open={!!noteTarget} onClose={() => setNoteTarget(null)} title="备注" subtitle="备注仅商户后台管理员能看到" width={560}
        footer={<>
          <button className="btn ghost" onClick={() => setNoteTarget(null)}>取消</button>
          <button className="btn primary" onClick={saveNote}>保存</button>
        </>}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 32px', gap: 10, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8 }}>
            <span>备注人</span><span>备注</span><span />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {noteDraft.map((n, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 32px', gap: 10, alignItems: 'center' }}>
                <input className="input" value={n.by || ADMIN} readOnly style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }} />
                <input className="input" value={n.text} placeholder="请输入"
                  onChange={e => setNoteDraft(d => d.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
                <button className="btn sm ghost icon-only" onClick={() => setNoteDraft(d => d.filter((_, j) => j !== i))}><Icon name="x" size={13} style={{ color: '#ef4444' }} /></button>
              </div>
            ))}
          </div>
          <button className="link-act" style={{ marginTop: 12, fontSize: 13 }} onClick={() => setNoteDraft(d => [...d, { by: ADMIN, text: '', at: null }])}>+新增 备注</button>
        </div>
      </WPUI.Modal>

      {/* v3.7.9 佣金结算单弹窗(从 WR 提款申请来源点开) */}
      {/* v3.7.13 佣金结算单弹窗 — 内容/样式对齐「代理佣金结算单」CS 详情(复用全局 AGS_* 组件) */}
      <WPUI.Modal open={!!csView} onClose={() => setCsView(null)} title={<span style={{ fontSize: 18, fontWeight: 700 }}>佣金结算单</span>} subtitle="本期佣金结算明细与提款流转状态" width={420}>
        {csView && (() => {
          const L = window.BILLING_LABELS.cs || {};
          const cs = csView;
          const wr = cs.wrId ? B.wrById(cs.wrId) : null;
          const fs = wr && wr.fsId ? B.fsById(wr.fsId) : null;
          const po = fs && fs.poId ? B.poById(fs.poId) : null;
          const carryAmt = cs.status === 'carried' ? cs.totalCommission : (cs.status === 'auditCarried' && fs ? fs.carryOut : 0);
          const csLabel = (s) => (L[s] || {}).label || s;
          const stColor = AGS_CS_TONE_COLOR[(L[cs.status] || {}).tone] || 'var(--text-1)';
          const docStatusText = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).label || status;
          const docTone = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).tone || 'b-neutral';
          return (
            <div style={{ padding: '2px 0 4px' }}>
              <div className="drawer-sec">状态</div>
              <AGS_DRow l="订单状态" v={<span style={{ color: stColor, fontWeight: 600 }}>{csLabel(cs.status)}</span>} plain />
              <AGS_DRow l="更新时间" v={fmtDT(cs.statusAt)} />

              <div className="drawer-sec">基本资料</div>
              <AGS_DRow l="代理名称" v={cs.agentName} />
              <AGS_DRow l="代理 ID" v={cs.agentId} />
              <AGS_DRow l="分润期号" v={cs.period} />
              <AGS_DRow l="结算单号" v={cs.id} />
              <AGS_DRow l="结算周期" v={cs.periodRange} />
              <AGS_DRow l="结算时间" v={fmtDT(cs.settledAt)} />

              <div className="drawer-sec">佣金来源</div>
              {cs.curCommission > 0 && (
                <AGS_SrcGroup src={cs.id} label="本期佣金" amount={CUR + F.fmtNum(cs.curCommission)} />
              )}
              {cs.carriedIn > 0 && (
                <AGS_SrcGroup src={cs.carriedFromId || '—'} label="往期转结佣金" amount={CUR + F.fmtNum(cs.carriedIn)} />
              )}
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 8 }}>
                <AGS_DRow l="可提款金额" v={CUR + F.fmtNum(cs.withdrawable)} vColor="var(--brand)" bold />
                <AGS_DRow l="转结金额" v={CUR + F.fmtNum(carryAmt)} vColor="var(--danger)" bold />
              </div>

              {wr && (
                <>
                  <div className="drawer-sec">关联提款申请单</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <AGS_ChainRow icon="wallet" label="提款申请单(WR)" no={wr.id} statusText={docStatusText('wr', wr.status)} tone={docTone('wr', wr.status)} />
                    {fs && <AGS_ChainRow icon="file" label="财务核算单(FS)" no={fs.id} statusText={docStatusText('fs', fs.status)} tone={docTone('fs', fs.status)} />}
                    {po && <AGS_ChainRow icon="check" label="付款单(PO)" no={po.id} statusText={docStatusText('po', po.status)} tone={docTone('po', po.status)} />}
                  </div>
                  {(cs.status === 'rejected' || cs.status === 'auditRejected') && (
                    <div style={{ marginTop: 10, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                      {WRV_T('wp.note.end')}{WRV_T('wp.note.returned')}
                    </div>
                  )}
                  {cs.status === 'payFailed' && (
                    <div style={{ marginTop: 10, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                      {WRV_T('wp.note.end')}{WRV_T('wp.note.returned')}
                    </div>
                  )}
                  {cs.status === 'auditCarried' && (
                    <div style={{ marginTop: 10, padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 12, color: '#c2410c', lineHeight: 1.7 }}>
                      {WRV_T('wp.note.end')}{WRV_T('wp.note.carried')}
                    </div>
                  )}
                  <div className="text-mute" style={{ fontSize: 11, marginTop: 8 }}>完整流转时间轴可在「提款审核」查看。</div>
                </>
              )}
            </div>
          );
        })()}
      </WPUI.Modal>

      {/* v3.7.14 财务核算单 通过 确认弹窗 */}
      <WPUI.Modal open={!!approveFS} onClose={() => setApproveFS(null)} title="确认通过财务核算?" width={360}
        footer={<>
          <button className="btn ghost" onClick={() => setApproveFS(null)}>取消</button>
          <button className="btn" style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }} onClick={doApproveFS}>确认</button>
        </>}>
        {approveFS && (
          <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 13, color: 'var(--text-2)' }}>应付金额
            <span className="text-mono" style={{ color: 'var(--success)', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>{CUR}{F.fmtNum(fsPayableOf(approveFS))}</span>
          </div>
        )}
      </WPUI.Modal>

      {/* v3.7.14 财务核算单 转结下期 确认弹窗 */}
      <WPUI.Modal open={!!carryFS} onClose={() => setCarryFS(null)} title="确认转结下期财务核算?" width={360}
        footer={<>
          <button className="btn ghost" onClick={() => setCarryFS(null)}>取消</button>
          <button className="btn" style={{ background: '#c2410c', borderColor: '#c2410c', color: '#fff' }} onClick={doCarryFS}>确认</button>
        </>}>
        {carryFS && (
          <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 13, color: 'var(--text-2)' }}>转结金额
            <span className="text-mono" style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>-{CUR}{F.fmtNum(Math.abs(fsPayableOf(carryFS)))}</span>
          </div>
        )}
      </WPUI.Modal>

      {/* v3.7.14 财务核算单 驳回 申请弹窗 */}
      <WPUI.Modal open={!!rejectFS} onClose={() => setRejectFS(null)} title="驳回申请"
        subtitle="驳回后,用户相关结算单退回,代理可在「佣金结算单」重新申请提款" width={560}
        footer={<>
          <button className="btn ghost" onClick={() => setRejectFS(null)}>取消</button>
          <button className="btn" disabled={!fsRejText.trim()} style={!fsRejText.trim() ? { background: 'var(--bg-2)', borderColor: 'var(--line)', color: 'var(--text-3)', cursor: 'not-allowed' } : { background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} onClick={doRejectFS}>确认 驳回申请</button>
        </>}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 10 }}>拒绝原因 <span style={{ color: '#ef4444' }}>*</span></div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            {[['tpl1', '模板1'], ['tpl2', '模板2'], ['custom', '自订义']].map(([k, l]) => (
              <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="fsRejTpl" checked={fsRejType === k} onChange={() => { setFsRejType(k); setFsRejText(k === 'custom' ? '' : (tpls.fsReject[k] || '')); }} />
                {l}
              </label>
            ))}
          </div>
          <textarea className="textarea" rows={5} placeholder="请填写本次驳回的具体原因,会以通知方式发送给申请人"
            value={fsRejText} onChange={e => { setFsRejText(e.target.value); setFsRejType('custom'); }} style={{ width: '100%', resize: 'vertical' }} />
        </div>
      </WPUI.Modal>

      {/* v3.7.14 财务核算单 编辑 财务调整 弹窗 */}
      <WPUI.Modal open={!!adjustFS} onClose={() => setAdjustFS(null)} title="编辑 财务调整" subtitle="配置财务调整项" width={560}
        footer={<div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
          <button className="btn ghost" onClick={openTpl}><Icon name="settings" size={13} />项目模板管理</button>
          <span style={{ flex: 1 }} />
          <button className="btn ghost" onClick={() => setAdjustFS(null)}>取消</button>
          <button className="btn primary" onClick={saveAdjust}>保存</button>
        </div>}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 32px', gap: 10, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8 }}>
            <span>项目 *</span><span>金额 *(扣款金额前面用"-")</span><span />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {adjustDraft.map((row, i) => {
              return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 32px', gap: 10, alignItems: 'center' }}>
                <select className="select" value={tpls.fsAdjust.includes(row.item) ? row.item : ''} onChange={e => setAdjustDraft(d => d.map((x, j) => j === i ? { ...x, item: e.target.value } : x))}>
                  <option value="">请选择</option>
                  {tpls.fsAdjust.map((t, k) => <option key={k} value={t}>{t}</option>)}
                </select>
                <input className="input" placeholder="请输入" value={row.amount} onChange={e => setAdjustDraft(d => d.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} />
                <button className="btn sm ghost icon-only" onClick={() => setAdjustDraft(d => d.filter((_, j) => j !== i))}><Icon name="x" size={13} style={{ color: '#ef4444' }} /></button>
              </div>
              );
            })}
          </div>
          <button className="link-act" style={{ marginTop: 12, fontSize: 13 }} onClick={() => setAdjustDraft(d => [...d, { item: '', amount: '' }])}>+新增 项目</button>
          <div className="text-mute" style={{ fontSize: 11, marginTop: 10 }}>项目可选项来自「审核模板 → 财务核算单 · 财务调整项模板」,点左下「项目模板管理」可增减。</div>
        </div>
      </WPUI.Modal>

      {/* v3.7.10 审核模板弹窗 */}
      <WPUI.Modal open={showTpl} onClose={() => setShowTpl(false)} title="审核模板"
        subtitle="配置「提款申请单」和「财务核算单」快捷模板内容" width={560}
        footer={<>
          <button className="btn ghost" onClick={() => setShowTpl(false)}>取消</button>
          <button className="btn primary" onClick={saveTpl}>保存</button>
        </>}>
        {tplDraft && (() => {
          const grpTitle = { fontSize: 13, fontWeight: 700, color: 'var(--text-0)', paddingBottom: 8, borderBottom: '1px solid var(--line)' };
          const lbl = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };
          return (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* 提款申请单 · 已拒绝模板 — 与「拒绝申请」弹窗 模板1/模板2 关联 */}
              <div>
                <div style={grpTitle}>提款申请单 · 已拒绝模板</div>
                {['tpl1', 'tpl2'].map(k => (
                  <div key={k} style={{ marginTop: 12 }}>
                    <label style={lbl}>{k === 'tpl1' ? '模板1' : '模板2'}</label>
                    <input className="input" placeholder="请输入" style={{ width: '100%' }} value={tplDraft.wrReject[k]}
                      onChange={e => setTplDraft(d => ({ ...d, wrReject: { ...d.wrReject, [k]: e.target.value } }))} />
                  </div>
                ))}
              </div>
              {/* 财务核算单 · 已驳回模板 */}
              <div>
                <div style={grpTitle}>财务核算单 · 已驳回模板</div>
                {['tpl1', 'tpl2'].map(k => (
                  <div key={k} style={{ marginTop: 12 }}>
                    <label style={lbl}>{k === 'tpl1' ? '模板1' : '模板2'}</label>
                    <input className="input" placeholder="请输入" style={{ width: '100%' }} value={tplDraft.fsReject[k]}
                      onChange={e => setTplDraft(d => ({ ...d, fsReject: { ...d.fsReject, [k]: e.target.value } }))} />
                  </div>
                ))}
              </div>
              {/* 财务核算单 · 财务调整项模板 */}
              <div>
                <div style={grpTitle}>财务核算单 · 财务调整项模板</div>
                <div className="text-mute" style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 4 }}>在此配置财务核算时可选用的调整项。删除某项(如违规扣款)仅对之后的核算生效;已完成的财务核算单不受影响,其已记录的调整项保持原样。</div>
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  {tplDraft.fsAdjust.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input className="input" placeholder="请输入" style={{ flex: 1 }} value={v}
                        onChange={e => setTplDraft(d => ({ ...d, fsAdjust: d.fsAdjust.map((x, j) => j === i ? e.target.value : x) }))} />
                      <button className="btn sm ghost icon-only" onClick={() => setDelTpl(i)}><Icon name="x" size={13} style={{ color: '#ef4444' }} /></button>
                    </div>
                  ))}
                </div>
                <button className="link-act" style={{ marginTop: 12, fontSize: 13 }} onClick={() => setTplDraft(d => ({ ...d, fsAdjust: [...d.fsAdjust, ''] }))}>+新增 项目模板</button>
              </div>
            </div>
          );
        })()}
      </WPUI.Modal>

      {/* v3.7.10 确认删除模板 */}
      <WPUI.Modal open={delTpl !== null} onClose={() => setDelTpl(null)} title="确认删除模板?" width={340}
        footer={<>
          <button className="btn ghost" onClick={() => setDelTpl(null)}>取消</button>
          <button className="btn" style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }} onClick={() => { setTplDraft(d => ({ ...d, fsAdjust: d.fsAdjust.filter((_, j) => j !== delTpl) })); setDelTpl(null); }}>确认</button>
        </>}>
        <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 13, color: 'var(--text-2)' }}>删除后需点「保存」才生效。</div>
      </WPUI.Modal>

      {/* 说明弹窗 */}
      <WPUI.Modal open={showHelp} onClose={() => setShowHelp(false)} title={WRV_T('wp.help.title')} subtitle={WRV_T('wp.help.sub')} width={520}>
        <window.BillingRulesHelp lang="zh" mode="numbering" flowHi="WR" introLabel="审核流程" intro={
        <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-1)' }}>
          {WRV_T('wp.help.intro')}
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {[
              ['1', WRV_T('wp.help.1t'), WRV_T('wp.help.1d')],
              ['2', WRV_T('wp.help.2t'), WRV_T('wp.help.2d')],
              ['3', WRV_T('wp.help.3t'), WRV_T('wp.help.3d')],
            ].map(([n, t, d]) => (
              <div key={n} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 700, fontSize: 12, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{t}</div>
                  <div className="text-mute" style={{ fontSize: 12, marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        } />
      </WPUI.Modal>
    </div>
  );
}

// v3.7.9 CS 状态 tone → 颜色(佣金结算单弹窗用)
const WR_CS_TONE = { 'b-brand': '#1d4ed8', 'b-neutral': '#64748b', 'b-warning': '#b45309', 'b-success': '#15803d', 'b-danger': '#b91c1c', 'b-magenta': '#b83280', 'b-info': '#0e7490', 'b-purple': '#7c3aed', 'b-orange': '#c2410c' };

// === 时间轴配色 ===
function phaseColor(state) {
  return state === 'done' ? 'var(--success)' : state === 'active' ? '#f59e0b' : state === 'reject' ? 'var(--danger)' : state === 'warn' ? 'var(--danger)' : 'var(--text-3)';
}
function subTextColor(state) {
  return state === 'reject' || state === 'reason' || state === 'warn' ? 'var(--danger)' : state === 'wait' || state === 'skip' ? 'var(--text-3)' : 'var(--text-1)';
}
// 细项标记:每个状态对应专属图标(完成✓ / 进行中▶橙 / 拒绝× / 警告! / 跳过·灰点)
function SubDot({ state }) {
  const wrap = { width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 };
  if (state === 'done') return <span style={{ ...wrap, background: 'var(--success)' }}><Icon name="check" size={10} style={{ color: '#fff' }} /></span>;
  if (state === 'reject') return <span style={{ ...wrap, background: 'var(--danger)' }}><Icon name="x" size={10} style={{ color: '#fff' }} /></span>;
  if (state === 'warn') return <span style={{ ...wrap, background: 'var(--danger)' }}><Icon name="alert" size={10} style={{ color: '#fff' }} /></span>;
  if (state === 'active') return (
    <span style={{ ...wrap }}>
      <span style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #f59e0b' }} />
    </span>
  );
  // 原因:无图标,仅留占位使文案对齐
  if (state === 'reason') return <span style={{ width: 16, flexShrink: 0 }} />;
  // wait / skip
  return <span style={{ width: 8, height: 8, margin: 4, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0 }} />;
}

// === 单据明细卡片 ===
// 单据明细:label 左 / value 右 单列行(照图)
function WRV_DocRow({ l, v, vColor, mono = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '7px 0' }}>
      <span className="text-mute" style={{ fontSize: 12.5, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 12.5, color: vColor || 'var(--text-0)', fontWeight: vColor ? 600 : 400, fontFamily: mono ? 'var(--font-mono)' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}

function WRV_WRCard({ wr, B, CUR, F, agent, L, notes = [], onOpenCs }) {
  // 订单状态:与列表「申请状态」一致 — 依据 reviewAt / 关联 FS 派生 审核中 / 已通过 / 已拒绝
  const fs = wr.fsId ? B.fsById(wr.fsId) : null;
  let applyStatus;
  if (wr.status === 'rejected' && !fs) applyStatus = 'rejected';
  else if (fs || wr.status === 'paid' || wr.reviewAt) applyStatus = 'approved';
  else applyStatus = 'reviewing';
  const APPLY = {
    reviewing: { label: WRV_T('wp.st.reviewing'), color: '#f59e0b' },
    approved:  { label: WRV_T('wp.st.approved'), color: '#22c55e' },
    rejected:  { label: WRV_T('wp.st.rejected'), color: '#ef4444' },
  };
  const st = APPLY[applyStatus];
  // 收款资料:统一读代理收款方式(_payment / 申请快照)— 与「我的帐户 → 收款方式」一致(UPI)
  const snap = (agent && agent._appData && agent._appData._formSnapshot) || {};
  const pay = {
    method: (agent._payment && agent._payment.method) || snap.payMethod || 'UPI',
    ifsc: (agent._payment && agent._payment.ifsc) || snap.ifsc || '',
    account: (agent._payment && agent._payment.account) || snap.account || '',
    realName: (agent._payment && agent._payment.realName) || snap.realName || agent.name || '',
    email: (agent._payment && agent._payment.email) || snap.payEmail || '',
  };
  return (
    <div style={{ padding: '18px 24px 96px' }}>
      <div className="drawer-sec">{WRV_T('wp.f.status')}</div>
      <WRV_DocRow l={WRV_T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.updateTime')} v={new Date(wr.reviewAt || wr.requestAt).toLocaleString('zh-CN')} />
      {applyStatus === 'rejected' && wr.rejectReason && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626', lineHeight: 1.7 }}>{WRV_T('wp.sub.reasonPfx')}{wr.rejectReason}</div>
      )}
      {applyStatus === 'rejected' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {WRV_T('wp.note.end')}{WRV_T('wp.note.returned')}
        </div>
      )}

      <div className="drawer-sec">{WRV_T('wp.f.basic')}</div>
      <WRV_DocRow l={WRV_T('wp.f.agentName')} v={wr.agentName || agent.name} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.agentId')} v={wr.agentId || agent.id} />
      <WRV_DocRow l={WRV_T('wp.f.wrNo')} v={wr.id} />
      <WRV_DocRow l={WRV_T('wp.f.reqTime')} v={new Date(wr.requestAt).toLocaleString('zh-CN')} />
      <WRV_DocRow l={WRV_T('wp.f.reviewer')} v={wr.reviewer || '—'} mono={false} />

      <div className="drawer-sec">{WRV_T('wp.f.payInfo')}</div>
      <WRV_DocRow l={WRV_T('wp.f.method')} v={pay.method} mono={false} />
      <WRV_DocRow l="IFSC" v={pay.ifsc || '—'} />
      <WRV_DocRow l="Account" v={pay.account || '—'} />
      <WRV_DocRow l="Real Name" v={pay.realName || '—'} mono={false} />
      <WRV_DocRow l="Email" v={pay.email || '—'} />

      <div className="drawer-sec">{WRV_T('wp.f.applySource')}</div>
      {B.csByIds(wr.csIds).map((c, i) => (
        <div key={c.id + '-' + i} onClick={() => onOpenCs && onOpenCs(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12, cursor: onOpenCs ? 'pointer' : 'default' }}>
          <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 12, textDecoration: onOpenCs ? 'underline' : 'none' }}>{c.id}</span>
          <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(c.totalCommission)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0' }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{WRV_T('wp.f.totalAmt')}</span>
        <span className="text-mono" style={{ color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>{CUR}{F.fmtNum(wr.amount)}</span>
      </div>

      <div className="drawer-sec">备注</div>
      {notes.length === 0 ? (
        <div className="text-mute" style={{ fontSize: 12, padding: '8px 0' }}>暂无备注</div>
      ) : notes.map((n, i) => (
        <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
          <div className="text-mono text-mute" style={{ fontSize: 11 }}>{n.at} · {n.by}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-1)', marginTop: 3, lineHeight: 1.6 }}>{n.text}</div>
        </div>
      ))}
    </div>
  );
}

function WRV_FSCard({ fs, B, CUR, F, agent, L, notes = [], adjust }) {
  const wr = fs.wrId ? B.wrById(fs.wrId) : null;
  const hasOv = Array.isArray(adjust);
  const totalAdjust = hasOv ? adjust.reduce((a, it) => a + (Number(it.amount) || 0), 0) : (fs.payable - fs.applyAmount); // 财务调整合计
  const payableVal = hasOv ? (fs.applyAmount + totalAdjust) : fs.payable;
  const carryVal = hasOv ? (payableVal < 0 ? Math.abs(payableVal) : 0) : fs.carryOut;
  // 订单状态:核算中 / 已驳回 / 已转结 / 核算完成
  let fsStat;
  if (fs.status === 'rejected') fsStat = 'rejected';
  else if (fs.status === 'carried') fsStat = 'carried';
  else if (fs.status === 'pending' || fs.status === 'auditing') fsStat = 'auditing';
  else fsStat = 'done';
  const FSMAP = {
    auditing: { label: WRV_T('wp.st.auditing'), color: '#f59e0b' },
    rejected: { label: WRV_T('wp.st.fsRejected'), color: '#ef4444' },
    carried:  { label: WRV_T('wp.st.carried'), color: '#ef4444' },
    done:     { label: WRV_T('wp.st.fsDone'), color: '#22c55e' },
  };
  const st = FSMAP[fsStat];
  const red = '#ef4444', green = '#22c55e';
  return (
    <div style={{ padding: '18px 24px 96px' }}>
      <div className="drawer-sec">{WRV_T('wp.f.status')}</div>
      <WRV_DocRow l={WRV_T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.updateTime')} v={new Date(fs.statusAt).toLocaleString('zh-CN')} />
      {fsStat === 'rejected' && fs.rejectReason && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626', lineHeight: 1.7 }}>{WRV_T('wp.sub.reasonPfx')}{fs.rejectReason}</div>
      )}
      {fsStat === 'rejected' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {WRV_T('wp.note.end')}{WRV_T('wp.note.returned')}
        </div>
      )}
      {fsStat === 'carried' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {WRV_T('wp.note.end')}{WRV_T('wp.note.carried')}
        </div>
      )}

      <div className="drawer-sec">{WRV_T('wp.f.basic')}</div>
      <WRV_DocRow l={WRV_T('wp.f.agentName')} v={fs.agentName || agent.name} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.agentId')} v={fs.agentId || agent.id} />
      <WRV_DocRow l={WRV_T('wp.f.fsNo')} v={fs.id} />
      <WRV_DocRow l={WRV_T('wp.f.fsTime')} v={new Date(fs.createdAt).toLocaleString('zh-CN')} />
      <WRV_DocRow l={WRV_T('wp.f.auditor')} v={fs.auditor || '—'} mono={false} />

      <div className="drawer-sec">{WRV_T('wp.f.applySource')}</div>
      <WRV_DocRow l={WRV_T('wp.f.reviewer')} v={(wr && wr.reviewer) || '—'} mono={false} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
        <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 12 }}>{fs.wrId}</span>
        <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(wr ? wr.amount : fs.applyAmount)}</span>
      </div>

      <div className="drawer-sec">{WRV_T('wp.f.fsAdjust')}</div>
      {hasOv ? (
        adjust.length === 0 ? (
          <div className="text-mute" style={{ fontSize: 12, padding: '8px 0' }}>无财务调整项</div>
        ) : adjust.map((it, i) => (
          <WRV_DocRow key={i} l={it.item} v={(Number(it.amount) < 0 ? '-' : '+') + CUR + F.fmtNum(Math.abs(Number(it.amount)))} vColor={Number(it.amount) < 0 ? red : green} />
        ))
      ) : (
        <>
          {fs.adminFee > 0 && <WRV_DocRow l={WRV_T('wp.f.adminFee')} v={'-' + CUR + F.fmtNum(fs.adminFee)} vColor={red} />}
          {fs.tax > 0 && <WRV_DocRow l={WRV_T('wp.f.tax')} v={'-' + CUR + F.fmtNum(fs.tax)} vColor={red} />}
          {fs.violationDeduct > 0 && <WRV_DocRow l={WRV_T('wp.f.violation')} v={'-' + CUR + F.fmtNum(fs.violationDeduct)} vColor={red} />}
          {fs.riskDeduct > 0 && <WRV_DocRow l={WRV_T('wp.f.risk')} v={'-' + CUR + F.fmtNum(fs.riskDeduct)} vColor={red} />}
          {fs.manualAdjust !== 0 && <WRV_DocRow l={fs.manualAdjust > 0 ? WRV_T('wp.f.manualAdd') : WRV_T('wp.f.manualSub')} v={(fs.manualAdjust > 0 ? '+' : '-') + CUR + F.fmtNum(Math.abs(fs.manualAdjust))} vColor={fs.manualAdjust > 0 ? green : red} />}
          {fs.reserve > 0 && <WRV_DocRow l={WRV_T('wp.f.reserve')} v={'-' + CUR + F.fmtNum(fs.reserve)} vColor={red} />}
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--line)', marginTop: 2 }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{WRV_T('wp.f.subtotal')}</span>
        <span className="text-mono" style={{ fontWeight: 600, color: totalAdjust < 0 ? red : 'var(--text-0)' }}>{totalAdjust < 0 ? '-' + CUR + F.fmtNum(Math.abs(totalAdjust)) : CUR + '0'}</span>
      </div>

      <div className="drawer-sec">{WRV_T('wp.f.auditResult')}</div>
      <WRV_DocRow l={WRV_T('wp.f.totalApply')} v={CUR + F.fmtNum(fs.applyAmount)} vColor="var(--brand)" />
      <WRV_DocRow l={WRV_T('wp.f.adjust')} v={totalAdjust < 0 ? '-' + CUR + F.fmtNum(Math.abs(totalAdjust)) : CUR + '0'} vColor={totalAdjust < 0 ? red : undefined} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 0', borderTop: '1px solid var(--line)', marginTop: 2 }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{WRV_T('wp.f.payable')}</span>
        <span className="text-mono" style={{ color: payableVal > 0 ? green : 'var(--text-3)', fontWeight: 600, fontSize: 15 }}>{CUR}{F.fmtNum(Math.max(0, payableVal))}</span>
      </div>
      <WRV_DocRow l={WRV_T('wp.f.carryAmt')} v={carryVal > 0 ? '-' + CUR + F.fmtNum(carryVal) : CUR + '0'} vColor={carryVal > 0 ? red : undefined} />

      <div className="drawer-sec">备注</div>
      {notes.length === 0 ? (
        <div className="text-mute" style={{ fontSize: 12, padding: '8px 0' }}>暂无备注</div>
      ) : notes.map((n, i) => (
        <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
          <div className="text-mono text-mute" style={{ fontSize: 11 }}>{n.at} · {n.by}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-1)', marginTop: 3, lineHeight: 1.6 }}>{n.text}</div>
        </div>
      ))}
    </div>
  );
}

function WRV_POCard({ po, B, CUR, F, agent, L, onDone }) {
  // 订单状态:付款中 / 付款失败 / 付款成功
  let poStat;
  if (po.status === 'success' || po.status === 'paid') poStat = 'paid';
  else if (po.status === 'failed' || po.status === 'payFailed') poStat = 'failed';
  else poStat = 'paying';
  const POMAP = {
    paying: { label: WRV_T('wp.st.paying'), color: '#f59e0b' },
    failed: { label: WRV_T('wp.st.payFailed'), color: '#ef4444' },
    paid:   { label: WRV_T('wp.st.paid'), color: '#22c55e' },
  };
  const st = POMAP[poStat];
  // 收款资料:统一读代理收款方式(_payment / 申请快照)— 与 WR 一致(UPI)
  const snap = (agent && agent._appData && agent._appData._formSnapshot) || {};
  const pay = {
    method: (agent._payment && agent._payment.method) || snap.payMethod || 'UPI',
    ifsc: (agent._payment && agent._payment.ifsc) || snap.ifsc || '',
    account: (agent._payment && agent._payment.account) || snap.account || '',
    realName: (agent._payment && agent._payment.realName) || snap.realName || agent.name || '',
    email: (agent._payment && agent._payment.email) || snap.payEmail || '',
  };
  return (
    <div style={{ padding: '18px 24px 96px' }}>
      <div className="drawer-sec">{WRV_T('wp.f.status')}</div>
      <WRV_DocRow l={WRV_T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.updateTime')} v={new Date(po.paidAt).toLocaleString('zh-CN')} />
      {poStat === 'failed' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {WRV_T('wp.note.end')}{WRV_T('wp.note.returned')}
        </div>
      )}

      <div className="drawer-sec">{WRV_T('wp.f.basic')}</div>
      <WRV_DocRow l={WRV_T('wp.f.agentName')} v={po.agentName || agent.name} mono={false} />
      <WRV_DocRow l={WRV_T('wp.f.agentId')} v={po.agentId || agent.id} />
      <WRV_DocRow l={WRV_T('wp.f.poNo')} v={po.id} />
      <WRV_DocRow l={WRV_T('wp.f.poTime')} v={new Date(po.paidAt).toLocaleString('zh-CN')} />
      <WRV_DocRow l={WRV_T('wp.f.fsNo')} v={po.fsId} />

      <div className="drawer-sec">{WRV_T('wp.f.payInfo')}</div>
      <WRV_DocRow l={WRV_T('wp.f.method')} v={pay.method} mono={false} />
      <WRV_DocRow l="IFSC" v={pay.ifsc || '—'} />
      <WRV_DocRow l="Account" v={pay.account || '—'} />
      <WRV_DocRow l="Real Name" v={pay.realName || '—'} mono={false} />
      <WRV_DocRow l="Email" v={pay.email || '—'} />

      <div className="drawer-sec">{WRV_T('wp.f.provider')}</div>
      <WRV_DocRow l={WRV_T('wp.f.txid')} v={po.txid} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 0' }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{WRV_T('wp.f.payAmt')}</span>
        <span className="text-mono" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 15 }}>{CUR}{F.fmtNum(po.amount)}</span>
      </div>

      {/* v3.7.41 测试演示用临时状态按钮(仅付款中显示)— 切换该笔付款单为 付款失败 / 付款成功 */}
      {poStat === 'paying' && B && po.fsId && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
          <div className="text-mute" style={{ fontSize: 11, marginBottom: 8 }}>{WRV_T('wp.test.hint')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}
              onClick={() => { B.payFail(po.fsId); onDone && onDone(); }}>{WRV_T('wp.test.fail')}</button>
            <button className="btn sm primary"
              onClick={() => { B.pay(po.fsId); onDone && onDone(); }}>{WRV_T('wp.test.ok')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.WithdrawReviewModule = WithdrawReviewModule;
