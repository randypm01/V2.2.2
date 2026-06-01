// 代理后台 - 我的结算单 P0-8
const ASTUI = window.UI;

function MySettlementModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const toast = ASTUI.useToast();
  const [tab, setTab] = React.useState('list');
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [wdSelected, setWdSelected] = React.useState({});
  const [wdMethod, setWdMethod] = React.useState('USDT-TRC20 · TXxxx...18jK9q (默认)');

  // v3.2.25 结算单提款生命周期状态机:
  //   carried(转结下期·未达门槛) / withdrawable(待提款) / reviewing(提款审核中)
  //   / paid(已提款) / rejected(已驳回·可重新申请)
  // 链路:报表已结算→生成结算单→[达门槛=待提款 | 未达门槛=转结下期]
  //       →勾选申请提款→提款审核中→商户通过(已提款)/驳回(已驳回→退回待提款)
  const WD_THRESHOLD = 1000; // 提款门槛 ₹1000,低于此金额结转下期合并
  const [override, setOverride] = React.useState({}); // id -> status,本地操作流转覆盖

  // v3.2.26 结算单与「分润报表 → 已结算分润」一一对应:
  //   同期号(W26054…)、RevShare 金额 = 该期报表「总佣金」、同币种(₹)。
  //   数据源自 my_revshare.jsx 暴露的 getSettledRevsharePeriods(共享真源)。
  const periods = (window.getSettledRevsharePeriods ? window.getSettledRevsharePeriods(me.id, 'weekly') : []);
  const my = periods.map(p => {
    const revShare = p.commission;          // = 分润报表该期「总佣金」
    const cpa = p.cpa || 0;
    const adjust = p.adj || 0;
    const total = cpa + revShare + adjust;
    const id = 'STM-' + p.week;
    let status;
    if (total < WD_THRESHOLD) status = 'carried';   // 未达门槛 → 转结下期
    else status = p.wdStatus || 'withdrawable';     // 报表期次预设的提款状态
    if (override[id]) status = override[id];         // 本地操作覆盖
    return {
      id,
      period: p.week,
      periodRange: String(p.start).replace(/\s.*$/, '') + ' ~ ' + String(p.end).replace(/\s.*$/, ''),
      cpa, revShare, adjust, total,
      status,
      playerCount: p.playerCount,
      generated: p.endTs,
      paidAt: status === 'paid' ? p.endTs + 2 * 86400000 : null,
      txid: status === 'paid' ? 'TX' + p.week : null,
      payoutMethod: me.payoutMethod || 'USDT-TRC20',
    };
  });
  const counts = {
    all: my.length,
    withdrawable: my.filter(s=>s.status==='withdrawable').length,
    reviewing: my.filter(s=>s.status==='reviewing').length,
    paid: my.filter(s=>s.status==='paid').length,
    rejected: my.filter(s=>s.status==='rejected').length,
    carried: my.filter(s=>s.status==='carried').length,
  };
  const list = filter === 'all' ? my : my.filter(s=>s.status===filter);
  const pageSize = 12;
  const paged = list.slice((page-1)*pageSize, page*pageSize);

  const totalPaid = my.filter(s=>s.status==='paid').reduce((a,s)=>a+s.total,0);
  const reviewSum = my.filter(s=>s.status==='reviewing').reduce((a,s)=>a+s.total,0);
  const carriedSum = my.filter(s=>s.status==='carried').reduce((a,s)=>a+s.total,0);
  // 待提款 = 已结算达门槛、可发起提款的结算单
  const withdrawable = my.filter(s=>s.status==='withdrawable');
  const available = withdrawable.reduce((a,s)=>a+s.total,0);
  const wdFee = 1;

  const openWithdraw = (preselectId) => {
    const init = {};
    withdrawable.forEach(s => { init[s.id] = preselectId ? (s.id === preselectId) : true; });
    setWdSelected(init);
    setWdMethod('USDT-TRC20 · TXxxx...18jK9q (默认)');
    setShowWithdraw(true);
  };
  const wdList = withdrawable.filter(s => wdSelected[s.id]);
  const wdAmount = wdList.reduce((a,s)=>a+s.total,0);
  const toggleWd = (id) => setWdSelected(m => ({ ...m, [id]: !m[id] }));
  const allWdChecked = withdrawable.length > 0 && withdrawable.every(s => wdSelected[s.id]);

  return (
    <div className="page">
      <ASTUI.PageHead title="我的结算单" subtitle="按周生成 · 每期对应「分润报表 → 已结算分润」该期总佣金 + CPA + 调整项">
        <button className="btn ghost"><Icon name="download" size={13}/>导出全部</button>
        <button className="btn primary" disabled={withdrawable.length===0} onClick={()=>openWithdraw()}><Icon name="wallet" size={13}/>申请提款{withdrawable.length>0?' ('+withdrawable.length+')':''}</button>
      </ASTUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          ['待提款', '₹' + F.money(available), counts.withdrawable + ' 张可提 · 点右上申请', true],
          ['提款审核中', '₹' + F.money(reviewSum), counts.reviewing + ' 张待商户审核', false],
          ['累计已提', '₹' + F.money(totalPaid), counts.paid + ' 张已到账', false],
          ['转结下期', '₹' + F.money(carriedSum), counts.carried + ' 张未达 ₹' + WD_THRESHOLD + ' 门槛', false],
        ].map(([l,v,d,hl]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val" style={hl?{color:'var(--brand)'}:undefined}>{v}</div>
            <div className="text-mute" style={{fontSize:11,marginTop:4}}>{d}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <ASTUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'list', label:'结算单列表', count: counts.all},
          {key:'cycle', label:'结算周期'},
        ]}/>

        {tab === 'list' && (
          <>
            <div className="toolbar">
              <div className="seg">
                {[
                  {v:'all',l:'全部',c:counts.all},
                  {v:'withdrawable',l:'待提款',c:counts.withdrawable},
                  {v:'reviewing',l:'提款审核中',c:counts.reviewing},
                  {v:'paid',l:'已提款',c:counts.paid},
                  {v:'rejected',l:'已驳回',c:counts.rejected},
                  {v:'carried',l:'转结下期',c:counts.carried},
                ].map(s=>(
                  <button key={s.v} className={filter===s.v?'active':''} onClick={()=>{setFilter(s.v);setPage(1);}}>
                    {s.l}<span className="text-mono text-mute" style={{marginLeft:4}}>({s.c})</span>
                  </button>
                ))}
              </div>
              <ASTUI.DateRange value="90d" onChange={()=>{}}/>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>结算单号</th><th>周期</th>
                  <th className="right">CPA</th><th className="right">RevShare</th>
                  <th className="right">调整</th><th className="right">合计</th>
                  <th>状态</th><th>到账时间</th><th style={{width:140}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(s => (
                    <tr key={s.id} onClick={()=>setDetail(s)} style={{cursor:'pointer'}}>
                      <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{s.id}</td>
                      <td className="text-mono" style={{fontSize:12}}>{s.period}</td>
                      <td className="right text-mono">₹{F.money(s.cpa)}</td>
                      <td className="right text-mono">₹{F.money(s.revShare)}</td>
                      <td className="right text-mono" style={{color: s.adjust<0?'var(--danger)':'var(--text-1)'}}>
                        {s.adjust>=0?'+':''}₹{F.money(s.adjust)}
                      </td>
                      <td className="right text-mono" style={{color:'var(--text-0)',fontWeight:600}}>₹{F.money(s.total)}</td>
                      <td>
                        {s.status === 'paid' && <span className="badge b-success"><span className="dot"/>已提款</span>}
                        {s.status === 'withdrawable' && <span className="badge b-brand"><span className="dot"/>待提款</span>}
                        {s.status === 'reviewing' && <span className="badge b-warning"><span className="dot"/>提款审核中</span>}
                        {s.status === 'rejected' && <span className="badge b-danger"><span className="dot"/>已驳回</span>}
                        {s.status === 'carried' && <span className="badge b-neutral"><span className="dot"/>转结下期</span>}
                      </td>
                      <td className="text-mute" style={{fontSize:11}}>{s.paidAt?new Date(s.paidAt).toLocaleDateString('zh-CN'):'-'}</td>
                      <td onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          {s.status === 'withdrawable'
                            ? <button className="btn sm primary" title="申请提款" onClick={()=>openWithdraw(s.id)}><Icon name="wallet" size={12}/>申请提款</button>
                            : s.status === 'rejected'
                            ? <button className="btn sm" title="重新申请" onClick={()=>{setOverride(o=>({...o,[s.id]:'withdrawable'}));toast('已退回待提款,可重新申请');}}>重新申请</button>
                            : <button className="btn sm ghost icon-only" title="查看详情" onClick={()=>setDetail(s)}><Icon name="eye" size={13}/></button>}
                          <button className="btn sm ghost icon-only" title="下载发票"><Icon name="download" size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ASTUI.Pagination page={page} pageSize={pageSize} total={list.length} onPage={setPage}/>
          </>
        )}

        {tab === 'cycle' && (
          <div style={{padding:18}}>
            <div className="card-inner" style={{maxWidth:680,margin:'0 auto'}}>
              <div className="form-section-title" style={{marginTop:0}}>结算与提款流转</div>
              <div style={{display:'grid',gap:14,marginBottom:18}}>
                {[
                  ['1 · 本期分润报表已结算', '周一 00:00 UTC 截算上一周期 CPA + RevShare', 'pie'],
                  ['2 · 生成该期结算单', '系统自动出单,合计 = CPA + RevShare + 调整项', 'check'],
                  ['3 · 判定提款资格', '达 ₹' + WD_THRESHOLD + ' 门槛 → 待提款;未达 → 转结下期合并', 'wallet'],
                  ['4 · 代理申请提款', '在「申请提款」弹窗勾选待提款结算单提交', 'wallet'],
                  ['5 · 商户审核', '商户后台「提款审核」通过 → 已提款;驳回 → 退回待提款', 'shield'],
                  ['6 · 付款到账', '通过后 30 分钟内打款,到账提醒', 'check'],
                ].map(([t, d, ic], i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--bg-2)',borderRadius:6}}>
                    <div style={{width:36,height:36,borderRadius:6,background:'var(--brand-soft)',display:'grid',placeItems:'center'}}>
                      <Icon name={ic} size={16} style={{color:'var(--brand)'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:'var(--text-0)'}}>{t}</div>
                      <div className="text-mute" style={{fontSize:11.5,marginTop:2}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:14,background:'#fef3c7',borderRadius:6,fontSize:12,color:'#92400e',lineHeight:1.7}}>
                <Icon name="alert" size={13} style={{marginRight:6,verticalAlign:'middle'}}/>
                <strong>转结规则</strong>:单期结算金额低于 ₹{WD_THRESHOLD} 提款门槛时,自动结转并入下期结算单合并计算,直至达到门槛后方可申请提款。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 结算单详情 Drawer */}
      <ASTUI.Drawer open={!!detail} onClose={()=>setDetail(null)} title={detail?'结算单详情 · '+detail.id:''} width={620}>
        {detail && (
          <div style={{padding:'20px 24px'}}>
            <div style={{padding:16,background:'linear-gradient(135deg,#3b82f612,transparent)',border:'1px solid var(--brand-line)',borderRadius:8,marginBottom:18}}>
              <div className="text-mute" style={{fontSize:11,marginBottom:4}}>本期应付</div>
              <div style={{fontSize:28,fontWeight:600,fontFamily:'var(--font-mono)',color:'var(--brand)'}}>
                ₹{F.money(detail.total)} <span style={{fontSize:14,color:'var(--text-3)',fontWeight:400}}>INR</span>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap',alignItems:'center'}}>
                {detail.status === 'paid' && <span className="badge b-success">已提款</span>}
                {detail.status === 'withdrawable' && <span className="badge b-brand">待提款</span>}
                {detail.status === 'reviewing' && <span className="badge b-warning">提款审核中</span>}
                {detail.status === 'rejected' && <span className="badge b-danger">已驳回</span>}
                {detail.status === 'carried' && <span className="badge b-neutral">转结下期</span>}
                <span className="text-mute" style={{fontSize:11.5}}>· 期号 {detail.period} · {detail.periodRange}</span>
              </div>
            </div>

            <div className="form-section-title" style={{marginTop:0}}>金额构成</div>
            <table style={{width:'100%',fontSize:12.5}}>
              <tbody>
                <CalcRow2 l="CPA 收益" sub={(detail.cpa>0?Math.round(detail.cpa/800):0) + ' 个有效 CPA × ₹800'} v={'₹' + F.money(detail.cpa)}/>
                <CalcRow2 l="RevShare 收益" sub="同「分润报表」该期总佣金" v={'₹' + F.money(detail.revShare)}/>
                {detail.adjust !== 0 && (
                  <CalcRow2 l="调整项" sub={detail.adjust < 0 ? '风控扣减 / 申诉补发等' : '上期补发'} v={(detail.adjust>0?'+':'') + '₹' + F.money(detail.adjust)}/>
                )}
                <tr><td colSpan="2" style={{borderTop:'1px solid var(--line)',padding:0}}/></tr>
                <tr>
                  <td style={{padding:'12px 0',color:'var(--text-0)',fontWeight:600}}>合计</td>
                  <td style={{padding:'12px 0',textAlign:'right',fontFamily:'var(--font-mono)',fontWeight:600,fontSize:16,color:'var(--brand)'}}>₹{F.money(detail.total)}</td>
                </tr>
              </tbody>
            </table>

            <div className="form-section-title mt-3">付款信息</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 16px',fontSize:12.5}}>
              <KV2 l="付款方式" v={detail.payoutMethod || 'USDT-TRC20'}/>
              <KV2 l="收款账户" v="TXxxx...18jK9q"/>
              <KV2 l="付款时间" v={detail.paidAt?new Date(detail.paidAt).toLocaleString('zh-CN'):'待付款'}/>
              <KV2 l="付款编号" v={detail.txid || (detail.status==='paid'?'TX'+detail.id.slice(-6):'-')}/>
            </div>

            <div className="form-section-title mt-3">结算单流水</div>
            <div style={{display:'grid',gap:6}}>
              {[
                ['本期分润报表已结算', new Date(detail.generated - 2*86400000).toLocaleDateString('zh-CN'), true],
                ['生成本期结算单', new Date(detail.generated).toLocaleDateString('zh-CN')+' 09:12', true],
                [detail.status==='carried' ? '金额未达门槛 · 转结下期合并' : '达提款门槛 · 待提款',
                  detail.status==='carried' ? '₹'+F.money(detail.total)+' < ₹'+WD_THRESHOLD+' 门槛' : '可发起提款申请', true],
                ['提交提款申请', ['reviewing','paid','rejected'].includes(detail.status)?'已提交':'-', ['reviewing','paid','rejected'].includes(detail.status)],
                ['商户审核', detail.status==='paid'?'已通过':detail.status==='rejected'?'已驳回':detail.status==='reviewing'?'审核中…':'-', ['paid','rejected'].includes(detail.status)],
                ['付款到账', detail.status==='paid'?new Date(detail.paidAt).toLocaleDateString('zh-CN'):'待付款', detail.status==='paid'],
              ].map(([l, t, done], i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',fontSize:12,borderRadius:4,background: done?'transparent':'var(--bg-2)'}}>
                  {done
                    ? <span style={{width:18,height:18,borderRadius:'50%',background:'var(--success)',display:'grid',placeItems:'center'}}><Icon name="check" size={11} style={{color:'#fff'}}/></span>
                    : <span style={{width:18,height:18,borderRadius:'50%',border:'2px dashed var(--text-3)'}}/>}
                  <span style={{flex:1,color: done?'var(--text-1)':'var(--text-3)'}}>{l}</span>
                  <span className="text-mono text-mute" style={{fontSize:11}}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:8,marginTop:18}}>
              {detail.status === 'withdrawable' && <button className="btn primary" onClick={()=>{const id=detail.id;setDetail(null);openWithdraw(id);}}><Icon name="wallet" size={13}/>申请提款</button>}
              {detail.status === 'rejected' && <button className="btn primary" onClick={()=>{setOverride(o=>({...o,[detail.id]:'withdrawable'}));setDetail(d=>({...d,status:'withdrawable'}));toast('已退回待提款,可重新申请');}}><Icon name="wallet" size={13}/>重新申请提款</button>}
              {detail.status === 'reviewing' && <button className="btn ghost" disabled>提款审核中…</button>}
              <button className="btn"><Icon name="download" size={13}/>下载发票 PDF</button>
              <button className="btn ghost"><Icon name="copy" size={13}/>复制单号</button>
            </div>
          </div>
        )}
      </ASTUI.Drawer>

      {/* 申请提款 Modal — 勾选待提款结算单发起提款 */}
      <ASTUI.Modal open={showWithdraw} onClose={()=>setShowWithdraw(false)} title="申请提款"
        subtitle={'勾选「待提款」结算单 · 共 ' + withdrawable.length + ' 张可提 ₹' + F.money(available)}
        footer={<>
          <button className="btn ghost" onClick={()=>setShowWithdraw(false)}>取消</button>
          <button className="btn primary" disabled={wdList.length===0}
            onClick={()=>{const ov={...override};wdList.forEach(s=>ov[s.id]='reviewing');setOverride(ov);toast('提款申请已提交 · ' + wdList.length + ' 张结算单 ₹' + F.money(wdAmount) + ',待商户审核');setShowWithdraw(false);}}>
            <Icon name="check" size={13}/>提交申请{wdList.length>0?' ('+wdList.length+')':''}
          </button>
        </>}>
        <div className="form-grid">
          <div className="full">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label className="text-soft" style={{fontSize:12}}>选择待提款结算单</label>
              {withdrawable.length>0 && (
                <button className="btn sm ghost" onClick={()=>{const v=!allWdChecked;const m={};withdrawable.forEach(s=>m[s.id]=v);setWdSelected(m);}}>
                  {allWdChecked?'取消全选':'全选'}
                </button>
              )}
            </div>
            {withdrawable.length === 0 ? (
              <div style={{padding:'28px 16px',textAlign:'center',background:'var(--bg-2)',borderRadius:6,color:'var(--text-3)',fontSize:12.5}}>
                暂无「待提款」结算单 — 结算单需先通过商户审核才可申请提款
              </div>
            ) : (
              <div style={{border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',maxHeight:230,overflowY:'auto'}}>
                {withdrawable.map((s,i) => {
                  const on = !!wdSelected[s.id];
                  return (
                    <label key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',cursor:'pointer',
                      borderTop: i>0?'1px solid var(--line-soft)':'none', background: on?'var(--brand-soft)':'transparent'}}>
                      <input type="checkbox" checked={on} onChange={()=>toggleWd(s.id)} style={{width:15,height:15,accentColor:'var(--brand)'}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--brand)'}}>{s.id}</div>
                        <div className="text-mute" style={{fontSize:11,marginTop:1}}>周期 {s.period} · CPA ₹{F.money(s.cpa)} + RevShare ₹{F.money(s.revShare)}</div>
                      </div>
                      <div className="text-mono" style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>₹{F.money(s.total)}</div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>收款方式</label>
            <select className="select" value={wdMethod} onChange={e=>setWdMethod(e.target.value)}>
              <option>USDT-TRC20 · TXxxx...18jK9q (默认)</option>
              <option>PIX · ***.456.789-01</option>
              <option>银行电汇 · Itaú ****1234</option>
            </select>
          </div>

          <div className="full" style={{padding:12,background:'var(--bg-2)',borderRadius:6,fontSize:12}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <span className="text-mute">已选 {wdList.length} 张结算单</span><span className="text-mono">₹{F.money(wdAmount)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <span className="text-mute">手续费</span><span className="text-mono">-₹{F.money(wdList.length>0?wdFee:0)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0 4px',borderTop:'1px solid var(--line)',marginTop:4}}>
              <span style={{color:'var(--text-0)',fontWeight:600}}>实际到账</span>
              <span className="text-mono" style={{color:'var(--brand)',fontWeight:600,fontSize:14}}>₹{F.money(Math.max(0, wdAmount - (wdList.length>0?wdFee:0)))}</span>
            </div>
            <div className="text-mute" style={{fontSize:11,marginTop:8}}>预计到账:商户审核通过后 30 分钟内 · 区块确认 ≥ 19</div>
          </div>

          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>2FA 验证码</label>
            <input className="input" placeholder="请输入 Google Authenticator 6 位验证码" maxLength="6"/>
          </div>
        </div>
      </ASTUI.Modal>
    </div>
  );
}

function CalcRow2({l, sub, v}) {
  return (
    <tr>
      <td style={{padding:'10px 0',borderBottom:'1px solid var(--line-soft)'}}>
        <div style={{color:'var(--text-1)'}}>{l}</div>
        {sub && <div className="text-mute" style={{fontSize:11,marginTop:2}}>{sub}</div>}
      </td>
      <td style={{padding:'10px 0',textAlign:'right',fontFamily:'var(--font-mono)',color:'var(--text-0)',borderBottom:'1px solid var(--line-soft)',verticalAlign:'top'}}>{v}</td>
    </tr>
  );
}

function KV2({l, v}) {
  return <div><div className="text-mute" style={{fontSize:11}}>{l}</div><div style={{color:'var(--text-0)',marginTop:2,fontFamily:'var(--font-mono)',fontSize:12}}>{v}</div></div>;
}

window.MySettlementModule = MySettlementModule;
