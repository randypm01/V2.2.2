// 商户后台 → 运营 → 客服管理  v3.2.50
// 平台客服渠道配置:排序 + 类型 + 标题 + 副标题 + 是否有按钮(+按钮文案/跳转链接或license key)
// 代理 / 玩家端「联系我们」弹窗 + Live Chat 读取此配置
const CS_UI = window.UI;

// 类型(对应代理端渠道)
const CS_TYPES = ['Live Chat', 'Telegram', 'WhatsApp', 'Email'];

// 全局 store(切页保留)
if (!window.APS_CS_STORE) {
  window.APS_CS_STORE = {
    list: [
      { id: 1, sort: 1, type: 'Live Chat', title: 'Live Chat', subtitle: '24/7 online',                hasBtn: true,  btnText: 'Contact', btnLink: '19426234' },
      { id: 2, sort: 2, type: 'Telegram',  title: 'Telegram',  subtitle: 'Fastest · avg. 5 min reply', hasBtn: true,  btnText: 'Contact', btnLink: 'https://t.me/SuperAdmin_A23Plus' },
      { id: 3, sort: 3, type: 'WhatsApp',  title: 'WhatsApp',  subtitle: '+91 97300 44004',            hasBtn: true,  btnText: 'Contact', btnLink: 'https://wa.me/919311453852' },
      { id: 4, sort: 4, type: 'Email',     title: 'Email',     subtitle: 'a23support@gmail.com',        hasBtn: false, btnText: '',        btnLink: '' },
    ],
    listeners: new Set(),
    setList(next) {
      this.list = typeof next === 'function' ? next(this.list) : next;
      this.listeners.forEach(fn => fn());
    },
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  };
}

function CustomerServiceModule() {
  const { PageHead, Modal, useToast } = CS_UI;
  const toast = useToast();
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.APS_CS_STORE.subscribe(force), []);
  const store = window.APS_CS_STORE;

  const [editing, setEditing] = React.useState(null);    // null | {mode:'create'|'edit', data?}
  const [delTarget, setDelTarget] = React.useState(null);

  const rows = [...store.list].sort((a, b) => (a.sort || 0) - (b.sort || 0));

  const onSave = (data) => {
    if (editing.mode === 'create') {
      const maxId = store.list.reduce((m, r) => Math.max(m, r.id || 0), 0);
      store.setList([...store.list, { id: maxId + 1, ...data }]);
      toast('已新增 客服配置');
    } else {
      store.setList(store.list.map(r => r.id === editing.data.id ? { ...r, ...data } : r));
      toast('已更新');
    }
    setEditing(null);
  };

  return (
    <div className="page">
      <PageHead title="客服管理" subtitle="配置平台客服渠道,代理 / 玩家端展示"/>

      <div className="card">
        <div className="toolbar">
          <button className="btn primary" onClick={()=>setEditing({mode:'create'})}>
            <Icon name="plus" size={13}/>新增配置
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:64}}>排序</th>
                <th style={{width:110}}>类型</th>
                <th style={{width:150}}>标题</th>
                <th>副标题</th>
                <th style={{width:96}}>是否有按钮</th>
                <th style={{width:96}}>按钮文案</th>
                <th style={{width:260}}>按钮跳转链接或license key</th>
                <th style={{width:110}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="text-mono" style={{color:'var(--text-1)'}}>{r.sort}</td>
                  <td>
                    <span style={{
                      display:'inline-block',padding:'2px 8px',borderRadius:4,fontSize:11.5,
                      background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',fontWeight:500,whiteSpace:'nowrap',
                    }}>{r.type}</span>
                  </td>
                  <td style={{color:'var(--text-0)',fontWeight:600}}>{r.title}</td>
                  <td style={{color:'var(--text-1)'}}>{r.subtitle}</td>
                  <td style={{color: r.hasBtn ? '#16a34a' : 'var(--text-3)', fontWeight:500}}>{r.hasBtn ? '是' : '否'}</td>
                  <td style={{color:'var(--text-1)'}}>{r.hasBtn ? r.btnText : '—'}</td>
                  <td className="text-mono" style={{color:'var(--text-1)',fontSize:12,wordBreak:'break-all'}}>{r.hasBtn ? (r.btnLink || '—') : '—'}</td>
                  <td>
                    <div style={{display:'flex',gap:12}}>
                      <CS_LinkBtn onClick={()=>setEditing({mode:'edit', data:r})}>编辑</CS_LinkBtn>
                      <CS_LinkBtn danger onClick={()=>setDelTarget(r)}>删除</CS_LinkBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>暂无客服配置,点击「新增配置」开始</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',fontSize:12,color:'var(--text-3)',borderTop:'1px solid var(--line-soft)'}}>
          <span>共 {rows.length} 条 · 第 1 / 1 页</span>
          <div style={{display:'flex',gap:4}}>
            <button className="btn ghost icon-only sm" disabled><Icon name="chevronLeft" size={12}/></button>
            <button className="btn sm" style={{minWidth:28}}>1</button>
            <button className="btn ghost icon-only sm" disabled><Icon name="chevronRight" size={12}/></button>
          </div>
        </div>
      </div>

      {editing && <CS_FormModal mode={editing.mode} data={editing.data} onClose={()=>setEditing(null)} onSave={onSave}/>}
      {delTarget && (
        <Modal open={true} onClose={()=>setDelTarget(null)} width={420}
          title="确认删除"
          subtitle="删除后将不可恢复"
          footer={<>
            <button className="btn ghost" onClick={()=>setDelTarget(null)}>取消</button>
            <button className="btn danger" onClick={()=>{
              store.setList(store.list.filter(r => r.id !== delTarget.id));
              toast('已删除');
              setDelTarget(null);
            }}>确认删除</button>
          </>}>
          <div style={{fontSize:13,lineHeight:1.7,color:'var(--text-1)'}}>
            将删除客服配置 <b>{delTarget.title}</b>,确定继续吗?
          </div>
        </Modal>
      )}
    </div>
  );
}

