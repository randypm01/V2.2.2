// 代理后台 - 提款审核进度 P0-9(中/英 i18n)
// 跟踪每次提款的 3 阶段流转:提款申请单(WR)→ 财务核算单(FS)→ 付款单(PO)
// 列表:申请 / 核算 / 付款 三段状态列;主抽屉:3 阶段嵌套时间轴;子抽屉:单据明细
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
  a('wp.btn.guide', '说明', 'Help');
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
  a('wp.help.tabFlow', '审核流程', 'Review Flow');
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
  // v3.7.40 测试演示用临时状态按钮
  a('wp.test.hint', '测试演示用状态改变临时按钮', 'Demo-only temporary status toggle (test)');
  a('wp.test.fail', '付款失败', 'Pay Failed');
  a('wp.test.ok', '付款成功', 'Paid');
})();

const T = (k, fb) => window.t(k, fb);

const fmtDT = (t) => new Date(t).toLocaleString('zh-CN');
const STAT_TONE = { green: 'b-success', orange: 'b-warning', red: 'b-danger' };
function StatTxt({ meta }) {
  if (!meta) return <span style={{ color: 'var(--text-3)' }}>—</span>;
  return <span className={'badge ' + STAT_TONE[meta[1]]}>{meta[0]}</span>;
}

