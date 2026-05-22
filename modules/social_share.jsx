// 商户后台 → 运营 → 社媒分享管理  v3.1.96
// 平台社媒分享配置:Key + 类型 + 链接 + 描述,代理后台「我的账户 → 分享物料」(后续)读取
const SS_UI = window.UI;

const SS_TYPES = [
  { key:'Telegram',  label:'Telegram'  },
  { key:'WhatsApp',  label:'WhatsApp'  },
  { key:'Facebook',  label:'Facebook'  },
  { key:'Twitter',   label:'Twitter / X' },
  { key:'YouTube',   label:'YouTube'   },
  { key:'Instagram', label:'Instagram' },
  { key:'TikTok',    label:'TikTok'    },
  { key:'Discord',   label:'Discord'   },
  { key:'Line',      label:'Line'      },
];

// 全局 store(切页保留)
if (!window.APS_SOCIAL_SHARE_STORE) {
  window.APS_SOCIAL_SHARE_STORE = {
    list: [
      { id: 1, key: 'TG1',   type: 'Telegram',  url: 'https://t.me/a23plusin',           desc: 'TG 频道' },
      { id: 2, key: 'WA1',   type: 'WhatsApp',  url: 'https://wa.me/919730044004',       desc: '客服 WhatsApp' },
      { id: 3, key: 'YT1',   type: 'YouTube',   url: 'https://youtube.com/@a23plus',     desc: '官方 YouTube 频道' },
      { id: 4, key: 'IG1',   type: 'Instagram', url: 'https://instagram.com/a23plus',    desc: '品牌 Instagram' },
    ],
    listeners: new Set(),
    setList(next) {
      this.list = typeof next === 'function' ? next(this.list) : next;
      this.listeners.forEach(fn => fn());
    },
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  };
}

function SocialShareModule() {
  const { PageHead, Modal, useToast } = SS_UI;
  const toast = useToast();
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.APS_SOCIAL_SHARE_STORE.subscribe(force), []);
  const store = window.APS_SOCIAL_SHARE_STORE;

  const [editing, setEditing] = React.useState(null);    // null | {mode:'create'|'edit', data?}
  const [delTarget, setDelTarget] = React.useState(null);

  const onSave = (data) => {
    if (editing.mode === 'create') {
      const maxId = store.list.reduce((m, r) => Math.max(m, r.id || 0), 0);
      store.setList([...store.list, { id: maxId + 1, ...data }]);
      toast('已新增 社媒分享');
    } else {
      store.setList(store.list.map(r => r.id === editing.data.id ? { ...r, ...data } : r));
      toast('已更新');
    }
    setEditing(null);
  };

  return (
    <div className="page">
      <PageHead title="社媒分享管理" subtitle="社媒分享相关配置"/>

      <div className="card">
        <div className="toolbar">
          <button className="btn primary" onClick={()=>setEditing({mode:'create'})}>
            <Icon name="plus" size={13}/>新增 社媒
          </button>
          <span style={{flex:1}}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:140}}>Key</th>
                <th style={{width:140}}>类型</th>
                <th>链接</th>
                <th>描述</th>
                <th style={{width:120}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {store.list.map(r => (
                <tr key={r.id}>
                  <td className="text-mono" style={{color:'var(--text-0)',fontWeight:600}}>{r.key}</td>
                  <td>
                    <span style={{
                      display:'inline-block',padding:'2px 8px',borderRadius:4,fontSize:11.5,
                      background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',fontWeight:500,
                    }}>{r.type}</span>
                  </td>
                  <td className="text-mono" style={{color:'var(--text-1)',fontSize:12}}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{color:'var(--brand)',textDecoration:'none'}}
                      onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
                      onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>{r.url}</a>
                  </td>
                  <td style={{color:'var(--text-1)'}}>{r.desc}</td>
                  <td>
                    <div style={{display:'flex',gap:10}}>
                      <SS_LinkBtn onClick={()=>setEditing({mode:'edit', data:r})}>编辑</SS_LinkBtn>
                      <SS_LinkBtn danger onClick={()=>setDelTarget(r)}>删除</SS_LinkBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {store.list.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>暂无配置,点击「新增 社媒」开始</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',fontSize:12,color:'var(--text-3)',borderTop:'1px solid var(--line-soft)'}}>
          <span>共 {store.list.length} 条 · 第 1 / 1 页</span>
          <div style={{display:'flex',gap:4}}>
            <button className="btn ghost icon-only sm" disabled><Icon name="chevronLeft" size={12}/></button>
            <button className="btn sm" style={{minWidth:28}}>1</button>
            <button className="btn ghost icon-only sm" disabled><Icon name="chevronRight" size={12}/></button>
          </div>
        </div>
      </div>

      {editing && <SS_FormModal mode={editing.mode} data={editing.data} onClose={()=>setEditing(null)} onSave={onSave}/>}
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
            将删除 <b>{delTarget.key}</b> ({delTarget.type}),确定继续吗?
          </div>
        </Modal>
      )}
    </div>
  );
}

function SS_FormModal({ mode, data, onClose, onSave }) {
  const { Modal } = SS_UI;
  const init = data || { key:'', type:'', url:'', desc:'' };
  const [f, setF] = React.useState({
    key: init.key || '',
    type: init.type || '',
    url: init.url || '',
    desc: init.desc || '',
  });
  const set = (k, v) => setF(p => ({...p, [k]:v}));
  const canSubmit = f.key.trim() && f.type && f.url.trim();

  return (
    <Modal open={true} onClose={onClose} width={560}
      title={(mode==='create'?'新增':'编辑') + ' 社媒分享管理'}
      subtitle="社媒分享相关配置"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={()=>onSave({
          key: f.key.trim(), type: f.type, url: f.url.trim(), desc: f.desc.trim(),
        })}>确定</button>
      </>}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <SS_Field label="Key" required>
          <input className="input" value={f.key} onChange={e=>set('key', e.target.value)} placeholder="请输入" maxLength={20}/>
        </SS_Field>
        <SS_Field label="类型" required>
          <select className="select" value={f.type} onChange={e=>set('type', e.target.value)}
            style={{color: f.type ? 'var(--text-0)' : 'var(--text-3)'}}>
            <option value="">请选择</option>
            {SS_TYPES.map(t => <option key={t.key} value={t.key} style={{color:'var(--text-0)'}}>{t.label}</option>)}
          </select>
        </SS_Field>
        <SS_Field label="链接" required>
          <input className="input" value={f.url} onChange={e=>set('url', e.target.value)} placeholder="请输入" style={{fontFamily:'JetBrains Mono'}}/>
        </SS_Field>
        <SS_Field label="描述">
          <input className="input" value={f.desc} onChange={e=>set('desc', e.target.value)} placeholder="请输入" maxLength={50}/>
        </SS_Field>
      </div>
    </Modal>
  );
}

function SS_Field({ label, required, children }) {
  return (
    <div>
      <label style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500,display:'block',marginBottom:6}}>
        {label}{required && <span style={{color:'var(--danger)',marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SS_LinkBtn({ danger, onClick, children }) {
  return (
    <span onClick={onClick} style={{
      cursor:'pointer',color: danger ? 'var(--danger)' : 'var(--brand)',
      fontSize:12.5,userSelect:'none',
    }}
    onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
    onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>{children}</span>
  );
}

window.SocialShareModule = SocialShareModule;