function CS_FormModal({ mode, data, onClose, onSave }) {
  const { Modal } = CS_UI;
  const init = data || {};
  const [f, setF] = React.useState({
    sort: init.sort != null ? String(init.sort) : '',
    type: init.type || '',
    title: init.title || '',
    subtitle: init.subtitle || '',
    hasBtn: init.hasBtn ? 'yes' : (init.hasBtn === false ? 'no' : 'no'),
    btnText: init.btnText || '',
    btnLink: init.btnLink || '',
  });
  const set = (k, v) => setF(p => ({...p, [k]:v}));
  const showBtn = f.hasBtn === 'yes';
  const canSubmit = String(f.sort).trim() && f.type && f.title.trim() && f.subtitle.trim()
    && (!showBtn || (f.btnText.trim() && f.btnLink.trim()));

  const submit = () => onSave({
    sort: parseInt(f.sort, 10) || 0,
    type: f.type,
    title: f.title.trim(),
    subtitle: f.subtitle.trim(),
    hasBtn: showBtn,
    btnText: showBtn ? f.btnText.trim() : '',
    btnLink: showBtn ? f.btnLink.trim() : '',
  });

  return (
    <Modal open={true} onClose={onClose} width={560}
      title={(mode==='create'?'新增':'编辑') + ' 客服配置'}
      subtitle="配置平台客服渠道,代理 / 玩家端展示"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={submit}>确认</button>
      </>}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <CS_Field label="排序" required>
          <input className="input" type="number" min="0" value={f.sort} onChange={e=>set('sort', e.target.value)} placeholder="输入排序"/>
        </CS_Field>
        <CS_Field label="类型" required>
          <select className="select" value={f.type} onChange={e=>set('type', e.target.value)}
            style={{color: f.type ? 'var(--text-0)' : 'var(--text-3)'}}>
            <option value="">选择类型</option>
            {CS_TYPES.map(t => <option key={t} value={t} style={{color:'var(--text-0)'}}>{t}</option>)}
          </select>
        </CS_Field>
        <CS_Field label="标题" required>
          <input className="input" value={f.title} onChange={e=>set('title', e.target.value)} placeholder="请输入" maxLength={30}/>
        </CS_Field>
        <CS_Field label="副标题" required>
          <input className="input" value={f.subtitle} onChange={e=>set('subtitle', e.target.value)} placeholder="请输入" maxLength={60}/>
        </CS_Field>
        <CS_Field label="是否有按钮" required>
          <select className="select" value={f.hasBtn} onChange={e=>set('hasBtn', e.target.value)} style={{color:'var(--text-0)'}}>
            <option value="no">否</option>
            <option value="yes">是</option>
          </select>
        </CS_Field>
        {showBtn && (
          <>
            <CS_Field label="按钮文案" required>
              <input className="input" value={f.btnText} onChange={e=>set('btnText', e.target.value)} placeholder="如 Contact" maxLength={20}/>
            </CS_Field>
            <CS_Field label="按钮跳转链接或license key" required>
              <input className="input" value={f.btnLink} onChange={e=>set('btnLink', e.target.value)} placeholder="链接 / license key" style={{fontFamily:'JetBrains Mono'}}/>
            </CS_Field>
          </>
        )}
      </div>
    </Modal>
  );
}

function CS_Field({ label, required, children }) {
  return (
    <div>
      <label style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500,display:'block',marginBottom:6}}>
        {label}{required && <span style={{color:'var(--danger)',marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}

function CS_LinkBtn({ danger, onClick, children }) {
  return (
    <span onClick={onClick} style={{
      cursor:'pointer',color: danger ? 'var(--danger)' : 'var(--brand)',
      fontSize:12.5,userSelect:'none',
    }}
    onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
    onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>{children}</span>
  );
}

window.CustomerServiceModule = CustomerServiceModule;
