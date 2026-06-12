// 商户后台 - 代理佣金结算单(CS) P0-8
// v3.7.2 整页样式对齐「专业代理后台 → 佣金结算单」(my_settlement.jsx):
//   同 KPI / 同 Tabs / 同清爽 400px 抽屉 / 同说明弹窗。
//   与代理后台差异仅 4 点:① 多 代理ID + 代理名称 两列 ② 多搜索 ③ 标题副标题不同
//   ④ 数据源是全代理 cs(代理后台是 csOf(me));两边共读 data-billing.js,AC100006 范例天然对得上。
//   商户不发起提款,故顶栏用「导出明细」替代代理端的「申请提款」;保留「说明」。
const AGSUI = window.UI;

function AgentSettlementModule() {
  const F = window.APS_FMT;
  const B = window.useBilling();
  const L = window.BILLING_LABELS.cs;
  const CUR = B.CUR;

  const fmtDT = (ts) => {
    const d = new Date(ts); const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  };

  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [detail, setDetail] = React.useState(null);
  const [showHelp, setShowHelp] = React.useState(false);
  const sorter = window.useTableSort();

  // —— 全代理 CS ——(本页范例只保留 AC100006，其余代理范例不显示)
  const all = B.cs.filter(c => c.agentId === 'AC100006');
  const counts = {
    all: all.length,
    withdrawable: all.filter(c => c.status === 'withdrawable').length,
    reviewing: all.filter(c => c.status === 'reviewing').length,
    auditing: all.filter(c => c.status === 'auditing').length,
    carried: all.filter(c => c.status === 'carried').length,
    rejected: all.filter(c => c.status === 'rejected').length,
    auditRejected: all.filter(c => c.status === 'auditRejected').length,
    auditCarried: all.filter(c => c.status === 'auditCarried').length,
    paying: all.filter(c => c.status === 'paying').length,
    payFailed: all.filter(c => c.status === 'payFailed').length,
    paid: all.filter(c => c.status === 'paid').length,
  };
  // 9 状态页签(与代理后台一致)
  // 状态筛选 —— 分组胶囊式(对齐提款审核进度页 .wp-filter)
  const ALL_TAB = { v: 'all', l: '全部', c: counts.all };
  const TAB_GROUPS = [
    { label: '结算', tabs: [
      { v: 'withdrawable', l: '待提款', c: counts.withdrawable },
    ] },
    { label: '提款申请', tabs: [
      { v: 'reviewing', l: '审核中', c: counts.reviewing },
      { v: 'rejected', l: '已拒绝', c: counts.rejected },
    ] },
    { label: '财务核算', tabs: [
      { v: 'auditing', l: '核算中', c: counts.auditing },
      { v: 'auditRejected', l: '已驳回', c: counts.auditRejected },
      { v: 'auditCarried', l: '财务转结', c: counts.auditCarried },
    ] },
    { label: '付款', tabs: [
      { v: 'paying', l: '付款中', c: counts.paying },
      { v: 'payFailed', l: '付款失败', c: counts.payFailed },
      { v: 'paid', l: '付款成功', c: counts.paid },
    ] },
  ];

  // 筛选 → 搜索 → 排序 → 分页
  let rows = filter === 'all' ? all : all.filter(c => c.status === filter);
  if (q.trim()) {
    const k = q.trim().toLowerCase();
    rows = rows.filter(c => c.agentId.toLowerCase().includes(k) || c.agentName.toLowerCase().includes(k) || c.id.toLowerCase().includes(k));
  }
  rows = sorter.apply(rows, {
    cycle: (c) => { const m = /(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(c.periodRange || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : (c.settledAt || 0); },
    time: (c) => c.settledAt || 0,
  });
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  // —— KPI(全代理合计)——
  const eligible = all.filter(c => c.status === 'withdrawable' || c.status === 'rejected' || c.status === 'auditRejected' || c.status === 'payFailed');
  const pendingSum = eligible.reduce((a, c) => a + c.totalCommission, 0);
  const reviewSum = all.filter(c => c.status === 'reviewing').reduce((a, c) => a + c.totalCommission, 0);
  const paidSum = all.filter(c => c.status === 'paid').reduce((a, c) => a + c.totalCommission, 0);

  const csLabel = (s) => (L[s] || {}).label || s;
  const csBadge = (s) => { const d = L[s] || {}; return <span className={'badge ' + (d.tone || 'b-neutral')}>{d.label || s}</span>; };
  const docStatusText = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).label || status;
  const docTone = (kind, status) => (window.BILLING_LABELS[kind][status] || {}).tone || 'b-neutral';
  const chainOf = (cs) => {
    if (!cs || !cs.wrId) return {};
    const wr = B.wrById(cs.wrId);
    const fs = wr && wr.fsId ? B.fsById(wr.fsId) : null;
    const po = fs && fs.poId ? B.poById(fs.poId) : null;
    return { wr, fs, po };
  };

  return (
    <div className="page">
      <AGSUI.PageHead title="代理佣金结算单" subtitle="所有代理在各分润期号的佣金帐单(CS)· 作为提款审核与付款的依据">
        <button className="btn" onClick={() => setShowHelp(true)}><Icon name="info" size={13} />说明</button>
      </AGSUI.PageHead>

      <div className="kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          ['待申请提款总金额', CUR + F.fmtNum(pendingSum), true],
          ['审核中总订单数', String(counts.reviewing), false],
          ['审核中总金额', CUR + F.fmtNum(reviewSum), false],
          ['累计已付款总金额', CUR + F.fmtNum(paidSum), false],
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
                {ALL_TAB.l}<span className="wp-fcount">{ALL_TAB.c}</span>
              </button>
            </div>
          </div>
          {TAB_GROUPS.map(grp => (
            <div key={grp.label} className="wp-fgroup">
              <span className="wp-flabel">{grp.label}</span>
              <div className="wp-ftabs">
                {grp.tabs.map(t => (
                  <button key={t.v} className={'wp-ftab' + (filter === t.v ? ' on' : '')} onClick={() => { setFilter(t.v); setPage(1); }}>
                    {t.l}<span className="wp-fcount">{t.c}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 搜索行(商户专属) */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="top-search" style={{ width: 280 }}>
            <Icon name="search" size={13} />
            <input placeholder="代理ID / 代理名称 / 佣金结算单号" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>代理ID</th><th>代理名称</th>
              <th>分润期号</th><th className="right">佣金</th><th>佣金结算单号</th>
              <window.SortTh col="cycle" label="结算周期" sort={sorter.sort} onToggle={sorter.toggle} />
              <window.SortTh col="time" label="结算时间" sort={sorter.sort} onToggle={sorter.toggle} />
              <th>订单状态</th><th>状态更新时间</th>
              <th style={{ width: 70 }}>操作</th>
            </tr></thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>暂无符合条件的结算单</td></tr>
              ) : paged.map(c => (
                <tr key={c.agentId + '-' + c.id} onClick={() => setDetail(c)} style={{ cursor: 'pointer' }}>
                  <td className="text-mono" style={{ fontSize: 11.5, color: 'var(--text-1)' }}>{c.agentId}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-0)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.agentName}</td>
                  <td className="text-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-0)' }}>{c.period}</td>
                  <td className="right text-mono" style={{ color: 'var(--text-0)', fontWeight: 600 }}>{CUR}{F.fmtNum(c.totalCommission)}</td>
                  <td className="id" style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{c.id}</td>
                  <td className="text-mute" style={{ fontSize: 11 }}>{c.periodRange}</td>
                  <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(c.settledAt)}</td>
                  <td>{csBadge(c.status)}</td>
                  <td className="text-mute" style={{ fontSize: 11.5 }}>{fmtDT(c.statusAt)}</td>
                  <td onClick={e => e.stopPropagation()}><button className="link-act" onClick={() => setDetail(c)}>查看</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AGSUI.Pagination page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }} />
      </div>

      {/* 结算单详情 Drawer — 对齐代理后台清爽版(400px) */}
      <AGSUI.Drawer open={!!detail} onClose={() => setDetail(null)}
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>佣金结算单</span>}
        subtitle="本期佣金结算明细与提款流转状态" width={400}>
        {detail && (() => {
          const { wr, fs, po } = chainOf(detail);
          const carryAmt = detail.status === 'carried' ? detail.totalCommission : (detail.status === 'auditCarried' && fs ? fs.carryOut : 0);
          const stColor = AGS_CS_TONE_COLOR[(L[detail.status] || {}).tone] || 'var(--text-1)';
          return (
          <window.CSDetailTabs cs={detail} B={B} CUR={CUR} F={F} en={false} pad="18px 24px 40px" renderDetail={() => (
          <div style={{ padding: '18px 24px 40px' }}>
            {/* 状态 */}
            <div className="drawer-sec">状态</div>
            <AGS_DRow l="订单状态" v={<span style={{ color: stColor, fontWeight: 600 }}>{csLabel(detail.status)}</span>} plain />
            <AGS_DRow l="更新时间" v={fmtDT(detail.statusAt)} />

            {/* 基本资料 */}
            <div className="drawer-sec">基本资料</div>
            <AGS_DRow l="代理名称" v={detail.agentName} />
            <AGS_DRow l="代理 ID" v={detail.agentId} />
            <AGS_DRow l="分润期号" v={detail.period} />
            <AGS_DRow l="结算单号" v={detail.id} />
            <AGS_DRow l="结算周期" v={detail.periodRange} />
            <AGS_DRow l="结算时间" v={fmtDT(detail.settledAt)} />

            {/* 结算金额 — 单行「分润期号·{period}」+ 可提款金额值(v3.7.70:与代理侧 my_settlement v3.7.69 对齐,删本期佣金/往期转结/可提款金额/转结金额多行) */}
            <div className="drawer-sec">结算金额</div>
            <AGS_DRow l={"分润期号·" + detail.period} v={CUR + F.fmtNum(detail.withdrawable)} vColor="var(--brand)" bold />

            {/* 关联提款申请单 */}
            {wr && (
              <>
                <div className="drawer-sec">关联提款申请单</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <AGS_ChainRow icon="wallet" label="提款申请单(WR)" no={wr.id} statusText={docStatusText('wr', wr.status)} tone={docTone('wr', wr.status)} />
                  {fs && <AGS_ChainRow icon="file" label="财务核算单(FS)" no={fs.id} statusText={docStatusText('fs', fs.status)} tone={docTone('fs', fs.status)} />}
                  {po && <AGS_ChainRow icon="check" label="付款单(PO)" no={po.id} statusText={docStatusText('po', po.status)} tone={docTone('po', po.status)} />}
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
                <div className="text-mute" style={{ fontSize: 11, marginTop: 8 }}>完整流转时间轴可在「提款审核」查看。</div>
              </>
            )}
          </div>
          )} />
          );
        })()}
      </AGSUI.Drawer>

      {/* 说明 Modal:5 层单据流转(与代理后台一致) */}
      <AGSUI.Modal open={showHelp} onClose={() => setShowHelp(false)} title="单据流转说明"
        subtitle="佣金从结算到付款的 5 层单据链"
        footer={<button className="btn primary" onClick={() => setShowHelp(false)}>知道了</button>}>
        <window.BillingRulesHelp lang="zh" flowHi="CS" />
      </AGSUI.Modal>
    </div>
  );
}

const AGS_CS_TONE_COLOR = {
  'b-brand': '#1d4ed8', 'b-neutral': '#64748b', 'b-warning': '#b45309',
  'b-success': '#15803d', 'b-danger': '#b91c1c', 'b-magenta': '#b83280', 'b-info': '#0e7490', 'b-purple': '#7c3aed', 'b-orange': '#c2410c',
};

function AGS_DRow({ l, v, vColor, bold, plain }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '7px 0', borderBottom: '1px solid var(--line-soft)' }}>
      <span className="text-mute" style={{ fontSize: 12.5, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 12.5, color: vColor || 'var(--text-0)', fontWeight: bold ? 600 : 400, fontFamily: plain ? 'inherit' : 'var(--font-mono)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}

function AGS_SrcGroup({ src, label, amount }) {
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

function AGS_ChainRow({ icon, label, no, statusText, tone }) {
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

window.AgentSettlementModule = AgentSettlementModule;
