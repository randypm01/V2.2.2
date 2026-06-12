// 共享说明组件:编号规则 + 订单状态机与流转
// 用于 4 个「说明」弹窗:
//   商户后台 → 代理佣金结算单(agent_settlement) / 代理提款审核(withdraw_review)
//   专业代理后台 → 佣金结算单(my_settlement) / 提款审核进度(my_withdraw_progress)
// 单一真源,中英双语。商户端传 lang="zh" 强制中文;代理端不传 lang,自动跟随顶部语言切换。
(function () {
  const React = window.React;

  const TXT = {
    zh: {
      numTitle: '编号规则',
      numSub: '各单据号的组成方式',
      num: [
        ['分润期号', '周结 = W + 年 + 月 + 周序;月结 = M + 年 + 月。周序只能 1~4(每月四周)。例:W26043 = 2026 年 4 月第 3 周;M2604 = 2026 年 4 月。'],
        ['佣金结算单 CS', 'CS + 分润期号 + 6 位流水。例:CSW26043000007。'],
        ['提款申请单 WR', 'WR + 申请日期(YYYYMMDD)+ 6 位流水。例:WR20260429000008。'],
        ['财务核算单 FS', 'FS + 核算日期(YYYYMMDD)+ 6 位流水。'],
        ['付款单 PO', 'PO + 付款日期(YYYYMMDD)+ 6 位流水。'],
      ],
      smTitle: '订单状态机与流转',
      smSub: '佣金结算单(CS)在提款全流程中的 10 种状态',
      groups: [
        { label: '待处理', items: [
          ['待提款', '本期总佣金等待纳入提款申请;发起提款时校验申请总额是否达分润模式最低申请金额。'],
        ] },
        { label: '流转中 · 已在提款申请单内', items: [
          ['审核中', '已纳入提款申请单(WR),等待商户运营审核。'],
          ['核算中', '商户已通过,财务核算单(FS)核算中。'],
          ['付款中', '核算完成,付款单(PO)出款中。'],
        ] },
        { label: '退回 · 可重新申请', items: [
          ['已拒绝·待提款', '商户审核未通过,退回待提款。'],
          ['已驳回·待提款', '财务核算驳回,退回待提款。'],
          ['付款失败·待提款', '出款失败,退回待提款。'],
        ] },
        { label: '终态', items: [
          ['财务转结', '核算后应付 ≤ 0,欠款转结下期财务调整。'],
          ['付款成功', '出款成功,本期佣金结清。'],
        ] },
      ],
      flowTitle: '主流转链',
      flow: '待提款 → 审核中 →(商户通过)核算中 →(核算完成)付款中 →(出款成功)付款成功。审核中被拒 → 已拒绝·待提款;核算中被驳回 → 已驳回·待提款;付款中失败 → 付款失败·待提款 —— 三种退回都回到「待提款」,可重新发起。核算后应付 ≤ 0 → 财务转结(终态);未达门槛 → 转结下期,不进提款流程。',
      noteTitle: '业务规则',
      note: '代理每次发起提款,系统会把当前「所有待提款」结算单一并打包到同一张提款申请单(WR)。且必须等当前提款审核全部结束(付款成功 / 退回待提款)后,才能再次发起提款审核;因此同一时间只有一张提款申请在途,「审核中 / 核算中 / 付款中」不会在同一代理身上同时出现。',
      docTitle: '单据流程',
      docSub: '佣金从结算到付款的 5 层单据链',
      doc: [
        ['period', '分润期号(W/M)', '定义佣金计算周期 · 如 W26064'],
        ['CS', '佣金结算单(CS)', '按代理计算本期佣金 · 如 CSW26064000001'],
        ['WR', '提款申请单(WR)', '记录代理一次请款行为 · 可打包多张 CS'],
        ['FS', '财务核算单(FS)', '计算最终应付金额(扣行政费/税金/风控等)'],
        ['PO', '付款单(PO)', '记录实际付款结果与支付凭证'],
      ],
      tabIntro: '流程',
      tabDocFlow: '单据流程',
      tabNumbering: '编号规则',
      tabState: '订单状态',
      tabBiz: '业务规则',
      tabDocState: '状态流转',
      dsTitle: '单据状态流转',
      dsSub: '提款申请单 / 财务核算单 / 付款单 各自的状态流转',
      docStates: [
        { label: '提款申请单(WR)', flow: '审核中 → 已通过 / 已拒绝', items: [
          ['审核中', '提交后由商户运营审核。'],
          ['已通过', '审核通过,进入财务核算。'],
          ['已拒绝', '审核未通过,相关结算单退回「待提款」,可重新发起。'],
        ] },
        { label: '财务核算单(FS)', flow: '核算中 → 核算完成 / 已驳回 / 已转结', items: [
          ['核算中', '扣除行政费 / 税金 / 风控等,核算应付金额。'],
          ['核算完成', '核算通过,进入付款。'],
          ['已驳回', '核算驳回,退回「待提款」,可重新发起。'],
          ['已转结', '应付 ≤ 0,欠款转结下期财务调整。'],
        ] },
        { label: '付款单(PO)', flow: '付款中 → 付款成功 / 付款失败', items: [
          ['付款中', '核算完成后出款中。'],
          ['付款成功', '出款成功,本次提款完成。'],
          ['付款失败', '出款失败,退回「待提款」,可重新发起。'],
        ] },
      ],
    },
    en: {
      numTitle: 'Numbering Rules',
      numSub: 'How each document ID is composed',
      num: [
        ['Period', 'Weekly = W + Year + Month + Week-of-month; Monthly = M + Year + Month. Week index is 1–4 only (4 weeks per month). e.g. W26043 = 2026 Apr week 3; M2604 = 2026 Apr.'],
        ['Settlement CS', 'CS + Period + 6-digit serial. e.g. CSW26043000007.'],
        ['Withdrawal Request WR', 'WR + request date (YYYYMMDD) + 6-digit serial. e.g. WR20260429000008.'],
        ['Finance Settlement FS', 'FS + audit date (YYYYMMDD) + 6-digit serial.'],
        ['Payment Order PO', 'PO + payment date (YYYYMMDD) + 6-digit serial.'],
      ],
      smTitle: 'Order State Machine & Flow',
      smSub: 'The 10 states of a Commission Settlement (CS) across the withdrawal flow',
      groups: [
        { label: 'Pending', items: [
          ['Withdrawable', 'Awaiting a withdrawal request; the plan’s minimum amount is checked when applying.'],
        ] },
        { label: 'In Progress · inside a request', items: [
          ['Reviewing', 'Bundled into a Withdrawal Request (WR); pending merchant review.'],
          ['Auditing', 'Merchant approved; Finance Settlement (FS) in audit.'],
          ['Paying', 'Audit done; Payment Order (PO) paying out.'],
        ] },
        { label: 'Returned · re-applicable', items: [
          ['Rejected · Withdrawable', 'Merchant review failed; returned to withdrawable.'],
          ['Declined · Withdrawable', 'Finance audit declined; returned to withdrawable.'],
          ['Pay Failed · Withdrawable', 'Payout failed; returned to withdrawable.'],
        ] },
        { label: 'Final', items: [
          ['Finance Carried', 'Net payable ≤ 0 after audit; debt carried to next period.'],
          ['Paid', 'Payout succeeded; period commission settled.'],
        ] },
      ],
      flowTitle: 'Main Flow',
      flow: 'Withdrawable → Reviewing →(approved)Auditing →(done)Paying →(success)Paid. If review fails → Rejected·Withdrawable; if audit declines → Declined·Withdrawable; if payout fails → Pay Failed·Withdrawable — all three return to Withdrawable and can be re-applied. Net payable ≤ 0 → Finance Carried (final); below threshold → Carried Forward (skips the withdrawal flow).',
      noteTitle: 'Business Rule',
      note: 'Each time an agent applies, the system bundles ALL currently-withdrawable settlements into one Withdrawal Request (WR). A new request can only be submitted after the current one has fully finished (paid or returned to withdrawable). So only one request is ever in flight at a time — “Reviewing / Auditing / Paying” will not co-exist for the same agent.',
      docTitle: 'Document Flow',
      docSub: 'The 5-layer document chain from settlement to payout',
      doc: [
        ['period', 'Period (W/M)', 'Defines the commission cycle · e.g. W26064'],
        ['CS', 'Settlement (CS)', 'Per-agent commission for the period · e.g. CSW26064000001'],
        ['WR', 'Withdrawal Request (WR)', 'One request action · may bundle multiple CS'],
        ['FS', 'Finance Settlement (FS)', 'Final payable (less admin fee / tax / risk, etc.)'],
        ['PO', 'Payment Order (PO)', 'Actual payout result and proof of payment'],
      ],
      tabIntro: 'Flow',
      tabDocFlow: 'Documents',
      tabNumbering: 'Numbering',
      tabState: 'Order States',
      tabBiz: 'Business Rule',
      tabDocState: 'Status Flow',
      dsTitle: 'Document Status Flow',
      dsSub: 'Status flow of Withdrawal Request / Finance Settlement / Payment Order',
      docStates: [
        { label: 'Withdrawal Request (WR)', flow: 'Reviewing → Approved / Rejected', items: [
          ['Reviewing', 'Reviewed by merchant operations after submission.'],
          ['Approved', 'Approved; proceeds to finance audit.'],
          ['Rejected', 'Review failed; related settlements return to “Withdrawable” and can be re-applied.'],
        ] },
        { label: 'Finance Settlement (FS)', flow: 'Auditing → Audited / Declined / Carried', items: [
          ['Auditing', 'Computes payable after admin fee / tax / risk deductions.'],
          ['Audited', 'Passed; proceeds to payment.'],
          ['Declined', 'Declined; returns to “Withdrawable” and can be re-applied.'],
          ['Carried', 'Net payable ≤ 0; debt carried to next-period finance adjustment.'],
        ] },
        { label: 'Payment Order (PO)', flow: 'Paying → Paid / Pay Failed', items: [
          ['Paying', 'Paying out after audit is done.'],
          ['Paid', 'Payout succeeded; this withdrawal is complete.'],
          ['Pay Failed', 'Payout failed; returns to “Withdrawable” and can be re-applied.'],
        ] },
      ],
    },
  };

  // 分页(tab)说明容器。props:
  //   lang        — 'zh' 强制中文(商户端);不传则跟随顶部语言(代理端)
  //   mode        — 'full'(佣金结算单页)= 单据流程 / 编号规则(分润期号+CS)/ 订单状态 / 流转;
  //                 'numbering'(提款审核页)= 单据流程 / 编号规则(WR/FS/PO);状态机归佣金结算单页
  //   intro       — 页面专属流程图(如提款审核页的「审核流程」三段),作为第一页(ReactNode);不传则无此页
  //   introLabel  — 第一页 tab 标签(如「审核流程」)
  //   flowHi      — 单据流程中高亮的单据 key(本页所在,如 'CS' / 'WR'),默认不高亮
  function BillingRulesHelp({ lang, mode, intro, introLabel, flowHi }) {
    // 始终调用 hook(保持顺序稳定);代理端不传 lang 时用其订阅值,商户端显式传 'zh'
    const subscribed = window.useAgentLang ? window.useAgentLang()[0] : 'zh';
    const useLang = lang || subscribed;
    const t = TXT[useLang === 'en' ? 'en' : 'zh'];
    const onlyNumbering = mode === 'numbering';

    const box = { padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 6 };
    const Head = ({ title, sub }) => (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-0)' }}>{title}</div>
        <div className="text-mute" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>
      </div>
    );

    // —— 单据流程(5 层单据链,内建共享)——
    const docFlowNode = (
      <div>
        <Head title={t.docTitle} sub={t.docSub} />
        <div style={{ display: 'grid', gap: 10 }}>
          {t.doc.map(([k, ti, ds], i) => {
            const on = k === flowHi;
            return (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: on ? 'var(--brand-soft)' : 'var(--bg-2)', borderRadius: 6, border: on ? '1px solid var(--brand-line)' : 'none' }}>
                <span className="text-mono text-mute" style={{ fontSize: 11, flexShrink: 0, paddingTop: 1 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{ti}</div>
                  <div className="text-mute" style={{ fontSize: 11.5, marginTop: 2 }}>{ds}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    // —— 编号规则(按页过滤:佣金结算单页=分润期号+CS;提款审核页=WR/FS/PO)——
    const numItems = onlyNumbering ? t.num.slice(2) : t.num.slice(0, 2);
    const numberingNode = (
      <div>
        <Head title={t.numTitle} sub={t.numSub} />
        <div style={{ display: 'grid', gap: 8 }}>
          {numItems.map(([k, v], i) => (
            <div key={i} style={box}>
              <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{k}</div>
              <div className="text-mute" style={{ fontSize: 11.5, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    );

    // —— 订单状态(顶部先放主流转链,再列状态分组)——
    const stateNode = (
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-0)', marginBottom: 8 }}>{t.flowTitle}</div>
          <div style={{ ...box, color: 'var(--text-2)', fontSize: 11.5 }}>{t.flow}</div>
        </div>
        <div>
          <Head title={t.smTitle} sub={t.smSub} />
          <div style={{ display: 'grid', gap: 10 }}>
            {t.groups.map((g, gi) => (
              <div key={gi}>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: 'var(--text-2)', marginBottom: 5 }}>{g.label}</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {g.items.map(([nm, ds], ii) => (
                    <div key={ii} style={{ ...box, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-0)', whiteSpace: 'nowrap', flexShrink: 0 }}>{nm}</span>
                      <span className="text-mute" style={{ fontSize: 11.5 }}>{ds}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // —— 业务规则(仅业务规则提示)——
    const bizNode = (
      <div style={{ padding: '10px 12px', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)', borderRadius: 6, color: 'var(--text-1)', fontSize: 11.5, lineHeight: 1.7 }}>
        <div style={{ fontWeight: 600, marginBottom: 3 }}>{t.noteTitle}</div>
        {t.note}
      </div>
    );

    // —— 单据状态流转(WR/FS/PO 各自状态,提款审核页专用)——
    const docStateNode = (
      <div>
        <Head title={t.dsTitle} sub={t.dsSub} />
        <div style={{ display: 'grid', gap: 14 }}>
          {t.docStates.map((d, di) => (
            <div key={di}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-0)' }}>{d.label}</span>
                <span className="text-mono" style={{ fontSize: 11, color: 'var(--brand)' }}>{d.flow}</span>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {d.items.map(([nm, ds], ii) => (
                  <div key={ii} style={{ ...box, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-0)', whiteSpace: 'nowrap', flexShrink: 0 }}>{nm}</span>
                    <span className="text-mute" style={{ fontSize: 11.5 }}>{ds}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // —— 组装 tab ——
    // 佣金结算单(full):业务规则 / 单据流程 / 编号规则 / 订单状态
    // 提款审核(numbering):审核流程 / 单据流程 / 编号规则 / 状态流转(WR/FS/PO)
    const tabs = [];
    if (!onlyNumbering) tabs.push({ key: 'biz', label: t.tabBiz, node: bizNode });
    if (intro) tabs.push({ key: 'intro', label: introLabel || t.tabIntro, node: intro });
    tabs.push({ key: 'doc', label: t.tabDocFlow, node: docFlowNode });
    tabs.push({ key: 'num', label: t.tabNumbering, node: numberingNode });
    if (!onlyNumbering) tabs.push({ key: 'state', label: t.tabState, node: stateNode });
    if (onlyNumbering) tabs.push({ key: 'docstate', label: t.tabDocState, node: docStateNode });

    const [active, setActive] = React.useState(tabs[0].key);
    const cur = tabs.find((x) => x.key === active) || tabs[0];

    return (
      <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line-soft)', marginBottom: 16 }}>
          {tabs.map((tb) => {
            const on = tb.key === cur.key;
            return (
              <button key={tb.key} onClick={() => setActive(tb.key)}
                style={{
                  appearance: 'none', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', fontSize: 13, fontWeight: on ? 700 : 500,
                  color: on ? 'var(--brand)' : 'var(--text-2)',
                  borderBottom: on ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1, transition: 'color .15s',
                }}>
                {tb.label}
              </button>
            );
          })}
        </div>
        <div>{cur.node}</div>
      </div>
    );
  }

  window.BillingRulesHelp = BillingRulesHelp;
})();
