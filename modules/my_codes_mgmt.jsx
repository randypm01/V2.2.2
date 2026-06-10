// 代理后台 - Code 与链接管理 (P0-3 · 运营)
// v3.0.88 按截图新建的独立模块 — 比「邀请 Code 与链接」更轻量:
//   - 无 KPI
//   - 表格列精简为 7 列:邀请 Code / 邀请短链接 / QR Code / 描述 / 备注 / 状态 / 操作
//   - 状态只有 2 种:启用 / 停用
//   - 操作只有 编辑 / 删除
//   - 编辑弹窗加 Code 使用状态切换(启用 ↔ 停用)+ QR + 短链
const MCM_UI = window.UI;
const MCM_T = (k, fb) => window.t(k, fb);

function buildSampleCodesMgmt() {
  const days = (n) => Date.now() - n * 86400000;
  return [
    { id:'CDM-001', code:'RANDY01', shortUrl:'https://beans.ag/randy01', desc:'Youtube专用',  remark:'长期使用,不混其他渠道',  status:'active',   createdAt:days(120) },
    { id:'CDM-002', code:'RANDY02', shortUrl:'https://beans.ag/randy02', desc:'全渠道世界杯',  remark:'只在世界杯期间使用',     status:'disabled', createdAt:days(45)  },
    { id:'CDM-003', code:'RANDY03', shortUrl:'https://beans.ag/randy03', desc:'Telegram社群',  remark:'TG所有社群共用这个Code', status:'active',   createdAt:days(95)  },
    { id:'CDM-004', code:'RANDY04', shortUrl:'https://beans.ag/randy04', desc:'Twitch专用',    remark:'长期使用,不混其他渠道',  status:'active',   createdAt:days(180) },
  ];
}

// 简单 QR — 伪随机生成稳定 dot 矩阵(使用 hash 确保 行和列 都影响输出)
function MiniQR({ seedKey, size=120 }) {
  // 用 string 哈希 生一个 31bit 种子,避免 % 逼出股纹
  const hash = React.useMemo(() => {
    let h = 2166136261;
    const s = String(seedKey || 'X');
    for (let i = 0; i < s.length; i++) {
      h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0;
    }
    return h;
  }, [seedKey]);
  // xorshift32 伪随机
  const rng = (n) => {
    let x = (hash + n * 2654435761) >>> 0;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;  x >>>= 0;
    return x;
  };
  return (
    <div style={{width:size, height:size, padding:8, background:'#fff', borderRadius:6, border:'1px solid var(--line)'}}>
      <svg viewBox="0 0 21 21" style={{width:'100%', height:'100%', display:'block'}}>
        {Array.from({length:21}).map((_,r)=>Array.from({length:21}).map((_,c)=>{
          const on = (rng(r*23 + c*1009) & 1) === 1;
          return on ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
        }))}
        {/* 三个角定位方块 — 让它看起来像真 QR */}
        {[[0,0],[0,14],[14,0]].map(([x,y])=>(
          <g key={x+'-'+y}>
            <rect x={x} y={y} width="7" height="7" fill="#000"/>
            <rect x={x+1} y={y+1} width="5" height="5" fill="#fff"/>
            <rect x={x+2} y={y+2} width="3" height="3" fill="#000"/>
          </g>
        ))}
      </svg>
    </div>
  );
}