function MyWithdrawProgressModule() {
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const B = window.useBilling();
  const CUR = B.CUR;
  const [lang] = window.useAgentLang();
  const Lwr = window.BILLING_LABELS.wr;
  const Lfs = window.BILLING_LABELS.fs;
  const Lpo = window.BILLING_LABELS.po;

  const [filter, setFilter] = React.useState('all');
  const [detail, setDetail] = React.useState(null);   // 选中的 WR(主抽屉)
  const [docView, setDocView] = React.useState(null);  // { type:'wr'|'fs'|'po', data }
  const [csView, setCsView] = React.useState(null);    // 点击佣金结算单号弹出的 CS
  const [showHelp, setShowHelp] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

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

  const ALL_TAB = { k: 'all', l: T('wp.tab.all') };
  const TAB_GROUPS = [
    { label: T('wp.grp.apply'), tabs: [
      { k: 'apply:reviewing', l: T('wp.st.reviewing') },
      { k: 'apply:rejected', l: T('wp.st.rejected') },
      { k: 'apply:approved', l: T('wp.st.approved') },
    ] },
    { label: T('wp.grp.fs'), tabs: [
      { k: 'fs:auditing', l: T('wp.st.auditing') },
      { k: 'fs:rejected', l: T('wp.st.fsRejected') },
      { k: 'fs:carried', l: T('wp.st.carried') },
      { k: 'fs:done', l: T('wp.st.fsDone') },
    ] },
    { label: T('wp.grp.po'), tabs: [
      { k: 'po:paying', l: T('wp.st.paying') },
      { k: 'po:failed', l: T('wp.st.payFailed') },
      { k: 'po:paid', l: T('wp.st.paid') },
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
  const list = rows.filter(match);
  // v3.6.35 表头排序:提款申请时间(requestAt)
  const sorter = window.useTableSort();
  const sorted = sorter.apply(list, { reqTime: (r) => r.w.requestAt || 0 });
  // v3.6.3 列表分页 + 显示条数/页大小切换
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pickFilter = (k) => { setFilter(k); setPage(1); };

  const applyMeta = { reviewing: [T('wp.st.reviewing'), 'orange'], rejected: [T('wp.st.rejected'), 'red'], approved: [T('wp.st.approved'), 'green'] };
  const fsMeta = { auditing: [T('wp.st.auditing'), 'orange'], rejected: [T('wp.st.fsRejected'), 'red'], carried: [T('wp.st.carried'), 'red'], done: [T('wp.st.fsDone'), 'green'] };
  const poMeta = { paying: [T('wp.st.paying'), 'orange'], failed: [T('wp.st.payFailed'), 'red'], paid: [T('wp.st.paid'), 'green'] };

  // === 构建 3 阶段嵌套结构(主抽屉时间轴)===
  const buildPhases = (wr) => {
    const { fs, po } = chainOf(wr);
    const phases = [];

    // 阶段一:提款审核申请(WR)
    const p1 = { key: 'wr', title: T('wp.phase.wr'), docLabel: T('wp.doc.wr'), doc: { type: 'wr', data: wr }, subs: [] };
    p1.subs.push({ state: 'done', text: T('wp.sub.submitOk'), time: wr.requestAt });
    if (wr.status === 'rejected' && !fs) {
      p1.state = 'reject';
      p1.subs.push({ state: 'done', text: T('wp.sub.reviewing') });
      p1.subs.push({ state: 'reject', text: T('wp.sub.rejected'), time: wr.reviewAt });
      if (wr.rejectReason) p1.subs.push({ state: 'reason', text: T('wp.sub.reasonPfx') + wr.rejectReason });
      p1.note = 'returned';
    } else if (fs || wr.reviewAt) {
      p1.state = 'done';
      p1.subs.push({ state: 'done', text: T('wp.sub.reviewing') });
      p1.subs.push({ state: 'done', text: T('wp.sub.approved'), time: wr.reviewAt });
    } else {
      p1.state = 'active';
      p1.subs.push({ state: 'active', text: T('wp.sub.reviewing') });
    }
    phases.push(p1);

    // 阶段二:财务核算(FS)
    const p2 = { key: 'fs', title: T('wp.phase.fs'), docLabel: T('wp.doc.fs'), doc: { type: 'fs', data: fs }, subs: [] };
    if (!fs) {
      p2.state = wr.status === 'rejected' ? 'skip' : 'wait';
    } else if (fs.status === 'pending' || fs.status === 'auditing') {
      p2.state = 'active'; p2.subs.push({ state: 'active', text: T('wp.sub.auditing'), time: fs.auditAt });
    } else if (fs.status === 'rejected') {
      p2.state = 'reject';
      p2.subs.push({ state: 'done', text: T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'reject', text: T('wp.sub.fsRejected'), time: fs.statusAt });
      if (fs.rejectReason) p2.subs.push({ state: 'reason', text: T('wp.sub.reasonPfx') + fs.rejectReason });
      p2.note = 'returned';
    } else if (fs.status === 'carried') {
      p2.state = 'warn';
      p2.subs.push({ state: 'done', text: T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'warn', text: T('wp.sub.carried'), time: fs.statusAt });
      p2.note = 'carried';
    } else { // paying / payFailed / paid
      p2.state = 'done';
      p2.subs.push({ state: 'done', text: T('wp.sub.auditing'), time: fs.auditAt });
      p2.subs.push({ state: 'done', text: T('wp.sub.audited'), time: fs.statusAt });
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
    const p3 = { key: 'po', title: T('wp.phase.po'), docLabel: T('wp.doc.po'), doc: { type: 'po', data: poDoc }, subs: [] };
    if (!fs || fs.status === 'pending' || fs.status === 'auditing') {
      p3.state = 'wait';
    } else if (fs.status === 'rejected' || fs.status === 'carried') {
      p3.state = 'skip';
    } else if (fs.status === 'paying') {
      p3.state = 'active'; p3.subs.push({ state: 'active', text: T('wp.sub.paying'), time: fs.statusAt });
    } else if (fs.status === 'payFailed') {
      p3.state = 'reject';
      p3.subs.push({ state: 'done', text: T('wp.sub.paying'), time: fs.statusAt });
      p3.subs.push({ state: 'reject', text: T('wp.sub.payFailed') });
      p3.note = 'returned';
    } else if (po) {
      p3.state = 'done';
      p3.subs.push({ state: 'done', text: T('wp.sub.paying'), time: fs.statusAt });
      p3.subs.push({ state: 'done', text: T('wp.sub.paid'), time: po.paidAt });
    } else {
      p3.state = 'wait';
    }
    phases.push(p3);

    return phases;
  };

  const dash = <span style={{ color: 'var(--text-3)' }}>—</span>;
  const noteText = (note) => T('wp.note.end') + (note === 'carried' ? T('wp.note.carried') : T('wp.note.returned'));

  return (
    <div className="page">
      <WPUI.PageHead title={T('wp.page.title')} subtitle={T('wp.page.sub')}>
        <button className="btn" onClick={() => setShowHelp(true)}><Icon name="info" size={13} />{T('wp.btn.guide')}</button>
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

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>{T('wp.col.wrno')}</th><window.SortTh col="reqTime" label={T('wp.col.reqTime')} sort={sorter.sort} onToggle={sorter.toggle} /><th className="right">{T('wp.col.csCount')}</th><th className="right">{T('wp.col.applyAmt')}</th>
              <th>{T('wp.col.applyStat')}</th><th>{T('wp.col.fsStat')}</th><th>{T('wp.col.poStat')}</th><th className="right">{T('wp.col.carryAmt')}</th><th className="right">{T('wp.col.payAmt')}</th>
              <th style={{ width: 70 }}>{T('wp.col.action')}</th>
            </tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>{T('wp.empty')}</td></tr>
              ) : paged.map(r => {
                const w = r.w;
                return (
                  <tr key={w.id} onClick={() => setDetail(w)} style={{ cursor: 'pointer' }}>
                    <td className="id" style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{w.id}</td>
                    <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(w.requestAt)}</td>
                    <td className="right text-mono">{w.csCount}</td>
                    <td className="right text-mono" style={{ color: 'var(--text-0)', fontWeight: 600 }}>{CUR}{F.fmtNum(w.amount)}</td>
                    <td><StatTxt meta={applyMeta[r.apply]} /></td>
                    <td>{r.fsStat ? <StatTxt meta={fsMeta[r.fsStat]} /> : dash}</td>
                    <td>{r.poStat ? <StatTxt meta={poMeta[r.poStat]} /> : dash}</td>
                    <td className="right text-mono" style={{ color: r.carryAmt != null ? 'var(--danger)' : undefined }}>{r.carryAmt != null ? '-' + CUR + F.fmtNum(r.carryAmt) : dash}</td>
                    <td className="right text-mono" style={{ color: 'var(--text-0)' }}>{r.payAmt != null ? CUR + F.fmtNum(r.payAmt) : dash}</td>
                    <td onClick={e => e.stopPropagation()}><button className="link-act" onClick={() => setDetail(w)}>{T('wp.act.view')}</button></td>
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
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{T('wp.drawer.title')}</span>} subtitle={T('wp.drawer.sub')}
        footer={detail ? (
          <div style={{ textAlign: 'left', width: '100%', fontSize: 12.5, color: 'var(--text-3)' }}>
            {T('wp.foot.q')} <button className="link-act" onClick={() => { window.APS_OPEN_CONTACT && window.APS_OPEN_CONTACT(); }}>{T('wp.foot.contact')}</button>
          </div>
        ) : null}>
        {detail && (() => {
          const phases = buildPhases(detail);
          return (
            <div style={{ padding: '18px 24px 96px' }}>
              {/* 3 阶段时间轴 */}
              <div className="drawer-sec">{T('wp.sec.progress')}</div>
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
                            {T('wp.view')} {ph.docLabel}
                          </button>
                        ) : (
                          <div style={{ marginTop: 3, fontSize: 12, color: 'var(--text-3)', cursor: 'not-allowed' }}>
                            {T('wp.view')} {ph.docLabel}
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
              <div className="drawer-sec" style={{ marginTop: 24 }}>{T('wp.sec.applyAmt')}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', borderBottom: '1px solid var(--line-soft)', fontSize: 12.5 }}>
                  <span className="text-mono" style={{ color: 'var(--text-1)', fontSize: 12 }}>{detail.id}</span>
                  <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(detail.amount)}</span>
                </div>
              </div>

              {/* 关联佣金结算单 */}
              <div className="drawer-sec" style={{ marginTop: 24 }}>{T('wp.sec.linkedCs')}</div>
              <div style={{ marginTop: 6 }}>
                {B.csByIds(detail.csIds).map(c => (
                  <div key={c.id} onClick={() => setCsView(c)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', borderBottom: '1px solid var(--line-soft)', fontSize: 12.5, cursor: 'pointer' }}>
                    <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 12, textDecoration: 'underline' }}>{c.id}</span>
                    <span className="text-mute" style={{ fontSize: 11.5 }}>· {T('wp.period')} {c.period}</span>
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
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{docView ? (docView.type === 'wr' ? T('wp.doc.wr') : docView.type === 'fs' ? T('wp.doc.fs') : T('wp.doc.po')) : ''}</span>}
        subtitle={docView ? (docView.type === 'wr' ? T('wp.docsub.wr') : docView.type === 'fs' ? T('wp.docsub.fs') : T('wp.docsub.po')) : ''}
        width={400}
        footer={docView ? (
          <div style={{ textAlign: 'left', width: '100%', fontSize: 12.5, color: 'var(--text-3)' }}>
            {T('wp.foot.q')} <button className="link-act" onClick={() => { window.APS_OPEN_CONTACT && window.APS_OPEN_CONTACT(); }}>{T('wp.foot.contact')}</button>
          </div>
        ) : null}>
        {docView && docView.type === 'wr' && <WRCard wr={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lwr} onOpenCs={(c) => setCsView(c)} />}
        {docView && docView.type === 'fs' && <FSCard fs={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lfs} />}
        {docView && docView.type === 'po' && <POCard po={docView.data} B={B} CUR={CUR} F={F} agent={me} L={Lpo} onDone={() => setDocView(null)} />}
      </WPUI.Drawer>

      {/* 佣金结算单弹窗(点结算单号弹出,样式/内容对齐「佣金结算单」CS 详情) */}
      <WPUI.Modal open={!!csView} onClose={() => setCsView(null)}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{T('ms.drawer.title')}</span>}
        subtitle={T('ms.drawer.sub')} width={420}>
        {csView && (() => {
          const cs = csView;
          const L = window.BILLING_LABELS.cs || {};
          const wr = cs.wrId ? B.wrById(cs.wrId) : null;
          const fs = wr && wr.fsId ? B.fsById(wr.fsId) : null;
          const po = fs && fs.poId ? B.poById(fs.poId) : null;
          const carryAmt = cs.status === 'carried' ? cs.totalCommission : (cs.status === 'auditCarried' && fs ? fs.carryOut : 0);
          const stColor = CS_TONE_COLOR[(L[cs.status] || {}).tone] || 'var(--text-1)';
          const csLabel = (s) => T('ms.st.' + s, (L[s] || {}).label || s);
          const docStatusText = (kind, status) => T('ms.' + kind + 'st.' + status, (window.BILLING_LABELS[kind][status] || {}).label || status);
          const docTone = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).tone || 'b-neutral';
          return (
            <div style={{ padding: '2px 0 4px' }}>
              <div className="drawer-sec">{T('ms.sec.status')}</div>
              <DRow l={T('ms.f.orderStatus')} v={<span style={{ color: stColor, fontWeight: 600 }}>{csLabel(cs.status)}</span>} plain />
              <DRow l={T('ms.f.updateTime')} v={fmtDT(cs.statusAt)} />

              <div className="drawer-sec">{T('ms.sec.basic')}</div>
              <DRow l={T('ms.f.agentName')} v={cs.agentName || agent && agent.name} />
              <DRow l={T('ms.f.agentId')} v={cs.agentId} />
              <DRow l={T('ms.f.period')} v={cs.period} />
              <DRow l={T('ms.f.csno')} v={cs.id} />
              <DRow l={T('ms.f.cycle')} v={cs.periodRange} />
              <DRow l={T('ms.f.settleTime')} v={fmtDT(cs.settledAt)} />

              <div className="drawer-sec">{T('ms.sec.source')}</div>
              {cs.curCommission > 0 && (
                <SrcGroup src={cs.id} label={T('ms.f.curCom')} amount={CUR + F.fmtNum(cs.curCommission)} />
              )}
              {cs.carriedIn > 0 && (
                <SrcGroup src={cs.carriedFromId || '—'} label={T('ms.f.carryCom')} amount={CUR + F.fmtNum(cs.carriedIn)} />
              )}
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 8 }}>
                <DRow l={T('ms.f.withdrawable')} v={CUR + F.fmtNum(cs.withdrawable)} vColor="var(--brand)" bold />
                <DRow l={T('ms.f.carryAmt')} v={CUR + F.fmtNum(carryAmt)} vColor="var(--danger)" bold />
              </div>

              {wr && (
                <>
                  <div className="drawer-sec">{T('ms.sec.linked')}</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <ChainRow icon="wallet" label={T('ms.doc.wr')} no={wr.id} statusText={docStatusText('wr', wr.status)} tone={docTone('wr', wr.status)} />
                    {fs && <ChainRow icon="file" label={T('ms.doc.fs')} no={fs.id} statusText={docStatusText('fs', fs.status)} tone={docTone('fs', fs.status)} />}
                    {po && <ChainRow icon="check" label={T('ms.doc.po')} no={po.id} statusText={docStatusText('po', po.status)} tone={docTone('po', po.status)} />}
                  </div>
                  {(cs.status === 'rejected' || cs.status === 'payFailed') && (
                    <div style={{ marginTop: 10, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                      {T('wp.note.end')}{T('wp.note.returned')}
                    </div>
                  )}
                  {cs.status === 'auditCarried' && (
                    <div style={{ marginTop: 10, padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 12, color: '#c2410c', lineHeight: 1.7 }}>
                      {T('wp.note.end')}{T('wp.note.carried')}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </WPUI.Modal>

      {/* 说明弹窗 */}
      <WPUI.Modal open={showHelp} onClose={() => setShowHelp(false)} title={T('wp.help.title')} subtitle={T('wp.help.sub')} width={520}>
        <window.BillingRulesHelp mode="numbering" flowHi="WR" introLabel={T('wp.help.tabFlow')} intro={
        <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-1)' }}>
          {T('wp.help.intro')}
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {[
              ['1', T('wp.help.1t'), T('wp.help.1d')],
              ['2', T('wp.help.2t'), T('wp.help.2d')],
              ['3', T('wp.help.3t'), T('wp.help.3d')],
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
function DocRow({ l, v, vColor, mono = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '7px 0' }}>
      <span className="text-mute" style={{ fontSize: 12.5, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 12.5, color: vColor || 'var(--text-0)', fontWeight: vColor ? 600 : 400, fontFamily: mono ? 'var(--font-mono)' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}

function WRCard({ wr, B, CUR, F, agent, L, onOpenCs }) {
  // 订单状态:与列表「申请状态」一致 — 依据 reviewAt / 关联 FS 派生 审核中 / 已通过 / 已拒绝
  const fs = wr.fsId ? B.fsById(wr.fsId) : null;
  let applyStatus;
  if (wr.status === 'rejected' && !fs) applyStatus = 'rejected';
  else if (fs || wr.status === 'paid' || wr.reviewAt) applyStatus = 'approved';
  else applyStatus = 'reviewing';
  const APPLY = {
    reviewing: { label: T('wp.st.reviewing'), color: '#f59e0b' },
    approved:  { label: T('wp.st.approved'), color: '#22c55e' },
    rejected:  { label: T('wp.st.rejected'), color: '#ef4444' },
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
      <div className="drawer-sec">{T('wp.f.status')}</div>
      <DocRow l={T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <DocRow l={T('wp.f.updateTime')} v={new Date(wr.reviewAt || wr.requestAt).toLocaleString('zh-CN')} />
      {applyStatus === 'rejected' && wr.rejectReason && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626', lineHeight: 1.7 }}>{T('wp.sub.reasonPfx')}{wr.rejectReason}</div>
      )}
      {applyStatus === 'rejected' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {T('wp.note.end')}{T('wp.note.returned')}
        </div>
      )}

      <div className="drawer-sec">{T('wp.f.basic')}</div>
      <DocRow l={T('wp.f.agentName')} v={wr.agentName || agent.name} mono={false} />
      <DocRow l={T('wp.f.agentId')} v={wr.agentId || agent.id} />
      <DocRow l={T('wp.f.wrNo')} v={wr.id} />
      <DocRow l={T('wp.f.reqTime')} v={new Date(wr.requestAt).toLocaleString('zh-CN')} />
      <DocRow l={T('wp.f.reviewer')} v={wr.reviewer || '—'} mono={false} />

      <div className="drawer-sec">{T('wp.f.payInfo')}</div>
      <DocRow l={T('wp.f.method')} v={pay.method} mono={false} />
      <DocRow l="IFSC" v={pay.ifsc || '—'} />
      <DocRow l="Account" v={pay.account || '—'} />
      <DocRow l="Real Name" v={pay.realName || '—'} mono={false} />
      <DocRow l="Email" v={pay.email || '—'} />

      <div className="drawer-sec">{T('wp.f.applySource')}</div>
      {B.csByIds(wr.csIds).map((c, i) => (
        <div key={c.id + '-' + i} onClick={() => onOpenCs && onOpenCs(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12, cursor: onOpenCs ? 'pointer' : 'default' }}>
          <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 12, textDecoration: onOpenCs ? 'underline' : 'none' }}>{c.id}</span>
          <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(c.totalCommission)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0' }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{T('wp.f.totalAmt')}</span>
        <span className="text-mono" style={{ color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>{CUR}{F.fmtNum(wr.amount)}</span>
      </div>
    </div>
  );
}

function FSCard({ fs, B, CUR, F, agent, L }) {
  const wr = fs.wrId ? B.wrById(fs.wrId) : null;
  const totalAdjust = fs.payable - fs.applyAmount; // 财务调整合计(负值)
  // 订单状态:核算中 / 已驳回 / 已转结 / 核算完成
  let fsStat;
  if (fs.status === 'rejected') fsStat = 'rejected';
  else if (fs.status === 'carried') fsStat = 'carried';
  else if (fs.status === 'pending' || fs.status === 'auditing') fsStat = 'auditing';
  else fsStat = 'done';
  const FSMAP = {
    auditing: { label: T('wp.st.auditing'), color: '#f59e0b' },
    rejected: { label: T('wp.st.fsRejected'), color: '#ef4444' },
    carried:  { label: T('wp.st.carried'), color: '#ef4444' },
    done:     { label: T('wp.st.fsDone'), color: '#22c55e' },
  };
  const st = FSMAP[fsStat];
  const red = '#ef4444', green = '#22c55e';
  return (
    <div style={{ padding: '18px 24px 96px' }}>
      <div className="drawer-sec">{T('wp.f.status')}</div>
      <DocRow l={T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <DocRow l={T('wp.f.updateTime')} v={new Date(fs.statusAt).toLocaleString('zh-CN')} />
      {fsStat === 'rejected' && fs.rejectReason && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626', lineHeight: 1.7 }}>{T('wp.sub.reasonPfx')}{fs.rejectReason}</div>
      )}
      {fsStat === 'rejected' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {T('wp.note.end')}{T('wp.note.returned')}
        </div>
      )}
      {fsStat === 'carried' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {T('wp.note.end')}{T('wp.note.carried')}
        </div>
      )}

      <div className="drawer-sec">{T('wp.f.basic')}</div>
      <DocRow l={T('wp.f.agentName')} v={fs.agentName || agent.name} mono={false} />
      <DocRow l={T('wp.f.agentId')} v={fs.agentId || agent.id} />
      <DocRow l={T('wp.f.fsNo')} v={fs.id} />
      <DocRow l={T('wp.f.fsTime')} v={new Date(fs.createdAt).toLocaleString('zh-CN')} />
      <DocRow l={T('wp.f.auditor')} v={fs.auditor || '—'} mono={false} />

      <div className="drawer-sec">{T('wp.f.applySource')}</div>
      <DocRow l={T('wp.f.reviewer')} v={(wr && wr.reviewer) || '—'} mono={false} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
        <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 12 }}>{fs.wrId}</span>
        <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand)' }}>{CUR}{F.fmtNum(wr ? wr.amount : fs.applyAmount)}</span>
      </div>

      <div className="drawer-sec">{T('wp.f.fsAdjust')}</div>
      {fs.adminFee > 0 && <DocRow l={T('wp.f.adminFee')} v={'-' + CUR + F.fmtNum(fs.adminFee)} vColor={red} />}
      {fs.tax > 0 && <DocRow l={T('wp.f.tax')} v={'-' + CUR + F.fmtNum(fs.tax)} vColor={red} />}
      {fs.violationDeduct > 0 && <DocRow l={T('wp.f.violation')} v={'-' + CUR + F.fmtNum(fs.violationDeduct)} vColor={red} />}
      {fs.riskDeduct > 0 && <DocRow l={T('wp.f.risk')} v={'-' + CUR + F.fmtNum(fs.riskDeduct)} vColor={red} />}
      {fs.manualAdjust !== 0 && <DocRow l={fs.manualAdjust > 0 ? T('wp.f.manualAdd') : T('wp.f.manualSub')} v={(fs.manualAdjust > 0 ? '+' : '-') + CUR + F.fmtNum(Math.abs(fs.manualAdjust))} vColor={fs.manualAdjust > 0 ? green : red} />}
      {fs.reserve > 0 && <DocRow l={T('wp.f.reserve')} v={'-' + CUR + F.fmtNum(fs.reserve)} vColor={red} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--line)', marginTop: 2 }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{T('wp.f.subtotal')}</span>
        <span className="text-mono" style={{ fontWeight: 600, color: totalAdjust < 0 ? red : 'var(--text-0)' }}>{totalAdjust < 0 ? '-' + CUR + F.fmtNum(Math.abs(totalAdjust)) : CUR + '0'}</span>
      </div>

      <div className="drawer-sec">{T('wp.f.auditResult')}</div>
      <DocRow l={T('wp.f.totalApply')} v={CUR + F.fmtNum(fs.applyAmount)} vColor="var(--brand)" />
      <DocRow l={T('wp.f.adjust')} v={totalAdjust < 0 ? '-' + CUR + F.fmtNum(Math.abs(totalAdjust)) : CUR + '0'} vColor={totalAdjust < 0 ? red : undefined} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 0', borderTop: '1px solid var(--line)', marginTop: 2 }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{T('wp.f.payable')}</span>
        <span className="text-mono" style={{ color: fs.payable > 0 ? green : 'var(--text-3)', fontWeight: 600, fontSize: 15 }}>{CUR}{F.fmtNum(Math.max(0, fs.payable))}</span>
      </div>
      <DocRow l={T('wp.f.carryAmt')} v={fs.carryOut > 0 ? '-' + CUR + F.fmtNum(fs.carryOut) : CUR + '0'} vColor={fs.carryOut > 0 ? red : undefined} />
    </div>
  );
}

function POCard({ po, B, CUR, F, agent, L, onDone }) {
  // 订单状态:付款中 / 付款失败 / 付款成功
  let poStat;
  if (po.status === 'success' || po.status === 'paid') poStat = 'paid';
  else if (po.status === 'failed' || po.status === 'payFailed') poStat = 'failed';
  else poStat = 'paying';
  const POMAP = {
    paying: { label: T('wp.st.paying'), color: '#f59e0b' },
    failed: { label: T('wp.st.payFailed'), color: '#ef4444' },
    paid:   { label: T('wp.st.paid'), color: '#22c55e' },
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
      <div className="drawer-sec">{T('wp.f.status')}</div>
      <DocRow l={T('wp.f.orderStatus')} v={st.label} vColor={st.color} mono={false} />
      <DocRow l={T('wp.f.updateTime')} v={new Date(po.paidAt).toLocaleString('zh-CN')} />
      {poStat === 'failed' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
          {T('wp.note.end')}{T('wp.note.returned')}
        </div>
      )}

      <div className="drawer-sec">{T('wp.f.basic')}</div>
      <DocRow l={T('wp.f.agentName')} v={po.agentName || agent.name} mono={false} />
      <DocRow l={T('wp.f.agentId')} v={po.agentId || agent.id} />
      <DocRow l={T('wp.f.poNo')} v={po.id} />
      <DocRow l={T('wp.f.poTime')} v={new Date(po.paidAt).toLocaleString('zh-CN')} />
      <DocRow l={T('wp.f.fsNo')} v={po.fsId} />

      <div className="drawer-sec">{T('wp.f.payInfo')}</div>
      <DocRow l={T('wp.f.method')} v={pay.method} mono={false} />
      <DocRow l="IFSC" v={pay.ifsc || '—'} />
      <DocRow l="Account" v={pay.account || '—'} />
      <DocRow l="Real Name" v={pay.realName || '—'} mono={false} />
      <DocRow l="Email" v={pay.email || '—'} />

      <div className="drawer-sec">{T('wp.f.provider')}</div>
      <DocRow l={T('wp.f.txid')} v={po.txid} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 0' }}>
        <span style={{ color: 'var(--text-0)', fontWeight: 600, fontSize: 12.5 }}>{T('wp.f.payAmt')}</span>
        <span className="text-mono" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 15 }}>{CUR}{F.fmtNum(po.amount)}</span>
      </div>
    </div>
  );
}

window.MyWithdrawProgressModule = MyWithdrawProgressModule;
