// 商户后台 - 提款审核(财务)— 审核代理发起的提款申请
const WRUI = window.UI;

function WithdrawReviewModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = WRUI.useToast();

  const [filter, setFilter] = React.useState('pending');
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);
  const [rejectMode, setRejectMode] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  // 基于代理列表生成提款申请假数据(稳定、可被审核改状态)
  const [rows, setRows] = React.useState(() => {
    const agents = D.agents.filter(a => a.status === 'active' && a.players > 0).slice(0, 36);
    const methods = ['USDT-TRC20', 'PIX', '银行电汇', 'USDT-TRC20', 'USDT-ERC20'];
    const baseStatus = ['pending', 'pending', 'pending', 'reviewing', 'approved', 'paid', 'paid', 'rejected'];
    return agents.map((a, i) => {
      const method = methods[i % methods.length];
      const amount = 200 + ((i * 737) % 96) * 50; // 200 ~ 5000
      const fee = method === 'USDT-TRC20' ? 1 : method === 'USDT-ERC20' ? 6 : method === 'PIX' ? 0 : 15;
      const status = baseStatus[i % baseStatus.length];
      const requestAt = Date.now() - ((i * 7 + 3) % 220) * 3600000;
      // 风控信号:余额是否足够、是否新地址、是否风险代理
      const riskFlags = [];
      if (a.risk === 'high') riskFlags.push('代理风险等级高');
      if (i % 9 === 0) riskFlags.push('新收款地址(<24h)');
      if (amount > 4000) riskFlags.push('大额提款');
      if (i % 11 === 0) riskFlags.push('近 7 天提款频次异常');
      return {
        id: 'WD-2026' + String(60000 + i).padStart(5, '0'),
        agentId: a.id,
        agentName: a.name,
        method,
        account: method.startsWith('USDT') ? 'T' + a.id.slice(-4) + 'xx...18jK9q'
          : method === 'PIX' ? '***.456.789-0' + (i % 9)
          : 'Itaú ****' + String(1000 + i).slice(-4),
        amount,
        fee,
        currency: a.currency || 'USD',
        available: amount + 200 + (i % 5) * 480,
        status,
        riskFlags,
        requestAt,
        completedAt: status === 'paid' ? requestAt + 86400000 : null,
        txid: status === 'paid' ? 'TX' + String(900000 + i).slice(-6) : null,
      };
    });
  });

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    reviewing: rows.filter(r => r.status === 'reviewing').length,
    approved: rows.filter(r => r.status === 'approved').length,
    paid: rows.filter(r => r.status === 'paid').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
  };
  const list = filter === 'all' ? rows : rows.filter(r => r.status === filter);
  const pageSize = 12;
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  // KPI
  const pendingAmount = rows.filter(r => r.status === 'pending' || r.status === 'reviewing').reduce((a, r) => a + r.amount, 0);
  const todayPaid = rows.filter(r => r.status === 'paid').reduce((a, r) => a + r.amount, 0);
  const flaggedCount = rows.filter(r => (r.status === 'pending' || r.status === 'reviewing') && r.riskFlags.length > 0).length;

  const setStatus = (id, status, extra = {}) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, status, ...extra } : r));
  };

  const doApprove = (r) => {
    setStatus(r.id, 'approved');
    toast('已通过 ' + r.id + ',加入付款队列');
    setDetail(d => d && d.id === r.id ? { ...d, status: 'approved' } : d);
  };
  const doReject = (r) => {
    if (!rejectReason.trim()) { toast('请填写拒绝原因'); return; }
    setStatus(r.id, 'rejected', { rejectReason });
    toast('已拒绝 ' + r.id);
    setDetail(d => d && d.id === r.id ? { ...d, status: 'rejected', rejectReason } : d);
    setRejectMode(false);
    setRejectReason('');
  };

  const statusBadge = (s) => {
    if (s === 'paid') return <span className="badge b-success"><span className="dot"/>已付款</span>;
    if (s === 'approved') return <span className="badge b-brand"><span className="dot"/>待付款</span>;
    if (s === 'reviewing') return <span className="badge b-warning"><span className="dot"/>审核中</span>;
    if (s === 'pending') return <span className="badge b-warning"><span className="dot"/>待审核</span>;
    if (s === 'rejected') return <span className="badge b-danger"><span className="dot"/>已拒绝</span>;
    return null;
  };

  return (
    <div className="page">
      <WRUI.PageHead title="提款审核" subtitle="审核代理发起的提款申请 · 风控校验 · 加入付款队列">
        <button className="btn ghost"><Icon name="download" size={13}/>导出明细</button>
      </WRUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          ['待审核', counts.pending + ' 笔', '$' + F.money(rows.filter(r=>r.status==='pending').reduce((a,r)=>a+r.amount,0)) + ' 待处理金额'],
          ['处理中金额', '$' + F.money(pendingAmount), counts.reviewing + ' 笔审核中 · ' + counts.approved + ' 笔待付款'],
          ['风控标记', flaggedCount + ' 笔', '待审核中含风险信号,需人工复核'],
          ['累计已付', '$' + F.money(todayPaid), counts.paid + ' 笔已完成付款'],
        ].map(([l, v, d]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            <div className="text-mute" style={{fontSize:11,marginTop:4}}>{d}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="seg">
            {[
              {v:'pending',l:'待审核',c:counts.pending},
              {v:'reviewing',l:'审核中',c:counts.reviewing},
              {v:'approved',l:'待付款',c:counts.approved},
              {v:'paid',l:'已付款',c:counts.paid},
              {v:'rejected',l:'已拒绝',c:counts.rejected},
              {v:'all',l:'全部',c:counts.all},
            ].map(s => (
              <button key={s.v} className={filter===s.v?'active':''} onClick={()=>{setFilter(s.v);setPage(1);}}>
                {s.l}<span className="text-mono text-mute" style={{marginLeft:4}}>({s.c})</span>
              </button>
            ))}
          </div>
          <WRUI.DateRange value="30d" onChange={()=>{}}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>提款单号</th><th>代理</th><th>方式</th><th>收款账户</th>
              <th className="right">金额</th><th className="right">手续费</th><th className="right">实付</th>
              <th>风控</th><th>状态</th><th>申请时间</th><th style={{width:150}}>操作</th>
            </tr></thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id} onClick={()=>{setDetail(r);setRejectMode(false);}} style={{cursor:'pointer'}}>
                  <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{r.id}</td>
                  <td>
                    <div style={{fontSize:12.5,color:'var(--text-0)',fontWeight:500,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.agentName}</div>
                    <div className="text-mono text-mute" style={{fontSize:10.5}}>{r.agentId}</div>
                  </td>
                  <td><span className="badge b-neutral">{r.method}</span></td>
                  <td className="text-mono" style={{fontSize:11}}>{r.account}</td>
                  <td className="right text-mono">${F.money(r.amount)}</td>
                  <td className="right text-mono text-mute">${F.money(r.fee)}</td>
                  <td className="right text-mono" style={{color:'var(--text-0)',fontWeight:600}}>${F.money(r.amount - r.fee)}</td>
                  <td>
                    {r.riskFlags.length > 0
                      ? <span className="badge b-danger" title={r.riskFlags.join(' · ')}><Icon name="alert" size={10}/>{r.riskFlags.length}</span>
                      : <span className="badge b-success"><span className="dot"/>正常</span>}
                  </td>
                  <td>{statusBadge(r.status)}</td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(r.requestAt).toLocaleString('zh-CN')}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    {(r.status === 'pending' || r.status === 'reviewing') ? (
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn sm primary" onClick={()=>doApprove(r)} title="通过"><Icon name="check" size={12}/>通过</button>
                        <button className="btn sm ghost danger" onClick={()=>{setDetail(r);setRejectMode(true);setRejectReason('');}} title="拒绝"><Icon name="x" size={12}/></button>
                      </div>
                    ) : (
                      <button className="btn sm ghost icon-only" title="查看详情" onClick={()=>{setDetail(r);setRejectMode(false);}}><Icon name="eye" size={13}/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <WRUI.Pagination page={page} pageSize={pageSize} total={list.length} onPage={setPage}/>
      </div>

      {/* 提款审核详情 Drawer */}
      <WRUI.Drawer open={!!detail} onClose={()=>{setDetail(null);setRejectMode(false);}} title={detail?'提款审核 · '+detail.id:''} width={620}>
        {detail && (
          <div style={{padding:'20px 24px'}}>
            <div style={{padding:16,background:'linear-gradient(135deg,#3b82f612,transparent)',border:'1px solid var(--brand-line)',borderRadius:8,marginBottom:18}}>
              <div className="text-mute" style={{fontSize:11,marginBottom:4}}>申请提款金额</div>
              <div style={{fontSize:28,fontWeight:600,fontFamily:'var(--font-mono)',color:'var(--brand)'}}>
                ${F.money(detail.amount)} <span style={{fontSize:14,color:'var(--text-3)',fontWeight:400}}>{detail.currency}</span>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
                {statusBadge(detail.status)}
                <span className="text-mute" style={{fontSize:11.5}}>· 实付 ${F.money(detail.amount - detail.fee)}(手续费 ${F.money(detail.fee)})</span>
              </div>
            </div>

            {detail.riskFlags.length > 0 && (
              <div style={{padding:14,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,marginBottom:18}}>
                <div style={{fontSize:12.5,fontWeight:600,color:'#b91c1c',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                  <Icon name="alert" size={14}/> 风控信号 · {detail.riskFlags.length} 项
                </div>
                <div style={{display:'grid',gap:6}}>
                  {detail.riskFlags.map((f,i)=>(
                    <div key={i} style={{fontSize:12,color:'#7f1d1d',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#dc2626'}}/>{f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-section-title" style={{marginTop:0}}>代理与收款信息</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 16px',fontSize:12.5}}>
              <KVW l="代理名称" v={detail.agentName}/>
              <KVW l="代理 ID" v={detail.agentId}/>
              <KVW l="收款方式" v={detail.method}/>
              <KVW l="收款账户" v={detail.account}/>
              <KVW l="账户可用余额" v={'$' + F.money(detail.available)}/>
              <KVW l="申请时间" v={new Date(detail.requestAt).toLocaleString('zh-CN')}/>
            </div>

            <div className="form-section-title mt-3">余额校验</div>
            <table style={{width:'100%',fontSize:12.5}}>
              <tbody>
                <CalcRowW l="账户可用余额" v={'$' + F.money(detail.available)}/>
                <CalcRowW l="本次提款" v={'-$' + F.money(detail.amount)}/>
                <tr>
                  <td style={{padding:'12px 0',color:'var(--text-0)',fontWeight:600,borderTop:'1px solid var(--line)'}}>提款后余额</td>
                  <td style={{padding:'12px 0',textAlign:'right',fontFamily:'var(--font-mono)',fontWeight:600,fontSize:15,color:'var(--success)',borderTop:'1px solid var(--line)'}}>${F.money(detail.available - detail.amount)}</td>
                </tr>
              </tbody>
            </table>

            {detail.status === 'rejected' && detail.rejectReason && (
              <div style={{marginTop:16,padding:12,background:'var(--bg-2)',borderRadius:6,fontSize:12,color:'var(--danger)'}}>
                <strong>拒绝原因:</strong>{detail.rejectReason}
              </div>
            )}

            {detail.status === 'paid' && (
              <div style={{marginTop:16,padding:12,background:'var(--bg-2)',borderRadius:6,fontSize:12}}>
                <div style={{display:'flex',justifyContent:'space-between',padding:'2px 0'}}><span className="text-mute">付款时间</span><span className="text-mono">{new Date(detail.completedAt).toLocaleString('zh-CN')}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'2px 0'}}><span className="text-mute">链上 TXID</span><span className="text-mono">{detail.txid}</span></div>
              </div>
            )}

            {/* 拒绝原因输入 */}
            {rejectMode && (detail.status === 'pending' || detail.status === 'reviewing') && (
              <div style={{marginTop:18}}>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>拒绝原因(将通知代理)</label>
                <textarea className="input" rows="3" style={{width:'100%',resize:'vertical'}} value={rejectReason}
                  onChange={e=>setRejectReason(e.target.value)} placeholder="例:收款地址未通过白名单验证 / 风控复核未通过 / 余额异常"/>
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  {['收款地址未通过白名单验证','风控复核未通过,请联系客服','余额来源待核实'].map(t=>(
                    <button key={t} className="btn sm ghost" onClick={()=>setRejectReason(t)}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            {/* 操作区 */}
            {(detail.status === 'pending' || detail.status === 'reviewing') && (
              <div style={{display:'flex',gap:8,marginTop:20}}>
                {!rejectMode ? (
                  <>
                    <button className="btn primary" onClick={()=>doApprove(detail)}><Icon name="check" size={13}/>通过审核</button>
                    <button className="btn danger ghost" onClick={()=>{setRejectMode(true);setRejectReason('');}}><Icon name="x" size={13}/>拒绝</button>
                  </>
                ) : (
                  <>
                    <button className="btn danger" onClick={()=>doReject(detail)}><Icon name="x" size={13}/>确认拒绝</button>
                    <button className="btn ghost" onClick={()=>{setRejectMode(false);setRejectReason('');}}>取消</button>
                  </>
                )}
              </div>
            )}
            {detail.status === 'approved' && (
              <div style={{display:'flex',gap:8,marginTop:20}}>
                <button className="btn primary" onClick={()=>{setStatus(detail.id,'paid',{completedAt:Date.now(),txid:'TX'+String(900000+Math.floor(Math.random()*99999)).slice(-6)});toast('已标记付款完成');setDetail(d=>({...d,status:'paid',completedAt:Date.now()}));}}><Icon name="wallet" size={13}/>标记付款完成</button>
                <button className="btn ghost"><Icon name="copy" size={13}/>复制收款地址</button>
              </div>
            )}
          </div>
        )}
      </WRUI.Drawer>
    </div>
  );
}

function CalcRowW({l, v}) {
  return (
    <tr>
      <td style={{padding:'10px 0',borderBottom:'1px solid var(--line-soft)',color:'var(--text-1)'}}>{l}</td>
      <td style={{padding:'10px 0',textAlign:'right',fontFamily:'var(--font-mono)',color:'var(--text-0)',borderBottom:'1px solid var(--line-soft)'}}>{v}</td>
    </tr>
  );
}

function KVW({l, v}) {
  return <div><div className="text-mute" style={{fontSize:11}}>{l}</div><div style={{color:'var(--text-0)',marginTop:2,fontFamily:'var(--font-mono)',fontSize:12,wordBreak:'break-all'}}>{v}</div></div>;
}

window.WithdrawReviewModule = WithdrawReviewModule;
