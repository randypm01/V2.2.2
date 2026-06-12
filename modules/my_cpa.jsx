// 代理后台 - 我的 CPA 报表 P0-6
const ACPUI = window.UI;

function MyCpaModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const toast = ACPUI.useToast();
  const [tab, setTab] = React.useState('list');
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showAppeal, setShowAppeal] = React.useState(null);

  // 用代理的所有玩家反推 cpa 记录,确保有数据
  const myPlayers = D.players.filter(p => p.agentId === me.id);
  const myPlayerIds = new Set(myPlayers.map(p => p.id));
  let my = D.cpaRecords.filter(r => myPlayerIds.has(r.playerId));
  // 若示例数据没匹配,以前 30 条 cpaRecords fallback,把 agentId 视作当前用户
  if (my.length < 8) {
    my = D.cpaRecords.slice(0, 32).map(r => ({...r, agentId: me.id}));
  }
  // 派生展示字段
  my = my.map((r, i) => ({
    ...r,
    code: 'CD-' + String(10000 + (i * 13) % 9000),
    d3: r.status === 'approved' ? true : r.status === 'rejected' ? false : 'pending',
  }));

  const counts = {
    all: my.length,
    approved: my.filter(r=>r.status==='approved').length,
    pending: my.filter(r=>r.status==='pending').length,
    rejected: my.filter(r=>r.status==='rejected').length,
    held: my.filter(r=>r.status==='risk_hold').length,
  };
  const statusKey = filter === 'held' ? 'risk_hold' : filter;
  const list = filter === 'all' ? my : my.filter(r=>r.status===statusKey);
  const [pageSize, setPageSize] = React.useState(20);
  const paged = list.slice((page-1)*pageSize, page*pageSize);

  const approvedAmt = my.filter(r=>r.status==='approved').reduce((a,r)=>a+r.cpaAmount,0);
  const pendingAmt = my.filter(r=>r.status==='pending').reduce((a,r)=>a+r.cpaAmount,0);
  const rejectedAmt = my.filter(r=>r.status==='rejected').reduce((a,r)=>a+r.cpaAmount,0);
  const passRate = my.length ? (counts.approved/my.length*100).toFixed(1) : '0';

  return (
    <div className="page">
      <ACPUI.PageHead title="我的 CPA 报表" subtitle="按玩家追踪 CPA 触发条件、审核状态与申诉">
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </ACPUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['有效 CPA', F.fmtNum(counts.approved), '+' + F.fmtNum(approvedAmt) + ' USD'],
          ['待审核', F.fmtNum(counts.pending), '$' + F.fmtNum(pendingAmt) + ' 待结算'],
          ['已拒绝', F.fmtNum(counts.rejected), '$' + F.fmtNum(rejectedAmt) + ' 不计入'],
          ['暂扣中', F.fmtNum(counts.held), '风控冷却'],
          ['通过率', passRate + '%', counts.all + ' 总申报'],
        ].map(([l,v,d]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            {d && <div className="text-mute" style={{fontSize:11,marginTop:4}}>{d}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <ACPUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'list', label:'CPA 明细', count: counts.all},
          {key:'rule', label:'达成规则'},
          {key:'rejected', label:'拒绝原因分析'},
        ]}/>

        {tab === 'list' && (
          <>
            <div className="toolbar">
              <div className="seg">
                {[
                  {v:'all',l:'全部',c:counts.all},
                  {v:'approved',l:'已通过',c:counts.approved},
                  {v:'pending',l:'待审核',c:counts.pending},
                  {v:'rejected',l:'已拒绝',c:counts.rejected},
                  {v:'held',l:'暂扣',c:counts.held},
                ].map(s=>(
                  <button key={s.v} className={filter===s.v?'active':''} onClick={()=>{setFilter(s.v);setPage(1);}}>
                    {s.l}<span className="text-mono text-mute" style={{marginLeft:4}}>({s.c})</span>
                  </button>
                ))}
              </div>
              <ACPUI.DateRange value="30d" onChange={()=>{}}/>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>编号</th><th>玩家</th><th>Code</th>
                  <th className="right">首存</th><th className="right">流水</th><th className="right">NGR</th>
                  <th>D3 留存</th><th>状态</th>
                  <th className="right">CPA</th>
                  <th>触发时间</th><th>审核时间</th><th style={{width:90}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(r => (
                    <tr key={r.id}>
                      <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{r.id}</td>
                      <td className="text-mono" style={{fontSize:11.5}}>{r.playerId}</td>
                      <td className="text-mono" style={{fontSize:11}}>{r.code}</td>
                      <td className="right text-mono">${F.fmtNum(r.ftdAmount)}</td>
                      <td className="right text-mono">${F.fmtNum(r.wager)}</td>
                      <td className="right text-mono">${F.fmtNum(r.ngr)}</td>
                      <td>
                        {r.d3 === true && <span className="badge b-success">✓</span>}
                        {r.d3 === false && <span className="badge b-danger">✗</span>}
                        {r.d3 === 'pending' && <span className="badge b-warning">观察</span>}
                      </td>
                      <td>
                        {r.status === 'approved' && <span className="badge b-success"><span className="dot"/>已通过</span>}
                        {r.status === 'pending' && <span className="badge b-warning"><span className="dot"/>审核中</span>}
                        {r.status === 'rejected' && <span className="badge b-danger"><span className="dot"/>已拒绝</span>}
                        {r.status === 'risk_hold' && <span className="badge b-warning"><span className="dot"/>暂扣</span>}
                      </td>
                      <td className="right text-mono">${F.fmtNum(r.cpaAmount)}</td>
                      <td className="text-mute" style={{fontSize:11}}>{new Date(r.ftdAt).toLocaleDateString('zh-CN')}</td>
                      <td className="text-mute" style={{fontSize:11}}>{r.reviewedAt?new Date(r.reviewedAt).toLocaleDateString('zh-CN'):'-'}</td>
                      <td>
                        {r.status === 'rejected'
                          ? <button className="btn sm" onClick={()=>setShowAppeal(r)}>申诉</button>
                          : <button className="btn sm ghost icon-only"><Icon name="eye" size={13}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ACPUI.Pagination page={page} pageSize={pageSize} total={list.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }}/>
          </>
        )}

        {tab === 'rule' && (
          <div style={{padding:18}}>
            <div className="card-inner" style={{maxWidth:720,margin:'0 auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
                <div style={{width:48,height:48,borderRadius:12,background:'var(--brand-soft)',display:'grid',placeItems:'center'}}>
                  <Icon name="check" size={24} style={{color:'var(--brand)'}}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:'var(--text-3)'}}>当前 CPA 方案</div>
                  <div style={{fontSize:18,fontWeight:600,color:'var(--text-0)'}}>$50 / 每个有效首存玩家</div>
                </div>
                <span className="badge b-brand" style={{marginLeft:'auto'}}>方案版本 v2.6</span>
              </div>
              <div className="form-section-title" style={{marginTop:0}}>触发条件 (须全部满足)</div>
              <div style={{display:'grid',gap:8}}>
                {[
                  ['首存金额', '≥ $20', 'usd'],
                  ['累计流水', '≥ ×5 首存额 (即 ≥ $100)', 'usd'],
                  ['NGR (净收益)', '≥ $30', 'usd'],
                  ['D3 留存', '注册后第 3 天有登录或投注', 'time'],
                  ['冷却期', '触发后 7 天观察期,期间发生提款且未达流水将作废', 'time'],
                  ['国家限定', '不可来自禁运国家', 'world'],
                ].map(([l, v, ic]) => (
                  <div key={l} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg-2)',borderRadius:6}}>
                    <Icon name="check" size={14} style={{color:'var(--success)'}}/>
                    <div style={{flex:1,fontSize:12.5}}>
                      <span style={{color:'var(--text-0)',fontWeight:500}}>{l}</span>
                      <span className="text-mute" style={{marginLeft:8}}>{v}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-section-title mt-3">特殊情形</div>
              <div className="text-mute" style={{fontSize:12,lineHeight:1.7}}>
                • 同 IP / 同设备多账户:仅认定首个达成的玩家<br/>
                • 高额 CPA(≥ $100):需商户人工复核,通常 24h 内出结果<br/>
                • 申诉时效:CPA 拒绝后 14 天内可申请复核<br/>
                • 复核成功:补发 CPA 至下期结算单
              </div>
            </div>
          </div>
        )}

        {tab === 'rejected' && (
          <div style={{padding:18}}>
            <div className="grid-2" style={{gap:14}}>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>拒绝原因分布</div>
                {[
                  ['流水未达 ×5', 8, '#f59e0b'],
                  ['NGR < $30', 5, '#ef4444'],
                  ['D3 未留存', 4, '#a855f7'],
                  ['首存提款异常', 3, '#06b6d4'],
                  ['多账户重复', 2, '#64748b'],
                  ['国家限制', 1, '#94a3b8'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                      <span style={{color:'var(--text-1)'}}>{l}</span>
                      <span className="text-mono">{v} 例</span>
                    </div>
                    <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                      <div style={{width:(v/8*100)+'%',height:'100%',background:c,borderRadius:4}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>建议改进方向</div>
                <div style={{display:'grid',gap:10,fontSize:12.5,lineHeight:1.7,color:'var(--text-1)'}}>
                  <div style={{padding:10,background:'#fef3c7',borderLeft:'3px solid #f59e0b',borderRadius:4}}>
                    <strong>流水未达</strong> 占比 35%。建议在落地页增加「首存赠金 100% + 流水赠送」引导,延长玩家投注周期。
                  </div>
                  <div style={{padding:10,background:'#fee2e2',borderLeft:'3px solid #ef4444',borderRadius:4}}>
                    <strong>NGR 不足</strong> 多发生在低投注金额玩家。考虑选择质量更高的渠道或精细化用户筛选。
                  </div>
                  <div style={{padding:10,background:'#f3e8ff',borderLeft:'3px solid #a855f7',borderRadius:4}}>
                    <strong>D3 未留存</strong> 反映玩家质量。建议关注首日体验、加大新手引导素材投入。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ACPUI.Modal open={!!showAppeal} onClose={()=>setShowAppeal(null)} title={showAppeal?'CPA 申诉 · '+showAppeal.id:''}
        subtitle="提交申诉后,商户将在 3 个工作日内复核"
        footer={<><button className="btn ghost" onClick={()=>setShowAppeal(null)}>取消</button><button className="btn primary" onClick={()=>{toast('申诉已提交');setShowAppeal(null);}}>提交申诉</button></>}>
        {showAppeal && (
          <div>
            <div style={{padding:12,background:'var(--bg-2)',borderRadius:6,marginBottom:14,fontSize:12}}>
              <div className="text-mute">玩家 ID</div>
              <div className="text-mono" style={{color:'var(--text-0)',marginTop:2}}>{showAppeal.playerId}</div>
              <div className="text-mute" style={{marginTop:8}}>拒绝原因</div>
              <div style={{color:'var(--danger)',marginTop:2}}>{showAppeal.reason || '流水未达 ×5'}</div>
            </div>
            <div className="form-grid">
              <div className="full">
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>申诉理由</label>
                <textarea className="textarea" rows="4" placeholder="请详细说明申诉原因,如玩家有进一步投注未被统计、观察期数据延迟等"/>
              </div>
              <div className="full">
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>佐证材料 (可选)</label>
                <button className="btn"><Icon name="upload" size={13}/>上传截图</button>
              </div>
            </div>
          </div>
        )}
      </ACPUI.Modal>
    </div>
  );
}

window.MyCpaModule = MyCpaModule;
