// 共享组件:佣金结算单弹窗的「分页」+「提款流转记录」
// 用途:CS 详情抽屉顶部加 [结算明细 | 提款流转记录] 两个分页。
//   - 结算明细 = 各页原有内容(renderDetail 传入)
//   - 提款流转记录 = 在 store.wr 捞所有 csIds 含本 CS 的 WR(倒序),每次申请一张卡,
//     旧记录不被新申请覆盖(cs.wrId 只指向最新,故历史从 store.wr 还原)
// 共 4 处调用:my_settlement / my_withdraw_progress(代理后台)+ agent_settlement / withdraw_review(商户后台)
(function () {
  const { useState, useEffect } = React;

  const TONE_COLORS = {
    'b-danger': '#dc2626', 'b-orange': '#ea580c', 'b-success': '#16a34a',
    'b-info': '#2563eb', 'b-warning': '#d97706', 'b-neutral': '#64748b',
    'b-brand': '#3b82f6', 'b-purple': '#9333ea', 'b-magenta': '#db2777',
  };

  // 该次申请的终态(综合 WR / FS / PO)
  function outcome(wr, fs, po) {
    if (wr.status === 'rejected') return { zh: '已拒绝', en: 'Rejected', tone: 'b-danger' };
    if (fs) {
      if (fs.status === 'rejected') return { zh: '已驳回', en: 'Audit Rejected', tone: 'b-danger' };
      if (fs.status === 'carried') return { zh: '财务转结', en: 'Finance Carried', tone: 'b-orange' };
      if (fs.status === 'payFailed') return { zh: '付款失败', en: 'Pay Failed', tone: 'b-danger' };
      if (fs.status === 'paid' || (po && (po.status === 'success' || po.status === 'paid'))) return { zh: '已付款', en: 'Paid', tone: 'b-success' };
    }
    return { zh: '进行中', en: 'In Progress', tone: 'b-info' };
  }

  const docStatusText = (kind, status) => (((window.BILLING_LABELS[kind] || {})[status]) || {}).label || status;
  const docTone = (kind, status) => (((window.BILLING_LABELS[kind] || {})[status]) || {}).tone || 'b-neutral';

  function Badge({ text, tone }) {
    const c = TONE_COLORS[tone] || '#64748b';
    return <span style={{ fontSize: 11.5, fontWeight: 600, color: c, background: c + '14', border: '1px solid ' + c + '33', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' }}>{text}</span>;
  }

  function ChainLine({ label, no, status, kind }) {
    const c = TONE_COLORS[docTone(kind, status)] || '#64748b';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12 }}>
        <span style={{ color: 'var(--text-2)', minWidth: 110 }}>{label}</span>
        <span className="text-mono" style={{ color: 'var(--brand)', fontSize: 11.5 }}>{no}</span>
        <span style={{ marginLeft: 'auto', color: c, fontWeight: 600, fontSize: 11.5, whiteSpace: 'nowrap' }}>{docStatusText(kind, status)}</span>
      </div>
    );
  }

  // 提款流转记录:本 CS 的历次提款申请(含被覆盖的旧记录)
  function CSFlowHistory({ cs, B, CUR, F, en }) {
    if (!cs) return null;
    const t = (zh, eng) => (en ? eng : zh);
    const wrs = (B.wr || []).filter(w => w.agentId === cs.agentId && Array.isArray(w.csIds) && w.csIds.includes(cs.id))
      .slice().sort((a, b) => (b.requestAt || 0) - (a.requestAt || 0));
    const total = wrs.length;
    if (total === 0) {
      return <div style={{ padding: '32px 8px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>{t('暂无提款记录', 'No withdrawal records yet')}</div>;
    }
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="text-mute" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          {t('本结算单共发起 ' + total + ' 次提款申请(最新在上)。被拒绝/驳回/付款失败/财务转结后重新申请的历史均保留。', 'Total ' + total + ' withdrawal attempt(s) for this settlement (newest first). History is preserved across rejected / audit-rejected / pay-failed / carried re-applications.')}
        </div>
        {wrs.map((w, i) => {
          const fs = w.fsId ? B.fsById(w.fsId) : null;
          const po = fs && fs.poId ? B.poById(fs.poId) : null;
          const oc = outcome(w, fs, po);
          const seq = total - i; // 最旧 = 第 1 次
          const reason = w.rejectReason || (fs && fs.rejectReason) || null;
          return (
            <div key={w.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-0)' }}>{t('第 ' + seq + ' 次申请', 'Attempt #' + seq)}</span>
                <span style={{ marginLeft: 'auto' }}><Badge text={en ? oc.en : oc.zh} tone={oc.tone} /></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11.5 }}>
                <span className="text-mono" style={{ color: 'var(--brand)' }}>{w.id}</span>
                <span style={{ color: 'var(--text-3)' }}>{new Date(w.requestAt).toLocaleString('zh-CN')}</span>
                <span className="text-mono" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-0)' }}>{CUR}{F.fmtNum(w.amount)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 8, paddingTop: 4 }}>
                <ChainLine label={t('提款申请单(WR)', 'Withdrawal (WR)')} no={w.id} status={w.status} kind="wr" />
                {fs && <ChainLine label={t('财务核算单(FS)', 'Finance (FS)')} no={fs.id} status={fs.status} kind="fs" />}
                {po && <ChainLine label={t('付款单(PO)', 'Payment (PO)')} no={po.id} status={po.status} kind="po" />}
              </div>
              {reason && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11.5, color: '#b91c1c', lineHeight: 1.6 }}>{reason}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 分页外壳:顶部 [结算明细 | 提款流转记录];自带 tab 状态(解决 IIFE 内不能用 hooks)
  function CSDetailTabs({ cs, B, CUR, F, en, pad, renderDetail }) {
    const [tab, setTab] = useState('detail');
    useEffect(() => { setTab('detail'); }, [cs && cs.id]);
    const t = (zh, eng) => (en ? eng : zh);
    const tabBtn = (key, label) => (
      <button onClick={() => setTab(key)} style={{
        flex: 1, padding: '10px 8px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--brand)' : '2px solid transparent',
        color: tab === key ? 'var(--brand)' : 'var(--text-2)',
      }}>{label}</button>
    );
    return (
      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
          {tabBtn('detail', t('结算明细', 'Details'))}
          {tabBtn('history', t('提款流转记录', 'Withdrawal History'))}
        </div>
        {tab === 'detail'
          ? renderDetail()
          : <div style={{ padding: pad || '18px 24px 40px' }}><CSFlowHistory cs={cs} B={B} CUR={CUR} F={F} en={en} /></div>}
      </div>
    );
  }

  window.CSDetailTabs = CSDetailTabs;
  window.CSFlowHistory = CSFlowHistory;
})();
