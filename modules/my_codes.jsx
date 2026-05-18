// 代理后台 - 我的 Code P0-3
// v2.5.13 表格重构:Code / 名称 / 短链 / 备注 / 注册 / 充值 / 提款 / 充值转化率 / ARPPU / 佣金 / 状态 — 去除 点击数(Clicks) / 渠道 / Campaign / FTD / CPA / CR%
const ACUI = window.UI;

function buildSampleCodes(agentId) {
  const prefix = agentId.replace(/^A[GP]/, 'AF');
  const days = (n) => Date.now() - n * 86400000;
  // v2.5.13 补上 充值 / 提款 / 短链 / 备注 4 个字段
  return [
    { id:'CD-S001', code:prefix+'-MAIN', name:'主推流量', agent:agentId,
      shortUrl:'https://aff.ex/'+prefix+'M', remark:'长期使用,不限渡道',
      regs:842, deposit:42100, withdraw:18200, commission:14900,
      status:'active', createdAt:days(120) },
    { id:'CD-S002', code:prefix+'-IG2026', name:'Instagram Story 投放', agent:agentId,
      shortUrl:'https://aff.ex/'+prefix+'I', remark:'Q2 IG Story 付费投放专用',
      regs:524, deposit:26800, withdraw:10500, commission:9200,
      status:'active', createdAt:days(75) },
    { id:'CD-S003', code:prefix+'-TG', name:'Telegram 群组转发', agent:agentId,
      shortUrl:'https://aff.ex/'+prefix+'T', remark:'群名与频道广播',
      regs:412, deposit:21500, withdraw:8200, commission:8250,
      status:'active', createdAt:days(95) },
    { id:'CD-S004', code:prefix+'-WC2026', name:'世界杯专题', agent:agentId,
      shortUrl:'https://aff.ex/'+prefix+'W', remark:'世界杯活动期间 限时',
      regs:1248, deposit:68400, withdraw:28900, commission:22550,
      status:'active', createdAt:days(45) },
    { id:'CD-S005', code:prefix+'-VIP', name:'VIP 高净值定向', agent:agentId,
      shortUrl:'https://aff.ex/'+prefix+'V', remark:'暂停 — 待 Q3 重启投放',
      regs:96, deposit:18200, withdraw:6800, commission:5700,
      status:'paused', createdAt:days(180) },
  ];
}

function MyCodesModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const [lang] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);
  const toast = ACUI.useToast();
  const me = window.useCurrentAgent();
  const [tab, setTab] = React.useState('list');
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(null);
  const [showQR, setShowQR] = React.useState(null);
  const [showLink, setShowLink] = React.useState(null);
  const [delTarget, setDelTarget] = React.useState(null);

  // v2.5.10 codes 现在为可变 state(示例 + D.codes 中关联当前代理的)
  const [codes, setCodes] = React.useState(() => {
    const real = D.codes.filter(c => c.agent === me.id);
    return [...buildSampleCodes(me.id), ...real];
  });

  const filtered = codes.filter(c => !q || (c.code+c.name).toLowerCase().includes(q.toLowerCase()));
  const pageSize = 10;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const totalRegs = codes.reduce((a,c)=>a+(c.regs||0),0);
  const totalDeposit = codes.reduce((a,c)=>a+(c.deposit||0),0);
  const totalWithdraw = codes.reduce((a,c)=>a+(c.withdraw||0),0);
  const totalComm = codes.reduce((a,c)=>a+(c.commission||0),0);

  // —— 操作:启用 / 暂停 ——
  const toggleStatus = (c) => {
    const next = c.status === 'active' ? 'paused' : 'active';
    setCodes(codes.map(x => x.id === c.id ? { ...x, status: next } : x));
    toast('Code ' + c.code + (next === 'active' ? ' 已启用' : ' 已暂停'));
  };
  // —— 操作:删除 ——
  const removeCode = (c) => {
    setCodes(codes.filter(x => x.id !== c.id));
    toast('Code ' + c.code + ' 已删除');
    setDelTarget(null);
  };
  // —— 操作:创建 ——
  const submitCreate = (form) => {
    const prefix = me.id.replace(/^A[GP]/, 'AF');
    const id = 'CD-' + String(codes.length + 1).padStart(4, '0');
    const suffix = (form.suffix || ('GEN' + Date.now().toString().slice(-4))).toUpperCase();
    const finalCode = prefix + '-' + suffix;
    const newCode = {
      id, code: finalCode, name: form.name || '未命名',
      agent: me.id,
      shortUrl: form.shortUrl || ('https://aff.ex/' + suffix.slice(0,6)),
      remark: form.remark || '',
      regs: 0, deposit: 0, withdraw: 0, commission: 0,
      status: 'active', createdAt: Date.now(),
    };
    setCodes([newCode, ...codes]);
    toast('Code ' + newCode.code + ' 创建成功');
    setShowCreate(false);
  };
  // —— 操作:编辑 ——
  const submitEdit = (form) => {
    setCodes(codes.map(x => x.id === showEdit.id ? { ...x, name: form.name, shortUrl: form.shortUrl, remark: form.remark } : x));
    toast('Code ' + showEdit.code + ' 已更新');
    setShowEdit(null);
  };

  return (
    <div className="page">
      <ACUI.PageHead title={T('page.my_codes.title','分享 Code 与链接')} subtitle={T('page.my_codes.sub','管理我的专属推广 Code、Tracking Link 与 QR Code')}>
        <button className="btn"><Icon name="download" size={13}/>导出报表</button>
        <button className="btn primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={13}/>创建 Code</button>
      </ACUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['Code 数量', F.fmtNum(codes.length)],
          ['累计注册', F.fmtNum(totalRegs), '+12%'],
          ['累计充值', '$' + F.money(totalDeposit), '+18%'],
          ['累计提款', '$' + F.money(totalWithdraw), '+9%'],
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
          {key:'list', label:'Code 列表', count: codes.length},
          {key:'compare', label:'渠道对比'},
        ]}/>
        <div className="toolbar">
          <ACUI.SearchInput value={q} onChange={setQ} placeholder="Code / 名称" width={220}/>
          <select className="filter-select"><option>全部状态</option><option>已启用</option><option>已暂停</option></select>
          <ACUI.DateRange value="30d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
        </div>

        {tab === 'list' && (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>Code</th>
                  <th>名称</th>
                  <th>短链</th>
                  <th>备注</th>
                  <th className="right">注册</th>
                  <th className="right">充值</th>
                  <th className="right">提款</th>
                  <th className="right">充值转化率</th>
                  <th className="right">ARPPU</th>
                  <th className="right">佣金</th>
                  <th>状态</th>
                  <th style={{width:180}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(c => {
                    // v2.5.13 充值转化率 = 有充值玩家数 / 注册玩家数(这里用 deposit>0 估算 ≈ deposit/regs 粗略,实际取充值人数接入)
                    const depositPlayers = c.deposit > 0 ? Math.max(1, Math.round(c.regs * 0.38)) : 0;  // 示例:38% 注册转化为充值
                    const cvr = c.regs ? ((depositPlayers / c.regs) * 100).toFixed(1) : '0.0';
                    const arppu = depositPlayers ? (c.deposit / depositPlayers) : 0;
                    return (
                      <tr key={c.id}>
                        <td>
                          <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,background:'var(--bg-3)',padding:'2px 8px',borderRadius:4,fontSize:11.5}}>{c.code}</span>
                          <div className="id" style={{fontSize:10.5,marginTop:3,color:'var(--text-3)'}}>{c.id}</div>
                        </td>
                        <td style={{color:'var(--text-1)',fontSize:12.5,maxWidth:140,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.name}>{c.name}</td>
                        <td>
                          <span className="text-mono" style={{fontSize:11.5,color:'var(--brand)',maxWidth:180,display:'inline-block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',verticalAlign:'middle'}} title={c.shortUrl}>{c.shortUrl}</span>
                          <button className="btn sm ghost icon-only" style={{marginLeft:4,verticalAlign:'middle'}} title="复制短链" onClick={()=>toast('短链已复制')}><Icon name="copy" size={11}/></button>
                        </td>
                        <td style={{color:'var(--text-2)',fontSize:11.5,maxWidth:160,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.remark}>{c.remark || '—'}</td>
                        <td className="right text-mono">{F.fmtNum(c.regs)}</td>
                        <td className="right text-mono">${F.money(c.deposit||0)}</td>
                        <td className="right text-mono">${F.money(c.withdraw||0)}</td>
                        <td className="right text-mono" style={{color: parseFloat(cvr)>=30?'var(--success)':'var(--text-1)'}}>{cvr}%</td>
                        <td className="right text-mono">${F.money(arppu||0)}</td>
                        <td className="right text-mono">${F.money(c.commission||0)}</td>
                        <td>{c.status === 'active'
                          ? <span className="badge b-success"><span className="dot"/>启用</span>
                          : <span className="badge b-warning"><span className="dot"/>暂停</span>}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                            <button className="btn sm ghost icon-only" title="查看链接" onClick={()=>setShowLink(c)}><Icon name="link" size={13}/></button>
                            <button className="btn sm ghost icon-only" title="QR Code" onClick={()=>setShowQR(c)}><Icon name="qr" size={13}/></button>
                            <button className="btn sm ghost icon-only" title="复制 Code" onClick={()=>toast('Code ' + c.code + ' 已复制')}><Icon name="copy" size={13}/></button>
                            <button className="btn sm ghost icon-only" title="编辑" onClick={()=>setShowEdit(c)}><Icon name="settings" size={13}/></button>
                            <button className="btn sm ghost icon-only" title={c.status==='active'?'暂停':'启用'} onClick={()=>toggleStatus(c)}>
                              <Icon name={c.status==='active'?'pause':'play'} size={13}/>
                            </button>
                            <button className="btn sm ghost icon-only" title="删除" style={{color:'var(--danger)'}} onClick={()=>setDelTarget(c)}><Icon name="trash" size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr><td colSpan={12} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>暂无 Code,点击「创建 Code」开始</td></tr>
                  )}
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
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>各 Code 充值对比 (近 30 天)</div>
                {(() => {
                  const max = Math.max(...codes.map(c => c.deposit||0), 1);
                  return codes.map(c => (
                    <div key={c.id} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                        <span style={{color:'var(--text-1)'}}>{c.name}</span>
                        <span className="text-mono">${F.money(c.deposit||0)}</span>
                      </div>
                      <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:((c.deposit||0)/max*100)+'%',height:'100%',background:'var(--brand)',borderRadius:4}}/>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="card-inner">
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-0)'}}>各 Code 佣金对比 (近 30 天)</div>
                {(() => {
                  const max = Math.max(...codes.map(c => c.commission||0), 1);
                  return codes.map(c => (
                    <div key={c.id} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                        <span style={{color:'var(--text-1)'}}>{c.name}</span>
                        <span className="text-mono" style={{color:'var(--brand)'}}>${F.money(c.commission||0)}</span>
                      </div>
                      <div style={{height:8,background:'var(--bg-3)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:((c.commission||0)/max*100)+'%',height:'100%',background:'#22c55e',borderRadius:4}}/>
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
      {showCreate && <CodeForm
        mode="create"
        me={me}
        D={D}
        onClose={()=>setShowCreate(false)}
        onSubmit={submitCreate}
      />}

      {/* 编辑 Code Modal */}
      {showEdit && <CodeForm
        mode="edit"
        me={me}
        D={D}
        data={showEdit}
        onClose={()=>setShowEdit(null)}
        onSubmit={submitEdit}
      />}

      {/* QR Code Modal */}
      <ACUI.Modal open={!!showQR} onClose={()=>setShowQR(null)} title={showQR ? 'QR Code · ' + showQR.code : ''}
        subtitle="扫码直达推广落地页"
        footer={<><button className="btn ghost" onClick={()=>setShowQR(null)}>关闭</button><button className="btn primary" onClick={()=>{toast('PNG 已下载');setShowQR(null);}}><Icon name="download" size={13}/>下载 PNG</button></>}>
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
              ['通用短链', showLink.shortUrl || ('https://aff.example.com/' + showLink.code)],
              ['注册页落地', 'https://www.example.com/register?ref=' + showLink.code],
              ['世界杯专题', 'https://www.example.com/wc2026?ref=' + showLink.code],
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

      {/* 删除确认 */}
      <ACUI.Modal open={!!delTarget} onClose={()=>setDelTarget(null)} width={420}
        title="确认删除 Code"
        subtitle="删除后该 Code 的统计数据保留,但新点击将不再计入"
        footer={<>
          <button className="btn ghost" onClick={()=>setDelTarget(null)}>取消</button>
          <button className="btn danger" onClick={()=>removeCode(delTarget)}>确认删除</button>
        </>}>
        {delTarget && (
          <div style={{fontSize:13,lineHeight:1.7}}>
            将删除 Code <b style={{color:'var(--text-0)'}}>{delTarget.code}</b>(<span className="text-mute">{delTarget.name}</span>),确定继续吗?
          </div>
        )}
      </ACUI.Modal>
    </div>
  );
}

// —— 创建 / 编辑 表单弹窗 ——
function CodeForm({ mode, me, D, data, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [f, setF] = React.useState({
    suffix: isEdit ? (data.code.split('-').slice(1).join('-')) : '',
    name: isEdit ? data.name : '',
    shortUrl: isEdit ? (data.shortUrl || '') : '',
    remark: isEdit ? (data.remark || '') : '',
  });
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));
  const prefix = me.id.replace(/^A[GP]/, 'AF');
  const canSubmit = !!f.name;

  return (
    <window.UI.Modal open={true} onClose={onClose}
      title={isEdit ? '编辑推广 Code' : '创建新的推广 Code'}
      subtitle={isEdit ? '修改 名称 / 短链 / 备注(Code 后缀创建后不可改)' : '为新推广场景创建专属 Code'}
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={()=>onSubmit(f)}>{isEdit?'保存':'创建'}</button>
      </>}>
      <div className="form-grid">
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Code 自定义后缀</label>
          <input className="input" value={f.suffix} onChange={e=>set('suffix', e.target.value)}
            placeholder="如:WC2026 (留空自动生成)"
            disabled={isEdit}
            style={isEdit?{background:'var(--bg-3)',cursor:'not-allowed'}:undefined}/>
          <div className="text-mute" style={{fontSize:11,marginTop:4}}>
            最终 Code:{prefix}-{f.suffix || (isEdit ? '' : '自动生成')}
          </div>
        </div>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>名称 <span style={{color:'var(--danger)'}}>*</span></label>
          <input className="input" value={f.name} onChange={e=>set('name', e.target.value)} placeholder="如:世界杯主推"/>
        </div>
        <div className="full">
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>短链</label>
          <input className="input text-mono" value={f.shortUrl} onChange={e=>set('shortUrl', e.target.value)} placeholder="如:https://aff.ex/xxx (留空自动生成)"/>
        </div>
        <div className="full">
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>备注</label>
          <textarea className="textarea" rows={3} value={f.remark} onChange={e=>set('remark', e.target.value)} placeholder="使用场景 / 投放说明 / 限时信息等"/>
        </div>
      </div>
    </window.UI.Modal>
  );
}

window.MyCodesModule = MyCodesModule;