function MyCodesMgmtModule() {
  const F = window.APS_FMT;
  const T = (k, fb) => window.t(k, fb);
  const toast = MCM_UI.useToast();
  const me = window.useCurrentAgent();
  // v3.2.3 帐户被冻结 — 創建邀请 Code 按钮 改弹 「帐户已被冻结」 弹窗
  const [showFrozen, setShowFrozen] = React.useState(false);
  const [showSuspended, setShowSuspended] = React.useState(false);
  const isFrozen = me && me.status === 'frozen';
  const isSuspended = me && me.status === 'suspended';
  const [q, setQ] = React.useState('');
  const [statusF, setStatusF] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(null);
  const [delTarget, setDelTarget] = React.useState(null);
  const [showLimit, setShowLimit] = React.useState(false);
  const [codes, setCodes] = React.useState(buildSampleCodesMgmt);

  // Code 创建数量上限 — 超出后弹窗提示用户联系管理员
  const MAX_CODES = 20;
  const reachedLimit = codes.length >= MAX_CODES;
  // v3.2.5 編輯/刪除 也要受 凍結 / 停用 攔截
  const handleClickEdit = (c) => {
    if (isSuspended) { setShowSuspended(true); return; }
    if (isFrozen) { setShowFrozen(true); return; }
    setShowEdit(c);
  };
  const handleClickDelete = (c) => {
    if (isSuspended) { setShowSuspended(true); return; }
    if (isFrozen) { setShowFrozen(true); return; }
    setDelTarget(c);
  };

  const handleClickCreate = () => {
    if (isSuspended) { setShowSuspended(true); return; }
    if (isFrozen) { setShowFrozen(true); return; }
    if (reachedLimit) { setShowLimit(true); return; }
    setShowCreate(true);
  };

  const filtered = codes.filter(c => {
    if (q && !(c.code + c.desc).toLowerCase().includes(q.toLowerCase())) return false;
    if (statusF !== 'all' && c.status !== statusF) return false;
    return true;
  });
  const [pageSize, setPageSize] = React.useState(20);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const submitCreate = (form) => {
    if (codes.length >= MAX_CODES) { setShowCreate(false); setShowLimit(true); return; }
    const id = 'CDM-' + String(codes.length + 1).padStart(3, '0');
    const finalCode = form.code.toUpperCase();
    setCodes([{
      id, code: finalCode,
      shortUrl: 'https://beans.ag/' + finalCode.toLowerCase(),
      desc: form.desc, remark: form.remark || '',
      status:'active', createdAt: Date.now(),
    }, ...codes]);
    toast(MCM_T('mcm.col.code','邀请 Code') + ' ' + finalCode + ' ' + MCM_T('mcm.toast.created','创建成功'));
    setShowCreate(false);
  };
  const submitEdit = (form) => {
    setCodes(codes.map(x => x.id === showEdit.id
      ? { ...x, desc: form.desc, remark: form.remark, status: form.status }
      : x));
    toast(MCM_T('mcm.col.code','邀请 Code') + ' ' + showEdit.code + ' ' + MCM_T('mcm.toast.updated','已更新'));
    setShowEdit(null);
  };
  const removeCode = (c) => {
    setCodes(codes.filter(x => x.id !== c.id));
    toast(MCM_T('mcm.col.code','邀请 Code') + ' ' + c.code + ' ' + MCM_T('mcm.toast.deleted','已删除'));
    setDelTarget(null);
  };

  return (
    <div className="page">
      <MCM_UI.PageHead
        title={MCM_T('page.my_codes_mgmt.title','Code 与链接管理')}
        subtitle={MCM_T('page.my_codes_mgmt.sub','创建与管理您的专属邀请 Code 和推广链接')}
      >
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'var(--text-2)'}}>
            {MCM_T('mcm.limit.counter_a','已创建')} <b style={{color: reachedLimit ? 'var(--danger)' : 'var(--text-0)'}}>{codes.length}</b> / {MAX_CODES}
          </span>
          <button className="btn primary" onClick={handleClickCreate}>
            <Icon name="plus" size={13}/>{MCM_T('mcm.btn.create','创建 邀请 Code')}
          </button>
        </div>
      </MCM_UI.PageHead>

      <div className="card">
        <div className="toolbar">
          <MCM_UI.SearchInput value={q} onChange={setQ} placeholder={MCM_T('mcm.col.code','邀请 Code')} width={220}/>
          <select className="filter-select" value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}>
            <option value="all">{MCM_T('mcm.filter.all','全部状态')}</option>
            <option value="active">{MCM_T('mcm.status.active','启用')}</option>
            <option value="disabled">{MCM_T('mcm.status.disabled','停用')}</option>
          </select>
          <span style={{flex:1}}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>{MCM_T('mcm.col.code','邀请 Code')}</th>
              <th>{MCM_T('mcm.col.short_url','邀请短链接')}</th>
              <th>{MCM_T('mcm.col.qr','QR Code')}</th>
              <th>{MCM_T('mcm.col.desc','描述')}</th>
              <th>{MCM_T('mcm.col.remark','备注')}</th>
              <th>{MCM_T('mcm.col.status','状态')}</th>
              <th style={{width:120}}>{MCM_T('mcm.col.actions','操作')}</th>
            </tr></thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,fontSize:12}}>{c.code}</span>
                      <button className="btn sm ghost icon-only" title={MCM_T('mcm.tip.copy_code','复制 Code')} onClick={()=>toast('Code ' + c.code + ' ' + MCM_T('mcm.toast.copied_code','已复制'))}><Icon name="copy" size={11}/></button>
                    </span>
                  </td>
                  <td>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <span className="text-mono" style={{color:'var(--text-1)',fontSize:11.5}}>{c.shortUrl}</span>
                      <button className="btn sm ghost icon-only" title={MCM_T('mcm.tip.copy_link','复制短链')} onClick={()=>toast(MCM_T('mcm.toast.copied_link','短链已复制'))}><Icon name="copy" size={11}/></button>
                    </span>
                  </td>
                  <td>
                    <a href="#" onClick={e=>{e.preventDefault();toast(MCM_T('mcm.toast.png_downloaded','PNG 已下载')+' · '+c.code);}}
                      style={{color:'var(--brand)',fontSize:12,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                      {MCM_T('mcm.action.download_png','下载 PNG')} <Icon name="download" size={12}/>
                    </a>
                  </td>
                  <td style={{color:'var(--text-1)',fontSize:12.5,maxWidth:140,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.desc}>{c.desc}</td>
                  <td style={{color:'var(--text-2)',fontSize:11.5,maxWidth:200,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.remark}>{c.remark || '—'}</td>
                  <td>
                    {c.status === 'active'
                      ? <span className="badge b-success">{MCM_T('mcm.status.active','启用')}</span>
                      : <span className="badge b-danger">{MCM_T('mcm.status.disabled','停用')}</span>}
                  </td>
                  <td>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <a href="#" onClick={e=>{e.preventDefault();handleClickEdit(c);}}
                        style={{color:'var(--brand)',fontSize:12,textDecoration:'none'}}>{MCM_T('mcm.action.edit','编辑')}</a>
                      <a href="#" onClick={e=>{e.preventDefault();handleClickDelete(c);}}
                        style={{color:'var(--danger)',fontSize:12,textDecoration:'none'}}>{MCM_T('mcm.action.delete','删除')}</a>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{MCM_T('mcm.empty','暂无邀请 Code,点击「创建 邀请 Code」开始')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <MCM_UI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }}/>
      </div>

      {/* v3.2.3 帐户已被冻结 弹窗 */}
      <window.FrozenAccountModal
        open={showFrozen}
        onClose={()=>setShowFrozen(false)}
        agentId={me && (me._displayId || me.id)}
        loginName={me && me.loginName}
        reason={me && me.frozenReason}
      />
      {/* v3.2.4 帐户已被停用 弹窗 — 關閉時自動登出 */}
      <window.SuspendedAccountModal
        open={showSuspended}
        onClose={()=>setShowSuspended(false)}
        agentId={me && (me._displayId || me.id)}
        loginName={me && me.loginName}
        reason={me && ((me._appData && me._appData.suspendReason) || me.suspendReason)}
      />

      {/* 上限提示弹窗 */}
      <MCM_UI.Modal open={showLimit} onClose={()=>setShowLimit(false)} width={440}
        title={MCM_T('mcm.limit.title','已达 Code 创建上限')}
        subtitle={MCM_T('mcm.limit.sub','如需创建更多 Code,请联系管理员')}
        footer={
          <button className="btn primary" onClick={()=>setShowLimit(false)}>{MCM_T('mcm.limit.ok','我知道了')}</button>
        }>
        <div style={{fontSize:13,lineHeight:1.75,color:'var(--text-1)'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:'var(--bg-3)',borderRadius:8,marginBottom:12}}>
            <Icon name="alert" size={16} style={{color:'var(--warning, #f59e0b)',marginTop:2,flexShrink:0}}/>
            <div>
              {MCM_T('mcm.limit.body_a','您当前已创建')} <b style={{color:'var(--text-0)'}}>{codes.length}</b> {MCM_T('mcm.limit.body_b','条邀请 Code,已达系统创建上限')} <b style={{color:'var(--text-0)'}}>{MAX_CODES}</b> {MCM_T('mcm.limit.body_c','条。')}
            </div>
          </div>
          <div style={{color:'var(--text-2)',fontSize:12.5}}>
            {MCM_T('mcm.limit.tip','请联系管理员申请提高创建上限,或先删除/停用闲置的 Code 后再创建新的。')}
          </div>
        </div>
      </MCM_UI.Modal>

      {/* 创建 邀请 Code */}
      {showCreate && <CreateModalMgmt
        existingCodes={codes.map(c=>c.code)}
        onClose={()=>setShowCreate(false)}
        onSubmit={submitCreate}
      />}

      {/* 编辑 邀请 Code */}
      {showEdit && <EditModalMgmt
        data={showEdit}
        onClose={()=>setShowEdit(null)}
        onSubmit={submitEdit}
        toast={toast}
      />}

      {/* 删除确认 */}
      <MCM_UI.Modal open={!!delTarget} onClose={()=>setDelTarget(null)} width={420}
        title={MCM_T('mcm.del.title','确认删除邀请 Code')}
        subtitle={MCM_T('mcm.del.sub','删除后该 Code 的统计数据保留,但新点击将不再计入')}
        footer={<>
          <button className="btn ghost" onClick={()=>setDelTarget(null)}>{MCM_T('mcm.btn.cancel','取消')}</button>
          <button className="btn danger" onClick={()=>removeCode(delTarget)}>{MCM_T('mcm.del.confirm','确认删除')}</button>
        </>}>
        {delTarget && (
          <div style={{fontSize:13,lineHeight:1.7}}>
            {MCM_T('mcm.del.body_a','将删除邀请 Code')} <b style={{color:'var(--text-0)'}}>{delTarget.code}</b>(<span className="text-mute">{delTarget.desc}</span>){MCM_T('mcm.del.body_b',',确定继续吗?')}
          </div>
        )}
      </MCM_UI.Modal>
    </div>
  );
}

// —— 创建弹窗 —— Code + 描述 + 备注 + 校验
function CreateModalMgmt({ existingCodes, onClose, onSubmit }) {
  const [f, setF] = React.useState({ code:'', desc:'', remark:'' });
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));
  const codeReq = !!f.code;
  const codeLen = f.code.length >= 4;
  const codeFmt = /^[A-Z0-9]{4,10}$/.test(f.code.toUpperCase());
  const codeDup = existingCodes && existingCodes.includes(f.code.toUpperCase());
  const canSubmit = codeReq && codeLen && codeFmt && !codeDup && !!f.desc;

  const checkLine = (ok, text) => (
    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11.5,color: ok?'#22c55e':'#94a3b8',marginTop:4}}>
      <Icon name={ok ? 'check' : 'x'} size={11}/>
      <span>{text}</span>
    </div>
  );

  return (
    <MCM_UI.Modal open={true} onClose={onClose}
      title={MCM_T('mcm.create.title','创建 邀请 Code')}
      subtitle={MCM_T('mcm.create.sub','为新推广场景创建专属 Code')}
      width={520}
      footer={<>
        <button className="btn ghost" onClick={onClose}>{MCM_T('mcm.btn.cancel','取消')}</button>
        <button className="btn primary" disabled={!canSubmit} onClick={()=>onSubmit({...f, code:f.code.toUpperCase()})}>{MCM_T('mcm.btn.create_submit','创建')}</button>
      </>}>
      <div style={{display:'grid',gap:14}}>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.code','自定义 Code')} <span style={{color:'var(--danger)'}}>*</span></label>
          <input className="input"
            value={f.code}
            onChange={e=>set('code', e.target.value.toUpperCase())}
            placeholder={MCM_T('mcm.form.code.ph','如:AGlatam')}
            maxLength={10}
            style={{textTransform:'uppercase'}}/>
          <div style={{marginTop:6}}>
            {checkLine(codeReq, MCM_T('mcm.form.code.req','请填写此栏位'))}
            {checkLine(codeLen, MCM_T('mcm.form.code.min','最少 4 个字符'))}
            {checkLine(codeFmt, MCM_T('mcm.form.code.pattern','Code 必须包含 4-10 个字符,仅字母大写、数字'))}
            {codeDup && checkLine(false, MCM_T('mcm.form.code.dup','该 Code 已存在,请更换'))}
          </div>
        </div>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.desc','描述')} <span style={{color:'var(--danger)'}}>*</span></label>
          <input className="input" value={f.desc} onChange={e=>set('desc', e.target.value)}
            placeholder={MCM_T('mcm.form.desc.ph_create','如:Youtube专用、世界杯活动')}/>
        </div>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.remark','备注 (选填)')}</label>
          <textarea className="textarea" rows={3} value={f.remark} onChange={e=>set('remark', e.target.value)}
            placeholder={MCM_T('mcm.form.remark.ph_create','如:长期使用,不限推广地方')}/>
        </div>
      </div>
    </MCM_UI.Modal>
  );
}

