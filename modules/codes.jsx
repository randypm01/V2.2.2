// 分享Code与推广链接
const UI = window.UI;

function CodesModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = UI.useToast();
  const [codes, setCodes] = React.useState(D.codes);
  const [tab, setTab] = React.useState('list');
  const [q, setQ] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [showQR, setShowQR] = React.useState(null);

  const filtered = codes.filter(c => !q || (c.code+c.name+c.id).toLowerCase().includes(q.toLowerCase()));
  const pageSize = 12;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const totalClicks = codes.reduce((a,c)=>a+c.clicks,0);
  const totalRegs = codes.reduce((a,c)=>a+c.regs,0);
  const totalFtds = codes.reduce((a,c)=>a+c.ftds,0);
  const totalCommission = codes.reduce((a,c)=>a+c.commission,0);

  return (
    <div className="page">
      <UI.PageHead title="分享 Code 与推广链接" subtitle="为代理生成专属推广 Code、Tracking Link 与 QR Code">
        <button className="btn"><Icon name="download" size={13}/>导出报表</button>
        <button className="btn primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={13}/>创建 Code</button>
      </UI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          ['累计 Clicks', F.fmtNum(totalClicks), '+18.4%', 'up'],
          ['累计注册', F.fmtNum(totalRegs), '+12.1%', 'up'],
          ['累计 FTD', F.fmtNum(totalFtds), '+9.8%', 'up'],
          ['累计佣金', '$'+F.money(totalCommission), '+14.6%', 'up'],
        ].map(([l,v,d,dir]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            <div className={'delta '+dir}><Icon name="arrowUp" size={11}/>{d}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <UI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'list',label:'Code 列表',count:codes.length},
          {key:'report',label:'数据报表'},
          {key:'tracking',label:'Tracking Link'},
        ]}/>
        <div className="toolbar">
          <UI.SearchInput value={q} onChange={setQ} placeholder="Code / 名称 / 代理"/>
          <select className="filter-select"><option>全部渠道</option>{D.CHANNELS.map(c=><option key={c}>{c}</option>)}</select>
          <select className="filter-select"><option>全部状态</option><option>已启用</option><option>已暂停</option><option>已过期</option></select>
          <UI.DateRange value="30d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
          <button className="btn sm ghost icon-only"><Icon name="settings" size={14}/></button>
        </div>
        <div className="tbl-wrap">
          {tab === 'list' && (
            <table className="tbl">
              <thead><tr>
                <th>Code / 名称</th><th>代理</th><th>渠道</th><th>Campaign</th>
                <th className="right">Clicks</th><th className="right">注册</th>
                <th className="right">FTD</th><th className="right">CPA</th>
                <th className="right">转化率</th><th className="right">佣金</th>
                <th>状态</th><th>有效期</th><th style={{width:90}}>操作</th>
              </tr></thead>
              <tbody>
                {paged.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="stack">
                        <span style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,background:'var(--bg-3)',padding:'1px 6px',borderRadius:3,fontSize:11.5}}>{c.code}</span>
                          <span style={{color:'var(--text-1)'}}>{c.name}</span>
                        </span>
                        <span className="id" style={{fontSize:11}}>{c.id}</span>
                      </div>
                    </td>
                    <td className="id">{c.agent}</td>
                    <td><span className="badge b-neutral">{c.channel}</span></td>
                    <td className="text-mono text-mute" style={{fontSize:11}}>{c.campaign}</td>
                    <td className="right">{F.fmtNum(c.clicks)}</td>
                    <td className="right">{F.fmtNum(c.regs)}</td>
                    <td className="right">{F.fmtNum(c.ftds)}</td>
                    <td className="right">{F.fmtNum(c.cpas)}</td>
                    <td className="right" style={{color: c.regs/c.clicks > 0.15 ? '#6ee7a8' : 'var(--text-2)'}}>
                      {((c.regs/c.clicks)*100).toFixed(1)}%
                    </td>
                    <td className="right" style={{color:'var(--text-0)',fontWeight:500}}>${F.money(c.commission)}</td>
                    <td><UI.StatusBadge status={c.status}/></td>
                    <td className="text-mute" style={{fontSize:11}}>{new Date(c.expires).toLocaleDateString('zh-CN')}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn sm ghost icon-only" title="QR Code" onClick={()=>setShowQR(c)}><Icon name="qr" size={13}/></button>
                        <button className="btn sm ghost icon-only" title="复制链接" onClick={()=>toast('链接已复制')}><Icon name="copy" size={13}/></button>
                        <button className="btn sm ghost icon-only"><Icon name="more" size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'report' && <CodeReport codes={codes}/>}
          {tab === 'tracking' && <TrackingLinks/>}
        </div>
        {tab === 'list' && <UI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>}
      </div>

      <UI.Modal open={!!showQR} onClose={()=>setShowQR(null)} title="分享 Code · QR" subtitle={showQR?.code}>
        {showQR && (
          <div style={{textAlign:'center',padding:'10px 20px'}}>
            <div style={{width:200,height:200,margin:'0 auto',padding:14,background:'#fff',borderRadius:8}}>
              <svg viewBox="0 0 21 21" style={{width:'100%',height:'100%'}}>
                {/* fake QR pattern */}
                {Array.from({length:21}).map((_,r)=>Array.from({length:21}).map((_,c)=>{
                  const seed = (r*17 + c*7 + showQR.code.charCodeAt(0)) % 7;
                  const corner = (r<7 && c<7) || (r<7 && c>13) || (r>13 && c<7);
                  if (corner) {
                    const isFrame = (r===0||r===6||c===0||c===6) || (r>13 && (r===14||r===20||c===0||c===6)) || (r<7 && c>13 && (r===0||r===6||c===14||c===20));
                    return seed > 2 ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
                  }
                  return seed > 3 ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
                }))}
              </svg>
            </div>
            <div style={{marginTop:16,padding:10,background:'var(--bg-2)',borderRadius:6,fontFamily:'var(--font-mono)',fontSize:11.5,color:'var(--text-1)'}}>
              https://aff.brand.com/?code={showQR.code}&utm_source={showQR.channel}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:14}}>
              <button className="btn sm" onClick={()=>toast('链接已复制')}><Icon name="copy" size={13}/>复制链接</button>
              <button className="btn sm">下载 QR</button>
              <button className="btn sm">生成短链</button>
            </div>
          </div>
        )}
      </UI.Modal>

      <UI.Modal open={showCreate} onClose={()=>setShowCreate(false)} title="创建分享 Code" subtitle="为代理生成专属推广 Code 与 Tracking Link"
        footer={<><button className="btn ghost" onClick={()=>setShowCreate(false)}>取消</button><button className="btn primary" onClick={()=>{toast('Code 创建成功');setShowCreate(false);}}>创建</button></>}>
        <div className="form-grid">
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Code 名称</label><input className="input" placeholder="如: TG-VIP-Q3"/></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>所属代理</label><select className="select"><option>请选择代理</option>{D.agents.slice(0,6).map(a=><option key={a.id}>{a.id} · {a.name}</option>)}</select></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>用途</label><select className="select"><option>注册推广</option><option>VIP 渠道</option><option>活动推广</option></select></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>渠道</label><select className="select">{D.CHANNELS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>对应活动</label><select className="select"><option>无</option><option>BR World Cup</option><option>VIP CashBack</option></select></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>有效期</label><input className="input" type="date" defaultValue="2026-12-31"/></div>
          <div className="full"><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>UTM 参数</label>
            <div className="grid-3">
              <input className="input" placeholder="utm_source"/>
              <input className="input" placeholder="utm_medium"/>
              <input className="input" placeholder="utm_campaign"/>
            </div>
          </div>
          <div className="full" style={{display:'flex',gap:24,paddingTop:6}}>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--text-1)'}}><CheckBox on={true}/> 生成 QR Code</label>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--text-1)'}}><CheckBox on={true}/> 生成短链</label>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--text-1)'}}><CheckBox on={false}/> 启用 Sub ID</label>
          </div>
        </div>
      </UI.Modal>
    </div>
  );
}

