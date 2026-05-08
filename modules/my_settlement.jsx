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

  const my = D.settlements.filter(s => s.agentId === me.id);
  const counts = {
    all: my.length,
    paid: my.filter(s=>s.status==='paid').length,
    approved: my.filter(s=>s.status==='approved').length,
    review: my.filter(s=>s.status==='review' || s.status==='pending').length,
    rejected: my.filter(s=>s.status==='rejected').length,
  };
  const list = filter === 'all' ? my : my.filter(s=>s.status===filter);
  const pageSize = 12;
  const paged = list.slice((page-1)*pageSize, page*pageSize);

  const totalPaid = my.filter(s=>s.status==='paid').reduce((a,s)=>a+s.total,0);
  const totalPending = my.filter(s=>s.status==='approved' || s.status==='review' || s.status==='pending').reduce((a,s)=>a+s.total,0);
  const totalAll = my.reduce((a,s)=>a+s.total,0);

  return (
    <div className="page">
      <ASTUI.PageHead title="我的结算单" subtitle="按周生成的结算单 · CPA + RevShare + 调整项">
        <button className="btn"><Icon name="download" size={13}/>导出全部</button>
      </ASTUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          ['累计已付', '$' + F.money(totalPaid), counts.paid + ' 张已付'],
          ['待付款', '$' + F.money(totalPending), counts.review + counts.approved + ' 张处理中'],
          ['累计结算', '$' + F.money(totalAll), counts.all + ' 张结算单'],
          ['本周预估', '$' + F.money(totalAll/52*1.1), '基于近 12 周均值'],
        ].map(([l,v,d]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
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
                  {v:'paid',l:'已付款',c:counts.paid},
                  {v:'approved',l:'待付款',c:counts.approved},
                  {v:'review',l:'审核中',c:counts.review},
                  {v:'rejected',l:'已拒绝',c:counts.rejected},
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
                  <th>状态</th><th>付款时间</th><th style={{width:100}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(s => (
                    <tr key={s.id} onClick={()=>setDetail(s)} style={{cursor:'pointer'}}>
                      <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{s.id}</td>
                      <td className="text-mono" style={{fontSize:12}}>{s.period}</td>
                      <td className="right text-mono">${F.money(s.cpa)}</td>
                      <td className="right text-mono">${F.money(s.revShare)}</td>
                      <td className="right text-mono" style={{color: s.adjust<0?'var(--danger)':'var(--text-1)'}}>
                        {s.adjust>=0?'+':''}${F.money(s.adjust)}
                      </td>
                      <td className="right text-mono" style={{color:'var(--text-0)',fontWeight:600}}>${F.money(s.total)}</td>
                      <td>
                        {s.status === 'paid' && <span className="badge b-success"><span className="dot"/>已付款</span>}
                        {s.status === 'approved' && <span className="badge b-brand"><span className="dot"/>待付款</span>}
                        {s.status === 'review' && <span className="badge b-warning"><span className="dot"/>审核中</span>}
                        {s.status === 'pending' && <span className="badge b-warning"><span className="dot"/>待审核</span>}
                        {s.status === 'rejected' && <span className="badge b-danger"><span className="dot"/>已拒绝</span>}
                      </td>
                      <td className="text-mute" style={{fontSize:11}}>{s.paidAt?new Date(s.paidAt).toLocaleDateString('zh-CN'):'-'}</td>
                      <td onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn sm ghost icon-only" title="查看详情" onClick={()=>setDetail(s)}><Icon name="eye" size={13}/></button>
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
              <div className="form-section-title" style={{marginTop:0}}>结算周期</div>
              <div style={{display:'grid',gap:14,marginBottom:18}}>
                {[
                  ['周一 00:00 UTC', '当周结算开始', 'time'],
                  ['周三', '商户审核期 · 异常项可申诉', 'check'],
                  ['周五', '通过审核 · 加入付款队列', 'check'],
                  ['下周一', '付款完成 · 到账提醒', 'wallet'],
                  ['观察期 +7 天', '若有玩家行为异常,可追溯调整', 'shield'],
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
                <strong>申诉提醒</strong>:对结算单数据有异议,可在审核期(周三~周五)申诉,逾期视为认可。
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
                ${F.money(detail.total)} <span style={{fontSize:14,color:'var(--text-3)',fontWeight:400}}>{me.currency}</span>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                {detail.status === 'paid' && <span className="badge b-success">已付款</span>}
                {detail.status === 'approved' && <span className="badge b-brand">待付款</span>}
                {detail.status === 'review' && <span className="badge b-warning">审核中</span>}
                {detail.status === 'pending' && <span className="badge b-warning">待审核</span>}
                <span className="text-mute" style={{fontSize:11.5}}>· 周期 {detail.period}</span>
              </div>
            </div>

            <div className="form-section-title" style={{marginTop:0}}>金额构成</div>
            <table style={{width:'100%',fontSize:12.5}}>
              <tbody>
                <CalcRow2 l="CPA 收益" sub={Math.round(detail.cpa/50) + ' 个有效 CPA × $50'} v={'$' + F.money(detail.cpa)}/>
                <CalcRow2 l="RevShare 收益" sub="本期 NGR × 35%" v={'$' + F.money(detail.revShare)}/>
                {detail.adjust !== 0 && (
                  <CalcRow2 l="调整项" sub={detail.adjust < 0 ? '风控扣减 / 申诉补发等' : '上期补发'} v={(detail.adjust>0?'+':'') + '$' + F.money(detail.adjust)}/>
                )}
                <tr><td colSpan="2" style={{borderTop:'1px solid var(--line)',padding:0}}/></tr>
                <tr>
                  <td style={{padding:'12px 0',color:'var(--text-0)',fontWeight:600}}>合计</td>
                  <td style={{padding:'12px 0',textAlign:'right',fontFamily:'var(--font-mono)',fontWeight:600,fontSize:16,color:'var(--brand)'}}>${F.money(detail.total)}</td>
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
                ['周期开始', new Date(Date.now()-14*86400000).toLocaleDateString('zh-CN')+' 00:00', true],
                ['结算单生成', new Date(Date.now()-7*86400000).toLocaleDateString('zh-CN')+' 09:12', true],
                ['财务审核', new Date(Date.now()-5*86400000).toLocaleDateString('zh-CN')+' 14:35', detail.status!=='pending'],
                ['加入付款队列', detail.status==='approved'||detail.status==='paid'?new Date(Date.now()-3*86400000).toLocaleDateString('zh-CN'):'-', detail.status==='approved'||detail.status==='paid'],
                ['付款完成', detail.status==='paid'?new Date(detail.paidAt).toLocaleDateString('zh-CN'):'待付款', detail.status==='paid'],
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
              <button className="btn"><Icon name="download" size={13}/>下载发票 PDF</button>
              <button className="btn ghost"><Icon name="copy" size={13}/>复制单号</button>
              {detail.status === 'review' && <button className="btn danger" onClick={()=>toast('申诉已提交')}>申诉</button>}
            </div>
          </div>
        )}
      </ASTUI.Drawer>
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