// —— 编辑弹窗 —— 大弹窗:左边表单 右边 QR + Code 使用状态切换
function EditModalMgmt({ data, onClose, onSubmit, toast }) {
  const [f, setF] = React.useState({
    code: data.code,
    desc: data.desc || '',
    remark: data.remark || '',
    status: data.status,
    shortUrl: data.shortUrl,
  });
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));
  const toggleStatus = () => set('status', f.status === 'active' ? 'disabled' : 'active');

  const formatCreatedAt = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2,'0');
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  };

  return (
    <MCM_UI.Modal open={true} onClose={onClose}
      title={MCM_T('mcm.edit.title','编辑 邀请 Code')}
      subtitle={MCM_T('mcm.edit.sub','修改 Code 信息与使用状态')}
      width={720}
      footer={<>
        <button className="btn ghost" onClick={onClose}>{MCM_T('mcm.btn.cancel','取消')}</button>
        <button className="btn primary" onClick={()=>onSubmit(f)}>{MCM_T('mcm.btn.save','保存')}</button>
      </>}>
      <div className="mcm-edit-grid" style={{display:'grid',gridTemplateColumns:'1.3fr 0.9fr',gap:24,alignItems:'start'}}>
        {/* 左栏:表单 */}
        <div style={{display:'grid',gap:14}}>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.code','自定义 Code')} <span style={{color:'var(--danger)'}}>*</span></label>
            <input className="input text-mono" value={f.code} readOnly
              style={{background:'var(--bg-3)',cursor:'not-allowed'}}/>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.created','创建时间')}</label>
            <input className="input text-mono" value={formatCreatedAt(data.createdAt)} readOnly
              style={{background:'var(--bg-3)',cursor:'not-allowed'}}/>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.short_url','邀请短链接')}</label>
            <div style={{display:'flex',gap:6}}>
              <input className="input text-mono" value={f.shortUrl} readOnly style={{flex:1,fontSize:12,background:'var(--bg-3)'}}/>
              <button className="btn ghost icon-only" onClick={()=>toast(MCM_T('mcm.toast.copied_link','短链已复制'))} title={MCM_T('mcm.tip.copy','复制')}><Icon name="copy" size={13}/></button>
            </div>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.desc','描述')} <span style={{color:'var(--danger)'}}>*</span></label>
            <input className="input" value={f.desc} onChange={e=>set('desc', e.target.value)}
              placeholder={MCM_T('mcm.form.desc.ph_edit','如:Twitch专用')}/>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.remark','备注 (选填)')}</label>
            <textarea className="textarea" rows={2} value={f.remark} onChange={e=>set('remark', e.target.value)}
              placeholder={MCM_T('mcm.form.remark.ph_edit','使用场景说明')}/>
          </div>
        </div>

        {/* 右栏:QR + 状态切换 */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{MCM_T('mcm.form.qr_code','QR Code')}</label>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,padding:12,border:'1px solid var(--line)',borderRadius:6,background:'var(--bg-2)'}}>
              <MiniQR seedKey={f.code} size={130}/>
              <button className="btn primary sm" onClick={()=>toast(MCM_T('mcm.toast.png_downloaded','PNG 已下载')+' · '+f.code)} style={{width:'100%'}}>
                <Icon name="download" size={12}/>{MCM_T('mcm.action.download_png','下载 PNG')}
              </button>
            </div>
          </div>
        </div>

        {/* 底部:Code 使用状态(横跨两栏) */}
        <div style={{gridColumn:'1 / -1',borderTop:'1px solid var(--line)',paddingTop:14}}>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:8}}>{MCM_T('mcm.form.code_status','Code 使用状态')} <span style={{color:'var(--danger)'}}>*</span></label>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:6}}>
            <div style={{fontSize:13}}>
              <span className="text-mute">{MCM_T('mcm.form.current_status','当前状态:')}</span>{' '}
              {f.status === 'active'
                ? <span style={{color:'var(--success)',fontWeight:600}}>{MCM_T('mcm.status.active','启用')}</span>
                : <span style={{color:'var(--danger)', fontWeight:600}}>{MCM_T('mcm.status.disabled','停用')}</span>}
            </div>
            {f.status === 'active' ? (
              <button onClick={toggleStatus}
                style={{padding:'6px 16px',border:'1px solid #fca5a5',background:'#fef2f2',color:'#dc2626',borderRadius:6,fontSize:12.5,fontWeight:500,cursor:'pointer'}}>
                {MCM_T('mcm.btn.disable','停用')}
              </button>
            ) : (
              <button onClick={toggleStatus}
                style={{padding:'6px 16px',border:'1px solid #6ee7b7',background:'#ecfdf5',color:'#059669',borderRadius:6,fontSize:12.5,fontWeight:500,cursor:'pointer'}}>
                {MCM_T('mcm.btn.reenable','再次启用')}
              </button>
            )}
          </div>
        </div>
      </div>
    </MCM_UI.Modal>
  );
}

window.MyCodesMgmtModule = MyCodesMgmtModule;