function CodeReport({ codes }) {
  const F = window.APS_FMT;
  const top = [...codes].sort((a,b)=>b.commission-a.commission).slice(0,15);
  const max = top[0]?.commission || 1;
  return (
    <div style={{padding:'14px 16px'}}>
      <div style={{fontSize:12,color:'var(--text-3)',marginBottom:10}}>Code ROI 排行 · TOP 15</div>
      {top.map(c => (
        <div key={c.id} style={{display:'grid',gridTemplateColumns:'200px 1fr 100px 100px 100px',gap:12,alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--line-soft)'}}>
          <div className="stack">
            <span style={{display:'flex',gap:6,alignItems:'center'}}>
              <span className="text-mono" style={{color:'var(--text-0)',fontSize:11.5}}>{c.code}</span>
              <span className="badge b-neutral" style={{fontSize:10}}>{c.channel}</span>
            </span>
            <span className="id" style={{fontSize:10.5}}>{c.id}</span>
          </div>
          <div className="funnel-bar"><div style={{width:(c.commission/max*100)+'%',background:'#3b82f6'}}>${F.money(c.commission)}</div></div>
          <div className="text-mono right" style={{textAlign:'right',fontSize:11.5,color:'var(--text-2)'}}>{F.fmtNum(c.clicks)} clicks</div>
          <div className="text-mono right" style={{textAlign:'right',fontSize:11.5,color:'var(--text-2)'}}>{F.fmtNum(c.cpas)} CPA</div>
          <div style={{textAlign:'right'}}><span className="badge b-success">×{(c.commission/(c.clicks*0.5)).toFixed(2)}</span></div>
        </div>
      ))}
    </div>
  );
}

function TrackingLinks() {
  return (
    <div style={{padding:'18px 18px'}}>
      <div style={{fontSize:12,color:'var(--text-2)',marginBottom:12}}>Tracking Link 模板 · 自动注入 click_id / device_id / campaign_id</div>
      {[
        { l:'基础推广链接', t: 'https://aff.brand.com/?code={CODE}' },
        { l:'Campaign Link', t: 'https://aff.brand.com/?code={CODE}&campaign={CAMPAIGN_ID}&ad={AD_ID}' },
        { l:'Sub ID Link', t: 'https://aff.brand.com/?code={CODE}&sub1={SUB1}&sub2={SUB2}&click_id={CLICK_ID}' },
        { l:'渠道链接', t: 'https://aff.brand.com/{CHANNEL}/?code={CODE}&utm_source={SRC}&utm_medium={MED}' },
      ].map(r => (
        <div key={r.l} style={{padding:14,background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:6,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:12,color:'var(--text-1)',fontWeight:500}}>{r.l}</span>
            <button className="btn sm ghost"><Icon name="copy" size={12}/>复制</button>
          </div>
          <code style={{fontFamily:'var(--font-mono)',fontSize:11.5,color:'var(--brand)',wordBreak:'break-all'}}>{r.t}</code>
        </div>
      ))}
    </div>
  );
}

window.CodesModule = CodesModule;
