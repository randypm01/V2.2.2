// 代理后台 - 我的 Code P0-3
const ACUI = window.UI;

function MyCodesModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = ACUI.useToast();
  const me = window.useCurrentAgent();
  const [tab, setTab] = React.useState('list');
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showQR, setShowQR] = React.useState(null);
  const [showLink, setShowLink] = React.useState(null);

  const myCodes = D.codes.filter(c => c.agent === me.id);
  const filtered = myCodes.filter(c => !q || (c.code+c.name).toLowerCase().includes(q.toLowerCase()));
  const pageSize = 10;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const totalClicks = myCodes.reduce((a,c)=>a+c.clicks,0);
  const totalRegs = myCodes.reduce((a,c)=>a+c.regs,0);
  const totalFtds = myCodes.reduce((a,c)=>a+c.ftds,0);
  const totalComm = myCodes.reduce((a,c)=>a+c.commission,0);

  return (
    <div className="page">
      <ACUI.PageHead title="我的 Code" subtitle="管理我的专属推广 Code、Tracking Link 与 QR Code">
        <button className="btn"><Icon name="download" size={13}/>导出报表</button>
        <button className="btn primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={13}/>创建 Code</button>
      </ACUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['Code 数量', F.fmtNum(myCodes.length)],
          ['累计 Clicks', F.fmtNum(totalClicks), '+18%'],
          ['累计注册', F.fmtNum(totalRegs), '+12%'],
          ['累计 FTD', F.fmtNum(totalFtds), '+9%'],
          ['累计佣金', '$' + F.money(totalComm), '+15%'],
        ].map(([l,v,d]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            {d && <div className="delta up">{d}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <ACUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'list', label:'Code 列表', count: myCodes.length},
          {key:'compare', label:'渠道对比'},
        ]}/>
        <div className="toolbar">
          <ACUI.SearchInput value={q} onChange={setQ} placeholder="Code / 名称" width={220}/>
          <select className="filter-select"><option>全部渠道</option>{D.CHANNELS.map(c=><option key={c}>{c}</option>)}</select>
          <select className="filter-select"><option>全部状态</option><option>已启用</option><option>已暂停</option></select>
          <ACUI.DateRange value="30d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
        </div>

        {tab === 'list' && (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>Code / 名称</th><th>渠道</th><th>Campaign</th>
                  <th className="right">Clicks</th><th className="right">注册</th>
                  <th className="right">FTD</th><th className="right">CPA</th>
                  <th className="right">CR%</th><th className="right">佣金</th>
                  <th>状态</th><th style={{width:140}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(c => {
                    const cr = c.clicks ? ((c.regs/c.clicks)*100).toFixed(1) : '0.0';
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="stack">
                            <span style={{display:'flex',gap:6,alignItems:'center'}}>
                              <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,background:'var(--bg-3)',padding:'1px 6px',borderRadius:3,fontSize:11.5}}>{c.code}</span>
                              <span style={{color:'var(--text-1)',fontSize:12.5}}>{c.name}</span>
                            </span>
                            <span className="id" style={{fontSize:11}}>{c.id}</span>
                          </div>
                        </td>
                        <td><span className="badge b-neutral">{c.channel}</span></td>
                        <td className="text-mute" style={{fontSize:11.5}}>{c.campaign || '-'}</td>
                        <td className="right text-mono">{F.fmtNum(c.clicks)}</td>
                        <td className="right text-mono">{F.fmtNum(c.regs)}</td>
                        <td className="right text-mono">{F.fmtNum(c.ftds)}</td>
                        <td className="right text-mono">{F.fmtNum(c.cpaCount)}</td>
                        <td className="right text-mono" style={{color:'var(--success)'}}>{cr}%</td>
                        <td className="right text-mono">${F.money(c.commission)}</td>
                        <td>{c.status === 'active'
                          ? <span className="badge b-success"><span className="dot"/>启用</span>
                          : <span className="badge b-warning"><span className="dot"/>暂停</span>}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn sm ghost icon-only" title="查看链接" onClick={()=>setShowLink(c)}><Icon name="link" size={13}/></button>
                            <button className="btn sm ghost icon-only" title="QR Code" onClick={()=>setShowQR(c)}><Icon name="qr" size={13}/></button>
                            <button className="btn sm ghost icon-only" title="复制 Code" onClick={()=>toast('Code ' + c.code + ' 已复制')}><Icon name="copy" size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ACUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
          </>
        )}

        {tab === 'compare' && (
          <div style={{padding:18}}>
            <div className="grid-2" style={{gap:14}}>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>各渠道 FTD 对比 (近 30 天)</div>
                {(() => {
                  const byCh = {};
                  myCodes.forEach(c => { byCh[c.channel] = (byCh[c.channel]||0) + c.ftds; });
                  const max = Math.max(...Object.values(byCh), 1);
                  return Object.entries(byCh).map(([k, v]) => (
                    <div key={k} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                        <span style={{color:'var(--text-1)'}}>{k}</span>
                        <span className="text-mono">{F.fmtNum(v)}</span>
                      </div>
                      <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:(v/max*100)+'%',height:'100%',background:'var(--brand)',borderRadius:4}}/>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>各渠道佣金对比 (近 30 天)</div>
                {(() => {
                  const byCh = {};
                  myCodes.forEach(c => { byCh[c.channel] = (byCh[c.channel]||0) + c.commission; });
                  const max = Math.max(...Object.values(byCh), 1);
                  return Object.entries(byCh).map(([k, v]) => (
                    <div key={k} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                        <span style={{color:'var(--text-1)'}}>{k}</span>
                        <span className="text-mono" style={{color:'var(--brand)'}}>${F.money(v)}</span>
                      </div>
                      <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:(v/max*100)+'%',height:'100%',background:'#22c55e',borderRadius:4}}/>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建 Code Modal */}
      <ACUI.Modal open={showCreate} onClose={()=>setShowCreate(false)} title="创建新的推广 Code"
        subtitle="为新渠道或活动创建专属 Code"
        footer={<><button className="btn ghost" onClick={()=>setShowCreate(false)}>取消</button><button className="btn primary" onClick={()=>{toast('Code 创建成功');setShowCreate(false);}}>创建</button></>}>
        <div className="form-grid">
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Code 自定义后缀</label>
            <input className="input" placeholder="如:WC2026 (留空自动生成)"/>
            <div className="text-mute" style={{fontSize:11,marginTop:4}}>最终 Code:{me.id.replace('AG','AF')}-WC2026</div>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>名称</label>
            <input className="input" placeholder="如:世界杯 IG 主推"/>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>渠道</label>
            <select className="select">{D.CHANNELS.map(c=><option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Campaign</label>
            <input className="input" placeholder="可选 · UTM Campaign"/>
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>落地页</label>
            <select className="select"><option>主站首页</option><option>注册页</option><option>世界杯专题页</option><option>VIP 活动页</option></select>
          </div>
        </div>
      </ACUI.Modal>

      {/* QR Code Modal */}
      <ACUI.Modal open={!!showQR} onClose={()=>setShowQR(null)} title={showQR ? 'QR Code · ' + showQR.code : ''}
        subtitle="扫码直达推广落地页"
        footer={<><button className="btn ghost" onClick={()=>setShowQR(null)}>关闭</button><button className="btn primary"><Icon name="download" size={13}/>下载 PNG</button></>}>
        {showQR && (
          <div style={{textAlign:'center',padding:'10px 0 20px'}}>
            <div style={{width:200,height:200,margin:'0 auto',padding:14,background:'#fff',borderRadius:8,border:'1px solid var(--line)'}}>
              <svg viewBox="0 0 21 21" style={{width:'100%',height:'100%'}}>
                {Array.from({length:21}).map((_,r)=>Array.from({length:21}).map((_,c)=>{
                  const seed = (r*13 + c*7 + showQR.code.length) % 7;
                  return seed > 3 ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
                }))}
              </svg>
            </div>
            <div className="text-mono" style={{marginTop:14,fontSize:12,color:'var(--text-2)'}}>https://m.example.com/r?c={showQR.code}</div>
          </div>
        )}
      </ACUI.Modal>

      {/* Tracking Link Modal */}
      <ACUI.Modal open={!!showLink} onClose={()=>setShowLink(null)} title={showLink ? 'Tracking Link · ' + showLink.code : ''} size="lg"
        footer={<button className="btn primary" onClick={()=>{toast('链接已复制');setShowLink(null);}}>复制全部</button>}>
        {showLink && (
          <div style={{display:'grid',gap:12}}>
            {[
              ['通用短链', 'https://aff.example.com/' + showLink.code],
              ['注册页落地', 'https://www.example.com/register?ref=' + showLink.code + '&utm_source=' + showLink.channel],
              ['世界杯专题', 'https://www.example.com/wc2026?ref=' + showLink.code + '&utm_campaign=' + (showLink.campaign||'wc')],
              ['App 下载', 'https://app.example.com/d?ref=' + showLink.code],
            ].map(([l, u]) => (
              <div key={l}>
                <div style={{fontSize:11.5,color:'var(--text-3)',marginBottom:4}}>{l}</div>
                <div style={{display:'flex',gap:6}}>
                  <input className="input text-mono" value={u} readOnly style={{flex:1,fontSize:11.5}}/>
                  <button className="btn sm ghost icon-only" onClick={()=>toast('已复制')}><Icon name="copy" size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ACUI.Modal>
    </div>
  );
}

window.MyCodesModule = MyCodesModule;
