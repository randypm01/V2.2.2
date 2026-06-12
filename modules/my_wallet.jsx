// 代理后台 - 我的钱包 P0-9
const AWUI = window.UI;

function MyWalletModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const toast = AWUI.useToast();
  const [tab, setTab] = React.useState('overview');
  const [showWithdraw, setShowWithdraw] = React.useState(false);

  // 钱包数据(基于结算单计算)
  const my = D.settlements.filter(s => s.agentId === me.id);
  const totalPaid = my.filter(s=>s.status==='paid').reduce((a,s)=>a+s.total,0);
  const available = my.filter(s=>s.status==='approved').reduce((a,s)=>a+s.total,0) + 1284.50; // 模拟可用余额
  const pending = my.filter(s=>s.status==='review' || s.status==='pending').reduce((a,s)=>a+s.total,0);
  const onHold = 458.20; // 风控冷却

  // 提款记录
  const withdrawals = React.useMemo(() => Array.from({length:14}).map((_,i)=>{
    const statuses = i < 2 ? ['processing','pending'][i] : (i < 4 ? 'reviewing' : 'paid');
    const amt = [1500, 2200, 800, 3000, 1200, 1850, 950, 2400, 1100, 1700, 850, 2950, 1350, 1900][i];
    const methods = ['USDT-TRC20','USDT-TRC20','PIX','USDT-TRC20','银行电汇','PIX','USDT-TRC20'];
    return {
      id: 'WD-2026' + String(50000 + i).padStart(5, '0'),
      amount: amt,
      method: methods[i % methods.length],
      account: methods[i % methods.length] === 'USDT-TRC20' ? 'TXxxx...18jK9q' : methods[i % methods.length] === 'PIX' ? '***.456.789-01' : 'Itaú ****1234',
      fee: methods[i % methods.length] === 'USDT-TRC20' ? 1 : methods[i % methods.length] === 'PIX' ? 0 : 15,
      status: statuses,
      requestAt: Date.now() - (i*3+1) * 86400000,
      completedAt: statuses === 'paid' ? Date.now() - i * 86400000 : null,
      txid: statuses === 'paid' ? 'TX' + String(800000 + i).slice(-6) : null,
    };
  }), []);

  return (
    <div className="page">
      <AWUI.PageHead title="我的钱包" subtitle="代理钱包余额、提款申请与流水">
        <button className="btn primary" onClick={()=>setShowWithdraw(true)}><Icon name="wallet" size={13}/>申请提款</button>
      </AWUI.PageHead>

      {/* 大型余额卡片 */}
      <div style={{
        padding:'24px 28px',
        background:'linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%)',
        borderRadius:10,
        color:'#fff',
        marginBottom:14,
        position:'relative',overflow:'hidden'
      }}>
        <div style={{position:'absolute',right:-30,top:-30,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
        <div style={{position:'absolute',right:60,bottom:-50,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
        <div style={{position:'relative'}}>
          <div style={{fontSize:12,opacity:.85}}>可用余额 ({me.currency})</div>
          <div style={{fontSize:38,fontWeight:600,fontFamily:'var(--font-mono)',marginTop:4,letterSpacing:-0.5}}>
            ${F.fmtNum(available)}
          </div>
          <div style={{display:'flex',gap:30,marginTop:18,fontSize:12,opacity:.95}}>
            <div>
              <div style={{opacity:.7,fontSize:11}}>处理中提款</div>
              <div className="text-mono" style={{fontSize:16,marginTop:2}}>${F.fmtNum(withdrawals.filter(w=>w.status!=='paid').reduce((a,w)=>a+w.amount,0))}</div>
            </div>
            <div>
              <div style={{opacity:.7,fontSize:11}}>待结算</div>
              <div className="text-mono" style={{fontSize:16,marginTop:2}}>${F.fmtNum(pending)}</div>
            </div>
            <div>
              <div style={{opacity:.7,fontSize:11}}>风控冷却</div>
              <div className="text-mono" style={{fontSize:16,marginTop:2}}>${F.fmtNum(onHold)}</div>
            </div>
            <div style={{marginLeft:'auto'}}>
              <div style={{opacity:.7,fontSize:11}}>累计已提</div>
              <div className="text-mono" style={{fontSize:16,marginTop:2}}>${F.fmtNum(totalPaid)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <AWUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'overview', label:'流水总览'},
          {key:'withdrawals', label:'提款记录', count: withdrawals.length},
          {key:'methods', label:'收款方式'},
        ]}/>

        {tab === 'overview' && (
          <div style={{padding:18}}>
            <div className="grid-2" style={{gap:14,marginBottom:14}}>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>近 6 个月收支</div>
                <svg viewBox="0 0 460 200" style={{width:'100%',height:200}}>
                  {[0,1,2,3].map(i => <line key={i} x1="40" y1={20 + i*40} x2="450" y2={20 + i*40} stroke="#e2e8f0" strokeDasharray="2 2"/>)}
                  {(() => {
                    const months = [3245, 2890, 4120, 3680, 4250, 4847];
                    const wd = [3000, 2500, 4000, 3500, 4000, 4500];
                    const max = Math.max(...months, ...wd);
                    return months.map((v, i) => {
                      const x = 60 + i * 65;
                      const h1 = v / max * 140;
                      const h2 = wd[i] / max * 140;
                      return (
                        <g key={i}>
                          <rect x={x} y={170 - h1} width="22" height={h1} fill="#22c55e" rx="2"/>
                          <rect x={x+24} y={170 - h2} width="22" height={h2} fill="#3b82f6" rx="2"/>
                          <text x={x+22} y="186" textAnchor="middle" fontSize="10" fill="#64748b">M{i+1}</text>
                        </g>
                      );
                    });
                  })()}
                </svg>
                <div style={{display:'flex',gap:18,fontSize:11.5,justifyContent:'center',marginTop:6}}>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#22c55e',borderRadius:2,marginRight:4,verticalAlign:'middle'}}/>结算入账</span>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#3b82f6',borderRadius:2,marginRight:4,verticalAlign:'middle'}}/>提款出账</span>
                </div>
              </div>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>钱包安全</div>
                <div style={{display:'grid',gap:10}}>
                  {[
                    ['提款 2FA 验证', '已启用', true, 'shield'],
                    ['提款单笔上限', '$10,000', true, 'wallet'],
                    ['新地址 24h 冷静期', '已启用', true, 'time'],
                    ['可疑提款邮件提醒', '已启用', true, 'bell'],
                    ['白名单地址', '3 个已绑定', true, 'check'],
                  ].map(([l, v, ok, ic], i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--bg-2)',borderRadius:6,fontSize:12.5}}>
                      <Icon name={ic} size={14} style={{color: ok?'var(--success)':'var(--text-3)'}}/>
                      <span style={{flex:1,color:'var(--text-1)'}}>{l}</span>
                      <span className="text-mono" style={{color: ok?'var(--success)':'var(--text-3)'}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-inner">
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>最近 8 笔流水</div>
              <table className="tbl">
                <thead><tr><th>时间</th><th>类型</th><th>说明</th><th className="right">金额</th><th className="right">余额</th><th>状态</th></tr></thead>
                <tbody>
                  {[
                    ['2026-05-12 09:14','结算入账','STL-2026W18-AC100006', '+2,847.50', 4847.50, 'success'],
                    ['2026-05-08 16:22','提款出账','WD-202605000007 → USDT-TRC20', '-1,500.00', 2000.00, 'warning'],
                    ['2026-05-05 10:00','结算入账','STL-2026W17-AC100006', '+2,415.80', 3500.00, 'success'],
                    ['2026-04-30 14:08','调整入账','申诉补发 · CPA-20240425', '+250.00', 1084.20, 'success'],
                    ['2026-04-28 10:30','提款出账','WD-202604000019 → PIX', '-2,200.00', 834.20, 'success'],
                    ['2026-04-25 09:00','结算入账','STL-2026W16-AC100006', '+2,180.40', 3034.20, 'success'],
                    ['2026-04-22 15:42','调整出账','风控扣减 · 玩家 PL2024582', '-180.00', 853.80, 'danger'],
                    ['2026-04-18 09:00','结算入账','STL-2026W15-AC100006', '+1,952.00', 1033.80, 'success'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="text-mute" style={{fontSize:11}}>{r[0]}</td>
                      <td>{r[1].includes('入账') ? <span className="badge b-success">{r[1]}</span> : <span className="badge b-warning">{r[1]}</span>}</td>
                      <td className="text-mute" style={{fontSize:11.5}}>{r[2]}</td>
                      <td className="right text-mono" style={{color: r[3].startsWith('+')?'var(--success)':'var(--danger)',fontWeight:600}}>${r[3]}</td>
                      <td className="right text-mono">${F.fmtNum(r[4])}</td>
                      <td><span className={'badge b-'+r[5]}><span className="dot"/>{r[5]==='success'?'已完成':r[5]==='warning'?'处理中':'已扣减'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'withdrawals' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th>提款单号</th><th>方式</th><th>收款账户</th>
                <th className="right">金额</th><th className="right">手续费</th><th className="right">实际到账</th>
                <th>状态</th><th>申请时间</th><th>完成时间</th><th>TXID</th>
              </tr></thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{w.id}</td>
                    <td><span className="badge b-neutral">{w.method}</span></td>
                    <td className="text-mono" style={{fontSize:11}}>{w.account}</td>
                    <td className="right text-mono">${F.fmtNum(w.amount)}</td>
                    <td className="right text-mono">${F.fmtNum(w.fee)}</td>
                    <td className="right text-mono" style={{color:'var(--text-0)',fontWeight:600}}>${F.fmtNum(w.amount - w.fee)}</td>
                    <td>
                      {w.status === 'paid' && <span className="badge b-success"><span className="dot"/>已到账</span>}
                      {w.status === 'processing' && <span className="badge b-brand"><span className="dot"/>付款中</span>}
                      {w.status === 'reviewing' && <span className="badge b-warning"><span className="dot"/>审核中</span>}
                      {w.status === 'pending' && <span className="badge b-warning"><span className="dot"/>待审核</span>}
                    </td>
                    <td className="text-mute" style={{fontSize:11}}>{new Date(w.requestAt).toLocaleString('zh-CN')}</td>
                    <td className="text-mute" style={{fontSize:11}}>{w.completedAt?new Date(w.completedAt).toLocaleString('zh-CN'):'-'}</td>
                    <td className="text-mono text-mute" style={{fontSize:10.5}}>{w.txid || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'methods' && (
          <div style={{padding:18}}>
            <div style={{display:'grid',gap:10}}>
              {[
                { m:'USDT-TRC20', addr:'TXxxx...18jK9q', primary:true, verified:true, fee:'$1', arrival:'< 30 min' },
                { m:'PIX (CPF)',  addr:'***.456.789-01', primary:false, verified:true, fee:'$0', arrival:'< 5 min' },
                { m:'银行电汇',   addr:'Itaú · Ag 0001 · ****1234', primary:false, verified:false, fee:'$15', arrival:'1 - 3 工作日' },
              ].map((p,i) => (
                <div key={i} style={{padding:14,border:'1px solid var(--line)',borderRadius:8,background:'var(--bg-1)',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:36,height:36,borderRadius:6,background:'var(--bg-2)',display:'grid',placeItems:'center'}}>
                    <Icon name="wallet" size={18} style={{color:'var(--text-2)'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>{p.m}</span>
                      {p.primary && <span className="badge b-brand" style={{fontSize:10}}>默认</span>}
                      {p.verified
                        ? <span className="badge b-success" style={{fontSize:10}}><span className="dot"/>已验证</span>
                        : <span className="badge b-warning" style={{fontSize:10}}><span className="dot"/>待验证</span>}
                    </div>
                    <div className="text-mono text-mute" style={{fontSize:11.5}}>{p.addr}</div>
                  </div>
                  <div style={{textAlign:'right',fontSize:11,marginRight:8}}>
                    <div className="text-mute">手续费 <span className="text-mono" style={{color:'var(--text-1)'}}>{p.fee}</span></div>
                    <div className="text-mute">到账 <span className="text-mono" style={{color:'var(--text-1)'}}>{p.arrival}</span></div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {!p.primary && <button className="btn sm">设为默认</button>}
                    <button className="btn sm ghost">编辑</button>
                  </div>
                </div>
              ))}
              <button className="btn" style={{alignSelf:'start',marginTop:6}}><Icon name="plus" size={13}/>添加收款方式</button>
            </div>
          </div>
        )}
      </div>

      {/* 提款 Modal */}
      <AWUI.Modal open={showWithdraw} onClose={()=>setShowWithdraw(false)} title="申请提款"
        subtitle={'当前可用余额 $' + F.fmtNum(available)}
        footer={<>
          <button className="btn ghost" onClick={()=>setShowWithdraw(false)}>取消</button>
          <button className="btn primary" onClick={()=>{toast('提款已提交,审核通过后 24h 内到账');setShowWithdraw(false);}}><Icon name="check" size={13}/>提交申请</button>
        </>}>
        <div className="form-grid">
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>收款方式</label>
            <select className="select">
              <option>USDT-TRC20 · TXxxx...18jK9q (默认)</option>
              <option>PIX · ***.456.789-01</option>
              <option>银行电汇 · Itaú ****1234</option>
            </select>
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>提款金额 (USD)</label>
            <input className="input" placeholder={'最低 $200,可用 $' + F.fmtNum(available)} defaultValue="1500"/>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              {[500, 1000, 2000, 5000, '全部'].map(amt => (
                <button key={amt} className="btn sm" style={{flex:1}}>${amt}</button>
              ))}
            </div>
          </div>
          <div className="full" style={{padding:12,background:'var(--bg-2)',borderRadius:6,fontSize:12}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <span className="text-mute">提款金额</span><span className="text-mono">$1,500.00</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <span className="text-mute">手续费</span><span className="text-mono">-$1.00</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0 4px',borderTop:'1px solid var(--line)',marginTop:4}}>
              <span style={{color:'var(--text-0)',fontWeight:600}}>实际到账</span>
              <span className="text-mono" style={{color:'var(--brand)',fontWeight:600,fontSize:14}}>$1,499.00</span>
            </div>
            <div className="text-mute" style={{fontSize:11,marginTop:8}}>预计到账时间:30 分钟内 · 区块确认 ≥ 19</div>
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>2FA 验证码</label>
            <input className="input" placeholder="请输入 Google Authenticator 6 位验证码" maxLength="6"/>
          </div>
        </div>
      </AWUI.Modal>
    </div>
  );
}

window.MyWalletModule = MyWalletModule;
