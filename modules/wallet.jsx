// 代理钱包
const WUI = window.UI;

function WalletModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = WUI.useToast();
  const [tab, setTab] = React.useState('overview');
  const [page, setPage] = React.useState(1);

  const wallets = D.agents.slice(0, 30).map(a => ({
    agentId: a.id, name: a.name,
    available: Math.floor(a.commission * 0.4),
    pending: a.pendingCommission,
    frozen: Math.floor(a.commission * 0.05),
    inWithdraw: Math.floor(a.commission * 0.1),
    paid: Math.floor(a.commission * 0.45),
    deducted: Math.floor(a.commission * 0.02),
    status: a.status === 'active' ? 'active' : 'frozen',
    currency: a.currency,
  }));

  const withdrawals = Array.from({length:20}).map((_,i) => ({
    id: 'WD-' + (100000 + i),
    agentId: D.agents[i % D.agents.length].id,
    amount: Math.floor(Math.random() * 50000 + 500),
    method: ['USDT-TRC20','USDT-ERC20','PIX','UPI','Bank Wire'][i % 5],
    address: 'TXxxxx...' + Math.floor(Math.random()*100000),
    appliedAt: Date.now() - i * 86400000 / 4,
    status: ['pending','approved','paid','rejected','pending'][i % 5],
  }));

  return (
    <div className="page">
      <WUI.PageHead title="代理钱包" subtitle="代理佣金钱包与提款管理">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </WUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['总可提款佣金', '$' + F.money(wallets.reduce((a,w)=>a+w.available,0))],
          ['总待结算佣金', '$' + F.money(wallets.reduce((a,w)=>a+w.pending,0))],
          ['总冻结佣金', '$' + F.money(wallets.reduce((a,w)=>a+w.frozen,0))],
          ['提款中', '$' + F.money(wallets.reduce((a,w)=>a+w.inWithdraw,0))],
          ['累计已付款', '$' + F.money(wallets.reduce((a,w)=>a+w.paid,0))],
        ].map(([l,v]) => (
          <div key={l} className="kpi"><div className="label">{l}</div><div className="val">{v}</div></div>
        ))}
      </div>

      <div className="card">
        <WUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'overview',label:'钱包总览',count:wallets.length},
          {key:'withdraw',label:'提款申请',count:withdrawals.filter(w=>w.status==='pending').length},
        ]}/>

        {tab === 'overview' && (
          <>
            <div className="toolbar">
              <WUI.SearchInput value="" onChange={()=>{}} placeholder="代理ID / 名称"/>
              <select className="filter-select"><option>全部状态</option><option>正常</option><option>冻结</option></select>
              <span style={{flex:1}}/>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>代理</th>
                  <th className="right">可提款佣金</th>
                  <th className="right">待结算佣金</th>
                  <th className="right">冻结佣金</th>
                  <th className="right">提款中</th>
                  <th className="right">累计已付款</th>
                  <th className="right">累计扣款</th>
                  <th>钱包状态</th>
                  <th>操作</th>
                </tr></thead>
                <tbody>
                  {wallets.map(w => (
                    <tr key={w.agentId}>
                      <td>
                        <div className="stack">
                          <span style={{color:'var(--text-0)',fontWeight:500}}>{w.name}</span>
                          <span className="id">{w.agentId} · {w.currency}</span>
                        </div>
                      </td>
                      <td className="right" style={{color:'#6ee7a8',fontWeight:600}}>${F.fmtNum(w.available)}</td>
                      <td className="right">${F.fmtNum(w.pending)}</td>
                      <td className="right" style={{color:'#fcd34d'}}>${F.fmtNum(w.frozen)}</td>
                      <td className="right">${F.fmtNum(w.inWithdraw)}</td>
                      <td className="right text-mute">${F.fmtNum(w.paid)}</td>
                      <td className="right num-down">${F.fmtNum(w.deducted)}</td>
                      <td><WUI.StatusBadge status={w.status}/></td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn sm">明细</button>
                          <button className="btn sm">调整</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'withdraw' && (
          <>
            <div className="toolbar">
              <WUI.SearchInput value="" onChange={()=>{}} placeholder="提款单号 / 代理"/>
              <select className="filter-select"><option>全部方式</option><option>USDT-TRC20</option><option>USDT-ERC20</option><option>PIX</option><option>UPI</option></select>
              <select className="filter-select"><option>全部状态</option><option>待审核</option><option>已通过</option><option>已付款</option><option>已拒绝</option></select>
              <span style={{flex:1}}/>
              <button className="btn sm primary">批量审核</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>提款单号</th><th>代理</th>
                  <th className="right">提款金额</th>
                  <th>方式</th><th>收款地址</th>
                  <th>申请时间</th><th>状态</th>
                  <th style={{width:140}}>操作</th>
                </tr></thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w.id}>
                      <td className="id" style={{color:'var(--brand)'}}>{w.id}</td>
                      <td className="id">{w.agentId}</td>
                      <td className="right" style={{color:'var(--text-0)',fontWeight:600}}>${F.fmtNum(w.amount)}</td>
                      <td><span className="badge b-neutral">{w.method}</span></td>
                      <td className="text-mono text-mute" style={{fontSize:11}}>{w.address}</td>
                      <td className="text-mute" style={{fontSize:11}}>{new Date(w.appliedAt).toLocaleString('zh-CN')}</td>
                      <td><WUI.StatusBadge status={w.status === 'paid' ? 'paid' : w.status === 'approved' ? 'approved' : w.status === 'rejected' ? 'rejected' : 'pending'}/></td>
                      <td>
                        {w.status === 'pending' ? (
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn sm" onClick={()=>toast('已通过 ' + w.id)}><Icon name="check" size={11}/>通过</button>
                            <button className="btn sm danger" onClick={()=>toast('已拒绝 ' + w.id, 'error')}><Icon name="x" size={11}/></button>
                          </div>
                        ) : <button className="btn sm ghost"><Icon name="eye" size={12}/>查看</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.WalletModule = WalletModule;
