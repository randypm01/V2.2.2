// 代理后台 - 佣金结算单(CS) P0-8 · A 版:总览 + 抽屉明细(中/英 i18n)
// 读共享单据 store(window.APS_BILLING),与商户后台「代理佣金结算单」同源。
const ASTUI = window.UI;

// ===== i18n 注册(中 / 英)=====
(function () {
  const I = window.APS_I18N = window.APS_I18N || {};
  const ZH = I.zh = I.zh || {}, EN = I.en = I.en || {};
  const a = (k, zh, en) => { ZH[k] = zh; EN[k] = en; };
  // 页面
  a('ms.page.title', '佣金结算单', 'Commission Settlements');
  a('ms.page.sub', '查看所有已结算佣金订单流转状态及提款申请', 'View all settled commission orders, their status flow and withdrawal requests');
  a('ms.btn.guide', '说明', 'Help');
  a('ms.btn.apply', '申请提款', 'Apply Withdrawal');
  a('ms.btn.noEligible', '当前没有待提款订单', 'No withdrawable settlements at the moment');
  // KPI
  a('ms.kpi.pending', '待申请提款总金额', 'Pending Withdrawal Amount');
  a('ms.kpi.reviewCount', '审核中总订单数', 'Reviewing Orders');
  a('ms.kpi.reviewAmt', '审核中总金额', 'Reviewing Amount');
  a('ms.kpi.paidTotal', '累计已付款总金额', 'Total Paid');
  a('ms.unit.orders', '张', '');
  // 页签
  a('ms.tab.all', '全部', 'All');
  a('ms.tab.withdrawable', '待提款', 'Withdrawable');
  a('ms.tab.reviewing', '审核中', 'Reviewing');
  a('ms.tab.carried', '转结下期', 'Carried Forward');
  a('ms.tab.rejected', '已拒绝', 'Rejected');
  a('ms.tab.auditing', '核算中', 'Auditing');
  a('ms.tab.auditRejected', '已驳回', 'Audit Rejected');
  a('ms.tab.auditCarried', '财务转结', 'Audit Carried');
  a('ms.tab.paying', '付款中', 'Paying');
  a('ms.tab.payFailed', '付款失败', 'Pay Failed');
  a('ms.tab.paid', '付款成功', 'Paid');
  // 状态分组标题(对齐提款审核进度筛选条)
  a('ms.grp.settle', '结算', 'Settlement');
  a('ms.grp.apply', '提款申请', 'Application');
  a('ms.grp.audit', '财务核算', 'Finance Audit');
  a('ms.grp.pay', '付款', 'Payment');
  // 表头
  a('ms.col.period', '分润期号', 'Period');
  a('ms.col.commission', '佣金', 'Commission');
  a('ms.col.csno', '结算单号', 'Settlement No.');
  a('ms.col.cycle', '结算周期', 'Settlement Cycle');
  a('ms.col.time', '结算时间', 'Settlement Time');
  a('ms.col.status', '订单状态', 'Order Status');
  a('ms.col.updated', '状态更新时间', 'Status Updated');
  a('ms.col.action', '操作', 'Action');
  a('ms.act.view', '查看', 'View');
  a('ms.empty', '该状态下暂无结算单', 'No settlements in this status');
  // CS 状态
  a('ms.st.withdrawable', '待提款', 'Withdrawable');
  a('ms.st.carried', '转结下期', 'Carried Forward');
  a('ms.st.reviewing', '审核中', 'Reviewing');
  a('ms.st.auditing', '核算中', 'Auditing');
  a('ms.st.auditCarried', '财务转结', 'Audit Carried');
  a('ms.st.paying', '付款中', 'Paying');
  a('ms.st.payFailed', '付款失败·待提款', 'Pay Failed · Withdrawable');
  a('ms.st.paid', '付款成功', 'Paid');
  a('ms.st.rejected', '已拒绝·待提款', 'Rejected · Withdrawable');
  a('ms.st.auditRejected', '已驳回·待提款', 'Audit Rejected · Withdrawable');
  // WR / FS / PO 状态(链路徽章)
  a('ms.wrst.reviewing', '审核中', 'Reviewing'); a('ms.wrst.paid', '已提款', 'Withdrawn'); a('ms.wrst.rejected', '已拒绝', 'Rejected');
  a('ms.fsst.pending', '待核算', 'Pending'); a('ms.fsst.auditing', '核算中', 'Auditing'); a('ms.fsst.rejected', '已驳回', 'Rejected');
  a('ms.fsst.paying', '付款中', 'Paying'); a('ms.fsst.payFailed', '付款失败', 'Pay Failed'); a('ms.fsst.paid', '已付款', 'Paid'); a('ms.fsst.carried', '已转结', 'Carried Forward');
  a('ms.post.success', '付款成功', 'Paid');
  // 抽屉
  a('ms.drawer.title', '佣金结算单', 'Commission Settlement');
  a('ms.drawer.sub', '本期佣金结算明细与提款流转状态', 'Commission settlement details & withdrawal status');
  a('ms.sec.status', '状态', 'Status');
  a('ms.sec.basic', '基本资料', 'Basic Info');
  a('ms.sec.source', '佣金来源', 'Commission Source');
  a('ms.sec.linked', '关联提款申请单', 'Linked Withdrawal Request');
  a('ms.f.orderStatus', '订单状态', 'Order Status');
  a('ms.f.updateTime', '更新时间', 'Updated');
  a('ms.f.agentName', '代理名称', 'Agent Name');
  a('ms.f.agentId', '代理 ID', 'Agent ID');
  a('ms.f.period', '分润期号', 'Period');
  a('ms.f.csno', '结算单号', 'Settlement No.');
  a('ms.f.settleTime', '结算时间', 'Settlement Time');
  a('ms.f.cycle', '结算周期', 'Settlement Cycle');
  a('ms.f.curCom', '本期佣金', 'Current Commission');
  a('ms.f.carryCom', '往期转结佣金', 'Carried-in Commission');
  a('ms.f.withdrawable', '可提款金额', 'Withdrawable Amount');
  a('ms.f.carryAmt', '转结金额', 'Carried Amount');
  a('ms.doc.wr', '提款申请单(WR)', 'Withdrawal Request (WR)');
  a('ms.doc.fs', '财务核算单(FS)', 'Finance Settlement (FS)');
  a('ms.doc.po', '付款单(PO)', 'Payment Order (PO)');
  a('ms.reject.cs', '提款申请已被拒绝:', 'Withdrawal request rejected: ');
  a('ms.payfail.cs', '本期付款失败。', 'Payment failed for this period. ');
  a('ms.payfail.csTail', '本期佣金已退回「待提款」,可重新申请提款。', 'Commission returned to “Withdrawable”; you may re-apply.');
  a('ms.reject.csTail', ' 本期佣金已退回「待提款」,可重新申请提款。', ' Commission returned to “Withdrawable”; you may re-apply.');
  a('ms.timeline.hint', '完整流转时间轴可在「提款审核进度」查看。', 'See the full timeline in “Withdrawal Progress”.');
  a('ms.foot.q', '有问题?', 'Need help?');
  a('ms.foot.contact', '联络线上客服', 'Contact Live Support');
  a('ms.toast.contacting', '正在为您接入在线客服…', 'Connecting you to live support…');
  // 申请提款弹窗
  a('ms.apply.title', '申请提款', 'Apply Withdrawal');
  // v3.7.39 申请校验:有未结束提款审核时阻断
  a('ms.block.title', '有未结束提款审核', 'Withdrawal Review In Progress');
  a('ms.block.body', '必须等当前提款审核全部结束(付款成功 / 退回待提款)后,才能再次发起提款审核。', 'You must wait until the current withdrawal review is fully completed (paid / returned to withdrawable) before submitting another.');
  a('ms.block.ok', '确认', 'OK');
  a('ms.apply.sub', '申请提款所有待提款结算单', 'Apply to withdraw all withdrawable settlements');
  // 最低申请提款金额(读分润模式最低结算佣金金额)+ 下限校验提示
  a('ms.apply.minAmount', '最低申请提款金额', 'Min. Withdrawal Amount');
  a('ms.apply.carrySum', '往期财务转结金额', 'Prior Finance Carry-over');
  a('ms.apply.belowMin', '您的分润模式最低提款申请金额须达到 ', 'Your plan requires a minimum withdrawal amount of ');
  a('ms.apply.payInfo', '收款资料', 'Payout Details');
  a('ms.apply.editPay', '编辑收款方式', 'Edit payout method');
  a('ms.apply.method', '收款方式', 'Method');
  a('ms.apply.orders', '待提款结算订单', 'Withdrawable Settlements');
  a('ms.apply.empty', '暂无可提款结算单', 'No withdrawable settlements');
  a('ms.apply.rejTail', ' · 上次被拒,可重新申请', ' · previously rejected, re-applicable');
  a('ms.apply.failTail', ' · 上次付款失败,可重新申请', ' · last payment failed, re-applicable');
  a('ms.apply.audrejTail', ' · 核算驳回,可重新申请', ' · audit rejected, re-applicable');
  a('ms.apply.count', '结算单数', 'Settlements');
  a('ms.apply.amount', '佣金金额', 'Commission');
  a('ms.apply.cancel', '取消', 'Cancel');
  a('ms.apply.submit', '申请', 'Apply');
  a('ms.apply.toast', '提款申请已提交', 'Withdrawal request submitted');
  a('ms.apply.toastN', '张结算单', 'settlements');
  a('ms.apply.toastTail', ',待商户审核', ', pending merchant review');
  // 说明弹窗
  a('ms.help.title', '单据流转说明', 'Document Flow Guide');
  a('ms.help.sub', '佣金从结算到付款的 5 层单据链', 'The 5-layer document chain from settlement to payment');
  a('ms.help.ok', '知道了', 'Got it');
  a('ms.help.tabFlow', '单据流程', 'Document Flow');
  a('ms.help.l1n', '分润期号(W/M)', 'Period (W/M)'); a('ms.help.l1d', '定义佣金计算周期 · 如 W26064', 'Defines the commission cycle · e.g. W26064');
  a('ms.help.l2n', '佣金结算单(CS)', 'Commission Settlement (CS)'); a('ms.help.l2d', '计算代理本期佣金 · 本页所在 · 如 CSW26064000001', 'Your per-cycle commission bill · this page · e.g. CSW26064000001');
  a('ms.help.l3n', '提款申请单(WR)', 'Withdrawal Request (WR)'); a('ms.help.l3d', '记录代理一次请款行为 · 可打包多张 CS', 'One withdrawal action · may bundle multiple CS');
  a('ms.help.l4n', '财务核算单(FS)', 'Finance Settlement (FS)'); a('ms.help.l4d', '计算最终应付金额(扣行政费/税金/风控等)', 'Computes net payable (admin fee / tax / risk, etc.)');
  a('ms.help.l5n', '付款单(PO)', 'Payment Order (PO)'); a('ms.help.l5d', '记录实际付款结果与支付凭证', 'Records the actual payment result & receipt');
  a('ms.help.flow', '状态流转:待提款 → 审核中 → 核算中 → 付款中 → 付款成功;提款审核未过 → 已拒绝·待提款,可重新申请;财务核算未过 → 已驳回·待提款,可重新申请;核算应付≤0 → 财务转结(并入下期财务调整);付款失败 → 付款失败·待提款,可重新申请;本期佣金未达结算门槛 → 转结下期(并入下期佣金)。', 'Flow: Withdrawable → Reviewing → Auditing → Paying → Paid; withdrawal review failed → Rejected · Withdrawable (re-applicable); finance audit failed → Audit Rejected · Withdrawable (re-applicable); net payable ≤ 0 → Audit Carried (into next period’s finance adjustment); payment failed → Pay Failed · Withdrawable (re-applicable); commission below settlement threshold → Carried Forward (into next period’s commission).');
})();

function MySettlementModule({ onNav }) {
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const B = window.useBilling();
  const L = window.BILLING_LABELS.cs;
  const toast = ASTUI.useToast();
  const CUR = B.CUR;
  const [lang] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);
  // 日期统一为 年/月/日 时:分:秒(中英一致)
  const fmtDT = (ts) => {
    const d = new Date(ts); const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  };

  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [detail, setDetail] = React.useState(null);
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [blockOpen, setBlockOpen] = React.useState(false);   // v3.7.39 有未结束提款审核 阻断弹窗

  // 收款资料 — 与「我的帐户 → 收款方式」同源(me._payment / _formSnapshot)
  const snap = me._appData?._formSnapshot || {};
  const payInfo = {
    method:   me._payment?.method   || snap.payMethod || 'UPI',
    ifsc:     me._payment?.ifsc     || snap.ifsc      || '',
    account:  me._payment?.account  || snap.account   || '',
    realName: me._payment?.realName || snap.realName  || snap.holder || me.name || '',
    email:    me._payment?.email    || snap.payEmail  || '',
  };
  const gotoPayment = () => {
    window.__AGENT_PROFILE_TAB = 'payment';
    setShowWithdraw(false);
    if (onNav) onNav('mod:my_profile');
  };

  const my = B.csOf(me.id);
  const counts = {
    all: my.length,
    withdrawable: my.filter(s => s.status === 'withdrawable').length,
    reviewing: my.filter(s => s.status === 'reviewing').length,
    auditing: my.filter(s => s.status === 'auditing').length,
    carried: my.filter(s => s.status === 'carried').length,
    rejected: my.filter(s => s.status === 'rejected').length,
    auditRejected: my.filter(s => s.status === 'auditRejected').length,
    auditCarried: my.filter(s => s.status === 'auditCarried').length,
    paying: my.filter(s => s.status === 'paying').length,
    payFailed: my.filter(s => s.status === 'payFailed').length,
    paid: my.filter(s => s.status === 'paid').length,
  };
  // 状态筛选 —— 分组胶囊式(对齐提款审核进度页 .wp-filter)
  const ALL_TAB = { v: 'all', c: counts.all };
  const TAB_GROUPS = [
    { label: T('ms.grp.settle'), tabs: [
      { v: 'withdrawable', c: counts.withdrawable },
    ] },
    { label: T('ms.grp.apply'), tabs: [
      { v: 'reviewing', c: counts.reviewing },
      { v: 'rejected', c: counts.rejected },
    ] },
    { label: T('ms.grp.audit'), tabs: [
      { v: 'auditing', c: counts.auditing },
      { v: 'auditRejected', c: counts.auditRejected },
      { v: 'auditCarried', c: counts.auditCarried },
    ] },
    { label: T('ms.grp.pay'), tabs: [
      { v: 'paying', c: counts.paying },
      { v: 'payFailed', c: counts.payFailed },
      { v: 'paid', c: counts.paid },
    ] },
  ];
  const list = filter === 'all' ? my : my.filter(s => s.status === filter);
  // v3.6.35 表头排序:结算周期(periodRange 起始日)/ 结算时间(settledAt)
  const sorter = window.useTableSort();
  const sortKeys = {
    cycle: (s) => { const m = /(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(s.periodRange || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : (s.settledAt || 0); },
    time: (s) => s.settledAt || 0,
  };
  const sorted = sorter.apply(list, sortKeys);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  // 可发起提款的 CS:待提款 + 已拒绝 + 付款失败(均可重新申请)
  const eligible = my.filter(s => s.status === 'withdrawable' || s.status === 'rejected' || s.status === 'auditRejected' || s.status === 'payFailed');
  const available = eligible.reduce((a, s) => a + s.totalCommission, 0);
  const reviewSum = my.filter(s => s.status === 'reviewing').reduce((a, s) => a + s.totalCommission, 0);
  const paidSum = my.filter(s => s.status === 'paid').reduce((a, s) => a + s.totalCommission, 0);

  const openWithdraw = () => {
    if (eligible.length === 0) { toast(T('ms.btn.noEligible')); return; }
    setShowWithdraw(true);
  };
  const wdAmount = available;
  // 最低申请提款金额 = 该代理分润模式 minCommission(空则回退平台默认),与「我的账户 → 分润模式」同源
  const _applyD = window.RV_PLATFORM_DEFAULTS || { minSettleAmount: 200 };
  const minApply = (me._comm && me._comm.minCommission != null && me._comm.minCommission !== '') ? Number(me._comm.minCommission) : _applyD.minSettleAmount;

  const submitWithdraw = () => {
    if (eligible.length === 0) return;
    // 下限校验:申请提款总额须 ≥ 分润模式最低申请提款金额,不足则提示、不提交
    if (wdAmount < minApply) { toast(T('ms.apply.belowMin', '您的分润模式最低提款申请金额须达到 ') + CUR + F.fmtNum(minApply)); return; }
    // v3.7.39 校验:存在未结束的提款审核(在途状态 审核中/核算中/付款中)→ 阻断,不可再次发起
    const hasUnfinished = my.some(s => s.status === 'reviewing' || s.status === 'auditing' || s.status === 'paying');
    if (hasUnfinished) { setShowWithdraw(false); setBlockOpen(true); return; }
    const wr = B.createWithdraw(me.id, eligible.map(s => s.id), payInfo.method, payInfo.account);
    if (wr) toast(T('ms.apply.toast') + ' · ' + wr.id + ' · ' + wr.csCount + ' ' + T('ms.apply.toastN') + ' ' + CUR + F.fmtNum(wr.amount) + T('ms.apply.toastTail'));
    setShowWithdraw(false);
  };

  const csLabel = (s) => T('ms.st.' + s, (L[s] || {}).label || s);
  const csBadge = (s) => { const d = L[s] || {}; return <span className={'badge ' + (d.tone || 'b-neutral')}>{csLabel(s)}</span>; };
  const docStatusText = (kind, status) => T('ms.' + kind + 'st.' + status, (window.BILLING_LABELS[kind][status] || {}).label || status);
  const docTone = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).tone || 'b-neutral';

  // 该 CS 关联的提款链(WR/FS/PO)
  const chainOf = (cs) => {
    if (!cs || !cs.wrId) return {};
    const wr = B.wrById(cs.wrId);
    const fs = wr && wr.fsId ? B.fsById(wr.fsId) : null;
    const po = fs && fs.poId ? B.poById(fs.poId) : null;
    return { wr, fs, po };
  };

  // 往期财务转结金额累计 = 已财务转结(auditCarried)各期 fs.carryOut 之和
  const auditCarrySum = my.filter(s => s.status === 'auditCarried').reduce((a, s) => { const { fs } = chainOf(s); return a + (fs ? (fs.carryOut || 0) : 0); }, 0);

  return (
    <div className="page">
      <ASTUI.PageHead title={T('ms.page.title')} subtitle={T('ms.page.sub')}>
        <button className="btn" onClick={() => setShowHelp(true)}><Icon name="info" size={13} />{T('ms.btn.guide')}</button>
        <button className="btn primary" onClick={() => openWithdraw()}>
          <Icon name="wallet" size={13} />{T('ms.btn.apply')}
        </button>
      </ASTUI.PageHead>

      <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          [T('ms.kpi.pending'), CUR + F.fmtNum(available), true],
          [T('ms.kpi.reviewCount'), String(counts.reviewing), false],
          [T('ms.kpi.reviewAmt'), CUR + F.fmtNum(reviewSum), false],
          [T('ms.kpi.paidTotal'), CUR + F.fmtNum(paidSum), false],
        ].map(([l, v, hl]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val" style={hl ? { color: 'var(--brand)' } : undefined}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="wp-filter">
          <div className="wp-fgroup">
            <span className="wp-flabel">&nbsp;</span>
            <div className="wp-ftabs">
              <button className={'wp-ftab' + (filter === ALL_TAB.v ? ' on' : '')} onClick={() => { setFilter(ALL_TAB.v); setPage(1); }}>
                {T('ms.tab.all')}<span className="wp-fcount">{ALL_TAB.c}</span>
              </button>
            </div>
          </div>
          {TAB_GROUPS.map(grp => (
            <div key={grp.label} className="wp-fgroup">
              <span className="wp-flabel">{grp.label}</span>
              <div className="wp-ftabs">
                {grp.tabs.map(t => (
                  <button key={t.v} className={'wp-ftab' + (filter === t.v ? ' on' : '')} onClick={() => { setFilter(t.v); setPage(1); }}>
                    {T('ms.tab.' + t.v)}<span className="wp-fcount">{t.c}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>{T('ms.col.period')}</th><th className="right">{T('ms.col.commission')}</th><th>{T('ms.col.csno')}</th>
              <window.SortTh col="cycle" label={T('ms.col.cycle')} sort={sorter.sort} onToggle={sorter.toggle} />
              <window.SortTh col="time" label={T('ms.col.time')} sort={sorter.sort} onToggle={sorter.toggle} />
              <th>{T('ms.col.status')}</th><th>{T('ms.col.updated')}</th>
              <th style={{ width: 110 }}>{T('ms.col.action')}</th>
            </tr></thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>{T('ms.empty')}</td></tr>
              ) : paged.map(s => (
                <tr key={s.id} onClick={() => setDetail(s)} style={{ cursor: 'pointer' }}>
                  <td className="text-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-0)' }}>{s.period}</td>
                  <td className="right text-mono" style={{ color: 'var(--text-0)', fontWeight: 600 }}>{CUR}{F.fmtNum(s.totalCommission)}</td>
                  <td className="id" style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{s.id}</td>
                  <td className="text-mute" style={{ fontSize: 11 }}>{s.periodRange}</td>
                  <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(s.settledAt)}</td>
                  <td>{csBadge(s.status)}</td>
                  <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(s.statusAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="link-act" title={T('ms.act.view')} onClick={() => setDetail(s)}>{T('ms.act.view')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ASTUI.Pagination page={page} pageSize={pageSize} total={list.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }} />
      </div>

      {/* 结算单详情 Drawer — 简洁版:状态 / 基本资料 / 佣金来源 / 客服 */}
      <ASTUI.Drawer open={!!detail} onClose={() => setDetail(null)}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>{T('ms.drawer.title')}</span>}
        subtitle={T('ms.drawer.sub')} width={400}
        footer={detail ? (
          <div style={{ textAlign: 'left', width: '100%', fontSize: 12.5, color: 'var(--text-3)' }}>
            {T('ms.foot.q')} <button className="link-act" onClick={() => { window.APS_OPEN_CONTACT ? window.APS_OPEN_CONTACT() : toast(T('ms.toast.contacting')); }}>{T('ms.foot.contact')}</button>
          </div>
        ) : null}>
        {detail && (() => {
          const { wr, fs, po } = chainOf(detail);
          const carryAmt = detail.status === 'carried' ? detail.totalCommission : (detail.status === 'auditCarried' && fs ? fs.carryOut : 0);
          const stColor = CS_TONE_COLOR[(L[detail.status] || {}).tone] || 'var(--text-1)';
          return (
          <window.CSDetailTabs cs={detail} B={B} CUR={CUR} F={F} en={lang === 'en'} pad="18px 24px 96px" renderDetail={() => (
          <div style={{ padding: '18px 24px 96px' }}>
            {/* 状态 */}
            <div className="drawer-sec">{T('ms.sec.status')}</div>
            <DRow l={T('ms.f.orderStatus')} v={<span style={{ color: stColor, fontWeight: 600 }}>{csLabel(detail.status)}</span>} plain />
            <DRow l={T('ms.f.updateTime')} v={fmtDT(detail.statusAt)} />

            {/* 基本资料 */}
            <div className="drawer-sec">{T('ms.sec.basic')}</div>
            <DRow l={T('ms.f.agentName')} v={me.name} />
            <DRow l={T('ms.f.agentId')} v={me.id} />
            <DRow l={T('ms.f.period')} v={detail.period} />
            <DRow l={T('ms.f.csno')} v={detail.id} />
            <DRow l={T('ms.f.cycle')} v={detail.periodRange} />
            <DRow l={T('ms.f.settleTime')} v={fmtDT(detail.settledAt)} />

            {/* 佣金来源 — 固定单行「可提款金额」(v3.7.56:删本期佣金/往期转入/转结金额分项,转结下期逻辑已废) */}
            <div className="drawer-sec">{T('ms.sec.source')}</div>
            <DRow l={T('ms.f.withdrawable')} v={CUR + F.fmtNum(detail.withdrawable)} vColor="var(--brand)" bold />

            {/* 关联提款申请单(已发起提款时显示) */}
            {wr && (
              <>
                <div className="drawer-sec">{T('ms.sec.linked')}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <ChainRow icon="wallet" label={T('ms.doc.wr')} no={wr.id} statusText={docStatusText('wr', wr.status)} tone={docTone('wr', wr.status)} />
                  {fs && <ChainRow icon="file" label={T('ms.doc.fs')} no={fs.id} statusText={docStatusText('fs', fs.status)} tone={docTone('fs', fs.status)} />}
                  {po && <ChainRow icon="check" label={T('ms.doc.po')} no={po.id} statusText={docStatusText('po', po.status)} tone={docTone('po', po.status)} />}
                </div>
                {(detail.status === 'rejected' || detail.status === 'auditRejected') && (
                  <div style={{ marginTop: 10, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                    本次提款已结束。相关结算单已退回,可在「佣金结算单」重新申请提款。
                  </div>
                )}
                {detail.status === 'payFailed' && (
                  <div style={{ marginTop: 10, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#b91c1c', lineHeight: 1.7 }}>
                    本次提款已结束。相关结算单已退回,可在「佣金结算单」重新申请提款。
                  </div>
                )}
                {detail.status === 'auditCarried' && (
                  <div style={{ marginTop: 10, padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 12, color: '#c2410c', lineHeight: 1.7 }}>
                    本次提款已结束。本次财务核算金额已转结到下期财务调整。
                  </div>
                )}
                <div className="text-mute" style={{ fontSize: 11, marginTop: 8 }}>{T('ms.timeline.hint')}</div>
              </>
            )}
          </div>
          )} />
          );
        })()}
      </ASTUI.Drawer>

      {/* 说明 Modal:5 层单据流转 */}
      <ASTUI.Modal open={showHelp} onClose={() => setShowHelp(false)} title={T('ms.help.title')}
        subtitle={T('ms.help.sub')}
        footer={<button className="btn primary" onClick={() => setShowHelp(false)}>{T('ms.help.ok')}</button>}>
        <window.BillingRulesHelp flowHi="CS" />
      </ASTUI.Modal>

      {/* 申请提款 Modal */}
      <ASTUI.Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title={T('ms.apply.title')}
        subtitle={T('ms.apply.sub')}
        footer={<>
          <button className="btn ghost" onClick={() => setShowWithdraw(false)}>{T('ms.apply.cancel')}</button>
          <button className="btn primary" disabled={eligible.length === 0} onClick={submitWithdraw}>{T('ms.apply.submit')}</button>
        </>}>
        <div className="form-grid">
          {/* 收款资料 */}
          <div className="full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="text-soft" style={{ fontSize: 12 }}>{T('ms.apply.payInfo')}<span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span></label>
              <button className="link-act" onClick={gotoPayment} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="settings" size={12} />{T('ms.apply.editPay')}</button>
            </div>
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px', display: 'grid', gap: 10 }}>
              {[
                [T('ms.apply.method'), payInfo.method || '—'],
                ['IFSC', payInfo.ifsc || '—'],
                ['Account', payInfo.account || '—'],
                ['Real Name', payInfo.realName || '—'],
                ['Email', payInfo.email || '—'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                  <span className="text-mute" style={{ fontSize: 12.5 }}>{k}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-0)', fontFamily: i === 0 ? 'inherit' : 'var(--font-mono)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 待提款结算订单 — 自动关联全部 */}
          <div className="full">
            <label className="text-soft" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{T('ms.apply.orders')}<span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span></label>
            {eligible.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', background: 'var(--bg-2)', borderRadius: 6, color: 'var(--text-3)', fontSize: 12.5 }}>
                {T('ms.apply.empty')}
              </div>
            ) : (
              <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
                {eligible.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--line-soft)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--brand)' }}>{s.period} · {s.id}</div>
                      <div className="text-mute" style={{ fontSize: 11.5, marginTop: 2 }}>{s.periodRange}{s.status === 'rejected' ? T('ms.apply.rejTail') : s.status === 'auditRejected' ? T('ms.apply.audrejTail') : s.status === 'payFailed' ? T('ms.apply.failTail') : ''}</div>
                    </div>
                    <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)' }}>{CUR}{F.fmtNum(s.totalCommission)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 汇总 — 结算单数左对齐 / 佣金金额右对齐 */}
          <div className="full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{T('ms.apply.count')} <strong style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)' }}>{eligible.length}</strong></span>
            <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{T('ms.apply.amount')} <strong className="text-mono" style={{ color: 'var(--brand)', fontSize: 15 }}>{CUR}{F.fmtNum(wdAmount)}</strong></span>
          </div>

          {/* 往期财务转结金额 — 已财务转结(auditCarried)各期 fs.carryOut 之和 */}
          <div className="full" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 8, paddingTop: 2, marginTop: -2 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{T('ms.apply.carrySum', '往期财务转结金额')}</span>
            <strong className="text-mono" style={{ fontSize: 13.5, color: auditCarrySum > 0 ? 'var(--danger)' : 'var(--text-1)' }}>{auditCarrySum > 0 ? '-' + CUR + F.fmtNum(auditCarrySum) : CUR + '0'}</strong>
          </div>

          {/* 最低申请提款金额 — 读分润模式 minCommission;灰字 */}
          <div className="full" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 8, paddingTop: 2, marginTop: -2 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{T('ms.apply.minAmount', '最低申请提款金额')}</span>
            <strong className="text-mono" style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{CUR}{F.fmtNum(minApply)}</strong>
          </div>
        </div>
      </ASTUI.Modal>

      {/* v3.7.39 有未结束提款审核 阻断弹窗 */}
      <ASTUI.Modal open={blockOpen} onClose={() => setBlockOpen(false)} title={T('ms.block.title')} width={360}
        footer={<button className="btn primary" onClick={() => setBlockOpen(false)}>{T('ms.block.ok')}</button>}>
        <div style={{ textAlign: 'center', padding: '10px 6px', fontSize: 13.5, lineHeight: 1.85, color: 'var(--text-1)' }}>{T('ms.block.body')}</div>
      </ASTUI.Modal>
    </div>
  );
}

function ChainRow({ icon, label, no, statusText, tone }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 6 }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--brand-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={14} style={{ color: 'var(--brand)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="text-mute" style={{ fontSize: 10.5 }}>{label}</div>
        <div className="text-mono" style={{ fontSize: 12, color: 'var(--text-0)' }}>{no}</div>
      </div>
      {statusText && <span className={'badge ' + (tone || 'b-neutral')}>{statusText}</span>}
    </div>
  );
}

const CS_TONE_COLOR = {
  'b-brand': '#1d4ed8', 'b-neutral': '#64748b', 'b-warning': '#b45309',
  'b-success': '#15803d', 'b-danger': '#b91c1c', 'b-magenta': '#b83280', 'b-info': '#0e7490', 'b-purple': '#7c3aed', 'b-orange': '#c2410c',
};

// 抽屉内 label-left / value-right 行
function DRow({ l, v, vColor, bold, plain }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '7px 0', borderBottom: '1px solid var(--line-soft)' }}>
      <span className="text-mute" style={{ fontSize: 12.5, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 12.5, color: vColor || 'var(--text-0)', fontWeight: bold ? 600 : 400, fontFamily: plain ? 'inherit' : 'var(--font-mono)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}

// 佣金来源:来源 CS 单号(灰)作小标题 + 金额行
function SrcGroup({ src, label, amount }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="text-mono" style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{src}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-1)' }}>{label}</span>
        <span className="text-mono" style={{ fontSize: 13, color: 'var(--text-0)' }}>{amount}</span>
      </div>
    </div>
  );
}

window.MySettlementModule = MySettlementModule;
